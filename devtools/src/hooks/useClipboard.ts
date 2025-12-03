import { useState, useCallback } from 'react'

/**
 * useClipboard Hook 返回值
 */
interface UseClipboardReturn {
  /** 复制文本到剪贴板 */
  copy: (text: string) => Promise<boolean>
  /** 是否刚刚复制成功 (用于显示反馈) */
  copied: boolean
}

/**
 * useClipboard Hook
 * 
 * 提供复制到剪贴板的功能，支持现代 Clipboard API 和降级方案。
 * 
 * @example
 * ```tsx
 * const { copy, copied } = useClipboard()
 * 
 * const handleCopy = async () => {
 *   const success = await copy(text)
 *   if (success) {
 *     // 复制成功
 *   }
 * }
 * 
 * <Button onClick={handleCopy}>
 *   {copied ? '已复制!' : '复制'}
 * </Button>
 * ```
 */
export function useClipboard(): UseClipboardReturn {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      // 优先使用现代 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // 降级方案：使用 textarea + execCommand
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        textarea.style.top = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }

      // 设置复制成功状态
      setCopied(true)
      
      // 2秒后重置状态
      setTimeout(() => {
        setCopied(false)
      }, 2000)

      return true
    } catch (err) {
      console.error('复制失败:', err)
      return false
    }
  }, [])

  return { copy, copied }
}

