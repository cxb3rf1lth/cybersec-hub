import { useEffect } from 'react'
import { useKVWithFallback } from '@/lib/kv-fallback'

export type ThemeColor = 'red' | 'purple' | 'blue' | 'green'

export interface ThemeConfig {
  id: ThemeColor
  name: string
  colors: {
    primary: string
    primaryForeground: string
    accent: string
    accentForeground: string
    destructive: string
    destructiveForeground: string
    ring: string
  }
}

export const THEME_CONFIGS: Record<ThemeColor, ThemeConfig> = {
  red: {
    id: 'red',
    name: 'Cyberpunk Red',
    colors: {
      primary: 'oklch(0.58 0.22 15)',
      primaryForeground: 'oklch(0.02 0 0)',
      accent: 'oklch(0.72 0.28 15)',
      accentForeground: 'oklch(0.02 0 0)',
      destructive: 'oklch(0.58 0.22 15)',
      destructiveForeground: 'oklch(0.02 0 0)',
      ring: 'oklch(0.72 0.28 15)'
    }
  },
  purple: {
    id: 'purple',
    name: 'Neon Purple',
    colors: {
      primary: 'oklch(0.55 0.25 320)',
      primaryForeground: 'oklch(0.98 0.02 320)',
      accent: 'oklch(0.70 0.30 320)',
      accentForeground: 'oklch(0.02 0 0)',
      destructive: 'oklch(0.58 0.22 15)',
      destructiveForeground: 'oklch(0.02 0 0)',
      ring: 'oklch(0.70 0.30 320)'
    }
  },
  blue: {
    id: 'blue',
    name: 'Electric Blue',
    colors: {
      primary: 'oklch(0.52 0.24 250)',
      primaryForeground: 'oklch(0.98 0.02 250)',
      accent: 'oklch(0.68 0.28 250)',
      accentForeground: 'oklch(0.02 0 0)',
      destructive: 'oklch(0.58 0.22 15)',
      destructiveForeground: 'oklch(0.02 0 0)',
      ring: 'oklch(0.68 0.28 250)'
    }
  },
  green: {
    id: 'green',
    name: 'Matrix Green',
    colors: {
      primary: 'oklch(0.60 0.22 145)',
      primaryForeground: 'oklch(0.02 0 0)',
      accent: 'oklch(0.75 0.26 145)',
      accentForeground: 'oklch(0.02 0 0)',
      destructive: 'oklch(0.58 0.22 15)',
      destructiveForeground: 'oklch(0.02 0 0)',
      ring: 'oklch(0.75 0.26 145)'
    }
  }
}

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useKVWithFallback<ThemeColor>('theme-color', 'red')

  useEffect(() => {
    const theme = THEME_CONFIGS[currentTheme]
    const root = document.documentElement

    // Apply theme colors to CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(`--${cssVar}`, value)
    })
  }, [currentTheme])

  const changeTheme = (theme: ThemeColor) => {
    setCurrentTheme(theme)
  }

  return {
    currentTheme,
    changeTheme,
    availableThemes: Object.values(THEME_CONFIGS)
  }
}