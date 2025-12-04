# JSON 对比工具设计说明文档

## 1. 功能概述

JSON 对比工具用于比较两个 JSON 对象/数组的差异，支持两种对比模式：

- **宽松模式 (Loose)**：忽略 Key 顺序，只比较 Key-Value 集合
- **严格模式 (Strict)**：同时校验 Key 顺序，顺序不同视为差异

## 2. 技术架构

### 2.1 文件结构

```
src/
├── types/
│   └── json-diff.ts      # 类型定义
├── lib/
│   ├── json-diff.ts      # 核心算法
│   └── json-diff.test.ts # 测试用例
└── pages/
    └── JsonDiff.tsx      # 页面组件
```

### 2.2 核心类型

```typescript
// 对比模式
type DiffMode = 'strict' | 'loose'

// 差异类型
type DiffType = 'added' | 'removed' | 'modified' | 'unchanged' | 'order_changed'

// 差异项
interface DiffItem {
  path: string           // 差异路径
  type: DiffType         // 差异类型
  oldValue?: JsonValue   // 旧值
  newValue?: JsonValue   // 新值
  oldIndex?: number      // 原始索引（严格模式）
  newIndex?: number      // 新索引（严格模式）
}

// 对比结果
interface DiffResult {
  isEqual: boolean       // 是否相等
  diffs: DiffItem[]      // 差异数组
}
```

### 2.3 核心算法

1. **递归比较**：深度遍历对象和数组
2. **类型检测**：先比较类型，类型不同直接标记为 modified
3. **路径追踪**：使用点号和方括号表示嵌套路径（如 `user.address[0].city`）
4. **顺序检测**：严格模式下额外检测 Key 的相对顺序变化

## 3. UI 设计规范

### 3.1 整体风格

- **主题**：VS Code / Cursor IDE 深色风格
- **布局**：上下分栏（编辑器 + 结果面板）
- **交互**：简洁直观，所有操作一目了然

### 3.2 按钮样式

| 属性 | 值 |
|------|-----|
| 形状 | 矩形（无圆角） |
| 内边距 | 4px 10px |
| 字体大小 | 12px |
| 过渡动画 | 0.15s ease |

```css
.action-btn {
  border-radius: 0;
  padding: 4px 10px;
  font-size: 12px;
  transition: background 0.15s ease;
}
```

### 3.3 开关组件

模式切换使用矩形开关（Toggle Switch）而非圆形 Radio：

```css
/* 矩形开关样式 */
border: 1px solid var(--border-default);
border-radius: 0;
```

选中状态：
- 背景色：`var(--accent-primary)` (#3794ff)
- 文字色：白色

未选中状态：
- 背景色：透明
- 文字色：`var(--fg-secondary)`

### 3.4 差异展示

| 差异类型 | 颜色 | 说明 |
|---------|------|------|
| 新增 (added) | #4ade80 (绿色) | 新 JSON 中新增的属性 |
| 删除 (removed) | #f87171 (红色) | 旧 JSON 中被删除的属性 |
| 修改 (modified) | #fbbf24 (黄色) | 值发生变化的属性 |
| 顺序变化 (order_changed) | #60a5fa (蓝色) | Key 顺序发生变化（仅严格模式） |

### 3.5 字体规范

| 用途 | 字体 | 大小 |
|------|------|------|
| 代码/路径 | JetBrains Mono | 13px |
| 标签文字 | 系统字体 | 12px |
| 差异值 | JetBrains Mono | 13px |

### 3.6 间距规范

| 元素 | 间距 |
|------|------|
| 差异项内边距 | 16px |
| 差异项之间 | 12px |
| 标签与值 | 6px |
| 旧值与新值 | 24px |

## 4. 文案规范

所有按钮和标签统一使用中文：

| 英文 | 中文 |
|------|------|
| Compare | 对比 |
| Clear | 清空 |
| Loose | 宽松 |
| Strict | 严格 |
| Copy | 复制 |
| Old JSON | 旧 JSON |
| New JSON | 新 JSON |
| Diff Result | 差异结果 |

## 5. 测试覆盖

### 5.1 测试用例分类

1. **宽松模式测试** (13 个)
   - 相同对象比较
   - 不同顺序但内容相同
   - 新增/删除/修改属性
   - 嵌套对象比较
   - 数组比较
   - 特殊值处理（null、布尔值、数字）
   - 类型变化检测

2. **严格模式测试** (3 个)
   - 相同顺序比较
   - 顺序变化检测
   - 值修改与顺序变化同时检测

3. **边界情况测试** (5 个)
   - 空对象/空数组
   - 根级别数组
   - 深层嵌套
   - 混合数组和对象

4. **辅助函数测试** (7 个)
   - formatValue
   - getDiffTypeName
   - getDiffTypeColor

### 5.2 运行测试

```bash
# 运行所有测试
npm run test

# 单次运行
npm run test:run
```

## 6. 使用示例

### 6.1 基本使用

```typescript
import { compareJson } from './lib/json-diff'

const oldJson = { name: '张三', age: 25 }
const newJson = { name: '李四', age: 25 }

const result = compareJson(oldJson, newJson, 'loose')

console.log(result.isEqual)  // false
console.log(result.diffs)    // [{ path: 'name', type: 'modified', ... }]
```

### 6.2 严格模式

```typescript
const oldJson = { a: 1, b: 2 }
const newJson = { b: 2, a: 1 }

// 宽松模式 - 相等
compareJson(oldJson, newJson, 'loose').isEqual  // true

// 严格模式 - 不相等（顺序变化）
compareJson(oldJson, newJson, 'strict').isEqual  // false
```

## 7. 后续优化方向

1. **性能优化**：大型 JSON 的对比性能优化
2. **可视化增强**：树形结构展示差异
3. **导出功能**：支持导出差异报告
4. **历史记录**：保存对比历史

