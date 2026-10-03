import { useState } from 'react'
import { Link } from 'react-router-dom'
import './ChamCong.css'
import { useTheme } from '../../hooks/useTheme'
import AttendanceTab from './components/AttendanceTab'
import HoSoTab from './components/HoSoTab'
import BangLuongTab from './components/BangLuongTab'
import HanhChinhTab from './components/HanhChinhTab'
import TuyenDungTab from './components/TuyenDungTab'
import Dezbot, { loadAiPanelWidth } from './components/Dezbot'

const HR_TABS = [
  { key: 'cham-cong', label: 'Chấm công' },
  { key: 'ho-so', label: 'Hồ sơ nhân sự' },
  { key: 'bang-luong', label: 'Bảng lương' },
  { key: 'hanh-chinh', label: 'Hành chính' },
  { key: 'tuyen-dung', label: 'Tuyển dụng' },
]

export default function ChamCong() {
  const { theme, toggleTheme } = useTheme()
  const [tab, setTab] = useState('cham-cong')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiWidth, setAiWidth] = useState(loadAiPanelWidth)
  const [aiResizing, setAiResizing] = useState(false)

  const show = key => ({ display: tab === key ? 'flex' : 'none' })

  return (
    <div
      className={`cc-page${aiOpen ? ' cc-ai-open' : ''}${aiResizing ? ' cc-ai-resizing' : ''}`}
      style={{ '--ai-panel-width': `${aiWidth}px` }}
    >
      <div className="cc-header">
        <span className="cc-crumb">Chung cư Riverside</span>
        <span className="cc-crumb">/</span>
        <span className="cc-crumb">Giai đoạn 2</span>
        <span className="cc-crumb">/</span>
        <span className="cc-crumb-current">HR</span>
        <span style={{ flex: 1 }} />
        <Link to="/cham-cong-mobile" className="cc-mobile-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
          Xem giao diện mobile
        </Link>
        <button className="cc-theme-toggle" title="Chuyển giao diện sáng/tối" onClick={toggleTheme}>
          {theme === 'dark'
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" /></svg>}
        </button>
      </div>

      <div className="cc-tabs-row">
        {HR_TABS.map(t => (
          <button key={t.key} className={`cc-hr-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* Các tab luôn được mount (ẩn bằng display) để giữ trạng thái khi chuyển tab, giống bản HTML */}
      <div className="cc-hr-panel" style={show('cham-cong')}>
        <AttendanceTab />
      </div>
      <div className="cc-hr-panel cc-scroll" style={{ ...show('ho-so'), gap: 16 }}>
        <HoSoTab />
      </div>
      <div className="cc-hr-panel cc-scroll" style={{ ...show('bang-luong'), gap: 16 }}>
        <BangLuongTab />
      </div>
      <div className="cc-hr-panel cc-scroll" style={{ ...show('hanh-chinh'), gap: 16 }}>
        <HanhChinhTab />
      </div>
      <div className="cc-hr-panel cc-scroll" style={{ ...show('tuyen-dung'), gap: 16 }}>
        <TuyenDungTab />
      </div>

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
