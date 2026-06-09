import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { BRAND, ThemePalette } from '../config/brand'

type Mode = 'light' | 'dark'

interface ThemeContextValue {
  mode: Mode
  toggle: () => void
  palette: ThemePalette
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyPalette(palette: ThemePalette) {
  const root = document.documentElement
  Object.entries(palette).forEach(([key, value]) => {
    // camelCase -> kebab: bgElevated -> --c-bg-elevated
    const cssVar = '--c-' + key.replace(/([A-Z])/g, '-$1').toLowerCase()
    root.style.setProperty(cssVar, value)
  })
  root.style.setProperty('--font-display', BRAND.fonts.display)
  root.style.setProperty('--font-body', BRAND.fonts.body)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('dark')

  useEffect(() => {
    const palette = mode === 'light' ? BRAND.light : BRAND.dark
    applyPalette(palette)
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  const value: ThemeContextValue = {
    mode,
    toggle: () => setMode(m => (m === 'light' ? 'dark' : 'light')),
    palette: mode === 'light' ? BRAND.light : BRAND.dark,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  return ctx
}
