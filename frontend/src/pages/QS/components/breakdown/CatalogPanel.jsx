import { useMemo, useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon'
import PaintThumb from './PaintThumb'
import FilterPopover from './FilterPopover'
import FilterSections from './FilterSections'
import { CATALOG, CATALOG_TOTAL, FAVORITE_BASE, EMPTY_FILTERS, matchFilters, formatDong } from '../../../../data/qsBreakdownData'

const Caret = ({ up }) => <span className={`qs-bd-caret${up ? ' up' : ''}`} />

/* Cột trái: bộ lọc hạng mục + danh sách sản phẩm để thêm vào bảng bóc tách */
export default function CatalogPanel({ onAdd, onOpen, activeId, width, favorites, onToggleFav, dragId, onDragProduct, onDragEnd }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState({ category: false, devices: false })
  /* Bộ lọc nào đang hiện trên panel (bật trong hộp "Bộ lọc") và giá trị đang chọn của chúng */
  const [popOpen, setPopOpen] = useState(false)
  const [visible, setVisible] = useState({})
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [filterH, setFilterH] = useState(null)
  const [dragging, setDragging] = useState(false)
  const filtersRef = useRef(null)
  const dragRef = useRef(null)
  const scaleRef = useRef(1)

  const shown = useMemo(() => {
    const k = query.trim().toLowerCase()
    return CATALOG.filter(c => (
      (!k || c.name.toLowerCase().includes(k) || c.brand.toLowerCase().includes(k) || c.id.includes(k))
      && matchFilters(c, filters, favorites.has(c.id))
    ))
  }, [query, filters, favorites])

  const toggle = key => setOpen(o => ({ ...o, [key]: !o[key] }))
  /* Tắt một bộ lọc thì bỏ luôn giá trị đang chọn của nó để danh sách không bị lọc ngầm */
  const toggleFilter = key => {
    if (visible[key]) {
      setFilters(f => (key === 'price' ? { ...f, priceFrom: '', priceTo: '' } : { ...f, [key]: EMPTY_FILTERS[key] }))
    }
    setVisible(v => ({ ...v, [key]: !v[key] }))
  }

  /* Kéo thanh nắm để thu/mở khối bộ lọc phía trên danh sách. filterH: null = cao tự nhiên (tối đa nửa cột), 0 = gập hẳn.
     Toạ độ chuột tính theo màn hình còn chiều cao tính theo px bố cục (trang đang zoom) nên phải quy đổi qua scale. */
  function startDrag(e) {
    const el = filtersRef.current
    const h = el.offsetHeight
    if (h > 0) scaleRef.current = el.getBoundingClientRect().height / h || 1
    dragRef.current = { y: e.clientY, h }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
    setDragging(true)
  }
  function moveDrag(e) {
    const d = dragRef.current
    if (!d) return
    /* Đã nhả chuột mà không nhận được pointerup thì kết thúc kéo, tránh bị "dính" */
    if (e.buttons === 0) { endDrag(); return }
    const natural = filtersRef.current.scrollHeight
    const next = Math.round(d.h + (e.clientY - d.y) / scaleRef.current)
    setFilterH(Math.max(0, Math.min(natural, next)))
  }
  function endDrag() {
    dragRef.current = null
    setDragging(false)
  }

  const favoriteCount = FAVORITE_BASE + favorites.size
  return (
    <div className="qs-card qs-bd-catalog" style={{ width }}>
      <div className="qs-bd-catalog-head">
        <span className="qs-bd-h">Hạng mục</span>
        <span className="qs-bd-badge">{CATALOG_TOTAL} SP</span>
        <span style={{ flex: 1 }} />
        <button className={`qs-bd-pill-btn${popOpen ? ' on' : ''}`} onClick={() => setPopOpen(o => !o)}><Icon name="filter" size={14} />Bộ lọc<Caret up={popOpen} /></button>
        <span className="qs-bd-fav-count"><Icon name="heart" size={15} />{favoriteCount}</span>
      </div>
      {popOpen && (
        <FilterPopover
          visible={visible}
          onToggle={toggleFilter}
          onClear={() => setFilters(EMPTY_FILTERS)}
          onClose={() => setPopOpen(false)}
        />
      )}

      <div className="qs-bd-filters" ref={filtersRef} style={filterH === null ? undefined : { height: filterH, maxHeight: 'none' }}>
        <button className="qs-bd-accordion" onClick={() => toggle('category')}>
          Hạng mục sản phẩm<span className="qs-bd-acc-plus"><Icon name={open.category ? 'minus' : 'plus'} size={10} stroke={3} /></span>
        </button>
        {open.category && <div className="qs-bd-acc-body">3.2.2. Sơn nước</div>}
        <button className="qs-bd-accordion" onClick={() => toggle('devices')}>
          Thiết bị trong dự án<span className="qs-bd-acc-plus"><Icon name={open.devices ? 'minus' : 'plus'} size={10} stroke={3} /></span>
        </button>
        {open.devices && <div className="qs-bd-acc-body">Chưa có thiết bị nào được gắn với dự án.</div>}

        <FilterSections visible={visible} filters={filters} onChange={setFilters} favoriteCount={favoriteCount} />
        {/* Khi bộ lọc Kích thước đang bật thì dòng gợi ý đã nằm ngay sau nó */}
        {!visible.size && <p className="qs-bd-hint">Chọn 1 hạng mục để lọc theo thông số riêng của hạng mục đó.</p>}
      </div>
      <div
        className={`qs-bd-grip${dragging ? ' dragging' : ''}`}
        title="Kéo lên/xuống để thu gọn · bấm đúp để gập nhanh"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => setFilterH(h => (h === 0 ? null : 0))}
      ><span /></div>

      <div className="qs-bd-search">
        <Icon name="search" size={14} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Gõ tên, mã hoặc thương hiệu..." />
      </div>

      <div className="qs-bd-products">
        {shown.map(c => (
          <div
            key={c.id}
            className={`qs-bd-product${dragId === c.id ? ' dragging' : ''}${activeId === c.id ? ' active' : ''}`}
            onClick={() => onOpen(c)}
            draggable
            title="Bấm để xem thông tin · kéo thả vào bảng để bóc sản phẩm này"
            onDragStart={e => { e.dataTransfer.setData('text/plain', c.id); e.dataTransfer.effectAllowed = 'copy'; onDragProduct(c) }}
            onDragEnd={onDragEnd}
          >
            <span className="qs-bd-product-no">{c.no}</span>
            <div className="qs-bd-product-thumb"><PaintThumb tone={c.tone} /></div>
            <div className="qs-bd-product-main">
              <div className="qs-bd-product-name">{c.name}</div>
              <div className="qs-bd-product-price">{formatDong(c.price)}</div>
              <div className="qs-bd-chips">
                <span className="qs-bd-chip brand">{c.brand}</span>
                {c.combo > 0 && <span className="qs-bd-chip combo"><Icon name="layers" size={11} />Combo {c.combo}<Caret /></span>}
                <span className="qs-bd-chip variant"><Icon name="copy" size={11} />Biến thể {c.variants}<Caret /></span>
              </div>
            </div>
            <div className="qs-bd-product-actions">
              <button className={`qs-bd-heart${favorites.has(c.id) ? ' on' : ''}`} title="Yêu thích" onClick={e => { e.stopPropagation(); onToggleFav(c.id) }}><Icon name="heart" size={18} /></button>
              <button className="qs-bd-add" title="Thêm vào bảng bóc tách" onClick={e => { e.stopPropagation(); onAdd(c) }}><Icon name="plus" size={14} /></button>
            </div>
          </div>
        ))}
        {!shown.length && <div className="qs-dash-empty">Không tìm thấy sản phẩm phù hợp.</div>}
      </div>
    </div>
  )
}
