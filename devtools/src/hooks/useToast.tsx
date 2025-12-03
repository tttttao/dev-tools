import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

/**
 * Toast 类型
 */
type ToastType = 'success' | 'error' | 'info'

/**
 * Toast 数据结构
 */
interface Toast {
  id: string
  message: string
  type: ToastType
}

/**
 * Toast 上下文值类型
 */
interface ToastContextValue {
  /** 当前显示的 toasts */
  toasts: Toast[]
  /** 显示成功消息 */
  success: (message: string) => void
  /** 显示错误消息 */
  error: (message: string) => void
  /** 显示信息消息 */
  info: (message: string) => void
  /** 移除指定 toast */
  removeToast: (id: string) => void
}

// 创建上下文
const ToastContext = createContext<ToastContextValue | null>(null)

// Toast 显示时长 (ms)
const TOAST_DURATION = 3000

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * ToastProvider 组件
 * 
 * 提供全局消息提示功能的上下文提供者。
 * 
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  // 添加 toast
  const addToast = useCallback((message: string, type: ToastType) => {
    const id = generateId()
    
    setToasts(prev => [...prev, { id, message, type }])
    
    // 自动移除
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, TOAST_DURATION)
  }, [])

  // 移除 toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // 快捷方法
  const success = useCallback((message: string) => addToast(message, 'success'), [addToast])
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast])
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast])

  return (
    <ToastContext.Provider value={{ toasts, success, error, info, removeToast }}>
      {children}
      
      {/* Toast 容器 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * Toast 容器组件
 */
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

/**
 * 单个 Toast 组件
 */
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  // 类型对应的样式
  const typeStyles: Record<ToastType, string> = {
    success: 'bg-[var(--success-bg)] border-[var(--success)] text-[var(--success)]',
    error: 'bg-[var(--error-bg)] border-[var(--error)] text-[var(--error)]',
    info: 'bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--fg-primary)]',
  }

  // 类型对应的图标
  const typeIcons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }

  return (
    <div
      className={`
        flex items-center gap-3
        px-4 py-3
        min-w-[280px] max-w-[400px]
        border rounded-[var(--radius-lg)]
        shadow-[var(--shadow-lg)]
        animate-slide-in
        ${typeStyles[toast.type]}
      `}
      role="alert"
    >
      {/* 图标 */}
      <span className="text-lg font-bold">{typeIcons[toast.type]}</span>
      
      {/* 消息 */}
      <p className="flex-1 text-sm">{toast.message}</p>
      
      {/* 关闭按钮 */}
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current opacity-60 hover:opacity-100 transition-opacity"
        aria-label="关闭"
      >
        ✕
      </button>
    </div>
  )
}

/**
 * useToast Hook
 * 
 * 获取消息提示功能。
 * 
 * @example
 * ```tsx
 * const { success, error } = useToast()
 * 
 * success('操作成功！')
 * error('操作失败：' + err.message)
 * ```
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  
  return context
}

