import Icon from '../../../../components/ui/Icon'
import { FILTER_DEFS } from '../../../../data/qsBreakdownData'

/* Hộp "Bộ lọc": bật/tắt từng bộ lọc để hiện/ẩn nó trên cột sản phẩm */
export default function FilterPopover({ visible, onToggle, onClear, onClose }) {
  return (
    <div className="qs-bd-pop">
      <div className="qs-bd-pop-head">
        <span>Bộ lọc</span>
        <button className="qs-bd-pop-close" title="Đóng" onClick={onClose}><Icon name="x" size={18} /></button>
      </div>
      <div className="qs-bd-pop-body">
        <p className="qs-bd-pop-hint">Bấm tên bộ lọc để hiện / ẩn nó trên panel</p>
        {FILTER_DEFS.map(d => (
          <button key={d.key} className="qs-bd-pop-row" onClick={() => onToggle(d.key)}>
            <span>{d.label}</span>
            <span className={`qs-bd-switch${visible[d.key] ? ' on' : ''}`}><i /></span>
          </button>
        ))}
      </div>
      <div className="qs-bd-pop-foot">
        <button className="qs-modal-btn" onClick={onClear}>Xoá lọc</button>
        <button className="qs-modal-btn primary" onClick={onClose}>Xong</button>
      </div>
    </div>
  )
}
