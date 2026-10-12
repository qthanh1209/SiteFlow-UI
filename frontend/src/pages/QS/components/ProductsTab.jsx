import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../../../components/ui/Icon'
import SectionPicker from './products/SectionPicker'
import ProjectPanel from './products/ProjectPanel'
import ProductThumb from './products/ProductThumb'
import ProductDetail from './products/ProductDetail'
import { DASH_PROJECTS } from '../../../data/qsDashboardData'
import {
  DEFAULT_SECTION, ALL_SECTIONS, PRODUCT_COLUMNS, FIXED_COLUMN_COUNT, DEFAULT_COLUMNS, BASIC_COLUMNS, APPROVAL, INITIAL_PRODUCTS,
  columnAlign, productText, formatPrice, skuCount, cloneProduct, productsCsv, sectionName, inSection,
} from '../../../data/qsProductsData'

const TABS = [
  { key: 'all', label: 'Tất cả', match: () => true },
  { key: 'pending', label: APPROVAL.pending, match: p => p.approval === 'pending' },
  { key: 'approved', label: APPROVAL.approved, match: p => p.approval === 'approved' },
  { key: 'fav', label: '♥ Yêu thích', match: p => p.fav },
]
const PAGE_SIZES = [10, 20, 50]
const sameSet = (set, keys) => set.size === keys.length && keys.every(k => set.has(k))

/* Ô sửa trực tiếp trong bảng (chế độ Edit): chỉ ghi nhận khi rời ô và giá trị có đổi */
function EditCell({ value, numeric, onCommit }) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])
  return (
    <input
      className="qs-pl-edit" value={text} inputMode={numeric ? 'numeric' : undefined}
      onChange={e => setText(numeric ? e.target.value.replace(/\D/g, '') : e.target.value)}
      onBlur={() => { if (text !== String(value) && text.trim()) onCommit(numeric ? Number(text) : text.trim()); else setText(String(value)) }}
      onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
    />
  )
}

/* Màn "Danh sách sản phẩm": bảng sản phẩm của ngành hàng (lọc, chọn cột, duyệt, sửa, nhân bản, xoá, hoàn tác)
   và cột trái gom sản phẩm vào dự án */
export default function ProductsTab({ onGoto }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [history, setHistory] = useState([])
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [section, setSection] = useState(DEFAULT_SECTION)
  const [filterOpen, setFilterOpen] = useState(false)
  const [brands, setBrands] = useState([])
  const [price, setPrice] = useState({ from: '', to: '' })
  const [shown, setShown] = useState(() => new Set(DEFAULT_COLUMNS))
  const [colsOpen, setColsOpen] = useState(true)
  const [selected, setSelected] = useState(() => new Set())
  const [expanded, setExpanded] = useState(() => new Set())
  const [editing, setEditing] = useState(false)
  const [detail, setDetail] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [panelOpen, setPanelOpen] = useState(true)
  const [projectId, setProjectId] = useState(DASH_PROJECTS[0].id)
  const [projectItems, setProjectItems] = useState({})
  const [dragId, setDragId] = useState(null)
  const filterRef = useRef(null)

  /* Bấm ra ngoài hộp Bộ lọc thì đóng */
  useEffect(() => {
    if (!filterOpen) return undefined
    const onDown = e => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [filterOpen])

  /* ---------- Lọc ---------- */
  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products])
  /* Lọc theo đề mục, tìm kiếm và hộp Bộ lọc — chưa tính tab trạng thái, để đếm số cho từng tab */
  const scoped = useMemo(() => {
    const k = query.trim().toLowerCase()
    return products.filter(p => (
      inSection(p, section)
      && (!k || p.name.toLowerCase().includes(k) || p.code.toLowerCase().includes(k) || p.brand.toLowerCase().includes(k))
      && (!brands.length || brands.includes(p.brand))
      && (price.from === '' || p.dealer >= Number(price.from))
      && (price.to === '' || p.dealer <= Number(price.to))
    ))
  }, [products, query, section, brands, price])
  const rows = scoped.filter(TABS.find(t => t.key === tab).match)
  const filterCount = brands.length + (price.from !== '' || price.to !== '' ? 1 : 0)

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, pageCount)
  const pageRows = rows.slice((current - 1) * pageSize, current * pageSize)
  const columns = PRODUCT_COLUMNS.filter(c => shown.has(c.key))
  const allSelected = pageRows.length > 0 && pageRows.every(p => selected.has(p.id))

  /* ---------- Thay đổi dữ liệu (đều hoàn tác được) ---------- */
  function commit(next) {
    setHistory(h => [...h.slice(-19), products])
    setProducts(next)
  }
  function undo() {
    if (!history.length) return
    setProducts(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
  }
  const patch = (id, change) => commit(products.map(p => (p.id === id ? { ...p, ...change } : p)))
  const remove = ids => {
    commit(products.filter(p => !ids.includes(p.id)))
    setSelected(s => new Set([...s].filter(id => !ids.includes(id))))
  }
  const duplicate = p => commit(products.flatMap(x => (x.id === p.id ? [x, cloneProduct(p)] : [x])))
  const approveSelected = () => {
    commit(products.map(p => (selected.has(p.id) ? { ...p, approval: 'approved' } : p)))
    setSelected(new Set())
  }

  const toggleIn = (setter, key) => setter(s => { const next = new Set(s); if (next.has(key)) next.delete(key); else next.add(key); return next })
  function toggleAll() {
    setSelected(s => {
      const next = new Set(s)
      pageRows.forEach(p => { if (allSelected) next.delete(p.id); else next.add(p.id) })
      return next
    })
  }

  /* ---------- Dự án ---------- */
  /* projectItems: { [id dự án]: [{ id sản phẩm, qty }] } */
  const projectEntries = projectItems[projectId] || []
  const projectIds = projectEntries.map(e => e.id)
  const inProject = projectEntries.map(e => ({ ...products.find(p => p.id === e.id), qty: e.qty })).filter(p => p.id)
  /* Thêm vào dự án đang chọn; đã có sẵn thì cộng thêm số lượng */
  const addToProject = (id, qty = 1) => {
    if (!id || !products.some(p => p.id === id)) return
    setProjectItems(all => {
      const list = all[projectId] || []
      const next = list.some(e => e.id === id) ? list.map(e => (e.id === id ? { ...e, qty: e.qty + qty } : e)) : [...list, { id, qty }]
      return { ...all, [projectId]: next }
    })
    setPanelOpen(true)
  }
  const removeFromProject = id => setProjectItems(all => ({ ...all, [projectId]: projectEntries.filter(e => e.id !== id) }))

  function download() {
    const url = URL.createObjectURL(new Blob([productsCsv(rows, columns)], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'danh-sach-san-pham.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  /* editable: chỉ dòng chính mới sửa trực tiếp được ở chế độ Edit */
  function renderCell(p, c, editable) {
    if (c.key === 'image') return <ProductThumb tone={p.tone} />
    if (c.key === 'approval') return <span className={`qs-pl-status ${p.approval}`}>{APPROVAL[p.approval]}</span>
    if (c.key === 'sku') return <span className={`qs-pl-sku${skuCount(p) > 1 ? ' many' : ''}`}>{skuCount(p)}</span>
    if (editing && editable && c.key === 'brand') return <EditCell value={p.brand} onCommit={v => patch(p.id, { brand: v })} />
    if (editing && editable && c.key === 'dealer') return <EditCell value={p.dealer} numeric onCommit={v => patch(p.id, { dealer: v })} />
    return productText(p, c.key) || <span className="qs-pl-none">—</span>
  }

  /* Sản phẩm đi kèm còn tồn tại của một sản phẩm: [{ product, qty }] */
  const comboOf = p => p.combo.map(c => ({ product: products.find(x => x.id === c.id), qty: c.qty })).filter(c => c.product)
  const setVariant = (parent, index, change) => patch(parent.id, { variants: parent.variants.map((v, i) => (i === index ? { ...v, ...change } : v)) })

  /* Thao tác của một dòng. Dòng chính và dòng combo tác động lên chính sản phẩm đó (dòng combo: xoá = bỏ khỏi combo,
     nhân bản = tăng số lượng); dòng biến thể tác động lên biến thể thứ index của sản phẩm cha */
  function rowActions(p, { kind, parent, index }) {
    if (kind === 'variant') {
      return {
        fav: () => setVariant(parent, index, { fav: !p.fav }),
        approve: () => setVariant(parent, index, { approval: p.approval === 'approved' ? 'pending' : 'approved' }),
        add: () => addToProject(parent.id),
        copy: () => patch(parent.id, { variants: parent.variants.flatMap((v, i) => (i === index ? [v, { ...v, fav: false }] : [v])) }),
        del: () => patch(parent.id, { variants: parent.variants.filter((_, i) => i !== index) }),
        inProject: projectIds.includes(parent.id),
      }
    }
    const own = {
      fav: () => patch(p.id, { fav: !p.fav }),
      approve: () => patch(p.id, { approval: p.approval === 'approved' ? 'pending' : 'approved' }),
      add: () => addToProject(p.id),
      copy: () => duplicate(p),
      del: () => remove([p.id]),
      inProject: projectIds.includes(p.id),
    }
    if (kind !== 'combo') return own
    return {
      ...own,
      copy: () => patch(parent.id, { combo: parent.combo.map(c => (c.id === p.id ? { ...c, qty: c.qty + 1 } : c)) }),
      del: () => patch(parent.id, { combo: parent.combo.filter(c => c.id !== p.id) }),
    }
  }

  /* Một dòng của bảng. kind: 'main' | 'combo' (sản phẩm đi kèm của parent) | 'variant' (biến thể của parent) */
  function renderRow(p, opts) {
    const { no, kind, parent, qty, label, chips } = opts
    const openDetail = () => setDetail(kind === 'variant' ? { id: parent.id, index: opts.index } : { id: p.id })
    const main = kind === 'main'
    const act = rowActions(p, opts)
    const approved = p.approval === 'approved'
    return (
      <tr
        key={`${kind}-${parent ? parent.id : ''}-${p.id}-${no}`}
        className={`${main ? '' : `sub ${kind}`}${main && selected.has(p.id) ? ' selected' : ''}${main && dragId === p.id ? ' dragging' : ''}`}
        draggable={main && !editing}
        onDragStart={main ? e => { e.dataTransfer.setData('text/plain', p.id); e.dataTransfer.effectAllowed = 'copy'; setDragId(p.id) } : undefined}
        onDragEnd={main ? () => setDragId(null) : undefined}
      >
        <td className="check">{kind !== 'variant' && <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleIn(setSelected, p.id)} />}</td>
        <td className="c">{no}</td>
        {shown.has('image') && <td className="c open" onClick={openDetail}><ProductThumb tone={p.tone} /></td>}
        <td className="name">
          {main && editing ? <EditCell value={p.name} onCommit={v => patch(p.id, { name: v })} /> : <b className="open" title="Xem thông tin sản phẩm" onClick={openDetail}>{p.name}</b>}
          <small>{p.code}{label ? ` · ${label}` : ''}</small>
          {kind === 'combo' && <span className="qs-pl-qty">×{qty}</span>}
          {chips}
        </td>
        {columns.filter(c => c.key !== 'image').map(c => <td key={c.key} className={columnAlign(c.key)}>{renderCell(p, c, main)}</td>)}
        <td className="actions">
          <button className={p.fav ? 'fav' : ''} title="Yêu thích" onClick={act.fav}><Icon name="heart" size={16} /></button>
          <button className={`add${act.inProject ? ' on' : ''}`} title="Thêm vào dự án đang chọn" onClick={act.add}><Icon name="plus" size={11} stroke={3} /></button>
          <button className={approved ? 'ok' : ''} title={approved ? 'Bỏ duyệt' : 'Duyệt'} onClick={act.approve}><Icon name="check" size={16} /></button>
          <button className="edit" title="Sửa trong bảng" onClick={() => setEditing(true)}><Icon name="edit" size={15} /></button>
          <button title={kind === 'combo' ? 'Tăng số lượng đi kèm' : 'Nhân bản'} onClick={act.copy}><Icon name="copy" size={15} /></button>
          <button title="Xem chi tiết" onClick={openDetail}><Icon name="eye" size={16} /></button>
          <button className="del" title={kind === 'combo' ? 'Bỏ khỏi combo' : kind === 'variant' ? 'Xoá biến thể' : 'Xoá'} onClick={act.del}><Icon name="trash" size={15} /></button>
        </td>
      </tr>
    )
  }

  /* Sản phẩm đang mở trong hộp Thông tin sản phẩm — detail: { id, index? (biến thể thứ mấy của sản phẩm) } */
  const detailBase = detail ? products.find(p => p.id === detail.id) : null
  const detailVariant = detailBase && detail.index ? detailBase.variants[detail.index] : null
  const detailProduct = detailVariant ? { ...detailBase, ...detailVariant, approval: detailVariant.approval || detailBase.approval } : detailBase

  const first = rows.length ? (current - 1) * pageSize + 1 : 0

  return (
    <>
      {panelOpen ? (
        <ProjectPanel
          projectId={projectId} onProject={setProjectId} items={inProject} dragging={dragId !== null}
          onDropProduct={id => addToProject(id)} onRemove={removeFromProject} onCollapse={() => setPanelOpen(false)}
        />
      ) : (
        <button className="qs-card qs-pl-side-mini" title="Mở Sản phẩm trong dự án" onClick={() => setPanelOpen(true)}>
          <Icon name="layers" size={18} className="qs-dash-accent" /><span className="qs-pl-count">{inProject.length}</span>
        </button>
      )}

      <div className="qs-card qs-pl-main">
        <div className="qs-pl-toolbar">
          <label className="qs-pl-search">
            <Icon name="search" size={16} />
            <input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="Tìm theo tên, mã hoặc thương hiệu..." />
          </label>
          {TABS.map(t => (
            <button key={t.key} className={`qs-pl-tab${tab === t.key ? ' on' : ''}`} onClick={() => { setTab(t.key); setPage(1) }}>
              {t.key === 'all' && section !== ALL_SECTIONS ? `Tất cả · ${sectionName(section)}` : t.label}<span>{scoped.filter(t.match).length}</span>
            </button>
          ))}
          <span style={{ flex: 1 }} />
          <SectionPicker value={section} products={products} onPick={code => { setSection(code); setPage(1) }} />
          <button className="qs-pl-btn" disabled={!history.length} onClick={undo}><Icon name="undo" size={14} />Hoàn tác</button>
          <button className={`qs-pl-btn${editing ? ' on' : ''}`} title="Sửa trực tiếp tên, thương hiệu, giá đại lý trong bảng" onClick={() => setEditing(e => !e)}><Icon name="edit" size={14} />Edit</button>
          <div className="qs-pl-filter" ref={filterRef}>
            <button className={`qs-pl-btn${filterOpen || filterCount ? ' on' : ''}`} onClick={() => setFilterOpen(o => !o)}>
              <Icon name="sliders" size={14} />Bộ lọc{filterCount > 0 && <span className="qs-pl-count">{filterCount}</span>}
            </button>
            {filterOpen && (
              <div className="qs-pl-filter-menu">
                <div className="qs-pl-filter-title">Thương hiệu</div>
                {allBrands.map(b => (
                  <label key={b}>
                    <input type="checkbox" checked={brands.includes(b)} onChange={() => { setBrands(list => (list.includes(b) ? list.filter(x => x !== b) : [...list, b])); setPage(1) }} />{b}
                  </label>
                ))}
                <div className="qs-pl-filter-title">Giá đại lý</div>
                <div className="qs-pl-filter-price">
                  <input value={price.from} placeholder="Từ" inputMode="numeric" onChange={e => { setPrice(x => ({ ...x, from: e.target.value.replace(/\D/g, '') })); setPage(1) }} />
                  <span>—</span>
                  <input value={price.to} placeholder="Đến" inputMode="numeric" onChange={e => { setPrice(x => ({ ...x, to: e.target.value.replace(/\D/g, '') })); setPage(1) }} />
                </div>
                <button className="qs-pl-filter-clear" disabled={!filterCount} onClick={() => { setBrands([]); setPrice({ from: '', to: '' }) }}>Xoá bộ lọc</button>
              </div>
            )}
          </div>
          <button className="qs-pl-btn" title="Tải các dòng đang lọc với các cột đang hiện" onClick={download}><Icon name="download" size={14} />Tải Excel</button>
          <button className="qs-pl-btn primary" onClick={() => onGoto('import')}><Icon name="plus" size={15} />Thêm sản phẩm</button>
        </div>

        <div className="qs-pl-cols">
          <div className="qs-pl-cols-head">
            <button className="qs-pl-cols-label" onClick={() => setColsOpen(o => !o)}>
              Cột hiển thị <small>{columns.length + FIXED_COLUMN_COUNT}/{PRODUCT_COLUMNS.length + FIXED_COLUMN_COUNT}</small>
              <Icon name={colsOpen ? 'chevronUp' : 'chevronDown'} size={15} />
            </button>
            <button className={`qs-pl-preset${sameSet(shown, DEFAULT_COLUMNS) ? ' on' : ''}`} onClick={() => setShown(new Set(DEFAULT_COLUMNS))}>
              <Icon name="sliders" size={12} />Mặc định {DEFAULT_COLUMNS.length}/{PRODUCT_COLUMNS.length}
            </button>
            <button className={`qs-pl-preset${shown.size === PRODUCT_COLUMNS.length ? ' on' : ''}`} onClick={() => setShown(new Set(PRODUCT_COLUMNS.map(c => c.key)))}>Hiện tất cả</button>
            <button className={`qs-pl-preset${sameSet(shown, BASIC_COLUMNS) ? ' on' : ''}`} onClick={() => setShown(new Set(BASIC_COLUMNS))}>Cột cơ bản</button>
            {selected.size > 0 && (
              <span className="qs-pl-bulk">
                Đã chọn <b>{selected.size}</b>
                <button onClick={approveSelected}><Icon name="check" size={13} />Duyệt</button>
                <button className="danger" onClick={() => remove([...selected])}><Icon name="trash" size={13} />Xoá</button>
              </span>
            )}
          </div>
          {colsOpen && (
            <div className="qs-pl-chips">
              {PRODUCT_COLUMNS.map(c => (
                <button key={c.key} className={shown.has(c.key) ? 'on' : ''} onClick={() => toggleIn(setShown, c.key)}>{c.label}</button>
              ))}
            </div>
          )}
        </div>

        <div className="qs-pl-table">
          <table>
            <thead>
              <tr>
                <th className="check"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                <th className="c">STT</th>
                {shown.has('image') && <th className="c">Ảnh</th>}
                <th>Sản phẩm</th>
                {columns.filter(c => c.key !== 'image').map(c => <th key={c.key} className={columnAlign(c.key)}>{c.label}</th>)}
                <th className="actions" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((p, i) => {
                const no = first + i
                const combo = comboOf(p)
                const comboOpen = expanded.has(`${p.id}:combo`)
                const variantOpen = expanded.has(`${p.id}:variant`)
                return (
                  <Fragment key={p.id}>
                    {renderRow(p, { no, kind: 'main', chips: (
                      <>
                        {combo.length > 0 && (
                          <button className={`qs-pl-chip combo${comboOpen ? ' open' : ''}`} onClick={() => toggleIn(setExpanded, `${p.id}:combo`)}>
                            <Icon name="layers" size={11} />Combo {combo.length}<Icon name={comboOpen ? 'chevronUp' : 'chevronDown'} size={11} />
                          </button>
                        )}
                        {p.variants.length > 1 && (
                          <button className={`qs-pl-chip variant${variantOpen ? ' open' : ''}`} onClick={() => toggleIn(setExpanded, `${p.id}:variant`)}>
                            <Icon name="copy" size={11} />Biến thể {p.variants.length}<Icon name={variantOpen ? 'chevronUp' : 'chevronDown'} size={11} />
                          </button>
                        )}
                      </>
                    ) })}
                    {comboOpen && combo.map((c, j) => renderRow(c.product, { no: `${no}.${j + 1}`, kind: 'combo', parent: p, qty: c.qty }))}
                    {comboOpen && combo.length > 0 && (
                      <tr className="qs-pl-combo-total">
                        <td colSpan={columns.length + 4}>Tổng combo · {combo.reduce((sum, c) => sum + c.qty, 0)} sản phẩm đi kèm<b>{formatPrice(combo.reduce((sum, c) => sum + c.qty * c.product.dealer, 0)).replace('đ', ' đ')}</b></td>
                      </tr>
                    )}
                    {variantOpen && p.variants.slice(1).map((v, j) => renderRow(
                      { ...p, ...v, fav: !!v.fav, approval: v.approval || p.approval },
                      { no: `${no}.${j + 1}`, kind: 'variant', parent: p, index: j + 1, label: v.label },
                    ))}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
          {!rows.length && <div className="qs-dash-empty">Không có sản phẩm nào khớp.</div>}
        </div>

        <div className="qs-pl-foot">
          <span>Hiện <b>{first}–{rows.length ? first + pageRows.length - 1 : 0}</b> / {rows.length} dòng · {rows.reduce((sum, p) => sum + skuCount(p), 0)} sản phẩm</span>
          <span style={{ flex: 1 }} />
          <div className="qs-pl-pages">
            <button disabled={current === 1} onClick={() => setPage(current - 1)}><Icon name="arrowLeft" size={13} /></button>
            {Array.from({ length: pageCount }, (_, n) => n + 1).map(n => (
              <button key={n} className={n === current ? 'on' : ''} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button disabled={current === pageCount} onClick={() => setPage(current + 1)}><Icon name="arrowRight" size={13} /></button>
          </div>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}>
            {PAGE_SIZES.map(n => <option key={n} value={n}>{n} SP/trang</option>)}
          </select>
        </div>
      </div>

      {detailProduct && (
        <ProductDetail
          product={detailProduct} combo={comboOf(detailBase)} onClose={() => setDetail(null)}
          onQty={(id, qty) => patch(detailBase.id, { combo: detailBase.combo.map(c => (c.id === id ? { ...c, qty } : c)) })}
          onAddCombo={sets => comboOf(detailBase).forEach(c => addToProject(c.product.id, c.qty * sets))}
          onAddToProject={() => addToProject(detailBase.id)}
          onEdit={() => { setEditing(true); setDetail(null) }}
        />
      )}
    </>
  )
}
