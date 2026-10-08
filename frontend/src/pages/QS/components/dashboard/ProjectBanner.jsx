import Icon from '../../../../components/ui/Icon'

/* Dải thông tin (một hàng) của dự án / bản nháp đang làm việc */
export default function ProjectBanner({ project, draft }) {
  return (
    <div className="qs-dash-banner">
      <span className="qs-dash-banner-eyebrow"><span className="qs-dash-dot" />Đang làm việc</span>
      <span className="qs-dash-banner-title">
        <Icon name="building" size={14} />
        <span title={project.name}>{project.name}</span>
        <span className="qs-dash-banner-sep">›</span>
        <span>{draft.name}</span>
      </span>
      <span className="qs-dash-banner-meta">
        <span>{draft.code}</span><span>·</span><span>Tạo {draft.date}</span><span>·</span>
        <span className="qs-dash-banner-pill">{draft.status}</span>
      </span>
    </div>
  )
}
