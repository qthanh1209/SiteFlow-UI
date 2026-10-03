import { useState } from 'react'
import { INITIAL_STEPS, LEADERBOARD, initials } from '../../../data/quanLyThietKeData'

const IconBuilding = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v18"/>
    <path d="M6 12h12M6 8h12M6 16h12"/>
  </svg>
)

const IconPlus = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IconCheck = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4,12 9,17 20,6"/>
  </svg>
)

const IconLock = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>
  </svg>
)

function medalColor(rank) {
  if (rank === 1) return { bg: 'var(--gold-tint, #FEF3C7)', color: 'var(--gold, #D97706)' }
  if (rank === 2) return { bg: 'var(--silver-tint, #F1F5F9)', color: 'var(--silver, #94A3B8)' }
  if (rank === 3) return { bg: 'var(--bronze-tint, #FEF0E7)', color: 'var(--bronze, #C2774B)' }
  return { bg: 'var(--surface-alt)', color: 'var(--text-muted)' }
}

const TASK_TABS = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'mission', label: 'Nhiệm vụ' },
  { id: 'rewards', label: 'Đổi quà' },
  { id: 'leaderboard', label: 'Bảng xếp hạng' },
]

const REWARDS_LIST = [
  { name: 'Phiếu ăn trưa miễn phí (1 tuần)', cost: 300, iconBg: 'var(--finance-tint)', iconColor: 'var(--finance)', icon: '<path d="M3 11l19-9-9 19-2-8-8-2z"/>' },
  { name: 'Áo đồng phục cao cấp', cost: 500, iconBg: 'var(--primary-tint)', iconColor: 'var(--primary)', icon: '<path d="M20.4 14.5 16 10 4 20"/><path d="M6 20 20.4 5.5"/>' },
  { name: 'Voucher đổ xăng 200.000đ', cost: 600, iconBg: 'var(--attendance-tint)', iconColor: 'var(--attendance)', icon: '<path d="M3 12h18M6 12V8a6 6 0 0 1 12 0v4"/><path d="M5 12v7a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2h8v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-7"/>' },
  { name: 'Bộ dụng cụ bảo hộ lao động cao cấp', cost: 900, iconBg: 'var(--success-tint)', iconColor: 'var(--success)', icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  { name: 'Ngày nghỉ phép thêm (1 ngày)', cost: 1200, iconBg: 'var(--game-tint)', iconColor: 'var(--game)', icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
  { name: 'Thưởng tiền mặt 500.000đ', cost: 2000, locked: true, iconBg: 'var(--surface-alt)', iconColor: 'var(--text-muted)', icon: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8V5a3 3 0 0 1 6 0v3"/>' },
]

const INITIAL_WALLET = 1240

export default function TaskGameTab() {
  const [subTab, setSubTab] = useState('overview')
  const [steps, setSteps] = useState(INITIAL_STEPS)
  const [wallet, setWallet] = useState(INITIAL_WALLET)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [newTask, setNewTask] = useState({ name: '', step: '4', assignee: '', pts: '20' })

  const totalMax = steps.reduce((s, st) => s + st.subtasks.reduce((a, x) => a + x.pts, 0), 0)
  const totalEarned = steps.reduce((s, st) => s + st.subtasks.reduce((a, x) => a + (x.done ? x.pts : 0), 0), 0)
  const doneSteps = steps.filter(s => s.status === 'done').length

  function toggleSubtask(stepIdx, subIdx) {
    setSteps(prev => {
      const next = prev.map((st, si) => si !== stepIdx ? st : {
        ...st,
        subtasks: st.subtasks.map((s, xi) => xi !== subIdx ? s : { ...s, done: true })
      })
      const step = next[stepIdx]
      if (step.subtasks.every(s => s.done)) {
        next[stepIdx] = { ...next[stepIdx], status: 'done' }
        if (next[stepIdx + 1]?.status === 'locked') {
          next[stepIdx + 1] = { ...next[stepIdx + 1], status: 'current' }
        }
      }
      return next
    })
  }

  function addTask() {
    if (!newTask.name.trim()) return
    const si = Number(newTask.step)
    setSteps(prev => {
      const next = [...prev]
      next[si] = { ...next[si], subtasks: [...next[si].subtasks, { text: newTask.name, who: newTask.assignee || 'Chưa gán', pts: Number(newTask.pts) || 0, done: false }] }
      if (next[si].status === 'done') next[si] = { ...next[si], status: 'current' }
      return next
    })
    setShowCreateTask(false)
    setNewTask({ name: '', step: '4', assignee: '', pts: '20' })
  }

  return (
    <div className="game-tab">
      {/* Sub tab bar */}
      <div className="game-subnav" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {TASK_TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', padding: '7px 14px', borderRadius: 8, background: subTab === t.id ? 'var(--game-tint)' : 'none', color: subTab === t.id ? 'var(--game)' : 'var(--text-muted)', fontSize: 13, fontWeight: subTab === t.id ? 600 : 400, fontFamily: 'inherit' }}>{t.label}</button>
        ))}
      </div>

      {/* Overview */}
      {subTab === 'overview' && (
        <div className="game-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'Nhân sự tham gia', value: '24', sub: 'Trên 3 đội thi công', color: 'var(--text)' },
              { label: 'Tổng điểm đã phát', value: '18.450', sub: 'Từ đầu dự án đến nay', color: 'var(--gold, #D97706)', mono: true },
              { label: 'Nhiệm vụ hoàn thành tuần này', value: '12', sub: '+3 so với tuần trước', color: 'var(--success)' },
              { label: 'Quà đã đổi', value: '7', sub: 'Xem lịch sử tại tab Đổi quà', color: 'var(--game)' },
            ].map(k => (
              <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '17px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{k.label}</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: k.color, fontFamily: k.mono ? 'ui-monospace, monospace' : 'inherit' }}>{k.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Các quy trình đang "chơi"</h3>

              {/* Workflow card 1 — active */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--game)', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--game-tint)', color: 'var(--game)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconBuilding size={19} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Quy trình thi công nhà phố — Lô B12</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>15 bước · Đội thi công A</div>
                    </div>
                  </div>
                  <span onClick={() => setSubTab('mission')} style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--game)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Chơi tiếp</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--surface-alt)' }}>
                    <div style={{ width: `${Math.round(doneSteps / steps.length * 100)}%`, height: '100%', borderRadius: 4, background: 'var(--game)' }}></div>
                  </div>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{doneSteps}/{steps.length} bước</span>
                </div>
              </div>

              {/* Workflow card 2 — an toàn lao động */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--attendance-tint)', color: 'var(--attendance)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 3 7v6c0 5 4 9 9 9s9-4 9-9V7z"/></svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>An toàn lao động hàng ngày</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Chuỗi 12 ngày liên tiếp · Toàn công trường</div>
                    </div>
                  </div>
                  <span style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--surface-alt)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>Đang chạy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chuỗi hiện tại:</span>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 700, color: 'var(--attendance)' }}>12 ngày 🔥</span>
                </div>
              </div>

              {/* Workflow card 3 — locked/coming soon */}
              <div style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: .7 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--surface-alt)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V8a5 5 0 0 1 10 0v3"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Quy trình nghiệm thu hoàn công</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Sắp ra mắt — đang thiết kế nhiệm vụ &amp; mốc điểm</div>
                </div>
              </div>
            </div>

            {/* Mini leaderboard */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Bảng xếp hạng tuần này</h3>
                <span onClick={() => setSubTab('leaderboard')} style={{ fontSize: 12, color: 'var(--game)', fontWeight: 600, cursor: 'pointer' }}>Xem tất cả ›</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {LEADERBOARD.slice(0, 5).map((p, i) => {
                  const m = medalColor(i + 1)
                  return (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: m.bg, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flex: 'none' }}>{i + 1}</span>
                      <span style={{ width: 26, height: 26, borderRadius: '50%', background: p.color + '22', color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flex: 'none' }}>{initials(p.name)}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, color: 'var(--gold, #D97706)', fontWeight: 700 }}>{p.week}đ</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mission */}
      {subTab === 'mission' && (
        <div className="game-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--game-tint)', color: 'var(--game)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <IconBuilding size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Quy trình thi công nhà phố — Lô B12</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{steps.length} bước chính · Đội thi công A · Mỗi bước gồm các nhiệm vụ nhỏ, hoàn thành để nhận điểm</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 800, fontSize: 20, color: 'var(--gold, #D97706)' }}>
                {totalEarned.toLocaleString('vi-VN')} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>/ {totalMax.toLocaleString('vi-VN')} điểm</span>
              </div>
              <div style={{ width: 200, height: 7, borderRadius: 4, background: 'var(--surface-alt)', marginTop: 6 }}>
                <div style={{ width: `${Math.round(totalEarned / totalMax * 100)}%`, height: '100%', borderRadius: 4, background: 'var(--game)' }}></div>
              </div>
            </div>
            <button onClick={() => setShowCreateTask(true)} style={{ border: 'none', background: 'var(--game)', color: '#fff', padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flex: 'none', fontFamily: 'inherit' }}>
              <IconPlus size={15} /> Tạo nhiệm vụ
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((step, idx) => {
              const isOpen = step.status !== 'locked'
              const stepEarned = step.subtasks.reduce((s, x) => s + (x.done ? x.pts : 0), 0)
              const stepMax = step.subtasks.reduce((s, x) => s + x.pts, 0)
              return (
                <div key={idx} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, zIndex: 1,
                      background: step.status === 'done' ? 'var(--success)' : step.status === 'current' ? 'var(--game)' : 'var(--surface-alt)',
                      color: step.status === 'locked' ? 'var(--text-muted)' : '#fff',
                      border: step.status === 'locked' ? '1.5px dashed var(--border)' : 'none',
                      boxShadow: step.status === 'current' ? '0 0 0 4px var(--game-tint)' : 'none',
                    }}>
                      {step.status === 'done' ? <IconCheck size={16} /> : step.status === 'locked' ? <IconLock size={14} /> : idx + 1}
                    </div>
                    {idx < steps.length - 1 && <div style={{ position: 'absolute', left: 17, top: 38, bottom: -14, width: 2, background: 'var(--border)' }}></div>}
                  </div>
                  <div style={{ flex: 1, background: 'var(--surface)', border: `1px solid ${step.status === 'current' ? 'var(--game)' : 'var(--border)'}`, borderRadius: 12, padding: '14px 16px', marginBottom: 14, opacity: step.status === 'locked' ? .55 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{step.title}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                          {step.subtasks.length} nhiệm vụ nhỏ{step.status === 'locked' ? ' · Hoàn thành bước trước để mở khoá' : ''}
                        </div>
                      </div>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 800, color: step.status === 'locked' ? 'var(--text-muted)' : 'var(--gold, #D97706)' }}>
                        {stepEarned}/{stepMax}đ
                      </span>
                    </div>
                    {isOpen && step.subtasks.map((s, si) => (
                      <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                        <div
                          onClick={() => !s.done && step.status !== 'locked' && toggleSubtask(idx, si)}
                          style={{ width: 19, height: 19, borderRadius: 6, border: `1.5px solid ${s.done ? 'var(--success)' : 'var(--border)'}`, flex: 'none', cursor: s.done ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.done ? 'var(--success)' : 'var(--surface)', color: '#fff' }}
                        >
                          {s.done && <IconCheck />}
                        </div>
                        <span style={{ flex: 1, fontSize: 13, color: s.done ? 'var(--text-muted)' : 'var(--text)', textDecoration: s.done ? 'line-through' : 'none' }}>{s.text}</span>
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{s.who}</span>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 700, color: 'var(--gold, #D97706)', width: 44, textAlign: 'right' }}>+{s.pts}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rewards */}
      {subTab === 'rewards' && (
        <div className="game-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#0E8A8222', color: 'var(--attendance)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flex: 'none' }}>LV</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Lê Văn — Đội thi công A</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Điểm khả dụng để đổi quà</div>
            </div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 800, fontSize: 20, color: 'var(--gold, #D97706)' }}>{wallet.toLocaleString('vi-VN')} điểm</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {REWARDS_LIST.map((r, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, opacity: r.locked ? .55 : 1 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: r.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={r.iconColor} strokeWidth="2" dangerouslySetInnerHTML={{ __html: r.icon }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, color: r.locked ? 'var(--text-muted)' : 'var(--gold, #D97706)', fontWeight: 700 }}>{r.cost.toLocaleString('vi-VN')} điểm</div>
                <button
                  disabled={r.locked || r.cost > wallet}
                  onClick={() => !r.locked && r.cost <= wallet && setWallet(w => w - r.cost)}
                  style={{ border: 'none', background: (r.locked || r.cost > wallet) ? 'var(--surface-alt)' : 'var(--game)', color: (r.locked || r.cost > wallet) ? 'var(--text-muted)' : '#fff', padding: 8, borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: (r.locked || r.cost > wallet) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                >
                  {r.locked ? 'Chưa mở' : r.cost > wallet ? 'Không đủ điểm' : 'Đổi ngay'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>Lịch sử đổi quà gần đây</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ flex: 1 }}>Ngọc Hà — Áo đồng phục cao cấp</span>
              <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--gold, #D97706)' }}>-500 điểm</span>
              <span style={{ color: 'var(--text-muted)' }}>18/09</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', fontSize: 13 }}>
              <span style={{ flex: 1 }}>Phạm Quốc Bảo — Phiếu ăn trưa miễn phí</span>
              <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--gold, #D97706)' }}>-300 điểm</span>
              <span style={{ color: 'var(--text-muted)' }}>10/09</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {subTab === 'leaderboard' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '6px 20px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 2fr 1.4fr 1fr 1fr', gap: 10, padding: '12px 4px', fontSize: 10.5, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            <span>Hạng</span><span>Nhân viên</span><span>Đội</span><span>Điểm tuần này</span><span>Tổng điểm</span>
          </div>
          {LEADERBOARD.map((p, i) => {
            const m = medalColor(i + 1)
            return (
              <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '0.6fr 2fr 1.4fr 1fr 1fr', gap: 10, alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: m.bg, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{i + 1}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', background: p.color + '22', color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{initials(p.name)}</span>
                  {p.name}
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{p.team}</span>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, fontWeight: 600 }}>{p.week} đ</span>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, fontWeight: 700, color: 'var(--gold, #D97706)' }}>{p.total.toLocaleString('vi-VN')} đ</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div onClick={e => e.target === e.currentTarget && setShowCreateTask(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,20,30,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 420, maxWidth: 'calc(100vw - 40px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px', boxShadow: '0 24px 60px rgba(0,0,0,.28)' }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 700, margin: '0 0 4px' }}>Tạo nhiệm vụ mới</h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Dành cho lãnh đạo — tạo nhiệm vụ và chỉ định nhân sự tham gia.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Tên nhiệm vụ *</label>
              <input type="text" value={newTask.name} onChange={e => setNewTask(t => ({ ...t, name: e.target.value }))} placeholder="VD: Kiểm tra chất lượng bê tông đài móng" style={{ padding: '9px 11px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Thuộc bước thi công</label>
              <select value={newTask.step} onChange={e => setNewTask(t => ({ ...t, step: e.target.value }))} style={{ padding: '9px 11px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
                {steps.map((s, i) => <option key={i} value={i}>{i + 1}. {s.title}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Nhân sự tham gia</label>
              <input type="text" value={newTask.assignee} onChange={e => setNewTask(t => ({ ...t, assignee: e.target.value }))} placeholder="VD: Đội thi công A, Đỗ Thành Long" style={{ padding: '9px 11px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Điểm thưởng</label>
              <input type="text" value={newTask.pts} onChange={e => setNewTask(t => ({ ...t, pts: e.target.value }))} placeholder="VD: 20" style={{ padding: '9px 11px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button onClick={() => setShowCreateTask(false)} style={{ padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)', fontFamily: 'inherit' }}>Huỷ</button>
              <button onClick={addTask} style={{ padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--game)', color: '#fff', fontFamily: 'inherit' }}>Tạo nhiệm vụ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
