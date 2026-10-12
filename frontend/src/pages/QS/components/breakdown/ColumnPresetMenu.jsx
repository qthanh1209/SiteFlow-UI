import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon'

/* Nút "<bộ cột> x/y" mở hộp "Chọn nhanh cột": chọn một bộ cột có sẵn, hoặc lưu các cột đang hiện làm mặc định.
   presets: [{ key, label, hidden: [key cột ẩn] }]; activeKey: bộ đang khớp với các cột đang hiện (null = tuỳ chỉnh);
   savedIsCurrent: các cột đang hiện đã đúng là bộ mặc định người dùng đã lưu */
export default function ColumnPresetMenu({ presets, activeKey, shown, total, onPick, onSaveDefault, savedIsCurrent }) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const menuRef = useRef(null)
  const [shift, setShift] = useState(0)

  /* Bấm ra ngoài hoặc nhấn Esc thì đóng */
  useEffect(() => {
    if (!open) return undefined
    const onDown = e => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  /* Hộp mở từ mép trái của nút; nút nằm sát mép phải màn hình thì dịch hộp sang trái cho vừa vùng nội dung.
     Toạ độ đo theo px màn hình, left tính theo px bố cục (trang đang zoom) nên quy đổi qua scale. */
  useLayoutEffect(() => {
    if (!open) return undefined
    const place = () => {
      const box = boxRef.current
      const menu = menuRef.current
      if (!box || !menu) return
      const rect = menu.getBoundingClientRect()
      const scale = rect.width / menu.offsetWidth || 1
      const start = box.getBoundingClientRect().left
      const area = box.closest('.qs-scroll')
      const lim = area ? area.getBoundingClientRect() : { left: 0, right: window.innerWidth }
      const x = Math.max(lim.left + 8, Math.min(start, lim.right - 8 - rect.width))
      setShift(Math.round((x - start) / scale))
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open])

  const active = presets.find(p => p.key === activeKey)

  return (
    <div className="qs-bd-cp" ref={boxRef}>
      <button className={`qs-bd-preset${open ? ' open' : ''}`} title="Chọn nhanh bộ cột hiển thị" onClick={() => setOpen(o => !o)}>
        <Icon name="sliders" size={13} />{active ? active.label : 'Tuỳ chỉnh'} {shown}/{total}<span className={`qs-bd-caret${open ? ' up' : ''}`} />
      </button>
      {open && (
        <div className="qs-bd-cp-menu" ref={menuRef} style={{ left: shift }}>
          <div className="qs-bd-cp-head">
            <b>Chọn nhanh cột</b>
            <button title="Đóng" onClick={() => setOpen(false)}><Icon name="x" size={16} /></button>
          </div>
          <div className="qs-bd-cp-list">
            {presets.map(p => (
              <button key={p.key} className={`qs-bd-cp-item${p.key === activeKey ? ' on' : ''}`} onClick={() => onPick(p.hidden)}>
                <b>{p.label}</b>
                <small>{total - p.hidden.length} cột</small>
                <span className="qs-im-pick-radio" />
              </button>
            ))}
          </div>
          <div className="qs-bd-cp-foot">
            <button className="qs-bd-cp-save" disabled={savedIsCurrent} onClick={onSaveDefault}>
              <Icon name="check" size={15} stroke={2.4} />
              {savedIsCurrent ? `${shown} cột đang hiện là mặc định của bạn` : `Lưu ${shown} cột đang hiện làm mặc định của tôi`}
            </button>
            <p>Lưu trên trình duyệt này — lần sau mở Bóc tách sẽ tự hiện đúng các cột này (mục "Mặc định").</p>
          </div>
        </div>
      )}
    </div>
  )
}
