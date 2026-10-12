import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon'
import { PRODUCT_SECTIONS, ALL_SECTIONS, sectionLabel } from '../../../../data/qsProductsData'

const pad = n => String(n).padStart(2, '0')

/* Nút "hạng mục đã bóc" của tab Chi phí, mở hộp "Chọn hạng mục": cây đề mục (1 → 5) kèm "Tất cả hạng mục" ở đầu.
   value: mã đề mục đang chọn hoặc ALL_SECTIONS; countOf(code): số dòng đã bóc thuộc đề mục đó */
export default function CategoryMenu({ value, onPick, countOf }) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const listRef = useRef(null)

  /* Bấm ra ngoài hoặc nhấn Esc thì đóng */
  useEffect(() => {
    if (!open) return undefined
    const onDown = e => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  /* Mở ra thì cuộn danh sách tới đề mục đang chọn */
  useLayoutEffect(() => {
    const list = listRef.current
    const on = open && list ? list.querySelector('.on') : null
    if (on) list.scrollTop = on.offsetTop - (list.clientHeight - on.offsetHeight) / 2
  }, [open])

  /* Số dòng chỉ hiện ở "Tất cả hạng mục" và các đề mục đã có dòng */
  const item = (code, label, depth) => {
    const n = countOf(code)
    return (
      <button
        key={code} className={`qs-bd-cp-item${code === value ? ' on' : ''}`} style={{ paddingLeft: 16 + depth * 16 }}
        onClick={() => { onPick(code); setOpen(false) }}
      >
        <b>{label}</b>
        {(code === ALL_SECTIONS || n > 0) && <small>[{pad(n)}]</small>}
        <span className="qs-im-pick-radio" />
      </button>
    )
  }

  return (
    <div className="qs-ct-cm" ref={boxRef}>
      <button className={`qs-bd-category${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <b>{sectionLabel(value)}</b>
        <span className="qs-bd-count">[{pad(countOf(value))}]</span>
        <span style={{ flex: 1 }} />
        <span className="qs-bd-acc-plus"><Icon name={open ? 'minus' : 'plus'} size={10} stroke={3} /></span>
      </button>
      {open && (
        <div className="qs-ct-cm-menu">
          <div className="qs-bd-cp-head">
            <b>Chọn hạng mục</b>
            <button title="Đóng" onClick={() => setOpen(false)}><Icon name="x" size={16} /></button>
          </div>
          <div className="qs-ct-cm-list" ref={listRef}>
            {item(ALL_SECTIONS, 'Tất cả hạng mục', 0)}
            {PRODUCT_SECTIONS.map(s => item(s.code, `${s.code}. ${s.name}`, s.code.split('.').length - 1))}
          </div>
        </div>
      )}
    </div>
  )
}
