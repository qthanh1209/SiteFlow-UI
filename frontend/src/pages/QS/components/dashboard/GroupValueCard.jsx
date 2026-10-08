import Icon from '../../../../components/ui/Icon'
import { formatVnd } from '../../../../data/qsDashboardData'

/* Giá trị theo nhóm của bản nháp đang làm việc; thanh tỉ lệ theo nhóm lớn nhất */
export default function GroupValueCard({ groups }) {
  const max = Math.max(...groups.map(g => g.value), 1)
  return (
    <div className="qs-card">
      <div className="qs-dash-side-head"><Icon name="gauge" size={18} className="qs-dash-accent" /><h3 className="qs-dash-title">Giá trị theo nhóm</h3></div>
      <div className="qs-dash-groups">
        {!groups.length && <div className="qs-dash-empty" style={{ padding: 8 }}>Chưa có hạng mục.</div>}
        {groups.map(g => (
          <div key={g.name}>
            <div className="qs-dash-group-row"><span>{g.name}</span><b>{formatVnd(g.value)}</b></div>
            <div className="qs-dash-bar"><div style={{ width: `${(g.value / max) * 100}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}
