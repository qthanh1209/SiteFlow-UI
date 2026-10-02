import PageShell from '../../components/layout/PageShell'

const orders = [
  { ma: 'LX-2024-001', sanpham: 'Khung cửa nhôm A40', soluong: 120, tiendo: 75, deadline: '10/10/2024' },
  { ma: 'LX-2024-002', sanpham: 'Kính cường lực 8mm', soluong: 200, tiendo: 40, deadline: '15/10/2024' },
  { ma: 'LX-2024-003', sanpham: 'Vách ngăn văn phòng V12', soluong: 45, tiendo: 90, deadline: '08/10/2024' },
  { ma: 'LX-2024-004', sanpham: 'Cửa trượt tự động TS3', soluong: 18, tiendo: 20, deadline: '25/10/2024' },
]

function progressColor(p) {
  if (p >= 80) return '#22c55e'
  if (p >= 50) return '#f59e0b'
  return '#ef4444'
}

export default function SanXuat() {
  const th = { padding: '10px 14px', textAlign: 'left', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
  const td = { padding: '12px 14px', fontSize: '13.5px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }

  return (
    <PageShell title="Sản xuất" subtitle="Quản lý xưởng gia công & sản xuất">
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '15px' }}>Lệnh sản xuất</span>
          <span style={{ fontSize: '12px', background: 'var(--primary-tint)', color: 'var(--primary)', borderRadius: '6px', padding: '3px 10px', fontWeight: 600 }}>
            {orders.length} lệnh đang chạy
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Mã lệnh', 'Sản phẩm', 'Số lượng', 'Tiến độ', 'Deadline'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.ma} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-alt)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={td}><span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '13px' }}>{o.ma}</span></td>
                  <td style={td}>{o.sanpham}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{o.soluong.toLocaleString()}</td>
                  <td style={{ ...td, minWidth: '160px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '7px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${o.tiendo}%`, background: progressColor(o.tiendo), borderRadius: '99px', transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: progressColor(o.tiendo), width: '34px' }}>{o.tiendo}%</span>
                    </div>
                  </td>
                  <td style={td}>{o.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}
