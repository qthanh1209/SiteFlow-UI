import { useState, useRef, useEffect } from 'react'
import './Chat.css'

const ME = 'Trần Anh'
const COLORS = { blue: '#2F5DA8', teal: '#0E8A82', amber: '#B7791F', purple: '#7658C2', green: '#1E8E5A', pink: '#C2618F', gray: '#5B6472' }

const INITIAL_CONVERSATIONS = [
  {
    id: 'g1', type: 'group', name: 'Riverside — Giai đoạn 2', sub: '24 thành viên', icon: 'building', color: COLORS.blue, unread: 3,
    members: [
      { name: 'Nguyễn Đức Anh', role: 'Chỉ huy trưởng', color: COLORS.blue },
      { name: 'Ngọc Hà', role: 'Đội thi công B', color: COLORS.amber },
      { name: 'Chị Hoa', role: 'Tư vấn thiết kế', color: COLORS.pink },
      { name: 'Lê Văn', role: 'Đội thi công A', color: COLORS.teal },
      { name: 'Trần Anh', role: 'Quản lý dự án (bạn)', color: COLORS.purple },
    ],
    files: [
      { name: 'Ban_ve_dien_tang2.pdf', size: '2.4 MB', kind: 'pdf' },
      { name: 'Bao_cao_tien_do_T9.xlsx', size: '860 KB', kind: 'xls' },
    ],
    images: [
      { kind: 'image', color: COLORS.blue },
      { kind: 'image', color: COLORS.teal },
      { kind: 'video', color: COLORS.amber },
      { kind: 'image', color: COLORS.purple },
    ],
    links: [
      { title: 'Bản vẽ kết cấu tầng 2 — Google Drive', domain: 'drive.google.com' },
      { title: 'Báo giá vật tư thép Hoà Phát T9/2026', domain: 'hoaphat.com.vn' },
    ],
    messages: [
      { who: 'Nguyễn Đức Anh', color: COLORS.blue, time: '08:02', text: 'Chào cả nhà, hôm nay mình tập trung đổ bê tông đài móng khu B nhé' },
      { who: 'Nguyễn Đức Anh', color: COLORS.blue, time: '08:03', text: 'Đội thi công B chuẩn bị vật tư từ 7h sáng giúp anh' },
      { who: 'Ngọc Hà', color: COLORS.amber, time: '08:15', text: 'Dạ anh, bên em đã sẵn sàng vật tư từ hôm qua rồi ạ' },
      { bot: true, level: 'danger', time: '09:40', title: 'Cảnh báo tiến độ', text: 'Đổ bê tông sàn tầng 5 đang trễ 3 ngày so với kế hoạch (đường găng).', meta: 'SiteFlow Bot · Module Tiến độ' },
      { who: 'Chị Hoa', color: COLORS.pink, time: '10:22', text: 'Em đã cập nhật bản vẽ điện tầng 2, mọi người xem giúp em ạ', file: { name: 'Ban_ve_dien_tang2.pdf', size: '2.4 MB' } },
      { who: ME, time: '10:25', text: 'Ok em, để anh xem qua rồi phản hồi trong chiều nay' },
      { who: ME, time: '10:26', text: 'Anh Đức Anh cho hỏi tiến độ móng khu B đến chiều nay khoảng bao nhiêu % rồi ạ?' },
      { who: 'Nguyễn Đức Anh', color: COLORS.blue, time: '10:31', text: 'Đang khoảng 45% anh ơi, chắc mai xong' },
    ]
  },
  {
    id: 'bot', type: 'bot', name: 'SiteFlow Bot', sub: 'Thông báo hệ thống', icon: 'bot', color: COLORS.gray, unread: 2,
    members: [], files: [], images: [], links: [],
    messages: [
      { bot: true, level: 'danger', time: '09:40', title: 'Cảnh báo tiến độ', text: 'Đổ bê tông sàn tầng 5 đang trễ 3 ngày so với kế hoạch (đường găng).', meta: 'Dự án: Riverside — Giai đoạn 2' },
      { bot: true, level: 'amber', time: '11:05', title: 'Chấm công ngoài vùng', text: '1 nhân sự chấm công ngoài bán kính công trường tại Kho vật tư Bình Chánh, cần giám sát duyệt.', meta: 'Module Chấm công' },
      { bot: true, level: 'danger', time: '13:20', title: 'Hoá đơn quá hạn', text: 'Hoá đơn INV-0142 (620 triệu đ) của Khách hàng ABC đã quá hạn thanh toán 5 ngày.', meta: 'Module Tài chính' },
      { bot: true, level: 'info', time: '14:00', title: 'Mốc nghiệm thu sắp tới', text: 'Còn 7 ngày đến mốc "Nghiệm thu bàn giao tầng 1" (09/11).', meta: 'Module Tiến độ' },
    ]
  },
  {
    id: 'dm1', type: 'dm', name: 'Ngọc Hà', sub: 'Đội thi công B · đang hoạt động', icon: null, color: COLORS.amber, unread: 0, online: true,
    members: [], files: [], images: [], links: [],
    messages: [
      { who: 'Ngọc Hà', color: COLORS.amber, time: 'Hôm qua', text: 'Anh ơi vật tư thép đợt 2 chắc tuần sau mới về kịp ạ' },
      { who: ME, time: 'Hôm qua', text: 'Ok em cứ báo bên mua hàng đẩy nhanh giúp anh' },
      { who: 'Ngọc Hà', color: COLORS.amber, time: '09:50', text: 'Dạ em báo cáo, tiến độ sàn tầng 4 hiện đang 45% ạ' },
      { who: 'Ngọc Hà', color: COLORS.amber, time: '09:51', text: 'Em xin thêm 2 ngày vì chờ vật tư anh nhé' },
    ]
  },
  {
    id: 'dm2', type: 'dm', name: 'Phan Bảo Ngọc', sub: 'Kế toán trưởng', icon: null, color: COLORS.green, unread: 1, online: false,
    members: [], files: [], images: [], links: [],
    messages: [
      { who: 'Phan Bảo Ngọc', color: COLORS.green, time: '11:02', text: 'Anh ơi hoá đơn INV-0142 bên khách hàng ABC vẫn chưa thanh toán ạ' },
      { who: 'Phan Bảo Ngọc', color: COLORS.green, time: '11:03', text: 'Đã quá hạn 5 ngày rồi, anh nhắc giúp em với' },
    ]
  },
  {
    id: 'g2', type: 'group', name: 'Ban chỉ huy công trường', sub: '8 thành viên', icon: 'hardhat', color: COLORS.teal, unread: 0,
    members: [
      { name: 'Nguyễn Đức Anh', role: 'Chỉ huy trưởng', color: COLORS.blue },
      { name: 'Đỗ Thành Long', role: 'Tư vấn giám sát', color: COLORS.teal },
      { name: 'Trần Anh', role: 'Quản lý dự án (bạn)', color: COLORS.purple },
    ],
    files: [], images: [], links: [],
    messages: [
      { who: 'Nguyễn Đức Anh', color: COLORS.blue, time: 'Hôm qua', text: 'Họp giao ban 8h sáng mai tại văn phòng công trường nhé mọi người' },
      { who: 'Đỗ Thành Long', color: COLORS.teal, time: 'Hôm qua', text: 'Rõ anh, em chuẩn bị báo cáo giám sát' },
    ]
  },
  {
    id: 'dm3', type: 'dm', name: 'Lê Văn', sub: 'Đội thi công A', icon: null, color: COLORS.teal, unread: 0, online: false,
    members: [], files: [], images: [], links: [],
    messages: [
      { who: ME, time: 'Hôm qua', text: 'Móng đài cọc xong chưa em?' },
      { who: 'Lê Văn', color: COLORS.teal, time: 'Hôm qua', text: 'Vâng anh, móng đã xong 100% rồi ạ' },
    ]
  },
  {
    id: 'g3', type: 'group', name: 'Đội thi công B', sub: '12 thành viên', icon: 'hardhat', color: COLORS.amber, unread: 0,
    members: [
      { name: 'Ngọc Hà', role: 'Đội trưởng', color: COLORS.amber },
      { name: 'Vũ Hải Nam', role: 'Thành viên', color: COLORS.blue },
    ],
    files: [], images: [], links: [],
    messages: [
      { who: 'Vũ Hải Nam', color: COLORS.blue, time: 'Hôm qua', text: 'Vật tư về rồi mọi người ơi, ra bốc dỡ giúp' },
    ]
  },
]

const COMPANY_DIRECTORY = [
  { dept: 'Ban giám đốc (BOD)', people: [{ name: 'Phạm Quốc Việt', role: 'Tổng giám đốc', color: COLORS.blue }, { name: 'Đặng Thu Trang', role: 'Phó tổng giám đốc', color: COLORS.purple }] },
  { dept: 'Kế toán - Tài chính', people: [{ name: 'Phan Bảo Ngọc', role: 'Kế toán trưởng', color: COLORS.green }, { name: 'Vũ Thị Hạnh', role: 'Kế toán viên', color: COLORS.green }] },
  { dept: 'Hành chính - Nhân sự', people: [{ name: 'Trịnh Minh Tâm', role: 'Trưởng phòng HC-NS', color: COLORS.pink }, { name: 'Lý Ngọc Diệp', role: 'Chuyên viên tuyển dụng', color: COLORS.pink }] },
  { dept: 'Kinh doanh', people: [{ name: 'Trần Anh', role: 'Quản lý dự án', color: COLORS.purple }, { name: 'Bùi Xuân Mai', role: 'Trưởng phòng Kinh doanh', color: COLORS.amber }] },
  { dept: 'Thiết kế', people: [{ name: 'Chị Hoa', role: 'Tư vấn thiết kế', color: COLORS.pink }, { name: 'Ngô Anh Dũng', role: 'Chủ trì thiết kế', color: COLORS.blue }] },
  { dept: 'QS - Dự toán', people: [{ name: 'Hoàng Gia Bảo', role: 'Trưởng phòng QS', color: COLORS.teal }] },
  { dept: 'Thi công', people: [{ name: 'Nguyễn Đức Anh', role: 'Chỉ huy trưởng', color: COLORS.blue }, { name: 'Đỗ Thành Long', role: 'Tư vấn giám sát', color: COLORS.teal }, { name: 'Ngọc Hà', role: 'Đội trưởng thi công B', color: COLORS.amber }, { name: 'Lê Văn', role: 'Đội thi công A', color: COLORS.teal }] },
  { dept: 'Sản xuất', people: [{ name: 'Đinh Công Sơn', role: 'Quản đốc xưởng mộc', color: COLORS.amber }] },
  { dept: 'Mua hàng', people: [{ name: 'Tô Kim Ngân', role: 'Trưởng phòng Mua hàng', color: COLORS.green }] },
  { dept: 'IT', people: [{ name: 'Vương Đình Khoa', role: 'Chuyên viên IT', color: COLORS.gray }] },
  { dept: 'R&D', people: [{ name: 'Lâm Thảo My', role: 'Trưởng phòng R&D', color: COLORS.purple }] },
  { dept: 'Marketing', people: [{ name: 'Đoàn Bảo Trâm', role: 'Trưởng phòng Marketing', color: COLORS.pink }] },
]

function initials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function IconBuilding() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v18"/><path d="M6 12h12M6 8h12M6 16h12"/><path d="M10 22v-4h4v4"/></svg>
}
function IconHardhat() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18h18"/><path d="M5 18a7 7 0 0 1 14 0"/><path d="M12 8v3"/><path d="M9 4h6"/></svg>
}
function IconBot() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4"/><circle cx="9" cy="14" r="1.2" fill="#fff" stroke="none"/><circle cx="15" cy="14" r="1.2" fill="#fff" stroke="none"/></svg>
}

function ConvAvatar({ conv, size = 42 }) {
  const style = { width: size, height: size, background: conv.color }
  if (conv.type === 'dm') {
    return (
      <div className="conv-avatar round" style={style}>
        {initials(conv.name)}
        {conv.online && <span className="dot-online" />}
      </div>
    )
  }
  if (conv.type === 'bot') {
    return <div className="conv-avatar" style={style}><IconBot /></div>
  }
  return (
    <div className="conv-avatar" style={style}>
      {conv.icon === 'building' ? <IconBuilding /> : <IconHardhat />}
    </div>
  )
}

export default function Chat() {
  const [conversations, setConversations] = useState(() => INITIAL_CONVERSATIONS.map(c => ({ ...c, messages: c.messages.map(m => ({ ...m })) })))
  const [activeId, setActiveId] = useState('g1')
  const [filterTab, setFilterTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [msgInput, setMsgInput] = useState('')
  const [editingIdx, setEditingIdx] = useState(null)
  const [editText, setEditText] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiLog, setAiLog] = useState([])
  const [aiInput, setAiInput] = useState('')
  const [showDirectory, setShowDirectory] = useState(false)
  const [dirSearch, setDirSearch] = useState('')
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [amName, setAmName] = useState('')
  const [amRole, setAmRole] = useState('')
  const [amHint, setAmHint] = useState(false)

  const threadMessagesRef = useRef(null)
  const msgInputRef = useRef(null)

  const activeConv = conversations.find(c => c.id === activeId)

  useEffect(() => {
    if (threadMessagesRef.current) {
      threadMessagesRef.current.scrollTop = threadMessagesRef.current.scrollHeight
    }
  }, [activeId, activeConv?.messages?.length])

  function selectConv(id) {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c))
    setActiveId(id)
    setEditingIdx(null)
    setAddMemberOpen(false)
  }

  function togglePin(convId) {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, pinned: !c.pinned } : c))
  }

  function sendMessage() {
    if (!msgInput.trim()) return
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    setConversations(prev => prev.map(c => c.id === activeId
      ? { ...c, messages: [...c.messages, { who: ME, time, text: msgInput.trim() }] }
      : c
    ))
    setMsgInput('')
  }

  function pinMsg(idx) {
    setConversations(prev => prev.map(c => {
      if (c.id !== activeId) return c
      const msgs = c.messages.map((m, i) => i === idx ? { ...m, pinned: !m.pinned } : m)
      return { ...c, messages: msgs }
    }))
  }

  function deleteMsg(idx) {
    if (!window.confirm('Xoá tin nhắn này?')) return
    setConversations(prev => prev.map(c => {
      if (c.id !== activeId) return c
      const msgs = c.messages.filter((_, i) => i !== idx)
      return { ...c, messages: msgs }
    }))
  }

  function saveEdit(idx) {
    if (!editText.trim()) return
    setConversations(prev => prev.map(c => {
      if (c.id !== activeId) return c
      const msgs = c.messages.map((m, i) => i === idx ? { ...m, text: editText.trim(), edited: true } : m)
      return { ...c, messages: msgs }
    }))
    setEditingIdx(null)
    setEditText('')
  }

  function startEdit(idx, text) {
    setEditingIdx(idx)
    setEditText(text)
  }

  function sendAi() {
    if (!aiInput.trim()) return
    const q = aiInput.trim()
    setAiLog(prev => [...prev, { role: 'user', text: q }, { role: 'bot', text: 'Xin lỗi, tính năng AI đang được phát triển. Hãy thử lại sau.' }])
    setAiInput('')
  }

  function addMember() {
    if (!amName.trim() || !amRole.trim()) { setAmHint(true); return }
    setConversations(prev => prev.map(c => {
      if (c.id !== activeId) return c
      return { ...c, members: [...(c.members || []), { name: amName.trim(), role: amRole.trim(), color: COLORS.gray }] }
    }))
    setAmName(''); setAmRole(''); setAmHint(false); setAddMemberOpen(false)
  }

  const filteredConvs = conversations
    .filter(c => filterTab === 'all' || (filterTab === 'unread' && c.unread > 0) || (filterTab === 'group' && c.type === 'group'))
    .filter(c => !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  const pinnedMsgs = activeConv?.messages.map((m, i) => ({ m, i })).filter(x => x.m.pinned && !x.m.bot) || []

  const sharedGroups = activeConv?.type === 'dm'
    ? conversations.filter(x => x.type === 'group' && x.members?.some(m => m.name === activeConv.name))
    : []

  return (
    <>
      <div className="chat-shell">
        {/* ===== Conversation list ===== */}
        <div className="conv-list">
          <div className="conv-head">
            <div className="row1">
              <h2>Chat</h2>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="chat-icon-btn" title="Danh bạ công ty" onClick={() => setShowDirectory(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </button>
                <button className="chat-icon-btn" title="Tạo nhóm mới">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
            </div>
            <div className="search-box-chat">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" placeholder="Tìm kiếm hội thoại..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="conv-tabs">
              <button className={filterTab === 'all' ? 'active' : ''} onClick={() => setFilterTab('all')}>Tất cả</button>
              <button className={filterTab === 'group' ? 'active' : ''} onClick={() => setFilterTab('group')}>Nhóm</button>
              <button className={filterTab === 'unread' ? 'active' : ''} onClick={() => setFilterTab('unread')}>Chưa đọc</button>
            </div>
          </div>

          <div className="conv-items">
            {filteredConvs.map(conv => {
              const last = conv.messages[conv.messages.length - 1]
              const preview = last.bot ? (last.title + ': ' + last.text) : (last.who === ME ? 'Bạn: ' + last.text : last.text)
              return (
                <div key={conv.id} className={'conv-item' + (conv.id === activeId ? ' active' : '') + (conv.pinned ? ' pinned' : '')} onClick={() => selectConv(conv.id)}>
                  <ConvAvatar conv={conv} />
                  <div className="conv-body">
                    <div className="conv-top">
                      {conv.pinned && (
                        <svg className="conv-pinned-icon" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2a1 1 0 0 1 1 1v7l3 4v2H8v-2l3-4V3a1 1 0 0 1 1-1z"/></svg>
                      )}
                      <span className="conv-name">{conv.name}</span>
                      <span className="conv-time">{last.time}</span>
                    </div>
                    <div className="conv-bottom">
                      <span className="conv-preview">{preview}</span>
                      {conv.unread > 0 && <span className="conv-unread">{conv.unread}</span>}
                    </div>
                  </div>
                  <button type="button" className="conv-pin-btn" title={conv.pinned ? 'Bỏ ghim' : 'Ghim hội thoại'} onClick={e => { e.stopPropagation(); togglePin(conv.id) }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={conv.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a1 1 0 0 1 1 1v7l3 4v2H8v-2l3-4V3a1 1 0 0 1 1-1z"/><line x1="12" y1="17" x2="12" y2="22"/></svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ===== Thread ===== */}
        <div className="thread">
          {/* Thread head */}
          <div className="thread-head">
            {activeConv && (
              <>
                {activeConv.type === 'dm' ? (
                  <div className="t-avatar round" style={{ background: activeConv.color }}>{initials(activeConv.name)}</div>
                ) : activeConv.type === 'bot' ? (
                  <div className="t-avatar" style={{ background: activeConv.color }}><IconBot /></div>
                ) : (
                  <div className="t-avatar" style={{ background: activeConv.color }}>
                    {activeConv.icon === 'building' ? <IconBuilding /> : <IconHardhat />}
                  </div>
                )}
                <div>
                  <div className="t-name">{activeConv.name}</div>
                  <div className="t-sub">{activeConv.sub}</div>
                </div>
                <div className="thread-actions">
                  <button className="chat-icon-btn" title="Tìm trong hội thoại">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                  </button>
                  <button className="chat-icon-btn" title="Gọi thoại">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.4c1 .4 2 .6 3 .7a2 2 0 0 1 1.6 2z"/></svg>
                  </button>
                  {activeConv.type === 'group' && (
                    <div style={{ position: 'relative' }}>
                      <button className="chat-icon-btn" title="Thêm người vào nhóm" onClick={() => setAddMemberOpen(v => !v)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      </button>
                      {addMemberOpen && (
                        <div className="pjm-popover" onClick={e => e.stopPropagation()}>
                          <div className="pjm-title">Thêm người vào nhóm</div>
                          <input type="text" placeholder="Họ tên" value={amName} onChange={e => setAmName(e.target.value)} />
                          <input type="text" placeholder="Vai trò trong nhóm (bắt buộc)" value={amRole} onChange={e => setAmRole(e.target.value)} />
                          {amHint && <div className="pjm-hint">Vui lòng nhập đầy đủ họ tên và vai trò</div>}
                          <div className="pjm-actions">
                            <button className="pjm-btn" onClick={() => { setAddMemberOpen(false); setAmName(''); setAmRole(''); setAmHint(false) }}>Huỷ</button>
                            <button className="pjm-btn primary" onClick={addMember}>Thêm</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Pinned bar */}
          {pinnedMsgs.length > 0 && (
            <div className="pinned-bar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ flex: 'none' }}><path d="M12 2a1 1 0 0 1 1 1v7l3 4v2H8v-2l3-4V3a1 1 0 0 1 1-1z"/></svg>
              {pinnedMsgs.map(({ m, i }) => (
                <div key={i} className="pin-chip">
                  {m.text.slice(0, 40)}{m.text.length > 40 ? '…' : ''}
                  <button onClick={() => pinMsg(i)} title="Bỏ ghim">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="thread-messages" ref={threadMessagesRef}>
            <div className="date-divider">Hôm nay</div>
            {activeConv?.messages.map((m, idx) => {
              if (m.bot) {
                return (
                  <div key={idx} className={'bot-card' + (m.level === 'info' ? ' info' : '') + (m.level === 'amber' ? ' amber' : '')}>
                    <span className="bc-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l10 18H2z"/><line x1="12" y1="10" x2="12" y2="15"/><circle cx="12" cy="18" r="0.6" fill="currentColor" stroke="none"/></svg>
                    </span>
                    <div className="bc-text"><strong>{m.title}</strong>{m.text}<div className="bc-meta">{m.meta} · {m.time}</div></div>
                  </div>
                )
              }

              const own = m.who === ME
              const prevMsg = activeConv.messages[idx - 1]
              const sameAsLast = prevMsg && !prevMsg.bot && prevMsg.who === m.who

              return (
                <div key={idx} className={'msg-group' + (own ? ' own' : '')}>
                  {sameAsLast
                    ? <div style={{ width: 34, flex: 'none' }} />
                    : <div className="g-avatar" style={{ background: own ? COLORS.purple : m.color }}>{initials(m.who)}</div>
                  }
                  <div className="g-col">
                    {!sameAsLast && !own && <div className="sender-name">{m.who}</div>}
                    <div className="bubble-row">
                      <div>
                        {m.pinned && (
                          <div className="msg-pinned-flag">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2a1 1 0 0 1 1 1v7l3 4v2H8v-2l3-4V3a1 1 0 0 1 1-1z"/></svg>
                            Đã ghim
                          </div>
                        )}
                        {editingIdx === idx ? (
                          <div className="msg-edit-box">
                            <textarea value={editText} onChange={e => setEditText(e.target.value)} autoFocus />
                            <div className="msg-edit-actions">
                              <button className="msg-edit-btn cancel" onClick={() => { setEditingIdx(null); setEditText('') }}>Huỷ</button>
                              <button className="msg-edit-btn save" onClick={() => saveEdit(idx)}>Lưu</button>
                            </div>
                          </div>
                        ) : (
                          <div className="bubble">
                            {m.text}
                            {m.file && (
                              <div className="file-chip">
                                <div className="f-icon">
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                                </div>
                                <span>
                                  <span className="f-name">{m.file.name}</span><br />
                                  <span className="f-size">{m.file.size}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="msg-actions">
                        <button className={'msg-action-btn' + (m.pinned ? ' active' : '')} title={m.pinned ? 'Bỏ ghim' : 'Ghim tin nhắn'} onClick={() => pinMsg(idx)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill={m.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a1 1 0 0 1 1 1v7l3 4v2H8v-2l3-4V3a1 1 0 0 1 1-1z"/><line x1="12" y1="17" x2="12" y2="22"/></svg>
                        </button>
                        {own && (
                          <button className="msg-action-btn" title="Chỉnh sửa" onClick={() => startEdit(idx, m.text)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5l4 4"/></svg>
                          </button>
                        )}
                        <button className="msg-action-btn" title="Xoá tin nhắn" onClick={() => deleteMsg(idx)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-.9 14a2 2 0 0 1-2 1.9H7.9a2 2 0 0 1-2-1.9L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                      </div>
                    </div>
                    <span className="msg-time">{m.time}{m.edited && <span className="msg-edited-flag">(đã chỉnh sửa)</span>}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="typing">{activeConv?.id === 'g1' ? 'Chị Hoa đang nhập...' : ''}</div>

          {/* Composer */}
          <div className="composer">
            <div className="composer-toolbar">
              <button className="chat-icon-btn" title="Đính kèm tệp">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L10.13 17.1a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <button className="chat-icon-btn" title="Hình ảnh">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              </button>
              <button className="chat-icon-btn" title="Nhắc đến">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-5.5 8.28"/></svg>
              </button>
              <button className="chat-icon-btn" title="Emoji">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="9" y1="10" x2="9.01" y2="10"/><line x1="15" y1="10" x2="15.01" y2="10"/><path d="M8 15c1 1.2 2.4 2 4 2s3-.8 4-2"/></svg>
              </button>
            </div>
            <div className="composer-row">
              <textarea
                ref={msgInputRef}
                rows={1}
                placeholder="Nhập tin nhắn... (Enter để gửi)"
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              />
              <button className="send-btn" onClick={sendMessage} title="Gửi">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ===== Info panel ===== */}
        <div className="info-panel">
          {activeConv && (
            <>
              <div className="info-hero">
                {activeConv.type === 'dm' ? (
                  <div className="avatar-lg round" style={{ background: activeConv.color }}>{initials(activeConv.name)}</div>
                ) : activeConv.type === 'bot' ? (
                  <div className="avatar-lg" style={{ background: activeConv.color }}><IconBot /></div>
                ) : (
                  <div className="avatar-lg" style={{ background: activeConv.color }}>
                    {activeConv.icon === 'building' ? <IconBuilding /> : <IconHardhat />}
                  </div>
                )}
                <div className="info-name">{activeConv.name}</div>
                <div className="info-sub">{activeConv.sub}</div>
              </div>

              {activeConv.type === 'group' && activeConv.members?.length > 0 && (
                <div className="info-section">
                  <div className="sec-title-row">
                    <div className="sec-title">Thành viên ({activeConv.members.length})</div>
                    <button className="pjm-add-btn" title="Thêm người" onClick={() => setAddMemberOpen(v => !v)}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>
                  {activeConv.members.map((mem, i) => (
                    <div key={i} className="member-row">
                      <span className="m-avatar" style={{ background: mem.color }}>{initials(mem.name)}</span>
                      <span>
                        <span className="m-name">{mem.name}</span><br />
                        <span className="m-role">{mem.role}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {sharedGroups.length > 0 && (
                <div className="info-section">
                  <div className="sec-title">Nhóm chung ({sharedGroups.length})</div>
                  {sharedGroups.map(g => (
                    <a key={g.id} href="#" className="group-row" onClick={e => { e.preventDefault(); selectConv(g.id) }}>
                      <span className="g-ico" style={{ background: g.color }}>
                        {g.icon === 'building' ? <IconBuilding /> : <IconHardhat />}
                      </span>
                      <span>
                        <span className="g-n">{g.name}</span><br />
                        <span className="g-m">{g.sub}</span>
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {(activeConv.images?.length > 0 || activeConv.files?.length > 0 || activeConv.links?.length > 0) && (
                <div className="info-section">
                  <div className="cat-icons">
                    <div className="cat-icon-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      <span className="cnt">{activeConv.images?.length || 0}</span>
                      <span className="lbl">Ảnh/Video</span>
                    </div>
                    <div className="cat-icon-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                      <span className="cnt">{activeConv.files?.length || 0}</span>
                      <span className="lbl">File</span>
                    </div>
                    <div className="cat-icon-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      <span className="cnt">{activeConv.links?.length || 0}</span>
                      <span className="lbl">Link</span>
                    </div>
                  </div>
                </div>
              )}

              {activeConv.images?.length > 0 && (
                <div className="info-section">
                  <div className="sec-title">Ảnh &amp; video đã gửi</div>
                  <div className="media-grid">
                    {activeConv.images.map((im, i) => (
                      <div key={i} className="media-thumb" style={{ background: im.color }}>
                        {im.kind === 'video'
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5,3 19,12 5,21"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeConv.files?.length > 0 && (
                <div className="info-section">
                  <div className="sec-title">Tệp đã chia sẻ</div>
                  {activeConv.files.map((f, i) => (
                    <div key={i} className="file-row">
                      <span className="f-ico" style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                      </span>
                      <span>
                        <span className="f-n">{f.name}</span><br />
                        <span className="f-m">{f.size}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeConv.links?.length > 0 && (
                <div className="info-section">
                  <div className="sec-title">Liên kết đã chia sẻ</div>
                  {activeConv.links.map((l, i) => (
                    <div key={i} className="link-row">
                      <span className="l-ico">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      </span>
                      <span>
                        <span className="l-t">{l.title}</span><br />
                        <span className="l-d">{l.domain}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===== AI FAB ===== */}
      <button className="ai-fab" title="Trợ lý ảo Dezbot" onClick={() => setAiOpen(v => !v)}>
        <svg width="30" height="30" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="dezbotGrad" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0" stopColor="#2FA3E6"/>
              <stop offset="1" stopColor="#8B5CF6"/>
            </linearGradient>
          </defs>
          <path d="M4 12.5a8 8 0 0 1 16 0" fill="none" stroke="url(#dezbotGrad)" strokeWidth="1.8" strokeLinecap="round"/>
          <rect x="2" y="11.3" width="3.1" height="6.2" rx="1.55" fill="url(#dezbotGrad)"/>
          <rect x="18.9" y="11.3" width="3.1" height="6.2" rx="1.55" fill="url(#dezbotGrad)"/>
          <line x1="12" y1="4.6" x2="12" y2="7.6" stroke="url(#dezbotGrad)" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="3.3" r="1.5" fill="url(#dezbotGrad)"/>
          <path d="M7.3 7.6h9.4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-4.1l-2.6 2.4v-2.4H7.3a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" fill="url(#dezbotGrad)"/>
          <rect x="8.9" y="10.1" width="6.2" height="4.6" rx="1.3" fill="#fff"/>
          <circle cx="10.55" cy="12.4" r="0.58" fill="url(#dezbotGrad)"/>
          <circle cx="13.45" cy="12.4" r="0.58" fill="url(#dezbotGrad)"/>
          <path d="M10.5 17.1a2.1 2.1 0 0 0 3 0" stroke="#fff" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {/* ===== AI Panel ===== */}
      <div className={'ai-panel' + (aiOpen ? ' open' : '')}>
        <div className="ai-panel-head">
          <h4>Dezbot</h4>
          <button className="ai-newchat-btn" onClick={() => setAiLog([])}>Hội thoại mới</button>
          <button className="ai-close-btn" onClick={() => setAiOpen(false)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="ai-panel-body">
          {aiLog.length === 0 ? (
            <div className="ai-welcome">
              <h2>Tôi có thể giúp gì,<br /><span className="muted">hôm nay?</span></h2>
              <p>Hỏi về tiến độ, nhân công, dòng tiền, khách hàng, bóc tách hay quy trình — trợ lý đọc trực tiếp dữ liệu trong workspace.</p>
              <div className="ai-topic-grid">
                {[
                  { label: 'Tiến độ', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="10" y2="18"/></svg> },
                  { label: 'Chấm công', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                  { label: 'Dòng tiền', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/></svg> },
                  { label: 'Khách hàng', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><path d="M2 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="8" cy="7" r="4"/></svg> },
                ].map(chip => (
                  <div key={chip.label} className="ai-topic-chip">
                    <button className="ai-chip" onClick={() => { setAiInput(chip.label); }}>{chip.icon}{chip.label}</button>
                  </div>
                ))}
                <div className="ai-topic-chip wide">
                  <button className="ai-chip" onClick={() => setAiInput('Tin nhắn')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Tin nhắn
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="ai-log">
              {aiLog.map((msg, i) => (
                <div key={i} className={'ai-msg ' + msg.role}>{msg.text}</div>
              ))}
            </div>
          )}
        </div>
        <div className="ai-suggest-row">
          {['Tôi có tin nhắn nào chưa đọc?', 'Tóm tắt hội thoại nhóm Riverside', 'Có cảnh báo nào từ SiteFlow Bot?'].map(s => (
            <button key={s} className="ai-suggest-chip" onClick={() => { setAiInput(s) }}>{s}</button>
          ))}
        </div>
        <div className="ai-input-area">
          <textarea
            placeholder="Hỏi về tiến độ, chấm công, dòng tiền, khách hàng…"
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAi() } }}
          />
          <div className="ai-input-row">
            <div className="ai-tool-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="10" y2="18"/></svg></div>
            <div className="ai-tool-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
            <div className="ai-tool-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
            <button className="ai-send-btn" onClick={sendAi}>Gửi</button>
          </div>
        </div>
      </div>

      {/* ===== Directory modal ===== */}
      {showDirectory && (
        <div style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(15,18,25,.5)', zIndex: 120, alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDirectory(false)}>
          <div style={{ background: 'var(--surface)', width: 520, maxWidth: '92vw', maxHeight: '82vh', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(0,0,0,.35)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Danh bạ công ty</div>
              <button onClick={() => setShowDirectory(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ padding: '14px 22px 0' }}>
              <div className="search-box-chat" style={{ marginBottom: 4 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" placeholder="Tìm theo tên, vai trò, phòng ban..." value={dirSearch} onChange={e => setDirSearch(e.target.value)} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 20px' }}>
              {COMPANY_DIRECTORY.filter(dept =>
                !dirSearch || dept.dept.toLowerCase().includes(dirSearch.toLowerCase()) || dept.people.some(p => p.name.toLowerCase().includes(dirSearch.toLowerCase()) || p.role.toLowerCase().includes(dirSearch.toLowerCase()))
              ).map(dept => (
                <div key={dept.dept} className="dir-dept">
                  <div className="dir-dept-title">{dept.dept}</div>
                  {dept.people.filter(p => !dirSearch || p.name.toLowerCase().includes(dirSearch.toLowerCase()) || p.role.toLowerCase().includes(dirSearch.toLowerCase()) || dept.dept.toLowerCase().includes(dirSearch.toLowerCase())).map(p => (
                    <div key={p.name} className="dir-person">
                      <div className="dp-avatar" style={{ background: p.color }}>{initials(p.name)}</div>
                      <div>
                        <div className="dp-name">{p.name}</div>
                        <div className="dp-role">{p.role}</div>
                      </div>
                      <span className="dp-msg">Nhắn tin</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
