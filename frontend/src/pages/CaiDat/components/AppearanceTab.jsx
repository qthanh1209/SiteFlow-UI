import { useState } from 'react'
import { useThemeContext } from '../../../context/ThemeContext'
import { ACCENTS, FONTS, FONT_SIZES } from '../../../data/caiDatData'
import { cardStyle, titleStyle, descStyle, RowText, ToggleSwitch } from './shared'

const pickCard = { border: '2px solid var(--border)', borderRadius: 12, padding: 14, cursor: 'pointer' }
const cardLabel = { fontSize: 12.5, fontWeight: 600 }
const cardSub = { fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }
const grid = n => ({ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 12 })

/* Viền thẻ đang chọn — HTML gán style.borderColor bằng JS (syncThemeCards / syncUiThemeCards) */
const activeBorder = active => ({ ...pickCard, border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}` })

function Section({ title, desc, titleMb = 4, children }) {
  return (
    <div style={cardStyle}>
      <h3 style={titleStyle(titleMb)}>{title}</h3>
      {desc && <p style={descStyle}>{desc}</p>}
      {children}
    </div>
  )
}

function readSidebarCollapsed() {
  try { return localStorage.getItem('siteflow-sidebar-collapsed') === '1' } catch { return false }
}

/* Tab "Giao diện" — mọi lựa chọn đi qua ThemeContext để toàn app cập nhật ngay */
export default function AppearanceTab() {
  const { theme, toggleTheme, customize, updateCustomize, uiTheme, setUiTheme } = useThemeContext()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed)

  const accent = customize.accent || 'blue'
  const fontFamily = customize.fontFamily || ''
  const fontSize = customize.fontSize || 'medium'
  const density = customize.density || 'comfortable'
  const sidebarPos = customize.sidebarPos || 'left'
  const currentUi = uiTheme || 'default'

  /* Context không có setTheme — chỉ đảo khi khác giá trị đang dùng */
  function setTheme(next) {
    if (theme !== next) toggleTheme()
  }

  /* Giống #toggleSidebar: lưu cờ thu gọn mặc định và xoá mức sidebar đã nhớ */
  function toggleSidebarDefault() {
    const collapsed = !sidebarCollapsed
    setSidebarCollapsed(collapsed)
    try { localStorage.setItem('siteflow-sidebar-collapsed', collapsed ? '1' : '0') } catch { /* bỏ qua */ }
    try { localStorage.removeItem('siteflow-sidebar-level') } catch { /* bỏ qua */ }
  }

  return (
    <>
      <Section title="Chế độ hiển thị" desc="Áp dụng cho toàn bộ giao diện SiteFlow trên trình duyệt này.">
        <div style={grid(2)}>
          <div style={activeBorder(theme === 'light')} onClick={() => setTheme('light')}>
            <div style={{ height: 56, borderRadius: 8, background: '#F3F4F7', border: '1px solid #E2E5EC', marginBottom: 10 }} />
            <div style={cardLabel}>Sáng</div>
          </div>
          <div style={activeBorder(theme === 'dark')} onClick={() => setTheme('dark')}>
            <div style={{ height: 56, borderRadius: 8, background: '#12151C', border: '1px solid #2B303C', marginBottom: 10 }} />
            <div style={cardLabel}>Tối</div>
          </div>
        </div>
      </Section>

      <Section title="Bộ giao diện" desc="Đổi toàn bộ phong cách hiển thị của SiteFlow — áp dụng trên mọi trang.">
        <div style={grid(3)}>
          <div style={activeBorder(currentUi === 'default')} onClick={() => setUiTheme('default')}>
            <div style={{ height: 56, borderRadius: 8, background: 'linear-gradient(135deg, var(--surface-alt), var(--surface))', border: '1px solid var(--border)', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 36, height: 20, borderRadius: 6, background: 'var(--primary)' }} />
            </div>
            <div style={cardLabel}>Mặc định</div>
            <div style={cardSub}>Phẳng, rõ ràng, tối giản</div>
          </div>
          <div style={activeBorder(currentUi === 'glass')} onClick={() => setUiTheme('glass')}>
            <div style={{ height: 56, borderRadius: 8, marginBottom: 10, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #4A7FE0 0%, #8B5CF6 60%, #C084FC 100%)' }}>
              <div style={{ position: 'absolute', inset: 6, borderRadius: 6, background: 'rgba(255,255,255,.22)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.45)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6)' }} />
            </div>
            <div style={cardLabel}>Liquid Glass</div>
            <div style={cardSub}>Kính mờ, ánh sáng phản chiếu</div>
          </div>
          <div style={activeBorder(currentUi === 'super-glass')} onClick={() => setUiTheme('super-glass')}>
            <div style={{ height: 56, borderRadius: 8, marginBottom: 10, position: 'relative', overflow: 'hidden', background: '#eef0f5' }}>
              <div style={{ position: 'absolute', width: 34, height: 34, borderRadius: '50%', background: '#5A96FF', opacity: 0.65, filter: 'blur(10px)', top: -8, left: -6 }} />
              <div style={{ position: 'absolute', width: 30, height: 30, borderRadius: '50%', background: '#BE78FF', opacity: 0.6, filter: 'blur(10px)', top: 6, right: -4 }} />
              <div style={{ position: 'absolute', width: 28, height: 28, borderRadius: '50%', background: '#FF9EC0', opacity: 0.55, filter: 'blur(10px)', bottom: -8, left: 18 }} />
              <div style={{ position: 'absolute', inset: 6, borderRadius: 6, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.5)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.3), inset 0 1px 0 rgba(255,255,255,.7)' }} />
            </div>
            <div style={cardLabel}>Super Liquid Glass</div>
            <div style={cardSub}>Nền mesh gradient, kính siêu mỏng</div>
          </div>
        </div>
      </Section>

      <Section title="Màu chủ đạo" desc="Áp dụng cho nút, tab và trạng thái active trên toàn bộ SiteFlow.">
        <div style={{ display: 'flex', gap: 14 }}>
          {ACCENTS.map(a => (
            <div
              key={a.key}
              className={`cd-accent-swatch${accent === a.key ? ' active' : ''}`}
              style={{ background: a.color }}
              title={a.title}
              onClick={() => updateCustomize({ accent: a.key })}
            />
          ))}
        </div>
      </Section>

      <Section title="Font chữ" desc="Đổi font chữ hiển thị trên toàn bộ SiteFlow.">
        <div style={grid(4)}>
          {FONTS.map(f => (
            <div
              key={f.label}
              className={`cd-font-card${fontFamily === f.font ? ' active' : ''}`}
              style={{ border: '2px solid var(--border)', borderRadius: 12, padding: '12px 8px', cursor: 'pointer', textAlign: 'center' }}
              onClick={() => updateCustomize({ fontFamily: f.font })}
            >
              <div style={{ fontFamily: f.preview, fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Aa</div>
              <div style={{ fontSize: 11.5, fontWeight: 600 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Cỡ chữ" desc="Phóng to/thu nhỏ toàn bộ giao diện — bố cục tự responsive theo cỡ chữ, không chỉ phóng to hình ảnh.">
        <div style={grid(3)}>
          {FONT_SIZES.map(s => (
            <div
              key={s.key}
              className={`cd-fontsize-card${fontSize === s.key ? ' active' : ''}`}
              style={{ ...pickCard, textAlign: 'center' }}
              onClick={() => updateCustomize({ fontSize: s.key })}
            >
              <div style={{ fontWeight: 700, fontSize: s.previewSize, marginBottom: 6 }}>Aa</div>
              <div style={cardLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Mật độ hiển thị" desc="Thu nhỏ khoảng cách & cỡ chữ để xem được nhiều nội dung hơn trên màn hình.">
        <div style={grid(2)}>
          <div className={`cd-density-card${density !== 'compact' ? ' active' : ''}`} style={pickCard} onClick={() => updateCustomize({ density: 'comfortable' })}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ height: 8, borderRadius: 3, background: 'var(--surface-alt)' }} />)}
            </div>
            <div style={cardLabel}>Thoải mái</div>
          </div>
          <div className={`cd-density-card${density === 'compact' ? ' active' : ''}`} style={pickCard} onClick={() => updateCustomize({ density: 'compact' })}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
              {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ height: 5, borderRadius: 2, background: 'var(--surface-alt)' }} />)}
            </div>
            <div style={cardLabel}>Gọn (Compact)</div>
          </div>
        </div>
      </Section>

      <Section title="Sidebar" titleMb={14}>
        <div className="cd-settings-row">
          <RowText title="Vị trí sidebar" desc="Đặt thanh điều hướng bên trái hoặc bên phải màn hình" />
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`cd-sidebar-pos-btn${sidebarPos !== 'right' ? ' active' : ''}`} onClick={() => updateCustomize({ sidebarPos: 'left' })}>Trái</button>
            <button className={`cd-sidebar-pos-btn${sidebarPos === 'right' ? ' active' : ''}`} onClick={() => updateCustomize({ sidebarPos: 'right' })}>Phải</button>
          </div>
        </div>
        <div className="cd-settings-row">
          <RowText title="Thu gọn menu mặc định" desc="Chỉ hiện biểu tượng, ẩn tên mục" />
          <ToggleSwitch on={sidebarCollapsed} onClick={toggleSidebarDefault} />
        </div>
      </Section>
    </>
  )
}
