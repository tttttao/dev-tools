import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * IDE 风格卡片组件
 */
export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--bg-tertiary)]
        border border-[var(--border-default)]
        rounded-[var(--radius-md)]
        overflow-hidden
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  iconClassName?: string
}

/**
 * IDE 风格卡片头部
 */
export function CardHeader({ icon, title, description, action, iconClassName = '' }: CardHeaderProps) {
  return (
    <div 
      className="px-4 py-3 flex items-center justify-between"
      style={{ 
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-default)'
      }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div 
            className={`
              w-8 h-8
              flex items-center justify-center
              bg-[var(--bg-tertiary)]
              rounded-[var(--radius-sm)]
              text-base
              ${iconClassName}
            `}
          >
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-sm font-medium text-[var(--fg-primary)]">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-[var(--fg-secondary)] mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  )
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * IDE 风格卡片内容
 */
export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div 
      className={`p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
