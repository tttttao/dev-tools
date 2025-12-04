/**
 * 主题类型
 * - dark: 深色主题
 * - light: 浅色主题
 */
export type Theme = 'dark' | 'light'

/**
 * 主题上下文值类型
 */
export interface ThemeContextValue {
  /** 当前主题 */
  theme: Theme
  /** 切换主题 */
  toggleTheme: () => void
  /** 设置指定主题 */
  setTheme: (theme: Theme) => void
}
