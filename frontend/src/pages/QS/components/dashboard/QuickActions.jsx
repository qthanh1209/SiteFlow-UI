import Icon from '../../../../components/ui/Icon'
import { DASH_QUICK_ACTIONS } from '../../../../data/qsDashboardData'

export default function QuickActions({ onGoto }) {
  return (
    <div className="qs-card">
      <div className="qs-dash-side-head"><Icon name="sliders" size={18} className="qs-dash-accent" /><h3 className="qs-dash-title">Thao tác nhanh</h3></div>
      <div className="qs-dash-quick">
        {DASH_QUICK_ACTIONS.map(a => (
          /* TODO: các thao tác có tab = null chưa có màn tương ứng */
          <button key={a.key} className="qs-dash-quick-item" onClick={a.tab ? () => onGoto(a.tab) : undefined}>
            <Icon name={a.icon} size={20} className="qs-dash-accent" />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
