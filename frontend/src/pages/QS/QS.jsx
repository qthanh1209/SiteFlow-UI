import { useState } from 'react'
import './QS.css'
import { useTheme } from '../../hooks/useTheme'
import { QS_TABS } from '../../data/qsData'
import { DASH_PROJECTS, DASH_DEFAULT_ACTIVE } from '../../data/qsDashboardData'
import Icon from '../../components/ui/Icon'
import OverviewTab from './components/OverviewTab'
import ProjectsTab from './components/ProjectsTab'
import BreakdownTab from './components/BreakdownTab'
import ProductsTab from './components/ProductsTab'
import CostTab from './components/CostTab'
import { useSheetHistory } from './components/breakdown/useSheetHistory'
import { INITIAL_GROUPS } from '../../data/qsBreakdownData'
import QuoteTab from './components/QuoteTab'
import PurchaseTab from './components/PurchaseTab'
import Dezbot, { loadAiPanelWidth } from './components/Dezbot'

/* Hướng bố cục và khoảng cách của từng tab (giống style inline của các .qs-panel trong bản HTML) */
const PANEL_LAYOUT = {
  overview: { flexDirection: 'column', gap: 10 },
  projects: { flexDirection: 'column', gap: 8, minHeight: '100%' },
  breakdown: { flexDirection: 'column', gap: 10, height: '100%', minHeight: 560 },
  cost: { flexDirection: 'column', gap: 8, minHeight: '100%' },
  catalog: { flexDirection: 'row', gap: 16, minHeight: 0 },
  quote: { flexDirection: 'column', gap: 8, height: '100%', minHeight: 600 },
  po: { flexDirection: 'column', gap: 8 },
}

export default function QS() {
  const { theme, toggleTheme } = useTheme()
  const [tab, setTab] = useState('overview')
  /* Dự án đang làm việc, dùng chung cho các tab Bóc tách / Chi phí / Xuất báo giá / Dự án (chọn ở header) */
  const [projectId, setProjectId] = useState(DASH_DEFAULT_ACTIVE.projectId)
  const project = DASH_PROJECTS.find(p => p.id === projectId)
  /* Bảng bóc tách + VAT dùng chung cho tab Bóc tách và tab Chi phí */
  const sheet = useSheetHistory(INITIAL_GROUPS)
  const [vat, setVat] = useState(0)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiWidth, setAiWidth] = useState(loadAiPanelWidth)
  const [aiResizing, setAiResizing] = useState(false)

  const panel = key => ({ display: tab === key ? 'flex' : 'none', ...PANEL_LAYOUT[key] })

  return (
    <div
      className={`qs-page${aiOpen ? ' qs-ai-open' : ''}${aiResizing ? ' qs-ai-resizing' : ''}`}
      style={{ '--ai-panel-width': `${aiWidth}px` }}
    >
      {/* Header một hàng: tiêu đề + tab (kiểu pill của trang Quản lý dự án) + nút thao tác */}
      <div className="qs-header">
        <div className="qs-header-icon"><Icon name="layers" size={16} /></div>
        <span className="qs-header-title">QS</span>
        <div className="qs-tabs-row">
          {QS_TABS.map(t => (
            <button key={t.key} className={`qs-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>
        <label className="qs-header-project" title={`Dự án: ${project.name} · ${project.drafts[0].code}`}>
          <Icon name="building" size={14} />
          <select value={projectId} onChange={e => setProjectId(e.target.value)}>
            {DASH_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Icon name="chevronDown" size={14} />
        </label>
        <div className="qs-top-actions">
          <button className={`qs-top-btn${tab === 'catalog' ? ' on' : ''}`} title="Danh sách sản phẩm" onClick={() => setTab('catalog')}><Icon name="listLines" size={14} /><span>Danh sách sản phẩm</span></button>
          {/* TODO: Nhập dữ liệu / thông báo chưa có màn tương ứng */}
          <button className="qs-top-btn primary" title="Nhập dữ liệu"><Icon name="upload" size={14} /><span>Nhập dữ liệu</span></button>
          <button className="qs-top-btn icon" title="Chuyển giao diện sáng/tối" onClick={toggleTheme}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          </button>
          <button className="qs-top-btn icon" title="Thông báo"><Icon name="bell" size={15} /><span className="qs-top-badge">1</span></button>
        </div>
      </div>

      {/* Các tab luôn được mount (ẩn bằng display) để giữ trạng thái bộ lọc, giống bản HTML */}
      <div className={`qs-scroll${tab === 'catalog' ? '' : ' qs-scroll-dash'}`}>
        <div style={panel('overview')}><OverviewTab onGoto={setTab} onPickProject={id => { if (DASH_PROJECTS.some(p => p.id === id)) setProjectId(id) }} /></div>
        <div style={panel('projects')}><ProjectsTab projectId={projectId} sheet={sheet} onGoto={setTab} /></div>
        <div style={panel('breakdown')}><BreakdownTab projectId={projectId} sheet={sheet} vat={vat} onVat={setVat} /></div>
        <div style={panel('cost')}><CostTab projectId={projectId} sheet={sheet} vat={vat} onVat={setVat} onGoto={setTab} /></div>
        {/* Danh sách sản phẩm không nằm trên thanh tab, mở bằng nút "Danh sách sản phẩm" */}
        <div style={panel('catalog')}><ProductsTab /></div>
        <div style={panel('quote')}><QuoteTab projectId={projectId} sheet={sheet} vat={vat} onVat={setVat} /></div>
        <div style={panel('po')}><PurchaseTab sheet={sheet} vat={vat} onGoto={setTab} /></div>
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
