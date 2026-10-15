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
import ImportTab from './components/ImportTab'
import Dezbot, { loadAiPanelWidth } from './components/Dezbot'
import DeptStaff from '../../components/hr/DeptStaff'

/* Hướng bố cục và khoảng cách của từng tab (giống style inline của các .qs-panel trong bản HTML) */
const PANEL_LAYOUT = {
  overview: { flexDirection: 'column', gap: 10 },
  projects: { flexDirection: 'column', gap: 8, minHeight: '100%' },
  breakdown: { flexDirection: 'column', gap: 10, height: '100%', minHeight: 560 },
  cost: { flexDirection: 'column', gap: 8, minHeight: '100%' },
  catalog: { flexDirection: 'row', gap: 10, height: '100%', minHeight: 560 },
  quote: { flexDirection: 'column', gap: 8, height: '100%', minHeight: 560 },
  po: { flexDirection: 'column', gap: 8 },
  import: { flexDirection: 'column', gap: 10 },
  nhansu: { flexDirection: 'column' },
}

export default function QS() {
  const { theme, toggleTheme } = useTheme()
  const [tab, setTab] = useState('overview')
  /* Danh sách dự án + bản nháp đang làm việc, dùng chung cho Bảng điều khiển và tab Bóc tách */
  const [projects, setProjects] = useState(DASH_PROJECTS)
  const [active, setActive] = useState(DASH_DEFAULT_ACTIVE)
  /* Dự án đang làm việc (chọn ở header); dự án bị xoá thì lấy dự án đầu danh sách */
  const project = projects.find(p => p.id === active.projectId) || projects[0]
  const draft = project && (project.drafts.find(d => d.id === active.draftId) || project.drafts[0])
  const current = draft ? { projectId: project.id, draftId: draft.id } : active
  const selectProject = id => setActive({ projectId: id, draftId: projects.find(p => p.id === id).drafts[0].id })
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
        <div className="qs-tabs-row hdr-tabs">
          {QS_TABS.map(t => (
            <button key={t.key} className={`qs-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>
        <label className="qs-header-project" title={`Dự án: ${project.name} · ${project.drafts[0].code}`}>
          <Icon name="building" size={14} />
          <select value={project.id} onChange={e => selectProject(e.target.value)}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Icon name="chevronDown" size={14} />
        </label>
        <div className="qs-top-actions">
          <button className="qs-top-btn" onClick={() => setTab('catalog')}><Icon name="listLines" size={14} /><span>Danh sách sản phẩm</span></button>
          {/* TODO: thông báo chưa có màn tương ứng */}
          <button className="qs-top-btn primary" onClick={() => setTab('import')}><Icon name="upload" size={14} /><span>Nhập dữ liệu</span></button>
          <button className="qs-top-btn icon" title="Chuyển giao diện sáng/tối" onClick={toggleTheme}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          </button>
          <button className="qs-top-btn icon" title="Thông báo"><Icon name="bell" size={15} /><span className="qs-top-badge">1</span></button>
        </div>
      </div>

      {/* Các tab luôn được mount (ẩn bằng display) để giữ trạng thái bộ lọc, giống bản HTML */}
      <div className="qs-scroll qs-scroll-dash">
        <div style={panel('overview')}><OverviewTab projects={projects} onProjects={setProjects} active={active} onActive={setActive} onGoto={setTab} /></div>
        <div style={panel('projects')}><ProjectsTab project={project} sheet={sheet} onGoto={setTab} /></div>
        <div style={panel('breakdown')}><BreakdownTab sheet={sheet} vat={vat} onVat={setVat} projects={projects} active={current} onActive={setActive} /></div>
        <div style={panel('cost')}><CostTab project={project} sheet={sheet} vat={vat} onVat={setVat} onGoto={setTab} /></div>
        {/* Danh sách sản phẩm không nằm trên thanh tab, mở bằng nút "Danh sách sản phẩm" */}
        <div style={panel('catalog')}><ProductsTab onGoto={setTab} /></div>
        <div style={panel('quote')}><QuoteTab sheet={sheet} vat={vat} onVat={setVat} projects={projects} active={current} onActive={setActive} /></div>
        <div style={panel('po')}><PurchaseTab sheet={sheet} vat={vat} onGoto={setTab} /></div>
        {/* Nhập dữ liệu cũng không nằm trên thanh tab, mở bằng nút "Nhập dữ liệu" */}
        <div style={panel('import')}><ImportTab active={tab === 'import'} onGoto={setTab} /></div>
        <div style={panel('nhansu')}><DeptStaff units={['qs']} /></div>
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
