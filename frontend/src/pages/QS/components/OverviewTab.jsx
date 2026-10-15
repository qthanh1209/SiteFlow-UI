import { useEffect, useState } from 'react'
import { createProject, createDraft, draftTotals, formatVnd, kdQuoteProjects } from '../../../data/qsDashboardData'
import { loadKdRequests } from '../../../services/kdRequestService'
import { storage } from '../../../services/storageService'
import KpiCard from './dashboard/KpiCard'
import ProjectList from './dashboard/ProjectList'
import GroupValueCard from './dashboard/GroupValueCard'
import QuickActions from './dashboard/QuickActions'
import CreateProjectModal from './dashboard/CreateProjectModal'

/* Dự án từ Kinh doanh mà QS đã xoá: lưu lại để lần đồng bộ sau không hiện lại */
const HIDDEN_KD_KEY = 'qs-hidden-kd-projects'
const loadHiddenKd = () => new Set(storage.get(HIDDEN_KD_KEY, []))

/* Bản nháp rỗng khi danh sách không còn dự án nào */
const EMPTY_DRAFT = { id: null, vat: 0, lines: 0, cost: 0, groups: [] }

/* Gộp dự án từ phiếu yêu cầu báo giá (Kinh doanh) vào danh sách: phiếu mới lên đầu,
   phiếu đã có thì cập nhật trạng thái (giữ bản nháp QS đã thêm), phiếu bị từ chối hoặc đã xoá thì gỡ */
function mergeKdProjects(list) {
  const hidden = loadHiddenKd()
  const fresh = kdQuoteProjects(loadKdRequests()).filter(p => !hidden.has(p.id))
  const freshById = new Map(fresh.map(p => [p.id, p]))
  const kept = list
    .filter(p => !p.request || freshById.has(p.id))
    .map(p => (p.request ? { ...p, request: freshById.get(p.id).request } : p))
  const known = new Set(kept.map(p => p.id))
  return [...fresh.filter(p => !known.has(p.id)), ...kept]
}

/* Tab "Bảng điều khiển": banner + KPI + nhóm giá trị đều tính theo bản nháp đang làm việc */
export default function OverviewTab({ projects, onProjects: setProjects, active, onActive: setActive, onGoto }) {
  const [creating, setCreating] = useState(false)

  /* Trang Kinh doanh / Chat lưu phiếu ở localStorage: đồng bộ lại khi tab khác ghi hoặc quay lại cửa sổ */
  useEffect(() => {
    const sync = () => setProjects(mergeKdProjects)
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  /* Dự án / bản nháp đang làm việc bị gỡ (xoá, phiếu bị từ chối) thì chuyển sang dự án đầu danh sách */
  const project = projects.find(p => p.id === active.projectId) || projects[0]
  const draft = (project && (project.drafts.find(d => d.id === active.draftId) || project.drafts[0])) || EMPTY_DRAFT
  const t = draftTotals(draft)
  const current = { projectId: project ? project.id : null, draftId: draft.id }

  function deleteProject(p) {
    if (!window.confirm(`Xoá dự án "${p.name}" cùng ${p.drafts.length} bản nháp?`)) return
    if (p.request) storage.set(HIDDEN_KD_KEY, [...loadHiddenKd(), p.id])
    setProjects(list => list.filter(x => x.id !== p.id))
  }
  function deleteDraft(p, d) {
    if (!window.confirm(`Xoá "${d.name}" của dự án "${p.name}"?`)) return
    setProjects(list => list.map(x => (x.id === p.id ? { ...x, drafts: x.drafts.filter(y => y.id !== d.id) } : x)))
  }

  /* Thêm bản nháp trống vào dự án và chuyển sang dùng luôn bản đó */
  const addDraft = projectId => {
    const target = projects.find(p => p.id === projectId)
    if (!target) return
    const created = createDraft(target)
    setProjects(list => list.map(p => (p.id === projectId ? { ...p, drafts: [...p.drafts, created] } : p)))
    setActive({ projectId, draftId: created.id })
  }

  return (
    <>
      <div className="qs-dash-main">
        <ProjectList
          projects={projects}
          active={current}
          onUse={(projectId, draftId) => { setActive({ projectId, draftId }); onGoto('breakdown') }}
          onAddDraft={addDraft}
          onCreate={() => setCreating(true)}
          onDeleteProject={deleteProject}
          onDeleteDraft={deleteDraft}
        />
        <div className="qs-dash-side">
          {/* Lợi nhuận của bản nháp đang dùng */}
          <KpiCard icon="gauge" tone="green" value={formatVnd(t.profit)} label="Lợi nhuận" note={`${t.margin.toFixed(1)}% biên`} positive />
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
