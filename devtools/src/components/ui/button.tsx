import { ButtonHTMLAttributes, forwardRef } from 'react'

/**
 * Button 组件变体类型
 * - primary: 主要按钮，使用强调色渐变
 * - secondary: 次要按钮，使用边框样式
 * - ghost: 幽灵按钮，无背景无边框
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost'

/**
 * Button 组件尺寸
 */
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: ButtonVariant
  /** 按钮尺寸 */
  size?: ButtonSize
  /** 是否全宽 */
  fullWidth?: boolean
}

/**
 * 获取变体对应的样式类
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)]
    text-white font-medium
    hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/25
    active:scale-[0.98]
  `,
  secondary: `
    bg-[var(--bg-elevated)] text-[var(--fg-primary)]
    border border-[var(--border-default)]
    hover:bg-[var(--bg-hover)] hover:border-[var(--fg-muted)]
  `,
  ghost: `
    bg-transparent text-[var(--fg-secondary)]
    hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)]
  `,
}

/**
 * 获取尺寸对应的样式类
 */
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-sm)]',
  md: 'px-4 py-2 text-sm rounded-[var(--radius-md)]',
  lg: 'px-6 py-2.5 text-base rounded-[var(--radius-md)]',
}

/**
 * Button 组件
 * 
 * 一个通用的按钮组件，支持多种变体和尺寸。
 * 使用 forwardRef 以支持 ref 传递。
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   提交
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium cursor-pointer
          transition-all duration-200 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

