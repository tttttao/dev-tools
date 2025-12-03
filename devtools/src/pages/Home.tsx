import { Link } from 'react-router-dom'

/**
 * 工具卡片配置
 */
interface ToolCardConfig {
  /** 路由路径 */
  path: string
  /** 图标 (emoji) */
  icon: string
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 标签 */
  tags?: string[]
}

/**
 * 工具列表配置
 * 添加新工具时，在这里添加配置即可
 */
const tools: ToolCardConfig[] = [
  {
    path: '/php-json',
    icon: '🔄',
    title: 'PHP数组 ⇄ JSON 转换器',
    description: '快速在 PHP 数组格式和 JSON 格式之间进行转换，支持嵌套结构和各种数据类型。',
    tags: ['PHP', 'JSON', '格式转换'],
  },
  {
    path: '/ddl-parser',
    icon: '📋',
    title: 'DDL 解析器',
    description: '解析 MySQL DDL 语句（CREATE TABLE / CREATE INDEX），生成清晰的表格展示字段信息和索引关系。',
    tags: ['MySQL', 'DDL', '数据库'],
  },
  // 预留扩展位置 - 添加新工具只需在这里添加配置
  {
    path: '#',
    icon: '⏰',
    title: '时间戳转换器',
    description: '在 Unix 时间戳和可读日期格式之间进行转换，支持多种时区。',
    tags: ['时间', '转换', '即将推出'],
  },
  {
    path: '#',
    icon: '🔐',
    title: 'Base64 编解码',
    description: '对文本进行 Base64 编码和解码，支持 URL 安全模式。',
    tags: ['编码', '解码', '即将推出'],
  },
]

/**
 * Home 页面组件
 * 
 * 首页展示所有可用工具的卡片列表。
 */
export function Home() {
  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <header className="py-8">
        <h1 className="text-3xl font-bold text-[var(--fg-primary)] mb-3 text-center">
          🛠️ 开发工具箱
        </h1>
        <p className="text-[var(--fg-secondary)] text-lg text-center">
          实用的开发小工具集合，提升你的开发效率
        </p>
      </header>

      {/* 工具卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.path + tool.title} {...tool} />
        ))}
      </div>
    </div>
  )
}

/**
 * 工具卡片组件
 */
function ToolCard({ path, icon, title, description, tags }: ToolCardConfig) {
  const isComingSoon = path === '#'

  // 卡片内容
  const cardContent = (
    <>
      {/* 图标 */}
      <div className={`
        w-12 h-12 mb-4
        flex items-center justify-center flex-shrink-0
        rounded-[var(--radius-lg)]
        text-2xl
        transition-transform duration-300
        ${isComingSoon 
          ? 'bg-[var(--bg-hover)]' 
          : 'bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] group-hover:scale-110'
        }
      `}>
        {icon}
      </div>

      {/* 标题 */}
      <h3 className="text-lg font-semibold text-[var(--fg-primary)] mb-2">
        {title}
      </h3>

      {/* 描述 */}
      <p className="text-sm text-[var(--fg-secondary)] mb-4 leading-relaxed">
        {description}
      </p>

      {/* 标签 */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`
                px-2 py-0.5
                text-xs rounded-full
                ${tag === '即将推出'
                  ? 'bg-[var(--warning-bg)] text-[var(--warning)]'
                  : 'bg-[var(--bg-hover)] text-[var(--fg-muted)]'
                }
              `}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  )

  const baseClassName = `
    block p-6
    bg-[var(--bg-elevated)]
    border border-[var(--border-default)]
    rounded-[var(--radius-xl)]
    transition-all duration-300
    group
    ${isComingSoon 
      ? 'opacity-60 cursor-not-allowed' 
      : 'hover:border-[var(--accent-start)]/50 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1'
    }
  `

  if (isComingSoon) {
    return (
      <div className={baseClassName}>
        {cardContent}
      </div>
    )
  }

  return (
    <Link to={path} className={baseClassName}>
      {cardContent}
    </Link>
  )
}

