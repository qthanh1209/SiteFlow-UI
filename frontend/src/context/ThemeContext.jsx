import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('siteflow-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    } catch { return 'light' }
  })

  const [customize, setCustomize] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('siteflow-customize') || '{}')
    } catch { return {} }
  })

  const [uiTheme, setUiTheme] = useState(() => {
    try { return localStorage.getItem('siteflow-ui-theme') || 'default' } catch { return 'default' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('siteflow-theme', theme) } catch {}
  }, [theme])

  useEffect(() => {
    const c = customize
    document.documentElement.setAttribute('data-accent', c.accent || 'blue')
    document.documentElement.setAttribute('data-density', c.density || 'comfortable')
    document.documentElement.setAttribute('data-sidebar-pos', c.sidebarPos || 'left')
    document.documentElement.setAttribute('data-fontsize', c.fontSize || 'medium')
    if (c.fontFamily) document.documentElement.style.setProperty('--app-font', c.fontFamily)
    else document.documentElement.style.removeProperty('--app-font')
    try { localStorage.setItem('siteflow-customize', JSON.stringify(c)) } catch {}
  }, [customize])

  useEffect(() => {
    document.documentElement.setAttribute('data-ui-theme', uiTheme)
    try { localStorage.setItem('siteflow-ui-theme', uiTheme) } catch {}
  }, [uiTheme])

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  function updateCustomize(patch) {
    setCustomize(prev => ({ ...prev, ...patch }))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, customize, updateCustomize, uiTheme, setUiTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used inside ThemeProvider')
  return ctx
}
