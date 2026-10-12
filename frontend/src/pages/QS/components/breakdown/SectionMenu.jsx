import { useEffect, useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon'
import { ACTIVE_CATEGORY } from '../../../../data/qsBreakdownData'
import { PRODUCT_SECTIONS } from '../../../../data/qsProductsData'

const pad = n => String(n).padStart(2, '0')

/* Nút "hạng mục đang bóc" mở cây đề mục (1 → 3.2.8.2) để chọn, cuối danh sách có "Thêm hạng mục".
   count: số dòng đã bóc — thuộc đề mục gốc của bảng (ACTIVE_CATEGORY) nên chỉ đề mục đó và các đề mục cha có số */
export default function SectionMenu({ count }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(ACTIVE_CATEGORY.code)
  const [extra, setExtra] = useState([])
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
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

  const sections = [...PRODUCT_SECTIONS, ...extra]
  const current = sections.find(s => s.code === value)
  const countOf = code => (ACTIVE_CATEGORY.code === code || ACTIVE_CATEGORY.code.startsWith(`${code}.`) ? count : 0)

  /* Hạng mục mới là một đề mục cấp 1, đánh số tiếp theo */
  function addSection(e) {
    e.preventDefault()
    if (!name.trim()) return
    const code = String(Math.max(...sections.map(s => Number(s.code.split('.')[0]))) + 1)
    setExtra(list => [...list, { code, name: name.trim() }])
    setName('')
    setAdding(false)
  }

  return (
    <div className="qs-bd-sec" ref={boxRef}>
      <button className={`qs-bd-category${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <b>{current.code}.{current.name}</b>
        <span className="qs-bd-count">[{pad(countOf(value))}]</span>
        <span style={{ flex: 1 }} />
        <span className="qs-bd-acc-plus"><Icon name={open ? 'minus' : 'plus'} size={10} stroke={3} /></span>
      </button>
      {open && (
        <div className="qs-bd-sec-menu">
          <div className="qs-bd-sec-list">
            {sections.map(s => {
              const depth = s.code.split('.').length - 1
              return (
                <button
                  key={s.code} className={`qs-bd-sec-item${s.code === value ? ' on' : ''}${depth < 2 ? ' top' : ''}`} style={{ paddingLeft: 12 + depth * 12 }}
                  onClick={() => { setValue(s.code); setOpen(false) }}
                >
                  <span className="qs-im-pick-radio" /><b>{s.code}. {s.name}</b><small>[{pad(countOf(s.code))}]</small>
                </button>
              )
            })}
          </div>
          {adding ? (
            <form className="qs-bd-sec-add" onSubmit={addSection}>
              <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Tên hạng mục mới" onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); setAdding(false) } }} />
              <button type="submit">Thêm</button>
            </form>
          ) : (
            <button className="qs-bd-sec-new" onClick={() => setAdding(true)}>+ Thêm hạng mục</button>
          )}
        </div>
      )}
    </div>
  )
}
