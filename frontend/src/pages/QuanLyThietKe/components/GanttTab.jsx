import { useState, useEffect, useRef, useMemo } from 'react'
import {
  INITIAL_PHASES, INITIAL_TASK_COMMENTS, PROJECT_SHORTLIST, CASHFLOW_DATA,
  TODAY, parseD, dayDiff, fmt, fmtFull, toISO, statusOf, STATUS_LABEL,
  avatarColor, initials,
} from '../../../data/quanLyThietKeData'
import TaskDrawer from './TaskDrawer'

const WEEK_DAY_W = 16
const MONTH_DAY_W = 6
const ROW_H = 32
const PHASE_H = 32
const MONTH_NAMES = ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12']

function allTasksFlat(phases) {
  return phases.flatMap(p => p.tasks.map(t => ({ ...t, phaseId: p.id, phaseName: p.name })))
}

export default function GanttTab() {
  const [phases, setPhases] = useState(INITIAL_PHASES)
  const [collapsed, setCollapsed] = useState(new Set())
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [selectedPhaseId, setSelectedPhaseId] = useState(null)
  const [comments, setComments] = useState(INITIAL_TASK_COMMENTS)
  const [projOpen, setProjOpen] = useState(false)
  const [activeProj, setActiveProj] = useState(PROJECT_SHORTLIST[0])
  const [search, setSearch] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [zoom, setZoom] = useState('week')
  const [memberPopoverPhaseId, setMemberPopoverPhaseId] = useState(null)

  const dayW = zoom === 'month' ? MONTH_DAY_W : WEEK_DAY_W

  /* scroll sync refs */
  const sideBodyRef = useRef()
  const tlBodyRef   = useRef()
  const tlHeadRef   = useRef()
  const syncing     = useRef(false)
  const resizing    = useRef(null)

  useEffect(() => {
    const sidebar  = sideBodyRef.current
    const timeline = tlBodyRef.current
    const head     = tlHeadRef.current
    if (!sidebar || !timeline) return
    function onSide() {
      if (syncing.current) return
      syncing.current = true; timeline.scrollTop = sidebar.scrollTop; syncing.current = false
    }
    function onTL() {
      if (!syncing.current) { syncing.current = true; sidebar.scrollTop = timeline.scrollTop; syncing.current = false }
      if (head) head.scrollLeft = timeline.scrollLeft
    }
    sidebar.addEventListener('scroll', onSide)
    timeline.addEventListener('scroll', onTL)
    return () => { sidebar.removeEventListener('scroll', onSide); timeline.removeEventListener('scroll', onTL) }
  }, [])

  /* range: 6 days before earliest start, 8 days after latest end */
  const { RANGE_START, RANGE_END, TOTAL_DAYS } = useMemo(() => {
    const flat = allTasksFlat(phases)
    const starts = flat.map(t => parseD(t.start))
    const ends = flat.map(t => parseD(t.end))
    const start = new Date(Math.min(...starts)); start.setDate(start.getDate() - 6)
    const end = new Date(Math.max(...ends)); end.setDate(end.getDate() + 8)
    return { RANGE_START: start, RANGE_END: end, TOTAL_DAYS: dayDiff(start, end) }
  }, [phases])

  function xFor(date) { return dayDiff(RANGE_START, date) * dayW }

  /* bar resize via document mousemove/mouseup */
  useEffect(() => {
    function onMouseMove(e) {
      const r = resizing.current; if (!r) return
      const dx = e.clientX - r.startX
      const deltaDays = Math.round(dx / dayW)
      if (deltaDays === 0) return
      setPhases(prev => prev.map(p => ({
        ...p, tasks: p.tasks.map(t => {
          if (t.id !== r.taskId || t.milestone || t.finType) return t
          const s = parseD(t.start), en = parseD(t.end)
          if (r.side === 'right') {
            const newEnd = new Date(en.getTime() + deltaDays * 86400000)
            if (newEnd <= s) return t
            return { ...t, end: toISO(newEnd) }
          } else {
            const newStart = new Date(s.getTime() + deltaDays * 86400000)
            if (newStart >= en) return t
            return { ...t, start: toISO(newStart) }
          }
        })
      })))
      resizing.current = { ...r, startX: e.clientX }
    }
    function onMouseUp() { resizing.current = null }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp) }
  }, [dayW])

  function togglePhase(pid) {
    setCollapsed(prev => { const n = new Set(prev); n.has(pid) ? n.delete(pid) : n.add(pid); return n })
  }

  function openTask(taskId, phaseId) { setSelectedTaskId(taskId); setSelectedPhaseId(phaseId) }
  function closeDrawer() { setSelectedTaskId(null); setSelectedPhaseId(null) }

  function updateProgress(taskId, progress) {
    setPhases(prev => prev.map(p => ({ ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, progress } : t) })))
  }
  function addComment(taskId, comment) {
    setComments(prev => ({ ...prev, [taskId]: [...(prev[taskId] || []), comment] }))
  }
  function hasComments(taskId) { return !!(comments[taskId] && comments[taskId].length) }

  function addPhaseMember(phaseId) {
    const name = window.prompt('Tên nhân sự tham gia giai đoạn này:')
    if (!name?.trim()) return
    const role = window.prompt('Vai trò (VD: Kỹ sư, Đội thi công...):') || 'Thành viên'
    setPhases(prev => prev.map(p => p.id === phaseId ? { ...p, members: [...(p.members || []), { name: name.trim(), role }] } : p))
  }

  const drawerTask = useMemo(() => {
    if (!selectedTaskId) return null
    const phase = phases.find(p => p.id === selectedPhaseId)
    const task = phase?.tasks.find(t => t.id === selectedTaskId)
    return task ? { task, phase } : null
  }, [selectedTaskId, selectedPhaseId, phases])

  /* stats */
  const allTasks = useMemo(() => allTasksFlat(phases).filter(t => !t.milestone && !t.finType), [phases])
  const doneCount = allTasks.filter(t => statusOf(t) === 'done').length
  const overdueCount = allTasks.filter(t => statusOf(t) === 'overdue').length
  const progressCount = allTasks.filter(t => statusOf(t) === 'progress').length
  const avgProgress = allTasks.length ? Math.round(allTasks.reduce((s, t) => s + t.progress, 0) / allTasks.length) : 0
  const netCashflow = CASHFLOW_DATA.income - CASHFLOW_DATA.expense

  /* visible phases: filtered by phase chip + search term */
  const visiblePhases = useMemo(() => {
    const term = search.trim().toLowerCase()
    return phases
      .filter(p => phaseFilter === 'all' || p.id === phaseFilter)
      .map(p => ({ ...p, tasks: p.tasks.filter(t => !term || t.name.toLowerCase().includes(term) || (t.assignee || '').toLowerCase().includes(term)) }))
      .filter(p => p.tasks.length > 0)
  }, [phases, phaseFilter, search])

  /* build flat rows with pre-computed top positions */
  const rows = useMemo(() => {
    const result = []
    let y = 0
    visiblePhases.forEach(phase => {
      result.push({ type: 'phase', phase, top: y })
      y += PHASE_H
      if (!collapsed.has(phase.id)) {
        phase.tasks.forEach(task => { result.push({ type: 'task', task, phase, top: y }); y += ROW_H })
      }
    })
    return result
  }, [visiblePhases, collapsed])
  const totalRowsH = useMemo(() => rows.reduce((acc, r) => acc + (r.type === 'phase' ? PHASE_H : ROW_H), 0), [rows])

  /* month + week header cells */
  const months = useMemo(() => {
    const cells = []
    let cur = new Date(RANGE_START.getFullYear(), RANGE_START.getMonth(), 1)
    while (cur < RANGE_END) {
      const next = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
      const segStart = cur < RANGE_START ? RANGE_START : cur
      const segEnd = next > RANGE_END ? RANGE_END : next
      cells.push({ key: `${cur.getFullYear()}-${cur.getMonth()}`, label: `${MONTH_NAMES[cur.getMonth()]} ${cur.getFullYear()}`, left: xFor(segStart), width: xFor(segEnd) - xFor(segStart) })
      cur = next
    }
    return cells
  }, [RANGE_START, RANGE_END, dayW])

  const weeks = useMemo(() => {
    const cells = []
    let cur = new Date(RANGE_START)
    while (cur.getDay() !== 1) cur.setDate(cur.getDate() - 1)
    while (cur < RANGE_END) {
      cells.push({ key: toISO(cur), label: fmt(cur), left: xFor(cur), width: 7 * dayW })
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7)
    }
    return cells
  }, [RANGE_START, RANGE_END, dayW])

  /* grid lines (weekend shading + monday separators), shared across all rows */
  const gridLines = useMemo(() => {
    const lines = []
    for (let d = 0; d <= TOTAL_DAYS; d++) {
      const date = new Date(RANGE_START); date.setDate(date.getDate() + d)
      const day = date.getDay()
      if (day === 0 || day === 6) lines.push({ key: d, weekend: true, left: d * dayW, width: dayW })
      else if (day === 1) lines.push({ key: d, weekend: false, left: d * dayW, width: 1 })
    }
    return lines
  }, [RANGE_START, TOTAL_DAYS, dayW])

  const todayX = useMemo(() => xFor(TODAY), [RANGE_START, dayW])
  const totalW = TOTAL_DAYS * dayW

  function goToToday() {
    const col = tlBodyRef.current
    if (!col) return
    col.scrollTo({ left: Math.max(0, todayX - col.clientWidth / 2), behavior: 'smooth' })
  }

  return (
    <div className="gantt-tab">
      {/* Topbar */}
      <div className="gtb-topbar">
        <div className="gtb-project-id">
          <div className="qlt-proj-switcher">
            <button className="qlt-proj-btn" onClick={() => setProjOpen(o => !o)}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              {activeProj.name.replace(' — ', ' / ')}
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {projOpen && (
              <div className="qlt-proj-dropdown">
                {PROJECT_SHORTLIST.map(p => (
                  <div key={p.name} className={`qlt-proj-option ${p.name === activeProj.name ? 'active' : ''}`}
                    onClick={() => { setActiveProj(p); setProjOpen(false) }}>
                    <div className="opt-name">{p.name}</div>
                    <div className="opt-sub">{p.sub}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <h1 className="gtb-title">Tiến độ</h1>
        </div>

        <div className="gtb-divider" />

        <div className="gtb-ring-wrap">
          <svg className="gtb-ring" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray="100.5" strokeDashoffset={100.5 - (100.5 * avgProgress / 100)}
              transform="rotate(-90 20 20)" />
          </svg>
          <div className="gtb-ring-label">
            <span className="num">{avgProgress}%</span>
            <span className="txt">Tổng tiến độ</span>
          </div>
        </div>

        <div className="gtb-divider" />

        <div className="gtb-search">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm công việc, người phụ trách..." />
        </div>

        <div className="gtb-view-switch">
          <button className={zoom === 'week' ? 'active' : ''} onClick={() => setZoom('week')}>Tuần</button>
          <button className={zoom === 'month' ? 'active' : ''} onClick={() => setZoom('month')}>Tháng</button>
        </div>

        <button className="gtb-today-btn" onClick={goToToday}>Về hôm nay</button>
      </div>

      {/* Stats row */}
      <div className="gtb-stats">
        <div className="gtb-stat"><span className="n">{allTasks.length}</span><span className="l">Tổng số công việc</span></div>
        <div className="gtb-stat accent-done"><span className="n">{doneCount}</span><span className="l">Đã hoàn thành</span></div>
        <div className="gtb-stat accent-progress"><span className="n">{progressCount}</span><span className="l">Đang thực hiện</span></div>
        <div className="gtb-stat accent-overdue"><span className="n">{overdueCount}</span><span className="l">Trễ hạn</span></div>
        <div className="gtb-stat"><span className="n">{avgProgress}%</span><span className="l">Tiến độ trung bình</span></div>
        <div className={`gtb-stat ${netCashflow >= 0 ? 'accent-done' : 'accent-overdue'}`}>
          <span className="n">{netCashflow >= 0 ? '+' : '−'}{Math.abs(netCashflow).toFixed(2)} tỷ</span>
          <span className="l">Dòng tiền</span>
        </div>
      </div>

      {/* Phase filter chips + legend */}
      <div className="gtb-filters">
        <span className="flabel">Lọc theo giai đoạn</span>
        <button className={`chip ${phaseFilter === 'all' ? 'active' : ''}`} onClick={() => setPhaseFilter('all')}>Tất cả</button>
        {phases.map(p => (
          <button key={p.id} className={`chip ${phaseFilter === p.id ? 'active' : ''}`} onClick={() => setPhaseFilter(p.id)}>{p.name}</button>
        ))}
        <span className="spacer" />
        <div className="gtb-legend">
          <div className="li"><span className="sw" style={{ background: 'var(--done)' }} />Hoàn thành</div>
          <div className="li"><span className="sw" style={{ background: 'var(--progress)' }} />Đang thực hiện</div>
          <div className="li"><span className="sw" style={{ background: 'var(--overdue)' }} />Trễ hạn</div>
          <div className="li"><span className="sw" style={{ background: 'var(--notstarted)' }} />Chưa bắt đầu</div>
          <div className="li"><span className="sw" style={{ background: 'var(--milestone)', transform: 'rotate(45deg)' }} />Mốc quan trọng</div>
          <div className="li"><span className="sw" style={{ background: 'var(--income)', borderRadius: 20 }} />Thu tiền</div>
          <div className="li"><span className="sw" style={{ background: 'var(--expense)', borderRadius: 20 }} />Chi tiền</div>
        </div>
      </div>

      {/* Gantt grid */}
      <div className="gtb-grid" onClick={() => projOpen && setProjOpen(false)}>
        {/* Sidebar */}
        <div className="gtb-sidebar">
          <div className="gtb-sidebar-head">
            <div className="h-name">Công việc</div>
            <div>Thời lượng</div>
            <div>Phụ trách</div>
            <div>Trạng thái</div>
          </div>
          <div className="gtb-sidebar-body" ref={sideBodyRef}>
            {rows.map(row => {
              if (row.type === 'phase') {
                const isCol = collapsed.has(row.phase.id)
                const doneInPhase = row.phase.tasks.filter(t => statusOf(t) === 'done').length
                const members = row.phase.members || []
                const shown = members.slice(0, 4)
                const extra = members.length - shown.length
                return (
                  <div key={row.phase.id} className={`gtb-row-phase ${isCol ? 'collapsed' : ''}`} style={{ height: PHASE_H }}>
                    <span className="chev" onClick={() => togglePhase(row.phase.id)}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                    </span>
                    <span className="phase-name" onClick={() => togglePhase(row.phase.id)}>{row.phase.name}</span>
                    <div className="avatar-stack">
                      {shown.map(m => <span key={m.name} className="avatar" style={{ background: avatarColor(m.name) }} title={`${m.name} — ${m.role}`}>{initials(m.name)}</span>)}
                      {extra > 0 && <span className="avatar-more" title={`${extra} người khác`}>+{extra}</span>}
                    </div>
                    <button className="add-member-btn" title="Thêm nhân sự" onClick={e => { e.stopPropagation(); addPhaseMember(row.phase.id) }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                    <span className="phase-meta">{doneInPhase}/{row.phase.tasks.length}</span>
                  </div>
                )
              }
              const task = row.task
              const st = statusOf(task)
              const isSel = selectedTaskId === task.id
              const isFin = !!task.finType
              const durationCell = isFin ? task.amount : (task.milestone ? fmt(parseD(task.start)) : `${Math.max(1, dayDiff(parseD(task.start), parseD(task.end)) + 1)}d`)
              const statusCell = isFin
                ? <span className={`status-badge status-${task.finType === 'thu' ? 'income' : 'expense'}`}><span className="dot" />{task.finType === 'thu' ? 'Thu tiền' : 'Chi tiền'}</span>
                : <span className={`status-badge status-${st}`}><span className="dot" />{STATUS_LABEL[st]}</span>
              return (
                <div key={task.id} className={`gtb-row-task ${isSel ? 'selected' : ''}`} style={{ height: ROW_H }}
                  onClick={() => openTask(task.id, row.phase.id)}>
                  <div className="t-name" title={task.name}>
                    {task.critical && <span className="crit-dot" title="Đường găng" />}
                    {isFin ? (task.finType === 'thu' ? '↑ ' : '↓ ') : (task.milestone ? '◆ ' : '')}
                    {task.name}
                    {hasComments(task.id) && (
                      <span className="comment-flag-inline" title="Có bình luận">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </span>
                    )}
                  </div>
                  <div className="t-dates">{durationCell}</div>
                  <div className="t-assignee">
                    {task.assignee && <span className="avatar-mini" style={{ background: avatarColor(task.assignee) }}>{initials(task.assignee)}</span>}
                    {task.assignee}
                  </div>
                  <div className="t-status">{statusCell}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="gtb-timeline">
          {/* Header (horizontal position mirrors body's scrollLeft, no native scroll of its own) */}
          <div className="gtb-tl-head" ref={tlHeadRef}>
            <div style={{ width: totalW, position: 'relative' }}>
              <div className="th-months">
                {months.map(m => <div key={m.key} className="m" style={{ left: m.left, width: m.width }}>{m.label}</div>)}
                <div className="today-flag" style={{ left: todayX }}>Hôm nay · {fmtFull(TODAY)}</div>
              </div>
              <div className="th-weeks">
                {weeks.map(w => <div key={w.key} className="w" style={{ left: w.left, width: w.width }}>{w.label}</div>)}
              </div>
            </div>
          </div>

          {/* Body (the actual scrollable element, both axes) */}
          <div className="gtb-tl-body" ref={tlBodyRef}>
            <div style={{ width: totalW, position: 'relative', height: totalRowsH }}>
              {/* shared grid lines */}
              <div className="grid-lines">
                {gridLines.map(l => <div key={l.key} className={`gl ${l.weekend ? 'weekend' : ''}`} style={{ left: l.left, width: l.width }} />)}
              </div>
              {/* today line */}
              <div className="today-line" style={{ left: todayX }} />

              {rows.map(row => {
                if (row.type === 'phase') {
                  return <div key={row.phase.id} className="gtb-tl-row-phase" style={{ position: 'absolute', left: 0, top: row.top, width: totalW, height: PHASE_H }} />
                }
                const task = row.task
                const st = statusOf(task)
                const isSel = selectedTaskId === task.id
                const rowStyle = { position: 'absolute', left: 0, top: row.top, width: totalW, height: ROW_H }

                if (task.finType) {
                  const x = xFor(parseD(task.start))
                  return (
                    <div key={task.id} className="gtb-tl-row-task" style={rowStyle}>
                      <div className={`fin-marker fin-${task.finType} ${isSel ? 'selected' : ''}`} style={{ left: x }}
                        title={`${task.name} — ${task.amount}`} onClick={e => { e.stopPropagation(); openTask(task.id, row.phase.id) }}>
                        <span>{task.finType === 'thu' ? '↑' : '↓'}</span><span>{task.amount}</span>
                      </div>
                    </div>
                  )
                }
                if (task.milestone) {
                  const x = xFor(parseD(task.start))
                  return (
                    <div key={task.id} className="gtb-tl-row-task" style={rowStyle}>
                      <div className={`milestone-mark ${isSel ? 'selected' : ''}`} style={{ left: x }}
                        title={task.name} onClick={e => { e.stopPropagation(); openTask(task.id, row.phase.id) }} />
                    </div>
                  )
                }
                const x1 = xFor(parseD(task.start))
                const x2 = xFor(parseD(task.end)) + dayW
                const w = Math.max(dayW, x2 - x1)
                return (
                  <div key={task.id} className="gtb-tl-row-task" style={rowStyle}>
                    <div className={`bar bar-status-${st} ${task.critical ? 'critical' : ''} ${isSel ? 'selected' : ''}`}
                      style={{ left: x1, width: w }} title={`${task.name} — ${task.progress}%`}
                      onClick={e => { e.stopPropagation(); openTask(task.id, row.phase.id) }}>
                      <div className="fill" style={{ width: `${task.progress}%` }} />
                      <span className="bar-label">{task.progress}%</span>
                      <div className="resize-handle left" onMouseDown={e => { e.stopPropagation(); resizing.current = { taskId: task.id, side: 'left', startX: e.clientX } }} />
                      <div className="resize-handle right" onMouseDown={e => { e.stopPropagation(); resizing.current = { taskId: task.id, side: 'right', startX: e.clientX } }} />
                    </div>
                    {hasComments(task.id) && (
                      <div className="comment-flag" style={{ left: x1 + w + 8 }} title="Có bình luận — bấm để xem"
                        onClick={e => { e.stopPropagation(); openTask(task.id, row.phase.id) }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Task drawer */}
      {drawerTask && (
        <TaskDrawer
          task={drawerTask.task}
          phase={drawerTask.phase}
          onClose={closeDrawer}
          onProgressChange={updateProgress}
          comments={comments[selectedTaskId]}
          onAddComment={c => addComment(selectedTaskId, c)}
        />
      )}
    </div>
  )
}
