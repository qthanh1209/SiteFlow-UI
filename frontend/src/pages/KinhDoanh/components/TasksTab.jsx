import { leaderboard, rewards } from '../../../data/kinhDoanhData'
import { buttonStyle, primaryButton, initials } from '../utils'

function TaskSubpanel({ taskTab, name, children }) {
  return taskTab === name ? <div className="kd-task-panel">{children}</div> : null
}

export default function TasksTab({ taskTab, setTaskTab, tasks, setTasks, stagesEarned, totalPoints, doneSteps, wallet, setWallet, redeemed, setRedeemed, setTaskModal, setTaskForm }) {
  return (
    <section className="sales-panel">
      <nav className="kd-task-tabs">
        {[['overview', 'Tổng quan'], ['mission', 'Nhiệm vụ'], ['rewards', 'Đổi quà'], ['leaderboard', 'Bảng xếp hạng']].map(([key, label]) => (
          <button key={key} className={taskTab === key ? 'active' : ''} onClick={() => setTaskTab(key)}>{label}</button>
        ))}
      </nav>

      <TaskSubpanel taskTab={taskTab} name="overview">
        <div className="kd-task-kpis">{[['Nhân sự tham gia', '5', '2 phòng KD Dự Án & Dân dụng'], ['Tổng điểm đã phát', '7.240', 'Từ đầu quý đến nay'], ['Nhiệm vụ hoàn thành tuần này', '6', '+2 so với tuần trước'], ['Quà đã đổi', '4', 'Xem lịch sử tại tab Đổi quà']].map(([title, value, caption]) => (
          <article className="kd-kpi" key={title}><span>{title}</span><strong>{value}</strong><small>{caption}</small></article>
        ))}</div>
        <div className="kd-overview-grid">
          <article className="kd-widget"><h3>Quy trình đang "chơi"</h3><strong>Quy trình chốt hợp đồng — BQL Riverside GĐ3</strong><p>5 bước · Phòng KD Dự Án</p><button style={primaryButton} onClick={() => setTaskTab('mission')}>Chơi tiếp</button><div className="kd-progress"><i style={{ width: `${doneSteps / tasks.length * 100}%` }} /></div>{doneSteps}/{tasks.length} bước</article>
          <article className="kd-widget"><header><h3>Bảng xếp hạng tuần này</h3><button className="kd-link-button" onClick={() => setTaskTab('leaderboard')}>Xem tất cả ›</button></header>{leaderboard.slice(0, 5).map((person, i) => <div className="kd-rank-row" key={person.name}><b>{i + 1}</b><span>{person.name}</span><strong>{person.week}đ</strong></div>)}</article>
        </div>
      </TaskSubpanel>

      <TaskSubpanel taskTab={taskTab} name="mission">
        <article className="kd-widget kd-mission-head">
          <div><strong>Quy trình chốt hợp đồng — BQL Riverside GĐ3</strong><p>5 bước chính · Phòng KD Dự Án · Hoàn thành nhiệm vụ nhỏ để nhận điểm</p></div>
          <div className="kd-mission-score"><b>{stagesEarned} / {totalPoints} điểm</b><div className="kd-progress"><i style={{ width: `${totalPoints ? stagesEarned / totalPoints * 100 : 0}%` }} /></div></div>
          <button style={primaryButton} onClick={() => { setTaskForm({ name: '', step: Math.max(0, tasks.findIndex(t => t.status === 'current')), assignee: '', points: '20' }); setTaskModal(true) }}>＋ Tạo nhiệm vụ</button>
        </article>
        <div className="kd-steps">{tasks.map((task, index) => {
          const earned = task.subtasks.reduce((s, item) => s + (item.done ? item.pts : 0), 0)
          const possible = task.subtasks.reduce((s, item) => s + item.pts, 0)
          return (
            <article className={`kd-step ${task.status}`} key={task.title}>
              <span className={`kd-step-dot ${task.status}`}>{task.status === 'done' ? '✓' : task.status === 'locked' ? '▣' : index + 1}</span>
              <div className="kd-step-content">
                <header><div><strong>{task.title}</strong><small>{task.subtasks.length} nhiệm vụ nhỏ{task.status === 'locked' ? ' · Hoàn thành bước trước để mở khoá' : ''}</small></div><b>{earned}/{possible}đ</b></header>
                {task.status !== 'locked' && task.subtasks.map((subtask, subIndex) => (
                  <label className="kd-subtask" key={`${subtask.text}-${subIndex}`}>
                    <input type="checkbox" checked={subtask.done} disabled={task.status !== 'current'} onChange={e => {
                      setTasks(current => current.map((t, ti) => {
                        if (ti !== index) return t
                        const subtasks = t.subtasks.map((item, ii) => ii === subIndex ? { ...item, done: e.target.checked } : item)
                        const allDone = subtasks.every(item => item.done)
                        return { ...t, subtasks, status: allDone ? 'done' : 'current' }
                      }).map((t, ti, all) => t.status === 'locked' && all[ti - 1]?.status === 'done' ? { ...t, status: 'current' } : t))
                    }} />
                    <span className={subtask.done ? 'completed' : ''}>{subtask.text}</span><small>{subtask.who}</small><b>+{subtask.pts}đ</b>
                  </label>
                ))}
              </div>
            </article>
          )
        })}</div>
      </TaskSubpanel>

      <TaskSubpanel taskTab={taskTab} name="rewards">
        <article className="kd-widget kd-wallet"><div className="kd-person-avatar">TA</div><div><strong>Trần Anh — Trưởng phòng Kinh doanh</strong><p>Điểm khả dụng để đổi quà</p></div><b>{wallet.toLocaleString('vi-VN')} điểm</b></article>
        <div className="kd-rewards">{rewards.map(([name, cost, color, icon]) => (
          <article className="reward-card" key={name}><span style={{ color }}>{icon}</span><strong>{name}</strong><b>{cost.toLocaleString('vi-VN')} điểm</b>
            <button disabled={wallet < cost} style={wallet >= cost ? primaryButton : buttonStyle} onClick={() => { setWallet(w => w - cost); setRedeemed(r => [{ name, cost, date: new Date().toLocaleDateString('vi-VN') }, ...r]) }}>
              {wallet >= cost ? 'Đổi ngay' : 'Không đủ điểm'}
            </button>
          </article>
        ))}</div>
        <article className="kd-widget"><h3>Lịch sử đổi quà gần đây</h3>{[...redeemed, { name: 'Voucher nhà hàng', cost: 500, date: '18/09' }, { name: 'Phiếu ăn trưa miễn phí', cost: 300, date: '10/09' }].slice(0, 5).map((item, i) => <div className="kd-rank-row" key={`${item.name}-${i}`}><span>{i < redeemed.length ? 'Trần Anh' : i === redeemed.length ? 'Hoàng Yến Nhi' : 'Đặng Quốc Cường'} — {item.name}</span><strong>-{item.cost} điểm · {item.date}</strong></div>)}</article>
      </TaskSubpanel>

      <TaskSubpanel taskTab={taskTab} name="leaderboard">
        <article className="kd-widget">
          <div className="kd-list-head kd-leader-head"><span>Hạng</span><span>Nhân sự</span><span>Phòng ban</span><span>Điểm tuần này</span><span>Tổng điểm</span></div>
          {leaderboard.map((person, i) => <div className="kd-leader-row" key={person.name}><b>{i + 1}</b><strong><i style={{ background: `${person.color}22`, color: person.color }}>{initials(person.name)}</i>{person.name}</strong><span>{person.team}</span><span>{person.week} đ</span><b>{person.total.toLocaleString('vi-VN')} đ</b></div>)}
        </article>
      </TaskSubpanel>
    </section>
  )
}
