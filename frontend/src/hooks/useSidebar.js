import { useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useSidebar() {
  const LEVELS = ['full', 'icons', 'logo']

  const [level, setLevel] = useLocalStorage('siteflow-sidebar-level', 'full')
  const [dir, setDir] = useState(level === 'logo' ? -1 : 1)

  function cycle() {
    setLevel(prev => {
      const idx = LEVELS.indexOf(prev) + dir
      const clamped = Math.max(0, Math.min(LEVELS.length - 1, idx))
      if (clamped >= LEVELS.length - 1) setDir(-1)
      if (clamped <= 0) setDir(1)
      return LEVELS[clamped]
    })
  }

  function collapse() {
    setLevel('logo')
    setDir(-1)
  }

  function expand() {
    setLevel('full')
    setDir(1)
  }

  return { level, cycle, collapse, expand }
}
