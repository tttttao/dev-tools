import { Link } from 'react-router-dom'

/**
 * VS Code 风格图标
 */
const LogoIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
)

const ConvertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
)

const DatabaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
)

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6" />
  </svg>
)

/**
 * 工具配置
 */
interface ToolConfig {
  path: string
  icon: React.ReactNode
  title: string
  description?: string
  comingSoon?: boolean
}

const tools: ToolConfig[] = [
  {
    path: '/php-json',
    icon: <ConvertIcon />,
    title: 'PHP/JSON Converter',
    description: '~/code',
  },
  {
    path: '/ddl-parser',
    icon: <DatabaseIcon />,
    title: 'DDL Parser',
    description: '~/code',
  },
  {
    path: '#',
    icon: <ClockIcon />,
    title: 'Timestamp Converter',
    comingSoon: true,
  },
  {
    path: '#',
    icon: <LockIcon />,
    title: 'Base64 Encoder',
    comingSoon: true,
  },
]

/**
 * Home 页面 - Cursor 欢迎页风格
 */
export function Home() {
  const availableTools = tools.filter(t => !t.comingSoon)
  const comingSoonTools = tools.filter(t => t.comingSoon)

  return (
    <div 
      className="h-full flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-lg px-6">
        {/* Logo + 标题 */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4"
            style={{ 
              background: 'var(--bg-tertiary)',
              color: 'var(--accent-primary)'
            }}
          >
            <LogoIcon />
          </div>
          <h1 
            className="text-xl font-medium mb-1"
            style={{ color: 'var(--fg-primary)' }}
          >
            DevTools
          </h1>
          <p 
            className="text-xs"
            style={{ color: 'var(--fg-muted)' }}
          >
            Pro • <span style={{ color: 'var(--accent-primary)' }}>Settings</span>
          </p>
        </div>

        {/* 主要操作按钮 */}
        <div className="flex gap-4 mb-10">
          <Link
            to="/php-json"
            className="flex-1 flex items-center gap-3 px-5 py-3.5 rounded transition-colors"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-default)',
              color: 'var(--fg-primary)',
              textDecoration: 'none',
            }}
          >
            <ConvertIcon />
            <span className="text-sm">PHP/JSON</span>
          </Link>
          <Link
            to="/ddl-parser"
            className="flex-1 flex items-center gap-3 px-5 py-3.5 rounded transition-colors"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-default)',
              color: 'var(--fg-primary)',
              textDecoration: 'none',
            }}
          >
            <DatabaseIcon />
            <span className="text-sm">DDL Parser</span>
          </Link>
        </div>

        {/* 可用工具列表 */}
        <div className="mb-6">
          <div 
            className="flex items-center justify-between mb-2 px-1"
          >
            <span 
              className="text-xs"
              style={{ color: 'var(--fg-muted)' }}
            >
              Available tools
            </span>
            <span 
              className="text-xs"
              style={{ color: 'var(--fg-muted)' }}
            >
              View all ({tools.length})
            </span>
          </div>
          
          <div className="space-y-0.5">
            {availableTools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="flex items-center justify-between px-3 py-2.5 rounded transition-colors hover:bg-[var(--bg-hover)]"
                style={{
                  color: 'var(--fg-primary)',
                  textDecoration: 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: 'var(--fg-secondary)' }}>{tool.icon}</span>
                  <span className="text-sm">{tool.title}</span>
                </div>
                <span 
                  className="text-xs"
                  style={{ color: 'var(--fg-muted)' }}
                >
                  {tool.description}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* 即将推出 */}
        {comingSoonTools.length > 0 && (
          <div>
            <div 
              className="flex items-center justify-between mb-2 px-1"
            >
              <span 
                className="text-xs"
                style={{ color: 'var(--fg-muted)' }}
              >
                Coming soon
              </span>
            </div>
            
            <div className="space-y-0.5">
              {comingSoonTools.map((tool, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2.5 rounded opacity-50"
                  style={{ color: 'var(--fg-secondary)' }}
                >
                  <div className="flex items-center gap-3">
                    <span>{tool.icon}</span>
                    <span className="text-sm">{tool.title}</span>
                  </div>
                  <ChevronRightIcon />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
