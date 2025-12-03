import type { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'primary' | 'success' | 'info' | 'purple' | 'warning' | 'error' | 'pk' | 'uq' | 'idx' | 'null' | 'required'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

/**
 * IDE 风格徽章组件 - 等宽字体
 */
export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-[var(--bg-hover)] text-[var(--fg-secondary)]',
    primary: 'bg-[rgba(55,148,255,0.2)] text-[#3794ff] border border-[rgba(55,148,255,0.4)]',
    success: 'bg-[var(--success-bg)] text-[var(--success)]',
    info: 'bg-[rgba(55,148,255,0.15)] text-[#3794ff]',
    purple: 'bg-[rgba(180,126,255,0.15)] text-[#b47eff]',
    warning: 'bg-[var(--warning-bg)] text-[var(--warning)]',
    error: 'bg-[var(--error-bg)] text-[var(--error)]',
    pk: 'bg-[rgba(204,167,0,0.2)] text-[#cca700] border border-[rgba(204,167,0,0.4)]',
    uq: 'bg-[rgba(55,148,255,0.2)] text-[#3794ff] border border-[rgba(55,148,255,0.4)]',
    idx: 'bg-[rgba(134,134,134,0.2)] text-[#868686] border border-[rgba(134,134,134,0.4)]',
    null: 'bg-[rgba(134,134,134,0.15)] text-[#868686]',
    required: 'bg-[var(--error-bg)] text-[var(--error)]',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-1.5 py-0.5
        font-mono text-[10px] font-medium
        rounded-[var(--radius-sm)]
        uppercase tracking-wider
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
}
