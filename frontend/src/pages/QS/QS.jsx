import { useState } from 'react'
import './QS.css'
import { useTheme } from '../../hooks/useTheme'
import { QS_TABS } from '../../data/qsData'
import OverviewTab from './components/OverviewTab'
import ProjectsTab from './components/ProjectsTab'
import BreakdownTab from './components/BreakdownTab'
import ProductsTab from './components/ProductsTab'
import QuoteTab from './components/QuoteTab'
import PurchaseTab from './components/PurchaseTab'
import Dezbot, { loadAiPanelWidth } from './components/Dezbot'

/* Hướng bố cục và khoảng cách của từng tab (giống style inline của các .qs-panel trong bản HTML) */
const PANEL_LAYOUT = {
  overview: { flexDirection: 'column', gap: 16 },
  projects: { flexDirection: 'column', gap: 16 },
  breakdown: { flexDirection: 'column', gap: 14 },
  products: { flexDirection: 'row', gap: 16, minHeight: 0 },
  quote: { flexDirection: 'column', gap: 14 },
  po: { flexDirection: 'column', gap: 16 },
}

export default function QS() {
  const { theme, toggleTheme } = useTheme()
  const [tab, setTab] = useState('overview')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiWidth, setAiWidth] = useState(loadAiPanelWidth)
  const [aiResizing, setAiResizing] = useState(false)

  const panel = key => ({ display: tab === key ? 'flex' : 'none', ...PANEL_LAYOUT[key] })

  return (
    <div
      className={`qs-page${aiOpen ? ' qs-ai-open' : ''}${aiResizing ? ' qs-ai-resizing' : ''}`}
      style={{ '--ai-panel-width': `${aiWidth}px` }}
    >
      <div className="qs-header">
        <span className="qs-crumb">Chung cư Riverside</span>
        <span className="qs-crumb">/</span>
        <span className="qs-crumb-current">QS — Bóc tách &amp; Báo giá</span>
        <span style={{ flex: 1 }} />
        <button className="qs-theme-toggle" title="Chuyển giao diện sáng/tối" onClick={toggleTheme}>
          {theme === 'dark'
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" /></svg>}
        </button>
      </div>

      <div className="qs-tabs-row">
        {QS_TABS.map(t => (
          <button key={t.key} className={`qs-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* Các tab luôn được mount (ẩn bằng display) để giữ trạng thái bộ lọc, giống bản HTML */}
      <div className="qs-scroll">
        <div style={panel('overview')}><OverviewTab onGoto={setTab} /></div>
        <div style={panel('projects')}><ProjectsTab onGoto={setTab} /></div>
        <div style={panel('breakdown')}><BreakdownTab /></div>
        <div style={panel('products')}><ProductsTab /></div>
        <div style={panel('quote')}><QuoteTab /></div>
        <div style={panel('po')}><PurchaseTab /></div>
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
