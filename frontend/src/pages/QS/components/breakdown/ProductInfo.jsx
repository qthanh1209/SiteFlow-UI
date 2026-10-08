import Icon from '../../../../components/ui/Icon'
import PaintThumb from './PaintThumb'
import { PHYSICAL_PROPS, formatDong, productCode } from '../../../../data/qsBreakdownData'

/* Tách "Nhãn: giá trị" trên từng dòng của phần thông tin chính */
const pairs = text => text.split('\n').filter(Boolean).map(line => {
  const i = line.indexOf(':')
  return i < 0 ? [line, ''] : [line.slice(0, i).trim(), line.slice(i + 1).trim()]
})

/* Cột "Thông tin sản phẩm" mở ra khi bấm một sản phẩm ở cột trái */
export default function ProductInfo({ product, onClose, onAdd }) {
  const code = productCode(product)
  const features = product.features.split('\n').filter(Boolean)
  return (
    <div className="qs-card qs-bd-info">
      <div className="qs-bd-info-head">
        <span>Thông tin sản phẩm</span>
        <button className="qs-bd-info-close" title="Đóng" onClick={onClose}><Icon name="x" size={15} /></button>
      </div>
      <div className="qs-bd-info-body">
        <div className="qs-bd-info-image">
          {/* TODO: tải ảnh sản phẩm khi có ảnh thật */}
          <button className="qs-bd-info-dl" title="Tải ảnh"><Icon name="download" size={14} /></button>
          <PaintThumb tone={product.tone} size={190} />
        </div>
        <div className="qs-bd-info-code">{code}</div>
        <div className="qs-bd-info-name">{product.name}</div>

        <div className="qs-bd-info-sec">Key Product Info <i>(Thông tin chính)</i></div>
        {pairs(product.info).map(([k, v]) => <div key={k} className="qs-bd-info-kv"><span>{k}</span><b>{v}</b></div>)}

        {features.length > 0 && (
          <>
            <div className="qs-bd-info-sec">Tính năng sản phẩm</div>
            <ul className="qs-bd-info-list">{features.map(f => <li key={f}>{f}</li>)}</ul>
          </>
        )}

        <div className="qs-bd-info-sec">IX. Các tính chất vật lý và hóa học và đặc tính an toàn</div>
        {PHYSICAL_PROPS.map(([k, v]) => <div key={k} className="qs-bd-info-kv"><span>{k}</span><b>{v}</b></div>)}

        <div className="qs-bd-info-sec">Tài liệu <i>({product.docs} file)</i></div>
        <div className="qs-bd-info-sub">Tài liệu kỹ thuật</div>
        {Array.from({ length: product.docs }, (_, i) => {
          const file = `docs/1791002334547-${code}${i ? `-${i + 1}` : ''}.pdf`
          return (
            <div key={file} className="qs-bd-info-doc">
              <span className="qs-bd-info-pdf">PDF</span>
              <span className="qs-bd-info-file" title={file}>{file}</span>
              {/* TODO: tải tài liệu khi có file thật */}
              <button title="Tải tài liệu"><Icon name="download" size={13} /></button>
            </div>
          )
        })}

        <div className="qs-bd-info-price"><span>Đơn giá</span><b>{formatDong(product.price)}</b></div>
        <div className="qs-bd-info-actions">
          <button className="qs-modal-btn" onClick={onClose}>Đóng</button>
          {onAdd && <button className="qs-modal-btn primary" onClick={() => onAdd(product)}><Icon name="plus" size={14} />Thêm vào bóc tách</button>}
        </div>
      </div>
    </div>
  )
}
