import { useRef, useState } from 'react'
import './BanLamViec.css'
import { useTheme } from '../../hooks/useTheme'
import { INITIAL_TASKS, INITIAL_REQUESTS } from '../../data/banLamViecData'
import OverviewTab from './components/OverviewTab'
import DonTuTab from './components/DonTuTab'
import AddTaskModal from './components/AddTaskModal'
import DonTuModal from './components/DonTuModal'
import Dezbot, { loadAiPanelWidth } from './components/Dezbot'

export default function BanLamViec() {
  const { theme, toggleTheme } = useTheme()
  const [tab, setTab] = useState('tongquan')
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const seq = useRef(100)

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  // Loại đơn đang chọn được giữ lại sau khi đóng modal (giống currentDonTuType)
  const [donTuType, setDonTuType] = useState(null)
  const [donTuOpen, setDonTuOpen] = useState(false)

  const [aiOpen, setAiOpen] = useState(false)
  const [aiWidth, setAiWidth] = useState(loadAiPanelWidth)
  const [aiResizing, setAiResizing] = useState(false)

  /* ---------- Thao tác dữ liệu ---------- */
  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }
  function addTask(data) {
    setTasks(prev => [{ id: ++seq.current, done: false, ...data }, ...prev])
  }
  function addRequest(data) {
    setRequests(prev => [{ id: ++seq.current, ...data }, ...prev])
  }
  function pickDonTuType(type) {
    setDonTuType(type)
    setDonTuOpen(true)
  }

  const panel = key => `blv-panel${tab === key ? ' active' : ''}`

  return (
    <div
      className={`blv-page${aiOpen ? ' blv-ai-open' : ''}${aiResizing ? ' blv-ai-resizing' : ''}`}
      style={{ '--ai-panel-width': `${aiWidth}px` }}
    >
      <div className="blv-header">
        <div className="blv-header-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="13" rx="2.5" /><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" /><path d="M2 13h20" /></svg>
        </div>
        <span style={{ fontSize: 14.5, fontWeight: 700 }}>Bàn làm việc của tôi</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nhiệm vụ, chấm công &amp; ngày phép cá nhân</span>
        <span style={{ flex: 1 }} />
        <button className="blv-theme-toggle" title="Chuyển giao diện sáng/tối" onClick={toggleTheme}>
          {theme === 'dark'
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" /></svg>}
        </button>
      </div>

      <div className="blv-body">

        {/* Tab con: Tổng quan / Đơn từ */}
        <div style={{ display: 'flex', gap: 6, flex: 'none' }}>
          <button className={`blv-tab${tab === 'tongquan' ? ' active' : ''}`} onClick={() => setTab('tongquan')}>Tổng quan</button>
          <button className={`blv-tab${tab === 'dontu' ? ' active' : ''}`} onClick={() => setTab('dontu')}>Đơn từ</button>
        </div>

        {/* Các tab luôn được mount (ẩn bằng class .active) để giữ vị trí cuộn, giống bản HTML */}
        <div className={panel('tongquan')} style={{ overflowY: 'auto', overflowX: 'hidden' }}>
          <OverviewTab tasks={tasks} onToggleTask={toggleTask} onAddTask={() => setTaskModalOpen(true)} />
        </div>
        <div className={panel('dontu')} style={{ overflowY: 'auto', overflowX: 'hidden', gap: 16 }}>
          <DonTuTab requests={requests} onPickType={pickDonTuType} />
        </div>
      </div>

      <AddTaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} onAdd={addTask} />
      <DonTuModal open={donTuOpen} type={donTuType} onClose={() => setDonTuOpen(false)} onSubmit={addRequest} />

      <Dezbot
        open={aiOpen}
        onToggle={() => setAiOpen(o => !o)}
        onClose={() => setAiOpen(false)}
        onResize={setAiWidth}
        onResizingChange={setAiResizing}
      />
    </div>
  )
}
