import { RECENT_PROJECTS, TOP_BRANDS, QS_STATUS } from '../../../data/qsData'
import Kpi from './Kpi'

export default function OverviewTab({ onGoto }) {
  return (
    <>
      <div className="qs-kpi-grid">
        <Kpi label="Dự án QS" value="4" sub="2 đang bóc · 1 bản nháp · 1 hoàn tất" />
        <Kpi label="Tổng giá trị bóc tách" value="64.9 triệu" mono sub="Trên 4 dự án chiếu sáng" />
        <Kpi label="Đã xuất báo giá" value="1" color="var(--success)" badge={{ text: 'Sảnh & hành lang chung', color: 'success' }} />
        <Kpi label="Đơn mua hàng đang chờ" value="2" color="var(--finance)" sub="Cần đặt hàng trong tuần" />
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, minHeight: 0 }}>
        <div className="qs-card qs-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 className="qs-card-title">Dự án QS gần đây</h3>
            <span onClick={() => onGoto('projects')} style={{ fontSize: 12.5, color: 'var(--qs)', fontWeight: 600, cursor: 'pointer' }}>Xem tất cả ›</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {RECENT_PROJECTS.map((p, i) => {
              const st = QS_STATUS[p.status]
              return (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', ...(i < RECENT_PROJECTS.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}) }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.meta}</div>
                  </div>
                  <div className="qs-track" style={{ width: 90 }}><div style={{ width: `${p.pct}%`, background: st.bar }} /></div>
                  <span className="qs-pill" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="qs-card qs-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 className="qs-card-title">Top thương hiệu sử dụng</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TOP_BRANDS.map(b => (
              <div key={b.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span>{b.name}</span><span className="mono" style={{ color: 'var(--text-muted)' }}>{b.value}</span>
                </div>
                <div className="qs-track"><div style={{ width: `${b.pct}%`, background: 'var(--qs)' }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
