import PageShell from '../../components/layout/PageShell'

const designs = [
  { name: 'Biệt thự Đông Anh – Phòng khách', designer: 'Trần Thị Bình', stage: 'Bản vẽ kỹ thuật', pct: 75, review: 'Đang xem xét', updated: '01/10/2026' },
  { name: 'Căn hộ Sky Park – Layout tổng thể', designer: 'Nguyễn Minh Khoa', stage: 'Phê duyệt', pct: 95, review: 'Đã duyệt', updated: '30/09/2026' },
  { name: 'Văn phòng Mỹ Đình – Khu vực lễ tân', designer: 'Lê Thị Hoa', stage: 'Concept', pct: 30, review: 'Chưa gửi', updated: '02/10/2026' },
  { name: 'Shophouse Cầu Giấy – Mặt tiền', designer: 'Phạm Văn Dũng', stage: 'Bản vẽ kỹ thuật', pct: 60, review: 'Cần chỉnh sửa', updated: '28/09/2026' },
  { name: 'Nhà phố Tây Hồ – Phòng ngủ master', designer: 'Trần Thị Bình', stage: 'Concept', pct: 15, review: 'Chưa gửi', updated: '02/10/2026' },
]

const stageColors = { 'Concept': '#a259ff', 'Bản vẽ kỹ thuật': '#4f8ef7', 'Phê duyệt': '#27b08b' }
const reviewColors = {
  'Đã duyệt': { bg: '#e8f5e9', text: '#27b08b' },
  'Đang xem xét': { bg: '#fff8e1', text: '#f5a623' },
  'Cần chỉnh sửa': { bg: '#fce4ec', text: '#e91e63' },
  'Chưa gửi': { bg: '#f5f5f5', text: '#888' },
}

export default function QuanLyThietKe() {
  return (
    <PageShell title="Quản lý thiết kế" subtitle="Theo dõi tiến độ thiết kế & phê duyệt">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Stage summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {Object.entries(stageColors).map(([stage, color]) => {
            const count = designs.filter(d => d.stage === stage).length
            return (
              <div key={stage} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: color }} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800 }}>{count}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stage}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Design list */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Hạng mục thiết kế</h2>
            <button style={{ padding: '7px 16px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Thêm hạng mục</button>
          </div>
          <div>
            {designs.map((d, i) => {
              const rv = reviewColors[d.review] || reviewColors['Chưa gửi']
              const sc = stageColors[d.stage] || '#888'
              return (
                <div key={i} style={{ padding: '16px 20px', borderBottom: i < designs.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '5px' }}>{d.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: `${sc}22`, color: sc, fontWeight: 600 }}>{d.stage}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Designer: {d.designer}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>· Cập nhật: {d.updated}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${d.pct}%`, background: sc, borderRadius: '4px', transition: 'width 0.4s' }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: sc, minWidth: '34px', textAlign: 'right' }}>{d.pct}%</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 600, background: rv.bg, color: rv.text, whiteSpace: 'nowrap' }}>{d.review}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
