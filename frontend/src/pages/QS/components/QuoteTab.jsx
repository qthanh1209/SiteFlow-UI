import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../../../components/ui/Icon'
import { formatTable, roman, rowValues } from '../../../data/qsBreakdownData'
import {
  AUTO_ROWS, DEFAULT_COMPANY, DEFAULT_TERMS, EMPTY_INFO, QUOTE_ACCENTS, QUOTE_COLUMNS, QUOTE_COL_PRESETS, QUOTE_DEFAULT_HIDDEN, QUOTE_INTERNAL_LABEL, ROWS_PER_PAGE, ZOOMS,
  coverTemplate, coverTotal, quoteCell, quoteDates, quoteMoney,
} from '../../../data/qsQuoteData'
import ProjectBar from './breakdown/ProjectBar'
import DropMenu from './cost/DropMenu'
import { CoverPage, DetailPage } from './quote/QuotePages'
import CoverEditor from './quote/CoverEditor'
import DetailEditor, { AreaTable } from './quote/DetailEditor'
import CompanyModal from './quote/CompanyModal'

/* Bề rộng trang giấy (px bố cục, khớp .qs-qt-page) và giới hạn phóng của chế độ "Vừa khung" */
const PAGE_WIDTH = 1010
const STAGE_PAD = 40
const FIT_MAX = 1.3
const pad2 = n => String(n).padStart(2, '0')

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

/* Một bước đánh số ở cột điều khiển bên trái */
function Step({ no, title, sub, children }) {
  return (
    <section className="qs-card qs-qt-step">
      <header><i>{no}</i><div><b>{title}</b>{sub && <small>{sub}</small>}</div></header>
      {children}
    </section>
  )
}

/* Dòng bật / tắt một tuỳ chọn */
function SwitchRow({ on, onToggle, title, children }) {
  return (
    <button className="qs-qt-switch-row" title={title} onClick={onToggle}>
      <span>{children}</span><span className={`qs-bd-switch${on ? ' on' : ''}`}><i /></span>
    </button>
  )
}

/* Tab "Xuất báo giá": tờ bìa ước tính chi phí + bảng báo giá chi tiết lấy từ bảng Bóc tách.
   Hai chế độ: "Xem trước & Xuất" (cột điều khiển 5 bước bên trái, trang giấy bên phải) và "Chỉnh sửa" (sửa tờ bìa, diện tích, bảng chi tiết). */
export default function QuoteTab({ sheet, vat, onVat, projects, active, onActive }) {
  const { groups } = sheet
  const project = projects.find(p => p.id === active.projectId)
  const draft = project.drafts.find(d => d.id === active.draftId) || project.drafts[0]
  const selectProject = id => onActive({ projectId: id, draftId: projects.find(p => p.id === id).drafts[0].id })
  const [mode, setMode] = useState('preview')
  const [template, setTemplate] = useState(1)
  const [sections, setSections] = useState(coverTemplate)
  const [info, setInfo] = useState(EMPTY_INFO)
  /* Mã báo giá đi theo mã bản nháp đang dùng, trừ khi người dùng tự sửa ở tờ bìa */
  const [customCode, setCustomCode] = useState(null)
  const code = customCode ?? `BG-${draft.code.replace(/^DA-/, '')}`
  const [areaRows, setAreaRows] = useState([])
  const [hidden, setHidden] = useState(() => new Set(QUOTE_DEFAULT_HIDDEN))
  const [colsOpen, setColsOpen] = useState(false)
  const [internalOut, setInternalOut] = useState(false)
  const [scope, setScope] = useState('all')
  const [split, setSplit] = useState(true)
  const [perPage, setPerPage] = useState('12')
  const [zoom, setZoom] = useState('fit')
  const [stageWidth, setStageWidth] = useState(0)
  const [accent, setAccent] = useState(QUOTE_ACCENTS[0])
  const [page, setPage] = useState(1)
  /* Các phiên bản đã chốt; phiên bản đang soạn là số kế tiếp */
  const [versions, setVersions] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [terms, setTerms] = useState(DEFAULT_TERMS)
  /* Thông tin công ty in trên báo giá (sửa ở hộp thoại "Thông tin công ty") */
  const [company, setCompany] = useState(DEFAULT_COMPANY)
  const [companyOpen, setCompanyOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [printing, setPrinting] = useState(false)
  const toastTimer = useRef(null)
  const stageRef = useRef(null)

  const version = versions.length + 1
  const dates = useMemo(quoteDates, [])
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
  const colLabel = `${QUOTE_COLUMNS.length - hidden.size}/${QUOTE_COLUMNS.length}`
  const activePreset = QUOTE_COL_PRESETS.find(p => p.hidden.length === hidden.size && p.hidden.every(k => hidden.has(k))) || null
  const toggleCol = key => setHidden(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next })

  /* Chia bảng chi tiết thành các trang; chưa bóc dòng nào thì báo giá chỉ có tờ bìa */
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
  const pages = 1 + detailPages.length
  const cur = Math.min(page, pages)
  const doc = { company: company.name, brand: company, code, version, date: dates.date, until: dates.until, info, areas, template, accent }
  /* Phần kết (tổng cộng, tiến độ thanh toán, điều khoản, ô ký) in ở trang cuối; chỉ có tờ bìa thì tính theo tổng tờ bìa */
  const summary = detailPages.length
    ? { subtotal, vat, vatAmount, terms }
    : { subtotal: cTotal, vat, vatAmount: (cTotal * vat) / 100, terms }
  const grand = summary.subtotal + summary.vatAmount
  const renderPage = n => (n === 1
    ? <CoverPage key={n} doc={doc} sections={sections} sheetTotal={sheetTotal} total={cTotal} page={1} pages={pages} summary={pages === 1 ? summary : null} />
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
    setVersions(v => [...v, { v: v.length + 1, date: dates.date, total: grand, rows: rowCount }])
    notify(`Đã chốt báo giá v${version}`)
  }
  /* Đổi trang thì cuộn khung xem trước về đầu trang */
  useEffect(() => { if (stageRef.current) stageRef.current.scrollTop = 0 }, [cur])
  /* Theo dõi bề rộng khung xem trước để "Vừa khung" tự co giãn trang giấy theo màn hình */
  useEffect(() => {
    const el = stageRef.current
    if (mode !== 'preview' || !el) return undefined
    const measure = () => setStageWidth(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mode])
  const scale = zoom === 'fit'
    ? (stageWidth ? Math.min(FIT_MAX, Math.max(0.3, (stageWidth - STAGE_PAD) / PAGE_WIDTH)) : 1)
    : Number(zoom) / 100

  return (
    <>
      <ProjectBar projects={projects} projectId={active.projectId} draftId={draft.id} onSelect={selectProject} />

      {mode === 'preview' ? (
        <div className="qs-qt-layout">
          <aside className="qs-qt-side">
            <div className="qs-qt-side-scroll">
              <Step no={1} title="Phiên bản báo giá" sub={`${draft.name} · ${rowCount} dòng đã bóc`}>
                <div className="qs-qt-codebox"><span>Mã</span><b title={code}>{code}</b><i>v{version}</i></div>
                <div className="qs-qt-pair">
                  <button className="qs-qt-btn" onClick={lockVersion}><Icon name="check" size={13} />Chốt v{version}</button>
                  <button className={`qs-qt-btn${historyOpen ? ' on' : ''}`} onClick={() => setHistoryOpen(o => !o)}><Icon name="layers" size={13} />Lịch sử</button>
                </div>
                {historyOpen && (
                  <div className="qs-qt-history">
                    {!versions.length && <p>Chưa chốt phiên bản nào.</p>}
                    {[...versions].reverse().map(v => <div key={v.v}><b>v{v.v}</b><span>{v.date} · {v.rows} dòng</span><b>{quoteMoney(v.total)} đ</b></div>)}
                  </div>
                )}
              </Step>

              <Step no={2} title="Nội dung các trang">
                <span className="qs-qt-label">Trang 1 · Tờ bìa</span>
                <div className="qs-qt-seg">
                  <button className={template === 1 ? 'on' : ''} onClick={() => setTemplate(1)}>Mẫu 1</button>
                  <button className={template === 2 ? 'on' : ''} onClick={() => setTemplate(2)}>Mẫu 2</button>
                </div>
                <span className="qs-qt-label">Trang 2+ · Bảng chi tiết</span>
                <DropMenu className="qs-qt-select" options={scopeOptions} value={scopeKey} onPick={k => { setScope(k); setPage(1) }}>
                  <Icon name="layers" size={14} /><b>{scopeOptions.find(o => o.key === scopeKey).label}</b><span className="qs-bd-count">[{pad2(rowCount)}]</span>
                </DropMenu>
                <div className="qs-qt-pair">
                  <label className="qs-qt-field"><span>Dòng / trang</span>
                    <select value={perPage} onChange={e => { setPerPage(e.target.value); setPage(1) }}>{ROWS_PER_PAGE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                  </label>
                  <label className="qs-qt-field"><span>Số trang</span><output>{pages} trang</output></label>
                </div>
                <SwitchRow on={split} onToggle={() => { setSplit(v => !v); setPage(1) }} title="Mỗi tầng / phòng bắt đầu ở một trang mới">Mỗi hạng mục một trang mới</SwitchRow>
              </Step>

              <Step no={3} title="Cột xuất" sub={`Đang in ${outCols.length} cột`}>
                <DropMenu className="qs-bd-preset qs-qt-preset" title="Chọn nhanh bộ cột xuất" options={QUOTE_COL_PRESETS} value={activePreset ? activePreset.key : null} onPick={k => setHidden(new Set(QUOTE_COL_PRESETS.find(p => p.key === k).hidden))}>
                  <Icon name="sliders" size={13} /><b>{activePreset ? activePreset.label : 'Tuỳ chỉnh'}</b><span>{colLabel}</span>
                </DropMenu>
                <button className="qs-qt-link" onClick={() => setColsOpen(o => !o)}>Bật / tắt từng cột<span className={`qs-bd-caret${colsOpen ? ' up' : ''}`} /></button>
                {colsOpen && (
                  <div className="qs-qt-colchips">
                    {QUOTE_COLUMNS.map(c => <button key={c.key} className={hidden.has(c.key) ? '' : 'on'} title={c.internal ? 'Cột nội bộ' : undefined} onClick={() => toggleCol(c.key)}>{c.label}</button>)}
                  </div>
                )}
                <SwitchRow on={internalOut} onToggle={() => setInternalOut(v => !v)}>Xuất kèm cột nội bộ (bản nội bộ)</SwitchRow>
                <p className="qs-qt-hint"><Icon name="lock" size={12} />Cột {QUOTE_INTERNAL_LABEL} {internalOut ? <><b>sẽ in</b> trên bản nội bộ này.</> : 'không in trên báo giá gửi khách.'}</p>
              </Step>

              <Step no={4} title="Giao diện báo giá" sub="Không bắt buộc · áp dụng cho cả bản in.">
                <div className="qs-qt-color-row">
                  <span className="qs-qt-label">Màu tiêu đề &amp; bảng</span>
                  <code>{accent.toUpperCase()}</code>
                  <input type="color" value={accent} title="Chọn màu khác" onChange={e => setAccent(e.target.value)} />
                </div>
                <div className="qs-qt-swatches">
                  {QUOTE_ACCENTS.map(c => <button key={c} className={c.toLowerCase() === accent.toLowerCase() ? 'on' : ''} style={{ background: c }} title={c} onClick={() => setAccent(c)} />)}
                </div>
              </Step>

              <Step no={5} title="Tổng kết &amp; điều khoản" sub="VAT · chiết khấu · thanh toán · ghi chú">
                <label className="qs-qt-vat"><span>VAT của dự án</span>
                  <input type="number" min="0" max="100" value={vat} onChange={e => onVat(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />%
                </label>
                <div className="qs-qt-company">
                  <Icon name="banknote" size={15} className="qs-dash-accent" />
                  <span style={{ flex: 1 }} />
                  <button className="qs-qt-btn" onClick={() => setCompanyOpen(true)}><Icon name="building" size={13} />Thông tin công ty</button>
                  <button className="qs-qt-caret-btn" title={moreOpen ? 'Thu gọn' : 'Mở rộng'} onClick={() => setMoreOpen(o => !o)}><span className={`qs-bd-caret${moreOpen ? ' up' : ''}`} /></button>
                </div>
                {moreOpen && (
                  <div className="qs-qt-more">
                    <label><span>Ghi chú &amp; điều khoản (mỗi dòng một mục, in ở trang cuối)</span><textarea rows={5} value={terms} onChange={e => setTerms(e.target.value)} /></label>
                  </div>
                )}
                <p className="qs-qt-total-nums">Tạm tính <b>{quoteMoney(summary.subtotal)}</b> · VAT <b>{quoteMoney(summary.vatAmount)}</b> · Tổng <b>{quoteMoney(grand)} đ</b></p>
              </Step>
            </div>

            <div className="qs-card qs-qt-export">
              <button className="qs-qt-btn green" onClick={exportExcel}><Icon name="download" size={14} />Xuất Excel</button>
              <button className="qs-qt-btn red" onClick={() => setPrinting(true)}><Icon name="download" size={14} />Xuất PDF / In</button>
            </div>
          </aside>

          <div className="qs-card qs-qt-preview">
            <div className="qs-qt-preview-head">
              <b>{cur === 1 ? 'Tờ bìa' : 'Bảng báo giá chi tiết'}</b>
              <span className="qs-qt-pill">Mẫu {template}</span>
              <span className="qs-qt-pill">{vat ? `VAT ${vat}%` : 'Chưa VAT'}</span>
              <span className="qs-qt-pill">A4 · Ngang</span>
              <span style={{ flex: 1 }} />
              <div className="qs-qt-zoom">
                {ZOOMS.map(([v, l]) => <button key={v} className={zoom === v ? 'on' : ''} onClick={() => setZoom(v)}>{l}</button>)}
              </div>
              <ModeToggle mode={mode} onMode={setMode} />
            </div>
            <div className="qs-qt-stage" ref={stageRef}>
              <div style={{ zoom: scale }}>{renderPage(cur)}</div>
            </div>
            <div className="qs-qt-pager">
              {pages > 1 && <button disabled={cur <= 1} title="Trang trước" onClick={() => setPage(cur - 1)}>←</button>}
              {pages > 1 && pageList(cur, pages).map((n, i) => (n === null
                ? <span key={`gap${i}`}>…</span>
                : <button key={n} className={n === cur ? 'on' : ''} onClick={() => setPage(n)}>{n}</button>))}
              {pages > 1 && <button disabled={cur >= pages} title="Trang sau" onClick={() => setPage(cur + 1)}>→</button>}
              <span className="qs-qt-pageno">Trang {cur} / {pages}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="qs-qt-edit">
          <div className="qs-qt-edit-top"><ModeToggle mode={mode} onMode={setMode} /></div>
          <CoverEditor
            sections={sections} onSections={setSections} info={info} onInfo={setInfo} code={code} onCode={setCustomCode}
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

      {companyOpen && (
        <CompanyModal
          value={company} onClose={() => setCompanyOpen(false)}
          onSave={next => { setCompany(next); setCompanyOpen(false); notify('Đã lưu thông tin công ty') }}
        />
      )}
      {toast && <div className="qs-qt-toast">{toast}</div>}
      {printing && createPortal(
        <div className="qs-qt-print">{Array.from({ length: pages }, (_, i) => renderPage(i + 1))}</div>,
        document.body,
      )}
    </>
  )
}
