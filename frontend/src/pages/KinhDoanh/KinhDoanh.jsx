import { useMemo, useRef, useState } from 'react'
import PageShell from '../../components/layout/PageShell'
import LeadCard from './components/LeadCard'
import SubBoard from './components/SubBoard'
import Modal from './components/Modal'
import LeadModal from './components/LeadModal'
import HandoffModal from './components/HandoffModal'
import TaskModal from './components/TaskModal'
import TasksTab from './components/TasksTab'
import OverviewTab from './components/OverviewTab'
import {
  stages, stageLabels, departments, deptShort, deptColors, deptTints,
  designStages, constructionStages, initialLeads, makeTasks, handoffSettings, blankLead,
} from '../../data/kinhDoanhData'
import { formatValue, stageAccent, matchesDate, primaryButton, selectStyle, timeOptions } from './utils'
import './KinhDoanh.css'

export default function KinhDoanh() {
  const [leads, setLeads] = useState(initialLeads)
  const [tab, setTab] = useState('overview')
  const [taskTab, setTaskTab] = useState('overview')
  const [boardView, setBoardView] = useState('kanban')
  const [dept, setDept] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [leadModal, setLeadModal] = useState(null)
  const [leadForm, setLeadForm] = useState(blankLead)
  const [leadStep, setLeadStep] = useState(0)
  const [assigneeForm, setAssigneeForm] = useState({ name: '', role: '' })
  const [detailLead, setDetailLead] = useState(null)
  const [handoff, setHandoff] = useState(null)
  const [handoffForm, setHandoffForm] = useState({ date: '', assignee: '' })
  const [tasks, setTasks] = useState(makeTasks)
  const [taskModal, setTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ name: '', step: 2, assignee: '', points: '20' })
  const [wallet, setWallet] = useState(1320)
  const [redeemed, setRedeemed] = useState([])
  const dragIdRef = useRef(null)
  const [dragTarget, setDragTarget] = useState(null)

  const filtered = useMemo(() => leads.filter(lead =>
    (dept === 'all' || lead.dept === dept) && matchesDate(lead, timeFilter, fromDate, toDate),
  ), [leads, dept, timeFilter, fromDate, toDate])

  const stats = useMemo(() => {
    const won = filtered.filter(lead => ['chot-hd', 'thiet-ke', 'thi-cong'].includes(lead.stage))
    const lost = filtered.filter(lead => lead.stage === 'truot-thau')
    const totalValue = filtered.reduce((sum, lead) => sum + Number(lead.value || 0), 0)
    const wonValue = won.reduce((sum, lead) => sum + Number(lead.value || 0), 0)
    return {
      total: filtered.length, won, lost, totalValue, wonValue,
      closeRate: filtered.length ? Math.round(won.length / filtered.length * 100) : 0,
      lostRate: filtered.length ? Math.round(lost.length / filtered.length * 100) : 0,
      partnerRate: won.length ? Math.round(won.filter(lead => lead.partner).length / won.length * 100) : 0,
    }
  }, [filtered])

  function updateForm(key, value) { setLeadForm(f => ({ ...f, [key]: value })) }
  function updateLead(id, patch) { setLeads(current => current.map(lead => lead.id === id ? { ...lead, ...patch } : lead)) }

  function syncProject(lead) {
    try {
      const items = JSON.parse(localStorage.getItem('siteflow-synced-projects') || '[]').filter(i => i.id !== lead.id)
      items.push({ id: lead.id, name: lead.type.includes('—') ? lead.type : `${lead.name} — ${lead.type}`, client: lead.name, stage: lead.stage, value: lead.value, updated: new Date().toLocaleDateString('vi-VN') })
      localStorage.setItem('siteflow-synced-projects', JSON.stringify(items))
    } catch (e) { console.error('Không thể đồng bộ dự án kinh doanh.', e) }
  }
  function removeSyncedProject(id) {
    try {
      const items = JSON.parse(localStorage.getItem('siteflow-synced-projects') || '[]').filter(i => i.id !== id)
      localStorage.setItem('siteflow-synced-projects', JSON.stringify(items))
    } catch (e) { console.error('Không thể cập nhật dự án kinh doanh.', e) }
  }

  function openLead(lead) {
    setLeadForm(lead ? { ...blankLead, ...lead, projectType: lead.projectType || lead.type, value: String(lead.value ?? '') } : { ...blankLead })
    setLeadStep(0)
    setAssigneeForm({ name: '', role: '' })
    setLeadModal(lead?.id || 'new')
  }
  function saveLead() {
    if (!leadForm.name.trim()) { setLeadStep(0); return }
    const numericValue = Number(String(leadForm.value).replace(',', '.')) || 0
    const saved = { ...leadForm, name: leadForm.name.trim(), value: numericValue, type: leadForm.scale.trim() ? `${leadForm.projectType} (${leadForm.scale.trim()})` : leadForm.projectType }
    if (leadModal === 'new') {
      saved.id = `lnew-${Date.now()}`
      saved.createdAt = new Date().toISOString().slice(0, 10)
      setLeads(current => [...current, saved])
    } else {
      setLeads(current => current.map(lead => lead.id === leadModal ? { ...lead, ...saved } : lead))
    }
    if (['thiet-ke', 'thi-cong', 'tu-van', 'dam-phan'].includes(saved.stage)) syncProject({ ...saved, id: leadModal === 'new' ? saved.id : leadModal })
    else removeSyncedProject(leadModal === 'new' ? saved.id : leadModal)
    setLeadModal(null)
  }
  function changeStage(id, nextStage) {
    const lead = leads.find(item => item.id === id)
    if (!lead || lead.stage === nextStage) return
    updateLead(id, { stage: nextStage })
    const updated = { ...lead, stage: nextStage }
    if (['thiet-ke', 'thi-cong', 'tu-van', 'dam-phan'].includes(nextStage)) syncProject(updated)
    else removeSyncedProject(id)
    if (handoffSettings[nextStage]) {
      setHandoff({ leadId: id, stage: nextStage })
      setHandoffForm({ date: '', assignee: '' })
    }
  }
  function removeLead(id) {
    const lead = leads.find(item => item.id === id)
    if (!lead || !window.confirm(`Xoá lead "${lead.name}"? Hành động này không thể hoàn tác.`)) return
    setLeads(current => current.filter(item => item.id !== id))
    removeSyncedProject(id)
  }
  function saveHandoff(selfQuoted = false) {
    const config = handoffSettings[handoff?.stage]
    const lead = leads.find(item => item.id === handoff?.leadId)
    if (!config || !lead) return
    const nextAssignees = handoffForm.assignee.trim()
      ? [...(lead.assignees || []), { name: handoffForm.assignee.trim(), role: config.role }]
      : lead.assignees
    updateLead(lead.id, {
      handoff: { status: selfQuoted ? 'self-quoted' : config.status, dept: config.dept, requestedAt: selfQuoted ? null : handoffForm.date || null, assignee: selfQuoted ? null : handoffForm.assignee.trim() || null },
      ...(nextAssignees ? { assignees: nextAssignees } : {}),
    })
    setHandoff(null)
  }
  function updateSubstage(id, sub) { updateLead(id, { sub }) }
  function addSubstageCard(stage, sub) {
    const name = window.prompt('Tên khách hàng / dự án:')
    if (!name?.trim()) return
    setLeads(current => [...current, { ...blankLead, id: `lnew-${Date.now()}`, name: name.trim(), type: 'Chưa xác định', value: 0, stage, sub, createdAt: new Date().toISOString().slice(0, 10) }])
  }

  const stagesEarned = tasks.reduce((sum, task) => sum + task.subtasks.reduce((s, item) => s + (item.done ? item.pts : 0), 0), 0)
  const totalPoints = tasks.reduce((sum, task) => sum + task.subtasks.reduce((s, item) => s + item.pts, 0), 0)
  const doneSteps = tasks.filter(task => task.status === 'done').length

  const detail = leads.find(lead => lead.id === detailLead)
  const handingLead = leads.find(lead => lead.id === handoff?.leadId)
  const handoffConfig = handoffSettings[handoff?.stage]

  // Filtri nhỏ dùng chung giữa các tab
  function DateFilter({ prefix }) {
    return (
      <div className="kd-date-filter">
        <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} style={selectStyle}>
          {timeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        {timeFilter === 'custom' && <div className="kd-date-range">
          <input aria-label={`${prefix} từ ngày`} type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          <span>→</span>
          <input aria-label={`${prefix} đến ngày`} type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>}
      </div>
    )
  }
  function DepartmentFilter() {
    return (
      <div className="kd-dept-filter">
        {[['all', 'Tất cả'], ...Object.entries(departments)].map(([key, label]) => (
          <button key={key} onClick={() => setDept(key)} className={dept === key ? 'active' : ''}>{label}</button>
        ))}
      </div>
    )
  }
  const filterBar = (
    <div className="kd-toolbar-controls"><DepartmentFilter /><DateFilter prefix="Tổng quan" /></div>
  )

  const addLeadBtn = (
    <button style={{ ...primaryButton, display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, fontSize: 13, flex: 'none' }} onClick={() => openLead(null)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Thêm khách hàng tiềm năng
    </button>
  )

  return (
    <PageShell title="Kinh doanh" subtitle="Pipeline khách hàng & cơ hội bán hàng" topbarChildren={addLeadBtn}>
      <div className="kd-page">
        <nav className="tab-bar kd-tabs">
          {[['overview', 'Tổng quan'], ['pipeline', 'Pipeline khách hàng'], ['design-board', 'Dự án (Thiết kế)'], ['construction-board', 'Dự án (Thi công)'], ['tasks', 'Nhiệm vụ & điểm thưởng']].map(([key, label]) => (
            <button key={key} className={`sales-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </nav>

        {tab === 'overview' && (
          <OverviewTab
            filtered={filtered} stats={stats} filterBar={filterBar}
            stagesEarned={stagesEarned} totalPoints={totalPoints} doneSteps={doneSteps} tasks={tasks}
          />
        )}

        {tab === 'pipeline' && <section className="sales-panel">
          <div className="kd-toolbar">
            <span>Kéo thả thẻ giữa các cột hoặc chọn giai đoạn trên thẻ để chuyển. Dự án thiết kế/thi công sẽ đồng bộ sang tab Dự án.</span>
            <div className="kd-toolbar-controls">
              <DepartmentFilter /><DateFilter prefix="Pipeline" />
              <div className="kd-view-switch">
                {['kanban', 'list'].map(view => <button key={view} className={boardView === view ? 'active' : ''} onClick={() => setBoardView(view)}>{view === 'kanban' ? 'Kanban' : 'Danh sách'}</button>)}
              </div>
            </div>
          </div>
          {boardView === 'kanban' ? (
            <div className="kd-board">
              {stages.map(([key, label]) => {
                const cards = dragIdRef.current
                  ? filtered.filter(l => l.id === dragIdRef.current ? key === (dragTarget ?? l.stage) : l.stage === key)
                  : filtered.filter(l => l.stage === key)
                const accent = stageAccent(key)
                return (
                  <section
                    className={`stage-col ${key === 'truot-thau' ? 'lost' : ''}`}
                    key={key}
                    onDragOver={e => e.preventDefault()}
                    onDragEnter={e => { e.currentTarget.classList.add('drop-hover'); setDragTarget(key) }}
                    onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.classList.remove('drop-hover') }}
                    onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drop-hover'); dragIdRef.current = null; setDragTarget(null); const id = e.dataTransfer.getData('text/plain'); if (id) changeStage(id, key) }}>
                    <header className="stage-head"><strong style={{ color: accent?.color }}>{label}</strong><span style={{ color: accent?.color }}>{cards.length} dự án · {formatValue(cards.reduce((sum, lead) => sum + Number(lead.value || 0), 0))}</span></header>
                    <div className="stage-drop">{cards.map(lead => <LeadCard lead={lead} key={lead.id} removeLead={removeLead} changeStage={changeStage} setDetailLead={setDetailLead} onStartDrag={id => { dragIdRef.current = id }} onEndDrag={() => { dragIdRef.current = null; setDragTarget(null) }} />)}</div>
                  </section>
                )
              })}
            </div>
          ) : (
            <div className="kd-list">
              <div className="kd-list-head"><span>Lead khách hàng</span><span>Loại dự án</span><span>Phòng ban</span><span>Giá trị</span><span>Giai đoạn</span><span>Chuyển tới</span></div>
              {filtered.map(lead => (
                <div className="kd-list-row" key={lead.id}>
                  <strong onClick={() => setDetailLead(lead.id)}>{lead.name}</strong><span>{lead.type}</span>
                  <span className="kd-tag" style={{ background: deptTints[lead.dept], color: deptColors[lead.dept] }}>{deptShort[lead.dept]}</span>
                  <b>{formatValue(lead.value)}</b><span>{stageLabels[lead.stage]}</span>
                  <select value={lead.stage} onChange={e => changeStage(lead.id, e.target.value)}>{stages.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
                </div>
              ))}
            </div>
          )}
        </section>}

        {tab === 'design-board' && <section className="sales-panel"><p className="kd-hint">Bảng Kanban kiểu Lark Base — kéo thả thẻ giữa các cột, hoặc bấm "+ Thêm thẻ" ở cuối mỗi cột để tạo nhanh.</p><SubBoard parentStage="thiet-ke" items={leads.filter(lead => lead.stage === 'thiet-ke')} columns={designStages} updateSubstage={updateSubstage} addSubstageCard={addSubstageCard} removeLead={removeLead} changeStage={changeStage} setDetailLead={setDetailLead} /></section>}
        {tab === 'construction-board' && <section className="sales-panel"><p className="kd-hint">Bảng Kanban kiểu Lark Task — kéo thả thẻ giữa các cột, hoặc bấm "+ Thêm thẻ" ở cuối mỗi cột để tạo nhanh.</p><SubBoard parentStage="thi-cong" items={leads.filter(lead => lead.stage === 'thi-cong')} columns={constructionStages} updateSubstage={updateSubstage} addSubstageCard={addSubstageCard} removeLead={removeLead} changeStage={changeStage} setDetailLead={setDetailLead} /></section>}

        {tab === 'tasks' && (
          <TasksTab taskTab={taskTab} setTaskTab={setTaskTab} tasks={tasks} setTasks={setTasks} stagesEarned={stagesEarned} totalPoints={totalPoints} doneSteps={doneSteps} wallet={wallet} setWallet={setWallet} redeemed={redeemed} setRedeemed={setRedeemed} setTaskModal={setTaskModal} setTaskForm={setTaskForm} />
        )}
      </div>

      {leadModal && (
        <LeadModal leadModal={leadModal} leadForm={leadForm} leadStep={leadStep} assigneeForm={assigneeForm} updateForm={updateForm} setLeadStep={setLeadStep} setAssigneeForm={setAssigneeForm} saveLead={saveLead} onClose={() => setLeadModal(null)} />
      )}

      {detail && (
        <Modal title={detail.name} onClose={() => setDetailLead(null)}>
          <div className="kd-detail-stage" style={{ background: stageAccent(detail.stage)?.bg || 'var(--sales-tint)', color: stageAccent(detail.stage)?.color || 'var(--sales)' }}>{stageLabels[detail.stage]}</div>
          <div className="kd-detail-body">
            <div className="kd-detail-grid">
              {[['Số điện thoại', detail.phone], ['Email', detail.email], ['Nguồn khách hàng', detail.source], ['Địa chỉ', detail.address], ['Phòng ban phụ trách', departments[detail.dept]], ['Loại dự án', detail.projectType || detail.type], ['Quy mô', detail.scale], ['Giá trị ước tính', formatValue(detail.value)], ['Người phụ trách', detail.assignees?.map(p => `${p.name}${p.role ? ` · ${p.role}` : ''}`).join(', ')], ['Hạng mục quan tâm', detail.categories?.join(', ')], ['File đính kèm', detail.boqFile], ['Concept / Ý tưởng thiết kế', detail.concept], ['Ghi chú nội bộ', detail.notes]].filter(([, v]) => v).map(([label, value]) => (
                <div key={label}><small>{label}</small><strong>{value}</strong></div>
              ))}
            </div>
            {detail.handoff && <p className="kd-detail-handoff">Bàn giao / Báo giá: {detail.handoff.status === 'self-quoted' ? 'Phòng KD tự đề xuất báo giá' : `Đang chờ Phòng ${detail.handoff.dept} xác nhận`}</p>}
          </div>
          <footer className="kd-modal-footer"><span></span><button style={primaryButton} onClick={() => { setDetailLead(null); openLead(detail) }}>Chỉnh sửa / bổ sung thông tin</button></footer>
        </Modal>
      )}

      {handoff && handoffConfig && handingLead && (
        <HandoffModal handoff={handoff} handoffConfig={handoffConfig} handingLead={handingLead} handoffForm={handoffForm} setHandoffForm={setHandoffForm} saveHandoff={saveHandoff} onClose={() => setHandoff(null)} />
      )}

      {taskModal && (
        <TaskModal taskForm={taskForm} setTaskForm={setTaskForm} tasks={tasks} setTasks={setTasks} onClose={() => setTaskModal(false)} />
      )}
    </PageShell>
  )
}
