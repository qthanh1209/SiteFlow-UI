import { useState, useEffect, useRef } from 'react'
import Topbar from '../../components/layout/Topbar'
import './Dashboard.css'

const NEWS_POSTS = [
  {
    id: 'p1', 
    cat: 'duan', 
    pinned: true,
    author: 'Ban Giám đốc', 
    initials: 'BGĐ', 
    color: 'primary',
    time: 'Hôm nay · 08:30', 
    badge: 'DỰ ÁN MỚI',
    title: 'Khởi công dự án mới: Biệt thự Song lập Thảo Điền',
    text: 'SiteFlow chính thức khởi công dự án Biệt thự Song lập Thảo Điền — quy mô 18 căn, tổng mức đầu tư dự kiến 42 tỷ đồng. Lễ động thổ diễn ra sáng nay với sự tham dự của toàn thể ban lãnh đạo và đối tác chiến lược.',
    hasImage: true,
    likes: 142, 
    commentsCount: 38, 
    shares: 12, 
    liked: true,
    commentsList: [
      {
        id: 'c1',
        author: 'Ban Giám đốc',
        initials: 'BGĐ',
        isAuthor: true,
        text: 'Cảm ơn cả nhà đã đồng hành, dự án chính thức khởi công từ hôm nay!',
        time: '17 tuần',
      }
    ]
  },
  {
    id: 'p2', cat: 'thongbao', author: 'Hành chính', initials: 'HC', color: 'success',
    time: 'Hôm nay · 07:00', badge: 'THÔNG BÁO',
    title: 'Nghỉ lễ Quốc khánh 2/9: Văn phòng đóng cửa 2 ngày',
    text: 'Toàn công ty nghỉ lễ từ 01/09 đến hết 02/09/2026. Công trường vẫn duy trì lịch thi công bình thường.',
    likes: 26, commentsCount: 4, shares: 0,
  },
  {
    id: 'p3', cat: 'sukien', author: 'Ban Giám đốc', initials: 'BGĐ', color: 'attendance',
    time: 'Hôm qua · 16:10', badge: 'SỰ KIỆN',
    title: 'Họp toàn công ty quý 3 — 09:00 thứ Hai tuần sau',
    text: 'Tổng kết kết quả kinh doanh quý 3 và phương hướng quý 4. Địa điểm: Hội trường tầng 5.',
    likes: 51, commentsCount: 9, shares: 0,
  },
  {
    id: 'p4', cat: 'giaithuong', author: 'Truyền thông', initials: 'TT', color: 'finance',
    time: '2 ngày trước', badge: 'GIẢI THƯỞNG',
    title: 'SiteFlow đạt giải "Nhà thầu uy tín 2026"',
    text: 'Giải thưởng do Hiệp hội Xây dựng trao tặng, ghi nhận chất lượng thi công và tiến độ bàn giao đúng cam kết trong 3 năm liên tiếp.',
    likes: 210, commentsCount: 47, shares: 33,
  },
  {
    id: 'p5', cat: 'nhansu', author: 'HR', initials: 'HR', color: 'attendance',
    time: '4 ngày trước', badge: 'NHÂN SỰ',
    title: 'Chào mừng 5 thành viên mới gia nhập Đội thi công B',
    text: 'Đội thi công B chính thức bổ sung 5 nhân sự mới nhằm đáp ứng tiến độ Riverside GĐ2.',
    likes: 64, commentsCount: 15, shares: 0,
  },
]

const TASK_POINTS = [
  { name: 'Trần Anh', isMe: true, dept: 'Quản lý dự án', initials: 'TA', color: 'primary', week: 180, month: 640, quarter: 1850, year: 6200 },
  { name: 'Nguyễn Đức Anh', dept: 'Thi công', initials: 'ĐA', color: 'danger', week: 210, month: 590, quarter: 1720, year: 5800 },
  { name: 'Đặng Quốc Cường', dept: 'Kinh doanh', initials: 'QC', color: 'success', week: 165, month: 520, quarter: 1520, year: 5100 },
  { name: 'Đỗ Thảo Vy', dept: 'Marketing', initials: 'TV', color: 'attendance', week: 150, month: 470, quarter: 1380, year: 4600 },
  { name: 'Đỗ Thành Long', dept: 'Thi công', initials: 'TL', color: 'danger', week: 120, month: 410, quarter: 1230, year: 4100 },
]

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'duan', label: 'Dự án' },
  { key: 'sukien', label: 'Sự kiện' },
  { key: 'giaithuong', label: 'Giải thưởng' },
  { key: 'thongbao', label: 'Thông báo' },
  { key: 'nhansu', label: 'Nhân sự' },
]

function PostCard({ post }) {
  const [showMore, setShowMore] = useState(false)

  return (
    <div className={`post-card${post.pinned ? ' pinned' : ''}`} style={{ background: '#121824', border: '1px solid #1f293d', borderRadius: '16px', overflow: 'hidden' }}>
      {post.pinned && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 18px 4px', fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
          </svg>
          Bài viết đã ghim
        </div>
      )}

      <div className="post-card-inner">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', border: '1.5px solid #3b82f6', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
              {post.initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#f8fafc' }}>{post.author}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                <span>{post.time}</span>
                <span>·</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
        </div>

        {/* Body Text */}
        <div style={{ padding: '0 18px 12px' }}>
          {post.title && <div style={{ fontWeight: 800, fontSize: '15px', color: '#f1f5f9', marginBottom: '6px' }}>{post.title}</div>}
          <div style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#cbd5e1' }}>
            {post.text} {!showMore && <span onClick={() => setShowMore(true)} style={{ fontWeight: 700, cursor: 'pointer', color: '#f1f5f9' }}>Xem thêm</span>}
          </div>
        </div>

        {/* Media Banner */}
        {post.hasImage && (
          <div style={{ width: '100%', height: '280px', background: '#5d87d8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
              <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
            </svg>
          </div>
        )}

        {/* Reactions count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px', borderBottom: '1px solid #1e293b', fontSize: '12.5px', color: '#94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#3b82f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="#fff"><path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
            </span>
            <span>{post.likes}</span>
          </div>
          <div>
            <span>{post.commentsCount || 0} bình luận</span>
            {post.shares > 0 && <span> · {post.shares} chia sẻ</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '4px 12px', borderBottom: post.commentsList ? '1px solid #1e293b' : 'none' }}>
          <button style={{ background: 'transparent', border: 'none', color: post.liked ? '#60a5fa' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
            Thích
          </button>
          <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            Bình luận
          </button>
          <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Chia sẻ
          </button>
        </div>

        {/* Comments Section */}
        {post.commentsList && (
          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#94a3b8', cursor: 'pointer' }}>Xem thêm bình luận</div>
            {post.commentsList.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e293b', border: '1.5px solid #3b82f6', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', flex: 'none' }}>
                  {c.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ background: '#1e2634', borderRadius: '14px', padding: '9px 13px', display: 'inline-block', maxWidth: '90%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>{c.author}</span>
                      {c.isAuthor && <span style={{ background: '#334155', color: '#cbd5e1', fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Tác giả</span>}
                    </div>
                    <div style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '3px', lineHeight: 1.4 }}>{c.text}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: '#64748b', marginTop: '4px', paddingLeft: '6px', fontWeight: 600 }}>
                    <span>{c.time}</span>
                    <span style={{ cursor: 'pointer', color: '#94a3b8' }}>Thích</span>
                    <span style={{ cursor: 'pointer', color: '#94a3b8' }}>Phản hồi</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Comment Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e293b', border: '1.5px solid #64748b', color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', flex: 'none' }}>
                TA
              </div>
              <div style={{ flex: 1, background: '#1e2634', borderRadius: '20px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Bình luận dưới tên Trần Anh..." 
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: '12.5px' }} 
                />
                <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                </button>
                <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DezBot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const logRef = useRef(null)

  function sendMessage(text) {
    text = text.trim()
    if (!text) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: 'Mình đang tra dữ liệu workspace — tính năng AI sẽ được kết nối ở phiên bản tiếp theo.' }])
    }, 400)
  }

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages])

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid var(--border)', flex: 'none' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <defs><linearGradient id="dezbotGrad" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#2FA3E6"/><stop offset="1" stopColor="#8B5CF6"/></linearGradient></defs>
            <path d="M4 12.5a8 8 0 0 1 16 0" fill="none" stroke="url(#dezbotGrad)" strokeWidth="1.8" strokeLinecap="round"/>
            <rect x="2" y="11.3" width="3.1" height="6.2" rx="1.55" fill="url(#dezbotGrad)"/>
            <rect x="18.9" y="11.3" width="3.1" height="6.2" rx="1.55" fill="url(#dezbotGrad)"/>
            <path d="M7.3 7.6h9.4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-4.1l-2.6 2.4v-2.4H7.3a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" fill="url(#dezbotGrad)"/>
          </svg>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ fontSize: '13.5px', fontWeight: 800 }}>Dezbot</h3>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Trợ lý AI · hỏi dữ liệu hệ thống</div>
        </div>
        <button onClick={() => setMessages([])} style={{ border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-muted)', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      <div ref={logRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>Hỏi mình về tiến độ, chấm công, dòng tiền, khách hàng — mình đọc trực tiếp dữ liệu trong workspace.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Tiến độ', 'Chấm công', 'Dòng tiền', 'Khách hàng'].map(t => (
                <button key={t} onClick={() => sendMessage(t)} className="embed-chip">{t}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role}`}>{m.text}</div>
        ))}
      </div>
      <div style={{ flex: 'none', padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-alt)', borderRadius: '20px', padding: '6px 6px 6px 14px' }}>
          <input
            type="text"
            placeholder="Hỏi Dezbot..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: '12.5px', color: 'var(--text)' }}
          />
          <button onClick={() => sendMessage(input)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('tintuc')
  const [filter, setFilter] = useState('all')
  // Mặc định chọn "Năm nay" (year) khớp như hình mẫu
  const [rankPeriod, setRankPeriod] = useState('year')
  const [postContent, setPostContent] = useState('')

  const filteredPosts = NEWS_POSTS.filter(p => filter === 'all' || p.cat === filter)
  const ranked = [...TASK_POINTS].sort((a, b) => b[rankPeriod] - a[rankPeriod])

  // Lấy Top 3 theo thứ tự bục vinh danh: Hạng 2 (trái) - Hạng 1 (giữa) - Hạng 3 (phải)
  const first = ranked[0]
  const second = ranked[1]
  const third = ranked[2]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar title="Newsfeed" subtitle="Tin tức & cập nhật nội bộ Dezon" />

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '26px 28px', display: 'flex', gap: '20px', alignItems: 'stretch' }}>
        {/* Feed column */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '20px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[{ key: 'tintuc', label: 'Tin tức' }, { key: 'nhiemvu', label: 'Nhiệm vụ' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`newsfeed-tab${activeTab === tab.key ? ' active' : ''}`}>{tab.label}</button>
            ))}
          </div>

          {activeTab === 'tintuc' && (
            <>
              {/* Header Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'var(--primary-tint)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: 800 }}>Tin tức &amp; cập nhật công ty</h2>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Cập nhật hàng ngày: dự án mới, sự kiện, giải thưởng và thông báo nội bộ.</p>
                </div>
              </div>

              {/* KHUNG TẠO BÀI VIẾT (Khớp 100% theo ảnh mẫu) */}
              <div
                style={{
                  background: '#121824',
                  border: '1px solid #1f293d',
                  borderRadius: '16px',
                  padding: '16px 20px 14px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                {/* Hàng trên: Avatar TA & Ô input viên thuốc */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      border: '1.5px solid #2563eb',
                      background: '#131e33',
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px',
                      flexShrink: 0,
                      letterSpacing: '0.5px',
                    }}
                  >
                    TA
                  </div>

                  <input
                    type="text"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Bạn có tin gì muốn chia sẻ?"
                    style={{
                      flex: 1,
                      height: '44px',
                      background: '#192233',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '0 22px',
                      color: '#f8fafc',
                      fontSize: '13.5px',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Đường kẻ ngang phân cách mỏng */}
                <div style={{ height: '1px', background: '#1e293d', width: '100%' }} />

                {/* Hàng dưới: Ảnh/Video - Sự kiện - Nút Đăng tin */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                      paddingRight: '24px',
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        fontFamily: 'inherit',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="3" ry="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                      <span>Ảnh/Video</span>
                    </button>

                    <button
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        padding: '6px 12px',
                        fontFamily: 'inherit',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="3" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>Sự kiện</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    style={{
                      background: '#4f8ef7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '9px 22px',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      boxShadow: '0 2px 8px rgba(79, 142, 247, 0.25)',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Đăng tin</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {FILTERS.map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)} className={`news-filter${filter === f.key ? ' active' : ''}`}>{f.label}</button>
                ))}
              </div>

              {/* Posts */}
              {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
            </>
          )}

          {/* TAB BẢNG XẾP HẠNG NHIỆM VỤ (CHUẨN GIAO DIỆN THEO ẢNH) */}
          {activeTab === 'nhiemvu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Tiêu đề & Icon Huy chương */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: '#352912', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Bảng xếp hạng nhiệm vụ</h2>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '3px 0 0' }}>Xếp hạng nhân sự theo điểm thưởng tích lũy từ hoàn thành nhiệm vụ.</p>
                </div>
              </div>

              {/* Bộ lọc thời gian (Tuần này, Tháng này, Quý này, Năm nay) */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { key: 'week', label: 'Tuần này' },
                  { key: 'month', label: 'Tháng này' },
                  { key: 'quarter', label: 'Quý này' },
                  { key: 'year', label: 'Năm nay' }
                ].map(p => {
                  const isActive = rankPeriod === p.key
                  return (
                    <button
                      key={p.key}
                      onClick={() => setRankPeriod(p.key)}
                      style={{
                        padding: '7px 18px',
                        borderRadius: '20px',
                        border: isActive ? '1px solid #b45309' : '1px solid transparent',
                        background: isActive ? '#644315' : '#192130',
                        color: isActive ? '#fef08a' : '#94a3b8',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>

              {/* BỤC VINH DANH TOP 3 (PODIUM CARDS) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.08fr 1fr', gap: '14px', alignItems: 'stretch' }}>
                {/* Hạng #2 (Bên trái) */}
                {second && (
                  <div
                    style={{
                      background: '#121824',
                      border: '1px solid #1e2638',
                      borderRadius: '16px',
                      padding: '24px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Huy hiệu #2 */}
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#94a3b8',
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '14px',
                        marginBottom: '14px',
                      }}
                    >
                      #2
                    </div>

                    {/* Avatar ĐA */}
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: '#3f1d1d',
                        color: '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '14px',
                        marginBottom: '12px',
                      }}
                    >
                      {second.initials}
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#f8fafc', marginBottom: '4px', textAlign: 'center' }}>
                      {second.name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '14px', textAlign: 'center' }}>
                      {second.dept}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '17px', color: '#fbbf24' }}>
                      {second[rankPeriod].toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                )}

                {/* Hạng #1 (Chính giữa - Nổi bật viền vàng) */}
                {first && (
                  <div
                    style={{
                      background: '#121824',
                      border: '1.5px solid #d97706',
                      borderRadius: '16px',
                      padding: '24px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: '0 0 20px rgba(217, 119, 6, 0.12)',
                    }}
                  >
                    {/* Huy hiệu #1 vàng */}
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#f59e0b',
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '14px',
                        marginBottom: '14px',
                      }}
                    >
                      #1
                    </div>

                    {/* Avatar TA */}
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: '#1e293b',
                        border: '1.5px solid #2563eb',
                        color: '#60a5fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '14px',
                        marginBottom: '12px',
                      }}
                    >
                      {first.initials}
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '15.5px', color: '#ffffff', marginBottom: '4px', textAlign: 'center' }}>
                      {first.name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '14px', textAlign: 'center' }}>
                      {first.dept}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: '#fbbf24' }}>
                      {first[rankPeriod].toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                )}

                {/* Hạng #3 (Bên phải) */}
                {third && (
                  <div
                    style={{
                      background: '#121824',
                      border: '1px solid #1e2638',
                      borderRadius: '16px',
                      padding: '24px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Huy hiệu #3 đồng */}
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#c2410c',
                        color: '#fef08a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '14px',
                        marginBottom: '14px',
                      }}
                    >
                      #3
                    </div>

                    {/* Avatar QC */}
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: '#133529',
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '14px',
                        marginBottom: '12px',
                      }}
                    >
                      {third.initials}
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#f8fafc', marginBottom: '4px', textAlign: 'center' }}>
                      {third.name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '14px', textAlign: 'center' }}>
                      {third.dept}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '17px', color: '#fbbf24' }}>
                      {third[rankPeriod].toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                )}
              </div>

              {/* BẢNG CHI TIẾT DANH SÁCH XẾP HẠNG */}
              <div
                style={{
                  background: '#121824',
                  border: '1px solid #1e2638',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  overflow: 'hidden',
                }}
              >
                {/* Header Bảng */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 1.8fr 1.4fr 1fr',
                    padding: '8px 12px 14px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.6px',
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  <span>Hạng</span>
                  <span>Nhân sự</span>
                  <span>Phòng ban</span>
                  <span style={{ textAlign: 'right', paddingRight: '12px' }}>Điểm</span>
                </div>

                {/* Danh sách các dòng */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {ranked.map((p, i) => {
                    const isMe = p.isMe
                    return (
                      <div
                        key={p.name}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '70px 1.8fr 1.4fr 1fr',
                          alignItems: 'center',
                          padding: '12px 12px',
                          borderRadius: '8px',
                          background: isMe ? '#18243b' : 'transparent',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* Cột Hạng */}
                        <span style={{ fontWeight: 800, fontSize: '14px', color: isMe ? '#93c5fd' : '#94a3b8' }}>
                          #{i + 1}
                        </span>

                        {/* Cột Nhân sự */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              background:
                                p.color === 'primary' ? '#172554' :
                                p.color === 'danger' ? '#450a0a' :
                                p.color === 'success' ? '#052e16' : '#2e1065',
                              color:
                                p.color === 'primary' ? '#60a5fa' :
                                p.color === 'danger' ? '#f87171' :
                                p.color === 'success' ? '#4ade80' : '#c084fc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '11.5px',
                              flexShrink: 0,
                            }}
                          >
                            {p.initials}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#f8fafc' }}>
                            {p.name} {isMe && <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: '12.5px', marginLeft: '3px' }}>(Bạn)</span>}
                          </span>
                        </div>

                        {/* Cột Phòng ban */}
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                          {p.dept}
                        </span>

                        {/* Cột Điểm */}
                        <span
                          style={{
                            fontSize: '13.5px',
                            fontWeight: 800,
                            color: '#fbbf24',
                            textAlign: 'right',
                            paddingRight: '12px',
                            letterSpacing: '0.3px',
                          }}
                        >
                          {p[rankPeriod].toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dezbot panel */}
        <div style={{ width: '320px', flex: 'none', display: 'flex', flexDirection: 'column' }}>
          <DezBot />
        </div>
      </div>
    </div>
  )
}