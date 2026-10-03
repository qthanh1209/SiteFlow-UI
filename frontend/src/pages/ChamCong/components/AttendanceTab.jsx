import { useState } from 'react'
import { SITE_SUMMARY, DAILY_ROWS, STAFF_ROWS } from '../../../data/chamCongData'

const ATT_TABS = [
  { key: 'daily', label: 'Theo ngày' },
  { key: 'staff', label: 'Theo nhân viên' },
  { key: 'approve', label: 'Duyệt ngoại vùng', badge: 1 },
]

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9" /></svg>
)

function Avatar({ initials, color, fg, size = 26, fontSize = 10 }) {
  return <span className="cc-avatar" style={{ width: size, height: size, background: `${color}22`, color: fg, fontSize }}>{initials}</span>
}

function DailyStatus({ row, onGoto }) {
  if (row.status === 'ok') return <span className="cc-pill" style={{ background: 'var(--success-tint)', color: 'var(--success)' }}>Đúng giờ</span>
  if (row.status === 'late') return <span className="cc-pill" style={{ background: 'var(--finance-tint)', color: 'var(--finance)' }}>{row.lateLabel}</span>
  if (row.status === 'none') return <span className="cc-pill" style={{ background: 'var(--surface-alt)', color: 'var(--text-muted)' }}>Chưa chấm công</span>
  return <span className="cc-pill" style={{ background: 'var(--danger)', color: '#fff', cursor: 'pointer' }} onClick={() => onGoto('approve')}>Ngoài vùng · Duyệt</span>
}

function DailyPanel({ onGoto }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="cc-day-nav-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6" /></svg></button>
          <div className="cc-day-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></svg>
            Thứ Hai, 21/09/2026
          </div>
          <button className="cc-day-nav-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6" /></svg></button>
          <div className="cc-today-chip">Hôm nay</div>
        </div>
        <div className="cc-dropdown">Tất cả công trường <ChevronDown /></div>
      </div>

      <div className="cc-kpi-grid">
        <div className="cc-card cc-kpi">
          <div className="cc-kpi-label">Tổng nhân sự hôm nay</div>
          <div className="cc-kpi-value">150</div>
          <div className="cc-kpi-sub">3 công trường hoạt động</div>
        </div>
        <div className="cc-card cc-kpi">
          <div className="cc-kpi-label">Đang có mặt</div>
          <div className="cc-kpi-value" style={{ color: 'var(--attendance)' }}>128<span className="cc-kpi-of">/150</span></div>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '3px 9px', borderRadius: 999, background: 'var(--attendance-tint)', color: 'var(--attendance)', fontSize: 11.5, fontWeight: 600 }}>85%</div>
        </div>
        <div className="cc-card cc-kpi">
          <div className="cc-kpi-label">Trễ / Chưa chấm công</div>
          <div className="cc-kpi-value" style={{ color: 'var(--finance)' }}>6<span className="cc-kpi-of"> / 22</span></div>
          <div className="cc-kpi-sub">Trễ · chưa chấm công</div>
        </div>
        <div className="cc-card cc-kpi">
          <div className="cc-kpi-label">Cần duyệt ngoài vùng</div>
          <div className="cc-kpi-value" style={{ color: 'var(--danger)' }}>1</div>
          <span onClick={() => onGoto('approve')} style={{ fontSize: 11.5, color: 'var(--danger)', fontWeight: 600, cursor: 'pointer' }}>Xem &amp; duyệt ngay ›</span>
        </div>
      </div>

      <div className="cc-site-grid">
        {SITE_SUMMARY.map(s => (
          <div key={s.name} className="cc-card cc-site-card" style={s.outOfZone ? { borderColor: 'var(--danger)' } : undefined}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={`var(--${s.color})`} strokeWidth="1.6" style={{ flex: 'none' }}>
              <circle cx="12" cy="10" r="7" strokeDasharray="2 2" />
              <path d="M12 7c-2 0-3.5 1.5-3.5 3.5 0 2.5 3.5 6 3.5 6s3.5-3.5 3.5-6C15.5 8.5 14 7 12 7z" fill={`var(--${s.color})`} stroke="none" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.name}</div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.present}</div>
            </div>
            {s.outOfZone && <span style={{ padding: '3px 8px', borderRadius: 999, background: 'var(--danger-tint)', color: 'var(--danger)', fontSize: 10.5, fontWeight: 700 }}>{s.outOfZone}</span>}
          </div>
        ))}
      </div>

      <div className="cc-card" style={{ padding: '6px 20px 14px', flex: 1 }}>
        <div className="cc-grid cc-daily-cols cc-grid-head">
          <span>Nhân viên</span><span>Đội / Vai trò</span><span>Địa điểm</span><span>Giờ vào</span><span>Giờ ra</span><span>Tổng giờ</span><span>Trạng thái</span>
        </div>
        {DAILY_ROWS.map((r, i) => (
          <div
            key={r.name}
            className="cc-grid cc-daily-cols cc-grid-row cc-daily-row"
            style={{
              ...(i === DAILY_ROWS.length - 1 ? { borderBottom: 'none' } : {}),
              ...(r.status === 'outzone' ? { background: 'var(--danger-tint)' } : {}),
            }}
          >
            <span className="cc-person"><Avatar {...r} />{r.name}</span>
            <span className="cc-cell cc-muted">{r.team}</span>
            <span className="cc-cell cc-muted">{r.site}</span>
            <span className="mono cc-cell" style={r.in ? undefined : { color: 'var(--text-muted)' }}>{r.in || '—'}</span>
            <span className="mono cc-cell cc-muted">—</span>
            <span className="mono cc-cell" style={r.total ? undefined : { color: 'var(--text-muted)' }}>{r.total || '—'}</span>
            <DailyStatus row={r} onGoto={onGoto} />
          </div>
        ))}
        <div style={{ padding: '10px 4px 0', fontSize: 11, color: 'var(--text-muted)' }}>* Đang trong ca làm việc, giờ tính đến thời điểm hiện tại. Hiển thị 10/150 nhân sự.</div>
      </div>
    </>
  )
}

function StaffPanel() {
  return (
    <>
      <div className="cc-row-between">
        <div style={{ position: 'relative', width: 280 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input type="text" placeholder="Tìm nhân viên..." style={{ width: '100%', padding: '8px 10px 8px 30px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)', fontSize: 12.5 }} />
        </div>
        <div className="cc-dropdown">Tuần này (15–21/09) <ChevronDown /></div>
      </div>

      <div className="cc-card cc-table pb14">
        <div className="cc-grid cc-staff-cols cc-grid-head">
          <span>Nhân viên</span><span>Đội</span><span>Ngày công</span><span>Tổng giờ</span><span>TB giờ / ngày</span><span></span>
        </div>
        {STAFF_ROWS.map(r => (
          <div key={r.name} className="cc-grid cc-staff-cols cc-grid-row">
            <span className="cc-person"><Avatar {...r} />{r.name}</span>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{r.team}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 60, height: 6, borderRadius: 4, background: 'var(--surface-alt)' }}>
                <div style={{ width: `${r.days / 5 * 100}%`, height: '100%', borderRadius: 4, background: r.days === 5 ? 'var(--success)' : 'var(--finance)' }} />
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.days}/5</span>
            </div>
            <span className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>{r.total}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.avg}</span>
            <span className="cc-link">Lịch sử ›</span>
          </div>
        ))}
      </div>
    </>
  )
}

function ApprovePanel() {
  return (
    <>
      <div className="cc-card" style={{ borderColor: 'var(--danger)', padding: '18px 20px', display: 'flex', gap: 18 }}>
        <svg width="130" height="110" viewBox="0 0 354 150" style={{ borderRadius: 10, flex: 'none' }} role="img" aria-label="Bản đồ: vị trí chấm công nằm ngoài vòng tròn geofence cho phép">
          <rect x="0" y="0" width="354" height="150" fill="#FBEBE9" />
          <line x1="0" y1="40" x2="354" y2="30" stroke="#FFFFFF" strokeWidth="6" />
          <line x1="0" y1="115" x2="354" y2="128" stroke="#FFFFFF" strokeWidth="8" />
          <circle cx="150" cy="78" r="55" fill="none" stroke="#0E8A82" strokeWidth="1.6" strokeDasharray="4 4" />
          <path d="M150 55c-9 0-16 7-16 16 0 12 16 27 16 27s16-15 16-27c0-9-7-16-16-16z" fill="#0E8A82" />
          <circle cx="150" cy="71" r="5.5" fill="#FBEBE9" />
          <circle cx="255" cy="88" r="8" fill="#C0392B" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="150" y1="78" x2="255" y2="88" stroke="#C0392B" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="cc-row-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="cc-avatar" style={{ width: 34, height: 34, background: '#C0392B22', color: 'var(--danger)', fontSize: 12 }}>CT</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Cao Nhật Tân</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mua hàng · Kho vật tư Bình Chánh</div>
              </div>
            </div>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hôm nay, 07:10</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--danger)', background: 'var(--danger-tint)', borderRadius: 8, padding: '8px 10px' }}>
            Vị trí chấm công cách tâm công trường <strong>180m</strong>, vượt quá bán kính cho phép <strong>100m</strong>.
          </div>
          <textarea placeholder="Ghi chú duyệt (không bắt buộc)..." style={{ width: '100%', minHeight: 44, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 12.5, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Từ chối</button>
            <button style={{ border: 'none', background: 'var(--success)', color: '#fff', padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,12 9,17 20,6" /></svg>
              Duyệt chấm công
            </button>
          </div>
        </div>
      </div>

      <div className="cc-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Đã xử lý gần đây</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <span className="cc-avatar" style={{ background: '#1E8E5A22', color: 'var(--success)' }}>NL</span>
          <span style={{ flex: 1, fontSize: 13 }}>Nguyễn Văn Long — Kho vật tư Bình Chánh</span>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Duyệt bởi Trần Anh · hôm qua</span>
          <span className="cc-pill" style={{ background: 'var(--success-tint)', color: 'var(--success)' }}>Đã duyệt</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
          <span className="cc-avatar" style={{ background: '#C0392B22', color: 'var(--danger)' }}>DK</span>
          <span style={{ flex: 1, fontSize: 13 }}>Đỗ Văn Kiên — Riverside Tòa B</span>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Từ chối bởi Trần Anh · 18/09</span>
          <span className="cc-pill" style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>Từ chối</span>
        </div>
      </div>
    </>
  )
}

export default function AttendanceTab() {
  const [tab, setTab] = useState('daily')
  const show = key => ({ display: tab === key ? 'flex' : 'none', flexDirection: 'column', gap: 16 })

  return (
    <>
      <div className="cc-tabs-row">
        {ATT_TABS.map(t => (
          <button key={t.key} className={`cc-att-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}{t.badge && <span className="cc-tab-badge">{t.badge}</span>}
          </button>
        ))}
      </div>

      <div className="cc-scroll">
        <div style={show('daily')}><DailyPanel onGoto={setTab} /></div>
        <div style={show('staff')}><StaffPanel /></div>
        <div style={show('approve')}><ApprovePanel /></div>
      </div>
    </>
  )
}
