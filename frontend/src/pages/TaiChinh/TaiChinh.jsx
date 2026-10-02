import PageShell from '../../components/layout/PageShell'

const stats = [
  { label: 'Thu vào',  value: '₫ 142,500,000', color: '#10b981', bg: '#d1fae5', icon: '↑' },
  { label: 'Chi ra',   value: '₫ 87,300,000',  color: '#ef4444', bg: '#fee2e2', icon: '↓' },
  { label: 'Số dư',    value: '₫ 55,200,000',  color: '#6366f1', bg: '#ede9fe', icon: '=' },
]

const transactions = [
  { date: '01/10', desc: 'Thu tiền hợp đồng A',   type: 'Thu',  amount: '+₫ 50,000,000' },
  { date: '03/10', desc: 'Chi phí văn phòng Q4',   type: 'Chi',  amount: '-₫ 12,000,000' },
  { date: '05/10', desc: 'Thu phí dịch vụ tháng 9',type: 'Thu',  amount: '+₫ 28,500,000' },
  { date: '07/10', desc: 'Lương nhân viên',         type: 'Chi',  amount: '-₫ 60,000,000' },
  { date: '10/10', desc: 'Thu hợp đồng B – đợt 2', type: 'Thu',  amount: '+₫ 64,000,000' },
]

const th = { padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 13, borderBottom: '1px solid #f0f0f0' }
const td = { padding: '12px 16px', fontSize: 14, color: '#374151' }

export default function TaiChinh() {
  return (
    <PageShell title="Tài chính" subtitle="Dòng tiền & báo cáo tài chính">

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {stats.map(s => (
          <div key={s.label} style={{ flex: '1 1 160px', background: s.bg, borderRadius: 10, padding: '18px 22px' }}>
            <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginBottom: 6 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Transaction List */}
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)', overflowX: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, fontSize: 14, color: '#1f2937' }}>
          Giao dịch gần đây
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Ngày', 'Mô tả', 'Loại', 'Số tiền'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                <td style={td}>{t.date}</td>
                <td style={{ ...td, fontWeight: 500 }}>{t.desc}</td>
                <td style={td}>
                  <span style={{
                    background: t.type === 'Thu' ? '#d1fae5' : '#fee2e2',
                    color:      t.type === 'Thu' ? '#059669' : '#dc2626',
                    borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600,
                  }}>{t.type}</span>
                </td>
                <td style={{ ...td, fontWeight: 600, color: t.type === 'Thu' ? '#059669' : '#dc2626' }}>{t.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </PageShell>
  )
}
