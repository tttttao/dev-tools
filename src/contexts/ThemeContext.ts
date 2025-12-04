import { createContext } from 'react'
import type { ThemeContextValue } from '../utils/theme-utils'

// 创建上下文
export const ThemeContext = createContext<ThemeContextValue | null>(null)
