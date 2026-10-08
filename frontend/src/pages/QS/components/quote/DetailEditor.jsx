import { useState } from 'react'
import Icon from '../../../../components/ui/Icon'
import PaintThumb from '../breakdown/PaintThumb'
import DropMenu from '../cost/DropMenu'
import { applyEdit, roman } from '../../../../data/qsBreakdownData'
import { QUOTE_COLUMNS, quoteCell, quoteId, quoteMoney } from '../../../../data/qsQuoteData'

/* Cột sửa được ngay trên bảng báo giá chi tiết (ghi thẳng vào bảng Bóc tách) */
const EDITABLE = new Set(['room', 'qty', 'discount', 'margin', 'note'])

/* Khối "Bảng tính diện tích (hệ số)": DT báo giá = Σ diện tích × hệ số, DT sử dụng = Σ diện tích */
export function AreaTable({ rows, onRows, areas }) {
  const [open, setOpen] = useState(false)
  const patch = (id, key, value) => onRows(rows.map(r => (r.id === id ? { ...r, [key]: value } : r)))
  return (
    <div className="qs-card qs-qt-card">
      <button className="qs-qt-card-head as-btn" onClick={() => setOpen(o => !o)}>
        <span className="qs-qt-card-icon"><Icon name="edit" size={15} /></span>
        <b>Bảng tính diện tích (hệ số)</b>
        <span className="qs-qt-pill">DT báo giá <b>{areas.quote}</b> m²</span>
        <span className="qs-qt-pill">DT sử dụng <b>{areas.use}</b> m²</span>
        <span style={{ flex: 1 }} />
        <span className={`qs-bd-caret${open ? ' up' : ''}`} />
      </button>
      {open && (
        <div className="qs-qt-card-body">
          <table className="qs-qt-area">
            <thead><tr><th>Khu vực / tầng</th><th className="r">Diện tích (m²)</th><th className="r">Hệ số</th><th className="r">DT quy đổi (m²)</th><th /></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td><input value={r.name} onChange={e => patch(r.id, 'name', e.target.value)} placeholder="Ví dụ: Tầng 1" /></td>
                  <td><input className="r" type="number" min="0" value={r.area} onChange={e => patch(r.id, 'area', e.target.value)} /></td>
                  <td><input className="r" type="number" min="0" step="0.1" value={r.coef} onChange={e => patch(r.id, 'coef', e.target.value)} /></td>
                  <td className="r">{Math.round((Number(r.area) || 0) * (Number(r.coef) || 0) * 100) / 100}</td>
                  <td className="c"><button className="qs-qt-del" title="Xoá dòng" onClick={() => onRows(rows.filter(x => x.id !== r.id))}><Icon name="x" size={12} /></button></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={5} className="c empty">Chưa có khu vực nào.</td></tr>}
            </tbody>
          </table>
          <button className="qs-qt-btn" onClick={() => onRows([...rows, { id: quoteId(), name: '', area: '', coef: '1' }])}><Icon name="plus" size={12} />Thêm khu vực</button>
        </div>
      )}
    </div>
  )
}

/* Khối "Bảng báo giá chi tiết": cùng dữ liệu với bảng Bóc tách, bật/tắt cột xuất và sửa nhanh vài cột */
export default function DetailEditor({ sheet, groups, scopeOptions, scope, onScope, rowCount, hidden, onToggleCol, subtotal, vat, onExcel, onPrint }) {
  const cols = QUOTE_COLUMNS.filter(c => !hidden.has(c.key))
  const edit = (rowId, key, text) => sheet.commit('Sửa trên bảng báo giá', gs => {
    const out = gs.map(g => {
      const rows = g.rows.map(r => (r.id === rowId ? applyEdit(r, key, text) : r))
      return rows.some((r, i) => r !== g.rows[i]) ? { ...g, rows } : g
    })
    return out.some((g, i) => g !== gs[i]) ? out : gs
  })
  const vatAmount = (subtotal * vat) / 100

  return (
    <div className="qs-card qs-qt-card">
      <div className="qs-qt-card-head">
        <span className="qs-qt-card-icon"><Icon name="listLines" size={15} /></span>
        <b>Bảng báo giá chi tiết</b><span className="qs-qt-sub">Đồng bộ Bóc tách</span>
        <span style={{ flex: 1 }} />
        <DropMenu className="qs-qt-btn" align="right" options={scopeOptions} value={scope} onPick={onScope}>
          <Icon name="layers" size={13} />{scopeOptions.find(o => o.key === scope).label}<span className="qs-bd-count">[{rowCount}]</span>
        </DropMenu>
        <button className="qs-qt-btn green" onClick={onExcel}><Icon name="download" size={13} />Excel</button>
        <button className="qs-qt-btn red" onClick={onPrint}><Icon name="download" size={13} />PDF / In</button>
      </div>
      <div className="qs-qt-card-body">
        <div className="qs-qt-colchips dark">
          {QUOTE_COLUMNS.map(c => <button key={c.key} className={hidden.has(c.key) ? '' : 'on'} onClick={() => onToggleCol(c.key)}>{c.label}</button>)}
        </div>
        <div className="qs-qt-detail-wrap">
          <table className="qs-qt-ed-table detail" style={{ minWidth: cols.reduce((s, c) => s + c.w, 0) }}>
            <thead>
              <tr>{cols.map(c => <th key={c.key} style={{ width: c.w }} className={c.align === 'right' ? 'r' : c.align === 'center' ? 'c' : ''}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {groups.map(({ g, gi }) => [
                <tr key={g.id} className="group"><td colSpan={cols.length}>{roman(gi)}. {g.name}</td></tr>,
                ...g.rows.map((r, ri) => (
                  <tr key={r.id}>
                    {cols.map(c => {
                      const text = quoteCell(r, c.key, `${gi + 1}.${ri + 1}`)
                      const cls = `${c.align === 'right' ? 'r' : c.align === 'center' ? 'c' : ''} k-${c.key}`
                      if (c.key === 'image') return <td key={c.key} className={cls}>{r.tone && <span className="qs-qt-thumb"><PaintThumb tone={r.tone} size={54} /></span>}</td>
                      if (c.key === 'docs') return <td key={c.key} className={cls}>{r.docs > 0 ? <span className="qs-bd-doc"><Icon name="fileText" size={12} />{r.docs}</span> : '—'}</td>
                      if (EDITABLE.has(c.key)) {
                        return (
                          <td key={c.key} className={cls}>
                            <input
                              key={`${r.id}:${c.key}:${text}`} className={c.align === 'right' ? 'r' : ''} defaultValue={text}
                              placeholder={c.key === 'room' ? 'Phòng...' : ''}
                              onBlur={e => { if (e.target.value !== text) edit(r.id, c.key, e.target.value) }}
                              onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
                            />
                          </td>
                        )
                      }
                      return <td key={c.key} className={cls}>{text}</td>
                    })}
                  </tr>
                )),
              ])}
              {!groups.length && <tr><td colSpan={cols.length} className="c empty">Chưa có hạng mục nào trong bảng Bóc tách.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="qs-qt-ed-sum">
          <div><span>Tạm tính</span><b>{quoteMoney(subtotal)} đ</b></div>
          <div><span>VAT {vat}%</span><b>{quoteMoney(vatAmount)} đ</b></div>
          <div className="grand"><span>Tổng cộng</span><b>{quoteMoney(subtotal + vatAmount)} đ</b></div>
        </div>
      </div>
    </div>
  )
}
