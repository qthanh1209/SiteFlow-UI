import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

function systemPrefersDark() {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches } catch { return false }
}

export function ThemeProvider({ children }) {
  /* Chế độ người dùng chọn: 'light' | 'dark' | 'system' (theo hệ điều hành).
     Bản cũ chỉ lưu 'siteflow-theme' — nếu có thì coi như người dùng đã chọn cố định sáng/tối. */
  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem('siteflow-theme-mode') || localStorage.getItem('siteflow-theme') || 'system'
    } catch { return 'light' }
  })
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  const [customize, setCustomize] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('siteflow-customize') || '{}')
    } catch { return {} }
  })

  const [uiTheme, setUiTheme] = useState(() => {
    try { return localStorage.getItem('siteflow-ui-theme') || 'default' } catch { return 'default' }
  })

  /* Giao diện thực tế đang áp dụng (các trang chỉ cần biết sáng hay tối) */
  const theme = themeMode === 'system' ? (systemDark ? 'dark' : 'light') : themeMode

  /* Đang ở chế độ "theo hệ thống" thì đổi theo ngay khi hệ điều hành đổi sáng/tối */
  useEffect(() => {
    let mq
    try { mq = window.matchMedia('(prefers-color-scheme: dark)') } catch { return undefined }
    const onChange = e => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('siteflow-theme', theme)
      localStorage.setItem('siteflow-theme-mode', themeMode)
    } catch {}
  }, [theme, themeMode])

  useEffect(() => {
    const c = customize
    const root = document.documentElement
    root.setAttribute('data-accent', c.accent || 'blue')
    root.setAttribute('data-density', c.density || 'comfortable')
    root.setAttribute('data-sidebar-pos', c.sidebarPos || 'left')
    root.setAttribute('data-fontsize', c.fontSize || 'medium')
    root.setAttribute('data-motion', c.motion === 'off' ? 'off' : 'on')
    root.setAttribute('data-mono', c.monoNumbers ? 'on' : 'off')
    root.setAttribute('data-glass', c.glassLevel || 'medium')
    if (c.fontFamily) root.style.setProperty('--app-font', c.fontFamily)
    else root.style.removeProperty('--app-font')
    /* Màu chủ đạo tự chọn (data-accent="custom") — global.css đọc biến này */
    if (c.accent === 'custom' && c.accentCustom) root.style.setProperty('--custom-accent', c.accentCustom)
    else root.style.removeProperty('--custom-accent')
    try { localStorage.setItem('siteflow-customize', JSON.stringify(c)) } catch {}
  }, [customize])

  useEffect(() => {
    document.documentElement.setAttribute('data-ui-theme', uiTheme)
    try { localStorage.setItem('siteflow-ui-theme', uiTheme) } catch {}
  }, [uiTheme])

  function toggleTheme() {
    setThemeMode(theme === 'dark' ? 'light' : 'dark')
  }

  function updateCustomize(patch) {
    setCustomize(prev => ({ ...prev, ...patch }))
  }

  /* Đưa toàn bộ tuỳ chỉnh giao diện về mặc định */
  function resetAppearance() {
    setThemeMode('system')
    setUiTheme('default')
    setCustomize({})
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme, customize, updateCustomize, uiTheme, setUiTheme, resetAppearance }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used inside ThemeProvider')
  return ctx
}
