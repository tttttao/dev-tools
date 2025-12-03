import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

/**
 * 应用入口
 * - StrictMode: 开发环境下启用严格模式，帮助发现潜在问题
 * - BrowserRouter: 使用 HTML5 History API 实现路由
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
