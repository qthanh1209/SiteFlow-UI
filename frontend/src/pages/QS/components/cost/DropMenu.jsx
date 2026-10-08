import { useEffect, useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon'

/* Nút mở danh sách chọn một giá trị. options: [{ key, label, note? }]; value: key đang chọn (null = không khớp mục nào).
   children: nội dung nút; align: mép của danh sách bám theo nút ('left' | 'right') */
export default function DropMenu({ options, value, onPick, title, className = '', align = 'left', children }) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  /* Bấm ra ngoài hoặc nhấn Esc thì đóng */
  useEffect(() => {
    if (!open) return undefined
    const onDown = e => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div className="qs-ct-drop" ref={boxRef}>
      <button className={`${className}${open ? ' open' : ''}`} title={title} onClick={() => setOpen(o => !o)}>
        {children}<span className={`qs-bd-caret${open ? ' up' : ''}`} />
      </button>
      {open && (
        <div className={`qs-ct-drop-menu ${align}`}>
          {options.map(o => (
            <button key={o.key} className={o.key === value ? 'on' : ''} onClick={() => { onPick(o.key); setOpen(false) }}>
              <span><b>{o.label}</b>{o.note && <small>{o.note}</small>}</span>
              {o.key === value && <Icon name="check" size={14} stroke={2.4} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
