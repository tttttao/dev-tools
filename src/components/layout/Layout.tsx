import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

/**
 * Layout 组件 - VS Code / Cursor IDE 风格
 * 
 * 三栏布局：Activity Bar + Explorer + Main Area
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div 
      className="h-screen flex overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* 侧边栏 - Activity Bar + Explorer */}
      <Sidebar />
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 主编辑区 */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        
        {/* 状态栏 */}
        <div className="status-bar">
          <div className="status-bar-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
            <span>Ready</span>
          </div>
          <div className="flex-1" />
          <div className="status-bar-item">
            <span>DevTools v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
