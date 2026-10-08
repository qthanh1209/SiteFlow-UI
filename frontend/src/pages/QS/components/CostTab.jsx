import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../../../components/ui/Icon'
import { DASH_PROJECTS, DASH_DEFAULT_ACTIVE } from '../../../data/qsDashboardData'
import {
  COST_BASIC_KEYS, COST_CATEGORIES, COST_COLUMNS, COST_DEFAULT_HIDDEN, NO_SUPPLIER,
  entryText, formatMoney, formatTable, rowValues,
} from '../../../data/qsBreakdownData'
import SheetBody from './breakdown/SheetBody'
import CostOverview from './cost/CostOverview'
import DropMenu from './cost/DropMenu'

const GROUP_MODES = [
  { key: 'none', label: 'Không gom', note: 'Danh sách phẳng, đánh số liên tục' },
  { key: 'category', label: 'Hạng mục', note: 'Gom theo hạng mục sản phẩm' },
  { key: 'floor', label: 'Tầng', note: 'Gom theo tầng / phòng ở tab Bóc tách' },
  { key: 'brand', label: 'NCC', note: 'Gom theo nhà cung cấp (thương hiệu)' },
]
const COUNTED = COST_COLUMNS.filter(c => c.key !== 'stt')
const EMPTY_FAVS = new Set()
const INITIAL_SEL = { a: { r: 0, c: 0 }, f: { r: 0, c: 0 } }
/* Các bộ cột dựng sẵn của bảng chi phí (hidden: những cột bị ẩn) */
const COL_PRESETS = [
  { key: 'default', label: 'Mặc định', note: '10 cột thường dùng', hidden: COST_DEFAULT_HIDDEN },
  { key: 'all', label: 'Tất cả', note: 'Hiện đủ 14 cột', hidden: [] },
  { key: 'basic', label: 'Cơ bản', note: 'Tên, đơn vị, số lượng, giá bán, thành tiền', hidden: COST_COLUMNS.filter(c => !COST_BASIC_KEYS.includes(c.key)).map(c => c.key) },
]

/* Biên lợi nhuận (%) trên giá bán của một dòng; null khi chưa có giá bán */
function marginOf(r) {
  const v = rowValues(r)
  return v.price > 0 ? ((v.price - v.dealer) / v.price) * 100 : null
}

/* Tab "Chi phí": tổng quan giá vốn / giá bán / lợi nhuận và bảng chi phí.
   Dùng chung dữ liệu (và lịch sử hoàn tác) với bảng ở tab Bóc tách. */
export default function CostTab({ sheet, vat, onGoto }) {
  const { groups } = sheet
  const [catCode, setCatCode] = useState(COST_CATEGORIES[0].code)
  const [q, setQ] = useState('')
  const [chip, setChip] = useState('all')
  const [groupBy, setGroupBy] = useState('none')
  const [collapsed, setCollapsed] = useState(() => new Set())
  const [showOverview, setShowOverview] = useState(true)
  const [minMargin, setMinMargin] = useState(15)
  const [hiddenCols, setHiddenCols] = useState(() => new Set(COST_DEFAULT_HIDDEN))
  const [panel, setPanel] = useState(null)
  const [view, setView] = useState('sheet')
  const [full, setFull] = useState(false)
  const [targetOpen, setTargetOpen] = useState(false)
  const [targetVal, setTargetVal] = useState('20')
  const searchRef = useRef(null)

  const category = COST_CATEGORIES.find(c => c.code === catCode)
  const live = Boolean(category.live)
  const project = DASH_PROJECTS.find(p => p.id === DASH_DEFAULT_ACTIVE.projectId)
  const rows = useMemo(() => (live ? groups.flatMap(g => g.rows) : []), [groups, live])

  const isLow = useCallback(r => { const m = marginOf(r); return m !== null && m < minMargin }, [minMargin])
  const counts = useMemo(() => ({
    all: rows.length,
    low: rows.filter(isLow).length,
    noPrice: rows.filter(r => rowValues(r).price === 0).length,
    noCost: rows.filter(r => rowValues(r).dealer === 0).length,
  }), [rows, isLow])

  const totals = useMemo(() => {
    const t = rows.reduce((s, r) => { const v = rowValues(r); return { cost: s.cost + v.costAmount, sale: s.sale + v.amount } }, { cost: 0, sale: 0 })
    const profit = t.sale - t.cost
    return { ...t, profit, margin: t.sale ? (profit / t.sale) * 100 : 0, vatAmount: (t.sale * vat) / 100 }
  }, [rows, vat])
  const categories = live && rows.length ? [{ name: category.name, sale: totals.sale, cost: totals.cost, margin: totals.margin }] : []
  const suppliers = useMemo(() => {
    const by = new Map()
    rows.forEach(r => by.set(r.brand || NO_SUPPLIER, (by.get(r.brand || NO_SUPPLIER) || 0) + rowValues(r).costAmount))
    return [...by].map(([name, cost]) => ({ name, pct: totals.cost ? (cost / totals.cost) * 100 : 0 })).sort((a, b) => b.pct - a.pct)
  }, [rows, totals.cost])

  /* Lọc dòng theo hạng mục đang chọn, chip cảnh báo và ô tìm kiếm */
  const extraPred = useCallback(r => {
    if (!live) return false
    const v = rowValues(r)
    if (chip === 'low' && !isLow(r)) return false
    if (chip === 'noPrice' && v.price !== 0) return false
    if (chip === 'noCost' && v.dealer !== 0) return false
    const k = q.trim().toLowerCase()
    return !k || [r.name, r.brand, r.room, r.note].some(t => (t || '').toLowerCase().includes(k))
  }, [live, chip, q, isLow])

  /* Trải dòng cho bảng chi phí: đánh STT liên tục, tuỳ chọn gom theo hạng mục / tầng / NCC, thêm dòng TỔNG ở cuối */
  const flatten = useCallback((gs, pred) => {
    const items = []
    gs.forEach((g, gi) => g.rows.forEach((r, ri) => { if (!pred || pred(r, '')) items.push({ type: 'item', g, gi, r, ri }) }))
    const keyOf = e => (groupBy === 'floor' ? e.g.name : groupBy === 'brand' ? e.r.brand || NO_SUPPLIER : category.name)
    const sum = list => list.reduce((s, e) => { const v = rowValues(e.r); return { qty: s.qty + e.r.qty, cost: s.cost + v.costAmount, sale: s.sale + v.amount, profit: s.profit + v.profit } }, { qty: 0, cost: 0, sale: 0, profit: 0 })
    const out = []
    let n = 0
    let seq = 0
    const push = e => { n += 1; seq += 1; out.push({ ...e, n, stt: String(seq) }) }
    if (groupBy === 'none') items.forEach(push)
    else {
      const names = [...new Set(items.map(keyOf))]
      names.forEach((name, gi) => {
        const list = items.filter(e => keyOf(e) === name)
        const t = sum(list)
        const closed = collapsed.has(name)
        n += 1
        out.push({ type: 'group', synthetic: true, gi, n, g: { id: `x:${name}`, name, collapsed: closed }, cells: { qty: formatMoney(t.qty), amount: formatMoney(t.sale), costAmount: formatMoney(t.cost), profit: t.profit ? formatMoney(t.profit) : '' } })
        if (!closed) list.forEach(push)
      })
    }
    const t = sum(items)
    n += 1
    out.push({ type: 'total', n, g: { id: 'total' }, cells: { name: `TỔNG · ${items.length} hạng mục`, qty: formatMoney(t.qty), dealer: formatMoney(t.cost), costAmount: formatMoney(t.cost), profit: t.profit ? formatMoney(t.profit) : '', amount: formatMoney(t.sale) } })
    return out
  }, [groupBy, collapsed, category.name])

  const rowClass = useCallback(e => (e.type === 'item' && isLow(e.r) ? ' warn' : ''), [isLow])
  const toggleSynthetic = useCallback(id => setCollapsed(prev => {
    const name = id.slice(2)
    const next = new Set(prev)
    if (next.has(name)) next.delete(name); else next.add(name)
    return next
  }), [])

  /* Ctrl+K: nhảy tới ô tìm kiếm (chỉ khi tab này đang hiện) */
  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && searchRef.current && searchRef.current.offsetParent !== null) {
        e.preventDefault()
        searchRef.current.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  /* Bộ cột đang áp dụng (null = người dùng đã tự bật / tắt cột) */
  const activePreset = COL_PRESETS.find(p => p.hidden.length === hiddenCols.size && p.hidden.every(k => hiddenCols.has(k))) || null
  const shownCount = COUNTED.filter(c => !hiddenCols.has(c.key)).length
  const colLabel = `${shownCount}/${COUNTED.length}`
  const fileName = `chi-phi-${project.drafts[0].code}`

  function exportExcel() {
    const cols = COST_COLUMNS.filter(c => !hiddenCols.has(c.key))
    const matrix = [cols.map(c => c.label), ...flatten(groups, extraPred).map(e => cols.map(c => (e.type === 'group' && c.key === 'name' ? e.g.name : entryText(e, c.key))))]
    const blob = new Blob([`﻿${formatTable(matrix, ',')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  /* Đặt "Lợi nhuận dự kiến (%)" của mọi dòng có giá sao cho biên trên giá bán đạt mức mục tiêu */
  function applyTarget() {
    const x = Math.max(0, Math.min(90, Number(targetVal) || 0))
    sheet.commit(`Đặt biên mục tiêu ${x}%`, gs => gs.map(g => ({
      ...g,
      rows: g.rows.map(r => (r.retail ? { ...r, margin: Math.max(0, Math.round((((1 - r.discount / 100) / (1 - x / 100)) - 1) * 1000) / 10) } : r)),
    })))
    setTargetOpen(false)
  }

  return (
    <>
      <div className="qs-card qs-ct-top">
        <Icon name="history" size={15} className="qs-ct-top-icon" />
        <div className="qs-ct-cats">
          {COST_CATEGORIES.map(c => (
            <button key={c.code} className={`qs-ct-cat-chip${c.code === catCode ? ' on' : ''}`} onClick={() => setCatCode(c.code)}>
              <small>{c.code}</small>{c.name}
              {(c.live || c.count) && <span>{c.live ? groups.reduce((s, g) => s + g.rows.length, 0) : c.count}</span>}
            </button>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <div className="qs-ct-search wide">
          <Icon name="search" size={15} />
          <input ref={searchRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm sản phẩm, công tác, dòng trong bảng, hạng mục…" />
          <kbd>Ctrl K</kbd>
        </div>
        <button className="qs-ct-btn" onClick={() => onGoto('quote')}><Icon name="download" size={14} />Xuất báo giá</button>
      </div>

      <div className="qs-card qs-ct-bar">
        <span className="qs-ct-title">Hạng mục đã bóc</span>
        <span className="qs-bd-count">[{rows.length}]</span>
        <button className="qs-bd-category">
          <b>{category.code}.{category.name}</b>
          <span className="qs-bd-count">[{rows.length}]</span>
          <span style={{ flex: 1 }} />
          <span className="qs-bd-acc-plus"><Icon name="plus" size={10} stroke={3} /></span>
        </button>
        <div className="qs-bd-seg">
          <button className={view === 'sheet' ? 'on' : ''} onClick={() => setView('sheet')}><Icon name="table" size={15} />Bảng tính</button>
          <button className={view === 'plain' ? 'on' : ''} onClick={() => setView('plain')}><Icon name="listLines" size={15} />Bảng thường</button>
        </div>
        <span style={{ flex: 1 }} />
        <button className="qs-bd-round-btn accent" title={showOverview ? 'Ẩn tổng quan' : 'Hiện tổng quan'} onClick={() => setShowOverview(v => !v)}><Icon name={showOverview ? 'chevronDown' : 'chevronUp'} size={14} /></button>
      </div>

      {showOverview && (
        <CostOverview
          totals={totals} vat={vat} rowCount={rows.length}
          warn={counts} minMargin={minMargin} onMinMargin={setMinMargin}
          onFilter={setChip}
          categories={categories} suppliers={suppliers}
          onCollapse={() => setShowOverview(false)}
        />
      )}

      <div className="qs-card qs-ct-filters">
        <div className="qs-ct-filters-main">
        <div className="qs-ct-search">
          <Icon name="search" size={15} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm tên · mã · thương hiệu · phòng…" />
        </div>
        {[['all', 'Tất cả'], ['low', `Biên < ${minMargin}%`], ['noPrice', 'Chưa giá bán'], ['noCost', 'Chưa giá vốn']].map(([key, label]) => (
          <button key={key} className={`qs-ct-chip${chip === key ? ' on' : ''}${key === 'low' ? ' red' : ''}`} onClick={() => setChip(key)}>{label}<span>{counts[key]}</span></button>
        ))}
        <DropMenu className={`qs-ct-btn outline${groupBy === 'none' ? '' : ' on'}`} title="Gom các dòng của bảng theo nhóm" options={GROUP_MODES} value={groupBy} onPick={setGroupBy}>
          <Icon name="layers" size={14} /><span className="qs-ct-drop-pre">Gom theo</span>{GROUP_MODES.find(m => m.key === groupBy).label}
        </DropMenu>
        <button className={`qs-ct-btn outline${showOverview ? ' on' : ''}`} title="Hiện / ẩn tổng quan chi phí" onClick={() => setShowOverview(v => !v)}><Icon name="gauge" size={14} />Tổng quan</button>
        <div className="qs-ct-target">
          <button className={`qs-ct-btn outline${targetOpen ? ' on' : ''}`} onClick={() => setTargetOpen(o => !o)}><Icon name="target" size={14} />Biên mục tiêu</button>
          {targetOpen && (
            <div className="qs-ct-target-pop">
              <span>Đặt biên lợi nhuận cho mọi dòng có giá</span>
              <div>
                <input type="number" min="0" max="90" value={targetVal} onChange={e => setTargetVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') applyTarget() }} autoFocus />%
                <button className="qs-modal-btn primary" onClick={applyTarget}>Áp dụng</button>
              </div>
            </div>
          )}
        </div>
        <button className="qs-ct-btn" title="Xuất Excel" onClick={exportExcel}><Icon name="download" size={14} />Excel</button>
        </div>
        <div className="qs-ct-filters-cols">
          <button className="qs-bd-cols-label" title="Chọn cột hiển thị" onClick={() => setPanel(p => (p === 'cols' ? null : 'cols'))}>Cột <span>{colLabel}</span><Icon name="chevronDown" size={15} /></button>
          <DropMenu
            className="qs-bd-preset" title="Chọn bộ cột hiển thị" align="right"
            options={COL_PRESETS} value={activePreset ? activePreset.key : null}
            onPick={key => setHiddenCols(new Set(COL_PRESETS.find(p => p.key === key).hidden))}
          >
            <Icon name="sliders" size={13} />{activePreset ? activePreset.label : 'Tuỳ chỉnh'}
          </DropMenu>
        </div>
      </div>

      <div className={`qs-card qs-bd-sheet qs-ct-sheet${full ? ' full' : ''}`}>
        <SheetBody
          sheet={sheet}
          plain={view === 'plain'}
          hiddenCols={hiddenCols} onHiddenCols={setHiddenCols}
          panel={panel} onPanel={setPanel}
          favorites={EMPTY_FAVS}
          onTarget={() => {}}
          onAddRow={(newRows, label) => sheet.commit(label, gs => gs.map((g, i) => (i === gs.length - 1 ? { ...g, collapsed: false, rows: [...g.rows, ...newRows] } : g)))}
          full={full} onFull={() => setFull(f => !f)}
          flash={null} onClearMark={() => {}}
          fileName={fileName}
          columns={COST_COLUMNS} flatten={flatten} extraPred={extraPred} initialSel={INITIAL_SEL}
          rowClass={rowClass} onToggleGroupOverride={toggleSynthetic}
          footer={false} toolbarOpen={false} letters={false}
          colCount={{ shown: shownCount, total: COUNTED.length }}
        />
      </div>
    </>
  )
}
