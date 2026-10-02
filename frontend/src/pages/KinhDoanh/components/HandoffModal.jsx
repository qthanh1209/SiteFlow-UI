import Modal from './Modal'
import Field from './Field'
import { departments } from '../../../data/kinhDoanhData'
import { buttonStyle, primaryButton, formatValue } from '../utils'

export default function HandoffModal({ handoff, handoffConfig, handingLead, handoffForm, setHandoffForm, saveHandoff, onClose }) {
  return (
    <Modal title={handoffConfig.title} onClose={onClose} width={460}>
      <p className="kd-modal-subtitle">{handoffConfig.subtitle}</p>
      <div className="kd-handoff-content">
        <div className="kd-handoff-lead">
          <strong>{handingLead.name}</strong>
          <span>{handingLead.type} · {formatValue(handingLead.value)} · {departments[handingLead.dept]}</span>
        </div>
        <Field label="Ngày giờ hẹn (dự kiến)">
          <input type="datetime-local" value={handoffForm.date} onChange={e => setHandoffForm(f => ({ ...f, date: e.target.value }))} />
        </Field>
        <Field label={`Người phụ trách bên ${handoffConfig.dept} (nếu đã biết)`}>
          <input value={handoffForm.assignee} onChange={e => setHandoffForm(f => ({ ...f, assignee: e.target.value }))} placeholder="Nhập tên người phụ trách" />
        </Field>
        <p className="kd-handoff-note">Phòng {handoffConfig.dept} sẽ xác nhận lại ngày giờ và người phụ trách chính xác ngay khi nhận được thông báo.</p>
        <div className="kd-modal-footer">
          <button style={buttonStyle} onClick={onClose}>Huỷ</button>
          <button style={primaryButton} onClick={() => saveHandoff(false)}>Gửi yêu cầu đến Phòng {handoffConfig.dept}</button>
        </div>
        {handoffConfig.self && (
          <button className="kd-self-quote" onClick={() => saveHandoff(true)}>Phòng KD tự đề xuất báo giá</button>
        )}
      </div>
    </Modal>
  )
}
