import { useTheme } from '../../hooks/useTheme'

/**
 * ThemeToggle 组件 - IDE 风格
 * 
 * 主题切换按钮，支持深色/浅色模式切换。
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="activity-bar-icon"
      aria-label={`切换到${theme === 'dark' ? '浅色' : '深色'}模式`}
      title={`切换到${theme === 'dark' ? '浅色' : '深色'}模式`}
    >
      {/* 太阳图标 (浅色模式) */}
      <svg
        className={`w-5 h-5 transition-all duration-200 ${
          theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 absolute'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      
      {/* 月亮图标 (深色模式) */}
      <svg
        className={`w-5 h-5 transition-all duration-200 ${
          theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0 absolute'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  )
}
