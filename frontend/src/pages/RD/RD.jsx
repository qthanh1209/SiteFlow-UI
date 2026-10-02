import PageShell from '../../components/layout/PageShell'

const projects = [
  {
    title: 'Nghiên cứu keo dán kính chịu nhiệt thế hệ mới',
    status: 'Đang tiến hành',
    progress: 62,
    lead: 'TS. Nguyễn Minh Khoa',
    start: '01/06/2024',
  },
  {
    title: 'Quy trình cán kính phủ nano chống bám bẩn',
    status: 'Thử nghiệm',
    progress: 85,
    lead: 'KS. Trần Thị Hương',
    start: '15/03/2024',
  },
  {
    title: 'Hợp kim nhôm siêu nhẹ cho khung cửa cao tầng',
    status: 'Nghiên cứu cơ bản',
    progress: 28,
    lead: 'TS. Lê Văn Phúc',
    start: '10/09/2024',
  },
]

function statusStyle(s) {
  if (s === 'Thử nghiệm') return { bg: '#eff6ff', color: '#2563eb' }
  if (s === 'Đang tiến hành') return { bg: '#fef3c7', color: '#d97706' }
  return { bg: '#f0fdf4', color: '#16a34a' }
}

function progressColor(p) {
  if (p >= 80) return '#22c55e'
  if (p >= 50) return '#f59e0b'
  return '#3b82f6'
}

export default function RD() {
  return (
    <PageShell title="R&D" subtitle="Nghiên cứu vật liệu & quy trình mới">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {projects.map((p, i) => {
          const sc = statusStyle(p.status)
          return (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, lineHeight: 1.4 }}>{p.title}</h3>
                <span style={{ flexShrink: 0, fontSize: '11.5px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px', background: sc.bg, color: sc.color }}>
                  {p.status}
                </span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <span>Tiến độ</span>
                  <span style={{ fontWeight: 700, color: progressColor(p.progress) }}>{p.progress}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.progress}%`, background: progressColor(p.progress), borderRadius: '99px', transition: 'width 0.4s' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                <span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>Chủ trì: </span>{p.lead}
                </span>
                <span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>Bắt đầu: </span>{p.start}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}
