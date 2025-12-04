import { NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

/**
 * 导航项配置
 */
interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  description?: string
}

/**
 * VS Code 风格图标组件
 */
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
)

const ConvertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
)

const DatabaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)

const DiffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M16 3h5v5" />
    <path d="M8 21H3v-5" />
    <path d="M21 3L14 10" />
    <path d="M3 21l7-7" />
  </svg>
)

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
  </svg>
)

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.1s' }}
  >
    <polyline points="9,18 15,12 9,6" />
  </svg>
)

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

/**
 * 工具导航列表
 */
const navItems: NavItem[] = [
  {
    path: '/',
    label: '首页',
    icon: <FileIcon />,
    description: 'index.tsx',
  },
  {
    path: '/php-json',
    label: 'PHP/JSON 转换',
    icon: <FileIcon />,
    description: 'converter.tsx',
  },
  {
    path: '/ddl-parser',
    label: 'DDL 解析器',
    icon: <FileIcon />,
    description: 'parser.tsx',
  },
  {
    path: '/json-diff',
    label: 'JSON 对比',
    icon: <FileIcon />,
    description: 'diff.tsx',
  },
]

/**
 * Activity Bar 图标项 - 带路由
 */
const activityItems = [
  { id: 'home', path: '/', icon: <HomeIcon />, label: '首页' },
  { id: 'convert', path: '/php-json', icon: <ConvertIcon />, label: 'PHP/JSON 转换' },
  { id: 'database', path: '/ddl-parser', icon: <DatabaseIcon />, label: 'DDL 解析器' },
  { id: 'diff', path: '/json-diff', icon: <DiffIcon />, label: 'JSON 对比' },
]

/**
 * Sidebar 组件 - VS Code / Cursor 风格
 */
export function Sidebar() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex h-screen">
      {/* Activity Bar - 左侧图标栏 */}
      <div 
        className="w-12 flex flex-col items-center py-2"
        style={{ background: 'var(--bg-secondary)' }}
      >
        {/* 顶部图标 - 可点击路由 */}
        <div className="flex-1 flex flex-col items-center gap-1">
          {activityItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
            
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`activity-bar-icon ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                {item.icon}
              </NavLink>
            )
          })}
        </div>

        {/* 底部图标 - 主题切换 */}
        <div className="flex flex-col items-center gap-1 pb-2">
          <button
            onClick={toggleTheme}
            className="activity-bar-icon"
            title={`切换到${theme === 'dark' ? '浅色' : '深色'}模式`}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      {/* Explorer - 文件树区域 */}
      <div 
        className="w-52 flex flex-col"
        style={{ 
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-default)'
        }}
      >
        {/* Explorer 标题 */}
        <div 
          className="h-9 px-4 flex items-center text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--fg-secondary)' }}
        >
          资源管理器
        </div>

        {/* 工具文件夹 */}
        <div className="flex-1 overflow-y-auto">
          {/* 文件夹标题 */}
          <div 
            className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--fg-primary)', fontSize: '11px', fontWeight: 500 }}
          >
            <ChevronIcon expanded={true} />
            <span className="uppercase tracking-wider">开发工具箱</span>
          </div>

          {/* 导航菜单 */}
          <nav className="py-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path))
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={`
                    flex items-center gap-2 px-4 py-1 cursor-pointer
                    transition-colors duration-75
                    ${isActive 
                      ? 'tree-item selected' 
                      : 'tree-item'
                    }
                  `}
                  style={{
                    paddingLeft: '24px',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ color: 'var(--fg-secondary)' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
