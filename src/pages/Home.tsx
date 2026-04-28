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
    description: 'Convert between PHP serialization and JSON formats',
  },
  {
    path: '/ddl-parser',
    icon: <DatabaseIcon />,
    title: 'DDL Parser',
    description: 'Parse SQL DDL to various structures',
  },
  {
    path: '/json-diff',
    icon: <ConvertIcon />,
    title: 'JSON Diff',
    description: 'Compare JSON objects and find differences',
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
 * Home 页面 - VS Code 欢迎页风格
 */
export function Home() {
  const availableTools = tools.filter(t => !t.comingSoon)
  const comingSoonTools = tools.filter(t => t.comingSoon)

  return (
    <div 
      className="h-full flex flex-col overflow-auto p-12 lg:p-20"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="max-w-[1200px] w-full">
        {/* Header - Left Aligned */}
        <div className="flex items-center gap-6 mb-16">
          <div 
            className="inline-flex items-center justify-center w-16 h-16"
            style={{ color: 'var(--accent-primary)' }}
          >
            <LogoIcon />
          </div>
          <div className="flex flex-col">
            <h1
              className="text-4xl font-light mb-1"
              style={{ color: 'var(--fg-primary)' }}
            >
              DevTools
            </h1>
            <p
              className="text-sm"
              style={{ color: 'var(--fg-muted)' }}
            >
              Editing evolved
            </p>
          </div>
        </div>

        {/* Layout: Start & Recent (Coming Soon) */}
        <div className="flex flex-col md:flex-row gap-16 md:gap-32">
          {/* Available Tools */}
          <div className="flex-1 max-w-[400px]">
            <h2
              className="text-lg mb-4 font-normal"
              style={{ color: 'var(--fg-primary)' }}
            >
              Start
            </h2>
            
            <div className="flex flex-col gap-1">
              {availableTools.map((tool) => (
                <Link
                  key={tool.title}
                  to={tool.path}
                  className="flex items-start gap-3 px-2 py-2 rounded-md transition-colors hover:bg-[var(--bg-hover)]"
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="mt-0.5"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {tool.icon}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="text-[15px] leading-5"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {tool.title}
                    </span>
                    {tool.description && (
                      <span
                        className="text-[13px] leading-5"
                        style={{ color: 'var(--fg-muted)' }}
                      >
                        {tool.description}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Coming Soon */}
          {comingSoonTools.length > 0 && (
            <div className="flex-1 max-w-[400px]">
              <h2
                className="text-lg mb-4 font-normal"
                style={{ color: 'var(--fg-primary)' }}
              >
                Coming Soon
              </h2>

              <div className="flex flex-col gap-1">
                {comingSoonTools.map((tool, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 px-2 py-2 rounded-md opacity-60"
                  >
                    <div
                      className="mt-0.5"
                      style={{ color: 'var(--fg-secondary)' }}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className="text-[15px] leading-5"
                        style={{ color: 'var(--fg-secondary)' }}
                      >
                        {tool.title}
                      </span>
                      <span
                        className="text-[13px] leading-5"
                        style={{ color: 'var(--fg-muted)' }}
                      >
                        Currently in development
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
