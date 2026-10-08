import Icon from '../../../../components/ui/Icon'

/* Thanh dự án đang bóc tách: tên, trạng thái, mã, tiến độ, chọn dự án */
export default function ProjectBar({ projects, projectId, onSelect, progress = 0 }) {
  const project = projects.find(p => p.id === projectId)
  const draft = project.drafts[0]
  return (
    <div className="qs-bd-bar">
      <span className="qs-bd-bar-name" title={project.name}>{project.name}</span>
      <span className="qs-bd-bar-status">{draft.status}</span>
      {/* TODO: gắn link dự án Dezon khi có API */}
      <button className="qs-bd-bar-link"><Icon name="link" size={10} />{project.linked ? 'Đã gắn link' : 'Gắn link'}</button>
      <span className="qs-bd-bar-code">Mã: {draft.code}</span>
      <span style={{ flex: 1 }} />
      <span className="qs-bd-bar-pct">{progress}%</span>
      <select className="qs-bd-bar-select" value={projectId} onChange={e => onSelect(e.target.value)}>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      {/* TODO: mở hộp thoại tạo dự án dùng chung với Bảng điều khiển */}
      <button className="qs-bd-bar-create">Tạo dự án +</button>
      <button className="qs-bd-bar-toggle" title="Thu gọn"><Icon name="chevronDown" size={14} /></button>
    </div>
  )
}
