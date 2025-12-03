import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 标签文本 */
  label?: string
  /** 错误信息 */
  error?: string
}

/**
 * Textarea 组件
 * 
 * 一个增强的多行文本输入框，支持标签和错误提示。
 * 使用等宽字体，适合代码输入。
 * 
 * @example
 * ```tsx
 * <Textarea
 *   label="PHP 数组"
 *   placeholder="请输入 PHP 数组..."
 *   value={value}
 *   onChange={handleChange}
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {/* 标签 */}
        {label && (
          <label className="text-sm font-medium text-[var(--fg-secondary)]">
            {label}
          </label>
        )}
        
        {/* 文本框 */}
        <textarea
          ref={ref}
          className={`
            w-full min-h-[200px] p-4
            bg-[var(--bg-secondary)] text-[var(--fg-primary)]
            border border-[var(--border-default)]
            rounded-[var(--radius-lg)]
            font-mono text-sm leading-relaxed
            placeholder:text-[var(--fg-muted)]
            resize-y
            transition-all duration-200
            focus:outline-none focus:border-[var(--accent-start)] focus:ring-1 focus:ring-[var(--accent-start)]/30
            hover:border-[var(--fg-muted)]
            ${error ? 'border-[var(--error)]' : ''}
            ${className}
          `}
          {...props}
        />
        
        {/* 错误提示 */}
        {error && (
          <p className="text-sm text-[var(--error)]">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

