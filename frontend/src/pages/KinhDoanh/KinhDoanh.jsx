import { useMemo, useState } from 'react'
import PageShell from '../../components/layout/PageShell'
import './KinhDoanh.css'

const stages = [
  ['tiep-can', 'Tiếp cận'], ['tu-van', 'Tư vấn (Concept)'],
  ['bao-gia', 'Báo giá (Thiết kế - Khái toán)'], ['dam-phan', 'Đàm phán'],
  ['chot-hd', 'Chốt hợp đồng'], ['bao-gia-thi-cong', 'Báo giá (Thi công)'],
  ['thiet-ke', 'Dự án (Thiết kế)'], ['thi-cong', 'Dự án (Thi công)'],
  ['truot-thau', 'Đã trượt thầu'],
]
const stageLabels = Object.fromEntries(stages)
const departments = { 'du-an': 'Phòng KD Dự Án', 'dan-dung': 'Phòng KD Dân dụng' }
const deptShort = { 'du-an': 'Dự án', 'dan-dung': 'Dân dụng' }
const deptColors = { 'du-an': 'var(--primary)', 'dan-dung': 'var(--attendance)' }
const deptTints = { 'du-an': 'var(--primary-tint)', 'dan-dung': 'var(--attendance-tint)' }
const designStages = [
  ['intake', 'Chờ tiếp nhận', 'var(--text-muted)'], ['concept', 'Lên concept', 'var(--primary)'],
  ['drafting', 'Triển khai bản vẽ', 'var(--finance)'], ['review', 'Chờ khách duyệt', 'var(--gold)'],
  ['approved', 'Đã duyệt', 'var(--success)'],
]
const constructionStages = [
  ['prep', 'Chuẩn bị mặt bằng', 'var(--text-muted)'], ['structure', 'Thi công phần thô', 'var(--primary)'],
  ['finishing', 'Hoàn thiện', 'var(--finance)'], ['acceptance', 'Nghiệm thu', 'var(--gold)'],
  ['handover', 'Đã bàn giao', 'var(--success)'],
]
const initialLeads = [
  { id: 'l1', name: 'Anh Minh Khang', type: 'Nhà phố', value: 1.8, stage: 'tiep-can', dept: 'dan-dung', createdAt: '2026-09-27' },
  { id: 'l2', name: 'Chị Lan Anh', type: 'Biệt thự', value: 5.2, stage: 'tiep-can', dept: 'dan-dung', createdAt: '2026-09-25' },
  { id: 'l3', name: 'Cty XYZ Group', type: 'Văn phòng', value: 3.5, stage: 'tiep-can', dept: 'du-an', createdAt: '2026-09-20' },
  { id: 'l4', name: 'Anh Đức Thịnh', type: 'Nhà phố', value: 2, stage: 'tiep-can', dept: 'dan-dung', createdAt: '2026-09-10' },
  { id: 'l5', name: 'Chị Thu Hằng', type: 'Chung cư mini', value: 4.1, stage: 'tiep-can', dept: 'dan-dung', createdAt: '2026-08-15' },
  { id: 'l6', name: 'Chị Bích Ngọc', type: 'Biệt thự', value: 6, stage: 'tu-van', dept: 'dan-dung', createdAt: '2026-09-22' },
  { id: 'l7', name: 'Anh Hoàng Long', type: 'Nhà phố', value: 2.3, stage: 'tu-van', dept: 'dan-dung', createdAt: '2026-09-05' },
  { id: 'l8', name: 'Cty Minh Phát', type: 'Văn phòng', value: 4.8, stage: 'tu-van', dept: 'du-an', createdAt: '2026-08-28' },
  { id: 'l9', name: 'Anh Tuấn Kiệt', type: 'Nhà phố', value: 1.9, stage: 'tu-van', dept: 'dan-dung', createdAt: '2026-07-30' },
  { id: 'l10', name: 'Chị Minh Thư', type: 'Biệt thự Song lập — Thảo Điền', value: 6.8, stage: 'bao-gia', dept: 'dan-dung', createdAt: '2026-09-18' },
  { id: 'l11', name: 'Anh Văn Sơn', type: 'Nhà phố', value: 2.2, stage: 'bao-gia', dept: 'dan-dung', createdAt: '2026-08-22' },
  { id: 'l12', name: 'Cty Đông Dương', type: 'Văn phòng', value: 5.5, stage: 'bao-gia', dept: 'du-an', createdAt: '2026-06-15' },
  { id: 'l13', name: 'BQL Riverside', type: 'Mở rộng Giai đoạn 3', value: 15, stage: 'dam-phan', dept: 'du-an', createdAt: '2026-09-23' },
  { id: 'l14', name: 'Chị Hải Yến', type: 'Biệt thự Nhà Bè', value: 7.2, stage: 'dam-phan', dept: 'dan-dung', createdAt: '2026-07-12' },
  { id: 'l17', name: 'Anh Phúc Nguyên', type: 'Nhà phố', value: 2.4, stage: 'chot-hd', dept: 'dan-dung', createdAt: '2026-09-01' },
  { id: 'l18', name: 'Chị Ngọc Diễm', type: 'Nhà phố', value: 2.6, stage: 'thiet-ke', sub: 'concept', dept: 'dan-dung', createdAt: '2026-05-20' },
  { id: 'l19', name: 'Anh Bảo Long', type: 'Biệt thự', value: 5.4, stage: 'thiet-ke', sub: 'review', dept: 'dan-dung', partner: true, createdAt: '2026-04-10' },
  { id: 'l15', name: 'Anh Quang Huy', type: 'Nhà phố Lô B12 — KDC Bình Chánh', value: 2.1, stage: 'thi-cong', sub: 'structure', dept: 'dan-dung', createdAt: '2026-03-15' },
  { id: 'l16', name: 'Cty TNHH ABC Logistics', type: 'Văn phòng cho thuê — Q3', value: 4.2, stage: 'thi-cong', sub: 'handover', dept: 'du-an', partner: true, createdAt: '2026-02-01' },
  { id: 'l20', name: 'Anh Trọng Tấn', type: 'Nhà phố', value: 2.7, stage: 'truot-thau', dept: 'dan-dung', createdAt: '2026-09-15' },
]
const categories = [
  'Thiết kế kiến trúc', 'Thiết kế nội thất', 'Thiết kế cảnh quan', 'Thi công phần thô',
  'Thi công phần hoàn thiện cơ bản', 'Thi công nội thất', 'Cung cấp đồ rời',
  'Thi công trọn gói (chìa khóa trao tay)',
]
const leaderboard = [
  { name: 'Trần Anh', team: 'Trưởng phòng KD', color: '#C2621A', week: 150, total: 1780 },
  { name: 'Đặng Quốc Cường', team: 'Phòng KD Dự Án', color: '#2F5DA8', week: 120, total: 1420 },
  { name: 'Hoàng Yến Nhi', team: 'Phòng KD Dân dụng', color: '#0E8A82', week: 110, total: 1320 },
  { name: 'Vũ Đình Khoa', team: 'Phòng KD Dự Án', color: '#B7791F', week: 80, total: 960 },
  { name: 'Lâm Bảo Ngọc', team: 'Phòng KD Dân dụng', color: '#7658C2', week: 60, total: 760 },
]
const makeTasks = () => [
  { title: 'Tiếp cận & xác minh khách hàng tiềm năng', status: 'done', subtasks: [
    { text: 'Gọi điện xác minh nhu cầu', who: 'Đặng Quốc Cường', pts: 20, done: true },
    { text: 'Ghi nhận thông tin vào hệ thống', who: 'Đặng Quốc Cường', pts: 15, done: true },
    { text: 'Phân loại theo phòng ban phụ trách', who: 'Trần Anh', pts: 15, done: true },
  ] },
  { title: 'Tư vấn & khảo sát nhu cầu', status: 'done', subtasks: [
    { text: 'Hẹn gặp tư vấn trực tiếp', who: 'Đặng Quốc Cường', pts: 20, done: true },
    { text: 'Khảo sát hiện trạng / mặt bằng', who: 'Vũ Đình Khoa', pts: 25, done: true },
    { text: 'Ghi nhận yêu cầu thiết kế', who: 'Đặng Quốc Cường', pts: 20, done: true },
  ] },
  { title: 'Lập báo giá', status: 'current', subtasks: [
    { text: 'Bóc tách sơ bộ chi phí', who: 'Vũ Đình Khoa', pts: 25, done: true },
    { text: 'Soạn báo giá & trình duyệt', who: 'Trần Anh', pts: 20, done: true },
    { text: 'Gửi báo giá cho khách hàng', who: 'Đặng Quốc Cường', pts: 15, done: false },
  ] },
  { title: 'Đàm phán hợp đồng', status: 'locked', subtasks: [
    { text: 'Trao đổi điều khoản thanh toán', who: 'Trần Anh', pts: 20, done: false },
    { text: 'Điều chỉnh phạm vi công việc', who: 'Vũ Đình Khoa', pts: 20, done: false },
    { text: 'Thống nhất tiến độ bàn giao', who: 'Đặng Quốc Cường', pts: 20, done: false },
  ] },
  { title: 'Chốt hợp đồng & bàn giao hồ sơ', status: 'locked', subtasks: [
    { text: 'Ký kết hợp đồng', who: 'Trần Anh', pts: 25, done: false },
    { text: 'Thu tạm ứng đợt 1', who: 'Trần Anh', pts: 20, done: false },
    { text: 'Bàn giao hồ sơ sang phòng Dự án / Thi công', who: 'Đặng Quốc Cường', pts: 20, done: false },
  ] },
]
const rewards = [
  ['Phiếu ăn trưa miễn phí (1 tuần)', 300, 'var(--finance)', '☕'],
  ['Voucher nhà hàng 500.000đ', 500, 'var(--primary)', '◇'],
  ['Khoá học kỹ năng đàm phán', 700, 'var(--attendance)', '▤'],
  ['Ngày nghỉ phép thêm (1 ngày)', 1000, 'var(--success)', '▣'],
  ['Chuyến du lịch team quý (2 ngày 1 đêm)', 2500, 'var(--text-muted)', '✦'],
  ['Thưởng tiền mặt 1.000.000đ', 3000, 'var(--text-muted)', '▣'],
]
const handoffSettings = {
  'bao-gia': { dept: 'QS', title: 'Phiếu yêu cầu báo giá', subtitle: 'Chuyển dự án sang Phòng QS để lập báo giá chi tiết', role: 'QS - Điều phối báo giá', self: true, status: 'pending-qs' },
  'bao-gia-thi-cong': { dept: 'QS', title: 'Phiếu yêu cầu báo giá thi công', subtitle: 'Chuyển dự án sang Phòng QS để lập báo giá thi công chi tiết', role: 'QS - Điều phối báo giá thi công', self: true, status: 'pending-qs' },
  'thiet-ke': { dept: 'Thiết kế', title: 'Phiếu bàn giao dự án', subtitle: 'Chuyển dự án sang Phòng Thiết kế để triển khai', role: 'Thiết kế - Tiếp nhận dự án', self: false, status: 'pending-handoff' },
  'thi-cong': { dept: 'Thi công', title: 'Phiếu bàn giao dự án', subtitle: 'Chuyển dự án sang Phòng Thi công để triển khai', role: 'Thi công - Tiếp nhận dự án', self: false, status: 'pending-handoff' },
}
const blankLead = { name: '', phone: '', email: '', source: 'Giới thiệu', address: '', dept: 'dan-dung', projectType: 'Nhà phố', scale: '', categories: [], value: '', stage: 'tiep-can', concept: '', notes: '', partner: false, assignees: [], boqFile: '' }
const cardStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 17 }
const buttonStyle = { border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', background: 'var(--surface)', color: 'var(--text)', font: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }
const primaryButton = { ...buttonStyle, color: '#fff', border: 0, background: 'var(--sales)' }
const selectStyle = { ...buttonStyle, cursor: 'pointer' }
const timeOptions = [['all', 'Tất cả thời gian'], ['today', 'Hôm nay'], ['week', 'Tuần này'], ['month', 'Tháng này'], ['quarter', 'Quý này'], ['year', 'Năm nay'], ['custom', 'Tự chọn khoảng ngày...']]
const timeLabel = Object.fromEntries(timeOptions)

function formatValue(value) { return `${Number(value || 0).toFixed(1).replace(/\.0$/, '')} tỷ` }
function initials(name = '') { return name.trim().split(/\s+/).slice(-2).map(part => part[0]).join('').toUpperCase() }
function stageAccent(stage) {
  if (stage === 'truot-thau') return { border: 'var(--danger)', bg: 'var(--danger-tint)', color: 'var(--danger)' }
  if (stage === 'dam-phan') return { border: 'var(--gold)', bg: 'var(--gold-tint)', color: 'var(--gold)' }
  if (stage === 'thiet-ke') return { border: 'var(--primary)', bg: 'var(--primary-tint)', color: 'var(--primary)' }
  if (['thi-cong', 'tu-van'].includes(stage)) return { border: 'var(--success)', bg: 'var(--success-tint)', color: 'var(--success)' }
  return null
}
function matchesDate(lead, filter, from, to) {
  if (filter === 'all') return true
  if (!lead.createdAt) return false
  const date = new Date(`${lead.createdAt}T00:00:00`)
  const now = new Date()
  if (filter === 'today') return date.toDateString() === now.toDateString()
  if (filter === 'week') {
    const start = new Date(now)
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
    start.setHours(0, 0, 0, 0)
    const end = new Date(start); end.setDate(end.getDate() + 7)
    return date >= start && date < end
  }
  if (filter === 'month') return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  if (filter === 'quarter') return date.getFullYear() === now.getFullYear() && Math.floor(date.getMonth() / 3) === Math.floor(now.getMonth() / 3)
  if (filter === 'year') return date.getFullYear() === now.getFullYear()
  return (!from || lead.createdAt >= from) && (!to || lead.createdAt <= to)
}

function Field({ label, children, style }) {
  return <label className="kd-field" style={style}><span>{label}</span>{children}</label>
}

function Modal({ title, onClose, children, width = 640 }) {
  return <div className="kd-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="kd-modal" style={{ width }} role="dialog" aria-modal="true" aria-label={title}>
      <header className="kd-modal-head"><div><h2>{title}</h2></div><button className="kd-icon-button" onClick={onClose} aria-label="Đóng">×</button></header>
      {children}
    </section>
  </div>
}

export default function KinhDoanh() {
  const [leads, setLeads] = useState(initialLeads)
  const [tab, setTab] = useState('overview')
  const [taskTab, setTaskTab] = useState('overview')
  const [boardView, setBoardView] = useState('kanban')
  const [dept, setDept] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [leadModal, setLeadModal] = useState(null)
  const [leadForm, setLeadForm] = useState(blankLead)
  const [leadStep, setLeadStep] = useState(0)
  const [assigneeForm, setAssigneeForm] = useState({ name: '', role: '' })
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [detailLead, setDetailLead] = useState(null)
  const [handoff, setHandoff] = useState(null)
  const [handoffForm, setHandoffForm] = useState({ date: '', assignee: '' })
  const [tasks, setTasks] = useState(makeTasks)
  const [taskModal, setTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ name: '', step: 2, assignee: '', points: '20' })
  const [wallet, setWallet] = useState(1320)
  const [redeemed, setRedeemed] = useState([])

  const filtered = useMemo(() => leads.filter(lead =>
    (dept === 'all' || lead.dept === dept) && matchesDate(lead, timeFilter, fromDate, toDate),
  ), [leads, dept, timeFilter, fromDate, toDate])
  const stats = useMemo(() => {
    const won = filtered.filter(lead => ['chot-hd', 'thiet-ke', 'thi-cong'].includes(lead.stage))
    const lost = filtered.filter(lead => lead.stage === 'truot-thau')
    const totalValue = filtered.reduce((sum, lead) => sum + Number(lead.value || 0), 0)
    const wonValue = won.reduce((sum, lead) => sum + Number(lead.value || 0), 0)
    return {
      total: filtered.length, won, lost, totalValue, wonValue,
      closeRate: filtered.length ? Math.round(won.length / filtered.length * 100) : 0,
      lostRate: filtered.length ? Math.round(lost.length / filtered.length * 100) : 0,
      partnerRate: won.length ? Math.round(won.filter(lead => lead.partner).length / won.length * 100) : 0,
    }
  }, [filtered])

  function updateForm(key, value) { setLeadForm(current => ({ ...current, [key]: value })) }
  function updateLead(id, patch) { setLeads(current => current.map(lead => lead.id === id ? { ...lead, ...patch } : lead)) }
  function syncProject(lead) {
    try {
      const items = JSON.parse(localStorage.getItem('siteflow-synced-projects') || '[]').filter(item => item.id !== lead.id)
      items.push({ id: lead.id, name: lead.type.includes('—') ? lead.type : `${lead.name} — ${lead.type}`, client: lead.name, stage: lead.stage, value: lead.value, updated: new Date().toLocaleDateString('vi-VN') })
      localStorage.setItem('siteflow-synced-projects', JSON.stringify(items))
    } catch (error) { console.error('Không thể đồng bộ dự án kinh doanh.', error) }
  }
  function removeSyncedProject(id) {
    try {
      const items = JSON.parse(localStorage.getItem('siteflow-synced-projects') || '[]').filter(item => item.id !== id)
      localStorage.setItem('siteflow-synced-projects', JSON.stringify(items))
    } catch (error) { console.error('Không thể cập nhật dự án kinh doanh.', error) }
  }
  function openLead(lead) {
    setLeadForm(lead ? { ...blankLead, ...lead, projectType: lead.projectType || lead.type, value: String(lead.value ?? '') } : { ...blankLead })
    setLeadStep(0); setAssigneeOpen(false); setCategoryOpen(false)
    setLeadModal(lead?.id || 'new')
  }
  function saveLead() {
    if (!leadForm.name.trim()) { setLeadStep(0); return }
    const numericValue = Number(String(leadForm.value).replace(',', '.')) || 0
    const saved = {
      ...leadForm, name: leadForm.name.trim(), value: numericValue,
      type: leadForm.scale.trim() ? `${leadForm.projectType} (${leadForm.scale.trim()})` : leadForm.projectType,
    }
    if (leadModal === 'new') {
      saved.id = `lnew-${Date.now()}`
      saved.createdAt = new Date().toISOString().slice(0, 10)
      setLeads(current => [...current, saved])
    } else {
      setLeads(current => current.map(lead => lead.id === leadModal ? { ...lead, ...saved } : lead))
    }
    if (['thiet-ke', 'thi-cong', 'tu-van', 'dam-phan'].includes(saved.stage)) syncProject({ ...saved, id: leadModal === 'new' ? saved.id : leadModal })
    else removeSyncedProject(leadModal === 'new' ? saved.id : leadModal)
    setLeadModal(null)
  }
  function changeStage(id, nextStage) {
    const lead = leads.find(item => item.id === id)
    if (!lead || lead.stage === nextStage) return
    updateLead(id, { stage: nextStage })
    const updated = { ...lead, stage: nextStage }
    if (['thiet-ke', 'thi-cong', 'tu-van', 'dam-phan'].includes(nextStage)) syncProject(updated)
    else removeSyncedProject(id)
    if (handoffSettings[nextStage] && (nextStage !== 'bao-gia' || lead.stage === 'tu-van')) {
      setHandoff({ leadId: id, stage: nextStage })
      setHandoffForm({ date: '', assignee: '' })
    }
  }
  function removeLead(id) {
    const lead = leads.find(item => item.id === id)
    if (!lead || !window.confirm(`Xoá lead "${lead.name}"? Hành động này không thể hoàn tác.`)) return
    setLeads(current => current.filter(item => item.id !== id))
    removeSyncedProject(id)
  }
  function saveHandoff(selfQuoted = false) {
    const config = handoffSettings[handoff?.stage]
    const lead = leads.find(item => item.id === handoff?.leadId)
    if (!config || !lead) return
    const nextAssignees = handoffForm.assignee.trim()
      ? [...(lead.assignees || []), { name: handoffForm.assignee.trim(), role: config.role }]
      : lead.assignees
    updateLead(lead.id, {
      handoff: { status: selfQuoted ? 'self-quoted' : config.status, dept: config.dept, requestedAt: selfQuoted ? null : handoffForm.date || null, assignee: selfQuoted ? null : handoffForm.assignee.trim() || null },
      ...(nextAssignees ? { assignees: nextAssignees } : {}),
    })
    setHandoff(null)
  }
  function updateSubstage(id, sub) { updateLead(id, { sub }) }
  function addSubstageCard(stage, sub) {
    const name = window.prompt('Tên khách hàng / dự án:')
    if (!name?.trim()) return
    setLeads(current => [...current, {
      ...blankLead, id: `lnew-${Date.now()}`, name: name.trim(), type: 'Chưa xác định',
      value: 0, stage, sub, createdAt: new Date().toISOString().slice(0, 10),
    }])
  }
  const stagesEarned = tasks.reduce((sum, task) => sum + task.subtasks.reduce((stepSum, item) => stepSum + (item.done ? item.pts : 0), 0), 0)
  const maxPoints = tasks.reduce((sum, task) => sum + task.subtasks.reduce((stepSum, item) => stepSum + item.pts, 0), 0)
  const doneSteps = tasks.filter(task => task.status === 'done').length

  function DateFilter({ prefix }) {
    return <div className="kd-date-filter">
      <select value={timeFilter} onChange={event => setTimeFilter(event.target.value)} style={selectStyle}>
        {timeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      {timeFilter === 'custom' && <div className="kd-date-range">
        <input aria-label={`${prefix} từ ngày`} type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} />
        <span>→</span>
        <input aria-label={`${prefix} đến ngày`} type="date" value={toDate} onChange={event => setToDate(event.target.value)} />
      </div>}
    </div>
  }
  function DepartmentFilter() {
    return <div className="kd-dept-filter">
      {[['all', 'Tất cả'], ...Object.entries(departments)].map(([key, label]) =>
        <button key={key} onClick={() => setDept(key)} className={dept === key ? 'active' : ''}>{label}</button>,
      )}
    </div>
  }
  function LeadCard({ lead, compact = false }) {
    const accent = stageAccent(lead.stage)
    const isLost = lead.stage === 'truot-thau'
    return <article
      className={`lead-card ${compact ? 'compact' : ''}`}
      draggable
      onDragStart={event => { event.dataTransfer.setData('text/plain', lead.id); event.dataTransfer.effectAllowed = 'move' }}
      onClick={() => setDetailLead(lead.id)}
      style={{ borderLeft: compact ? `3px solid ${accent?.border || 'var(--sales)'}` : undefined, borderColor: accent?.border, background: isLost ? 'var(--danger-tint)' : undefined }}
    >
      {!compact && <div className="kd-card-top">
        <strong title={lead.name}>{lead.name}</strong>
        <button className="kd-icon-button delete" title="Xoá" onClick={event => { event.stopPropagation(); removeLead(lead.id) }}>×</button>
      </div>}
      {compact && <strong title={lead.name}>{lead.name}</strong>}
      <div className="kd-card-type" title={lead.type}>{lead.type}</div>
      {!compact && <div className="kd-card-tags">
        <span style={{ color: deptColors[lead.dept] }}>{deptShort[lead.dept]}</span>
        {accent && !isLost && <span className="kd-tag" style={{ color: accent.color, background: accent.bg }}>→ Dự án</span>}
        {['pending-qs', 'pending-handoff'].includes(lead.handoff?.status) && <span className="kd-tag pending">⏳ Chờ {lead.handoff.dept} xác nhận</span>}
        {lead.handoff?.status === 'self-quoted' && <span className="kd-tag">KD tự đề xuất</span>}
      </div>}
      {!compact && <div className="kd-card-assignees">
        {(lead.assignees || []).slice(0, 3).map(person => <span className="kd-avatar" title={`${person.name}${person.role ? ` — ${person.role}` : ''}`} key={`${person.name}${person.role}`}>{initials(person.name)}</span>)}
        {lead.assignees?.length > 3 && <span className="kd-avatar more">+{lead.assignees.length - 3}</span>}
        <button title="Thêm người phụ trách" onClick={event => { event.stopPropagation(); setDetailLead(lead.id) }}>+</button>
      </div>}
      <div className="kd-card-value">{formatValue(lead.value)}</div>
      {!compact && <select value={lead.stage} onClick={event => event.stopPropagation()} onChange={event => changeStage(lead.id, event.target.value)}>
        {stages.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
      </select>}
    </article>
  }
  function SubBoard({ items, parentStage, columns }) {
    return <div className="kd-board">
      {columns.map(([sub, label, color]) => {
        const cards = items.filter(lead => (lead.sub || columns[0][0]) === sub)
        return <section className="stage-col" key={sub} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('text/plain'); if (id) updateSubstage(id, sub) }}>
          <div className="kd-stage-stripe" style={{ background: color }} />
          <header className="stage-head"><strong style={{ color }}>{label}</strong><span>{cards.length}</span></header>
          <div className="stage-drop">{cards.map(lead => <LeadCard key={lead.id} lead={lead} compact />)}</div>
          <button className="kd-add-card" onClick={() => addSubstageCard(parentStage, sub)}>＋ Thêm thẻ</button>
        </section>
      })}
    </div>
  }
  function TaskSubpanel({ children, name }) {
    return taskTab === name ? <div className="kd-task-panel">{children}</div> : null
  }

  const detail = leads.find(lead => lead.id === detailLead)
  const handingLead = leads.find(lead => lead.id === handoff?.leadId)
  const handoffConfig = handoffSettings[handoff?.stage]
  const totalPoints = tasks.reduce((sum, task) => sum + task.subtasks.reduce((stepSum, item) => stepSum + item.pts, 0), 0)

  return <PageShell title="Kinh doanh" subtitle="Pipeline khách hàng & cơ hội bán hàng">
    <div className="kd-page">
      <nav className="tab-bar kd-tabs">
        {[['overview', 'Tổng quan'], ['pipeline', 'Pipeline khách hàng'], ['design-board', 'Dự án (Thiết kế)'], ['construction-board', 'Dự án (Thi công)'], ['tasks', 'Nhiệm vụ & điểm thưởng']].map(([key, label]) =>
          <button key={key} className={`sales-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>,
        )}
      </nav>

      {tab === 'overview' && <section className="sales-panel">
        <div className="kd-toolbar">
          <span>Số liệu tổng hợp theo phòng ban & mốc thời gian đã chọn</span>
          <div className="kd-toolbar-controls"><DepartmentFilter /><DateFilter prefix="Tổng quan" /></div>
        </div>
        <div className="kd-kpi-grid">
          {[
            ['Tổng giá trị pipeline', formatValue(stats.totalValue), `${stats.total} cơ hội đang theo dõi`, 'var(--sales)'],
            ['Khách hàng tiềm năng', stats.total, '+4 trong tháng này', 'var(--primary)'],
            ['Tỷ lệ chốt hợp đồng', `${stats.closeRate}%`, 'Trên tổng số cơ hội', 'var(--success)'],
            ['Đã chốt tháng này', formatValue(stats.wonValue), `${stats.won.length} hợp đồng`, 'var(--success)'],
            ['Tỷ lệ hợp đồng rớt', `${stats.lostRate}%`, `${stats.lost.length} cơ hội trượt thầu`, 'var(--danger)'],
            ['Chuyển giao cho đối tác', `${stats.partnerRate}%`, 'Trên các hợp đồng đã chốt', 'var(--primary)'],
          ].map(([label, value, caption, color]) => <article className="kd-kpi" key={label}>
            <span>{label}</span><strong style={{ color }}>{value}</strong><small>{caption}</small>
          </article>)}
        </div>
        <div className="kd-overview-grid">
          <article className="kd-widget"><header><h3>Phễu cơ hội theo giai đoạn</h3></header>
            {stages.map(([key, label]) => {
              const count = filtered.filter(lead => lead.stage === key).length
              return <div className="kd-funnel-row" key={key}><span title={label}>{label}</span><div><i style={{ width: `${Math.max(3, count / Math.max(1, filtered.length) * 100)}%` }} /></div><b>{count}</b></div>
            })}
          </article>
          <article className="kd-widget">
            <header><h3>Quy trình đang "chơi"</h3><button className="kd-link-button" onClick={() => { setTab('tasks'); setTaskTab('mission') }}>Chơi tiếp</button></header>
            <strong>Quy trình chốt hợp đồng — BQL Riverside GĐ3</strong>
            <p>5 bước · Phòng KD Dự Án</p>
            <div className="kd-progress"><i style={{ width: `${Math.round(doneSteps / tasks.length * 100)}%` }} /></div>
            <small>{doneSteps}/{tasks.length} bước hoàn thành · {stagesEarned}/{totalPoints} điểm</small>
            <h3 className="kd-widget-subtitle">Bảng xếp hạng tuần này <button className="kd-link-button" onClick={() => { setTab('tasks'); setTaskTab('leaderboard') }}>Xem tất cả ›</button></h3>
            {leaderboard.slice(0, 3).map((person, index) => <div className="kd-rank-row" key={person.name}><b>{index + 1}</b><span>{person.name}</span><strong>{person.week}đ</strong></div>)}
          </article>
        </div>
      </section>}

      {tab === 'pipeline' && <section className="sales-panel">
        <div className="kd-toolbar">
          <span>Kéo thả thẻ giữa các cột hoặc chọn giai đoạn trên thẻ để chuyển. Dự án thiết kế/thi công sẽ đồng bộ sang tab Dự án.</span>
          <div className="kd-toolbar-controls"><DepartmentFilter /><DateFilter prefix="Pipeline" />
            <div className="kd-view-switch">
              {['kanban', 'list'].map(view => <button key={view} className={boardView === view ? 'active' : ''} onClick={() => setBoardView(view)}>{view === 'kanban' ? 'Kanban' : 'Danh sách'}</button>)}
            </div>
          </div>
        </div>
        {boardView === 'kanban' ? <div className="kd-board">
          {stages.map(([key, label]) => {
            const cards = filtered.filter(lead => lead.stage === key)
            const accent = stageAccent(key)
            return <section className={`stage-col ${key === 'truot-thau' ? 'lost' : ''}`} key={key}
              onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('text/plain'); if (id) changeStage(id, key) }}>
              <header className="stage-head"><strong style={{ color: accent?.color }}>{label}</strong><span style={{ color: accent?.color }}>{cards.length} dự án · {formatValue(cards.reduce((sum, lead) => sum + Number(lead.value || 0), 0))}</span></header>
              <div className="stage-drop">{cards.map(lead => <LeadCard lead={lead} key={lead.id} />)}</div>
            </section>
          })}
        </div> : <div className="kd-list">
          <div className="kd-list-head"><span>Lead khách hàng</span><span>Loại dự án</span><span>Phòng ban</span><span>Giá trị</span><span>Giai đoạn</span><span>Chuyển tới</span></div>
          {filtered.map(lead => <div className="kd-list-row" key={lead.id}>
            <strong onClick={() => setDetailLead(lead.id)}>{lead.name}</strong><span>{lead.type}</span>
            <span className="kd-tag" style={{ background: deptTints[lead.dept], color: deptColors[lead.dept] }}>{deptShort[lead.dept]}</span>
            <b>{formatValue(lead.value)}</b><span>{stageLabels[lead.stage]}</span>
            <select value={lead.stage} onChange={event => changeStage(lead.id, event.target.value)}>{stages.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
          </div>)}
        </div>}
      </section>}

      {tab === 'design-board' && <section className=”sales-panel”><p className=”kd-hint”>Bảng Kanban kiểu Lark Base — kéo thả thẻ giữa các cột, hoặc bấm “+ Thêm thẻ” ở cuối mỗi cột để tạo nhanh.</p><SubBoard parentStage=”thiet-ke” items={leads.filter(lead => lead.stage === 'thiet-ke')} columns={designStages} /></section>}
      {tab === 'construction-board' && <section className=”sales-panel”><p className=”kd-hint”>Bảng Kanban kiểu Lark Task — kéo thả thẻ giữa các cột, hoặc bấm “+ Thêm thẻ” ở cuối mỗi cột để tạo nhanh.</p><SubBoard parentStage=”thi-cong” items={leads.filter(lead => lead.stage === 'thi-cong')} columns={constructionStages} /></section>}

      {tab === 'tasks' && <section className=”sales-panel”>
        <nav className="kd-task-tabs">{[['overview', 'Tổng quan'], ['mission', 'Nhiệm vụ'], ['rewards', 'Đổi quà'], ['leaderboard', 'Bảng xếp hạng']].map(([key, label]) =>
          <button key={key} className={taskTab === key ? 'active' : ''} onClick={() => setTaskTab(key)}>{label}</button>)}</nav>
        <TaskSubpanel name="overview">
          <div className="kd-task-kpis">{[['Nhân sự tham gia', '5', '2 phòng KD Dự Án & Dân dụng'], ['Tổng điểm đã phát', '7.240', 'Từ đầu quý đến nay'], ['Nhiệm vụ hoàn thành tuần này', '6', '+2 so với tuần trước'], ['Quà đã đổi', '4', 'Xem lịch sử tại tab Đổi quà']].map(([title, value, caption]) =>
            <article className="kd-kpi" key={title}><span>{title}</span><strong>{value}</strong><small>{caption}</small></article>)}</div>
          <div className="kd-overview-grid"><article className="kd-widget"><h3>Quy trình đang "chơi"</h3><strong>Quy trình chốt hợp đồng — BQL Riverside GĐ3</strong><p>5 bước · Phòng KD Dự Án</p><button style={primaryButton} onClick={() => setTaskTab('mission')}>Chơi tiếp</button><div className="kd-progress"><i style={{ width: `${doneSteps / tasks.length * 100}%` }} /></div>{doneSteps}/{tasks.length} bước</article>
            <article className="kd-widget"><header><h3>Bảng xếp hạng tuần này</h3><button className="kd-link-button" onClick={() => setTaskTab('leaderboard')}>Xem tất cả ›</button></header>{leaderboard.slice(0, 5).map((person, index) => <div className="kd-rank-row" key={person.name}><b>{index + 1}</b><span>{person.name}</span><strong>{person.week}đ</strong></div>)}</article></div>
        </TaskSubpanel>
        <TaskSubpanel name="mission">
          <article className="kd-widget kd-mission-head"><div><strong>Quy trình chốt hợp đồng — BQL Riverside GĐ3</strong><p>5 bước chính · Phòng KD Dự Án · Hoàn thành nhiệm vụ nhỏ để nhận điểm</p></div><div className="kd-mission-score"><b>{stagesEarned} / {totalPoints} điểm</b><div className="kd-progress"><i style={{ width: `${totalPoints ? stagesEarned / totalPoints * 100 : 0}%` }} /></div></div><button style={primaryButton} onClick={() => { setTaskForm({ name: '', step: Math.max(0, tasks.findIndex(task => task.status === 'current')), assignee: '', points: '20' }); setTaskModal(true) }}>＋ Tạo nhiệm vụ</button></article>
          <div className="kd-steps">{tasks.map((task, index) => {
            const earned = task.subtasks.reduce((sum, item) => sum + (item.done ? item.pts : 0), 0)
            const possible = task.subtasks.reduce((sum, item) => sum + item.pts, 0)
            return <article className={`kd-step ${task.status}`} key={task.title}><span className={`kd-step-dot ${task.status}`}>{task.status === 'done' ? '✓' : task.status === 'locked' ? '▣' : index + 1}</span><div className="kd-step-content"><header><div><strong>{task.title}</strong><small>{task.subtasks.length} nhiệm vụ nhỏ{task.status === 'locked' ? ' · Hoàn thành bước trước để mở khoá' : ''}</small></div><b>{earned}/{possible}đ</b></header>{task.status !== 'locked' && task.subtasks.map((subtask, subIndex) =>
              <label className="kd-subtask" key={`${subtask.text}-${subIndex}`}><input type="checkbox" checked={subtask.done} disabled={task.status !== 'current'} onChange={event => {
                setTasks(current => current.map((currentTask, currentIndex) => {
                  if (currentIndex !== index) return currentTask
                  const subtasks = currentTask.subtasks.map((item, itemIndex) => itemIndex === subIndex ? { ...item, done: event.target.checked } : item)
                  const allDone = subtasks.every(item => item.done)
                  return { ...currentTask, subtasks, status: allDone ? 'done' : 'current' }
                }).map((currentTask, currentIndex, all) => currentTask.status === 'locked' && all[currentIndex - 1]?.status === 'done' ? { ...currentTask, status: 'current' } : currentTask))
              }} /><span className={subtask.done ? 'completed' : ''}>{subtask.text}</span><small>{subtask.who}</small><b>+{subtask.pts}đ</b></label>)}</div></article>
          })}</div>
        </TaskSubpanel>
        <TaskSubpanel name="rewards">
          <article className="kd-widget kd-wallet"><div className="kd-person-avatar">TA</div><div><strong>Trần Anh — Trưởng phòng Kinh doanh</strong><p>Điểm khả dụng để đổi quà</p></div><b>{wallet.toLocaleString('vi-VN')} điểm</b></article>
          <div className="kd-rewards">{rewards.map(([name, cost, color, icon]) => <article className="reward-card" key={name}><span style={{ color }}>{icon}</span><strong>{name}</strong><b>{cost.toLocaleString('vi-VN')} điểm</b><button disabled={wallet < cost} style={wallet >= cost ? primaryButton : buttonStyle} onClick={() => { setWallet(current => current - cost); setRedeemed(current => [{ name, cost, date: new Date().toLocaleDateString('vi-VN') }, ...current]) }}>{wallet >= cost ? 'Đổi ngay' : 'Không đủ điểm'}</button></article>)}</div>
          <article className="kd-widget"><h3>Lịch sử đổi quà gần đây</h3>{[...redeemed, { name: 'Voucher nhà hàng', cost: 500, date: '18/09' }, { name: 'Phiếu ăn trưa miễn phí', cost: 300, date: '10/09' }].slice(0, 5).map((item, index) => <div className="kd-rank-row" key={`${item.name}-${index}`}><span>{index < redeemed.length ? 'Trần Anh' : index === redeemed.length ? 'Hoàng Yến Nhi' : 'Đặng Quốc Cường'} — {item.name}</span><strong>-{item.cost} điểm · {item.date}</strong></div>)}</article>
        </TaskSubpanel>
        <TaskSubpanel name="leaderboard"><article className="kd-widget"><div className="kd-list-head kd-leader-head"><span>Hạng</span><span>Nhân sự</span><span>Phòng ban</span><span>Điểm tuần này</span><span>Tổng điểm</span></div>{leaderboard.map((person, index) => <div className="kd-leader-row" key={person.name}><b>{index + 1}</b><strong><i style={{ background: `${person.color}22`, color: person.color }}>{initials(person.name)}</i>{person.name}</strong><span>{person.team}</span><span>{person.week} đ</span><b>{person.total.toLocaleString('vi-VN')} đ</b></div>)}</article></TaskSubpanel>
      </section>}
    </div>

    {leadModal && <Modal title={leadModal === 'new' ? 'Thêm khách hàng tiềm năng' : 'Chỉnh sửa lead'} width={720} onClose={() => setLeadModal(null)}>
      <p className="kd-modal-subtitle">Điền thông tin theo 3 cấp độ — càng đầy đủ, hồ sơ chuyển giao sang thi công càng chính xác.</p>
      <div className="kd-modal-tabs">{[['Cơ bản', 0], ['Chi tiết', 1], ['Nâng cao', 2]].map(([label, index]) => <button className={leadStep === index ? 'active' : ''} key={label} onClick={() => setLeadStep(index)}>{index + 1}. {label}</button>)}</div>
      <div className="kd-modal-body">
        {leadStep === 0 && <div className="kd-form-grid">
          <Field label="Tên khách hàng *"><input value={leadForm.name} onChange={event => updateForm('name', event.target.value)} placeholder="VD: Anh Nguyễn Văn Phú" autoFocus /></Field>
          <Field label="Số điện thoại *"><input value={leadForm.phone} onChange={event => updateForm('phone', event.target.value)} placeholder="09xx xxx xxx" /></Field>
          <Field label="Email"><input value={leadForm.email} onChange={event => updateForm('email', event.target.value)} placeholder="khachhang@email.com" /></Field>
          <Field label="Nguồn khách hàng"><select value={leadForm.source} onChange={event => updateForm('source', event.target.value)}>{['Giới thiệu', 'Website', 'Mạng xã hội', 'Sự kiện', 'Khác'].map(value => <option key={value}>{value}</option>)}</select></Field>
          <Field label="Địa chỉ"><input value={leadForm.address} onChange={event => updateForm('address', event.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện" /></Field>
          <Field label="Phòng ban phụ trách"><select value={leadForm.dept} onChange={event => updateForm('dept', event.target.value)}><option value="dan-dung">Phòng KD Dân dụng</option><option value="du-an">Phòng KD Dự Án</option></select></Field>
          <div className="kd-assignee-editor"><b>Người phụ trách</b><div>{leadForm.assignees.map((person, index) => <span className="lm-assignee-chip" key={`${person.name}-${index}`}><i>{initials(person.name)}</i>{person.name}{person.role && <small>· {person.role}</small>}<button onClick={() => updateForm('assignees', leadForm.assignees.filter((_, itemIndex) => itemIndex !== index))}>×</button></span>)}</div><div className="kd-inline-fields"><input placeholder="Họ tên" value={assigneeForm.name} onChange={event => setAssigneeForm(current => ({ ...current, name: event.target.value }))} /><input placeholder="Vai trò (VD: Sale phụ trách, Kỹ thuật...)" value={assigneeForm.role} onChange={event => setAssigneeForm(current => ({ ...current, role: event.target.value }))} /><button style={buttonStyle} onClick={() => { if (!assigneeForm.name.trim()) return; updateForm('assignees', [...leadForm.assignees, { name: assigneeForm.name.trim(), role: assigneeForm.role.trim() }]); setAssigneeForm({ name: '', role: '' }) }}>＋ Thêm</button></div></div>
        </div>}
        {leadStep === 1 && <div className="kd-form-grid">
          <Field label="Loại dự án"><select value={leadForm.projectType} onChange={event => updateForm('projectType', event.target.value)}>{['Nhà phố', 'Biệt thự', 'Chung cư', 'Văn phòng', 'Khác'].map(value => <option key={value}>{value}</option>)}</select></Field>
          <Field label="Quy mô"><input value={leadForm.scale} onChange={event => updateForm('scale', event.target.value)} placeholder="VD: 5x20m, 1 trệt 3 lầu" /></Field>
          <Field label="Hạng mục quan tâm"><details className="kd-category-picker"><summary>{leadForm.categories.length ? leadForm.categories.join(', ') : 'Chọn hạng mục...'}</summary><div>{categories.map(value => <label key={value}><input type="checkbox" checked={leadForm.categories.includes(value)} onChange={event => updateForm('categories', event.target.checked ? [...leadForm.categories, value] : leadForm.categories.filter(item => item !== value))} />{value}</label>)}</div></details></Field>
          <Field label="Giá trị ước tính (tỷ)"><input inputMode="decimal" value={leadForm.value} onChange={event => updateForm('value', event.target.value)} placeholder="VD: 2.5" /></Field>
          <Field label="Giai đoạn hiện tại"><select value={leadForm.stage} onChange={event => updateForm('stage', event.target.value)}>{stages.slice(0, 6).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
        </div>}
        {leadStep === 2 && <div className="kd-form-grid">
          <Field label="BOQ (Bảng khối lượng dự toán)"><input type="file" accept=".xlsx,.pdf" onChange={event => updateForm('boqFile', event.target.files?.[0]?.name || '')} />{leadForm.boqFile && <small>📎 {leadForm.boqFile}</small>}</Field>
          <Field label="Concept / Ý tưởng thiết kế"><textarea rows="3" value={leadForm.concept} onChange={event => updateForm('concept', event.target.value)} placeholder="Mô tả phong cách, ý tưởng thiết kế mong muốn của khách hàng..." /></Field>
          <Field label="Ghi chú nội bộ"><textarea rows="2" value={leadForm.notes} onChange={event => updateForm('notes', event.target.value)} placeholder="Ghi chú cho đội kinh doanh / kỹ thuật..." /></Field>
          <label className="kd-checkbox"><input type="checkbox" checked={leadForm.partner} onChange={event => updateForm('partner', event.target.checked)} />Chuyển giao cho đối tác thi công/thiết kế ngoài</label>
        </div>}
      </div>
      <footer className="kd-modal-footer"><span>Bước {leadStep + 1}/3 — {['Cơ bản', 'Chi tiết', 'Nâng cao'][leadStep]}</span><div>{leadStep > 0 && <button style={buttonStyle} onClick={() => setLeadStep(leadStep - 1)}>Quay lại</button>}{leadStep < 2 ? <button style={primaryButton} onClick={() => leadStep === 0 && !leadForm.name.trim() ? undefined : setLeadStep(leadStep + 1)}>Tiếp theo</button> : <button style={primaryButton} onClick={saveLead}>{leadModal === 'new' ? 'Lưu khách hàng' : 'Lưu thay đổi'}</button>}</div></footer>
    </Modal>}

    {detail && <Modal title={detail.name} onClose={() => setDetailLead(null)}>
      <div className="kd-detail-stage" style={{ background: stageAccent(detail.stage)?.bg || 'var(--sales-tint)', color: stageAccent(detail.stage)?.color || 'var(--sales)' }}>{stageLabels[detail.stage]}</div>
      <div className="kd-detail-body"><div className="kd-detail-grid">{[['Số điện thoại', detail.phone], ['Email', detail.email], ['Nguồn khách hàng', detail.source], ['Địa chỉ', detail.address], ['Phòng ban phụ trách', departments[detail.dept]], ['Loại dự án', detail.projectType || detail.type], ['Quy mô', detail.scale], ['Giá trị ước tính', formatValue(detail.value)], ['Người phụ trách', detail.assignees?.map(person => `${person.name}${person.role ? ` · ${person.role}` : ''}`).join(', ')], ['Hạng mục quan tâm', detail.categories?.join(', ')], ['File đính kèm', detail.boqFile], ['Concept / Ý tưởng thiết kế', detail.concept], ['Ghi chú nội bộ', detail.notes]].filter(([, value]) => value).map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
        {detail.handoff && <p className="kd-detail-handoff">Bàn giao / Báo giá: {detail.handoff.status === 'self-quoted' ? 'Phòng KD tự đề xuất báo giá' : `Đang chờ Phòng ${detail.handoff.dept} xác nhận`}</p>}
      </div><footer className="kd-modal-footer"><span></span><button style={primaryButton} onClick={() => { setDetailLead(null); openLead(detail) }}>Chỉnh sửa / bổ sung thông tin</button></footer>
    </Modal>}

    {handoff && handoffConfig && handingLead && <Modal title={handoffConfig.title} onClose={() => setHandoff(null)} width={460}>
      <p className="kd-modal-subtitle">{handoffConfig.subtitle}</p><div className="kd-handoff-content">
        <div className="kd-handoff-lead"><strong>{handingLead.name}</strong><span>{handingLead.type} · {formatValue(handingLead.value)} · {departments[handingLead.dept]}</span></div>
        <Field label="Ngày giờ hẹn (dự kiến)"><input type="datetime-local" value={handoffForm.date} onChange={event => setHandoffForm(current => ({ ...current, date: event.target.value }))} /></Field>
        <Field label={`Người phụ trách bên ${handoffConfig.dept} (nếu đã biết)`}><input value={handoffForm.assignee} onChange={event => setHandoffForm(current => ({ ...current, assignee: event.target.value }))} placeholder="Nhập tên người phụ trách" /></Field>
        <p className="kd-handoff-note">Phòng {handoffConfig.dept} sẽ xác nhận lại ngày giờ và người phụ trách chính xác ngay khi nhận được thông báo.</p>
        <div className="kd-modal-footer"><button style={buttonStyle} onClick={() => setHandoff(null)}>Huỷ</button><button style={primaryButton} onClick={() => saveHandoff(false)}>Gửi yêu cầu đến Phòng {handoffConfig.dept}</button></div>
        {handoffConfig.self && <button className="kd-self-quote" onClick={() => saveHandoff(true)}>Phòng KD tự đề xuất báo giá</button>}
      </div>
    </Modal>}

    {taskModal && <Modal title="Tạo nhiệm vụ mới" onClose={() => setTaskModal(false)} width={460}>
      <div className="kd-handoff-content"><p className="kd-modal-subtitle">Dành cho trưởng phòng Kinh doanh — tạo nhiệm vụ và chỉ định nhân sự tham gia.</p>
        <Field label="Tên nhiệm vụ *"><input autoFocus value={taskForm.name} onChange={event => setTaskForm(current => ({ ...current, name: event.target.value }))} placeholder="VD: Gọi lại 5 khách hàng chưa phản hồi" /></Field>
        <Field label="Thuộc bước quy trình"><select value={taskForm.step} onChange={event => setTaskForm(current => ({ ...current, step: Number(event.target.value) }))}>{tasks.map((task, index) => <option key={task.title} value={index}>{index + 1}. {task.title}</option>)}</select></Field>
        <Field label="Nhân sự tham gia"><input value={taskForm.assignee} onChange={event => setTaskForm(current => ({ ...current, assignee: event.target.value }))} placeholder="VD: Hoàng Yến Nhi, Đặng Quốc Cường" /></Field>
        <Field label="Điểm thưởng"><input inputMode="numeric" value={taskForm.points} onChange={event => setTaskForm(current => ({ ...current, points: event.target.value }))} /></Field>
        <div className="kd-modal-footer"><button style={buttonStyle} onClick={() => setTaskModal(false)}>Huỷ</button><button style={primaryButton} onClick={() => {
          if (!taskForm.name.trim()) return
          setTasks(current => current.map((task, index) => index === taskForm.step ? { ...task, status: task.status === 'done' ? 'current' : task.status, subtasks: [...task.subtasks, { text: taskForm.name.trim(), who: taskForm.assignee.trim() || 'Chưa gán', pts: Math.max(0, Number(taskForm.points) || 0), done: false }] } : task))
          setTaskModal(false)
        }}>Tạo nhiệm vụ</button></div>
      </div>
    </Modal>}
  </PageShell>
}
