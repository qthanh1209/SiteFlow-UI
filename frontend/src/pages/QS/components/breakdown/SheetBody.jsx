import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon'
import SheetToolbar from './SheetToolbar'
import SheetGrid from './SheetGrid'
import GroupAdder from './GroupAdder'
import {
  SHEET_COLUMNS, ROW_NUM_WIDTH, EDITABLE_KEYS, NUMERIC_KEYS, PRICE_KEYS,
  applyEdit, cellNumber, cellText, colLetter, editText, entryText, flattenSheet, formatTable, makeRow, nextRowId, parseTable,
} from '../../../../data/qsBreakdownData'

const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]))

/* Áp fn lên các dòng có id trong ids; không dòng nào đổi thì trả lại đúng mảng cũ (để lịch sử bỏ qua) */
function mapRows(groups, ids, fn) {
  const out = groups.map(g => {
    let changed = false
    const rows = g.rows.map(r => {
      if (!ids.has(r.id)) return r
      const n = fn(r)
      if (n !== r) changed = true
      return n
    })
    return changed ? { ...g, rows } : g
  })
  return out.some((g, i) => g !== groups[i]) ? out : groups
}

/* Phần thân của bảng bóc tách: thanh công cụ, dải tuỳ chọn, lưới và hàng nút dưới cùng.
   Giữ toàn bộ trạng thái chọn ô / sửa ô / lọc / tìm và mọi thao tác của thanh công cụ. */
export default function SheetBody({
  sheet, plain, hiddenCols, onHiddenCols, panel, onPanel, favorites, targetName, onTarget, groupNames, onAddGroup, onAddRow, onAddBlank,
  full, onFull, dropMark, flash, onClearMark, dropHint, fileName,
  /* Tuỳ biến cho bảng khác (tab Chi phí): bộ cột, cách trải dòng, lọc thêm, ô chọn ban đầu, lớp CSS của dòng… */
  columns = SHEET_COLUMNS, flatten = flattenSheet, extraPred = null, initialSel = null, rowClass = null, onToggleGroupOverride = null,
  footer = true, toolbarOpen = true, colCount = null, letters = true,
}) {
  const { groups, commit } = sheet
  const [fontSize, setFontSize] = useState(13)
  const [compact, setCompact] = useState(true)
  const [frozen, setFrozen] = useState(true)
  const [zoom, setZoom] = useState(100)
  const [showStats, setShowStats] = useState(true)
  const [findQ, setFindQ] = useState('')
  const [hitIdx, setHitIdx] = useState(0)
  const [filterText, setFilterText] = useState('')
  const [colFilter, setColFilter] = useState(null)
  const [favOnly, setFavOnly] = useState(false)
  /* Màu chữ / màu nền chọn gần nhất (tô vạch dưới hai nút màu và là màu mở sẵn trong bảng màu) */
  const [lastColor, setLastColor] = useState({ color: '#E11D48', bg: '#FACC15' })
  /* Ô đang chọn mặc định giống giao diện mẫu: tên nhóm thứ hai (B15:C15) */
  const [sel, setSel] = useState(() => {
    if (initialSel) return initialSel
    const r = groups[0].rows.length + 1
    return { a: { r, c: 1 }, f: { r, c: 2 } }
  })
  const [editing, setEditingState] = useState(null)
  const edRef = useRef(null)
  const setEditing = v => { edRef.current = v; setEditingState(v) }
  const gridRef = useRef(null)
  const fileRef = useRef(null)
  const clipRef = useRef(null)
  const dragSel = useRef(false)
  const reveal = useRef(false)

  const cols = useMemo(() => columns.filter(c => !hiddenCols.has(c.key)), [columns, hiddenCols])
  const pred = useMemo(() => {
    const ft = filterText.trim().toLowerCase()
    if (!ft && !colFilter && !favOnly && !extraPred) return null
    return (r, stt) => {
      if (extraPred && !extraPred(r, stt)) return false
      if (favOnly && !favorites.has(r.productId)) return false
      if (colFilter && cellText(r, colFilter.key, stt) !== colFilter.value) return false
      if (ft && !columns.some(c => cellText(r, c.key, stt).toLowerCase().includes(ft))) return false
      return true
    }
  }, [filterText, colFilter, favOnly, favorites, extraPred, columns])
  const flat = useMemo(() => flatten(groups, pred), [flatten, groups, pred])

  /* Vùng chọn, đã ép vào trong phạm vi bảng hiện tại */
  const maxR = Math.max(0, flat.length - 1)
  const maxC = Math.max(0, cols.length - 1)
  const clamp = p => ({ r: Math.max(0, Math.min(maxR, p.r)), c: Math.max(0, Math.min(maxC, p.c)) })
  const A = clamp(sel.a)
  const F = clamp(sel.f)
  const range = { r0: Math.min(A.r, F.r), r1: Math.max(A.r, F.r), c0: Math.min(A.c, F.c), c1: Math.max(A.c, F.c) }
  const single = range.r0 === range.r1 && range.c0 === range.c1
  const anchorEntry = flat[A.r]
  const anchorCol = cols[A.c]
  const selEntries = flat.slice(range.r0, range.r1 + 1)
  const selItems = selEntries.filter(e => e.type === 'item')
  const selIds = new Set(selItems.map(e => e.r.id))
  const selKeys = cols.slice(range.c0, range.c1 + 1).map(c => c.key)
  const refLabel = !anchorEntry || !anchorCol ? ''
    : single ? `${colLetter(A.c)}${anchorEntry.n}`
      : `${colLetter(range.c0)}${flat[range.r0].n}:${colLetter(range.c1)}${flat[range.r1].n}`

  /* Dòng nhóm tự sinh (gom theo NCC…) và dòng tổng không sửa được */
  const canEdit = (e, col) => Boolean(e && col) && (e.type === 'item' ? EDITABLE_KEYS.has(col.key) : e.type === 'group' && !e.synthetic && (col.key === 'room' || col.key === 'name'))
  const rawText = (e, col) => (e.type === 'item' ? editText(e.r, col.key) : e.g.name)

  /* Chọn ô do người dùng thao tác: nhóm chứa ô đó thành nơi nhận hạng mục mới */
  function pick(a, f = a, show = false) {
    const na = clamp(a)
    reveal.current = show
    setSel({ a: na, f: clamp(f) })
    if (flat[na.r] && flat[na.r].type !== 'total' && !flat[na.r].synthetic) onTarget(flat[na.r].g.id)
  }
  function move(dr, dc, extend) {
    const next = clamp({ r: F.r + dr, c: F.c + dc })
    if (extend) { reveal.current = true; setSel({ a: A, f: next }) } else pick(next, next, true)
  }

  /* Cuộn ô tiêu điểm vào tầm nhìn sau khi di chuyển bằng phím / tìm kiếm */
  useEffect(() => {
    if (!reveal.current || !gridRef.current) return
    reveal.current = false
    const td = gridRef.current.querySelector(`td[data-r="${F.r}"][data-c="${F.c}"]`)
    if (td) td.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  })
  useEffect(() => {
    const up = () => { dragSel.current = false }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])
  /* Vừa thêm / tăng số lượng một sản phẩm: chọn ô tên của dòng đó và cuộn tới */
  const flashN = flash ? flash.n : 0
  useEffect(() => {
    if (!flash) return
    const r = flat.findIndex(e => e.type === 'item' && e.r.id === flash.rowId)
    if (r < 0) return
    const c = Math.max(0, cols.findIndex(col => col.key === 'name'))
    reveal.current = true
    setSel({ a: { r, c }, f: { r, c } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashN])

  /* ---------- Sửa ô ---------- */
  function startEdit(r, c, initial, bar = false) {
    const e = flat[r]
    const col = cols[c]
    if (!canEdit(e, col)) return
    setEditing({ r, c, bar, value: initial === undefined ? rawText(e, col) : initial })
  }
  function commitEdit(dr = 0, dc = 0) {
    const ed = edRef.current
    if (!ed) return
    setEditing(null)
    const e = flat[ed.r]
    const col = cols[ed.c]
    if (e && col) {
      if (e.type === 'group') {
        const name = ed.value.trim()
        if (name && name !== e.g.name) commit('Đổi tên nhóm', gs => gs.map(g => (g.id === e.g.id ? { ...g, name } : g)))
      } else commit(`Sửa ô ${colLetter(ed.c)}${e.n}`, gs => mapRows(gs, new Set([e.r.id]), r => applyEdit(r, col.key, ed.value)))
    }
    if (dr || dc) pick({ r: ed.r + dr, c: ed.c + dc }, undefined, true)
    if (gridRef.current) gridRef.current.focus()
  }
  function cancelEdit() {
    setEditing(null)
    if (gridRef.current) gridRef.current.focus()
  }
  function onEditKey(ev) {
    ev.stopPropagation()
    if (ev.key === 'Escape') { ev.preventDefault(); cancelEdit() } else if (ev.key === 'Tab') { ev.preventDefault(); commitEdit(0, ev.shiftKey ? -1 : 1) } else if (ev.key === 'Enter' && !ev.shiftKey && !ev.altKey) { ev.preventDefault(); commitEdit(1, 0) }
  }

  /* ---------- Định dạng ---------- */
  const anchorFmt = (anchorEntry && anchorCol && anchorEntry.type === 'item' && anchorEntry.r.fmt && anchorEntry.r.fmt[anchorCol.key]) || {}
  function setFmt(label, patch, merge = false) {
    commit(label, gs => mapRows(gs, selIds, r => {
      const fmt = { ...(r.fmt || {}) }
      selKeys.forEach(k => { fmt[k] = patch(fmt[k] || {}) })
      return { ...r, fmt }
    }), merge)
  }
  function toggleFmt(flag) {
    const allOn = selItems.length > 0 && selItems.every(e => selKeys.every(k => e.r.fmt && e.r.fmt[k] && e.r.fmt[k][flag]))
    setFmt({ b: 'In đậm', i: 'In nghiêng', u: 'Gạch chân' }[flag], f => ({ ...f, [flag]: !allOn }))
  }
  function clearFmt() {
    commit('Xoá định dạng', gs => mapRows(gs, selIds, r => {
      if (!r.fmt || !selKeys.some(k => r.fmt[k])) return r
      const fmt = { ...r.fmt }
      selKeys.forEach(k => { delete fmt[k] })
      return { ...r, fmt }
    }))
  }

  /* ---------- Thống kê vùng chọn ---------- */
  const stats = useMemo(() => {
    if (single) return null
    const nums = []
    let count = 0
    selEntries.forEach(e => selKeys.forEach(k => {
      if (entryText(e, k) !== '') count += 1
      if (e.type === 'item') { const n = cellNumber(e.r, k); if (n !== null) nums.push(n) }
    }))
    const sum = nums.reduce((s, n) => s + n, 0)
    return { sum, avg: nums.length ? sum / nums.length : 0, min: nums.length ? Math.min(...nums) : 0, max: nums.length ? Math.max(...nums) : 0, count }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat, cols, range.r0, range.r1, range.c0, range.c1])

  /* ---------- Cắt / sao chép / dán ---------- */
  function copy() {
    const matrix = selEntries.map(e => selKeys.map(k => entryText(e, k)))
    clipRef.current = matrix
    try { navigator.clipboard.writeText(formatTable(matrix)).catch(() => {}) } catch {}
  }
  function clearCells(label) {
    commit(label, gs => mapRows(gs, selIds, r => selKeys.reduce((row, k) => applyEdit(row, k, ''), r)))
  }
  function cut() { copy(); clearCells('Cắt') }
  /* Nút Dán: thử đọc bộ nhớ tạm của hệ thống; nếu trình duyệt chưa cấp quyền (hoặc đang hỏi) thì dùng vùng vừa sao chép trong bảng */
  async function paste() {
    let text = null
    try { text = await Promise.race([navigator.clipboard.readText(), new Promise(res => { setTimeout(() => res(null), 400) })]) } catch {}
    pasteMatrix(text ? parseTable(text) : clipRef.current)
  }
  /* Ctrl+V: dùng luôn nội dung trình duyệt đưa trong sự kiện paste, không cần xin quyền */
  function onPaste(ev) {
    if (edRef.current) return
    const text = ev.clipboardData ? ev.clipboardData.getData('text/plain') : ''
    if (!text) return
    ev.preventDefault()
    pasteMatrix(parseTable(text))
  }
  function pasteMatrix(matrix) {
    if (!matrix || !matrix.length) return
    /* Dán 1 ô vào vùng nhiều ô = điền cả vùng */
    const fill = matrix.length === 1 && matrix[0].length === 1 && !single
    const h = fill ? range.r1 - range.r0 + 1 : matrix.length
    const w = fill ? range.c1 - range.c0 + 1 : Math.max(...matrix.map(row => row.length))
    const edits = new Map()
    const renames = new Map()
    for (let i = 0; i < h; i++) {
      const e = flat[range.r0 + i]
      if (!e) break
      for (let j = 0; j < w; j++) {
        const col = cols[range.c0 + j]
        const text = fill ? matrix[0][0] : matrix[i][j]
        if (!col || text === undefined || !canEdit(e, col)) continue
        if (e.type === 'group') { if (text.trim()) renames.set(e.g.id, text.trim()) } else edits.set(e.r.id, [...(edits.get(e.r.id) || []), [col.key, text]])
      }
    }
    commit('Dán', gs => {
      const renamed = renames.size ? gs.map(g => (renames.has(g.id) && renames.get(g.id) !== g.name ? { ...g, name: renames.get(g.id) } : g)) : gs
      const base = renamed.some((g, i) => g !== gs[i]) ? renamed : gs
      return mapRows(base, new Set(edits.keys()), r => edits.get(r.id).reduce((row, [k, t]) => applyEdit(row, k, t), r))
    })
    pick({ r: range.r0, c: range.c0 }, { r: range.r0 + h - 1, c: range.c0 + w - 1 })
  }

  /* ---------- Dòng ---------- */
  function insertRow() {
    const e = flat[F.r]
    if (!e || e.type === 'total' || e.synthetic) return
    const at = e.type === 'item' ? e.ri + 1 : 0
    commit('Chèn dòng', gs => gs.map(g => (g.id === e.g.id ? { ...g, collapsed: false, rows: [...g.rows.slice(0, at), makeRow(null), ...g.rows.slice(at)] } : g)))
    pick({ r: F.r + 1, c: A.c }, undefined, true)
  }
  function duplicate() {
    if (!selItems.length) return
    commit('Nhân bản dòng', gs => gs.map(g => {
      const last = g.rows.reduce((idx, r, i) => (selIds.has(r.id) ? i : idx), -1)
      if (last < 0) return g
      const copies = g.rows.filter(r => selIds.has(r.id)).map(r => ({ ...r, id: nextRowId() }))
      return { ...g, rows: [...g.rows.slice(0, last + 1), ...copies, ...g.rows.slice(last + 1)] }
    }))
  }
  function deleteRows() {
    /* Dòng nhóm đang chọn chỉ bị xoá khi nhóm đó trống (sau khi xoá) và vẫn còn nhóm khác */
    const groupIds = new Set(selEntries.filter(e => e.type === 'group' && !e.synthetic).map(e => e.g.id))
    if (!selIds.size && !groupIds.size) return
    commit('Xoá dòng', gs => {
      const cleaned = selIds.size ? gs.map(g => (g.rows.some(r => selIds.has(r.id)) ? { ...g, rows: g.rows.filter(r => !selIds.has(r.id)) } : g)) : gs
      const kept = cleaned.filter(g => !(groupIds.has(g.id) && g.rows.length === 0))
      const out = kept.length ? kept : cleaned
      return out.length === gs.length && out.every((g, i) => g === gs[i]) ? gs : out
    })
    pick({ r: range.r0, c: A.c })
  }
  function sort(dir) {
    if (!anchorCol || anchorCol.key === 'stt' || anchorCol.key === 'image') return
    const key = anchorCol.key
    const val = r => (NUMERIC_KEYS.has(key) || key === 'docs' ? (key === 'docs' ? r.docs : cellNumber(r, key) ?? -Infinity) : cellText(r, key, ''))
    const cmp = (x, y) => {
      const a = val(x)
      const b = val(y)
      return dir * (typeof a === 'number' ? a - b : a.localeCompare(b, 'vi'))
    }
    commit(`Sắp xếp ${dir > 0 ? 'tăng' : 'giảm'} theo ${anchorCol.label}`, gs => {
      const out = gs.map(g => {
        const rows = [...g.rows].sort(cmp)
        return rows.every((r, i) => r === g.rows[i]) ? g : { ...g, rows }
      })
      return out.some((g, i) => g !== gs[i]) ? out : gs
    })
  }
  /* Nhập dòng từ CSV/TSV: cột lần lượt là Tên, Thương hiệu, Đơn vị, Số lượng, Giá bán lẻ (bỏ qua dòng tiêu đề nếu có) */
  function onImport(ev) {
    const file = ev.target.files && ev.target.files[0]
    ev.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result).replace(/^﻿/, '')
      const head = text.split('\n')[0]
      const delim = ['\t', ';', ','].reduce((best, d) => (head.split(d).length > head.split(best).length ? d : best), '\t')
      let lines = parseTable(text, delim).filter(l => l.some(v => v.trim()))
      if (lines.length && lines[0][3] !== undefined && /\D/.test(lines[0][3].trim()) && !/\d/.test(lines[0][3])) lines = lines.slice(1)
      const rows = lines.map(l => {
        let row = makeRow(null)
        ;[['name', 0], ['brand', 1], ['unit', 2], ['qty', 3], ['retail', 4]].forEach(([k, i]) => { if (l[i] !== undefined) row = applyEdit(row, k, l[i].trim()) })
        return row
      })
      if (rows.length) onAddRow(rows, `Nhập ${rows.length} dòng từ file`)
    }
    reader.readAsText(file)
  }

  /* ---------- Tìm kiếm ---------- */
  const matches = useMemo(() => {
    const q = findQ.trim().toLowerCase()
    if (panel !== 'find' || !q) return []
    const out = []
    flat.forEach((e, r) => cols.forEach((c, i) => { if (entryText(e, c.key).toLowerCase().includes(q)) out.push({ r, c: i }) }))
    return out
  }, [findQ, panel, flat, cols])
  const hits = useMemo(() => new Set(matches.map(m => `${m.r}:${m.c}`)), [matches])
  const curHit = matches.length ? matches[((hitIdx % matches.length) + matches.length) % matches.length] : null
  function goHit(delta) {
    if (!matches.length) return
    const i = (((hitIdx + delta) % matches.length) + matches.length) % matches.length
    setHitIdx(i)
    pick(matches[i], undefined, true)
  }

  /* ---------- Hiển thị / xuất ---------- */
  const tableWidth = cols.reduce((s, c) => s + c.w, plain ? 0 : ROW_NUM_WIDTH)
  function fitWidth() {
    if (!gridRef.current || !tableWidth) return
    setZoom(Math.max(30, Math.min(150, Math.floor((gridRef.current.clientWidth / tableWidth) * 100))))
  }
  const priceShown = PRICE_KEYS.filter(k => !hiddenCols.has(k)).length
  function togglePrice() {
    const next = new Set(hiddenCols)
    PRICE_KEYS.forEach(k => { if (priceShown) next.add(k); else next.delete(k) })
    onHiddenCols(next)
  }
  function toggleCol(key) {
    const next = new Set(hiddenCols)
    if (next.has(key)) next.delete(key); else if (cols.length > 1) next.add(key)
    onHiddenCols(next)
  }
  function toggleColFilter() {
    if (colFilter) { setColFilter(null); return }
    if (!anchorEntry || !anchorCol || anchorEntry.type !== 'item') return
    setColFilter({ key: anchorCol.key, label: anchorCol.label, value: entryText(anchorEntry, anchorCol.key) })
  }
  const exportMatrix = () => [cols.map(c => c.label), ...flat.map(e => cols.map(c => entryText(e, c.key)))]
  function download() {
    const blob = new Blob([`﻿${formatTable(exportMatrix(), ',')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  function print() {
    const [head, ...body] = exportMatrix()
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(fileName)}</title><style>
      body{font:12px Arial,sans-serif;margin:16px} h3{margin:0 0 10px} table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #999;padding:4px 6px;vertical-align:top;white-space:pre-line;text-align:left}
      th{background:#1E2F52;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact} tr.g td{background:#eee;font-weight:bold}
    </style></head><body><h3>${esc(fileName)}</h3><table><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${
      body.map((row, i) => `<tr${flat[i].type === 'group' ? ' class="g"' : ''}>${row.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')
    }</tbody></table></body></html>`
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
  }

  /* ---------- Chuột & bàn phím trên lưới ---------- */
  const roomIdx = cols.findIndex(c => c.key === 'room')
  const nameIdx = cols.findIndex(c => c.key === 'name')
  function onCellDown(r, c, ev) {
    if (ev.button !== 0) return
    if (edRef.current) commitEdit()
    onClearMark()
    dragSel.current = true
    if (ev.shiftKey) { setSel({ a: A, f: { r, c } }); return }
    /* Tên nhóm chiếm cả hai cột Phòng + Tên sản phẩm */
    if (flat[r].type === 'group' && roomIdx >= 0 && nameIdx >= 0 && (c === roomIdx || c === nameIdx)) pick({ r, c: roomIdx }, { r, c: nameIdx })
    else pick({ r, c })
  }
  function onCellEnter(r, c, ev) {
    if (dragSel.current && ev.buttons === 1) setSel(s => ({ a: s.a, f: { r, c } }))
  }
  function onKeyDown(ev) {
    if (edRef.current && !edRef.current.bar) return
    const k = ev.key
    if (ev.ctrlKey || ev.metaKey) {
      const map = {
        z: () => (ev.shiftKey ? sheet.redo() : sheet.undo()), y: sheet.redo, c: copy, x: cut,
        b: () => toggleFmt('b'), i: () => toggleFmt('i'), u: () => toggleFmt('u'),
        a: () => setSel({ a: { r: 0, c: 0 }, f: { r: maxR, c: maxC } }), f: () => onPanel('find'),
      }
      const fn = map[k.toLowerCase()]
      if (fn) { ev.preventDefault(); fn() }
      return
    }
    const arrows = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
    if (arrows[k]) { ev.preventDefault(); move(arrows[k][0], arrows[k][1], ev.shiftKey) } else if (k === 'Tab') { ev.preventDefault(); move(0, ev.shiftKey ? -1 : 1, false) } else if (k === 'Enter' || k === 'F2') { ev.preventDefault(); startEdit(A.r, A.c) } else if (k === 'Delete' || k === 'Backspace') { ev.preventDefault(); clearCells('Xoá nội dung ô') } else if (k.length === 1 && !ev.altKey && canEdit(anchorEntry, anchorCol)) { ev.preventDefault(); startEdit(A.r, A.c, k) }
  }

  const togglePanel = name => onPanel(panel === name ? null : name)
  const s = {
    canUndo: sheet.canUndo, canRedo: sheet.canRedo, fontSize, fmt: anchorFmt, showStats, stats, panel, frozen, compact, zoom,
    filterOn: filterText.trim() !== '', colFilterOn: Boolean(colFilter), favOnly, priceShown, full,
    cols: colCount || { shown: cols.length, total: columns.length }, lastColor,
  }
  const a = {
    undo: sheet.undo, redo: sheet.redo, cut, copy, paste,
    fontDown: () => setFontSize(v => Math.max(9, v - 1)), fontUp: () => setFontSize(v => Math.min(20, v + 1)),
    toggleFmt, togglePanel, clearFmt,
    /* Kéo trong bảng màu bắn sự kiện liên tục: gộp thành một bước hoàn tác cho cùng vùng chọn */
    setColor: (key, value) => { setLastColor(c => ({ ...c, [key]: value })); setFmt(`${key === 'color' ? 'Màu chữ' : 'Màu nền'} ${refLabel}`, f => ({ ...f, [key]: value }), true) },
    align: v => setFmt('Căn lề', f => ({ ...f, align: f.align === v ? undefined : v })),
    toggleWrap: () => setFmt('Xuống dòng tự động', f => ({ ...f, nowrap: !anchorFmt.nowrap })),
    toggleStats: () => setShowStats(v => !v),
    insertRow, duplicate, deleteRows, sort, importFile: () => fileRef.current && fileRef.current.click(),
    toggleFrozen: () => setFrozen(v => !v), toggleCompact: () => setCompact(v => !v),
    setZoom, zoomOut: () => setZoom(z => Math.max(30, z - 10)), fitWidth, print, download,
    toggleColFilter, toggleFav: () => setFavOnly(v => !v), togglePrice, toggleFull: onFull,
  }
  const barEditing = editing && editing.bar
  const formula = {
    ref: refLabel,
    value: editing ? editing.value : anchorEntry && anchorCol ? entryText(anchorEntry, anchorCol.key) : '',
    editable: canEdit(anchorEntry, anchorCol),
    onFocus: () => { if (!edRef.current) startEdit(A.r, A.c, undefined, true) },
    onChange: value => { if (edRef.current) setEditing({ ...edRef.current, value }) },
    onKeyDown: ev => { if (ev.key === 'Enter') { ev.preventDefault(); ev.target.blur() } else if (ev.key === 'Escape') { ev.preventDefault(); cancelEdit(); ev.target.blur() } },
    onBlur: () => { if (barEditing) commitEdit() },
  }

  return (
    <>
      <SheetToolbar s={s} a={a} formula={formula} defaultOpen={toolbarOpen} />
      <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" hidden onChange={onImport} />

      {panel && (
        <div className="qs-bd-strip">
          {panel === 'find' && (
            <>
              <span className="qs-bd-strip-label">Tìm</span>
              <input
                autoFocus className="qs-bd-strip-input" value={findQ} placeholder="Nội dung cần tìm…"
                onChange={e => { setFindQ(e.target.value); setHitIdx(0) }}
                onKeyDown={e => { if (e.key === 'Enter') goHit(e.shiftKey ? -1 : 1); else if (e.key === 'Escape') onPanel(null) }}
              />
              <span className="qs-bd-strip-note">{matches.length ? `${matches.indexOf(curHit) + 1}/${matches.length}` : findQ.trim() ? 'Không thấy' : ''}</span>
              <button className="qs-bd-strip-btn" onClick={() => goHit(-1)}>Trước</button>
              <button className="qs-bd-strip-btn" onClick={() => goHit(1)}>Sau</button>
            </>
          )}
          {panel === 'filter' && (
            <>
              <span className="qs-bd-strip-label">Lọc dòng</span>
              <input autoFocus className="qs-bd-strip-input" value={filterText} placeholder="Chỉ hiện dòng có chứa…" onChange={e => setFilterText(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') onPanel(null) }} />
              <span className="qs-bd-strip-note">{selItemsCount(flat)} dòng đang hiện</span>
              <button className="qs-bd-strip-btn" onClick={() => setFilterText('')}>Bỏ lọc</button>
            </>
          )}
          {panel === 'cols' && (
            <>
              <span className="qs-bd-strip-label">Cột hiển thị</span>
              {columns.map(c => <button key={c.key} className={`qs-bd-strip-chip${hiddenCols.has(c.key) ? '' : ' on'}`} onClick={() => toggleCol(c.key)}>{c.label}</button>)}
              <button className="qs-bd-strip-btn" onClick={() => onHiddenCols(new Set())}>Hiện tất cả</button>
            </>
          )}
          {panel === 'history' && (
            <>
              <span className="qs-bd-strip-label">Lịch sử</span>
              {!sheet.labels.length && <span className="qs-bd-strip-note">Chưa có thao tác nào.</span>}
              {sheet.labels.map((label, i) => ({ label, i })).reverse().map(({ label, i }) => (
                <button key={i} className="qs-bd-strip-chip" title="Quay về trước thao tác này" onClick={() => sheet.jumpTo(i)}>{i + 1}. {label}</button>
              ))}
            </>
          )}
          <span style={{ flex: 1 }} />
          <button className="qs-bd-strip-close" title="Đóng" onClick={() => onPanel(null)}><Icon name="x" size={15} /></button>
        </div>
      )}
      {colFilter && (
        <div className="qs-bd-strip slim">
          <span className="qs-bd-strip-note">Đang lọc {colFilter.label} = “{colFilter.value || 'trống'}”</span>
          <button className="qs-bd-strip-btn" onClick={() => setColFilter(null)}>Bỏ lọc</button>
        </div>
      )}

      <SheetGrid
        gridRef={gridRef} flat={flat} cols={cols} plain={plain} frozen={frozen} fontSize={fontSize + 1} compact={compact} zoom={zoom / 100}
        range={range} anchor={A} editing={editing} hits={hits} hitKey={curHit ? `${curHit.r}:${curHit.c}` : ''} dropMark={dropMark} flashRowId={flash && flash.mark ? flash.rowId : null}
        onCellDown={onCellDown} onCellEnter={onCellEnter} onCellDouble={(r, c) => startEdit(r, c)}
        onEditChange={value => setEditing({ ...edRef.current, value })} onEditKey={onEditKey} onEditBlur={() => commitEdit()}
        onToggleGroup={onToggleGroupOverride || (id => sheet.patch(gs => gs.map(g => (g.id === id ? { ...g, collapsed: !g.collapsed } : g))))}
        rowClass={rowClass} letters={letters}
        onSelectRow={(r, ev) => { ev.preventDefault(); if (ev.shiftKey) setSel({ a: { r: A.r, c: 0 }, f: { r, c: maxC } }); else pick({ r, c: 0 }, { r, c: maxC }); if (gridRef.current) gridRef.current.focus() }}
        onSelectCol={(c, ev) => { ev.preventDefault(); if (ev.shiftKey) setSel({ a: { r: 0, c: A.c }, f: { r: maxR, c } }); else setSel({ a: { r: 0, c }, f: { r: maxR, c } }); if (gridRef.current) gridRef.current.focus() }}
        onSelectAll={ev => { ev.preventDefault(); setSel({ a: { r: 0, c: 0 }, f: { r: maxR, c: maxC } }); if (gridRef.current) gridRef.current.focus() }}
        onKeyDown={onKeyDown} onPaste={onPaste}
      />
      {dropHint && <div className="qs-bd-drop-hint">{dropHint}</div>}
      {footer && <div className="qs-bd-foot">
        <GroupAdder existing={new Set(groupNames)} onAdd={onAddGroup} />
        <button className="qs-bd-add-row" onClick={onAddBlank}><Icon name="plus" size={16} />Thêm hạng mục<span>vào {targetName}</span></button>
      </div>}
    </>
  )
}

const selItemsCount = flat => flat.filter(e => e.type === 'item').length
