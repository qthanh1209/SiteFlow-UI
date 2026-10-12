import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../../../components/ui/Icon'
import { DASH_PROJECTS } from '../../../data/qsDashboardData'
import { formatTable, roman, rowValues } from '../../../data/qsBreakdownData'
import {
  AUTO_ROWS, DEFAULT_TERMS, EMPTY_INFO, QUOTE_COLUMNS, QUOTE_COL_PRESETS, QUOTE_DEFAULT_HIDDEN, QUOTE_INTERNAL_LABEL, ROWS_PER_PAGE, ZOOMS,
  coverTemplate, coverTotal, quoteCell, quoteMoney,
} from '../../../data/qsQuoteData'
import { storage } from '../../../services/storageService'
import DropMenu from './cost/DropMenu'
import { CoverPage, DetailPage } from './quote/QuotePages'
import CoverEditor from './quote/CoverEditor'
import DetailEditor, { AreaTable } from './quote/DetailEditor'

const today = () => { const d = new Date(); const p = n => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}` }

/* Các số trang hiện trên thanh phân trang: luôn có trang đầu, trang cuối và vùng quanh trang hiện tại */
function pageList(cur, total) {
  const keep = new Set([1, 2, total, cur - 1, cur, cur + 1].filter(n => n >= 1 && n <= total))
  const out = []
  let prev = 0
  ;[...keep].sort((a, b) => a - b).forEach(n => { if (n - prev > 1) out.push(null); out.push(n); prev = n })
  return out
}

const LOOK_KEY = 'qs-quote-look'
const DEFAULT_LOOK = { accent: '#0F2B46', text: '#161A22', font: '', scale: 1 }
const ACCENT_PRESETS = ['#0F2B46', '#2F5DA8', '#0E8A82', '#1E8E5A', '#B7791F', '#C0392B', '#6D4FC2', '#1F2430']
const QUOTE_FONTS = [['', 'Arial (mặc định)'], ["'Montserrat', sans-serif", 'Montserrat'], ["'Roboto', sans-serif", 'Roboto'], ["'Inter', sans-serif", 'Inter'], ["Georgia, 'Times New Roman', serif", 'Georgia / Times']]
const QUOTE_SCALES = [[0.85, 'Nhỏ'], [1, 'Vừa'], [1.15, 'Lớn'], [1.3, 'Rất lớn']]

/* Một bước trong cột điều khiển: số thứ tự + tiêu đề + mô tả ngắn */
function Step({ num, title, desc, children }) {
  return (
    <section className="qs-card qs-qt-step">
      <header><span>{num}</span><div><b>{title}</b>{desc && <small>{desc}</small>}</div></header>
      {children}
    </section>
  )
}
const Field = ({ label, children }) => <label className="qs-qt-fld"><span>{label}</span>{children}</label>
const Switch = ({ on, onClick, label }) => (
  <button type="button" role="switch" aria-checked={on} className={`qs-qt-switch${on ? ' on' : ''}`} onClick={onClick}><span>{label}</span><i /></button>
)
function ColorField({ label, value, onChange }) {
  return (
    <label className="qs-qt-color"><span>{label}</span><code>{value}</code><input type="color" value={value} onChange={e => onChange(e.target.value)} /></label>
  )
}

function ModeToggle({ mode, onMode }) {
  return (
    <div className="qs-qt-mode">
      <button className={mode === 'preview' ? 'on' : ''} onClick={() => onMode('preview')}><Icon name="eye" size={13} />Xem trước &amp; Xuất</button>
      <button className={mode === 'edit' ? 'on' : ''} onClick={() => onMode('edit')}><Icon name="sliders" size={13} />Chỉnh sửa</button>
    </div>
  )
}

/* Tab "Xuất báo giá": tờ bìa ước tính chi phí + bảng báo giá chi tiết lấy từ bảng Bóc tách.
   Hai chế độ: "Xem trước & Xuất" (xem từng trang, chọn cột, in / xuất) và "Chỉnh sửa" (sửa tờ bìa, diện tích, bảng chi tiết). */
export default function QuoteTab({ projectId, sheet, vat, onVat }) {
  const { groups } = sheet
  const draft = DASH_PROJECTS.find(p => p.id === projectId).drafts[0]
  const [mode, setMode] = useState('preview')
  const [template, setTemplate] = useState(1)
  const [sections, setSections] = useState(coverTemplate)
  const [info, setInfo] = useState(EMPTY_INFO)
  const [code, setCode] = useState(`BG-${draft.code.replace(/^DA-/, '')}`)
  const [areaRows, setAreaRows] = useState([])
  const [hidden, setHidden] = useState(() => new Set(QUOTE_DEFAULT_HIDDEN))
  const [internalOut, setInternalOut] = useState(false)
  const [scope, setScope] = useState('all')
  const [split, setSplit] = useState(false)
  const [perPage, setPerPage] = useState('auto')
  const [zoom, setZoom] = useState('fit')
  const [page, setPage] = useState(1)
  /* Các phiên bản đã chốt; phiên bản đang soạn là số kế tiếp */
  const [versions, setVersions] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  /* Danh sách chip cột xuất: mặc định thu gọn, chỉ hiện số cột + chọn nhanh */
  const [colsOpen, setColsOpen] = useState(false)
  const [terms, setTerms] = useState(DEFAULT_TERMS)
  const [company, setCompany] = useState('Dezon')
  const [toast, setToast] = useState(null)
  const [printing, setPrinting] = useState(false)
  /* Giao diện báo giá (màu, font, cỡ chữ) nhớ giữa các lần mở; khổ / hướng giấy dùng cho bản in */
  const [look, setLookState] = useState(() => ({ ...DEFAULT_LOOK, ...storage.get(LOOK_KEY, {}) }))
  const setLook = patch => setLookState(prev => { const next = { ...prev, ...patch }; storage.set(LOOK_KEY, next); return next })
  const [paper, setPaper] = useState({ size: 'A4', orient: 'landscape' })
  const toastTimer = useRef(null)
  const stageRef = useRef(null)

  const version = versions.length + 1
  const notify = text => { clearTimeout(toastTimer.current); setToast(text); toastTimer.current = setTimeout(() => setToast(null), 2400) }

  /* Phạm vi bảng chi tiết: tất cả hoặc một tầng / phòng của bảng Bóc tách (bỏ các khối chưa có dòng) */
  const scoped = useMemo(() => groups.map((g, gi) => ({ g, gi })).filter(x => x.g.rows.length && (scope === 'all' || x.g.id === scope)), [groups, scope])
  const scopeOptions = [{ key: 'all', label: 'Tất cả hạng mục đã bóc' }, ...groups.filter(g => g.rows.length).map(g => ({ key: g.id, label: g.name, note: `${g.rows.length} dòng` }))]
  const scopeKey = scopeOptions.some(o => o.key === scope) ? scope : 'all'
  const rowCount = scoped.reduce((s, x) => s + x.g.rows.length, 0)
  const subtotal = scoped.reduce((s, x) => s + x.g.rows.reduce((a, r) => a + rowValues(r).amount, 0), 0)
  const sheetTotal = groups.reduce((s, g) => s + g.rows.reduce((a, r) => a + rowValues(r).amount, 0), 0)
  const vatAmount = (subtotal * vat) / 100
  const cTotal = coverTotal(sections, sheetTotal)
  const areas = useMemo(() => {
    const r2 = n => Math.round(n * 100) / 100
    return { use: r2(areaRows.reduce((s, r) => s + (Number(r.area) || 0), 0)), quote: r2(areaRows.reduce((s, r) => s + (Number(r.area) || 0) * (Number(r.coef) || 0), 0)) }
  }, [areaRows])

  /* Cột được in: cột đang bật, trừ cột nội bộ khi không xuất kèm bản nội bộ */
  const outCols = QUOTE_COLUMNS.filter(c => !hidden.has(c.key) && (internalOut || !c.internal))
  const internalOn = QUOTE_COLUMNS.some(c => c.internal && !hidden.has(c.key))
  const colLabel = `${QUOTE_COLUMNS.length - hidden.size}/${QUOTE_COLUMNS.length}`
  const activePreset = QUOTE_COL_PRESETS.find(p => p.hidden.length === hidden.size && p.hidden.every(k => hidden.has(k))) || null
  const toggleCol = key => setHidden(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next })

  /* Chia bảng chi tiết thành các trang */
  const detailPages = useMemo(() => {
    const per = perPage === 'auto' ? AUTO_ROWS : Number(perPage)
    const out = []
    let cur = []
    let count = 0
    const flush = () => { if (cur.length) out.push(cur); cur = []; count = 0 }
    scoped.forEach(({ g, gi }) => {
      if (split) flush()
      cur.push({ type: 'group', g, gi })
      g.rows.forEach((r, ri) => {
        if (count >= per) { flush(); cur.push({ type: 'group', g, gi }) }
        cur.push({ type: 'item', g, gi, r, ri, stt: `${gi + 1}.${ri + 1}` })
        count += 1
      })
    })
    flush()
    return out
  }, [scoped, split, perPage])
  const pages = 1 + Math.max(1, detailPages.length)
  const cur = Math.min(page, pages)
  const doc = { company, code, version, date: today(), info, areas, template }
  const summary = { subtotal, vat, vatAmount, terms }
  const renderPage = n => (n === 1
    ? <CoverPage key={n} doc={doc} sections={sections} sheetTotal={sheetTotal} total={cTotal} page={1} pages={pages} />
    : <DetailPage key={n} doc={doc} lines={detailPages[n - 2] || []} cols={outCols} page={n} pages={pages} summary={n === pages ? summary : null} />)

  function exportExcel() {
    const matrix = [outCols.map(c => c.label)]
    scoped.forEach(({ g, gi }) => {
      matrix.push(outCols.map((c, i) => (i === 0 ? `${roman(gi)}. ${g.name}` : '')))
      g.rows.forEach((r, ri) => matrix.push(outCols.map(c => quoteCell(r, c.key, `${gi + 1}.${ri + 1}`))))
    })
    matrix.push(outCols.map((c, i) => (i === 0 ? 'TỔNG CỘNG' : c.key === 'amount' ? quoteMoney(subtotal + vatAmount) : '')))
    const blob = new Blob([`﻿${formatTable(matrix, ',')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${code}-v${version}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  /* In / lưu PDF: dựng mọi trang vào một khối ngoài app rồi gọi hộp thoại in của trình duyệt */
  useEffect(() => {
    if (!printing) return undefined
    const done = () => setPrinting(false)
    window.addEventListener('afterprint', done)
    const t = setTimeout(() => window.print(), 80)
    return () => { clearTimeout(t); window.removeEventListener('afterprint', done) }
  }, [printing])
  function lockVersion() {
    setVersions(v => [...v, { v: v.length + 1, date: today(), total: subtotal + vatAmount, rows: rowCount }])
    notify(`Đã chốt báo giá v${version}`)
  }
  /* Đổi trang thì cuộn khung xem trước về đầu trang */
  useEffect(() => { if (stageRef.current) stageRef.current.scrollTop = 0 }, [cur])
  /* Biến CSS đưa giao diện tuỳ chỉnh vào các trang (xem .qs-qt-page trong QS.css) */
  const lookVars = { '--qt-accent': look.accent, '--qt-text': look.text, '--qt-font': look.font || undefined, '--qt-scale': look.scale }

  return (
    <>

      {mode === 'preview' ? (
        <div className="qs-qt-layout">
          {/* Cột điều khiển dọc: các bước đánh số từ trên xuống (giống tab Báo giá của Marketing) */}
          <aside className="qs-qt-side">
            <Step num="1" title="Phiên bản báo giá" desc={`${draft.name} · ${rowCount} dòng đã bóc`}>
              <div className="qs-qt-kv"><span>Mã</span><b>{code}</b><span className="qs-qt-ver">v{version}</span></div>
              <div className="qs-qt-row2">
                <button className="qs-qt-btn" onClick={lockVersion}><Icon name="check" size={13} />Chốt v{version}</button>
                <button className={`qs-qt-btn${historyOpen ? ' on' : ''}`} onClick={() => setHistoryOpen(o => !o)}><Icon name="history" size={13} />Lịch sử{versions.length ? ` (${versions.length})` : ''}</button>
              </div>
              {historyOpen && (
                <div className="qs-qt-history">
                  {!versions.length && <p>Chưa chốt phiên bản nào.</p>}
                  {[...versions].reverse().map(v => <div key={v.v}><b>v{v.v}</b><span>{v.date} · {v.rows} dòng</span><b>{quoteMoney(v.total)} đ</b></div>)}
                </div>
              )}
            </Step>

            <Step num="2" title="Nội dung các trang">
              <Field label="Trang 1 · Tờ bìa">
                <div className="qs-qt-pills">
                  {[1, 2].map(n => <button key={n} className={template === n ? 'on' : ''} onClick={() => setTemplate(n)}>Mẫu {n}</button>)}
                </div>
              </Field>
              <Field label="Trang 2+ · Bảng chi tiết">
                <DropMenu className="qs-qt-btn wide" options={scopeOptions} value={scopeKey} onPick={k => { setScope(k); setPage(1) }}>
                  <Icon name="layers" size={13} /><span className="qs-qt-ellipsis">{scopeOptions.find(o => o.key === scopeKey).label}</span><span className="qs-bd-count">[{rowCount}]</span>
                </DropMenu>
              </Field>
              <div className="qs-qt-row2">
                <Field label="Dòng / trang">
                  <select className="qs-qt-select" value={perPage} onChange={e => { setPerPage(e.target.value); setPage(1) }}>{ROWS_PER_PAGE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                </Field>
                <Field label="Số trang"><div className="qs-qt-static">{pages} trang</div></Field>
              </div>
              <Switch on={split} onClick={() => setSplit(v => !v)} label="Mỗi tầng / phòng một trang mới" />
            </Step>

            <Step num="3" title="Cột xuất" desc={`Đang in ${outCols.length} cột`}>
              <DropMenu className="qs-qt-btn wide" title="Chọn nhanh bộ cột xuất" options={QUOTE_COL_PRESETS} value={activePreset ? activePreset.key : null} onPick={k => setHidden(new Set(QUOTE_COL_PRESETS.find(p => p.key === k).hidden))}>
                <Icon name="sliders" size={13} /><span className="qs-qt-ellipsis">{activePreset ? activePreset.label : 'Tuỳ chỉnh'}</span><span className="qs-bd-count">{colLabel}</span>
              </DropMenu>
              <button className="qs-qt-linkbtn" onClick={() => setColsOpen(o => !o)}>{colsOpen ? 'Thu gọn danh sách cột' : 'Bật / tắt từng cột'}<span className={`qs-bd-caret${colsOpen ? ' up' : ''}`} /></button>
              {colsOpen && (
                <div className="qs-qt-colchips">
                  {QUOTE_COLUMNS.map(c => <button key={c.key} className={`${hidden.has(c.key) ? '' : 'on'}${c.internal ? ' internal' : ''}`} title={c.internal ? 'Cột nội bộ' : undefined} onClick={() => toggleCol(c.key)}>{c.label}</button>)}
                </div>
              )}
              {internalOn && (
                <>
                  <Switch on={internalOut} onClick={() => setInternalOut(v => !v)} label="Xuất kèm cột nội bộ (bản nội bộ)" />
                  <p className="qs-qt-note"><Icon name="lock" size={12} />Cột {QUOTE_INTERNAL_LABEL} {internalOut ? 'sẽ in trên bản này.' : 'không in trên báo giá gửi khách.'}</p>
                </>
              )}
            </Step>

            <Step num="4" title="Giao diện báo giá" desc="Không bắt buộc · áp dụng cho cả bản in.">
              <ColorField label="Màu tiêu đề & bảng" value={look.accent} onChange={v => setLook({ accent: v })} />
              <div className="qs-qt-swatches" title="Màu nhanh">
                {ACCENT_PRESETS.map(c => <button key={c} title={c} style={{ background: c }} className={look.accent === c ? 'on' : ''} onClick={() => setLook({ accent: c })} />)}
              </div>
              <ColorField label="Màu chữ" value={look.text} onChange={v => setLook({ text: v })} />
              <Field label="Font & cỡ chữ">
                <div className="qs-qt-combo">
                  <select value={look.font} onChange={e => setLook({ font: e.target.value })}>{QUOTE_FONTS.map(([v, l]) => <option key={l} value={v}>{l}</option>)}</select>
                  <select value={look.scale} onChange={e => setLook({ scale: Number(e.target.value) })}>{QUOTE_SCALES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                </div>
              </Field>
              <button className="qs-qt-reset" onClick={() => setLook(DEFAULT_LOOK)}>Khôi phục màu, font &amp; cỡ chữ mặc định</button>
            </Step>

            <Step num="5" title="Tổng kết & điều khoản">
              <div className="qs-qt-sumbox">
                <div><span>Tạm tính</span><b>{quoteMoney(subtotal)}</b></div>
                <div><span>VAT <input type="number" min="0" max="100" value={vat} onChange={e => onVat(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />%</span><b>{quoteMoney(vatAmount)}</b></div>
                <div className="grand"><span>Tổng cộng</span><b>{quoteMoney(subtotal + vatAmount)} đ</b></div>
              </div>
              <Field label="Tên công ty (đầu trang)"><input className="qs-qt-input" value={company} onChange={e => setCompany(e.target.value)} /></Field>
              <Field label="Điều khoản (trang cuối)"><textarea className="qs-qt-input" rows={4} value={terms} onChange={e => setTerms(e.target.value)} /></Field>
            </Step>

            <Step num="6" title="Xuất báo giá" desc="PDF: chọn “Lưu dưới dạng PDF” trong hộp thoại in.">
              <div className="qs-qt-row2">
                <Field label="Khổ giấy">
                  <div className="qs-qt-pills">{['A4', 'A3'].map(s => <button key={s} className={paper.size === s ? 'on' : ''} onClick={() => setPaper(p => ({ ...p, size: s }))}>{s}</button>)}</div>
                </Field>
                <Field label="Hướng giấy">
                  <div className="qs-qt-pills">{[['portrait', 'Dọc'], ['landscape', 'Ngang']].map(([k, l]) => <button key={k} className={paper.orient === k ? 'on' : ''} onClick={() => setPaper(p => ({ ...p, orient: k }))}>{l}</button>)}</div>
                </Field>
              </div>
              <button className="qs-qt-btn primary wide big" onClick={() => setPrinting(true)}><Icon name="printer" size={14} />Xuất PDF / In ({paper.size} · {paper.orient === 'portrait' ? 'Dọc' : 'Ngang'})</button>
              <button className="qs-qt-btn wide" onClick={exportExcel}><Icon name="download" size={13} />Xuất Excel (CSV)</button>
            </Step>
          </aside>

          <div className="qs-card qs-qt-preview">
            <div className="qs-qt-preview-head">
              <b>{cur === 1 ? 'Tờ bìa' : 'Bảng báo giá chi tiết'}</b>
              <span className="qs-qt-chip">Mẫu {template}</span>
              <span className="qs-qt-chip">{vat ? `VAT ${vat}%` : 'Chưa VAT'}</span>
              <span className="qs-qt-chip">{paper.size} · {paper.orient === 'portrait' ? 'Dọc' : 'Ngang'}</span>
              {internalOut && <span className="qs-qt-chip warn"><Icon name="lock" size={11} />Bản nội bộ</span>}
              <span style={{ flex: 1 }} />
              <div className="qs-qt-zoom" title="Thu phóng bản xem trước (không ảnh hưởng bản in)">
                {ZOOMS.map(([v, l]) => <button key={v} className={zoom === v ? 'on' : ''} onClick={() => setZoom(v)}>{l}</button>)}
              </div>
              <ModeToggle mode={mode} onMode={setMode} />
            </div>
            <div className="qs-qt-stage" ref={stageRef}>
              <div className={paper.orient === 'portrait' ? 'qs-qt-portrait' : ''} style={{ ...lookVars, zoom: zoom === 'fit' ? undefined : Number(zoom) / 100 }}>{renderPage(cur)}</div>
            </div>
            <div className="qs-qt-pager">
              {pageList(cur, pages).map((n, i) => (n === null
                ? <span key={`gap${i}`}>…</span>
                : <button key={n} className={n === cur ? 'on' : ''} onClick={() => setPage(n)}>{n}</button>))}
              <button disabled={cur >= pages} title="Trang sau" onClick={() => setPage(cur + 1)}>→</button>
              <span className="qs-qt-pageno">Trang {cur} / {pages}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="qs-qt-edit">
          <div className="qs-qt-edit-top"><ModeToggle mode={mode} onMode={setMode} /></div>
          <CoverEditor
            sections={sections} onSections={setSections} info={info} onInfo={setInfo} code={code} onCode={setCode}
            quoteArea={areas.quote} sheetTotal={sheetTotal} total={cTotal}
            template={template} onTemplate={setTemplate}
            onLoadTemplate={() => { setSections(coverTemplate()); notify('Đã nạp lại mẫu tờ bìa') }}
            onSave={() => notify('Đã lưu tờ bìa')}
          />
          <AreaTable rows={areaRows} onRows={setAreaRows} areas={areas} />
          <DetailEditor
            sheet={sheet} groups={scoped} scopeOptions={scopeOptions} scope={scopeKey} onScope={setScope} rowCount={rowCount}
            hidden={hidden} onToggleCol={toggleCol} subtotal={subtotal} vat={vat}
            onExcel={exportExcel} onPrint={() => setPrinting(true)}
          />
        </div>
      )}

      {toast && <div className="qs-qt-toast">{toast}</div>}
      {printing && createPortal(
        <div className="qs-qt-print" style={lookVars}>
          <style>{`@page{size:${paper.size} ${paper.orient}; margin:10mm}`}</style>
          {Array.from({ length: pages }, (_, i) => renderPage(i + 1))}
        </div>,
        document.body,
      )}
    </>
  )
}
