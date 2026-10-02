import PageShell from '../../components/layout/PageShell'
import { useThemeContext } from '../../context/ThemeContext'

const accentColors = [
  { key: 'blue', label: 'Blue', hex: '#3b82f6' },
  { key: 'purple', label: 'Purple', hex: '#8b5cf6' },
  { key: 'green', label: 'Green', hex: '#22c55e' },
  { key: 'orange', label: 'Orange', hex: '#f97316' },
  { key: 'red', label: 'Red', hex: '#ef4444' },
  { key: 'teal', label: 'Teal', hex: '#14b8a6' },
]

export default function CaiDat() {
  const { theme, setTheme, toggleTheme, customize, updateCustomize, uiTheme, setUiTheme } = useThemeContext()

  const section = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }
  const sectionTitle = { fontSize: '14px', fontWeight: 700, margin: '0 0 14px', color: 'var(--text)' }
  const desc = { fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 14px' }

  function btn(active, onClick, children, style = {}) {
    return (
      <button
        onClick={onClick}
        style={{
          padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          border: active ? '2px solid var(--primary)' : '1.5px solid var(--border)',
          background: active ? 'var(--primary-tint)' : 'var(--surface-alt)',
          color: active ? 'var(--primary)' : 'var(--text)',
          transition: 'all 0.15s',
          ...style,
        }}
      >
        {children}
      </button>
    )
  }

  return (
    <PageShell title="Cài đặt" subtitle="Tùy chỉnh giao diện & workspace">

      {/* Giao diện */}
      <div style={section}>
        <p style={sectionTitle}>Giao diện</p>
        <p style={desc}>Chọn chế độ sáng / tối cho ứng dụng</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {btn(theme === 'light', () => { if (theme !== 'light') toggleTheme() }, '☀️ Sáng')}
          {btn(theme === 'dark', () => { if (theme !== 'dark') toggleTheme() }, '🌙 Tối')}
          {btn(false, () => {
            const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            if (theme !== sys) toggleTheme()
          }, '⚙️ Tự động')}
        </div>
      </div>

      {/* Màu chủ đề */}
      <div style={section}>
        <p style={sectionTitle}>Màu chủ đề (Accent)</p>
        <p style={desc}>Màu nhấn chính cho nút bấm, liên kết và các thành phần tương tác</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {accentColors.map(c => (
            <button
              key={c.key}
              onClick={() => updateCustomize({ accent: c.key })}
              title={c.label}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
                background: c.hex, border: customize.accent === c.key || (!customize.accent && c.key === 'blue')
                  ? `3px solid var(--text)` : '3px solid transparent',
                outline: customize.accent === c.key || (!customize.accent && c.key === 'blue')
                  ? `2px solid ${c.hex}` : 'none',
                transition: 'all 0.15s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Mật độ */}
      <div style={section}>
        <p style={sectionTitle}>Mật độ hiển thị</p>
        <p style={desc}>Điều chỉnh khoảng cách và kích thước giữa các thành phần</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {btn(customize.density === 'comfortable' || !customize.density, () => updateCustomize({ density: 'comfortable' }), 'Thoải mái')}
          {btn(customize.density === 'compact', () => updateCustomize({ density: 'compact' }), 'Gọn gàng')}
        </div>
      </div>

      {/* UI Theme */}
      <div style={section}>
        <p style={sectionTitle}>Phong cách giao diện</p>
        <p style={desc}>Chọn style tổng thể cho toàn bộ ứng dụng</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {btn(uiTheme === 'default' || !uiTheme, () => setUiTheme('default'), 'Default')}
          {btn(uiTheme === 'liquid-glass', () => setUiTheme('liquid-glass'), 'Liquid Glass')}
          {btn(uiTheme === 'super-glass', () => setUiTheme('super-glass'), 'Super Glass')}
        </div>
      </div>

    </PageShell>
  )
}
