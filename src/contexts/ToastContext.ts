import { createContext } from 'react'
import type { Toast } from '../utils/toast-utils'

/**
 * Toast 上下文值类型
 */
export interface ToastContextValue {
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
export const ToastContext = createContext<ToastContextValue | null>(null)
