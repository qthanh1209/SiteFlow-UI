import { formatDong, formatMoney } from '../../../../data/qsBreakdownData'

const pct = n => `${n.toFixed(1)}%`

/* Khối "Tổng quan chi phí": 6 ô số liệu + biểu đồ theo hạng mục + tỷ trọng giá vốn theo nhà cung cấp */
export default function CostOverview({ totals, vat, rowCount, warn, minMargin, onMinMargin, onFilter, categories, suppliers, onCollapse }) {
  const maxSale = Math.max(...categories.map(c => c.sale), 1)
  return (
    <div className="qs-card qs-ct-overview">
      <div className="qs-ct-overview-head">
        <span className="qs-ct-title">Tổng quan chi phí</span>
        <button className="qs-ct-dash-btn" onClick={onCollapse}>Thu gọn</button>
      </div>

      <div className="qs-ct-tiles">
        <div className="qs-ct-tile">
          <span>Giá vốn</span><b>{formatDong(totals.cost)}</b><small>{rowCount} dòng</small>
        </div>
        <div className="qs-ct-tile">
          <span>Giá bán</span><b>{formatDong(totals.sale)}</b><small>chưa gồm VAT</small>
        </div>
        <div className="qs-ct-tile">
          <span>Lợi nhuận</span><b className="profit">{formatDong(totals.profit)}</b><small>biên {pct(totals.margin)} trên giá bán</small>
        </div>
        <div className="qs-ct-tile">
          <span>VAT {vat}%</span><b>{formatDong(totals.vatAmount)}</b>
        </div>
        <div className="qs-ct-tile total">
          <span>Tổng thanh toán</span><b>{formatDong(totals.sale + totals.vatAmount)}</b>
        </div>
        <div className="qs-ct-tile warn">
          <span>Cảnh báo</span>
          <div className="qs-ct-warn-row">
            <button className="qs-ct-warn-chip" onClick={() => onFilter('low')}>{warn.low} biên dưới {minMargin}%</button>
            <button className="qs-ct-warn-chip" onClick={() => onFilter('noPrice')}>{warn.noPrice} chưa có giá bán</button>
            <label className="qs-ct-min">
              Biên tối thiểu
              <input type="number" min="0" max="100" value={minMargin} onChange={e => onMinMargin(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
              %
            </label>
          </div>
        </div>
      </div>

      <div className="qs-ct-charts">
        <div className="qs-ct-chart">
          <div className="qs-ct-chart-head">
            <b>Theo hạng mục</b>
            <span><i className="sale" />giá bán</span><span><i className="cost" />giá vốn · % = biên</span>
          </div>
          {categories.map(c => (
            <div key={c.name} className="qs-ct-cat">
              <span className="qs-ct-cat-name">{c.name}</span>
              <div className="qs-ct-cat-bar">
                <div className="sale" style={{ width: `${(c.sale / maxSale) * 100}%` }} />
                <div className="cost" style={{ width: `${(c.cost / maxSale) * 100}%` }} />
              </div>
              <span className="qs-ct-cat-value">{formatMoney(c.sale)}</span>
              <span className="qs-ct-cat-pct">{pct(c.margin)}</span>
            </div>
          ))}
          {!categories.length && <div className="qs-ct-empty">Chưa có dữ liệu.</div>}
        </div>
        <div className="qs-ct-chart">
          <div className="qs-ct-chart-head"><b>Tỷ trọng giá vốn theo nhà cung cấp</b></div>
          {suppliers.map(s => (
            <div key={s.name} className="qs-ct-sup">
              <span className="qs-ct-sup-name" title={s.name}>{s.name}</span>
              <div className="qs-ct-sup-bar"><div style={{ width: `${s.pct}%` }} /></div>
              <span className="qs-ct-sup-pct">{pct(s.pct)}</span>
            </div>
          ))}
          {!suppliers.length && <div className="qs-ct-empty">Chưa có dữ liệu.</div>}
        </div>
      </div>
    </div>
  )
}
