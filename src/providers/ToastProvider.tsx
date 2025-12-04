import type { ReactNode } from 'react'
import React, { useState, useCallback } from 'react'
import { ToastContext } from '../contexts/ToastContext'
import { CheckIcon, ErrorIcon, InfoIcon, CloseIcon } from '../utils/toast-utils'
import type { Toast, ToastType } from '../utils/toast-utils'

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
 * Toast 容器组件 - VS Code 通知风格
 */
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div 
      className="fixed z-50 flex flex-col gap-2"
      style={{ 
        bottom: '36px', // 状态栏上方
        right: '16px',
        maxWidth: '320px' 
      }}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

/**
 * 单个 Toast 组件 - VS Code 通知风格
 */
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  // 类型对应的样式
  const typeConfig: Record<ToastType, { bg: string; border: string; iconColor: string; icon: React.ReactNode }> = {
    success: {
      bg: '#1e1e1e',
      border: '#89d185',
      iconColor: '#89d185',
      icon: <CheckIcon />
    },
    error: {
      bg: '#1e1e1e',
      border: '#f14c4c',
      iconColor: '#f14c4c',
      icon: <ErrorIcon />
    },
    info: {
      bg: '#1e1e1e',
      border: '#3794ff',
      iconColor: '#3794ff',
      icon: <InfoIcon />
    },
  }

  const config = typeConfig[toast.type]

  return (
    <div
      className="animate-slide-in"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '10px 12px',
        background: config.bg,
        borderLeft: `3px solid ${config.border}`,
        borderRadius: '0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        fontSize: '12px',
        color: '#e6e6e6',
        minWidth: '280px',
      }}
      role="alert"
    >
      {/* 图标 */}
      <span 
        style={{ 
          color: config.iconColor,
          flexShrink: 0,
          marginTop: '1px'
        }}
      >
        {config.icon}
      </span>
      
      {/* 消息 */}
      <p style={{ flex: 1, margin: 0, lineHeight: '1.4' }}>
        {toast.message}
      </p>
      
      {/* 关闭按钮 */}
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '2px',
          cursor: 'pointer',
          color: '#858585',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '3px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#2a2d2e'
          e.currentTarget.style.color = '#e6e6e6'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#858585'
        }}
        aria-label="关闭"
      >
        <CloseIcon />
      </button>
    </div>
  )
}
