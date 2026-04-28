import type { ReactNode } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

/**
 * Layout 组件 - VS Code / Cursor IDE 风格
 * 
 * 三栏布局：Activity Bar + Explorer + Main Area (可拖拽调节宽度)
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div 
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* 侧边栏面板 - 默认尺寸，包含最小和最大尺寸限制 */}
        <Panel
          defaultSize={20}
          minSize={15}
          maxSize={40}
          className="flex h-full"
        >
          <Sidebar />
        </Panel>

        {/* 拖拽调整手柄 */}
        <PanelResizeHandle className="w-1 bg-[var(--border-default)] hover:bg-[var(--accent-primary)] cursor-col-resize transition-colors duration-150 delay-75" />

        {/* 主内容区域面板 */}
        <Panel className="flex flex-col h-full overflow-hidden min-w-0">
          <main className="flex-1 overflow-auto bg-[var(--bg-primary)]">
            {children}
          </main>
        </Panel>
      </PanelGroup>

      {/* 状态栏 */}
      <div className="status-bar shrink-0">
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
  )
}
