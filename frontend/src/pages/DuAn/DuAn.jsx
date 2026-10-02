import PageShell from '../../components/layout/PageShell'

const projects = [
  { name: 'Biệt thự Đông Anh – Gói hoàn thiện', phase: 'Thi công thô', pm: 'Nguyễn Văn An', pct: 65, status: 'Đúng tiến độ', color: '#27b08b' },
  { name: 'Căn hộ Sky Park tầng 12-15', phase: 'Hoàn thiện nội thất', pm: 'Trần Thị Bình', pct: 42, status: 'Chậm tiến độ', color: '#f5a623' },
  { name: 'Văn phòng Mỹ Đình Tower', phase: 'Nghiệm thu', pm: 'Lê Hoàng Cường', pct: 88, status: 'Đúng tiến độ', color: '#27b08b' },
  { name: 'Shophouse Cầu Giấy – Block B', phase: 'Thiết kế', pm: 'Phạm Minh Đức', pct: 20, status: 'Đúng tiến độ', color: '#4f8ef7' },
]

const phaseColors = {
  'Thiết kế': '#a259ff',
  'Thi công thô': '#f5a623',
  'Hoàn thiện nội thất': '#4f8ef7',
  'Nghiệm thu': '#27b08b',
}

export default function DuAn() {
  return (
    <PageShell title="Quản lý dự án" subtitle="Danh sách và tiến độ dự án thi công">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Tổng dự án', value: '4', color: '#4f8ef7' },
            { label: 'Đang thực hiện', value: '3', color: '#27b08b' },
            { label: 'Chậm tiến độ', value: '1', color: '#f5a623' },
            { label: 'Hoàn thành tháng này', value: '1', color: '#a259ff' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Project list */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Danh sách dự án</h2>
            <button style={{ padding: '7px 16px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Thêm dự án</button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {projects.map((p, i) => (
              <div key={i} style={{ padding: '16px 20px', borderBottom: i < projects.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: `${phaseColors[p.phase]}22`, color: phaseColors[p.phase], fontWeight: 600 }}>{p.phase}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PM: {p.pm}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: '4px', transition: 'width 0.4s' }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: p.color, minWidth: '34px', textAlign: 'right' }}>{p.pct}%</span>
                  </div>
                </div>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 600, background: p.status === 'Đúng tiến độ' ? '#e8f5e9' : '#fff8e1', color: p.status === 'Đúng tiến độ' ? '#27b08b' : '#f5a623', whiteSpace: 'nowrap' }}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
