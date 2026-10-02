import PageShell from '../../components/layout/PageShell'

const stats = [
  { label: 'Thiết bị online', value: '47 / 52', sub: '90% hoạt động', color: '#22c55e' },
  { label: 'Ticket đang xử lý', value: '12', sub: '3 ưu tiên cao', color: '#f59e0b' },
  { label: 'Uptime hệ thống', value: '99.8%', sub: '30 ngày qua', color: '#3b82f6' },
]

const tickets = [
  { id: 'TK-091', title: 'Máy in tầng 3 không kết nối được', priority: 'Cao', status: 'Đang xử lý', owner: 'Minh Tuấn' },
  { id: 'TK-092', title: 'Lỗi VPN khi truy cập từ xa', priority: 'Cao', status: 'Chờ phân công', owner: '—' },
  { id: 'TK-093', title: 'Cài đặt phần mềm kế toán mới', priority: 'Thường', status: 'Hoàn thành', owner: 'Lan Anh' },
  { id: 'TK-094', title: 'Bàn phím laptop bị liệt một số phím', priority: 'Thấp', status: 'Đang xử lý', owner: 'Quang Huy' },
]

function priorityColor(p) {
  if (p === 'Cao') return { bg: '#fee2e2', color: '#dc2626' }
  if (p === 'Thường') return { bg: '#fef3c7', color: '#d97706' }
  return { bg: '#f0fdf4', color: '#16a34a' }
}
function statusColor(s) {
  if (s === 'Hoàn thành') return { bg: '#f0fdf4', color: '#16a34a' }
  if (s === 'Đang xử lý') return { bg: '#eff6ff', color: '#2563eb' }
  return { bg: '#f9fafb', color: '#6b7280' }
}
const badge = (colors) => ({ fontSize: '11.5px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', background: colors.bg, color: colors.color })

export default function IT() {
  const td = { padding: '11px 14px', fontSize: '13.5px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }

  return (
    <PageShell title="IT" subtitle="Hạ tầng công nghệ & hỗ trợ kỹ thuật">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>{s.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px', color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '15px' }}>Danh sách Support Ticket</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['ID', 'Vấn đề', 'Ưu tiên', 'Trạng thái', 'Phụ trách'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-alt)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={td}><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.id}</span></td>
                <td style={td}>{t.title}</td>
                <td style={td}><span style={badge(priorityColor(t.priority))}>{t.priority}</span></td>
                <td style={td}><span style={badge(statusColor(t.status))}>{t.status}</span></td>
                <td style={{ ...td, borderBottom: 'none' }}>{t.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
