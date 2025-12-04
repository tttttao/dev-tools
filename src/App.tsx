import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { PhpJsonConverter } from './pages/PhpJsonConverter'
import { DdlParser } from './pages/DdlParser'
import { JsonDiff } from './pages/JsonDiff'
import { ToastProvider } from './hooks/useToast'
import { ThemeProvider } from './hooks/useTheme'

/**
 * 应用根组件
 * - ThemeProvider: 提供主题切换功能
 * - ToastProvider: 提供全局消息提示功能
 * - Layout: 包含侧边栏导航的主布局
 * - Routes: 定义页面路由
 */
function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Layout>
          <Routes>
            {/* 首页 - 工具列表 */}
            <Route path="/" element={<Home />} />
            
            {/* PHP/JSON 转换器 */}
            <Route path="/php-json" element={<PhpJsonConverter />} />
            
            {/* DDL 解析器 */}
            <Route path="/ddl-parser" element={<DdlParser />} />
            
            {/* JSON 对比工具 */}
            <Route path="/json-diff" element={<JsonDiff />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
