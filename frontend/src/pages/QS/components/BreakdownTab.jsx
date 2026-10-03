import { ROOM_NAV, ROOM_BREAKDOWN } from '../../../data/qsData'

const PlusIcon = ({ size = 14, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
)

export default function BreakdownTab() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', fontWeight: 600, fontSize: 13 }}>Căn hộ mẫu tầng 1 — Riverside GĐ2</div>
          <span className="qs-pill" style={{ background: 'var(--finance-tint)', color: 'var(--finance)' }}>VAT 8%</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="qs-btn ghost">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h10M4 18h16" /></svg>
            Bộ lọc
          </div>
          <div className="qs-btn ghost"><PlusIcon />Thêm phòng</div>
          <div className="qs-btn primary"><PlusIcon stroke="#fff" />Thêm hạng mục</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 16, minHeight: 0 }}>
        <div className="qs-card qs-room-nav">
          <div style={{ fontSize: 11, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '6px 8px' }}>Danh sách phòng</div>
          {ROOM_NAV.map((r, i) => (
            <div key={r.name} className={`qs-room-item${i === 0 ? ' active' : ''}`}>
              <span>{r.name}</span>
              <span className="mono" style={i === 0 ? undefined : { color: 'var(--text-muted)' }}>{r.total}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 8, borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', border: '1px dashed var(--border)', marginTop: 4, cursor: 'pointer' }}>
            <PlusIcon size={12} />
            Thêm phòng khác
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          {ROOM_BREAKDOWN.map(room => (
            <div key={room.room} className="qs-card qs-room-card">
              <div className={`qs-room-head${room.highlight ? ' highlight' : ''}`}><span>{room.room}</span><span className="mono">{room.total}</span></div>
              {/* Bản HTML chỉ hiển thị dòng tiêu đề cột ở phòng đầu tiên */}
              {room.highlight && (
                <div className="qs-breakdown-cols" style={{ padding: '8px 16px', fontSize: 10.5, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <span>Sản phẩm</span><span>Thương hiệu</span><span>SL</span><span>Đơn giá</span><span>Thành tiền</span>
                </div>
              )}
              {room.items.map(it => (
                <div key={it.name} className="qs-breakdown-cols qs-breakdown-row">
                  <span style={{ fontSize: 13 }}>{it.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{it.brand}</span>
                  <span className="mono" style={{ fontSize: 12 }}>{it.qty}</span>
                  <span className="mono" style={{ fontSize: 12 }}>{it.price}</span>
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>{it.amount}</span>
                </div>
              ))}
            </div>
          ))}

          <div className="qs-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            <div className="qs-total-row"><span style={{ color: 'var(--text-muted)' }}>Tạm tính (5 phòng)</span><span className="mono">14.755.000 đ</span></div>
            <div className="qs-total-row"><span style={{ color: 'var(--text-muted)' }}>VAT (8%)</span><span className="mono">1.180.400 đ</span></div>
            <div className="qs-total-row" style={{ fontSize: 16, fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
              <span>Tổng cộng</span><span className="mono" style={{ color: 'var(--qs)' }}>15.935.400 đ</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
