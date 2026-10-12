import { useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon'
import ProductThumb from './ProductThumb'
import { APPROVAL, DETAIL_KEY_INFO, DETAIL_GROUPS, formatPrice, productText } from '../../../../data/qsProductsData'

const money = n => formatPrice(n).replace('đ', ' đ')

/* Hộp "Thông tin sản phẩm": ảnh, thông tin chính, các nhóm thông số có dữ liệu, tài liệu, đơn giá và sản phẩm đi kèm.
   combo: [{ product, qty }]; onQty: đổi số lượng một sản phẩm đi kèm; onAddCombo(số bộ): đưa cả combo vào dự án */
export default function ProductDetail({ product, combo, onClose, onQty, onAddCombo, onAddToProject, onEdit }) {
  const [sets, setSets] = useState(1)
  const imgRef = useRef(null)

  /* Tải ảnh sản phẩm về máy (sản phẩm mẫu dùng hình minh hoạ dạng SVG) */
  function downloadImage() {
    const svg = imgRef.current.querySelector('svg')
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${product.code}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }
  const keyInfo = DETAIL_KEY_INFO.map(k => ({ ...k, text: productText(product, k.key) })).filter(k => k.text)
  const groups = DETAIL_GROUPS
    .map(g => ({ ...g, rows: g.fields.map(([key, label]) => [label, productText(product, key)]).filter(([, text]) => text) }))
    .filter(g => g.rows.length)
  const docs = product.docs || []
  const comboTotal = combo.reduce((sum, c) => sum + c.qty * c.product.dealer, 0)

  return (
    <div className="qs-pl-modal-back" onClick={onClose}>
      <div className="qs-card qs-pl-modal" onClick={e => e.stopPropagation()}>
        <div className="qs-pl-modal-head">
          <b>Thông tin sản phẩm</b>
          <span className={`qs-pl-status ${product.approval}`}>{APPROVAL[product.approval]}</span>
          <button className="qs-pl-modal-close" title="Đóng" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        <div className="qs-pl-modal-body">
          <div className="qs-pl-modal-top">
            <div className="qs-pl-modal-left">
              <div className="qs-pl-modal-img" ref={imgRef}>
                <ProductThumb tone={product.tone} size={220} />
                <button title="Tải ảnh về" onClick={downloadImage}><Icon name="download" size={15} /></button>
              </div>
              <small className="code">{product.code}{product.label ? ` · ${product.label}` : ''}</small>
              <b className="name">{product.name}</b>

              <div className="qs-pl-modal-h">Key Product Info <span>(Thông tin chính)</span></div>
              {keyInfo.map(k => (
                <div key={k.key} className="qs-pl-modal-key" title={k.label}><span><Icon name={k.icon} size={13} /></span>{k.text}</div>
              ))}
              {!keyInfo.length && <p className="qs-pl-modal-note">Chưa có thông tin chính.</p>}

              <div className="qs-pl-modal-h">Tài liệu <span>({docs.length} file)</span></div>
              {docs.map(d => <div key={d} className="qs-pl-modal-key"><span><Icon name="fileText" size={13} /></span>{d}</div>)}
              {!docs.length && <p className="qs-pl-modal-note">Sản phẩm chưa có tài liệu — thêm ở Nhập dữ liệu hoặc Sửa sản phẩm.</p>}

              <div className="qs-pl-modal-price"><span>Đơn giá</span><b>{money(product.dealer)}</b></div>
            </div>

            <div className="qs-pl-modal-right">
              <div className="qs-pl-modal-specs">
                {groups.map(g => (
                  <div key={g.title}>
                    <div className="qs-pl-modal-h">{g.title} <span>({g.sub})</span></div>
                    {g.rows.map(([label, text]) => (
                      <div key={label} className="qs-pl-modal-row"><span>{label}</span><b>{text}</b></div>
                    ))}
                  </div>
                ))}
                {!groups.length && <p className="qs-pl-modal-note">Sản phẩm chưa có thông số kỹ thuật.</p>}
              </div>
            </div>
          </div>

          {combo.length > 0 && (
            <div className="qs-pl-modal-combo">
              <div className="qs-pl-modal-combo-head"><Icon name="layers" size={15} className="qs-dash-accent" /><b>Sản phẩm đi kèm</b><span className="qs-pl-count">{combo.length}</span></div>
              {combo.map(c => (
                <div key={c.product.id} className="qs-pl-modal-combo-item">
                  <ProductThumb tone={c.product.tone} size={30} />
                  <div>
                    <b>{c.product.name}</b>
                    <small>{c.product.code} · {money(c.product.dealer)}</small>
                  </div>
                  <div className="r">
                    <b>{money(c.qty * c.product.dealer)}</b>
                    <label>SL<input type="number" min="1" value={c.qty} onChange={e => onQty(c.product.id, Math.max(1, Math.round(Number(e.target.value)) || 1))} /></label>
                  </div>
                </div>
              ))}
              <div className="qs-pl-modal-combo-total"><span>Tổng combo</span><b>{money(comboTotal)}</b></div>
              <div className="qs-pl-modal-combo-add">
                <div className="qs-pl-modal-sets">
                  <small>Số bộ</small>
                  <button disabled={sets <= 1} onClick={() => setSets(n => n - 1)}>−</button>
                  <b>{sets}</b>
                  <button onClick={() => setSets(n => n + 1)}>+</button>
                </div>
                <button className="qs-pl-btn primary" title="Đưa các sản phẩm đi kèm vào dự án đang chọn" onClick={() => onAddCombo(sets)}><Icon name="plus" size={15} />Thêm combo</button>
              </div>
            </div>
          )}
        </div>

        <div className="qs-pl-modal-foot">
          <button className="qs-pl-btn" onClick={onClose}>Đóng</button>
          <button className="qs-pl-btn" title="Bật sửa trực tiếp trong bảng" onClick={onEdit}><Icon name="edit" size={14} />Cập nhật</button>
          <button className="qs-pl-btn primary" onClick={onAddToProject}><Icon name="plus" size={15} />Thêm vào dự án</button>
        </div>
      </div>
    </div>
  )
}
