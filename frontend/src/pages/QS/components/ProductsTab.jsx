import { useMemo, useState } from 'react'
import { PRODUCTS, PRODUCT_CATEGORIES, PRODUCT_BRANDS, STATIC_FILTERS, qsColor } from '../../../data/qsData'

function ProductCard({ p }) {
  const color = qsColor(p.brand)
  return (
    <div className="qs-card qs-product-card">
      <div style={{ height: 96, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.3A7 7 0 0 0 12 2z" /></svg>
        </div>
        <span style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
        </span>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.brand} · {p.cat}</div>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="qs-spec">{p.power}</span>
          <span className="qs-spec">{p.cct}</span>
          <span className="qs-spec">{p.angle}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--qs)' }}>{p.price}</span>
          <button style={{ border: 'none', cursor: 'pointer', background: 'var(--qs-tint)', color: 'var(--qs)', fontSize: 11, fontWeight: 700, padding: '6px 10px', borderRadius: 8 }}>+ Thêm</button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsTab() {
  const [activeCat, setActiveCat] = useState('all')
  const [activeBrands, setActiveBrands] = useState([])

  const filtered = useMemo(() => PRODUCTS.filter(p => {
    if (activeCat !== 'all' && p.cat !== activeCat) return false
    if (activeBrands.length && !activeBrands.includes(p.brand)) return false
    return true
  }), [activeCat, activeBrands])

  function toggleBrand(brand, checked) {
    // Giữ thứ tự theo danh sách gốc, giống querySelectorAll(':checked') của bản HTML
    setActiveBrands(prev => PRODUCT_BRANDS.filter(b => (b === brand ? checked : prev.includes(b))))
  }
  function clearFilters() {
    setActiveCat('all')
    setActiveBrands([])
  }

  return (
    <>
      <div className="qs-card qs-filter-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: 13, fontWeight: 700 }}>Bộ lọc</h4>
          <span onClick={clearFilters} style={{ fontSize: 11.5, color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}>Xoá lọc</span>
        </div>

        <div>
          <div className="qs-filter-title">Lọc theo đề mục</div>
          <div className="qs-chip-wrap">
            <button className={`qs-cat-chip${activeCat === 'all' ? ' active' : ''}`} onClick={() => setActiveCat('all')}>Tất cả đề mục</button>
            {PRODUCT_CATEGORIES.map(c => (
              <button key={c} className={`qs-cat-chip${activeCat === c ? ' active' : ''}`} onClick={() => setActiveCat(c)}>{c}</button>
            ))}
          </div>
        </div>

        <div>
          <div className="qs-filter-title">Thương hiệu</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {PRODUCT_BRANDS.map(b => (
              <label key={b} className="qs-brand-label">
                <input type="checkbox" checked={activeBrands.includes(b)} onChange={e => toggleBrand(b, e.target.checked)} /> {b}
              </label>
            ))}
          </div>
        </div>

        {STATIC_FILTERS.map(f => (
          <div key={f.title}>
            <div className="qs-filter-title">{f.title}</div>
            <div className="qs-chip-wrap">
              {f.options.map(o => <span key={o} className="qs-static-chip">{o}</span>)}
            </div>
          </div>
        ))}

        {['Yêu thích', 'Combo'].map(label => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12.5 }}>{label}</span>
            <div className="qs-toggle"><div /></div>
          </div>
        ))}

        <div>
          <div className="qs-filter-title">Khoảng giá</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="text" className="qs-price-input" placeholder="Giá từ" />
            <span style={{ color: 'var(--text-muted)' }}>—</span>
            <input type="text" className="qs-price-input" placeholder="Tới" />
          </div>
        </div>

        {/* "Xong" ở bản HTML chỉ vẽ lại danh sách — bộ lọc ở đây đã áp dụng ngay khi chọn */}
        <button style={{ border: 'none', cursor: 'pointer', background: 'var(--qs)', color: '#fff', padding: 9, borderRadius: 9, fontSize: 13, fontWeight: 700 }}>Xong</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{filtered.length} sản phẩm phù hợp</span>
        </div>
        <div className="qs-product-grid">
          {filtered.map(p => <ProductCard key={p.name} p={p} />)}
        </div>
      </div>
    </>
  )
}
