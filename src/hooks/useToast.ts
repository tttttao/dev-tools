import { useContext } from 'react'
import { ToastContext } from '../contexts/ToastContext'
import type { ToastContextValue } from '../contexts/ToastContext'

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
