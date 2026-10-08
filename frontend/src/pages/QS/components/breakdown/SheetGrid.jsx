import { useEffect, useState } from 'react'
import Icon from '../../../../components/ui/Icon'
import PaintThumb from './PaintThumb'
import { ROW_NUM_WIDTH, colLetter, entryText, roman } from '../../../../data/qsBreakdownData'

/* Kiểu chữ / màu / căn lề đã định dạng của một ô */
function fmtStyle(f) {
  if (!f) return undefined
  return {
    fontWeight: f.b ? 700 : undefined,
    fontStyle: f.i ? 'italic' : undefined,
    textDecoration: f.u ? 'underline' : undefined,
    color: f.color || undefined,
    backgroundColor: f.bg || undefined,
    textAlign: f.align || undefined,
    ...(f.nowrap ? { whiteSpace: 'nowrap', textOverflow: 'ellipsis' } : null),
  }
}

/* Lưới bảng bóc tách. flat: các dòng đang hiện (flattenSheet); cols: các cột đang hiện.
   plain = "Bảng thường": ẩn hàng chữ cái cột và cột số dòng. Toạ độ ô (r, c) là chỉ số trong flat / cols. */
export default function SheetGrid({
  gridRef, flat, cols, plain, frozen, fontSize, compact, zoom, range, anchor, editing, hits, hitKey, dropMark, flashRowId,
  onCellDown, onCellEnter, onCellDouble, onEditChange, onEditKey, onEditBlur,
  onToggleGroup, onSelectRow, onSelectCol, onSelectAll, onKeyDown, onPaste, rowClass, letters = true,
}) {
  /* Bề rộng khung lưới (px bố cục) để giãn các cột cho vừa khung khi tổng bề rộng cột nhỏ hơn khung */
  const [boxW, setBoxW] = useState(0)
  useEffect(() => {
    const el = gridRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth))
    ro.observe(el)
    setBoxW(el.clientWidth)
    return () => ro.disconnect()
  }, [gridRef])
  const numW = plain ? 0 : ROW_NUM_WIDTH
  const baseW = cols.reduce((s, c) => s + c.w, 0)
  const stretch = baseW > 0 ? Math.max(1, (boxW / zoom - numW) / baseW) : 1
  const widths = cols.map(c => c.w * stretch)
  /* Vị trí left của các cột cố định (chỉ khi đang bật đóng băng cột) */
  let left = numW
  const pinLeft = cols.map((c, i) => { const l = left; const pin = frozen && c.pin; if (pin) left += widths[i]; return pin ? l : null })
  const lastPin = pinLeft.reduce((last, l, i) => (l === null ? last : i), -1)
  const pinStyle = i => (pinLeft[i] === null ? undefined : { left: pinLeft[i] })
  const pinClass = i => (pinLeft[i] === null ? '' : ` pin${i === lastPin ? ' pin-last' : ''}`)
  const inRange = (r, c) => r >= range.r0 && r <= range.r1 && c >= range.c0 && c <= range.c1
  const multi = range.r0 !== range.r1 || range.c0 !== range.c1
  /* Tên nhóm đặt ở cột Phòng (hoặc Tên sản phẩm nếu Phòng đang ẩn) */
  const roomCol = cols.findIndex(c => c.key === 'room')
  const nameCol = roomCol >= 0 ? roomCol : cols.findIndex(c => c.key === 'name')

  return (
    <div
      ref={gridRef}
      className={`qs-bd-grid${compact ? ' compact' : ''}${plain || !letters ? ' plain' : ''}`}
      /* Cỡ chữ riêng của bảng nhân thêm hệ số cỡ chữ chung (Cài đặt ▸ Giao diện ▸ Cỡ chữ) */
      style={{ fontSize: `calc(${fontSize}px * var(--fs, 1))` }}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
    >
      <table style={{ width: numW + baseW * stretch, minWidth: zoom === 1 ? '100%' : undefined, zoom: zoom === 1 ? undefined : zoom }}>
        <colgroup>
          {!plain && <col style={{ width: ROW_NUM_WIDTH }} />}
          {cols.map((c, i) => <col key={c.key} style={{ width: widths[i] }} />)}
        </colgroup>
        <thead>
          {!plain && letters && (
            <tr className="qs-bd-letters">
              <th className="pin corner" style={{ left: 0 }} title="Chọn tất cả" onMouseDown={onSelectAll} />
              {cols.map((c, i) => (
                <th key={c.key} className={`${pinClass(i)}${i >= range.c0 && i <= range.c1 ? ' on' : ''}`} style={pinStyle(i)} onMouseDown={e => onSelectCol(i, e)}>{colLetter(i)}</th>
              ))}
            </tr>
          )}
          <tr className="qs-bd-labels">
            {!plain && <th className="pin" style={{ left: 0 }} />}
            {cols.map((c, i) => <th key={c.key} className={pinClass(i)} style={pinStyle(i)} onMouseDown={e => onSelectCol(i, e)}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {flat.map((e, r) => {
            const isGroup = e.type === 'group'
            const isItem = e.type === 'item'
            const rowKey = isGroup ? `g:${e.g.id}` : isItem ? e.r.id : 'total'
            return (
              <tr
                key={isItem ? e.r.id : e.g.id}
                data-group={e.g.id}
                data-row={isItem ? e.r.id : undefined}
                className={`${isGroup ? 'qs-bd-group' : isItem ? 'qs-bd-row' : 'qs-bd-row qs-bd-total'}${dropMark && dropMark.key === rowKey ? ` drop-${dropMark.pos}` : ''}${isItem && e.r.id === flashRowId ? ' flash' : ''}${rowClass ? rowClass(e) : ''}`}
              >
                {!plain && (
                  <td className={`qs-bd-rownum pin${r >= range.r0 && r <= range.r1 ? ' on' : ''}`} style={{ left: 0 }} onMouseDown={ev => onSelectRow(r, ev)}>{e.n}</td>
                )}
                {cols.map((c, i) => {
                  const selected = inRange(r, i)
                  const isAnchor = anchor.r === r && anchor.c === i
                  const isEditing = editing && !editing.bar && editing.r === r && editing.c === i
                  const key = `${r}:${i}`
                  const cls = `c-${c.key}${c.align ? ` a-${c.align}` : ''}${pinClass(i)}${selected && multi ? ' in-range' : ''}${isAnchor ? ' anchor' : ''}${hits.has(key) ? (key === hitKey ? ' hit cur' : ' hit') : ''}${isGroup && i === nameCol ? ' qs-bd-group-name' : ''}`
                  const live = editing && editing.bar && editing.r === r && editing.c === i ? editing.value : null
                  let content
                  if (isEditing) {
                    content = (
                      <textarea
                        className="qs-bd-editor"
                        autoFocus
                        rows={Math.max(1, editing.value.split('\n').length)}
                        value={editing.value}
                        onChange={ev => onEditChange(ev.target.value)}
                        onKeyDown={onEditKey}
                        onBlur={onEditBlur}
                        onMouseDown={ev => ev.stopPropagation()}
                        onFocus={ev => { const n = ev.target.value.length; ev.target.setSelectionRange(n, n) }}
                      />
                    )
                  } else if (isGroup) {
                    content = c.key === 'stt'
                      ? (
                        <button className="qs-bd-group-toggle" onMouseDown={ev => ev.stopPropagation()} onClick={() => onToggleGroup(e.g.id)}>
                          <span className={`qs-bd-tri${e.g.collapsed ? ' closed' : ''}`} />{roman(e.gi)}
                        </button>
                      )
                      : i === nameCol ? (live ?? e.g.name) : (e.cells && e.cells[c.key]) || null
                  } else if (!isItem) content = entryText(e, c.key)
                  else if (c.key === 'image') content = e.r.tone && <PaintThumb tone={e.r.tone} size={62} />
                  else if (c.key === 'docs') content = e.r.docs > 0 && <span className="qs-bd-doc"><Icon name="fileText" size={13} />{e.r.docs}</span>
                  else content = live ?? entryText(e, c.key)
                  return (
                    <td
                      key={c.key}
                      data-r={r}
                      data-c={i}
                      className={cls}
                      style={{ ...pinStyle(i), ...(isItem ? fmtStyle(e.r.fmt && e.r.fmt[c.key]) : null) }}
                      onMouseDown={ev => onCellDown(r, i, ev)}
                      onMouseEnter={ev => onCellEnter(r, i, ev)}
                      onDoubleClick={() => onCellDouble(r, i)}
                    >
                      {content}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
