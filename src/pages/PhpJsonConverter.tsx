import { useState } from 'react'
import { useToast } from '../hooks/useToast'
import { useClipboard } from '../hooks/useClipboard'
import { parsePHPArray, convertToPHP } from '../lib/php-parser'

/**
 * VS Code 风格图标
 */
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12,5 19,12 12,19" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </svg>
)

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
        border: '1px solid var(--border-default)'
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
 * PHP/JSON 转换器页面 - VS Code / Cursor 风格
 */
export function PhpJsonConverter() {
  const [phpInput, setPhpInput] = useState('')
  const [jsonInput, setJsonInput] = useState('')
  
  const { success, error } = useToast()
  const { copy } = useClipboard()

  const handlePhpToJson = () => {
    if (!phpInput.trim()) {
      error('请输入 PHP 数组格式')
      return
    }

    try {
      const result = parsePHPArray(phpInput)
      const jsonString = JSON.stringify(result, null, 2)
      setJsonInput(jsonString)
      success('转换成功！')
    } catch (err) {
      error('转换失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  const handleJsonToPhp = () => {
    if (!jsonInput.trim()) {
      error('请输入 JSON 格式')
      return
    }

    try {
      const jsonObj = JSON.parse(jsonInput)
      const phpString = convertToPHP(jsonObj)
      setPhpInput(phpString)
      success('转换成功！')
    } catch {
      error('转换失败：请检查 JSON 格式是否正确')
    }
  }

  const handleClear = () => {
    setPhpInput('')
    setJsonInput('')
  }

  const handleCopyPhp = async () => {
    if (!phpInput) {
      error('没有可复制的内容')
      return
    }
    const copied = await copy(phpInput)
    if (copied) success('已复制 PHP 代码')
  }

  const handleCopyJson = async () => {
    if (!jsonInput) {
      error('没有可复制的内容')
      return
    }
    const copied = await copy(jsonInput)
    if (copied) success('已复制 JSON')
  }

  return (
    <div className="h-full flex flex-col">
      {/* 标签栏 */}
      <div 
        className="flex items-center"
        style={{ 
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-default)'
        }}
      >
        <div className="editor-tab active">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span>PHP ⇄ JSON</span>
        </div>
        
        {/* 右侧工具栏 */}
        <div className="flex-1" />
        <div className="flex items-center gap-1 px-2">
          <button 
            className="action-btn"
            onClick={handleClear}
            title="清空"
          >
            <ClearIcon />
            <span>清空</span>
          </button>
        </div>
      </div>

      {/* 主内容区 - 双栏布局 */}
      <div 
        className="flex-1 flex overflow-hidden"
        style={{ background: 'var(--bg-primary)' }}
      >
        {/* PHP 面板 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 面板标题 */}
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <span>PHP Array</span>
            </div>
            <button 
              className="action-btn"
              onClick={handleCopyPhp}
              title="复制"
            >
              <CopyIcon />
            </button>
          </div>
          
          {/* 编辑器 */}
          <div className="flex-1 p-2 overflow-hidden">
            <CodeEditor
              value={phpInput}
              onChange={setPhpInput}
              placeholder={`array(
    'name' => '张三',
    'age' => 25,
    'skills' => array('PHP', 'JavaScript')
)`}
            />
          </div>
        </div>

        {/* 中间转换按钮 */}
        <div 
          className="flex flex-col items-center justify-center gap-2 px-3"
          style={{ borderLeft: '1px solid var(--border-default)', borderRight: '1px solid var(--border-default)' }}
        >
          <button 
            className="action-btn action-btn-primary"
            onClick={handlePhpToJson}
            title="PHP → JSON"
          >
            <ArrowRightIcon />
          </button>
          <button 
            className="action-btn action-btn-primary"
            onClick={handleJsonToPhp}
            title="JSON → PHP"
          >
            <ArrowLeftIcon />
          </button>
        </div>

        {/* JSON 面板 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 面板标题 */}
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <span>JSON</span>
            </div>
            <button 
              className="action-btn"
              onClick={handleCopyJson}
              title="复制"
            >
              <CopyIcon />
            </button>
          </div>
          
          {/* 编辑器 */}
          <div className="flex-1 p-2 overflow-hidden">
            <CodeEditor
              value={jsonInput}
              onChange={setJsonInput}
              placeholder={`{
    "name": "张三",
    "age": 25,
    "skills": ["PHP", "JavaScript"]
}`}
            />
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
          color: 'var(--fg-secondary)'
        }}
      >
        <span style={{ color: 'var(--fg-muted)', marginRight: '8px' }}>Tips:</span>
        支持 <code className="font-mono" style={{ color: 'var(--syntax-keyword)' }}>array()</code> 和 
        <code className="font-mono" style={{ color: 'var(--syntax-keyword)' }}> []</code> 语法 · 
        支持嵌套结构 · 
        支持 <code className="font-mono" style={{ color: 'var(--syntax-keyword)' }}>true</code>, 
        <code className="font-mono" style={{ color: 'var(--syntax-keyword)' }}> false</code>, 
        <code className="font-mono" style={{ color: 'var(--syntax-keyword)' }}> null</code>
      </div>
    </div>
  )
}
