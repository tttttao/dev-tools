import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

/**
 * 主题类型
 * - dark: 深色主题
 * - light: 浅色主题
 */
type Theme = 'dark' | 'light'

/**
 * 主题上下文值类型
 */
interface ThemeContextValue {
  /** 当前主题 */
  theme: Theme
  /** 切换主题 */
  toggleTheme: () => void
  /** 设置指定主题 */
  setTheme: (theme: Theme) => void
}

// 创建上下文
const ThemeContext = createContext<ThemeContextValue | null>(null)

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

/**
 * useTheme Hook
 * 
 * 获取当前主题和切换函数。
 * 
 * @example
 * ```tsx
 * const { theme, toggleTheme } = useTheme()
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}

