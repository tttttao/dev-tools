import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** 图标 (emoji 或组件) */
  icon?: ReactNode
  /** 标题 */
  title: string
  /** 描述 */
  description?: string
}

/**
 * Card 组件
 * 
 * 一个通用的卡片容器，提供统一的背景、边框和阴影样式。
 * 
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader icon="🔄" title="PHP/JSON 转换器" />
 *   <div>内容区域</div>
 * </Card>
 * ```
 */
export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--bg-elevated)]
        border border-[var(--border-default)]
        rounded-[var(--radius-xl)]
        shadow-[var(--shadow-md)]
        overflow-hidden
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * CardHeader 组件
 * 
 * 卡片头部，包含图标、标题和可选的描述。
 */
export function CardHeader({ icon, title, description, className = '', ...props }: CardHeaderProps) {
  return (
    <div
      className={`
        flex items-center gap-3
        p-5 pb-4
        border-b border-[var(--border-subtle)]
        ${className}
      `}
      {...props}
    >
      {/* 图标容器 */}
      {icon && (
        <div className="
          w-10 h-10
          flex items-center justify-center
          bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)]
          rounded-[var(--radius-md)]
          text-xl
        ">
          {icon}
        </div>
      )}
      
      {/* 标题区域 */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-[var(--fg-primary)]">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * CardContent 组件
 * 
 * 卡片内容区域，提供统一的内边距。
 */
export function CardContent({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  )
}

