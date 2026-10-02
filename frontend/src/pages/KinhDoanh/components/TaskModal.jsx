import Modal from './Modal'
import Field from './Field'
import { buttonStyle, primaryButton } from '../utils'

export default function TaskModal({ taskForm, setTaskForm, tasks, setTasks, onClose }) {
  function handleCreate() {
    if (!taskForm.name.trim()) return
    setTasks(current => current.map((task, i) =>
      i === taskForm.step
        ? { ...task, status: task.status === 'done' ? 'current' : task.status, subtasks: [...task.subtasks, { text: taskForm.name.trim(), who: taskForm.assignee.trim() || 'Chưa gán', pts: Math.max(0, Number(taskForm.points) || 0), done: false }] }
        : task,
    ))
    onClose()
  }

  return (
    <Modal title="Tạo nhiệm vụ mới" onClose={onClose} width={460}>
      <div className="kd-handoff-content">
        <p className="kd-modal-subtitle">Dành cho trưởng phòng Kinh doanh — tạo nhiệm vụ và chỉ định nhân sự tham gia.</p>
        <Field label="Tên nhiệm vụ *">
          <input autoFocus value={taskForm.name} onChange={e => setTaskForm(f => ({ ...f, name: e.target.value }))} placeholder="VD: Gọi lại 5 khách hàng chưa phản hồi" />
        </Field>
        <Field label="Thuộc bước quy trình">
          <select value={taskForm.step} onChange={e => setTaskForm(f => ({ ...f, step: Number(e.target.value) }))}>
            {tasks.map((task, i) => <option key={task.title} value={i}>{i + 1}. {task.title}</option>)}
          </select>
        </Field>
        <Field label="Nhân sự tham gia">
          <input value={taskForm.assignee} onChange={e => setTaskForm(f => ({ ...f, assignee: e.target.value }))} placeholder="VD: Hoàng Yến Nhi, Đặng Quốc Cường" />
        </Field>
        <Field label="Điểm thưởng">
          <input inputMode="numeric" value={taskForm.points} onChange={e => setTaskForm(f => ({ ...f, points: e.target.value }))} />
        </Field>
        <div className="kd-modal-footer">
          <button style={buttonStyle} onClick={onClose}>Huỷ</button>
          <button style={primaryButton} onClick={handleCreate}>Tạo nhiệm vụ</button>
        </div>
      </div>
    </Modal>
  )
}
