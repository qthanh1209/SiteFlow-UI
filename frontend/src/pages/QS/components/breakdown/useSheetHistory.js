import { useCallback, useState } from 'react'

const LIMIT = 100

/* Dữ liệu bảng bóc tách kèm lịch sử hoàn tác.
   commit(label, fn, merge): fn nhận danh sách nhóm hiện tại, trả về danh sách mới (trả lại y nguyên = không đổi gì).
   merge = true: thao tác liền trước cùng nhãn thì gộp làm một bước hoàn tác (kéo chọn màu liên tục). */
export function useSheetHistory(initial) {
  const [h, setH] = useState({ past: [], present: initial, future: [] })

  const commit = useCallback((label, fn, merge = false) => setH(s => {
    const next = fn(s.present)
    if (next === s.present) return s
    if (merge && s.past.length && s.past[s.past.length - 1].label === label) return { ...s, present: next, future: [] }
    return { past: [...s.past, { label, groups: s.present }].slice(-LIMIT), present: next, future: [] }
  }), [])

  const undo = useCallback(() => setH(s => {
    if (!s.past.length) return s
    const last = s.past[s.past.length - 1]
    return { past: s.past.slice(0, -1), present: last.groups, future: [{ label: last.label, groups: s.present }, ...s.future] }
  }), [])

  const redo = useCallback(() => setH(s => {
    if (!s.future.length) return s
    const [first, ...rest] = s.future
    return { past: [...s.past, { label: first.label, groups: s.present }], present: first.groups, future: rest }
  }), [])

  /* Đổi dữ liệu mà không ghi lịch sử (thu gọn / mở nhóm) */
  const patch = useCallback(fn => setH(s => ({ ...s, present: fn(s.present) })), [])

  /* Quay về trạng thái ngay trước thao tác thứ i trong lịch sử */
  const jumpTo = useCallback(i => setH(s => {
    if (i < 0 || i >= s.past.length) return s
    const undone = s.past.slice(i)
    const future = undone.map((p, k) => ({ label: p.label, groups: k + 1 < undone.length ? undone[k + 1].groups : s.present }))
    return { past: s.past.slice(0, i), present: s.past[i].groups, future: [...future, ...s.future] }
  }), [])

  return {
    groups: h.present, commit, patch, undo, redo, jumpTo,
    canUndo: h.past.length > 0, canRedo: h.future.length > 0,
    labels: h.past.map(p => p.label),
  }
}
