import { DONTU_CONFIG, FORM_CARDS } from '../../../data/banLamViecData'

/* Icon cho từng loại đơn (thẻ: 18px nét 1.75 — dòng lịch sử: 15px nét 2) */
export function DonTuIcon({ type, size, strokeWidth }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (type === 'xinphep') return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
  if (type === 'tamung') return <svg {...p}><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /></svg>
  return <svg {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
}

/* Tab "Đơn từ": 3 thẻ tạo đơn + lịch sử đơn từ */
export default function DonTuTab({ requests, onPickType }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, flex: 'none' }}>
        {FORM_CARDS.map(c => {
          const color = DONTU_CONFIG[c.type].color
          return (
            <div key={c.type} className="blv-form-card" onClick={() => onPickType(c.type)}>
              <div className="blv-fc-icon" style={{ background: `var(--${color}-tint)`, color: `var(--${color})` }}><DonTuIcon type={c.type} size={18} strokeWidth="1.75" /></div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{c.desc}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>Lịch sử đơn từ</h3>
        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '0 0 4px' }}>Bấm vào 1 trong 3 loại đơn phía trên để tạo đơn mới.</p>
        <div>
          {requests.map(r => {
            const color = DONTU_CONFIG[r.type].color
            return (
              <div key={r.id} className="blv-request-row">
                <div className="blv-fc-icon" style={{ width: 30, height: 30, background: `var(--${color}-tint)`, color: `var(--${color})`, flex: 'none' }}><DonTuIcon type={r.type} size={15} strokeWidth="2" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.sub}</div>
                </div>
                <div className="blv-approve-mini" title={r.approveTitle}>
                  {r.segs.map(([label, state]) => <span key={label} className={`blv-approve-seg${state ? ' ' + state : ''}`}>{label}</span>)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
