import Modal from './Modal'
import Field from './Field'
import { stages, categories } from '../../../data/kinhDoanhData'
import { buttonStyle, primaryButton, initials } from '../utils'

export default function LeadModal({ leadModal, leadForm, leadStep, assigneeForm, updateForm, setLeadStep, setAssigneeForm, saveLead, onClose }) {
  return (
    <Modal title={leadModal === 'new' ? 'Thêm khách hàng tiềm năng' : 'Chỉnh sửa lead'} width={720} onClose={onClose}>
      <p className="kd-modal-subtitle">Điền thông tin theo 3 cấp độ — càng đầy đủ, hồ sơ chuyển giao sang thi công càng chính xác.</p>
      <div className="kd-modal-tabs">
        {[['Cơ bản', 0], ['Chi tiết', 1], ['Nâng cao', 2]].map(([label, index]) => (
          <button className={leadStep === index ? 'active' : ''} key={label} onClick={() => setLeadStep(index)}>{index + 1}. {label}</button>
        ))}
      </div>
      <div className="kd-modal-body">
        {leadStep === 0 && <div className="kd-form-grid">
          <Field label="Tên khách hàng *"><input value={leadForm.name} onChange={e => updateForm('name', e.target.value)} placeholder="VD: Anh Nguyễn Văn Phú" autoFocus /></Field>
          <Field label="Số điện thoại *"><input value={leadForm.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="09xx xxx xxx" /></Field>
          <Field label="Email"><input value={leadForm.email} onChange={e => updateForm('email', e.target.value)} placeholder="khachhang@email.com" /></Field>
          <Field label="Nguồn khách hàng">
            <select value={leadForm.source} onChange={e => updateForm('source', e.target.value)}>
              {['Giới thiệu', 'Website', 'Mạng xã hội', 'Sự kiện', 'Khác'].map(v => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Địa chỉ"><input value={leadForm.address} onChange={e => updateForm('address', e.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện" /></Field>
          <Field label="Phòng ban phụ trách">
            <select value={leadForm.dept} onChange={e => updateForm('dept', e.target.value)}>
              <option value="dan-dung">Phòng KD Dân dụng</option>
              <option value="du-an">Phòng KD Dự Án</option>
            </select>
          </Field>
          <div className="kd-assignee-editor">
            <b>Người phụ trách</b>
            <div>
              {leadForm.assignees.map((person, i) => (
                <span className="lm-assignee-chip" key={`${person.name}-${i}`}>
                  <i>{initials(person.name)}</i>{person.name}
                  {person.role && <small>· {person.role}</small>}
                  <button onClick={() => updateForm('assignees', leadForm.assignees.filter((_, idx) => idx !== i))}>×</button>
                </span>
              ))}
            </div>
            <div className="kd-inline-fields">
              <input placeholder="Họ tên" value={assigneeForm.name} onChange={e => setAssigneeForm(f => ({ ...f, name: e.target.value }))} />
              <input placeholder="Vai trò (VD: Sale phụ trách, Kỹ thuật...)" value={assigneeForm.role} onChange={e => setAssigneeForm(f => ({ ...f, role: e.target.value }))} />
              <button style={buttonStyle} onClick={() => {
                if (!assigneeForm.name.trim()) return
                updateForm('assignees', [...leadForm.assignees, { name: assigneeForm.name.trim(), role: assigneeForm.role.trim() }])
                setAssigneeForm({ name: '', role: '' })
              }}>＋ Thêm</button>
            </div>
          </div>
        </div>}
        {leadStep === 1 && <div className="kd-form-grid">
          <Field label="Loại dự án">
            <select value={leadForm.projectType} onChange={e => updateForm('projectType', e.target.value)}>
              {['Nhà phố', 'Biệt thự', 'Chung cư', 'Văn phòng', 'Khác'].map(v => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Quy mô"><input value={leadForm.scale} onChange={e => updateForm('scale', e.target.value)} placeholder="VD: 5x20m, 1 trệt 3 lầu" /></Field>
          <Field label="Hạng mục quan tâm">
            <details className="kd-category-picker">
              <summary>{leadForm.categories.length ? leadForm.categories.join(', ') : 'Chọn hạng mục...'}</summary>
              <div>
                {categories.map(v => (
                  <label key={v}>
                    <input type="checkbox" checked={leadForm.categories.includes(v)} onChange={e => updateForm('categories', e.target.checked ? [...leadForm.categories, v] : leadForm.categories.filter(c => c !== v))} />
                    {v}
                  </label>
                ))}
              </div>
            </details>
          </Field>
          <Field label="Giá trị ước tính (tỷ)"><input inputMode="decimal" value={leadForm.value} onChange={e => updateForm('value', e.target.value)} placeholder="VD: 2.5" /></Field>
          <Field label="Giai đoạn hiện tại">
            <select value={leadForm.stage} onChange={e => updateForm('stage', e.target.value)}>
              {stages.slice(0, 6).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </Field>
        </div>}
        {leadStep === 2 && <div className="kd-form-grid">
          <Field label="BOQ (Bảng khối lượng dự toán)">
            <input type="file" accept=".xlsx,.pdf" onChange={e => updateForm('boqFile', e.target.files?.[0]?.name || '')} />
            {leadForm.boqFile && <small>📎 {leadForm.boqFile}</small>}
          </Field>
          <Field label="Concept / Ý tưởng thiết kế"><textarea rows="3" value={leadForm.concept} onChange={e => updateForm('concept', e.target.value)} placeholder="Mô tả phong cách, ý tưởng thiết kế mong muốn của khách hàng..." /></Field>
          <Field label="Ghi chú nội bộ"><textarea rows="2" value={leadForm.notes} onChange={e => updateForm('notes', e.target.value)} placeholder="Ghi chú cho đội kinh doanh / kỹ thuật..." /></Field>
          <label className="kd-checkbox"><input type="checkbox" checked={leadForm.partner} onChange={e => updateForm('partner', e.target.checked)} />Chuyển giao cho đối tác thi công/thiết kế ngoài</label>
        </div>}
      </div>
      <footer className="kd-modal-footer">
        <span>Bước {leadStep + 1}/3 — {['Cơ bản', 'Chi tiết', 'Nâng cao'][leadStep]}</span>
        <div>
          {leadStep > 0 && <button style={buttonStyle} onClick={() => setLeadStep(leadStep - 1)}>Quay lại</button>}
          {leadStep < 2
            ? <button style={primaryButton} onClick={() => leadStep === 0 && !leadForm.name.trim() ? undefined : setLeadStep(leadStep + 1)}>Tiếp theo</button>
            : <button style={primaryButton} onClick={saveLead}>{leadModal === 'new' ? 'Lưu khách hàng' : 'Lưu thay đổi'}</button>
          }
        </div>
      </footer>
    </Modal>
  )
}
