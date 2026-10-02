import { useState, useRef, useEffect } from 'react'
import './QuanLyThietKe.css'
import { useTheme } from '../../hooks/useTheme'

import GanttTab from './components/GanttTab'
import ProjectListTab from './components/ProjectListTab'
import SetupTab from './components/SetupTab'
import TaskGameTab from './components/TaskGameTab'

const MAIN_TABS = [
  { key: 'list', label: 'Danh sách dự án' },
  { key: 'create', label: 'Thiết lập thi công' },
  { key: 'tiendo', label: 'Tiến độ' },
  { key: 'nhiemvu', label: 'Nhiệm vụ' },
]

export default function QuanLyThietKe() {
  const { theme, toggleTheme } = useTheme()
  const [mainTab, setMainTab] = useState('list')

  const [aiInput, setAiInput] = useState('')

  return (
    <div className="qlt-shell">
      {/* Topbar: title row */}
      <header className="qlt-topbar">
        <div className="qlt-topbar-left">
          <span className="qlt-page-icon" aria-hidden="true">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H10l2 2h7.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/>
            </svg>
          </span>
          <span className="qlt-topbar-title">Quản lý dự án</span>
          <span className="qlt-topbar-subtitle">
            Điểm khởi đầu — danh sách dự án, thiết lập thi công, tiến độ, nhiệm vụ &amp; luồng dữ liệu trong một nơi
          </span>
        </div>
        <div className="qlt-topbar-right">
          <button
            className="qlt-theme-toggle"
            onClick={toggleTheme}
            title="Đổi giao diện sáng/tối"
            aria-label="Đổi giao diện sáng/tối"
          >
            {theme === 'dark'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>
            }
          </button>
        </div>
      </header>

      {/* Tab nav row */}
      <div className="qlt-tabs-row">
        <nav className="qlt-nav">
          {MAIN_TABS.map(t => (
            <button key={t.key} className={mainTab === t.key ? 'active' : ''} onClick={() => setMainTab(t.key)}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="qlt-body">
        {mainTab === 'list'     && <ProjectListTab />}
        {mainTab === 'create'   && <SetupTab onGotoTab={setMainTab} />}
        {mainTab === 'tiendo'   && <GanttTab />}
        {mainTab === 'nhiemvu'  && <TaskGameTab />}
      </div>
    </div>
  )
}
