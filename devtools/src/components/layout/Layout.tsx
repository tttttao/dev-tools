import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

/**
 * Layout 组件
 * 
 * 应用的主布局组件，包含侧边栏和主内容区域。
 * 
 * @example
 * ```tsx
 * <Layout>
 *   <Routes>
 *     <Route path="/" element={<Home />} />
 *   </Routes>
 * </Layout>
 * ```
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* 侧边栏 - fixed 定位，宽度 256px */}
      <Sidebar />
      
      {/* 主内容区域 - 使用内联样式确保左边距正确 */}
      <div style={{ marginLeft: '256px' }}>
        <main className="min-h-screen p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

