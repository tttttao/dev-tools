import { NavLink } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

/**
 * 导航项配置
 */
interface NavItem {
  /** 路由路径 */
  path: string
  /** 显示名称 */
  label: string
  /** 图标 (emoji) */
  icon: string
  /** 描述 */
  description?: string
}

/**
 * 工具导航列表
 * 添加新工具时，只需在这里添加配置即可
 */
const navItems: NavItem[] = [
  {
    path: '/',
    label: '首页',
    icon: '🏠',
    description: '工具总览',
  },
  {
    path: '/php-json',
    label: 'PHP/JSON 转换',
    icon: '🔄',
    description: '格式互转',
  },
  {
    path: '/ddl-parser',
    label: 'DDL 解析器',
    icon: '📋',
    description: '表结构解析',
  },
]

/**
 * Sidebar 组件
 * 
 * 侧边栏导航，包含 Logo、导航菜单和主题切换。
 * 支持响应式设计，移动端可折叠。
 */
export function Sidebar() {
  return (
    <aside className="
      w-64 h-screen
      flex flex-col
      bg-[var(--bg-secondary)]
      border-r border-[var(--border-default)]
      fixed left-0 top-0
      z-40
    ">
      {/* Logo 区域 */}
      <div className="
        h-16 px-5
        flex items-center gap-3
        border-b border-[var(--border-subtle)]
      ">
        <div className="
          w-9 h-9
          flex items-center justify-center
          bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)]
          rounded-[var(--radius-md)]
          text-lg
        ">
          🛠️
        </div>
        <div>
          <h1 className="text-base font-semibold text-[var(--fg-primary)]">
            开发工具箱
          </h1>
          <p className="text-xs text-[var(--fg-muted)]">DevTools</p>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `
                  flex items-center gap-3
                  px-3 py-2.5
                  rounded-[var(--radius-md)]
                  transition-all duration-200
                  group
                  ${isActive
                    ? 'bg-gradient-to-r from-[var(--accent-start)]/20 to-[var(--accent-end)]/10 text-[var(--fg-primary)] border border-[var(--accent-start)]/30'
                    : 'text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)]'
                  }
                `}
              >
                {/* 图标 */}
                <span className="text-lg">{item.icon}</span>
                
                {/* 文字 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-[var(--fg-muted)] truncate">
                      {item.description}
                    </div>
                  )}
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* 底部区域 */}
      <div className="
        p-4
        border-t border-[var(--border-subtle)]
        flex items-center justify-between
      ">
        <span className="text-xs text-[var(--fg-muted)]">
          v1.0.0
        </span>
        <ThemeToggle />
      </div>
    </aside>
  )
}

