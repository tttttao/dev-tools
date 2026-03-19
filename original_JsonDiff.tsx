import { useState } from 'react'
import { useToast } from '../hooks/useToast'
import { useClipboard } from '../hooks/useClipboard'
import {
  compareJson,
  formatValue,
  getDiffTypeName,
  getDiffTypeColor,
} from '../lib/json-diff'
import type { DiffMode, DiffResult, DiffItem } from '../types/json-diff'

/**
 * VS Code 风格图标
 */
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="0" ry="0" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CompareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 3h5v5" />
    <path d="M8 21H3v-5" />
    <path d="M21 3L14 10" />
    <path d="M3 21l7-7" />
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12" />
  </svg>
)

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

/**
 * 矩形开关组件
 */
function ToggleSwitch({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div
      className="flex"
      style={{ border: '1px solid var(--border-default)' }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            background: value === option.value ? 'var(--accent-primary)' : 'transparent',
            color: value === option.value ? 'white' : 'var(--fg-secondary)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/**
 * 代码编辑器组件
 */
function CodeEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  const lines = value ? value.split('\n') : ['']
  const lineCount = Math.max(lines.length, 12)

  return (
    <div
      className="flex flex-1 overflow-hidden rounded"
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-default)',
      }}
    >
      {/* 行号槽 */}
      <div className="line-numbers" style={{ minWidth: '40px', paddingRight: '8px' }}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* 代码区域 */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 p-2 resize-none focus:outline-none font-mono"
        style={{
          background: 'var(--bg-primary)',
          color: 'var(--fg-primary)',
          fontSize: '12px',
          lineHeight: '20px',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}
        spellCheck={false}
      />
    </div>
  )
}

/**
 * 差异项组件 - 优化后的样式
 */
function DiffItemRow({ item }: { item: DiffItem }) {
  const color = getDiffTypeColor(item.type)
  const typeName = getDiffTypeName(item.type)

  // 删除和新增类型：单行显示
  if (item.type === 'removed' || item.type === 'added') {
    const value = item.type === 'removed' ? item.oldValue : item.newValue
    return (
      <div
        className="mb-3 p-4"
        style={{
          background: 'var(--bg-secondary)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 500,
              background: color + '25',
              color: color,
              flexShrink: 0,
            }}
          >
            {typeName}
          </span>
          <code
            style={{
              fontSize: '13px',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              color: 'var(--fg-primary)',
              flexShrink: 0,
            }}
          >
            {item.path}
          </code>
          <pre
            style={{
              padding: '4px 10px',
              background: 'var(--bg-tertiary)',
              color: color,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '13px',
              lineHeight: '1.5',
              overflow: 'auto',
              maxHeight: '100px',
              margin: 0,
              flex: 1,
              minWidth: 0,
            }}
          >
            {formatValue(value)}
          </pre>
        </div>
      </div>
    )
  }

  // 顺序变化类型：单行显示
  if (item.type === 'order_changed') {
    return (
      <div
        className="mb-3 p-4"
        style={{
          background: 'var(--bg-secondary)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 500,
              background: color + '25',
              color: color,
            }}
          >
            {typeName}
          </span>
          <code
            style={{
              fontSize: '13px',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              color: 'var(--fg-primary)'
            }}
          >
            {item.path}
          </code>
          <span style={{ fontSize: '12px', color: 'var(--fg-secondary)' }}>
            (索引: {item.oldIndex} → {item.newIndex})
          </span>
        </div>
      </div>
    )
  }

  // 修改类型：双列对比布局
  return (
    <div
      className="mb-3 p-4"
      style={{
        background: 'var(--bg-secondary)',
      }}
    >
      {/* 路径和类型 */}
      <div className="flex items-center gap-3 mb-3">
        <span
          style={{
            padding: '2px 8px',
            fontSize: '12px',
            fontWeight: 500,
            background: color + '25',
            color: color,
          }}
        >
          {typeName}
        </span>
        <code
          style={{
            fontSize: '13px',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            color: 'var(--fg-primary)'
          }}
        >
          {item.path}
        </code>
      </div>

      {/* 值对比 */}
      <div className="flex gap-6">
        {item.oldValue !== undefined && (
          <div className="flex-1 min-w-0">
            <div style={{ color: 'var(--fg-secondary)', fontSize: '12px', marginBottom: '6px' }}>
              旧值
            </div>
            <pre
              style={{
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                color: '#f87171',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '13px',
                lineHeight: '1.5',
                overflow: 'auto',
                maxHeight: '150px',
                margin: 0,
              }}
            >
              {formatValue(item.oldValue)}
            </pre>
          </div>
        )}
        {item.newValue !== undefined && (
          <div className="flex-1 min-w-0">
            <div style={{ color: 'var(--fg-secondary)', fontSize: '12px', marginBottom: '6px' }}>
              新值
            </div>
            <pre
              style={{
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                color: '#4ade80',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '13px',
                lineHeight: '1.5',
                overflow: 'auto',
                maxHeight: '150px',
                margin: 0,
              }}
            >
              {formatValue(item.newValue)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 差异结果面板
 */
function DiffResultPanel({ result }: { result: DiffResult | null }) {
  if (!result) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ color: 'var(--fg-secondary)' }}
      >
        <span style={{ fontSize: '13px' }}>点击「对比」按钮查看差异</span>
      </div>
    )
  }

  if (result.isEqual) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div
          className="flex items-center justify-center"
          style={{
            width: '48px',
            height: '48px',
            background: '#4ade8020',
          }}
        >
          <CheckIcon />
        </div>
        <span style={{ color: '#4ade80', fontSize: '14px', fontWeight: 500 }}>
          两个 JSON 完全相等
        </span>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4">
      {result.diffs.map((item, index) => (
        <DiffItemRow key={index} item={item} />
      ))}
    </div>
  )
}

/**
 * JSON 对比页面 - VS Code / Cursor 风格
 */
export function JsonDiff() {
  const [oldJson, setOldJson] = useState('')
  const [newJson, setNewJson] = useState('')
  const [mode, setMode] = useState<DiffMode>('loose')
  const [result, setResult] = useState<DiffResult | null>(null)

  const { success, error } = useToast()
  const { copy } = useClipboard()

  const handleCompare = () => {
    if (!oldJson.trim() || !newJson.trim()) {
      error('请输入要对比的 JSON')
      return
    }

    try {
      const oldObj = JSON.parse(oldJson)
      const newObj = JSON.parse(newJson)
      const diffResult = compareJson(oldObj, newObj, mode)
      setResult(diffResult)

      if (diffResult.isEqual) {
        success('对比完成：两个 JSON 相等')
      } else {
        success(`对比完成：发现 ${diffResult.diffs.length} 处差异`)
      }
    } catch (err) {
      error('JSON 解析失败：' + (err instanceof Error ? err.message : '请检查格式'))
    }
  }

  const handleClear = () => {
    setOldJson('')
    setNewJson('')
    setResult(null)
  }

  const handleCopyOld = async () => {
    if (!oldJson) {
      error('没有可复制的内容')
      return
    }
    const copied = await copy(oldJson)
    if (copied) success('已复制旧 JSON')
  }

  const handleCopyNew = async () => {
    if (!newJson) {
      error('没有可复制的内容')
      return
    }
    const copied = await copy(newJson)
    if (copied) success('已复制新 JSON')
  }

  const handleCopyResult = async () => {
    if (!result) {
      error('没有对比结果')
      return
    }
    const copied = await copy(JSON.stringify(result.diffs, null, 2))
    if (copied) success('已复制差异结果')
  }

  return (
    <div className="h-full flex flex-col">
      {/* 标签栏 */}
      <div
        className="flex items-center"
        style={{
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="editor-tab active">
          <CompareIcon />
          <span>JSON Diff</span>
        </div>

        {/* 右侧工具栏 */}
        <div className="flex-1" />
        <div className="flex items-center gap-2 px-2">
          {/* 模式切换 - 矩形开关 */}
          <ToggleSwitch
            options={[
              { value: 'loose', label: '宽松' },
              { value: 'strict', label: '严格' },
            ]}
            value={mode}
            onChange={(v) => setMode(v as DiffMode)}
          />

          <button
            className="action-btn action-btn-primary"
            onClick={handleCompare}
            style={{ borderRadius: 0 }}
          >
            <CompareIcon />
            <span>对比</span>
          </button>

          <button
            className="action-btn"
            onClick={handleClear}
            title="清空"
            style={{ borderRadius: 0 }}
          >
            <ClearIcon />
            <span>清空</span>
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        {/* 上半部分 - 双栏编辑器 */}
        <div className="flex-1 flex overflow-hidden" style={{ minHeight: '40%' }}>
          {/* 旧 JSON 面板 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                <span>旧 JSON (Old)</span>
              </div>
              <button className="action-btn" onClick={handleCopyOld} title="复制">
                <CopyIcon />
              </button>
            </div>

            <div className="flex-1 p-2 overflow-hidden">
              <CodeEditor
                value={oldJson}
                onChange={setOldJson}
                placeholder={`{
  "name": "张三",
  "age": 25,
  "address": {
    "city": "北京"
  }
}`}
              />
            </div>
          </div>

          {/* 分隔线 */}
          <div
            style={{
              width: '1px',
              background: 'var(--border-default)',
            }}
          />

          {/* 新 JSON 面板 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                <span>新 JSON (New)</span>
              </div>
              <button className="action-btn" onClick={handleCopyNew} title="复制">
                <CopyIcon />
              </button>
            </div>

            <div className="flex-1 p-2 overflow-hidden">
              <CodeEditor
                value={newJson}
                onChange={setNewJson}
                placeholder={`{
  "name": "李四",
  "age": 26,
  "address": {
    "city": "上海"
  }
}`}
              />
            </div>
          </div>
        </div>

        {/* 下半部分 - 差异结果 */}
        <div
          className="flex flex-col overflow-hidden"
          style={{
            height: '40%',
            borderTop: '1px solid var(--border-default)',
          }}
        >
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <AlertIcon />
              <div className="flex items-center gap-1">
                <span>差异结果</span>
                {result && !result.isEqual && (
                  <span
                    style={{
                      color: 'var(--fg-secondary)',
                      fontSize: '12px',
                    }}
                  >
                    (发现 {result.diffs.length} 处差异)
                  </span>
                )}
              </div>
            </div>
            <button className="action-btn" onClick={handleCopyResult} title="复制结果">
              <CopyIcon />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <DiffResultPanel result={result} />
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div
        className="p-3"
        style={{
          background: 'var(--bg-tertiary)',
          borderTop: '1px solid var(--border-default)',
          fontSize: '11px',
          color: 'var(--fg-secondary)',
        }}
      >
        <span style={{ color: 'var(--fg-muted)', marginRight: '8px' }}>Tips:</span>
        <code className="font-mono" style={{ color: 'var(--syntax-keyword)' }}>
          宽松模式
        </code>
        ：忽略 Key 顺序 ·{' '}
        <code className="font-mono" style={{ color: 'var(--syntax-keyword)' }}>
          严格模式
        </code>
        ：校验 Key 顺序 · 支持深层嵌套对象和数组
      </div>
    </div>
  )
}
