import { useMemo, useRef, useState } from 'react'
import {
  INITIAL_EMPLOYEES, HR_DEPTS, HR_DEPT_COLOR, HR_STATUS_LABEL, HR_STATUS_COLOR, HR_CONTRACT_TYPES, HR_LEVELS,
  hrFmtMoney, hrFmtDate, hrInitials, hrMatchesTimeFilter,
} from '../../../data/chamCongData'

const EMPTY_FORM = {
  name: '', position: '', dept: 'Quản lý dự án', status: 'active', phone: '', email: '', joinDate: '',
  cccd: '', dob: '', hometown: '', emergencyName: '', emergencyPhone: '', bankName: '', bankAccount: '',
  contractType: 'Thử việc', level: 'Nhân viên', salary: '', lineManager: '',
}
const FORM_TABS = [{ key: 'basic', label: 'Cơ bản' }, { key: 'personal', label: 'Cá nhân' }, { key: 'job', label: 'Công việc' }]
const DETAIL_TABS = [{ key: 'personal', label: 'Thông tin cá nhân' }, { key: 'job', label: 'Thông tin công việc' }, { key: 'files', label: 'Hồ sơ đính kèm' }]
const LIST_COLS = 'cc-emp-cols'
const todayISO = () => new Date().toISOString().slice(0, 10)

const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
)

function DeptPill({ dept, fontSize = 11 }) {
  const dc = HR_DEPT_COLOR[dept]
  return <span className="cc-pill" style={{ background: `var(${dc.t})`, color: `var(${dc.c})`, fontSize }}>{dept}</span>
}
function StatusPill({ status, fontSize = 11 }) {
  const sc = HR_STATUS_COLOR[status]
  return <span className="cc-pill" style={{ background: `var(${sc.t})`, color: `var(${sc.c})`, fontSize }}>{HR_STATUS_LABEL[status]}</span>
}

/* ---------------- Danh sách ---------------- */
function EmployeeList({ employees, viewMode, onOpenDetail }) {
  if (!employees.length) return <div className="cc-empty-state">Không tìm thấy nhân sự phù hợp bộ lọc.</div>

  if (viewMode === 'grid') {
    return (
      <div className="cc-emp-grid">
        {employees.map(e => (
          <div key={e.id} className="cc-emp-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="cc-emp-avatar">{hrInitials(e.name)}</div>
              <div style={{ minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{e.code}</div>
                <button
                  type="button"
                  className="cc-emp-name-btn cc-ellipsis"
                  style={{ fontSize: 13.5, fontWeight: 700, display: 'block', maxWidth: 170, ...(e.status === 'left' ? { textDecoration: 'line-through' } : {}) }}
                  onClick={() => onOpenDetail(e.id)}
                >{e.name}</button>
                <div className="cc-ellipsis" style={{ fontSize: 11.5, color: 'var(--text-muted)', maxWidth: 170 }}>{e.position}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <DeptPill dept={e.dept} fontSize={10.5} />
              <StatusPill status={e.status} fontSize={10.5} />
            </div>
            <div className="cc-ellipsis" style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{e.email || '—'}</div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{e.phone}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="cc-card" style={{ padding: '6px 20px 8px', overflowX: 'auto' }}>
      <div style={{ minWidth: 840 }}>
        <div className={`cc-grid ${LIST_COLS} cc-grid-head`}>
          <span>Mã NV</span><span>Họ tên</span><span>Phòng ban</span><span>Chức vụ</span><span>Email</span><span>Điện thoại</span><span>Trạng thái</span>
        </div>
        {employees.map(e => (
          <div key={e.id} className={`cc-grid ${LIST_COLS} cc-grid-row`} style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{e.code}</span>
            <button
              type="button"
              className="cc-emp-name-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, ...(e.status === 'left' ? { color: 'var(--text-muted)', textDecoration: 'line-through' } : {}) }}
              onClick={() => onOpenDetail(e.id)}
            >
              <span className="cc-emp-avatar" style={{ width: 26, height: 26, fontSize: 11 }}>{hrInitials(e.name)}</span>{e.name}
            </button>
            <DeptPill dept={e.dept} />
            <span className="cc-ellipsis" style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{e.position}</span>
            <span className="cc-ellipsis" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.email || '—'}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.phone}</span>
            <StatusPill status={e.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Form thêm / sửa ---------------- */
function EmployeeForm({ editing, initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial)
  const [tab, setTab] = useState('basic')
  const nameRef = useRef(null)
  const phoneRef = useRef(null)
  const bind = key => ({ value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) })

  function save() {
    // Ô bắt buộc nằm ở tab "Cơ bản" — chuyển về tab đó để focus được (bản HTML focus vào ô đang bị ẩn)
    if (!form.name.trim()) { setTab('basic'); setTimeout(() => nameRef.current?.focus()); return }
    if (!form.phone.trim()) { setTab('basic'); setTimeout(() => phoneRef.current?.focus()); return }
    onSave({
      ...form,
      name: form.name.trim(),
      position: form.position.trim() || 'Chưa cập nhật',
      phone: form.phone.trim(),
      email: form.email.trim(),
      joinDate: form.joinDate || todayISO(),
      cccd: form.cccd.trim(),
      hometown: form.hometown.trim(),
      emergencyName: form.emergencyName.trim(),
      emergencyPhone: form.emergencyPhone.trim(),
      bankName: form.bankName.trim(),
      bankAccount: form.bankAccount.trim(),
      salary: form.salary.trim(),
      lineManager: form.lineManager.trim(),
    })
  }

  const stepStyle = key => ({ display: tab === key ? 'flex' : 'none' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <button type="button" className="cc-back-btn" onClick={onCancel}><BackIcon />Quay lại danh sách nhân sự</button>
      <div>
        <div className="cc-page-title">{editing ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự'}</div>
        <div className="cc-form-tabs" style={{ marginTop: 14 }}>
          {FORM_TABS.map(t => <button key={t.key} type="button" className={`cc-form-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
        </div>
      </div>
      <div style={{ maxWidth: 640, width: '100%' }}>
        <div className="cc-form-step" style={stepStyle('basic')}>
          <div className="cc-form-grid">
            <div className="cc-field"><label>Họ tên *</label><input ref={nameRef} type="text" placeholder="VD: Nguyễn Văn A" {...bind('name')} /></div>
            <div className="cc-field"><label>Chức vụ *</label><input type="text" placeholder="VD: Kỹ sư công trình" {...bind('position')} /></div>
          </div>
          <div className="cc-form-grid">
            <div className="cc-field"><label>Phòng ban</label>
              <select {...bind('dept')}>{HR_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}</select>
            </div>
            <div className="cc-field"><label>Trạng thái</label>
              <select {...bind('status')}>{Object.entries(HR_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </div>
          </div>
          <div className="cc-form-grid">
            <div className="cc-field"><label>Điện thoại *</label><input ref={phoneRef} type="text" placeholder="09xx xxx xxx" {...bind('phone')} /></div>
            <div className="cc-field"><label>Email</label><input type="text" placeholder="ten@siteflow.vn" {...bind('email')} /></div>
          </div>
          <div className="cc-field" style={{ maxWidth: 300 }}><label>Ngày vào làm</label><input type="date" {...bind('joinDate')} /></div>
        </div>
        <div className="cc-form-step" style={stepStyle('personal')}>
          <div className="cc-form-grid">
            <div className="cc-field"><label>CCCD/CMND</label><input type="text" placeholder="VD: 079xxxxxxxxx" {...bind('cccd')} /></div>
            <div className="cc-field"><label>Ngày sinh</label><input type="date" {...bind('dob')} /></div>
          </div>
          <div className="cc-field"><label>Quê quán</label><input type="text" placeholder="VD: Nam Định" {...bind('hometown')} /></div>
          <div className="cc-form-grid">
            <div className="cc-field"><label>Liên hệ khẩn cấp — Họ tên</label><input type="text" placeholder="VD: Nguyễn Thị B" {...bind('emergencyName')} /></div>
            <div className="cc-field"><label>Liên hệ khẩn cấp — SĐT</label><input type="text" placeholder="09xx xxx xxx" {...bind('emergencyPhone')} /></div>
          </div>
          <div className="cc-form-grid">
            <div className="cc-field"><label>Ngân hàng</label><input type="text" placeholder="VD: Vietcombank" {...bind('bankName')} /></div>
            <div className="cc-field"><label>Số tài khoản</label><input type="text" placeholder="VD: 0123456789" {...bind('bankAccount')} /></div>
          </div>
        </div>
        <div className="cc-form-step" style={stepStyle('job')}>
          <div className="cc-form-grid">
            <div className="cc-field"><label>Loại hợp đồng</label>
              <select {...bind('contractType')}>{HR_CONTRACT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
            </div>
            <div className="cc-field"><label>Cấp bậc (Level)</label>
              <select {...bind('level')}>{HR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
            </div>
          </div>
          <div className="cc-form-grid">
            <div className="cc-field"><label>Mức lương hiện tại (VNĐ)</label><input type="text" placeholder="VD: 15000000" {...bind('salary')} /></div>
            <div className="cc-field"><label>Quản lý trực tiếp</label><input type="text" placeholder="VD: Trần Anh" {...bind('lineManager')} /></div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', borderTop: '1px solid var(--border)', maxWidth: 640 }}>
        <button className="cc-btn-primary" style={{ padding: '10px 20px' }} onClick={save}>{editing ? 'Lưu thay đổi' : 'Thêm nhân sự'}</button>
        <button className="cc-btn-ghost" onClick={onCancel}>Hủy</button>
      </div>
    </div>
  )
}

/* ---------------- Chi tiết ---------------- */
function EmployeeDetail({ employee: e, onBack, onEdit, onAddFile, onRemoveFile }) {
  const [tab, setTab] = useState('personal')
  const fileRef = useRef(null)
  const row = (k, v, mono) => <div className="cc-detail-row"><span className="k">{k}</span><span className={`v${mono ? ' mono' : ''}`}>{v}</span></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <button type="button" className="cc-back-btn" onClick={onBack}><BackIcon />Quay lại danh sách nhân sự</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="cc-emp-avatar" style={{ width: 52, height: 52, fontSize: 19 }}>{hrInitials(e.name)}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{e.code}</span>
            <div className="cc-ellipsis" style={{ fontFamily: 'var(--cc-font)', fontWeight: 800, fontSize: 19, textDecoration: e.status === 'left' ? 'line-through' : 'none' }}>{e.name}</div>
          </div>
          <div className="cc-ellipsis" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{e.position}</div>
        </div>
        <button className="cc-btn-primary" style={{ padding: '9px 18px', flex: 'none' }} onClick={() => onEdit(e.id)}>Chỉnh sửa</button>
      </div>
      <div className="cc-form-tabs">
        {DETAIL_TABS.map(t => <button key={t.key} type="button" className={`cc-form-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>
      <div style={{ maxWidth: 640, width: '100%' }}>
        <div style={{ display: tab === 'personal' ? 'block' : 'none' }}>
          {row('Phòng ban', <DeptPill dept={e.dept} />)}
          {row('Trạng thái', <StatusPill status={e.status} />)}
          {row('Điện thoại', e.phone, true)}
          {row('Email', e.email || '—')}
          {row('CCCD/CMND', e.cccd || '—', true)}
          {row('Ngày sinh', e.dob ? hrFmtDate(e.dob) : '—', true)}
          {row('Quê quán', e.hometown || '—')}
          {row('Liên hệ khẩn cấp', (e.emergencyName || e.emergencyPhone) ? `${e.emergencyName || '—'} — ${e.emergencyPhone || '—'}` : '—')}
          {row('Tài khoản ngân hàng', (e.bankName || e.bankAccount) ? `${e.bankName || '—'} · ${e.bankAccount || '—'}` : '—')}
        </div>
        <div style={{ display: tab === 'job' ? 'block' : 'none' }}>
          {row('Ngày vào làm', hrFmtDate(e.joinDate), true)}
          {row('Loại hợp đồng', e.contractType || '—')}
          {row('Cấp bậc', e.level || '—')}
          {row('Mức lương hiện tại', hrFmtMoney(e.salary), true)}
          {row('Quản lý trực tiếp', e.lineManager || '—')}
          <div style={{ paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-muted)', marginBottom: 8 }}>Lịch sử thăng tiến</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {e.promotions && e.promotions.length
                ? e.promotions.map((p, i) => <div key={i} className="cc-promo-item"><span>{p.note}</span><span className="mono" style={{ color: 'var(--text-muted)' }}>{hrFmtDate(p.date)}</span></div>)
                : <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chưa có lịch sử thăng tiến.</div>}
            </div>
          </div>
        </div>
        <div style={{ display: tab === 'files' ? 'block' : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 0 0' }}>
            {e.attachments && e.attachments.length ? e.attachments.map((f, i) => (
              <div key={i} className="cc-attachment-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', color: 'var(--attendance)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                <span className="name">{f.name}</span>
                <button type="button" className="cc-attachment-remove" title="Xóa" onClick={() => onRemoveFile(e.id, i)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" /></svg>
                </button>
              </div>
            )) : <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 0' }}>Chưa có hồ sơ đính kèm.</div>}
          </div>
          <button type="button" className="cc-upload-btn" onClick={() => fileRef.current?.click()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L10.13 17.1a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
            Tải lên hồ sơ (hợp đồng, bằng cấp, CV...)
          </button>
          <input
            ref={fileRef}
            type="file"
            style={{ display: 'none' }}
            onChange={ev => {
              const file = ev.target.files[0]
              if (file) onAddFile(e.id, file.name)
              ev.target.value = ''
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* ---------------- Tab chính ---------------- */
export default function HoSoTab() {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES)
  const [nextId, setNextId] = useState(13)
  const [view, setView] = useState({ name: 'list' }) // list | form | detail
  const [viewMode, setViewMode] = useState('list')
  const [filters, setFilters] = useState({ q: '', dept: 'all', status: 'all', time: 'all', contract: 'all' })
  const setFilter = key => e => setFilters(f => ({ ...f, [key]: e.target.value }))

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    probation: employees.filter(e => e.status === 'probation').length,
    left: employees.filter(e => e.status === 'left').length,
    depts: new Set(employees.map(e => e.dept)).size,
  }), [employees])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    return employees.filter(e => {
      if (filters.dept !== 'all' && e.dept !== filters.dept) return false
      if (filters.status !== 'all' && e.status !== filters.status) return false
      if (filters.contract !== 'all' && e.contractType !== filters.contract) return false
      if (!hrMatchesTimeFilter(e.joinDate, filters.time)) return false
      if (q && !e.name.toLowerCase().includes(q) && !e.phone.includes(q) && !(e.code || '').toLowerCase().includes(q)) return false
      return true
    })
  }, [employees, filters])

  function updateEmployee(id, fn) {
    setEmployees(prev => prev.map(e => e.id === id ? fn(e) : e))
  }

  function openAdd() {
    setView({ name: 'form', editingId: null, initial: { ...EMPTY_FORM, joinDate: todayISO() }, key: Date.now() })
  }
  function openEdit(id) {
    const e = employees.find(x => x.id === id)
    if (!e) return
    const initial = Object.fromEntries(Object.keys(EMPTY_FORM).map(k => [k, e[k] || EMPTY_FORM[k]]))
    setView({ name: 'form', editingId: id, initial, key: Date.now() })
  }
  function saveForm(data) {
    if (view.editingId) {
      updateEmployee(view.editingId, e => ({ ...e, ...data }))
    } else {
      setEmployees(prev => [...prev, {
        ...data,
        id: nextId,
        code: 'NV' + String(nextId).padStart(3, '0'),
        promotions: [{ date: data.joinDate, note: 'Gia nhập — ' + data.position }],
        attachments: [],
      }])
      setNextId(n => n + 1)
    }
    setView({ name: 'list' })
  }

  const detailEmployee = view.name === 'detail' ? employees.find(e => e.id === view.id) : null

  return (
    <>
      <div style={{ display: view.name === 'list' ? 'flex' : 'none', flexDirection: 'column', gap: 16 }}>
        <div className="cc-kpi-grid">
          <div className="cc-card cc-kpi">
            <div className="cc-kpi-label">Tổng nhân sự</div>
            <div className="cc-kpi-value">{stats.total}</div>
            <div className="cc-kpi-sub">Trên {stats.depts} phòng ban</div>
          </div>
          <div className="cc-card cc-kpi">
            <div className="cc-kpi-label">Đang làm việc</div>
            <div className="cc-kpi-value" style={{ color: 'var(--success)' }}>{stats.active}</div>
            <div className="cc-kpi-sub">Chính thức</div>
          </div>
          <div className="cc-card cc-kpi">
            <div className="cc-kpi-label">Thử việc</div>
            <div className="cc-kpi-value" style={{ color: 'var(--finance)' }}>{stats.probation}</div>
            <div className="cc-kpi-sub">Đang trong kỳ đánh giá</div>
          </div>
          <div className="cc-card cc-kpi">
            <div className="cc-kpi-label">Đã nghỉ việc</div>
            <div className="cc-kpi-value" style={{ color: 'var(--danger)' }}>{stats.left}</div>
            <div className="cc-kpi-sub">Trong 12 tháng qua</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span className="cc-section-title">Danh sách nhân sự</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="cc-view-toggle">
              <button type="button" className={`cc-view-btn${viewMode === 'list' ? ' active' : ''}`} title="Xem dạng danh sách" onClick={() => setViewMode('list')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              </button>
              <button type="button" className={`cc-view-btn${viewMode === 'grid' ? ' active' : ''}`} title="Xem dạng ô" onClick={() => setViewMode('grid')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
              </button>
            </div>
            <button type="button" className="cc-btn-add" onClick={openAdd}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Thêm nhân sự
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <input type="text" className="cc-filter" placeholder="Tìm theo tên, số điện thoại..." style={{ flex: 1, minWidth: 180, padding: '8px 12px' }} value={filters.q} onChange={setFilter('q')} />
          <select className="cc-filter" value={filters.dept} onChange={setFilter('dept')}>
            <option value="all">Tất cả phòng ban</option>
            {HR_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="cc-filter" value={filters.status} onChange={setFilter('status')}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(HR_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select className="cc-filter" value={filters.time} onChange={setFilter('time')}>
            <option value="all">Ngày vào làm: Tất cả</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
          <select className="cc-filter" value={filters.contract} onChange={setFilter('contract')}>
            <option value="all">Tất cả loại HĐ</option>
            {HR_CONTRACT_TYPES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
          </select>
        </div>

        <div><EmployeeList employees={filtered} viewMode={viewMode} onOpenDetail={id => setView({ name: 'detail', id })} /></div>
      </div>

      {view.name === 'form' && (
        <EmployeeForm
          key={view.key}
          editing={!!view.editingId}
          initial={view.initial}
          onCancel={() => setView({ name: 'list' })}
          onSave={saveForm}
        />
      )}

      {detailEmployee && (
        <EmployeeDetail
          key={detailEmployee.id}
          employee={detailEmployee}
          onBack={() => setView({ name: 'list' })}
          onEdit={openEdit}
          onAddFile={(id, name) => updateEmployee(id, e => ({ ...e, attachments: [...(e.attachments || []), { name }] }))}
          onRemoveFile={(id, idx) => updateEmployee(id, e => ({ ...e, attachments: e.attachments.filter((_, i) => i !== idx) }))}
        />
      )}
    </>
  )
}
