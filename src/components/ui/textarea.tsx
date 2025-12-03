import { forwardRef, TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

/**
 * IDE 风格文本输入框组件
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`
          w-full min-h-[200px] p-3
          bg-[var(--bg-primary)] text-[var(--fg-primary)]
          border border-[var(--border-default)]
          rounded-[var(--radius-sm)]
          font-mono text-xs leading-5
          placeholder:text-[var(--fg-muted)]
          resize-y
          transition-colors duration-100
          focus:outline-none focus:border-[var(--accent-primary)]
          hover:border-[var(--fg-muted)]
          ${error ? 'border-[var(--error)]' : ''}
          ${className}
        `}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
