import { useEffect, useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon'

/* Ô chọn ngành hàng: bấm để mở danh sách. options: [{ key, label, count }] */
export default function IndustryPicker({ options, value, onPick }) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const current = options.find(o => o.key === value)

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
    <div className="qs-im-pick" ref={boxRef}>
      <button className={`qs-im-pick-btn${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <b>{current.label}</b><small>[{current.count}]</small>
      </button>
      {open && (
        <div className="qs-im-pick-menu">
          <div className="qs-im-pick-head">
            Chọn ngành hàng
            <button title="Đóng" onClick={() => setOpen(false)}><Icon name="x" size={16} /></button>
          </div>
          {options.map(o => (
            <button key={o.key} className={`qs-im-pick-item${o.key === value ? ' on' : ''}`} onClick={() => { onPick(o.key); setOpen(false) }}>
              <b>{o.label}</b><small>[{o.count}]</small><span className="qs-im-pick-radio" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
