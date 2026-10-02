import { useState } from 'react'
import PageShell from '../../components/layout/PageShell'

const categories = ['Hành chính', 'Nhân sự', 'Kỹ thuật', 'Quy trình']

const articles = {
  'Hành chính': [
    { title: 'Quy định làm việc tại văn phòng', updated: '28/09/2026' },
    { title: 'Hướng dẫn sử dụng thiết bị văn phòng', updated: '15/08/2026' },
    { title: 'Quy trình xin nghỉ phép', updated: '10/07/2026' },
    { title: 'Chính sách công tác phí', updated: '02/06/2026' },
  ],
  'Nhân sự': [
    { title: 'Quy trình tuyển dụng nhân sự mới', updated: '25/09/2026' },
    { title: 'Chính sách đánh giá hiệu suất (KPI)', updated: '01/09/2026' },
    { title: 'Hướng dẫn onboarding nhân viên', updated: '14/08/2026' },
    { title: 'Quy định về phúc lợi và bảo hiểm', updated: '30/05/2026' },
  ],
  'Kỹ thuật': [
    { title: 'Tiêu chuẩn vẽ bản vẽ kỹ thuật', updated: '29/09/2026' },
    { title: 'Hướng dẫn sử dụng phần mềm BIM', updated: '20/09/2026' },
    { title: 'Quy trình kiểm tra chất lượng công trình', updated: '05/09/2026' },
    { title: 'Danh mục vật liệu chuẩn', updated: '18/08/2026' },
  ],
  'Quy trình': [
    { title: 'Quy trình phê duyệt hồ sơ thiết kế', updated: '30/09/2026' },
    { title: 'Quy trình mua hàng và đặt vật tư', updated: '22/09/2026' },
    { title: 'Quy trình lập báo cáo tiến độ dự án', updated: '12/09/2026' },
    { title: 'Quy trình bàn giao công trình', updated: '07/08/2026' },
  ],
}

export default function Wiki() {
  const [activeCategory, setActiveCategory] = useState('Hành chính')
  const [search, setSearch] = useState('')

  const filtered = (articles[activeCategory] || []).filter(
    (a) => a.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageShell title="Wiki" subtitle="Cẩm nang & quy trình nội bộ">
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div style={{
          width: '200px', flex: 'none', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '13px' }}>
            Danh mục
          </div>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '11px 16px', border: 'none', fontSize: '13.5px', cursor: 'pointer',
              background: activeCategory === cat ? 'var(--primary-tint)' : 'transparent',
              color: activeCategory === cat ? 'var(--primary)' : 'var(--text)',
              fontWeight: activeCategory === cat ? 700 : 400,
              borderLeft: activeCategory === cat ? '3px solid var(--primary)' : '3px solid transparent',
            }}>{cat}</button>
          ))}
        </div>

        {/* Main area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '12px', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', flex: 1 }}>{activeCategory}</span>
              <input
                placeholder="Tìm kiếm bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                  background: 'var(--surface-alt)', color: 'var(--text)', fontSize: '13px', width: '220px',
                }}
              />
              <button style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
              }}>+ Bài viết mới</button>
            </div>

            {/* Article list */}
            {filtered.map((a, i) => (
              <div key={i} style={{
                padding: '14px 20px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '12px',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'var(--primary-tint)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{a.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cập nhật lần cuối: {a.updated}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                Không tìm thấy bài viết nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
