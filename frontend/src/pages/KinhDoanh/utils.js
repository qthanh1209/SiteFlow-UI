export const buttonStyle = { border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', background: 'var(--surface)', color: 'var(--text)', font: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }
export const primaryButton = { ...buttonStyle, color: '#fff', border: 0, background: 'var(--sales)' }
export const selectStyle = { ...buttonStyle, cursor: 'pointer' }
export const timeOptions = [['all', 'Tất cả thời gian'], ['today', 'Hôm nay'], ['week', 'Tuần này'], ['month', 'Tháng này'], ['quarter', 'Quý này'], ['year', 'Năm nay'], ['custom', 'Tự chọn khoảng ngày...']]
export const timeLabel = Object.fromEntries(timeOptions)

export function formatValue(value) { return `${Number(value || 0).toFixed(1).replace(/\.0$/, '')} tỷ` }
export function initials(name = '') { return name.trim().split(/\s+/).slice(-2).map(part => part[0]).join('').toUpperCase() }
export function stageAccent(stage) {
  if (stage === 'truot-thau') return { border: 'var(--danger)', bg: 'var(--danger-tint)', color: 'var(--danger)' }
  if (stage === 'dam-phan') return { border: 'var(--gold)', bg: 'var(--gold-tint)', color: 'var(--gold)' }
  if (stage === 'thiet-ke') return { border: 'var(--primary)', bg: 'var(--primary-tint)', color: 'var(--primary)' }
  if (['thi-cong', 'tu-van'].includes(stage)) return { border: 'var(--success)', bg: 'var(--success-tint)', color: 'var(--success)' }
  return null
}
export function matchesDate(lead, filter, from, to) {
  if (filter === 'all') return true
  if (!lead.createdAt) return false
  const date = new Date(`${lead.createdAt}T00:00:00`)
  const now = new Date()
  if (filter === 'today') return date.toDateString() === now.toDateString()
  if (filter === 'week') {
    const start = new Date(now)
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
    start.setHours(0, 0, 0, 0)
    const end = new Date(start); end.setDate(end.getDate() + 7)
    return date >= start && date < end
  }
  if (filter === 'month') return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  if (filter === 'quarter') return date.getFullYear() === now.getFullYear() && Math.floor(date.getMonth() / 3) === Math.floor(now.getMonth() / 3)
  if (filter === 'year') return date.getFullYear() === now.getFullYear()
  return (!from || lead.createdAt >= from) && (!to || lead.createdAt <= to)
}
