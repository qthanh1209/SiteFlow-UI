import { useState, useRef, useEffect } from 'react'
import { avatarColor, initials, fmtFull, parseD, MEMBERS, ME_NAME } from '../../../data/quanLyThietKeData'

export default function TaskDrawer({ task, phase, onClose, onProgressChange, comments, onAddComment }) {
  const [draft, setDraft] = useState('')
  const [mentionQ, setMentionQ] = useState(null) // { query, from, to }
  const [mentionIdx, setMentionIdx] = useState(0)
  const textareaRef = useRef()

  const mentionCandidates = mentionQ
    ? MEMBERS.filter(m => m.toLowerCase().includes(mentionQ.query.toLowerCase())).slice(0, 6)
    : []

  function handleInputChange(e) {
    const val = e.target.value
    setDraft(val)
    const cursor = e.target.selectionStart
    const textBefore = val.slice(0, cursor)
    const match = textBefore.match(/@(\w*)$/)
    if (match) {
      setMentionQ({ query: match[1], from: cursor - match[0].length, to: cursor })
      setMentionIdx(0)
    } else {
      setMentionQ(null)
    }
  }

  function handleKeyDown(e) {
    if (!mentionQ) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment() }
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIdx(i => Math.min(i + 1, mentionCandidates.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      if (mentionCandidates[mentionIdx]) insertMention(mentionCandidates[mentionIdx])
    } else if (e.key === 'Escape') { setMentionQ(null) }
  }

  function insertMention(name) {
    const before = draft.slice(0, mentionQ.from)
    const after = draft.slice(mentionQ.to)
    const newVal = before + '@' + name + ' ' + after
    setDraft(newVal)
    setMentionQ(null)
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = (before + '@' + name + ' ').length
        textareaRef.current.setSelectionRange(pos, pos)
        textareaRef.current.focus()
      }
    }, 0)
  }

  function sendComment() {
    const text = draft.trim()
    if (!text) return
    const now = new Date()
    onAddComment({ who: ME_NAME, time: `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`, text })
    setDraft('')
    setMentionQ(null)
  }

  if (!task) return null

  return (
    <div className={`task-drawer open`}>
      <div className="drawer-head">
        <h3>{task.name}</h3>
        <button className="icon-btn" onClick={onClose} title="Đóng">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="drawer-body">
        <div className="drawer-field">
          <label>Giai đoạn</label>
          <div className="df-val">{phase?.name}</div>
        </div>
        {task.assignee && (
          <div className="drawer-field">
            <label>Phụ trách</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="comment-avatar" style={{ background: avatarColor(task.assignee), width: 24, height: 24, fontSize: 9 }}>
                {initials(task.assignee)}
              </div>
              <span className="df-val">{task.assignee}</span>
            </div>
          </div>
        )}
        {!task.milestone && !task.finType && (
          <>
            <div className="drawer-field">
              <label>Thời gian</label>
              <div className="df-val">{fmtFull(parseD(task.start))} – {fmtFull(parseD(task.end))}</div>
            </div>
            <div className="drawer-field drawer-progress">
              <label>Tiến độ: <strong>{task.progress}%</strong></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="range" min="0" max="100" step="5"
                  value={task.progress}
                  onChange={e => onProgressChange(task.id, +e.target.value)}
                  style={{ flex: 1, accentColor: 'var(--project)' }}
                />
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden', marginTop: 4 }}>
                <div style={{ height: '100%', width: task.progress + '%', background: task.progress >= 100 ? 'var(--success)' : 'var(--project)', borderRadius: 3, transition: 'width .2s' }} />
              </div>
            </div>
          </>
        )}
        {task.finType && (
          <div className="drawer-field">
            <label>Ngày thực hiện</label>
            <div className="df-val">{fmtFull(parseD(task.start))}</div>
          </div>
        )}
        {task.finType && task.amount && (
          <div className="drawer-field">
            <label>{task.finType === 'thu' ? 'Số tiền thu' : 'Số tiền chi'}</label>
            <div className="df-val" style={{ color: task.finType === 'thu' ? 'var(--success)' : 'var(--finance)', fontWeight: 700 }}>
              {task.finType === 'thu' ? '+' : '–'} {task.amount}
            </div>
          </div>
        )}

        <div className="drawer-field">
          <label>Bình luận</label>
          <div className="drawer-comments">
            {(comments || []).map((c, i) => (
              <div className="comment-item" key={i}>
                <div className="comment-avatar" style={{ background: avatarColor(c.who) }}>{initials(c.who)}</div>
                <div className="comment-bubble">
                  <span className="comment-who">{c.who}</span>
                  <span className="comment-time">{c.time}</span>
                  <div className="comment-text">{c.text}</div>
                </div>
              </div>
            ))}
            {(comments || []).length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chưa có bình luận</div>}
          </div>

          <div className="comment-input-wrap" style={{ marginTop: 10 }}>
            {mentionQ && mentionCandidates.length > 0 && (
              <div className="mention-dropdown">
                {mentionCandidates.map((m, i) => (
                  <div
                    key={m}
                    className={`mention-item ${i === mentionIdx ? 'highlighted' : ''}`}
                    onMouseDown={e => { e.preventDefault(); insertMention(m) }}
                  >
                    <div className="comment-avatar" style={{ background: avatarColor(m), width: 22, height: 22, fontSize: 9 }}>{initials(m)}</div>
                    {m}
                  </div>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              rows={2}
              placeholder="Nhập bình luận… gõ @ để nhắc người"
              value={draft}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button className="comment-send-btn" onClick={sendComment}>Gửi</button>
        </div>
      </div>
    </div>
  )
}
