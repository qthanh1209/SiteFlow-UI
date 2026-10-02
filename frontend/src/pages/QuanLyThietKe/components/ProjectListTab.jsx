import { useState, useEffect, useMemo } from 'react'
import {
  STATIC_PROJECTS, INITIAL_PROJECT_MEMBERS, PROJ_DEPTS,
  avatarColor, initials, MEMBERS,
} from '../../../data/quanLyThietKeData'

const KD_STAGE_STATUS = {
  'thiet-ke': { label: 'Thiết kế', color: 'var(--primary)', bg: 'var(--primary-tint)' },
  'thi-cong': { label: 'Đang thi công', color: 'var(--success)', bg: 'var(--success-tint)' },
  'tu-van':   { label: 'Tư vấn', color: 'var(--gold)', bg: 'var(--gold-tint, rgba(201,162,39,.12))' },
  'dam-phan': { label: 'Đàm phán', color: 'var(--gold)', bg: 'var(--gold-tint, rgba(201,162,39,.12))' },
}
const STATIC_STATUS = {
  primary: { label: 'Đang thi công', color: 'var(--primary)', bg: 'var(--primary-tint)' },
  success: { label: 'Hoàn tất', color: 'var(--success)', bg: 'var(--success-tint)' },
  muted:   { label: 'Bản nháp', color: 'var(--text-muted)', bg: 'var(--surface-alt)' },
}
const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Đang thi công', label: 'Đang thi công' },
  { value: 'Thiết kế', label: 'Thiết kế' },
  { value: 'Tư vấn', label: 'Tư vấn' },
  { value: 'Hoàn tất', label: 'Hoàn tất' },
  { value: 'Bản nháp', label: 'Bản nháp' },
]
const TYPE_OPTIONS = [
  { value: '', label: 'Tất cả loại hình' },
  { value: 'Chung cư', label: 'Chung cư' },
  { value: 'Nhà phố', label: 'Nhà phố' },
  { value: 'Biệt thự', label: 'Biệt thự' },
  { value: 'Văn phòng', label: 'Văn phòng' },
]
const SORT_OPTIONS = [
  { value: '', label: 'Sắp xếp mặc định' },
  { value: 'name', label: 'Theo tên' },
  { value: 'budget-desc', label: 'Ngân sách (cao → thấp)' },
  { value: 'progress-desc', label: 'Tiến độ (cao → thấp)' },
]

function parseBudget(str) {
  if (!str) return 0
  const m = String(str).match(/[\d.,]+/)
  return m ? parseFloat(m[0].replace(',', '.')) : 0
}

function useProjectMembers(projName) {
  // stored in component-level state via parent, we'll use a simple local approach
  return []
}

export default function ProjectListTab() {
  const [search, setSearch]     = useState('')
  const [statusF, setStatusF]   = useState('')
  const [typeF, setTypeF]       = useState('')
  const [sortBy, setSortBy]     = useState('')
  const [kdProjects, setKdProjects] = useState([])
  const [members, setMembers]   = useState(INITIAL_PROJECT_MEMBERS)
  const [detail, setDetail]     = useState(null)
  const [addName, setAddName]   = useState('')
  const [addDept, setAddDept]   = useState('')
  const [addRole, setAddRole]   = useState('')

  /* load synced KD projects from localStorage */
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('siteflow-synced-projects') || '[]')
      setKdProjects(raw)
    } catch { setKdProjects([]) }
  }, [])

  /* merge static + kd projects into unified shape */
  const allProjects = useMemo(() => {
    const statics = STATIC_PROJECTS.map(p => ({
      key: p.name,
      name: p.name,
      client: p.client,
      type: p.type,
      budget: p.budget,
      budgetNum: parseBudget(p.budget),
      progress: p.progress,
      barColor: p.barColor ? `var(--${p.barColor})` : 'var(--project)',
      status: STATIC_STATUS[p.statusColor] || STATIC_STATUS.muted,
      fromKD: false,
      isStatic: true,
    }))
    const kd = kdProjects.map(p => {
      const stDef = KD_STAGE_STATUS[p.stage] || { label: p.stage, color: 'var(--text-muted)', bg: 'var(--surface-alt)' }
      return {
        key: p.id,
        name: p.name,
        client: p.client,
        type: null,
        budget: p.value ? `${p.value} tỷ` : '—',
        budgetNum: p.value || 0,
        progress: null,
        barColor: 'var(--project)',
        status: stDef,
        fromKD: true,
        isStatic: false,
      }
    })
    return [...statics, ...kd]
  }, [kdProjects])

  /* filter */
  const filtered = useMemo(() => {
    let list = allProjects
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.client?.toLowerCase().includes(q))
    }
    if (statusF) list = list.filter(p => p.status.label === statusF)
    if (typeF)   list = list.filter(p => p.type === typeF)
    if (sortBy === 'name')          list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    if (sortBy === 'budget-desc')   list = [...list].sort((a, b) => b.budgetNum - a.budgetNum)
    if (sortBy === 'progress-desc') list = [...list].sort((a, b) => (b.progress ?? -1) - (a.progress ?? -1))
    return list
  }, [allProjects, search, statusF, typeF, sortBy])

  /* stats — budget sum from static projects only (confirmed budgets) */
  const stats = useMemo(() => ({
    total:    allProjects.length,
    active:   allProjects.filter(p => p.status.label === 'Đang thi công').length,
    draft:    allProjects.filter(p => p.status.label === 'Bản nháp').length,
    budget:   STATIC_PROJECTS.reduce((acc, p) => acc + parseBudget(p.budget), 0),
  }), [allProjects])

  function clearFilters() { setSearch(''); setStatusF(''); setTypeF(''); setSortBy('') }

  function openDetail(proj) {
    setDetail(proj)
    setAddName(''); setAddDept(''); setAddRole('')
  }

  function addMember() {
    if (!addName || !detail) return
    const deptLabel = PROJ_DEPTS.find(d => d.value === addDept)?.label || addDept
    setMembers(prev => ({
      ...prev,
      [detail.key]: [...(prev[detail.key] || []), { name: addName, role: addRole || deptLabel, dept: addDept }],
    }))
    setAddName(''); setAddRole('')
  }

  function removeMember(key, idx) {
    setMembers(prev => ({ ...prev, [key]: (prev[key] || []).filter((_, i) => i !== idx) }))
  }

  const detailMembers = detail ? (members[detail.key] || []) : []

  return (
    <div className="projlist-tab">
      {/* Filter toolbar */}
      <div className="projlist-toolbar">
        <div className="projlist-search">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)', flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Tìm dự án, khách hàng..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <FilterSelect value={statusF} onChange={setStatusF} options={STATUS_FILTER_OPTIONS} />
        <FilterSelect value={typeF} onChange={setTypeF} options={TYPE_OPTIONS} />
        <FilterSelect value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />

        <button onClick={clearFilters} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'none', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Xoá lọc
        </button>
      </div>

      {/* Stats chips */}
      <div className="projlist-stats">
        <div className="pls-chip">
          <div className="pls-val">{stats.total}</div>
          <div className="pls-lbl">TỔNG DỰ ÁN</div>
        </div>
        <div className="pls-chip" style={{ color: 'var(--primary)' }}>
          <div className="pls-val">{stats.active}</div>
          <div className="pls-lbl">ĐANG THI CÔNG</div>
        </div>
        <div className="pls-chip">
          <div className="pls-val">{stats.draft}</div>
          <div className="pls-lbl">BẢN NHÁP</div>
        </div>
        <div className="pls-chip" style={{ color: 'var(--finance)' }}>
          <div className="pls-val">{stats.budget.toFixed(1).replace(/\.0$/, '')} tỷ</div>
          <div className="pls-lbl">TỔNG NGÂN SÁCH QUẢN LÝ</div>
        </div>
      </div>

      {/* Table */}
      <div className="projlist-body">
        <table className="proj-table">
          <thead>
            <tr>
              <th style={{ minWidth: 220 }}>DỰ ÁN</th>
              <th style={{ minWidth: 160 }}>KHÁCH HÀNG</th>
              <th style={{ minWidth: 100 }}>LOẠI HÌNH</th>
              <th style={{ minWidth: 110 }}>NGÂN SÁCH</th>
              <th style={{ minWidth: 160 }}>TIẾN ĐỘ</th>
              <th style={{ minWidth: 120 }}>NHÂN SỰ</th>
              <th style={{ minWidth: 110 }}>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Không có dự án nào phù hợp</td></tr>
            )}
            {filtered.map(proj => {
              const projMembers = members[proj.key] || []
              return (
                <tr key={proj.key} className="proj-tr" onClick={() => openDetail(proj)}>
                  {/* Dự án */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{proj.name}</span>
                    </div>
                  </td>
                  {/* Khách hàng */}
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{proj.client || '—'}</td>
                  {/* Loại hình */}
                  <td>
                    {proj.fromKD
                      ? <span className="kd-source-badge">Từ Kinh doanh</span>
                      : <span style={{ fontSize: 13, color: 'var(--text)' }}>{proj.type}</span>
                    }
                  </td>
                  {/* Ngân sách */}
                  <td style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{proj.budget}</td>
                  {/* Tiến độ */}
                  <td>
                    {typeof proj.progress === 'number' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', minWidth: 80 }}>
                          <div style={{ height: '100%', width: proj.progress + '%', background: proj.barColor, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 28, textAlign: 'right' }}>{proj.progress}%</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                    )}
                  </td>
                  {/* Nhân sự */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {projMembers.slice(0, 3).map((m, i) => (
                        <div key={i} style={{
                          width: 24, height: 24, borderRadius: '50%', background: avatarColor(m.name), color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 700, border: '2px solid var(--surface)',
                          marginLeft: i === 0 ? 0 : -6, zIndex: 3 - i, flexShrink: 0,
                        }} title={`${m.name} — ${m.role}`}>{initials(m.name)}</div>
                      ))}
                      {projMembers.length > 3 && (
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface-alt)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, border: '2px solid var(--surface)', marginLeft: -6 }}>
                          +{projMembers.length - 3}
                        </div>
                      )}
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', border: '1.5px dashed var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, color: 'var(--text-muted)', marginLeft: projMembers.length === 0 ? 0 : -4,
                        cursor: 'pointer', flexShrink: 0,
                      }}
                        onClick={e => { e.stopPropagation(); openDetail(proj) }}
                        title="Quản lý nhân sự"
                      >+</div>
                    </div>
                  </td>
                  {/* Trạng thái */}
                  <td>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                      background: proj.status.bg, color: proj.status.color, fontWeight: 500,
                    }}>{proj.status.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {detail && (
        <>
          <div className="proj-detail-overlay" onClick={() => setDetail(null)} />
          <div className="proj-detail-drawer">
            <div className="proj-detail-header">
              <div className="proj-detail-title">{detail.name}</div>
              <button className="icon-btn" onClick={() => setDetail(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: detail.status.bg, color: detail.status.color, alignSelf: 'flex-start', marginBottom: 14, fontWeight: 500 }}>
              {detail.status.label}
            </span>
            {detail.fromKD && (
              <div style={{ fontSize: 12, color: 'var(--primary)', background: 'var(--primary-tint)', padding: '6px 10px', borderRadius: 6, marginBottom: 12 }}>
                Dự án được đồng bộ từ pipeline Kinh doanh
              </div>
            )}
            {detail.client && (
              <div className="proj-detail-field"><label>Khách hàng</label><div className="df">{detail.client}</div></div>
            )}
            {detail.type && (
              <div className="proj-detail-field"><label>Loại hình</label><div className="df">{detail.type}</div></div>
            )}
            <div className="proj-detail-field"><label>Ngân sách</label><div className="df" style={{ fontWeight: 700 }}>{detail.budget}</div></div>
            {detail.progress !== null && (
              <div className="proj-detail-field">
                <label>Tiến độ</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: detail.progress + '%', background: detail.barColor, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{detail.progress}%</span>
                </div>
              </div>
            )}

            <div className="proj-detail-field" style={{ marginTop: 8 }}>
              <label>Thành viên tham gia</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', margin: '4px -3px' }}>
                {detailMembers.map((m, i) => (
                  <span className="proj-member-chip" key={i}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: avatarColor(m.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{initials(m.name)}</div>
                    {m.name} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {m.role}</span>
                    <button onClick={() => removeMember(detail.key, i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, padding: '0 2px' }}>×</button>
                  </span>
                ))}
                {detailMembers.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0' }}>Chưa có thành viên</span>}
              </div>
              <div className="add-member-row" style={{ flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                <select value={addName} onChange={e => setAddName(e.target.value)} style={{ flex: '1 1 110px', padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, background: 'var(--surface-alt)', color: 'var(--text)' }}>
                  <option value="">-- Thành viên --</option>
                  {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={addDept} onChange={e => setAddDept(e.target.value)} style={{ flex: '1 1 110px', padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, background: 'var(--surface-alt)', color: 'var(--text)' }}>
                  <option value="">-- Phòng ban --</option>
                  {PROJ_DEPTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <input placeholder="Vai trò" value={addRole} onChange={e => setAddRole(e.target.value)}
                  style={{ flex: '1 1 100px', padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, background: 'var(--surface-alt)', color: 'var(--text)', outline: 'none' }} />
                <button onClick={addMember} style={{ padding: '5px 12px', borderRadius: 6, background: 'var(--project)', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer' }}>Thêm</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: '5px 28px 5px 10px', borderRadius: 6, border: '1px solid var(--border)',
          background: value ? 'var(--primary-tint)' : 'var(--surface-alt)', color: value ? 'var(--primary)' : 'var(--text-muted)',
          fontSize: 12, cursor: 'pointer', appearance: 'none', fontFamily: 'inherit',
          outline: 'none',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  )
}
