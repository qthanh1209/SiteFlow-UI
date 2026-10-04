import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useSidebar } from '../../hooks/useSidebar'
import { NAV_MAIN, NAV_BOTTOM } from '../../data/navigation'

function NavIcon({ pathData }) {
  return (
    <svg
      width="17" height="17" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{ flex: 'none' }}
      dangerouslySetInnerHTML={{ __html: pathData }}
    />
  )
}

function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => 'sidebar-nav-item' + (isActive ? ' active' : '')}
      style={collapsed ? { justifyContent: 'center', padding: '10px 0' } : undefined}
    >
      <NavIcon pathData={item.icon} />
      {!collapsed && <span className="nav-label" style={{ flex: 1, fontSize: '13px' }}>{item.label}</span>}
      {item.badge && !collapsed && (
        <span style={{
          background: 'var(--danger, #ff4d4f)', color: '#fff',
          fontSize: '10px', fontWeight: 700,
          padding: '1px 6px', borderRadius: '20px', flex: 'none',
        }}>
          {item.badge}
        </span>
      )}
      {item.badge && collapsed && (
        <span style={{
          position: 'absolute', top: 6, right: 6,
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--danger, #ff4d4f)', border: '1.5px solid #12161F',
        }} />
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { toggleTheme } = useTheme()
  // Lấy các hàm điều khiển từ hook (có hỗ trợ expand nếu hook của bạn có)
  const sidebarControls = useSidebar()
  const { level, cycle, collapse } = sidebarControls
  const expand = sidebarControls.expand || cycle // Sử dụng expand nếu có, không thì cycle về trạng thái mở

  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const flyoutRef = useRef(null)

  const isCollapsed = level === 'icons'
  const isUltra = level === 'logo'

  useEffect(() => {
    function handleClick(e) {
      if (flyoutOpen && flyoutRef.current && !flyoutRef.current.contains(e.target)) {
        setFlyoutOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [flyoutOpen])

  const width = isUltra ? 60 : isCollapsed ? 76 : 232

  return (
    <>
      <style>{`
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 10px 9px 13px;
          border-radius: 9px;
          color: #AEB4C2;
          text-decoration: none;
          font-weight: 400;
          font-size: 13px;
          position: relative;
          border-left: 3px solid transparent;
          transition: background 0.13s, color 0.13s;
        }
        .sidebar-nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }
        .sidebar-nav-item.active {
          background: rgba(47,93,168,0.38);
          color: #fff;
          font-weight: 600;
          border-left-color: var(--primary, #2F5DA8);
        }
        .sidebar-divider {
          height: 1px;
          background: #262B37;
          margin: 8px 0;
        }
      `}</style>

      <div
        id="appSidebar"
        style={{
          width, flex: 'none', background: '#12161F', color: '#AEB4C2',
          display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box', padding: '20px 10px',
          transition: 'width .18s ease', overflow: 'hidden',
        }}
      >
        {/* Brand & Toggle Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: (isCollapsed || isUltra) ? 'column' : 'row',
          alignItems: 'center',
          gap: 10,
          padding: isCollapsed || isUltra ? '0 0 16px' : '0 4px 22px',
          justifyContent: isCollapsed || isUltra ? 'center' : 'space-between',
        }}>
          {/* Logo Icon */}
          <div
            onClick={() => {
              if (isUltra) setFlyoutOpen(f => !f)
              else if (isCollapsed) expand()
            }}
            title={isCollapsed || isUltra ? "Click để mở rộng" : "Dezon"}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--primary, #2F5DA8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flex: 'none', cursor: isCollapsed || isUltra ? 'pointer' : 'default',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z"/>
              <circle cx="12" cy="9" r="2.3"/>
            </svg>
          </div>

          {/* Khi đang mở rộng: Hiện tên và 2 nút thu gọn */}
          {!isCollapsed && !isUltra && (
            <>
              <span style={{ fontWeight: 700, fontSize: 17, color: '#fff', flex: 1, whiteSpace: 'nowrap' }}>Dezon</span>
              
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={collapse}
                  title="Thu gọn tối đa (chỉ còn logo)"
                  style={{
                    width: 24, height: 24, borderRadius: 6,
                    border: '1px solid #262B37', background: 'transparent',
                    color: '#AEB4C2', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', flex: 'none',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </button>

                <button
                  onClick={cycle}
                  title="Thu gọn menu"
                  style={{
                    width: 24, height: 24, borderRadius: 6,
                    border: '1px solid #262B37', background: 'transparent',
                    color: '#AEB4C2', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', flex: 'none',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* NÚT MỞ RỘNG KHI ĐANG THU GỌN (Hiện ở cả chế độ icons lẫn logo) */}
          {(isCollapsed || isUltra) && (
            <button
              onClick={() => {
                setFlyoutOpen(false)
                expand()
              }}
              title="Mở rộng sidebar"
              style={{
                width: 26, height: 26, borderRadius: 6,
                border: '1px solid #262B37', background: 'rgba(255,255,255,0.06)',
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', flex: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          )}
        </div>

        {/* Main nav */}
        {!isUltra && (
          // Màn hình thấp (laptop, cỡ chữ lớn): menu tự cuộn thay vì bị cắt mất các mục cuối
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
            {NAV_MAIN.map(item => (
              <NavItem key={item.path} item={item} collapsed={isCollapsed} />
            ))}

            <div className="sidebar-divider" style={{ margin: '10px 0 6px' }} />

            {NAV_BOTTOM.map(item => (
              <NavItem key={item.path} item={item} collapsed={isCollapsed} />
            ))}
          </nav>
        )}

        {isUltra && <div style={{ flex: 1 }} />}

        {/* User Profile */}
        {!isUltra && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 6px 0', marginTop: 8, flex: 'none',
            borderTop: '1px solid #262B37',
            justifyContent: isCollapsed ? 'center' : undefined,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#2A3040', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontSize: '12.5px', flex: 'none',
            }}>TA</div>
            {!isCollapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>Trần Anh</div>
                <div style={{ color: '#7C8399', fontSize: 11.5, whiteSpace: 'nowrap' }}>Quản lý dự án</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Flyout (ultra-collapsed) */}
      {isUltra && flyoutOpen && (
        <div
          ref={flyoutRef}
          style={{
            position: 'fixed', top: 0, left: 60, height: '100vh',
            width: 232, background: '#12161F', color: '#AEB4C2',
            display: 'flex', flexDirection: 'column',
            padding: '20px 10px', zIndex: 200,
            boxShadow: '8px 0 24px rgba(0,0,0,.35)',
          }}
        >
          {/* Header của flyout có nút mở rộng hẳn sidebar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 16px' }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Dezon</span>
            <button
              onClick={() => {
                setFlyoutOpen(false)
                expand()
              }}
              title="Ghim mở rộng sidebar"
              style={{
                border: '1px solid #262B37', background: 'transparent',
                color: '#AEB4C2', borderRadius: 4, padding: '2px 6px',
                fontSize: 11, cursor: 'pointer',
              }}
            >
              Mở rộng ➔
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
            {NAV_MAIN.map(item => <NavItem key={item.path} item={item} collapsed={false} />)}
            <div className="sidebar-divider" style={{ margin: '10px 0 6px' }} />
            {NAV_BOTTOM.map(item => <NavItem key={item.path} item={item} collapsed={false} />)}
          </nav>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 6px 0', borderTop: '1px solid #262B37' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2A3040', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '12.5px', flex: 'none' }}>TA</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>Trần Anh</div>
              <div style={{ color: '#7C8399', fontSize: 11.5 }}>Quản lý dự án</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}