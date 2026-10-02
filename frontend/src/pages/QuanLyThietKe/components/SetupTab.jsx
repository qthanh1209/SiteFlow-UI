import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  INITIAL_SUBCONTRACTORS, SUB_STATUS, STATIC_PROJECTS,
  INITIAL_ORG_CHILDREN, INITIAL_ORG_PARALLEL, ORG_HUB, ORG_ICON_DEPT, ORG_ICON_HUB,
  ORG_EXTRA_COLORS, ORG_FLOW_DEPTS, INITIAL_PROJECT_MEMBERS, PROJ_DEPTS, AUTO_INCLUDE_DEPTS,
  avatarColor, initials,
} from '../../../data/quanLyThietKeData'

const SUB_TABS = ['Thiết lập chung', 'Sơ đồ tổ chức', 'Thầu phụ']
const SETUP_STORAGE_KEY = 'siteflow-project-setup'
const SUBCONTRACTOR_STORAGE_KEY = 'siteflow-project-subcontractors'
const ORG_CHILDREN_STORAGE_KEY = 'siteflow-project-org-children'
const ORG_PARALLEL_STORAGE_KEY = 'siteflow-project-org-parallel'
const PROJECT_MEMBERS_STORAGE_KEY = 'siteflow-project-members'

const STATUS_STYLE = {
  primary: { color: 'var(--primary)', bg: 'var(--primary-tint)' },
  success: { color: 'var(--success)', bg: 'var(--success-tint)' },
  muted: { color: 'var(--text-muted)', bg: 'var(--surface-alt)' },
}

function shortProjectLabel(name) {
  if (!name) return 'Dự án'
  const [base, stage] = name.split('—').map(s => s.trim())
  const shortBase = (base || name).replace(/^(Chung cư|Nhà phố|Biệt thự|Văn phòng cho thuê|Văn phòng)\s+/, '')
  const shortStage = stage ? stage.replace(/Giai đoạn\s*/i, 'GĐ') : ''
  return `Dự án ${shortBase}${shortStage ? ' ' + shortStage : ''}`.trim()
}

const DEFAULT_FORM = {
  name: 'Chung cư Riverside — Giai đoạn 2',
  client: 'Công ty CP Đầu tư Riverside',
  contact: 'Ông Nguyễn Văn Bình',
  email: 'contact@riverside-invest.vn',
  phone: '0909 123 456',
  address: '123 Nguyễn Hữu Cảnh, P.22, Bình Thạnh, TP.HCM',
  type: 'Chung cư',
  pm: 'Trần Anh',
  startDate: '',
  handoverDate: '',
  contractValue: '',
  approvedBudget: '',
  note: '',
}

function readStoredObject(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

function readStoredArray(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null')
    return Array.isArray(value) ? value : fallback
  } catch {
    return fallback
  }
}

function formatCurrency(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits ? `${Number(digits).toLocaleString('vi-VN')} đ` : '—'
}

export default function SetupTab({ onGotoTab }) {
  const navigate = useNavigate()
  const [subTab, setSubTab] = useState(0)
  const [kdProjects] = useState(() => readStoredArray('siteflow-synced-projects', []))
  const projects = useMemo(() => [
    ...STATIC_PROJECTS.map(project => ({ ...project, key: project.name })),
    ...kdProjects.map(project => ({
      ...project,
      key: project.id || project.name,
      type: project.type || '',
      budget: project.value ? `${project.value} tỷ` : '',
    })),
  ], [kdProjects])
  const [selectedProject, setSelectedProject] = useState(DEFAULT_FORM.name)

  /* ── Setup form state ─────────────────────────────────── */
  const [storedSetups, setStoredSetups] = useState(() => readStoredObject(SETUP_STORAGE_KEY))
  const selectedProjectInfo = projects.find(project => project.key === selectedProject) || projects[0]
  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    ...(storedSetups[DEFAULT_FORM.name] || {}),
  }))
  const [saved, setSaved] = useState(false)

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function selectProject(projectKey) {
    setSelectedProject(projectKey)
    const project = projects.find(item => item.key === projectKey)
    const defaults = {
      ...DEFAULT_FORM,
      name: project?.name || projectKey,
      client: project?.client || '',
      type: project?.type || DEFAULT_FORM.type,
      contact: projectKey === DEFAULT_FORM.name ? DEFAULT_FORM.contact : '',
      email: projectKey === DEFAULT_FORM.name ? DEFAULT_FORM.email : '',
      phone: projectKey === DEFAULT_FORM.name ? DEFAULT_FORM.phone : '',
      address: projectKey === DEFAULT_FORM.name ? DEFAULT_FORM.address : '',
    }
    setForm({ ...defaults, ...(storedSetups[projectKey] || {}) })
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    const setups = readStoredObject(SETUP_STORAGE_KEY)
    const nextSetups = { ...setups, [selectedProject]: form }
    localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(nextSetups))
    setStoredSetups(nextSetups)
    const rawProjects = readStoredArray('siteflow-synced-projects', [])
    const selected = projects.find(project => project.key === selectedProject)
    if (selected && !STATIC_PROJECTS.some(project => project.name === selectedProject)) {
      const updatedProjects = rawProjects.map(project => project.id === selectedProject
        ? { ...project, name: form.name, client: form.client, type: form.type, setup: form }
        : project)
      localStorage.setItem('siteflow-synced-projects', JSON.stringify(updatedProjects))
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleCancel() {
    setForm({
      ...DEFAULT_FORM,
      ...(storedSetups[selectedProject] || {}),
    })
    setSaved(false)
  }

  /* ── Org chart state ──────────────────────────────────── */
  const [children, setChildren] = useState(() => readStoredArray(ORG_CHILDREN_STORAGE_KEY, INITIAL_ORG_CHILDREN))
  const [parallel, setParallel] = useState(() => readStoredArray(ORG_PARALLEL_STORAGE_KEY, INITIAL_ORG_PARALLEL))
  const [dragOrgIdx, setDragOrgIdx] = useState(null)
  const [dropOrgIdx, setDropOrgIdx] = useState(null)
  const [dragParallelIdx, setDragParallelIdx] = useState(null)
  const [dropParallelIdx, setDropParallelIdx] = useState(null)
  const [trashOver, setTrashOver] = useState(false)
  const [showAddChild, setShowAddChild] = useState(false)
  const [newChildLabel, setNewChildLabel] = useState('')
  const [newChildColor, setNewChildColor] = useState('primary')
  const [showAddParallel, setShowAddParallel] = useState(false)
  const [newParallelLabel, setNewParallelLabel] = useState('')
  const [newParallelColor, setNewParallelColor] = useState('attendance')
  const [orgSaved, setOrgSaved] = useState(false)

  function handleOrgDragStart(i) { setDragOrgIdx(i) }
  function handleOrgDragEnter(i) { if (dragOrgIdx !== null && dragOrgIdx !== i) setDropOrgIdx(i) }
  function handleOrgDrop(i) {
    if (dragOrgIdx === null || dragOrgIdx === i) { setDragOrgIdx(null); setDropOrgIdx(null); return }
    const arr = [...children]
    const [moved] = arr.splice(dragOrgIdx, 1)
    arr.splice(i, 0, moved)
    setChildren(arr)
    localStorage.setItem(ORG_CHILDREN_STORAGE_KEY, JSON.stringify(arr))
    setDragOrgIdx(null); setDropOrgIdx(null)
  }
  function handleParallelDragStart(i) { setDragParallelIdx(i) }
  function handleParallelDragEnter(i) { if (dragParallelIdx !== null && dragParallelIdx !== i) setDropParallelIdx(i) }
  function handleParallelDrop(i) {
    if (dragParallelIdx === null || dragParallelIdx === i) { setDragParallelIdx(null); setDropParallelIdx(null); return }
    const arr = [...parallel]
    const [moved] = arr.splice(dragParallelIdx, 1)
    arr.splice(i, 0, moved)
    setParallel(arr)
    localStorage.setItem(ORG_PARALLEL_STORAGE_KEY, JSON.stringify(arr))
    setDragParallelIdx(null); setDropParallelIdx(null)
  }
  function handleOrgDropTrash() {
    if (dragParallelIdx !== null) {
      const node = parallel[dragParallelIdx]
      if (node?.removable !== false) {
        const next = parallel.filter((_, i) => i !== dragParallelIdx)
        localStorage.setItem(ORG_PARALLEL_STORAGE_KEY, JSON.stringify(next))
        setParallel(next)
      }
      setDragParallelIdx(null); setTrashOver(false); return
    }
    if (dragOrgIdx === null) return
    const node = children[dragOrgIdx]
    if (node?.removable === false) { setDragOrgIdx(null); setTrashOver(false); return }
    const next = children.filter((_, i) => i !== dragOrgIdx)
    localStorage.setItem(ORG_CHILDREN_STORAGE_KEY, JSON.stringify(next))
    setChildren(next)
    setDragOrgIdx(null); setTrashOver(false)
  }
  function addChild() {
    if (!newChildLabel) return
    const next = [...children, { dept: 'custom-' + Date.now(), label: newChildLabel, color: newChildColor, icon: ORG_ICON_DEPT, removable: true }]
    localStorage.setItem(ORG_CHILDREN_STORAGE_KEY, JSON.stringify(next))
    setChildren(next)
    setNewChildLabel(''); setShowAddChild(false)
  }
  function addParallel() {
    if (!newParallelLabel) return
    const next = [...parallel, { dept: 'custom-' + Date.now(), label: newParallelLabel, color: newParallelColor, icon: ORG_ICON_DEPT, caption: 'Song song · bộ phận mới', removable: true }]
    localStorage.setItem(ORG_PARALLEL_STORAGE_KEY, JSON.stringify(next))
    setParallel(next)
    setNewParallelLabel(''); setShowAddParallel(false)
  }
  function handleSaveOrgChart() {
    localStorage.setItem(ORG_CHILDREN_STORAGE_KEY, JSON.stringify(children))
    localStorage.setItem(ORG_PARALLEL_STORAGE_KEY, JSON.stringify(parallel))
    setOrgSaved(true)
    setTimeout(() => setOrgSaved(false), 2200)
  }

  /* ── Project members (dùng cho "Nhân sự tham gia" & Sơ đồ phòng ban) ── */
  const [projectMembers, setProjectMembers] = useState(() => {
    const stored = readStoredObject(PROJECT_MEMBERS_STORAGE_KEY)
    return Object.keys(stored).length ? stored : INITIAL_PROJECT_MEMBERS
  })
  const currentMembers = projectMembers[selectedProject] || []
  function persistMembers(next) {
    setProjectMembers(next)
    localStorage.setItem(PROJECT_MEMBERS_STORAGE_KEY, JSON.stringify(next))
  }
  function addProjectMember() {
    const name = window.prompt('Tên nhân sự tham gia dự án:')
    if (!name?.trim()) return
    persistMembers({ ...projectMembers, [selectedProject]: [...currentMembers, { name: name.trim(), role: '', dept: 'general' }] })
  }
  function membersForDept(dept) {
    return AUTO_INCLUDE_DEPTS.includes(dept) ? currentMembers : currentMembers.filter(m => m.dept === dept)
  }
  function addDeptMember(dept) {
    const label = PROJ_DEPTS.find(d => d.value === dept)?.label || dept
    const name = window.prompt(`Thêm nhân sự vào ${label}:`)
    if (!name?.trim()) return
    persistMembers({ ...projectMembers, [selectedProject]: [...currentMembers, { name: name.trim(), role: '', dept }] })
  }
  function goToDept(node) {
    if (node.nav.type === 'tab') onGotoTab?.(node.nav.to)
    else navigate(node.nav.to)
  }

  /* ── Subcontractors state ─────────────────────────────── */
  const [subs, setSubs] = useState(() => readStoredArray(SUBCONTRACTOR_STORAGE_KEY, INITIAL_SUBCONTRACTORS))
  const [showAddSub, setShowAddSub] = useState(false)
  const [newSub, setNewSub] = useState({ name: '', scope: '', contact: '', phone: '', value: '', status: 'active' })

  function addSub() {
    if (!newSub.name) return
    const next = [...subs, { ...newSub }]
    localStorage.setItem(SUBCONTRACTOR_STORAGE_KEY, JSON.stringify(next))
    setSubs(next)
    setNewSub({ name: '', scope: '', contact: '', phone: '', value: '', status: 'active' })
    setShowAddSub(false)
  }
  function removeSub(i) {
    const next = subs.filter((_, idx) => idx !== i)
    localStorage.setItem(SUBCONTRACTOR_STORAGE_KEY, JSON.stringify(next))
    setSubs(next)
  }

  return (
    <div className="setup-tab">
      <div className="setup-subnav">
        {SUB_TABS.map((t, i) => (
          <button key={t} className={subTab === i ? 'active' : ''} onClick={() => setSubTab(i)}>{t}</button>
        ))}
      </div>

      <div className="setup-body">
        {/* ── Thiết lập chung ──────────────────────────────── */}
        {subTab === 0 && (
          <form className="setup-form" onSubmit={handleSave}>
            <div className="setup-card">
              <div className="setup-intro">
                <h2>Thiết lập chung cho dự án</h2>
                <p>Thông tin được quản lý tập trung và dùng để khởi tạo các khu vực vận hành của dự án.</p>
              </div>
              <div className="form-group setup-project-select">
                <label htmlFor="setup-project">Chọn dự án cần thiết lập *</label>
                <select id="setup-project" value={selectedProject} onChange={e => selectProject(e.target.value)}>
                  {projects.map(project => <option key={project.key} value={project.key}>{project.name}</option>)}
                </select>
              </div>
              <div className="setup-section">
                <h3>Thông tin cơ bản <span>— lấy từ Kinh doanh</span></h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="setup-client">Tên chủ đầu tư</label>
                    <input id="setup-client" value={form.client} onChange={e => setField('client', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="setup-contact">Người liên hệ</label>
                    <input id="setup-contact" value={form.contact} onChange={e => setField('contact', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="setup-email">Email</label>
                    <input id="setup-email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="setup-phone">Số điện thoại</label>
                    <input id="setup-phone" type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)} />
                  </div>
                  <div className="form-group form-span-all">
                    <label htmlFor="setup-address">Địa chỉ</label>
                    <input id="setup-address" value={form.address} onChange={e => setField('address', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="setup-section">
                <h3>Thông tin quan trọng</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="setup-start">Ngày khởi công</label>
                    <input id="setup-start" type="date" value={form.startDate} onChange={e => setField('startDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="setup-handover">Ngày hoàn công (dự kiến)</label>
                    <input id="setup-handover" type="date" value={form.handoverDate} onChange={e => setField('handoverDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="setup-contract">Giá trị hợp đồng</label>
                    <input id="setup-contract" inputMode="numeric" value={form.contractValue} onChange={e => setField('contractValue', e.target.value)} placeholder="VD: 8.500.000.000" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="setup-budget">Ngân sách được duyệt</label>
                    <input id="setup-budget" inputMode="numeric" value={form.approvedBudget} onChange={e => setField('approvedBudget', e.target.value)} placeholder="VD: 2.500.000.000" />
                  </div>
                  <div className="form-group form-span-all">
                    <label htmlFor="setup-note">Ghi chú</label>
                    <textarea id="setup-note" rows={3} value={form.note} onChange={e => setField('note', e.target.value)} placeholder="Yêu cầu đặc biệt từ khách hàng, lưu ý về mặt bằng..." />
                  </div>
                </div>
              </div>
              <div className="setup-section setup-operations">
                <h3>Sau khi lưu, dữ liệu vận hành sẽ được khởi tạo tới</h3>
                <p>Không cần nhập lại thông tin khách hàng hay địa điểm ở từng module.</p>
                <div className="module-grid">
                  {[
                    ['QS', 'Tạo hồ sơ bóc tách trống', 'var(--qs, #7658c2)', '▣'],
                    ['Tiến độ', 'Khung Gantt mẫu theo loại hình', 'var(--primary)', '▤'],
                    ['Chấm công', 'Địa điểm công trường từ địa chỉ', 'var(--attendance)', '⌖'],
                    ['Tài chính', 'Ngân sách trống theo dự kiến', 'var(--finance)', '▱'],
                    ['Nhiệm vụ', 'Gắn quy trình game hóa theo loại hình', 'var(--game, #c2618f)', '♙'],
                    ['Chat', 'Tạo nhóm chat dự án tự động', 'var(--primary)', '▢'],
                  ].map(([title, description, color, icon]) => (
                    <div className="module-card" key={title}>
                      <span className="module-icon" style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}>{icon}</span>
                      <span className="module-copy"><strong>{title}</strong><small>{description}</small></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="setup-form-footer">
              {saved && <span className="setup-saved-message" role="status">Đã lưu thiết lập cho dự án.</span>}
              <div className="setup-form-actions">
                <button className="setup-cancel-btn" type="button" onClick={handleCancel}>Hủy</button>
                <button className="form-submit" type="submit">Lưu thiết lập &amp; bắt đầu thi công</button>
              </div>
            </div>
          </form>
        )}

        {/* ── Sơ đồ tổ chức ───────────────────────────────── */}
        {subTab === 1 && (
          <div className="org-view">
            <div className="org-project-summary">
              <div className="org-project-icon" aria-hidden="true">▱</div>
              <div className="org-project-info">
                <div className="org-project-title-row">
                  <span className="org-project-title">{form.name || selectedProjectInfo?.name}</span>
                  {selectedProjectInfo?.statusLabel && (
                    <span
                      className="org-status-badge"
                      style={{
                        background: (STATUS_STYLE[selectedProjectInfo.statusColor] || STATUS_STYLE.muted).bg,
                        color: (STATUS_STYLE[selectedProjectInfo.statusColor] || STATUS_STYLE.muted).color,
                      }}
                    >{selectedProjectInfo.statusLabel}</span>
                  )}
                  <select className="org-project-switch" value={selectedProject} onChange={e => selectProject(e.target.value)}>
                    {projects.map(project => <option key={project.key} value={project.key}>{project.name}</option>)}
                  </select>
                </div>
                <div className="org-project-meta">Khách hàng: {form.client || selectedProjectInfo?.client || '—'} <span>·</span> Liên hệ: {form.contact || '—'} <span>·</span> SĐT: {form.phone || '—'} <span>·</span> Email: {form.email || '—'}</div>
                <div className="org-project-team">
                  <span>Nhân sự tham gia:</span>
                  <div className="proj-members-row">
                    {currentMembers.slice(0, 4).map(m => (
                      <div key={m.name} className="proj-avatar" style={{ background: avatarColor(m.name) }} title={`${m.name}${m.role ? ` — ${m.role}` : ''}`}>{initials(m.name)}</div>
                    ))}
                    <button type="button" className="org-member-add" title="Thêm nhân sự" onClick={addProjectMember}>+</button>
                  </div>
                </div>
              </div>
              <div className="org-project-budget">
                <strong>{selectedProjectInfo?.budget || form.contractValue || '—'}</strong>
                <small>Ngân sách · {form.pm || 'PM chưa phân công'}</small>
              </div>
            </div>

            {/* Sơ đồ phòng ban: toàn cảnh các khu vực vận hành của dự án */}
            <div className="org-chart-panel">
              <h2>Sơ đồ phòng ban</h2>
              <div className="org-dept-wrap">
                <div className="org-dept-hub">
                  <div className="org-flow-icon" style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--project, #3D4FC4)', color: '#fff' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: ORG_ICON_HUB }} />
                  </div>
                  <div className="org-dept-hub-label">{shortProjectLabel(form.name || selectedProjectInfo?.name)}</div>
                </div>
                <div className="org-dept-connector" />
                <div className="org-dept-bar" />
                <div className="org-dept-row">
                  {ORG_FLOW_DEPTS.map(node => {
                    const deptMembers = membersForDept(node.dept)
                    const shown = deptMembers.slice(0, 4)
                    const extra = deptMembers.length - shown.length
                    return (
                      <div className="org-flow-node" key={node.dept}>
                        <div className="org-dept-stem" />
                        <div className="org-flow-icon" style={{ background: `var(--${node.color}-tint, var(--surface-alt))`, color: `var(--${node.color}, var(--text-muted))` }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: node.icon }} />
                        </div>
                        <div className="org-flow-label">{node.label}</div>
                        <div className="org-flow-stats">{node.stat1}<br />{node.stat2}</div>
                        <div className="org-flow-members">
                          {shown.map(m => (
                            <span key={m.name} className="org-flow-avatar" style={{ background: avatarColor(m.name) }} title={`${m.name}${m.role ? ` — ${m.role}` : ''}`}>{initials(m.name)}</span>
                          ))}
                          {extra > 0 && <span className="org-flow-avatar-more" title={`${extra} người khác`}>+{extra}</span>}
                          <button type="button" className="org-flow-avatar-add" title={`Thêm nhân sự vào ${node.label}`} onClick={() => addDeptMember(node.dept)}>+</button>
                        </div>
                        <button type="button" className="org-flow-link" style={{ color: `var(--${node.color}, var(--text-muted))` }} onClick={() => goToDept(node)}>{node.linkLabel} ›</button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sơ đồ tổ chức dự án: phân công nhân sự theo vai trò thiết kế */}
            <div className="org-chart-panel">
              <div className="org-chart-head">
                <div>
                  <h2 className="org-chart-title-left">Sơ đồ tổ chức dự án</h2>
                  <p className="org-chart-desc">Bổ nhiệm nhân sự phụ trách cho từng vai trò trong quy trình thiết kế. Kéo-thả các thẻ để sắp xếp lại trong cùng một hàng, hoặc thả vào biểu tượng thùng rác để xoá bộ phận tuỳ biến.</p>
                </div>
                <div className="org-chart-actions">
                  <div
                    className={`org-trash-icon ${trashOver ? 'drag-over' : ''}`}
                    title="Kéo thẻ vào đây để xoá bộ phận"
                    onDragOver={e => { e.preventDefault(); setTrashOver(true) }}
                    onDragLeave={() => setTrashOver(false)}
                    onDrop={() => { handleOrgDropTrash(); setTrashOver(false) }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-.9 14a2 2 0 0 1-2 1.9H7.9a2 2 0 0 1-2-1.9L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  </div>
                  <button type="button" className="org-save-btn" onClick={handleSaveOrgChart}>{orgSaved ? 'Đã lưu ✓' : 'Lưu sơ đồ tổ chức'}</button>
                </div>
              </div>

              <div className="org-chart-wrap" onDragOver={e => e.preventDefault()}>
                {/* Parallel nodes */}
                <div className="org-parallel-row">
                  {parallel.map((node, i) => (
                    <div key={node.dept}
                      onDragOver={e => { e.preventDefault(); handleParallelDragEnter(i) }}
                      onDrop={() => handleParallelDrop(i)}
                    >
                      <OrgNode
                        node={node}
                        dragging={dragParallelIdx === i}
                        dropTarget={dropParallelIdx === i}
                        onDragStart={() => handleParallelDragStart(i)}
                        onDragEnd={() => { setDragParallelIdx(null); setDropParallelIdx(null) }}
                      />
                    </div>
                  ))}
                </div>
                {!showAddParallel ? (
                  <button type="button" className="org-add-btn" onClick={() => setShowAddParallel(true)}>+ Thêm bộ phận song song</button>
                ) : (
                  <div className="org-add-form">
                    <input
                      autoFocus value={newParallelLabel} onChange={e => setNewParallelLabel(e.target.value)}
                      placeholder="Tên bộ phận" onKeyDown={e => { if (e.key === 'Enter') addParallel(); if (e.key === 'Escape') setShowAddParallel(false) }}
                    />
                    <select value={newParallelColor} onChange={e => setNewParallelColor(e.target.value)}>
                      {ORG_EXTRA_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button type="button" onClick={addParallel}>Thêm</button>
                    <button type="button" className="org-add-form-cancel" onClick={() => setShowAddParallel(false)}>Huỷ</button>
                  </div>
                )}

                {/* Hub */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, marginTop: 14 }}>
                  <OrgNode node={ORG_HUB} isHub />
                </div>

                {/* Vertical connector from hub down */}
                <div style={{ width: 2, height: 24, background: 'var(--border)', flexShrink: 0 }} />

                {/* Children row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                  {/* horizontal bar across all children */}
                  {children.length > 1 && (
                    <div style={{
                      position: 'absolute', top: 0,
                      left: `calc(${1/(children.length)*50}% + ${children.length > 2 ? 0 : 60}px)`,
                      right: `calc(${1/(children.length)*50}% + ${children.length > 2 ? 0 : 60}px)`,
                      height: 2, background: 'var(--border)'
                    }} />
                  )}
                  {children.map((node, i) => (
                    <div key={node.dept} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}
                      onDragOver={e => { e.preventDefault(); handleOrgDragEnter(i) }}
                      onDrop={() => handleOrgDrop(i)}
                    >
                      <div style={{ width: 2, height: 24, background: 'var(--border)' }} />
                      <OrgNode
                        node={node}
                        dragging={dragOrgIdx === i}
                        dropTarget={dropOrgIdx === i}
                        onDragStart={() => handleOrgDragStart(i)}
                        onDragEnd={() => { setDragOrgIdx(null); setDropOrgIdx(null) }}
                      />
                    </div>
                  ))}
                  {children.length === 0 && <div className="empty-state">Kéo thả để sắp xếp · Không có nhánh con</div>}
                </div>

                {!showAddChild ? (
                  <button type="button" className="org-add-btn" style={{ marginTop: 14 }} onClick={() => setShowAddChild(true)}>+ Thêm bộ phận trực thuộc</button>
                ) : (
                  <div className="org-add-form" style={{ marginTop: 14 }}>
                    <input
                      autoFocus value={newChildLabel} onChange={e => setNewChildLabel(e.target.value)}
                      placeholder="Tên phòng ban" onKeyDown={e => { if (e.key === 'Enter') addChild(); if (e.key === 'Escape') setShowAddChild(false) }}
                    />
                    <select value={newChildColor} onChange={e => setNewChildColor(e.target.value)}>
                      {ORG_EXTRA_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button type="button" onClick={addChild}>Thêm</button>
                    <button type="button" className="org-add-form-cancel" onClick={() => setShowAddChild(false)}>Huỷ</button>
                  </div>
                )}

                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>Kéo thả các nhánh để sắp xếp lại · Kéo vào thùng rác phía trên để xoá (trừ nhánh cố định)</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Thầu phụ ────────────────────────────────────── */}
        {subTab === 2 && (
          <div className="subcontractor-view">
            <div className="subcontractor-heading">
              <div>
                <h2>Thầu phụ</h2>
                <p>Quản lý các nhà thầu phụ tham gia thi công dự án.</p>
              </div>
              <button className="sub-add-btn" onClick={() => setShowAddSub(s => !s)}>
                {showAddSub ? 'Đóng' : '+ Thêm thầu phụ'}
              </button>
            </div>

            {showAddSub && (
              <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  {[
                    ['name', 'Tên công ty *'], ['scope', 'Phạm vi công việc'],
                    ['contact', 'Người liên hệ'], ['phone', 'Số điện thoại'],
                    ['value', 'Giá trị hợp đồng (VND)'],
                  ].map(([k, label]) => (
                    <div key={k} className="form-group" style={{ gridColumn: k === 'name' || k === 'scope' ? '1 / -1' : 'auto' }}>
                      <label>{label}</label>
                      <input value={newSub[k]} onChange={e => setNewSub(s => ({ ...s, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select value={newSub.status} onChange={e => setNewSub(s => ({ ...s, status: e.target.value }))}>
                      {Object.entries(SUB_STATUS).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={addSub} className="form-submit" style={{ marginRight: 8 }}>Thêm nhà thầu</button>
                <button onClick={() => setShowAddSub(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)' }}>Huỷ</button>
              </div>
            )}

            <div className="sub-table-card">
              <div className="sub-table-scroll">
                <table className="sub-table">
                  <thead><tr>
                    <th>NHÀ THẦU PHỤ</th>
                    <th>HẠNG MỤC PHỤ TRÁCH</th>
                    <th>NGƯỜI LIÊN HỆ</th>
                    <th>SĐT</th>
                    <th>GIÁ TRỊ HỢP ĐỒNG</th>
                    <th>TRẠNG THÁI</th>
                    <th aria-label="Thao tác" />
                  </tr></thead>
                  <tbody>
                    {subs.map((sub, i) => {
                      const [statusLabel, statusColor, statusBg] = SUB_STATUS[sub.status] || ['', 'var(--text-muted)', 'var(--surface-alt)']
                      return (
                        <tr key={`${sub.name}-${i}`}>
                          <td className="sub-table-name">{sub.name}</td>
                          <td>{sub.scope || '—'}</td>
                          <td>{sub.contact || '—'}</td>
                          <td>{sub.phone || '—'}</td>
                          <td className="sub-table-value">{formatCurrency(sub.value)}</td>
                          <td><span className="sub-status-badge" style={{ background: statusBg, color: statusColor }}>{statusLabel}</span></td>
                          <td><button className="sub-btn" title={`Xóa ${sub.name}`} onClick={() => removeSub(i)}>Xóa</button></td>
                        </tr>
                      )
                    })}
                    {subs.length === 0 && <tr><td colSpan={7} className="sub-table-empty">Chưa có thầu phụ. Nhấn “Thêm thầu phụ” để bắt đầu.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* OrgNode component */
function OrgNode({ node, isHub, dragging, dropTarget, onDragStart, onDragEnd }) {
  return (
    <div
      className={`org-node ${dragging ? 'dragging' : ''} ${dropTarget ? 'drop-target' : ''} ${node.dashed ? 'dashed-node' : ''}`}
      draggable={!isHub && !node.dashed}
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart?.() }}
      onDragEnd={onDragEnd}
    >
      <div
        className="org-node-icon"
        style={{ background: `var(--${node.color}-tint, var(--surface-alt))` }}
      >
        <svg width="16" height="16" fill="none" stroke={`var(--${node.color}, var(--text-muted))`} strokeWidth="1.5" viewBox="0 0 24 24"
          dangerouslySetInnerHTML={{ __html: node.icon }} />
      </div>
      <div className="org-node-label">{node.label}</div>
      {node.caption && <div className="org-node-caption">{node.caption}</div>}
    </div>
  )
}
