# 开发工具箱 (DevTools)

一个现代化的开发者工具集合，使用 React + TypeScript + Vite + Tailwind CSS 构建。

## 功能特性

### 已实现的工具

- **PHP/JSON 转换器**: 在 PHP 数组格式和 JSON 格式之间快速转换
  - 支持传统 `array()` 语法和简化 `[]` 语法
  - 支持嵌套数组和关联数组
  - 支持 PHP 特殊值 (true, false, null)

- **DDL 解析器**: 解析 MySQL DDL 语句，生成清晰的表结构展示
  - 支持 CREATE TABLE 语句
  - 支持 CREATE INDEX 语句
  - 显示字段信息、索引关系
  - 支持导出为 Markdown

### 预留扩展

- 时间戳转换器 (即将推出)
- Base64 编解码 (即将推出)

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式**: Tailwind CSS 4
- **路由**: React Router v6
- **UI 风格**: Shadcn/UI 设计理念

## 项目结构

```
devtools/
├── src/
│   ├── components/
│   │   ├── ui/          # 基础 UI 组件 (Button, Textarea, Card, Badge)
│   │   ├── layout/      # 布局组件 (Layout, Sidebar, ThemeToggle)
│   │   └── common/      # 通用业务组件
│   ├── pages/           # 页面组件 (Home, PhpJsonConverter, DdlParser)
│   ├── hooks/           # 自定义 Hooks (useClipboard, useToast, useTheme)
│   ├── lib/             # 工具函数库 (php-parser, ddl-parser)
│   └── types/           # TypeScript 类型定义
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 添加新工具

1. 在 `src/pages/` 目录下创建新的页面组件
2. 在 `src/App.tsx` 中添加路由配置
3. 在 `src/components/layout/Sidebar.tsx` 的 `navItems` 中添加导航项
4. 在 `src/pages/Home.tsx` 的 `tools` 数组中添加工具卡片配置

## 主题支持

项目支持深色/浅色主题切换：
- 默认使用深色主题（开发者工具风格）
- 点击侧边栏底部的主题切换按钮即可切换
- 主题设置会自动保存到 localStorage

## 许可证

MIT
