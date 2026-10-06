import { QS_PROJECTS, QS_STATUS } from '../../../data/qsData'

export default function ProjectsTab({ onGoto }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="qs-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input type="text" placeholder="Tìm dự án QS..." />
        </div>
        <div className="qs-btn primary" style={{ padding: '9px 15px', fontSize: 13 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Tạo dự án
        </div>
      </div>

      <div className="qs-card" style={{ padding: '6px 20px' }}>
        <div className="qs-project-cols qs-grid-head">
          <span>Mã</span><span>Tên dự án</span><span>Khách hàng</span><span>Điện thoại</span><span>Địa chỉ</span><span>Ngày tạo</span><span>Tiến độ</span><span>Trạng thái</span><span></span>
        </div>
        {QS_PROJECTS.map(p => {
          const st = QS_STATUS[p.status]
          return (
            <div key={p.code} className="qs-project-cols qs-grid-row" style={{ padding: '12px 4px' }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.code}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
              <span style={{ fontSize: 12.5 }}>{p.client}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.phone}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.address}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.date}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="qs-track" style={{ flex: 1 }}><div style={{ width: `${p.pct}%`, background: st.bar }} /></div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.pct}%</span>
              </div>
              <span className="qs-pill" style={{ background: st.bg, color: st.color, justifySelf: 'start' }}>{st.label}</span>
              <span className="qs-link" onClick={p.goto ? () => onGoto(p.goto) : undefined}>Bấm để sửa ›</span>
            </div>
          )
        })}
      </div>
    </>
  )
}
