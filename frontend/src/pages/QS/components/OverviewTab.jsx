import { useState } from 'react'
import { DASH_PROJECTS, DASH_DEFAULT_ACTIVE, createProject, draftTotals, formatVnd } from '../../../data/qsDashboardData'
import ProjectBanner from './dashboard/ProjectBanner'
import KpiCard from './dashboard/KpiCard'
import ProjectList from './dashboard/ProjectList'
import GroupValueCard from './dashboard/GroupValueCard'
import QuickActions from './dashboard/QuickActions'
import CreateProjectModal from './dashboard/CreateProjectModal'

/* Tab "Bảng điều khiển": banner + KPI + nhóm giá trị đều tính theo bản nháp đang làm việc */
export default function OverviewTab({ onGoto }) {
  const [active, setActive] = useState(DASH_DEFAULT_ACTIVE)
  const [projects, setProjects] = useState(DASH_PROJECTS)
  const [creating, setCreating] = useState(false)

  const project = projects.find(p => p.id === active.projectId)
  const draft = project.drafts.find(d => d.id === active.draftId)
  const t = draftTotals(draft)

  return (
    <>
      <ProjectBanner project={project} draft={draft} />

      <div className="qs-dash-kpi-grid">
        <KpiCard icon="listLines" tone="blue" value={t.lines} label="Dòng sản phẩm" note="toàn dự án" />
        <KpiCard icon="lock" tone="gray" value={formatVnd(t.cost)} label="Giá vốn" note="toàn dự án" />
        <KpiCard icon="banknote" tone="blue" value={formatVnd(t.sale)} label="Giá bán" note="chưa VAT" />
        <KpiCard icon="fileText" tone="gray" value={formatVnd(t.total)} label="Tổng thanh toán" note={`gồm VAT ${draft.vat}%`} />
        <KpiCard icon="gauge" tone="green" value={formatVnd(t.profit)} label="Lợi nhuận" note={`${t.margin.toFixed(1)}% biên`} positive />
      </div>

      <div className="qs-dash-main">
        <ProjectList
          projects={projects}
          active={active}
          onUse={(projectId, draftId) => setActive({ projectId, draftId })}
          onCreate={() => setCreating(true)}
        />
        <div className="qs-dash-side">
          <GroupValueCard groups={draft.groups} />
          <QuickActions onGoto={onGoto} />
        </div>
      </div>

      {creating && (
        <CreateProjectModal
          onClose={() => setCreating(false)}
          onSave={form => { setProjects(list => [createProject(form), ...list]); setCreating(false) }}
        />
      )}
    </>
  )
}
