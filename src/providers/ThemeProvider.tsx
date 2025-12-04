import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'
import type { Theme } from '../utils/theme-utils'

// localStorage 键名
const THEME_STORAGE_KEY = 'devtools-theme'

/**
 * 获取初始主题
 * 优先从 localStorage 读取，否则默认深色主题
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  
  // 默认深色主题（开发者工具风格）
  return 'dark'
}

/**
 * ThemeProvider 组件
 * 
 * 提供主题切换功能的上下文提供者。
 * 主题状态会持久化到 localStorage。
 * 
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  // 应用主题到 DOM
  useEffect(() => {
    const root = document.documentElement
    
    // 设置 data-theme 属性
    root.setAttribute('data-theme', theme)
    
    // 持久化到 localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  // 切换主题
  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark')
  }

  // 设置指定主题
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
