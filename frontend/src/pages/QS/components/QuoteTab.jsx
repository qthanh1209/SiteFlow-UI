import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../../../components/ui/Icon'
import { DASH_PROJECTS, DASH_DEFAULT_ACTIVE } from '../../../data/qsDashboardData'
import { formatTable, roman, rowValues } from '../../../data/qsBreakdownData'
import {
  AUTO_ROWS, DEFAULT_TERMS, EMPTY_INFO, QUOTE_COLUMNS, QUOTE_COL_PRESETS, QUOTE_DEFAULT_HIDDEN, QUOTE_INTERNAL_LABEL, ROWS_PER_PAGE, ZOOMS,
  coverTemplate, coverTotal, quoteCell, quoteMoney,
} from '../../../data/qsQuoteData'
import ProjectBar from './breakdown/ProjectBar'
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
export default function QuoteTab({ sheet, vat, onVat }) {
  const { groups } = sheet
  const [projectId, setProjectId] = useState(DASH_DEFAULT_ACTIVE.projectId)
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
  const [moreOpen, setMoreOpen] = useState(false)
  const [terms, setTerms] = useState(DEFAULT_TERMS)
  const [company, setCompany] = useState('Dezon')
  const [toast, setToast] = useState(null)
  const [printing, setPrinting] = useState(false)
  const toastTimer = useRef(null)
  const companyRef = useRef(null)
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
  const openCompany = () => { setMoreOpen(true); setTimeout(() => companyRef.current && companyRef.current.focus(), 60) }

  return (
    <>
      <ProjectBar projects={DASH_PROJECTS} projectId={projectId} onSelect={setProjectId} />

      {mode === 'preview' ? (
        <>
          {internalOn && (
            <div className="qs-qt-banner">
              <Icon name="lock" size={14} />
              <span>Cột nội bộ ({QUOTE_INTERNAL_LABEL}) đang bật ở Bóc tách {internalOut ? <>và <b>sẽ in</b> trên bản nội bộ này.</> : <>nhưng <b>không in</b> trên báo giá gửi khách.</>}</span>
              <span style={{ flex: 1 }} />
              <button className={`qs-qt-btn${internalOut ? ' on' : ''}`} onClick={() => setInternalOut(v => !v)}>Xuất kèm (bản nội bộ)</button>
            </div>
          )}

          <div className="qs-card qs-qt-tools">
            <span className="qs-qt-cap">Trang 1 · Tờ bìa</span>
            <div className="qs-qt-seg">
              <button className={template === 1 ? 'on' : ''} onClick={() => setTemplate(1)}>Mẫu 1</button>
              <button className={template === 2 ? 'on' : ''} onClick={() => setTemplate(2)}>Mẫu 2</button>
            </div>
            <span className="qs-qt-cap">Trang 2+</span>
            <DropMenu className="qs-qt-btn" options={scopeOptions} value={scopeKey} onPick={k => { setScope(k); setPage(1) }}>
              <Icon name="layers" size={13} />{scopeOptions.find(o => o.key === scopeKey).label}<span className="qs-bd-count">[{rowCount}]</span>
            </DropMenu>
            <button className={`qs-qt-btn${split ? ' on' : ''}`} title="Mỗi tầng / phòng bắt đầu ở một trang mới" onClick={() => setSplit(v => !v)}><Icon name="fileText" size={13} />Mỗi phần 1 trang</button>
            <label className="qs-qt-field">Dòng/trang
              <select value={perPage} onChange={e => { setPerPage(e.target.value); setPage(1) }}>{ROWS_PER_PAGE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
            <label className="qs-qt-field">Phóng
              <select value={zoom} onChange={e => setZoom(e.target.value)}>{ZOOMS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
            <label className="qs-qt-field">VAT
              <input type="number" min="0" max="100" value={vat} onChange={e => onVat(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />%
            </label>
            <span className="qs-qt-pages"><Icon name="file" size={12} />Số trang <b>{pages}</b></span>
            <span style={{ flex: 1 }} />
            <span className="qs-qt-code"><Icon name="file" size={12} /><b>{code}</b> · v{version}</span>
            <button className="qs-qt-btn" onClick={lockVersion}><Icon name="check" size={13} />Chốt v{version}</button>
            <div className="qs-ct-drop">
              <button className={`qs-qt-btn${historyOpen ? ' on' : ''}`} onClick={() => setHistoryOpen(o => !o)}><Icon name="layers" size={13} />Lịch sử</button>
              {historyOpen && (
                <div className="qs-ct-drop-menu right qs-qt-history">
                  {!versions.length && <p>Chưa chốt phiên bản nào.</p>}
                  {[...versions].reverse().map(v => <div key={v.v}><b>v{v.v}</b><span>{v.date} · {v.rows} dòng</span><b>{quoteMoney(v.total)} đ</b></div>)}
                </div>
              )}
            </div>
            <button className="qs-qt-btn green" onClick={exportExcel}><Icon name="download" size={13} />Xuất Excel</button>
            <button className="qs-qt-btn red" onClick={() => setPrinting(true)}><Icon name="download" size={13} />Xuất PDF / In</button>
          </div>

          <div className="qs-card qs-qt-cols">
            <div className="qs-qt-cols-head">
              <span className="qs-qt-cap">Cột xuất <span>{colLabel}</span></span>
              <DropMenu className="qs-bd-preset" title="Chọn nhanh bộ cột xuất" options={QUOTE_COL_PRESETS} value={activePreset ? activePreset.key : null} onPick={k => setHidden(new Set(QUOTE_COL_PRESETS.find(p => p.key === k).hidden))}>
                <Icon name="sliders" size={12} />Chọn nhanh {colLabel}
              </DropMenu>
            </div>
            <div className="qs-qt-colchips">
              {QUOTE_COLUMNS.map(c => <button key={c.key} className={hidden.has(c.key) ? '' : 'on'} title={c.internal ? 'Cột nội bộ' : undefined} onClick={() => toggleCol(c.key)}>{c.label}</button>)}
            </div>
          </div>

          <div className="qs-card qs-qt-total">
            <div className="qs-qt-total-row">
              <Icon name="banknote" size={15} className="qs-dash-accent" />
              <b>Tổng kết &amp; điều khoản</b>
              <span className="qs-qt-total-nums">Tạm tính <b>{quoteMoney(subtotal)}</b> · VAT <b>{quoteMoney(vatAmount)}</b> · Tổng <b>{quoteMoney(subtotal + vatAmount)} đ</b></span>
              <span style={{ flex: 1 }} />
              <button className="qs-qt-btn" onClick={openCompany}><Icon name="building" size={13} />Thông tin công ty</button>
              <button className="qs-qt-caret-btn" title={moreOpen ? 'Thu gọn' : 'Mở rộng'} onClick={() => setMoreOpen(o => !o)}><span className={`qs-bd-caret${moreOpen ? ' up' : ''}`} /></button>
            </div>
            {moreOpen && (
              <div className="qs-qt-more">
                <label><span>Tên công ty (in ở đầu trang)</span><input ref={companyRef} value={company} onChange={e => setCompany(e.target.value)} /></label>
                <label className="wide"><span>Điều khoản (in ở trang cuối)</span><textarea rows={3} value={terms} onChange={e => setTerms(e.target.value)} /></label>
              </div>
            )}
          </div>

          <div className="qs-card qs-qt-preview">
            <div className="qs-qt-preview-head">
              <b>{cur === 1 ? 'Tờ bìa' : 'Bảng báo giá chi tiết'}</b>
              <span style={{ flex: 1 }} />
              <ModeToggle mode={mode} onMode={setMode} />
              <span className="qs-qt-pageno">Trang {cur} / {pages}</span>
            </div>
            <div className="qs-qt-stage" ref={stageRef}>
              <div style={{ zoom: zoom === 'fit' ? undefined : Number(zoom) / 100 }}>{renderPage(cur)}</div>
            </div>
          </div>
          <div className="qs-qt-pager">
            {pageList(cur, pages).map((n, i) => (n === null
              ? <span key={`gap${i}`}>…</span>
              : <button key={n} className={n === cur ? 'on' : ''} onClick={() => setPage(n)}>{n}</button>))}
            <button disabled={cur >= pages} title="Trang sau" onClick={() => setPage(cur + 1)}>→</button>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}

      {toast && <div className="qs-qt-toast">{toast}</div>}
      {printing && createPortal(
        <div className="qs-qt-print">{Array.from({ length: pages }, (_, i) => renderPage(i + 1))}</div>,
        document.body,
      )}
    </>
  )
}
