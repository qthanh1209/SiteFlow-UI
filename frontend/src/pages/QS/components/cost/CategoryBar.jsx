import { useEffect, useRef } from 'react'
import Icon from '../../../../components/ui/Icon'

/* Thanh ngữ cảnh dùng chung cho các tab Chi phí / Mua hàng / Dự án (một hàng):
   chip hạng mục đã bóc · ô tìm (Ctrl K) · chuyển Bảng tính / Bảng thường (nếu có onView) · nút riêng của tab · Xuất báo giá */
export default function CategoryBar({ categories, catCode, onCat, liveCount, q, onQ, view, onView, onExport, children }) {
  const searchRef = useRef(null)

  /* Ctrl+K: nhảy tới ô tìm kiếm (chỉ khi tab chứa thanh này đang hiện) */
  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && searchRef.current && searchRef.current.offsetParent !== null) {
        e.preventDefault()
        searchRef.current.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="qs-card qs-cbar">
      <span className="qs-cbar-label">Hạng mục</span>
      <div className="qs-ct-cats">
        {categories.map(c => (
          <button key={c.code} className={`qs-ct-cat-chip${c.code === catCode ? ' on' : ''}`} onClick={() => onCat(c.code)}>
            <small>{c.code}</small>{c.name}
            {(c.live || c.count) && <span>{c.live ? liveCount : c.count}</span>}
          </button>
        ))}
      </div>
      <div className="qs-ct-search qs-cbar-search">
        <Icon name="search" size={15} />
        <input ref={searchRef} value={q} onChange={e => onQ(e.target.value)} placeholder="Tìm tên · mã · thương hiệu · phòng…" />
        <kbd>Ctrl K</kbd>
      </div>
      {onView && (
        <div className="qs-bd-seg">
          <button className={view === 'sheet' ? 'on' : ''} title="Bảng tính" onClick={() => onView('sheet')}><Icon name="table" size={15} />Bảng tính</button>
          <button className={view === 'plain' ? 'on' : ''} title="Bảng thường" onClick={() => onView('plain')}><Icon name="listLines" size={15} />Bảng thường</button>
        </div>
      )}
      {children}
      <button className="qs-ct-btn primary" onClick={onExport}><Icon name="fileText" size={14} />Xuất báo giá</button>
    </div>
  )
}
