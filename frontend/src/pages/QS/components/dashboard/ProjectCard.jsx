import Icon from '../../../../components/ui/Icon'
import DraftItem from './DraftItem'

export default function ProjectCard({ project, activeDraftId, onUse }) {
  const sub = project.client
    ? (project.phone ? `${project.client} · ${project.phone}` : project.client)
    : 'Chưa có khách hàng'
  return (
    <div className="qs-dash-project">
      <div className="qs-dash-project-head">
        <div className="qs-dash-project-icon"><Icon name="building" size={18} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="qs-dash-project-name" title={project.name}>{project.name}</div>
          <div className="qs-dash-project-sub" title={sub}>{sub}</div>
        </div>
        <span className={`qs-dash-link${project.linked ? ' on' : ''}`} title={project.linked ? 'Đã gắn link' : 'Chưa gắn link'}>
          <Icon name="link" size={13} />
        </span>
        <span className="qs-dash-count">{project.drafts.length} bản</span>
        {/* TODO: xoá dự án khi có API */}
        <button className="qs-dash-trash" title="Xoá dự án"><Icon name="trash" size={13} /></button>
      </div>
      <div className="qs-dash-project-body">
        {project.drafts.map(d => (
          <DraftItem key={d.id} draft={d} active={d.id === activeDraftId} onUse={() => onUse(project.id, d.id)} />
        ))}
        {/* TODO: thêm bản nháp khi có API */}
        <button className="qs-dash-add-draft"><Icon name="plus" size={14} />Thêm bản nháp</button>
      </div>
    </div>
  )
}
