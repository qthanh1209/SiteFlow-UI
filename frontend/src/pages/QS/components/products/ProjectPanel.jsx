import { useState } from 'react'
import Icon from '../../../../components/ui/Icon'
import ProductThumb from './ProductThumb'
import { DASH_PROJECTS } from '../../../../data/qsDashboardData'
import { formatPrice } from '../../../../data/qsProductsData'

/* Cột trái: sản phẩm đã đưa vào dự án đang chọn. Nhận sản phẩm bằng cách kéo dòng từ bảng thả vào, hoặc bấm + trên dòng.
   items: sản phẩm của dự án đang chọn (kèm qty = số lượng); dragging: đang kéo một dòng của bảng */
export default function ProjectPanel({ projectId, onProject, items, dragging, onDropProduct, onRemove, onCollapse }) {
  const [over, setOver] = useState(false)
  const [copied, setCopied] = useState(false)

  /* Gắn link: chép đường dẫn tới danh sách sản phẩm của dự án */
  function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}#du-an=${projectId}`
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }

  return (
    <div
      className={`qs-card qs-pl-side${dragging ? ' droppable' : ''}${over ? ' over' : ''}`}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onDropProduct(e.dataTransfer.getData('text/plain')) }}
    >
      <div className="qs-pl-side-head">
        <Icon name="layers" size={18} className="qs-dash-accent" />
        <b>Sản phẩm trong dự án</b>
        <span className="qs-pl-count">{items.length}</span>
        <button className="qs-pl-link" onClick={copyLink}><Icon name="link" size={12} />{copied ? 'Đã chép' : 'Gắn link'}</button>
        <button className="qs-pl-icon-btn" title="Thu gọn" onClick={onCollapse}><Icon name="arrowLeft" size={15} /></button>
      </div>
      <select className="qs-pl-project" value={projectId} onChange={e => onProject(e.target.value)}>
        {DASH_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <div className="qs-pl-side-title">Danh sách sản phẩm tham gia dự án</div>
      <div className="qs-pl-side-list">
        {items.map(p => (
          <div key={p.id} className="qs-pl-side-item">
            <ProductThumb tone={p.tone} size={34} />
            <div>
              <b title={p.name}>{p.name}</b>
              <small>{p.code} · {formatPrice(p.dealer)} · ×{p.qty}</small>
            </div>
            <button className="qs-pl-icon-btn" title="Bỏ khỏi dự án" onClick={() => onRemove(p.id)}><Icon name="x" size={13} /></button>
          </div>
        ))}
        {!items.length && (
          <p className="qs-pl-side-empty">
            Chưa có sản phẩm.<br />
            Kéo sản phẩm từ bảng bên phải thả vào đây, hoặc bấm <b>+</b> trên từng dòng.
          </p>
        )}
      </div>
    </div>
  )
}
