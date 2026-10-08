import { useState } from 'react'
import './QS.css'
import { useTheme } from '../../hooks/useTheme'
import { QS_TABS } from '../../data/qsData'
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
  quote: { flexDirection: 'column', gap: 8, minHeight: '100%' },
  po: { flexDirection: 'column', gap: 8 },
}

export default function QS() {
  const { theme, toggleTheme } = useTheme()
  const [tab, setTab] = useState('overview')
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
      <div className="qs-topbar">
        <div className="qs-tabs-row">
          {QS_TABS.map(t => (
            <button key={t.key} className={`qs-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>
        <div className="qs-top-actions">
          <button className="qs-top-btn" onClick={() => setTab('catalog')}><Icon name="listLines" size={14} /><span>Danh sách sản phẩm</span></button>
          {/* TODO: Nhập dữ liệu / thông báo chưa có màn tương ứng */}
          <button className="qs-top-btn primary"><Icon name="upload" size={14} /><span>Nhập dữ liệu</span></button>
          <button className="qs-top-btn icon" title="Chuyển giao diện sáng/tối" onClick={toggleTheme}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          </button>
          <button className="qs-top-btn icon" title="Thông báo"><Icon name="bell" size={15} /><span className="qs-top-badge">1</span></button>
        </div>
      </div>

      {/* Các tab luôn được mount (ẩn bằng display) để giữ trạng thái bộ lọc, giống bản HTML */}
      <div className={`qs-scroll${tab === 'catalog' ? '' : ' qs-scroll-dash'}`}>
        <div style={panel('overview')}><OverviewTab onGoto={setTab} /></div>
        <div style={panel('projects')}><ProjectsTab sheet={sheet} onGoto={setTab} /></div>
        <div style={panel('breakdown')}><BreakdownTab sheet={sheet} vat={vat} onVat={setVat} /></div>
        <div style={panel('cost')}><CostTab sheet={sheet} vat={vat} onVat={setVat} onGoto={setTab} /></div>
        {/* Danh sách sản phẩm không nằm trên thanh tab, mở bằng nút "Danh sách sản phẩm" */}
        <div style={panel('catalog')}><ProductsTab /></div>
        <div style={panel('quote')}><QuoteTab sheet={sheet} vat={vat} onVat={setVat} /></div>
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
