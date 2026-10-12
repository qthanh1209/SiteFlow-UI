import { useState } from 'react'
import Icon from '../../../../components/ui/Icon'
import SectionMenu from './SectionMenu'
import ColumnPresetMenu from './ColumnPresetMenu'
import { formatDong } from '../../../../data/qsBreakdownData'

/* Phần đầu bảng bóc tách: hạng mục đang bóc, kiểu bảng, tổng tiền + VAT, cấu hình cột.
   Thu gọn: chỉ còn một hàng (ẩn phần tổng tiền, đưa cấu hình cột lên cùng hàng).
   colsOpen: dải bật/tắt từng cột đang mở; colMenu: dữ liệu cho hộp "Chọn nhanh cột" (xem ColumnPresetMenu) */
export default function SheetHeader({ count, subtotal, vat, onVat, view, onView, catalogOpen, onToggleCatalog, colsShown, colsTotal, colsOpen, onToggleCols, colMenu }) {
  const [collapsed, setCollapsed] = useState(false)
  const vatAmount = subtotal * vat / 100
  const colTools = (
    <>
      <button className="qs-bd-cols-label" title={colsOpen ? 'Đóng danh sách cột' : 'Bật / tắt từng cột'} onClick={onToggleCols}>
        Cột hiển thị <span>{colsShown}/{colsTotal}</span><Icon name={colsOpen ? 'chevronUp' : 'chevronDown'} size={16} />
      </button>
      <ColumnPresetMenu {...colMenu} shown={colsShown} total={colsTotal} />
      <button className="qs-bd-round-btn" title={collapsed ? 'Mở rộng' : 'Thu gọn'} onClick={() => setCollapsed(c => !c)}><Icon name={collapsed ? 'chevronDown' : 'chevronUp'} size={14} /></button>
    </>
  )
  return (
    <div className={`qs-card qs-bd-head${collapsed ? ' collapsed' : ''}`}>
      <div className="qs-bd-head-row">
        <button className="qs-bd-icon-btn" title={catalogOpen ? 'Ẩn cột hạng mục' : 'Hiện cột hạng mục'} onClick={onToggleCatalog}><Icon name="panelLeft" size={17} /></button>
        <span className="qs-bd-h">Hạng mục đã bóc</span>
        <span className="qs-bd-count">[{count}]</span>
        <SectionMenu count={count} />
        <span style={{ flex: 1 }} />
        <div className="qs-bd-seg">
          <button className={view === 'sheet' ? 'on' : ''} title="Bảng tính" onClick={() => onView('sheet')}><Icon name="table" size={15} />Bảng tính</button>
          <button className={view === 'plain' ? 'on' : ''} title="Bảng thường" onClick={() => onView('plain')}><Icon name="listLines" size={15} />Bảng thường</button>
        </div>
        {collapsed ? <div className="qs-bd-head-cols">{colTools}</div> : (
          <div className="qs-bd-totals">
            <span className="qs-bd-muted">Chưa VAT</span><b>{formatDong(subtotal)}</b>
            <span className="qs-bd-vsep" />
            <span className="qs-bd-muted">VAT</span>
            <input className="qs-bd-vat" type="number" min="0" max="100" value={vat} onChange={e => onVat(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
            <span className="qs-bd-muted">%</span><b>{formatDong(vatAmount)}</b>
            <span className="qs-bd-vsep" />
            <span className="qs-bd-total-label">Tổng</span><b className="qs-bd-total">{formatDong(subtotal + vatAmount)}</b>
          </div>
        )}
      </div>
      {!collapsed && <div className="qs-bd-head-row second">{colTools}</div>}
    </div>
  )
}
