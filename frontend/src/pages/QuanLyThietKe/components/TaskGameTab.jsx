import { useState } from 'react'
import { INITIAL_STEPS, REWARDS, LEADERBOARD, avatarColor, initials } from '../../../data/quanLyThietKeData'

const GAME_TABS = ['Nhiệm vụ', 'Phần thưởng', 'Bảng xếp hạng', 'Thống kê']
const INITIAL_WALLET = 1240

export default function TaskGameTab() {
  const [subTab, setSubTab] = useState(0)
  const [steps, setSteps] = useState(INITIAL_STEPS)
  const [expanded, setExpanded] = useState(new Set([4])) // step index 4 = current
  const [wallet, setWallet] = useState(INITIAL_WALLET)
  const [redeemMsg, setRedeemMsg] = useState(null)

  /* tổng điểm hoàn thành */
  const totalPts = steps.reduce((acc, s) =>
    acc + s.subtasks.filter(t => t.done).reduce((a, t) => a + t.pts, 0), 0)

  /* đếm subtask done/total trong bước hiện tại */
  const currentStep = steps.findIndex(s => s.status === 'current')

  function toggleExpand(i) {
    setExpanded(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  }

  function toggleSubtask(stepIdx, subIdx) {
    const step = steps[stepIdx]
    if (step.status === 'locked') return
    setSteps(prev => prev.map((s, si) => {
      if (si !== stepIdx) return s
      const subtasks = s.subtasks.map((t, ti) => {
        if (ti !== subIdx) return t
        if (!t.done) setWallet(w => w + t.pts)
        else setWallet(w => w - t.pts)
        return { ...t, done: !t.done }
      })
      return { ...s, subtasks }
    }))
  }

  function redeem(reward) {
    if (reward.locked || wallet < reward.cost) return
    setWallet(w => w - reward.cost)
    setRedeemMsg(`Đã đổi: ${reward.name}`)
    setTimeout(() => setRedeemMsg(null), 2500)
  }

  const maxWeek = Math.max(...LEADERBOARD.map(l => l.week))

  return (
    <div className="game-tab">
      <div className="game-subnav">
        {GAME_TABS.map((t, i) => (
          <button key={t} className={subTab === i ? 'active' : ''} onClick={() => setSubTab(i)}>{t}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div className="wallet-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          {wallet} điểm
        </div>
      </div>

      <div className="game-body">
        {redeemMsg && (
          <div style={{ background: 'var(--success-tint)', color: 'var(--success)', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, fontWeight: 600 }}>
            ✓ {redeemMsg}
          </div>
        )}

        {/* Nhiệm vụ */}
        {subTab === 0 && (
          <div className="step-list">
            {/* tiến độ tổng */}
            <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Tổng tiến độ thi công</span>
                <span style={{ fontSize: 13, color: 'var(--project)', fontWeight: 700 }}>{totalPts} điểm tích lũy</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (steps.filter(s => s.status === 'done').length / steps.length) * 100)}%`, background: 'var(--project)', borderRadius: 4, transition: 'width .3s' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                {steps.filter(s => s.status === 'done').length}/{steps.length} bước hoàn thành
                {currentStep >= 0 && ` · Bước hiện tại: ${steps[currentStep]?.title}`}
              </div>
            </div>

            {steps.map((step, si) => {
              const isExp = expanded.has(si)
              const doneSub = step.subtasks.filter(t => t.done).length
              const totalSub = step.subtasks.length
              return (
                <div className="step-card" key={si}>
                  <div className="step-head" onClick={() => toggleExpand(si)}>
                    <div className={`step-icon ${step.status}`}>
                      {step.status === 'done' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                      {step.status === 'current' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>}
                      {step.status === 'locked' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                    </div>
                    <span className="step-label">{si + 1}. {step.title}</span>
                    {step.status !== 'locked' && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 8 }}>{doneSub}/{totalSub}</span>
                    )}
                    <span className={`step-badge ${step.status}`}>
                      {step.status === 'done' ? 'Hoàn thành' : step.status === 'current' ? 'Đang thực hiện' : 'Chưa mở khóa'}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 8, transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: 'var(--text-muted)', flexShrink: 0 }}><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  {isExp && (
                    <div className="step-body">
                      {step.subtasks.map((sub, ti) => (
                        <div className="subtask-row" key={ti}>
                          <div
                            className={`subtask-check ${sub.done ? 'checked' : ''}`}
                            onClick={() => toggleSubtask(si, ti)}
                            title={step.status === 'locked' ? 'Bước này chưa mở khóa' : ''}
                            style={{ opacity: step.status === 'locked' ? .5 : 1 }}
                          >
                            {sub.done && '✓'}
                          </div>
                          <span className={`subtask-text ${sub.done ? 'done-text' : ''}`}>{sub.text}</span>
                          <span className="subtask-who">{sub.who}</span>
                          <span className="subtask-pts">+{sub.pts}đ</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Phần thưởng */}
        {subTab === 1 && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="wallet-chip" style={{ fontSize: 14 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                {wallet} điểm
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Dùng điểm tích lũy để đổi phần thưởng</span>
            </div>
            <div className="reward-grid">
              {REWARDS.map((r, i) => (
                <div className={`reward-card ${r.locked ? 'locked-reward' : ''}`} key={i}>
                  <div className="reward-icon" style={{ background: r.iconBg }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={r.iconColor} strokeWidth="2" dangerouslySetInnerHTML={{ __html: r.icon }} />
                  </div>
                  <div className="reward-name">{r.name}</div>
                  <div className="reward-cost">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 3 }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {r.cost} điểm
                  </div>
                  <button
                    className="reward-btn"
                    disabled={r.locked || wallet < r.cost}
                    onClick={() => redeem(r)}
                    title={r.locked ? 'Chưa mở khóa' : wallet < r.cost ? 'Không đủ điểm' : 'Đổi phần thưởng'}
                  >
                    {r.locked ? '🔒 Chưa mở' : wallet < r.cost ? 'Thiếu điểm' : 'Đổi ngay'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bảng xếp hạng */}
        {subTab === 2 && (
          <div>
            <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>Tuần này — Top cá nhân hoàn thành nhiều nhiệm vụ nhất</div>
            <table className="lb-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>#</th>
                  <th>Thành viên</th>
                  <th>Nhóm</th>
                  <th style={{ width: 140 }}>Tuần này</th>
                  <th style={{ width: 60, textAlign: 'right' }}>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD.map((row, i) => (
                  <tr key={row.name}>
                    <td>
                      <span className={`lb-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </span>
                    </td>
                    <td>
                      <div className="lb-member">
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: avatarColor(row.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{initials(row.name)}</div>
                        {row.name}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.team}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                          <div className="lb-week-bar" style={{ width: `${(row.week / maxWeek) * 100}%`, background: row.color }} />
                        </div>
                        <span style={{ fontSize: 12, minWidth: 30, textAlign: 'right', fontWeight: 600 }}>{row.week}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--game, #629933)' }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Thống kê */}
        {subTab === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { label: 'Tổng nhiệm vụ', value: steps.reduce((a, s) => a + s.subtasks.length, 0), color: 'var(--project)' },
              { label: 'Đã hoàn thành', value: steps.reduce((a, s) => a + s.subtasks.filter(t => t.done).length, 0), color: 'var(--success)' },
              { label: 'Chưa hoàn thành', value: steps.reduce((a, s) => a + s.subtasks.filter(t => !t.done && s.status !== 'locked').length, 0), color: 'var(--overdue)' },
              { label: 'Chưa mở khóa', value: steps.filter(s => s.status === 'locked').reduce((a, s) => a + s.subtasks.length, 0), color: 'var(--text-muted)' },
              { label: 'Điểm tích lũy', value: `${wallet} điểm`, color: 'var(--game, #629933)' },
              { label: 'Thành viên tham gia', value: LEADERBOARD.length, color: 'var(--project)' },
            ].map(stat => (
              <div key={stat.label} className="stat-chip" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
