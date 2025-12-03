import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

/**
 * IDE 风格按钮组件
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const variantStyles: Record<ButtonVariant, string> = {
      primary: `
        bg-[var(--accent-primary)]
        text-white
        hover:bg-[var(--accent-hover)]
      `,
      secondary: `
        bg-[var(--bg-tertiary)]
        text-[var(--fg-primary)]
        border border-[var(--border-default)]
        hover:bg-[var(--bg-hover)]
      `,
      ghost: `
        bg-transparent
        text-[var(--fg-secondary)]
        hover:bg-[var(--bg-hover)]
        hover:text-[var(--fg-primary)]
      `,
      danger: `
        bg-[var(--error)]
        text-white
        hover:opacity-90
      `,
    }

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-xs',
      lg: 'px-4 py-2 text-sm',
    }

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-1.5
          font-medium
          rounded-[var(--radius-sm)]
          transition-colors duration-100
          focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
