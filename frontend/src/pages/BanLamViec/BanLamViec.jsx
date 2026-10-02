import { useState } from 'react'
import PageShell from '../../components/layout/PageShell'

const initialTasks = [
  { id: 1, text: 'Hoàn thành báo cáo tuần cho quản lý', done: false },
  { id: 2, text: 'Review hợp đồng với đối tác ABC', done: true },
  { id: 3, text: 'Cập nhật tiến độ dự án SiteFlow v2', done: false },
]

export default function BanLamViec() {
  const [tasks, setTasks] = useState(initialTasks)

  const toggle = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))

  const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }
  const label = { fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }
  const row = { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }

  return (
    <PageShell title="Bàn làm việc" subtitle="Nhiệm vụ cá nhân & chấm công của tôi">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* My tasks today */}
        <div style={{ ...card, gridColumn: '1 / -1' }}>
          <p style={label}>Nhiệm vụ hôm nay</p>
          {tasks.map((t, i) => (
            <div key={t.id} style={{ ...row, borderBottom: i === tasks.length - 1 ? 'none' : '1px solid var(--border)' }}>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontSize: '14px', textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text-muted)' : 'var(--text)' }}>
                {t.text}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {t.done ? 'Hoàn thành' : 'Đang làm'}
              </span>
            </div>
          ))}
        </div>

        {/* Attendance summary */}
        <div style={card}>
          <p style={label}>Chấm công hôm nay</p>
          {[['Giờ vào', '08:02'], ['Giờ ra', '--:--'], ['Tổng giờ', '0h 0m'], ['Trạng thái', 'Đang làm việc']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13.5px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Leave balance */}
        <div style={card}>
          <p style={label}>Số ngày phép còn lại</p>
          {[['Phép năm', 12, 14], ['Phép bệnh', 3, 5], ['Phép không lương', 0, 10]].map(([name, used, total]) => (
            <div key={name} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                <span>{name}</span>
                <span style={{ fontWeight: 600 }}>{total - used} / {total} ngày</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(used / total) * 100}%`, background: 'var(--primary)', borderRadius: '99px' }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </PageShell>
  )
}
