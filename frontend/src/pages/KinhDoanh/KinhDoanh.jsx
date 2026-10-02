import PageShell from '../../components/layout/PageShell'

const columns = [
  {
    title: 'Tiếp cận',
    color: '#4f8ef7',
    deals: [
      { name: 'Biệt thự Đông Anh', client: 'Ông Tuấn Anh', value: '4.5 tỷ', date: '28/09' },
      { name: 'Căn hộ Tây Hồ T12', client: 'Bà Minh Châu', value: '1.8 tỷ', date: '01/10' },
      { name: 'Văn phòng Mỹ Đình', client: 'Cty ABC Corp', value: '2.1 tỷ', date: '02/10' },
    ],
  },
  {
    title: 'Đàm phán',
    color: '#f5a623',
    deals: [
      { name: 'Nhà phố Cầu Giấy', client: 'Ông Hải Đăng', value: '3.2 tỷ', date: '15/09' },
      { name: 'Shophouse Q. Đống Đa', client: 'Bà Lan Anh', value: '5.6 tỷ', date: '20/09' },
    ],
  },
  {
    title: 'Chốt HĐ',
    color: '#27b08b',
    deals: [
      { name: 'Villa Hồ Tây Block A', client: 'Ông Văn Hùng', value: '9.8 tỷ', date: '10/09' },
      { name: 'Căn hộ Sky Park', client: 'Bà Thu Hương', value: '2.4 tỷ', date: '25/09' },
      { name: 'Officetel Cầu Giấy', client: 'Cty XYZ Ltd', value: '1.5 tỷ', date: '30/09' },
    ],
  },
]

export default function KinhDoanh() {
  return (
    <PageShell title="Kinh doanh" subtitle="Pipeline khách hàng & cơ hội bán hàng">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {columns.map(col => (
            <div key={col.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{col.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{col.deals.length} cơ hội</div>
              </div>
            </div>
          ))}
        </div>

        {/* Kanban board */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', alignItems: 'start' }}>
          {columns.map(col => (
            <div key={col.title}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{col.title}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{col.deals.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {col.deals.map((deal, i) => (
                  <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', borderLeft: `4px solid ${col.color}`, cursor: 'pointer' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>{deal.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{deal.client}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: col.color }}>{deal.value}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{deal.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
