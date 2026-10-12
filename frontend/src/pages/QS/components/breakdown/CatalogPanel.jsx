import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon'
import PaintThumb from './PaintThumb'
import FilterPopover from './FilterPopover'
import FilterSections from './FilterSections'
import { DASH_PROJECTS } from '../../../../data/qsDashboardData'
import { CATALOG, CATALOG_TOTAL, FAVORITE_BASE, EMPTY_FILTERS, PRODUCT_CATEGORIES, matchFilters, formatDong } from '../../../../data/qsBreakdownData'

const Caret = ({ up }) => <span className={`qs-bd-caret${up ? ' up' : ''}`} />

/* Cột trái: bộ lọc hạng mục + danh sách sản phẩm để thêm vào bảng bóc tách */
export default function CatalogPanel({ onAdd, onOpen, activeId, width, favorites, onToggleFav, dragId, onDragProduct, onDragEnd }) {
  const [query, setQuery] = useState('')
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

  /* ---------- Hai danh sách thả xuống: "Hạng mục sản phẩm" (tick nhiều hạng mục) và "Thiết bị trong dự án" (chọn một dự án) ----------
     menu: danh sách đang mở ('category' | 'project' | null). Danh sách nổi phía trên danh sách sản phẩm nên đặt ngoài
     khối bộ lọc (khối đó cắt phần tràn); vị trí tính theo nút, quy đổi qua scale vì trang đang zoom */
  const [menu, setMenu] = useState(null)
  const [menuTop, setMenuTop] = useState(0)
  const [menuQuery, setMenuQuery] = useState('')
  const [project, setProject] = useState(null)
  const catalogRef = useRef(null)
  const menuRef = useRef(null)
  const btnRefs = useRef({})
  function toggleMenu(key) {
    if (menu === key) { setMenu(null); return }
    const card = catalogRef.current
    const rect = card.getBoundingClientRect()
    const scale = rect.height / card.offsetHeight || 1
    setMenuTop(Math.round((btnRefs.current[key].getBoundingClientRect().bottom - rect.top) / scale) + 6)
    setMenuQuery('')
    setMenu(key)
  }
  /* Bấm ra ngoài hoặc nhấn Esc thì đóng */
  useEffect(() => {
    if (!menu) return undefined
    const onDown = e => { if (!menuRef.current.contains(e.target) && !Object.values(btnRefs.current).some(b => b && b.contains(e.target))) setMenu(null) }
    const onKey = e => { if (e.key === 'Escape') setMenu(null) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [menu])
  const menuKey = menuQuery.trim().toLowerCase()
  const projectList = DASH_PROJECTS.filter(p => !menuKey || p.name.toLowerCase().includes(menuKey))
  const categoryList = PRODUCT_CATEGORIES.filter(([label]) => !menuKey || label.toLowerCase().includes(menuKey))
  const pickProject = p => { setProject(p); setMenu(null) }
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

  /* Danh sách tick "Hạng mục sản phẩm" — lọc danh sách sản phẩm theo các hạng mục đang chọn */
  const setCats = cat => setFilters(f => ({ ...f, cat }))
  const allCats = PRODUCT_CATEGORIES.every(([label]) => filters.cat.includes(label))

  /* Sản phẩm đang mở danh sách combo / biến thể: key `${id}:combo` hoặc `${id}:variant` */
  const [expanded, setExpanded] = useState(() => new Set())
  const toggleOpen = key => setExpanded(s => {
    const next = new Set(s)
    if (next.has(key)) next.delete(key); else next.add(key)
    return next
  })
  /* Dòng chính và dòng con đều bấm để xem thông tin, kéo thả vào bảng để bóc */
  const dragProps = product => ({
    draggable: true,
    title: 'Bấm để xem thông tin · kéo thả vào bảng để bóc sản phẩm này',
    onDragStart: e => { e.dataTransfer.setData('text/plain', product.id); e.dataTransfer.effectAllowed = 'copy'; onDragProduct(product) },
    onDragEnd,
  })
  /* Dòng con dưới một sản phẩm. kind: 'combo' (sản phẩm đi kèm, qty = số lượng kèm) | 'variant' (biến thể, tên = thông số) */
  const subRow = (item, no, kind, qty) => (
    <div
      key={item.id}
      className={`qs-bd-sub${dragId === item.id ? ' dragging' : ''}${activeId === item.id ? ' active' : ''}`}
      onClick={() => onOpen(item)}
      {...dragProps(item)}
    >
      <span className="qs-bd-sub-no">{no}</span>
      <div className="qs-bd-sub-thumb"><PaintThumb tone={item.tone} size={28} /></div>
      <div className="qs-bd-sub-main">
        <div className="qs-bd-sub-name">
          <i />{kind === 'variant' ? item.specs.join(' · ') : item.name}
          {qty > 1 && <span className="qs-bd-sub-qty">×{qty}</span>}
        </div>
        <div className="qs-bd-sub-meta">
          <small>{kind === 'combo' ? [item.brand, ...item.specs].join(' · ') : item.brand}</small>
          <b>{formatDong(item.price)}</b>
        </div>
      </div>
      <button className="qs-bd-add sm" title="Thêm vào bảng bóc tách" onClick={e => { e.stopPropagation(); onAdd(item) }}><Icon name="plus" size={12} /></button>
    </div>
  )

  const favoriteCount = FAVORITE_BASE + favorites.size
  return (
    <div className="qs-card qs-bd-catalog" style={{ width }} ref={catalogRef}>
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
        <button className={`qs-bd-accordion${menu === 'category' ? ' open' : ''}`} ref={el => { btnRefs.current.category = el }} onClick={() => toggleMenu('category')}>
          <span className="qs-bd-acc-text">{filters.cat.length && !allCats ? `Hạng mục sản phẩm · ${filters.cat.length} đã chọn` : 'Hạng mục sản phẩm'}</span>
          <span className="qs-bd-acc-plus"><Icon name={menu === 'category' ? 'minus' : 'plus'} size={10} stroke={3} /></span>
        </button>
        <button className={`qs-bd-accordion${menu === 'project' ? ' open' : ''}`} ref={el => { btnRefs.current.project = el }} onClick={() => toggleMenu('project')}>
          <span className="qs-bd-acc-text">{project ? project.name : 'Thiết bị trong dự án'}</span>
          <span className="qs-bd-acc-plus"><Icon name={menu === 'project' ? 'minus' : 'plus'} size={10} stroke={3} /></span>
        </button>

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

      {menu === 'category' && (
        <div className="qs-bd-proj" ref={menuRef} style={{ top: menuTop }}>
          <div className="qs-bd-proj-title">Hạng mục sản phẩm</div>
          <input autoFocus value={menuQuery} onChange={e => setMenuQuery(e.target.value)} placeholder="Tìm hạng mục..." />
          <div className="qs-bd-proj-list checks">
            {!menuKey && (
              <label className="all">
                <input type="checkbox" checked={allCats} onChange={() => setCats(allCats ? [] : PRODUCT_CATEGORIES.map(([label]) => label))} />
                Chọn tất cả
              </label>
            )}
            {categoryList.map(([label, count]) => (
              <label key={label} className={filters.cat.includes(label) ? 'on' : ''}>
                <input type="checkbox" checked={filters.cat.includes(label)} onChange={() => setCats(filters.cat.includes(label) ? filters.cat.filter(v => v !== label) : [...filters.cat, label])} />
                {label}<small>({count})</small>
              </label>
            ))}
            {!categoryList.length && <span>Không tìm thấy hạng mục.</span>}
          </div>
        </div>
      )}
      {menu === 'project' && (
        <div className="qs-bd-proj" ref={menuRef} style={{ top: menuTop }}>
          <div className="qs-bd-proj-title">Thiết bị trong dự án</div>
          <input autoFocus value={menuQuery} onChange={e => setMenuQuery(e.target.value)} placeholder="Tìm dự án..." />
          <div className="qs-bd-proj-list">
            {!menuKey && <button className={project ? '' : 'on'} onClick={() => pickProject(null)}>Tất cả sản phẩm</button>}
            {projectList.map(p => (
              <button key={p.id} className={project && project.id === p.id ? 'on' : ''} onClick={() => pickProject(p)}>{p.name}</button>
            ))}
            {!projectList.length && <span>Không tìm thấy dự án.</span>}
          </div>
        </div>
      )}

      <div className="qs-bd-search">
        <Icon name="search" size={14} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Gõ tên, mã hoặc thương hiệu..." />
      </div>

      <div className="qs-bd-products">
        {shown.map(c => {
          const combo = c.combo.map(x => ({ product: CATALOG.find(p => p.id === x.id), qty: x.qty })).filter(x => x.product)
          const comboOpen = combo.length > 0 && expanded.has(`${c.id}:combo`)
          const variantOpen = c.variants.length > 1 && expanded.has(`${c.id}:variant`)
          /* Thông số khác nhau giữa các biến thể thì tô màu để thấy ngay biến thể khác ở điểm nào */
          const varies = j => c.variants.some(v => v.specs[j] !== c.specs[j])
          return (
            <Fragment key={c.id}>
              <div
                className={`qs-bd-product${dragId === c.id ? ' dragging' : ''}${activeId === c.id ? ' active' : ''}${comboOpen ? ' open-combo' : ''}${variantOpen ? ' open-variant' : ''}`}
                onClick={() => onOpen(c)}
                {...dragProps(c)}
              >
                <span className="qs-bd-product-no">{c.no}</span>
                <div className="qs-bd-product-thumb"><PaintThumb tone={c.tone} /></div>
                <div className="qs-bd-product-main">
                  <div className="qs-bd-product-name">{c.name}</div>
                  <div className="qs-bd-product-price">{formatDong(c.price)}</div>
                  <div className="qs-bd-chips">
                    <span className="qs-bd-chip brand">{c.brand}</span>
                    {combo.length > 0 && (
                      <button className={`qs-bd-chip combo${comboOpen ? ' open' : ''}`} title={comboOpen ? 'Ẩn sản phẩm đi kèm' : 'Xem sản phẩm đi kèm'} onClick={e => { e.stopPropagation(); toggleOpen(`${c.id}:combo`) }}>
                        <Icon name="layers" size={11} />Combo {combo.length}<Caret up={comboOpen} />
                      </button>
                    )}
                    {c.variants.length > 1 && (
                      <button className={`qs-bd-chip variant${variantOpen ? ' open' : ''}`} title={variantOpen ? 'Ẩn các biến thể' : 'Xem các biến thể'} onClick={e => { e.stopPropagation(); toggleOpen(`${c.id}:variant`) }}>
                        <Icon name="copy" size={11} />Biến thể {c.variants.length}<Caret up={variantOpen} />
                      </button>
                    )}
                  </div>
                  {variantOpen && (
                    <div className="qs-bd-specs">
                      {c.specs.map((s, j) => <span key={s} className={varies(j) ? 'diff' : ''}>{s}</span>)}
                    </div>
                  )}
                </div>
                <div className="qs-bd-product-actions">
                  <button className={`qs-bd-heart${favorites.has(c.id) ? ' on' : ''}`} title="Yêu thích" onClick={e => { e.stopPropagation(); onToggleFav(c.id) }}><Icon name="heart" size={18} /></button>
                  <button className="qs-bd-add" title="Thêm vào bảng bóc tách" onClick={e => { e.stopPropagation(); onAdd(c) }}><Icon name="plus" size={14} /></button>
                </div>
              </div>
              {comboOpen && (
                <div className="qs-bd-subs combo">
                  {combo.map((x, k) => subRow(x.product, `${c.no}.${k + 1}`, 'combo', x.qty))}
                  <div className="qs-bd-sub-total">
                    Tổng combo · {combo.reduce((s, x) => s + x.qty, 0)} sản phẩm đi kèm
                    <b>{formatDong(combo.reduce((s, x) => s + x.qty * x.product.price, 0))}</b>
                  </div>
                </div>
              )}
              {variantOpen && (
                <div className="qs-bd-subs variant">
                  {c.variants.slice(1).map((v, k) => subRow(v, `${c.no}.${k + 2}`, 'variant'))}
                </div>
              )}
            </Fragment>
          )
        })}
        {!shown.length && <div className="qs-dash-empty">Không tìm thấy sản phẩm phù hợp.</div>}
      </div>
    </div>
  )
}
