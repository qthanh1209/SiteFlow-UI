import { useRef, useState } from 'react'
import { DASH_PROJECTS, DASH_DEFAULT_ACTIVE } from '../../../data/qsDashboardData'
import { INITIAL_GROUPS, SHEET_COLUMNS, makeRow, rowValues } from '../../../data/qsBreakdownData'
import ProjectBar from './breakdown/ProjectBar'
import CatalogPanel from './breakdown/CatalogPanel'
import SheetHeader from './breakdown/SheetHeader'
import ProductInfo from './breakdown/ProductInfo'
import SheetBody from './breakdown/SheetBody'

/* Bề rộng cột sản phẩm (px bố cục): mặc định và giới hạn khi kéo vạch ngăn */
const CATALOG_DEFAULT = 440
const CATALOG_MIN = 300
const CATALOG_MAX = 760

/* Tab "Bóc tách": cột sản phẩm bên trái + bảng tính bóc tách bên phải */
export default function BreakdownTab({ sheet, vat, onVat }) {
  const [projectId, setProjectId] = useState(DASH_DEFAULT_ACTIVE.projectId)
  const { groups, commit } = sheet
  const [targetId, setTargetId] = useState(INITIAL_GROUPS[0].id)
  const [view, setView] = useState('sheet')
  const [catalogOpen, setCatalogOpen] = useState(true)
  const [favorites, setFavorites] = useState(() => new Set())
  /* Cột đang ẩn và dải tuỳ chọn đang mở dưới thanh công cụ (màu, tìm, lọc, cột, lịch sử) */
  const [hiddenCols, setHiddenCols] = useState(() => new Set())
  const [panel, setPanel] = useState(null)
  const [full, setFull] = useState(false)
  const [catalogW, setCatalogW] = useState(CATALOG_DEFAULT)
  const [resizing, setResizing] = useState(false)
  const resizeRef = useRef(null)
  /* Sản phẩm đang được kéo từ cột trái và vị trí sẽ thả: { groupId, rowId, after } (rowId = null: ngay dưới dòng tên nhóm) */
  const [dragProduct, setDragProduct] = useState(null)
  const [drop, setDrop] = useState(null)
  /* Dòng vừa thêm / vừa tăng số lượng: tô nền vàng + hiện thông báo trong vài giây */
  /* Sản phẩm đang mở ở cột "Thông tin sản phẩm" */
  const [detail, setDetail] = useState(null)
  const [flash, setFlash] = useState(null)
  const flashTimer = useRef(null)

  const project = DASH_PROJECTS.find(p => p.id === projectId)
  const rows = groups.flatMap(g => g.rows)
  const subtotal = rows.reduce((s, r) => s + rowValues(r).amount, 0)
  const target = groups.find(g => g.id === targetId) || groups[0]

  /* mark = false: chỉ chọn dòng + hiện thông báo, không tô nền vàng */
  function notify(rowId, text, mark = true) {
    clearTimeout(flashTimer.current)
    setFlash(f => ({ rowId, text, mark, n: (f ? f.n : 0) + 1 }))
    /* Thông báo tự ẩn sau vài giây; nền vàng giữ lại tới khi người dùng bấm chọn ô khác */
    flashTimer.current = setTimeout(() => setFlash(f => (f ? { ...f, text: null } : f)), 2600)
  }
  /* Thêm các dòng vào cuối một nhóm (mặc định là nhóm đang chọn) */
  const addRows = (newRows, label, groupId = target.id) => commit(label, gs => gs.map(g => (g.id === groupId ? { ...g, collapsed: false, rows: [...g.rows, ...newRows] } : g)))
  /* Thêm một sản phẩm vào nhóm tại vị trí at (bỏ trống = cuối nhóm).
     Nhóm đã có sản phẩm đó thì chỉ tăng số lượng lên 1 chứ không thêm dòng mới. */
  function addProduct(product, groupId = target.id, at = null) {
    const group = groups.find(g => g.id === groupId)
    const existing = group.rows.find(r => r.productId === product.id)
    if (existing) {
      commit(`+1 số lượng ${product.name}`, gs => gs.map(g => (g.id === groupId ? { ...g, collapsed: false, rows: g.rows.map(r => (r.id === existing.id ? { ...r, qty: r.qty + 1 } : r)) } : g)))
      notify(existing.id, `+1 số lượng: ${product.name}`)
      return
    }
    const row = makeRow(product)
    commit(`Thêm ${product.name}`, gs => gs.map(g => {
      if (g.id !== groupId) return g
      const i = at === null ? g.rows.length : at
      return { ...g, collapsed: false, rows: [...g.rows.slice(0, i), row, ...g.rows.slice(i)] }
    }))
    notify(row.id, `Đã thêm: ${product.name}`)
  }
  /* Thêm một tầng / phòng mới vào cuối bảng; tên đã có thì bỏ qua */
  const addGroup = name => {
    if (groups.some(g => g.name.toUpperCase() === name)) return
    const id = `g${Date.now()}`
    commit(`Thêm ${name}`, gs => [...gs, { id, name, collapsed: false, rows: [] }])
    setTargetId(id)
  }
  /* Nút "Thêm hạng mục": thêm một dòng trống có sẵn tên / đơn vị / số lượng để sửa ngay trong bảng */
  const addBlankRow = () => {
    const row = { ...makeRow(null), name: 'Hạng mục mới', unit: 'Cái', qty: 1 }
    addRows([row], 'Thêm hạng mục')
    notify(row.id, 'Đã thêm hạng mục — sửa ngay trong bảng', false)
  }
  const toggleFav = id => setFavorites(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  /* Kéo vạch ngăn giữa cột sản phẩm và bảng để đổi bề rộng cột trái; bấm đúp về mặc định.
     Chuột tính theo px màn hình, bề rộng tính theo px bố cục (trang đang zoom) nên quy đổi qua scale. */
  function startResize(e) {
    const el = e.currentTarget.previousElementSibling
    const w = el.offsetWidth
    resizeRef.current = { x: e.clientX, w, scale: el.getBoundingClientRect().width / w || 1 }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
    setResizing(true)
  }
  function moveResize(e) {
    const d = resizeRef.current
    if (!d) return
    if (e.buttons === 0) { endResize(); return }
    setCatalogW(Math.max(CATALOG_MIN, Math.min(CATALOG_MAX, Math.round(d.w + (e.clientX - d.x) / d.scale))))
  }
  function endResize() {
    resizeRef.current = null
    setResizing(false)
  }

  /* Kéo sản phẩm từ cột trái thả vào bảng: thả vào nửa trên / nửa dưới của một dòng để chèn trước / sau dòng đó;
     thả ngoài các dòng thì thêm vào cuối nhóm đang chọn */
  const dropGroup = (drop && groups.find(g => g.id === drop.groupId)) || target
  /* Dòng sẽ kẻ vạch chèn và vạch nằm ở mép trên hay mép dưới của nó */
  const dropMark = !dragProduct ? null
    : drop ? { key: drop.rowId || `g:${drop.groupId}`, pos: drop.after ? 'after' : 'before' }
      : { key: target.rows.length && !target.collapsed ? target.rows[target.rows.length - 1].id : `g:${target.id}`, pos: 'after' }
  function onDragOver(e) {
    if (!dragProduct) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    const tr = e.target.closest ? e.target.closest('tr[data-group]') : null
    let next = null
    if (tr) {
      const box = tr.getBoundingClientRect()
      const rowId = tr.dataset.row || null
      next = { groupId: tr.dataset.group, rowId, after: rowId ? e.clientY > box.top + box.height / 2 : true }
    }
    const same = (!next && !drop) || (next && drop && next.groupId === drop.groupId && next.rowId === drop.rowId && next.after === drop.after)
    if (!same) setDrop(next)
  }
  function onDrop(e) {
    if (!dragProduct) return
    e.preventDefault()
    let at = null
    if (drop) {
      const i = drop.rowId ? dropGroup.rows.findIndex(r => r.id === drop.rowId) : -1
      at = drop.rowId ? (i < 0 ? null : i + (drop.after ? 1 : 0)) : 0
    }
    addProduct(dragProduct, dropGroup.id, at)
    setTargetId(dropGroup.id)
    endDragProduct()
  }
  function endDragProduct() {
    setDragProduct(null)
    setDrop(null)
  }

  return (
    <>
      <ProjectBar projects={DASH_PROJECTS} projectId={projectId} onSelect={setProjectId} />
      <div className="qs-bd-body">
        {catalogOpen && (
          <>
            <CatalogPanel
              width={catalogW}
              onAdd={product => addProduct(product)}
              onOpen={product => setDetail(d => (d && d.id === product.id ? null : product))}
              activeId={detail ? detail.id : null}
              favorites={favorites}
              onToggleFav={toggleFav}
              dragId={dragProduct ? dragProduct.id : null}
              onDragProduct={setDragProduct}
              onDragEnd={endDragProduct}
            />
            <div
              className={`qs-bd-split${resizing ? ' dragging' : ''}`}
              title="Kéo để đổi bề rộng · bấm đúp để về mặc định"
              onPointerDown={startResize}
              onPointerMove={moveResize}
              onPointerUp={endResize}
              onPointerCancel={endResize}
              onDoubleClick={() => setCatalogW(CATALOG_DEFAULT)}
            />
          </>
        )}
        {catalogOpen && detail && <ProductInfo product={detail} onClose={() => setDetail(null)} onAdd={product => addProduct(product)} />}
        <div className="qs-bd-right">
          <SheetHeader
            count={rows.length} subtotal={subtotal} vat={vat} onVat={onVat}
            view={view} onView={setView}
            catalogOpen={catalogOpen} onToggleCatalog={() => setCatalogOpen(o => !o)}
            colsShown={SHEET_COLUMNS.length - hiddenCols.size} colsTotal={SHEET_COLUMNS.length}
            onOpenCols={() => setPanel(p => (p === 'cols' ? null : 'cols'))}
            onResetCols={() => setHiddenCols(new Set())}
          />
          <div
            className={`qs-card qs-bd-sheet${dragProduct ? ' drop-active' : ''}${full ? ' full' : ''}`}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <SheetBody
              sheet={sheet}
              plain={view === 'plain'}
              hiddenCols={hiddenCols} onHiddenCols={setHiddenCols}
              panel={panel} onPanel={setPanel}
              favorites={favorites}
              targetName={target.name} onTarget={setTargetId}
              groupNames={groups.map(g => g.name.toUpperCase())}
              onAddGroup={addGroup} onAddRow={addRows} onAddBlank={addBlankRow}
              full={full} onFull={() => setFull(f => !f)}
              dropMark={dropMark}
              flash={flash}
              onClearMark={() => setFlash(f => (f && f.mark ? { ...f, mark: false } : f))}
              dropHint={dragProduct ? `Thả để thêm vào ${dropGroup.name}` : null}
              fileName={`boc-tach-${project.drafts[0].code}`}
            />
            {flash && flash.text && <div key={flash.n} className="qs-bd-toast">{flash.text}</div>}
          </div>
        </div>
      </div>
    </>
  )
}
