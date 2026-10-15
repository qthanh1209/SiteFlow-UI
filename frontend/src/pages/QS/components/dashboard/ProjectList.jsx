import { useEffect, useMemo, useState } from 'react'
import Icon from '../../../../components/ui/Icon'
import { KD_REQUEST_STATUS, draftTotals, formatVnd } from '../../../../data/qsDashboardData'
import ProjectRow from './ProjectRow'

const SORTS = [
  { key: 'default', label: 'Sắp xếp mặc định' },
  { key: 'margin-desc', label: 'Biên LN cao → thấp' },
  { key: 'margin-asc', label: 'Biên LN thấp → cao' },
  { key: 'sale', label: 'Giá bán cao → thấp' },
  { key: 'name', label: 'Tên A → Z' },
]

/* Trạng thái hiển thị của dự án: phiếu Kinh doanh theo trạng thái phiếu, dự án nội bộ theo bản nháp mới nhất */
function projectStatus(p) {
  if (p.request) {
    return { label: KD_REQUEST_STATUS[p.request.status] || KD_REQUEST_STATUS.pending, tone: p.request.status === 'approved' ? 'ok' : 'kd' }
  }
  return p.drafts[p.drafts.length - 1].lines ? { label: 'Đang bóc', tone: 'doing' } : { label: 'Bản nháp', tone: 'draft' }
}

/* Danh sách dự án theo kiểu trang Quản lý dự án: thanh lọc + KPI + bảng.
   Bấm một dòng để mở các bản nháp; dự án từ phiếu yêu cầu báo giá của Kinh doanh nằm đầu danh sách. */
export default function ProjectList({ projects, active, onUse, onCreate, onAddDraft, onDeleteProject, onDeleteDraft }) {
  const [query, setQuery] = useState('')
  const [keyword, setKeyword] = useState('')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('default')
  const [open, setOpen] = useState(() => new Set([active.projectId]))

  useEffect(() => {
    const t = setTimeout(() => setKeyword(query.trim().toLowerCase()), 300)
    return () => clearTimeout(t)
  }, [query])

  const rows = useMemo(() => projects.map(p => {
    const latest = p.drafts[p.drafts.length - 1]
    return { project: p, latest, totals: draftTotals(latest), status: projectStatus(p) }
  }), [projects])

  const statusOptions = useMemo(() => [...new Set(rows.map(r => r.status.label))], [rows])

  const shown = useMemo(() => {
    const list = rows.filter(({ project: p, status: st }) =>
      (!source || (source === 'kd') === Boolean(p.request)) &&
      (!status || st.label === status) &&
      (!keyword || `${p.name} ${p.client || ''}`.toLowerCase().includes(keyword)))
    if (sort === 'margin-desc') list.sort((a, b) => b.totals.margin - a.totals.margin)
    else if (sort === 'margin-asc') list.sort((a, b) => a.totals.margin - b.totals.margin)
    else if (sort === 'sale') list.sort((a, b) => b.totals.sale - a.totals.sale)
    else if (sort === 'name') list.sort((a, b) => a.project.name.localeCompare(b.project.name, 'vi'))
    return list
  }, [rows, source, status, keyword, sort])

  const kpi = useMemo(() => ({
    total: rows.length,
    kd: rows.filter(r => r.project.request).length,
    doing: rows.filter(r => r.status.tone === 'doing').length,
    sale: rows.reduce((s, r) => s + r.totals.sale, 0),
  }), [rows])

  function clearFilters() {
    setQuery(''); setKeyword(''); setSource(''); setStatus(''); setSort('default')
  }
  const toggle = id => setOpen(s => {
    const next = new Set(s)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  return (
    <div className="qs-pl">
      <div className="qs-pl-toolbar">
        <div className="qs-pl-search">
          <Icon name="search" size={14} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm dự án, khách hàng..." />
        </div>
        <select className="qs-pl-select" value={source} onChange={e => setSource(e.target.value)}>
          <option value="">Tất cả nguồn</option>
          <option value="kd">Từ Kinh doanh</option>
          <option value="own">Nội bộ QS</option>
        </select>
        <select className="qs-pl-select" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="qs-pl-select" value={sort} onChange={e => setSort(e.target.value)}>
          {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <button className="qs-pl-clear" onClick={clearFilters}>Xoá lọc</button>
        <span style={{ flex: 1 }} />
        <button className="qs-pl-create" onClick={onCreate}><Icon name="plus" size={13} stroke={2.4} />Tạo dự án</button>
      </div>

      <div className="qs-pl-kpis">
        <div className="qs-card qs-pl-kpi"><div className="qs-pl-kpi-label">Tổng dự án</div><div className="qs-pl-kpi-value">{kpi.total}</div></div>
        <div className="qs-card qs-pl-kpi"><div className="qs-pl-kpi-label">Từ Kinh doanh</div><div className="qs-pl-kpi-value" style={{ color: 'var(--kd)' }}>{kpi.kd}</div></div>
        <div className="qs-card qs-pl-kpi"><div className="qs-pl-kpi-label">Đang bóc</div><div className="qs-pl-kpi-value" style={{ color: 'var(--primary)' }}>{kpi.doing}</div></div>
        <div className="qs-card qs-pl-kpi"><div className="qs-pl-kpi-label">Tổng giá bán</div><div className="qs-pl-kpi-value" style={{ color: 'var(--finance)' }}>{formatVnd(kpi.sale)}</div></div>
      </div>

      <div className="qs-card qs-pl-card">
        <div className="qs-pl-grid qs-pl-head">
          <span>Dự án</span><span>Khách hàng</span><span>Bản nháp</span><span>Giá bán</span><span>Biên lợi nhuận</span><span>Trạng thái</span><span />
        </div>
        {shown.map(r => (
          <ProjectRow
            key={r.project.id}
            {...r}
            open={open.has(r.project.id)}
            onToggle={() => toggle(r.project.id)}
            activeDraftId={r.project.id === active.projectId ? active.draftId : null}
            onUse={onUse}
            onDelete={() => onDeleteProject(r.project)}
            onDeleteDraft={d => onDeleteDraft(r.project, d)}
            onAddDraft={id => { onAddDraft(id); setOpen(s => new Set(s).add(id)) }}
          />
        ))}
        {!shown.length && <div className="qs-dash-empty">Không tìm thấy dự án phù hợp với bộ lọc.</div>}
      </div>
    </div>
  )
}
