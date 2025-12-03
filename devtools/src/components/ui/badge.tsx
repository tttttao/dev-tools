import { HTMLAttributes, ReactNode } from 'react'

/**
 * Badge 变体类型
 * - default: 默认样式
 * - primary: 主键索引 (金色)
 * - success: 唯一索引 (绿色)
 * - info: 普通索引 (蓝色)
 * - purple: 全文索引 (紫色)
 * - warning: 警告 (橙色)
 * - error: 错误 (红色)
 */
type BadgeVariant = 'default' | 'primary' | 'success' | 'info' | 'purple' | 'warning' | 'error'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** 变体 */
  variant?: BadgeVariant
  /** 内容 */
  children: ReactNode
}

/**
 * 变体对应的样式
 */
const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-hover)] text-[var(--fg-secondary)]',
  primary: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30',
  success: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/30',
  info: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30',
  purple: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-400 border border-purple-500/30',
  warning: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30',
  error: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/30',
}

/**
 * Badge 组件
 * 
 * 用于显示标签、状态或索引类型的小徽章。
 * 
 * @example
 * ```tsx
 * <Badge variant="primary">🔑 主键</Badge>
 * <Badge variant="success">🎯 唯一</Badge>
 * ```
 */
export function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5
        text-xs font-medium
        rounded-full
        whitespace-nowrap
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
}

