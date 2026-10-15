import { useCallback, useMemo, useState } from 'react'
import Icon from '../../../components/ui/Icon'
import {
  COST_CATEGORIES, PROJECT_BASIC_KEYS, PROJECT_COLUMNS, PROJECT_DEFAULT_HIDDEN,
  entryText, flattenSheet, formatMoney, formatTable, rowValues,
} from '../../../data/qsBreakdownData'
import SheetBody from './breakdown/SheetBody'
import DropMenu from './cost/DropMenu'
import CategoryBar from './cost/CategoryBar'

const COUNTED = PROJECT_COLUMNS.filter(c => c.key !== 'stt')
const EMPTY_FAVS = new Set()
const INITIAL_SEL = { a: { r: 0, c: 0 }, f: { r: 0, c: 0 } }
const COL_PRESETS = [
  { key: 'default', label: 'Mặc định', note: '10 cột gửi khách', hidden: PROJECT_DEFAULT_HIDDEN },
  { key: 'all', label: 'Hiện tất cả', note: `Hiện đủ ${COUNTED.length} cột`, hidden: [] },
  { key: 'basic', label: 'Cột cơ bản', note: 'Tên, đơn vị, số lượng, giá bán, thành tiền', hidden: PROJECT_COLUMNS.filter(c => !PROJECT_BASIC_KEYS.includes(c.key)).map(c => c.key) },
]

/* Tab "Dự án": bảng tổng hợp sản phẩm của dự án theo tầng / phòng (bản xem cho khách: giá bán và thành tiền).
   Dùng chung dữ liệu và lịch sử hoàn tác với bảng ở tab Bóc tách. */
export default function ProjectsTab({ project, sheet, onGoto }) {
  const { groups } = sheet
  const [catCode, setCatCode] = useState(COST_CATEGORIES[0].code)
  const [q, setQ] = useState('')
  const [hiddenCols, setHiddenCols] = useState(() => new Set(PROJECT_DEFAULT_HIDDEN))
  const [panel, setPanel] = useState(null)
  const [view, setView] = useState('sheet')
  const [full, setFull] = useState(false)

  const draft = project.drafts[0]
  const category = COST_CATEGORIES.find(c => c.code === catCode)
  const live = Boolean(category.live)
  const rowCount = live ? groups.reduce((s, g) => s + g.rows.length, 0) : 0

  /* Lọc dòng theo hạng mục đang chọn và ô tìm kiếm */
  const extraPred = useCallback(r => {
    if (!live) return false
    const k = q.trim().toLowerCase()
    return !k || [r.name, r.brand, r.room, r.note].some(t => (t || '').toLowerCase().includes(k))
  }, [live, q])

  /* Trải dòng theo tầng / phòng như bảng Bóc tách, thêm tổng phụ ở dòng nhóm và dòng TỔNG ở cuối */
  const labelKey = hiddenCols.has('room') ? 'name' : 'room'
  const flatten = useCallback((gs, pred) => {
    const flat = flattenSheet(live ? gs : [], pred)
    const sum = rows => rows.reduce((s, r) => ({ qty: s.qty + r.qty, sale: s.sale + rowValues(r).amount }), { qty: 0, sale: 0 })
    const kept = g => g.rows.filter(r => !pred || pred(r, ''))
    const out = flat.map(e => (e.type === 'group' ? { ...e, cells: { amount: formatMoney(sum(kept(e.g)).sale) } } : e))
    const all = (live ? gs : []).flatMap(kept)
    const t = sum(all)
    out.push({ type: 'total', n: (out.length ? out[out.length - 1].n : 0) + 1, g: { id: 'total' }, cells: { [labelKey]: `TỔNG · ${all.length} SP`, qty: formatMoney(t.qty), amount: formatMoney(t.sale) } })
    return out
  }, [live, labelKey])


  const shownCount = COUNTED.filter(c => !hiddenCols.has(c.key)).length
  const colLabel = `${shownCount}/${COUNTED.length}`
  const activePreset = COL_PRESETS.find(p => p.hidden.length === hiddenCols.size && p.hidden.every(k => hiddenCols.has(k))) || null
  const fileName = `du-an-${draft.code}`
  const rowClass = useMemo(() => () => '', [])

  function exportExcel() {
    const cols = PROJECT_COLUMNS.filter(c => !hiddenCols.has(c.key))
    const matrix = [cols.map(c => c.label), ...flatten(groups, extraPred).map(e => cols.map(c => entryText(e, c.key) || (e.cells && e.cells[c.key]) || ''))]
    const blob = new Blob([`﻿${formatTable(matrix, ',')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>

      <CategoryBar
        categories={COST_CATEGORIES} catCode={catCode} onCat={setCatCode}
        liveCount={groups.reduce((s, g) => s + g.rows.length, 0)}
        q={q} onQ={setQ}
        view={view} onView={setView}
        onExport={() => onGoto('quote')}
      >
        <button className="qs-ct-btn" title="Xuất Excel" onClick={exportExcel}><Icon name="download" size={14} />Xuất Excel</button>
        <button className="qs-bd-cols-label" title="Chọn cột hiển thị" onClick={() => setPanel(p => (p === 'cols' ? null : 'cols'))}>Cột <span>{colLabel}</span><Icon name="chevronDown" size={15} /></button>
        <DropMenu
          className="qs-bd-preset" title="Chọn bộ cột hiển thị" align="right"
          options={COL_PRESETS} value={activePreset ? activePreset.key : null}
          onPick={key => setHiddenCols(new Set(COL_PRESETS.find(p => p.key === key).hidden))}
        >
          <Icon name="sliders" size={13} />{activePreset ? activePreset.label : 'Tuỳ chỉnh'}
        </DropMenu>
        <button className="qs-bd-round-btn accent" title={full ? 'Thoát toàn màn hình' : 'Phóng bảng toàn màn hình'} onClick={() => setFull(f => !f)}><Icon name={full ? 'chevronUp' : 'chevronDown'} size={14} /></button>
      </CategoryBar>

      <div className={`qs-card qs-bd-sheet qs-ct-sheet qs-pj-sheet${full ? ' full' : ''}`}>
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
          columns={PROJECT_COLUMNS} flatten={flatten} extraPred={extraPred} initialSel={INITIAL_SEL}
          rowClass={rowClass}
          footer={false} letters={false}
          colCount={{ shown: shownCount, total: COUNTED.length }}
        />
      </div>
    </>
  )
}
