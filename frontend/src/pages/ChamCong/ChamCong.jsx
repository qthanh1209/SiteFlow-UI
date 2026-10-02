import PageShell from '../../components/layout/PageShell'

const stats = [
  { label: 'Có mặt',   value: 42, color: '#10b981', bg: '#d1fae5' },
  { label: 'Nghỉ phép', value: 5,  color: '#f59e0b', bg: '#fef3c7' },
  { label: 'Trễ giờ',   value: 3,  color: '#ef4444', bg: '#fee2e2' },
]

const rows = [
  { name: 'Nguyễn An',  dept: 'Kỹ thuật', checkin: '08:02', checkout: '17:30', status: 'Đúng giờ' },
  { name: 'Trần Bình',  dept: 'Thiết kế', checkin: '08:45', checkout: '17:30', status: 'Trễ giờ'  },
  { name: 'Lê Châu',    dept: 'Kinh doanh', checkin: '07:55', checkout: '17:00', status: 'Đúng giờ' },
  { name: 'Phạm Dung',  dept: 'Kế toán',  checkin: '-',     checkout: '-',      status: 'Nghỉ phép' },
  { name: 'Hoàng Ê',    dept: 'Kỹ thuật', checkin: '09:10', checkout: '18:00', status: 'Trễ giờ'  },
]

const STATUS_STYLE = {
  'Đúng giờ': { bg: '#d1fae5', color: '#059669' },
  'Trễ giờ':  { bg: '#fee2e2', color: '#dc2626' },
  'Nghỉ phép': { bg: '#fef3c7', color: '#d97706' },
}

const th = { padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 13, borderBottom: '1px solid #f0f0f0' }
const td = { padding: '12px 16px', fontSize: 14, color: '#374151' }

export default function ChamCong() {
  return (
    <PageShell title="HR · Chấm công" subtitle="Quản lý chấm công & phê duyệt">
      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {stats.map(s => (
          <div key={s.label} style={{ flex: '1 1 140px', background: s.bg, borderRadius: 10, padding: '18px 22px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: s.color, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Nhân viên', 'Phòng ban', 'Giờ vào', 'Giờ ra', 'Trạng thái'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                <td style={{ ...td, fontWeight: 500 }}>{r.name}</td>
                <td style={td}>{r.dept}</td>
                <td style={td}>{r.checkin}</td>
                <td style={td}>{r.checkout}</td>
                <td style={td}>
                  <span style={{ ...STATUS_STYLE[r.status], borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
