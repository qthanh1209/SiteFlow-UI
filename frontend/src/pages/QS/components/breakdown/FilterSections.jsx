import { useState } from 'react'
import { FILTER_DEFS, CATALOG_BRANDS } from '../../../../data/qsBreakdownData'

/* Các khối lọc đang bật, hiển thị trên cột sản phẩm. filters/onChange: giá trị đang chọn của từng bộ lọc */
export default function FilterSections({ visible, filters, onChange, favoriteCount }) {
  const [closed, setClosed] = useState({})
  const set = (key, value) => onChange({ ...filters, [key]: value })
  /* Chip chọn nhiều; single = chỉ một lựa chọn, bấm lại để bỏ */
  const pick = (d, label) => {
    const cur = filters[d.key]
    if (cur.includes(label)) set(d.key, cur.filter(v => v !== label))
    else set(d.key, d.single ? [label] : [...cur, label])
  }

  return FILTER_DEFS.filter(d => visible[d.key]).map(d => (
    <div key={d.key}>
      <div className="qs-bd-fsec">
        <button className="qs-bd-fsec-head" onClick={() => setClosed(c => ({ ...c, [d.key]: !c[d.key] }))}>
          <span>{d.label}</span><span className={`qs-bd-tri up${closed[d.key] ? ' closed' : ''}`} />
        </button>
        {!closed[d.key] && (
          <>
            {d.type === 'chips' && (
              <div className="qs-bd-fchips">
                {d.options.map(([label, count]) => (
                  <button key={label} className={`qs-bd-fchip${filters[d.key].includes(label) ? ' on' : ''}`} onClick={() => pick(d, label)}>
                    {label}<small>{count}</small>
                  </button>
                ))}
              </div>
            )}
            {d.type === 'fav' && (
              <div className="qs-bd-fchips">
                <button className={`qs-bd-fchip${filters.fav ? ' on' : ''}`} onClick={() => set('fav', !filters.fav)}>
                  ♥ Chỉ sản phẩm yêu thích<small>{favoriteCount}</small>
                </button>
              </div>
            )}
            {d.type === 'brand' && (
              <div className="qs-bd-fbrand">
                <select value={filters.brand} onChange={e => set('brand', e.target.value)}>
                  <option value="">Tất cả thương hiệu</option>
                  {CATALOG_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <span>+</span>
              </div>
            )}
            {d.type === 'price' && (
              <div className="qs-bd-fprice">
                <span>Giá từ</span>
                <input type="number" min="0" value={filters.priceFrom} onChange={e => set('priceFrom', e.target.value)} />
                <span>Tới</span>
                <input type="number" min="0" value={filters.priceTo} onChange={e => set('priceTo', e.target.value)} />
              </div>
            )}
          </>
        )}
      </div>
      {/* Gợi ý nằm ngay sau nhóm thông số (Kích thước) như giao diện mẫu */}
      {d.key === 'size' && <p className="qs-bd-hint in-list">Chọn 1 hạng mục để lọc theo thông số riêng của hạng mục đó.</p>}
    </div>
  ))
}
