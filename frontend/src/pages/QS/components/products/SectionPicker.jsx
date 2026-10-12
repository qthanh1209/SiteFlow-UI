import { useEffect, useRef, useState } from 'react'
import { PRODUCT_SECTIONS, ALL_SECTIONS, sectionLabel, inSection } from '../../../../data/qsProductsData'

const pad = n => String(n).padStart(2, '0')

/* Ô chọn hạng mục dạng cây đề mục (1 → 3.2.6.1). value: mã đề mục đang chọn hoặc ALL_SECTIONS;
   products: dùng để đếm số sản phẩm của từng đề mục (gồm cả các đề mục con) */
export default function SectionPicker({ value, onPick, products }) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const count = code => products.filter(p => inSection(p, code)).length

  /* Bấm ra ngoài hoặc nhấn Esc thì đóng */
  useEffect(() => {
    if (!open) return undefined
    const onDown = e => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  const item = (code, label, depth) => (
    <button
      key={code} className={`qs-pl-sec-item${code === value ? ' on' : ''}${depth < 2 ? ' top' : ''}`} style={{ paddingLeft: 10 + depth * 12 }}
      onClick={() => { onPick(code); setOpen(false) }}
    >
      <b>{label}</b><small>[{pad(count(code))}]</small><span className="qs-im-pick-radio" />
    </button>
  )

  return (
    <div className="qs-pl-sec" ref={boxRef}>
      <button className={`qs-pl-cat${open ? ' open' : ''}`} title="Lọc theo hạng mục" onClick={() => setOpen(o => !o)}>
        <b>{sectionLabel(value)}</b><span className="qs-pl-count">{count(value)}</span><span className={`qs-bd-caret${open ? ' up' : ''}`} />
      </button>
      {open && (
        <div className="qs-pl-sec-menu">
          {item(ALL_SECTIONS, 'Tất cả hạng mục', 0)}
          {PRODUCT_SECTIONS.map(s => item(s.code, `${s.code}.${s.name}`, s.code.split('.').length - 1))}
        </div>
      )}
    </div>
  )
}
