import { useEffect, useMemo, useState } from 'react'
import Icon from '../../../../components/ui/Icon'
import ProjectCard from './ProjectCard'

/* Danh sách dự án + ô tìm kiếm (lọc theo tên dự án / khách hàng, debounce 300ms) */
export default function ProjectList({ projects, active, onUse, onCreate }) {
  const [query, setQuery] = useState('')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setKeyword(query.trim().toLowerCase()), 300)
    return () => clearTimeout(t)
  }, [query])

  const shown = useMemo(() => (
    keyword
      ? projects.filter(p => p.name.toLowerCase().includes(keyword) || (p.client || '').toLowerCase().includes(keyword))
      : projects
  ), [projects, keyword])

  return (
    <div className="qs-card qs-dash-list">
      <div className="qs-dash-list-head">
        <Icon name="home" size={18} className="qs-dash-accent" />
        <h3 className="qs-dash-title">Danh sách dự án</h3>
        <span className="qs-dash-count">{projects.length}</span>
        <span style={{ flex: 1 }} />
        <div className="qs-dash-search">
          <Icon name="search" size={14} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm dự án, khách hàng…" />
        </div>
        <button className="qs-dash-create" onClick={onCreate}>Tạo dự án</button>
      </div>
      {shown.length
        ? (
          <div className="qs-dash-project-grid">
            {shown.map(p => (
              <ProjectCard key={p.id} project={p} activeDraftId={p.id === active.projectId ? active.draftId : null} onUse={onUse} />
            ))}
          </div>
        )
        : <div className="qs-dash-empty">Không tìm thấy dự án phù hợp.</div>}
    </div>
  )
}
