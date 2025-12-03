import { useState } from 'react'
import { useToast } from '../hooks/useToast'
import { useClipboard } from '../hooks/useClipboard'
import { parseDDL, generateMarkdown, getIndexTypeLabel } from '../lib/ddl-parser'
import type { DDLParseResult, TableInfo, TableIndex, IndexType } from '../types/ddl'

/**
 * VS Code 风格图标
 */
const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

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

const TableIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
)

const KeyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
)

/**
 * Monaco 风格代码编辑器
 */
function CodeEditor({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  const lines = value ? value.split('\n') : ['']
  const lineCount = Math.max(lines.length, 15)

  return (
    <div 
      className="flex flex-1 overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* 行号槽 */}
      <div className="line-numbers">
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
 * DDL 解析器页面 - VS Code / Cursor IDE 风格
 */
export function DdlParser() {
  const [ddlInput, setDdlInput] = useState('')
  const [parseResult, setParseResult] = useState<DDLParseResult | null>(null)
  const [activeTab, setActiveTab] = useState<'input' | 'result'>('input')
  
  const { success, error } = useToast()
  const { copy } = useClipboard()

  const handleParse = () => {
    if (!ddlInput.trim()) {
      error('请输入 DDL 语句')
      return
    }

    try {
      const result = parseDDL(ddlInput)
      
      if (result.tables.length === 0 && result.standaloneIndexes.length === 0) {
        error('未能解析出有效的 DDL 语句')
        return
      }
      
      setParseResult(result)
      setActiveTab('result')
      success('解析成功！')
    } catch (err) {
      error('解析失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  const handleClear = () => {
    setDdlInput('')
    setParseResult(null)
    setActiveTab('input')
  }

  const handleCopyMarkdown = async () => {
    if (!parseResult) {
      error('请先解析 DDL 语句')
      return
    }

    const markdown = generateMarkdown(parseResult)
    const copied = await copy(markdown)
    if (copied) success('已复制 Markdown 到剪贴板')
  }

  return (
    <div className="h-full flex flex-col">
      {/* 编辑器标签栏 */}
      <div 
        className="flex items-center"
        style={{ 
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-default)'
        }}
      >
        <div 
          className={`editor-tab ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
          <span>SQL Input</span>
        </div>
        {parseResult && (
          <div 
            className={`editor-tab ${activeTab === 'result' ? 'active' : ''}`}
            onClick={() => setActiveTab('result')}
          >
            <TableIcon />
            <span>Parsed Result</span>
          </div>
        )}
        
        {/* 右侧工具栏 */}
        <div className="flex-1" />
        <div className="flex items-center gap-1 px-2">
          <button 
            className="action-btn action-btn-primary"
            onClick={handleParse}
          >
            <PlayIcon />
            <span>Parse</span>
          </button>
          <button 
            className="action-btn"
            onClick={handleClear}
            title="清空"
          >
            <ClearIcon />
          </button>
          <button 
            className="action-btn"
            onClick={handleCopyMarkdown}
            title="复制为 Markdown"
          >
            <CopyIcon />
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'input' ? (
          /* 编辑器面板 */
          <CodeEditor
            value={ddlInput}
            onChange={setDdlInput}
            placeholder={`-- 输入 MySQL DDL 语句
CREATE TABLE \`users\` (
    \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    \`username\` varchar(50) NOT NULL COMMENT '用户名',
    \`email\` varchar(100) NOT NULL COMMENT '邮箱',
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_username\` (\`username\`),
    KEY \`idx_email\` (\`email\`)
) ENGINE=InnoDB COMMENT='用户表';`}
          />
        ) : (
          /* 结果面板 */
          <div className="flex-1 overflow-auto">
            {parseResult && (
              <div className="p-0">
                {parseResult.tables.map((table) => (
                  <TableResult key={table.tableName} table={table} />
                ))}

                {parseResult.standaloneIndexes.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-default)' }}>
                    <div className="panel-header">
                      <span>STANDALONE INDEXES</span>
                    </div>
                    <div className="p-3">
                      {parseResult.standaloneIndexes.map((item, idx) => (
                        <IndexItem
                          key={idx}
                          index={item.index}
                          tableName={item.tableName}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 表结果组件 - Database Viewer 风格
 */
function TableResult({ table }: { table: TableInfo }) {
  return (
    <div>
      {/* 表名标题 */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <TableIcon />
          <span style={{ color: 'var(--fg-primary)', fontWeight: 500 }}>
            {table.tableName}
          </span>
          {table.tableComment && (
            <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>
              — {table.tableComment}
            </span>
          )}
        </div>
      </div>
      
      {/* 字段表格 */}
      <div className="overflow-x-auto">
        <table className="ide-table">
          <thead>
            <tr>
              <th style={{ width: '180px' }}>Field</th>
              <th style={{ width: '150px' }}>Type</th>
              <th style={{ width: '80px' }}>Null</th>
              <th style={{ width: '120px' }}>Default</th>
              <th style={{ width: '120px' }}>Key</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {table.fields.map((field) => (
              <tr key={field.name}>
                {/* 字段名 */}
                <td>
                  <code 
                    className="font-mono"
                    style={{ color: 'var(--syntax-variable)' }}
                  >
                    {field.name}
                  </code>
                  {field.autoIncrement && (
                    <span 
                      className="ml-2 ide-badge"
                      style={{ 
                        background: 'rgba(137, 209, 133, 0.15)',
                        color: '#89d185',
                        fontSize: '9px'
                      }}
                    >
                      AI
                    </span>
                  )}
                </td>
                
                {/* 类型 */}
                <td>
                  <code 
                    className="font-mono"
                    style={{ color: 'var(--syntax-keyword)', fontSize: '11px' }}
                  >
                    {field.type}
                  </code>
                </td>
                
                {/* 允许 NULL */}
                <td>
                  <span className={`ide-badge ${field.nullable ? 'ide-badge-null' : 'ide-badge-required'}`}>
                    {field.nullable ? 'NULL' : 'NOT NULL'}
                  </span>
                </td>
                
                {/* 默认值 */}
                <td>
                  {field.defaultValue !== null ? (
                    <code 
                      className="font-mono"
                      style={{ color: 'var(--syntax-string)', fontSize: '11px' }}
                    >
                      {field.defaultValue}
                    </code>
                  ) : (
                    <span style={{ color: 'var(--fg-muted)' }}>—</span>
                  )}
                </td>
                
                {/* 索引 */}
                <td>
                  <div className="flex flex-wrap gap-1">
                    {field.isPrimaryKey && (
                      <span className="ide-badge ide-badge-pk">
                        <KeyIcon /> PK
                      </span>
                    )}
                    {field.indexes
                      .filter((idx) => !(idx.type === 'PRIMARY' && field.isPrimaryKey))
                      .map((idx) => (
                        <span
                          key={idx.name}
                          className={`ide-badge ${
                            idx.type === 'UNIQUE' ? 'ide-badge-uq' : 'ide-badge-idx'
                          }`}
                          title={idx.name}
                        >
                          {idx.isFirst ? '' : '↳ '}
                          {idx.type === 'UNIQUE' ? 'UQ' : 'IDX'}
                        </span>
                      ))}
                    {!field.isPrimaryKey && field.indexes.length === 0 && (
                      <span style={{ color: 'var(--fg-muted)' }}>—</span>
                    )}
                  </div>
                </td>
                
                {/* 注释 */}
                <td style={{ color: 'var(--fg-secondary)', maxWidth: '200px' }}>
                  {field.comment || <span style={{ color: 'var(--fg-muted)' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 索引定义 */}
      {table.indexes.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-default)' }}>
          <div 
            className="px-3 py-2 flex items-center gap-2"
            style={{ 
              background: 'var(--bg-secondary)',
              fontSize: '11px',
              color: 'var(--fg-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            Index Definitions
          </div>
          <div className="p-3 space-y-1">
            {table.indexes.map((index) => (
              <IndexItem key={index.name} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 索引项组件
 */
function IndexItem({ index, tableName }: { index: TableIndex; tableName?: string }) {
  const hasMissing = index.missingColumns && index.missingColumns.length > 0

  return (
    <div
      className="flex items-center gap-2 px-2 py-1 rounded font-mono text-xs"
      style={{
        background: hasMissing ? 'var(--error-bg)' : 'var(--bg-tertiary)',
        border: hasMissing ? '1px solid var(--error)' : '1px solid var(--border-default)',
      }}
    >
      <span className={`ide-badge ${
        index.type === 'PRIMARY' ? 'ide-badge-pk' :
        index.type === 'UNIQUE' ? 'ide-badge-uq' : 'ide-badge-idx'
      }`}>
        {getIndexTypeLabel(index.type)}
      </span>
      
      <code style={{ color: 'var(--fg-primary)' }}>
        {index.name}
      </code>
      
      {tableName && (
        <span style={{ color: 'var(--syntax-keyword)' }}>
          ON {tableName}
        </span>
      )}
      
      <code style={{ color: 'var(--syntax-variable)' }}>
        ({index.columns.map((col, idx) => {
          const isMissing = index.missingColumns?.includes(col)
          return (
            <span key={col}>
              {idx > 0 && ', '}
              <span style={{ color: isMissing ? 'var(--error)' : 'inherit' }}>
                {col}
                {isMissing && ' ⚠'}
              </span>
            </span>
          )
        })})
      </code>
      
      {hasMissing && (
        <span 
          className="ide-badge"
          style={{ background: 'var(--error-bg)', color: 'var(--error)' }}
        >
          Missing
        </span>
      )}
    </div>
  )
}
