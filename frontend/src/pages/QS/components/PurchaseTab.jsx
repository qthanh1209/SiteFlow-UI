import { Link } from 'react-router-dom'
import { PURCHASE_ORDERS, PO_STATUS } from '../../../data/qsData'
import Kpi from './Kpi'

export default function PurchaseTab() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link to="/mua-hang" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--qs)', textDecoration: 'none', fontWeight: 600 }}>
          Xem đầy đủ tại trang Mua hàng ›
        </Link>
      </div>

      <div className="qs-kpi-grid">
        <Kpi label="Tổng đơn mua hàng" value="5" />
        <Kpi label="Chưa đặt" value="2" color="var(--text-muted)" />
        <Kpi label="Đã đặt" value="2" color="var(--primary)" />
        <Kpi label="Tổng giá trị" value="11.93 triệu" mono color="var(--success)" />
      </div>

      <div className="qs-card" style={{ padding: '6px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 4px' }}>
          <div className="qs-btn primary" style={{ padding: '8px 14px', fontSize: 13 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Tạo đơn mua hàng
          </div>
        </div>
        <div className="qs-po-cols qs-grid-head" style={{ padding: '8px 4px' }}>
          <span>Mã PO</span><span>Nhà cung cấp</span><span>Số mặt hàng</span><span>Tổng giá trị</span><span>Ngày giao dự kiến</span><span>Trạng thái</span>
        </div>
        {PURCHASE_ORDERS.map(po => {
          const st = PO_STATUS[po.status]
          return (
            <div key={po.code} className="qs-po-cols qs-grid-row" style={{ padding: '11px 4px' }}>
              <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{po.code}</span>
              <span style={{ fontSize: 12.5 }}>{po.supplier}</span>
              <span className="mono" style={{ fontSize: 12 }}>{po.items}</span>
              <span className="mono" style={{ fontSize: 12.5 }}>{po.total}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{po.date}</span>
              <span className="qs-pill" style={{ background: st.bg, color: st.color, justifySelf: 'start' }}>{st.label}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}
