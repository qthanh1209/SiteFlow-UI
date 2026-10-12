import { useEffect, useRef, useState } from 'react'

/* Ô vừa gõ vừa chọn: gõ tự do, bấm ▾ để chọn giá trị có sẵn, bấm + để thêm giá trị đang gõ vào danh sách */
export default function ComboField({ value, onChange, options, onAdd, placeholder, invalid }) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const inputRef = useRef(null)

  /* Bấm ra ngoài hoặc nhấn Esc thì đóng */
  useEffect(() => {
    if (!open) return undefined
    const onDown = e => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  /* Đang gõ dở thì lọc theo chữ đã gõ; giá trị trùng hẳn một lựa chọn thì hiện cả danh sách */
  const k = value.trim().toLowerCase()
  const shown = !k || options.some(o => o.toLowerCase() === k) ? options : options.filter(o => o.toLowerCase().includes(k))
  const canAdd = value.trim() && !options.includes(value.trim())

  return (
    <div className={`qs-im-cb${invalid ? ' invalid' : ''}`} ref={boxRef}>
      <input ref={inputRef} value={value} placeholder={placeholder} onFocus={() => setOpen(true)} onChange={e => { onChange(e.target.value); setOpen(true) }} />
      <button type="button" className="qs-im-cb-caret" tabIndex={-1} title="Chọn từ danh sách" onClick={() => setOpen(o => !o)}>▾</button>
      <button
        type="button" className="qs-im-cb-add" title={canAdd ? `Thêm "${value.trim()}" vào danh sách` : 'Gõ giá trị mới rồi bấm + để thêm vào danh sách'}
        onClick={() => { if (canAdd) onAdd(value.trim()); else inputRef.current.focus() }}
      >+</button>
      {open && shown.length > 0 && (
        <div className="qs-im-cb-menu">
          {shown.map(o => (
            <button key={o} type="button" className={o === value ? 'on' : ''} onClick={() => { onChange(o); setOpen(false) }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  )
}
