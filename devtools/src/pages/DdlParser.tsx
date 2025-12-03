import { useState } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { useToast } from '../hooks/useToast'
import { useClipboard } from '../hooks/useClipboard'
import { parseDDL, generateMarkdown, getIndexTypeLabel } from '../lib/ddl-parser'
import type { DDLParseResult, TableInfo, TableIndex, IndexType } from '../types/ddl'

/**
 * DDL 解析器页面
 * 
 * 解析 MySQL DDL 语句，以表格形式展示字段信息和索引关系。
 */
export function DdlParser() {
  // 状态
  const [ddlInput, setDdlInput] = useState('')
  const [parseResult, setParseResult] = useState<DDLParseResult | null>(null)
  
  // Hooks
  const { success, error } = useToast()
  const { copy } = useClipboard()

  /**
   * 解析 DDL
   */
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
      success('解析成功！')
    } catch (err) {
      error('解析失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  /**
   * 清空
   */
  const handleClear = () => {
    setDdlInput('')
    setParseResult(null)
  }

  /**
   * 复制为 Markdown
   */
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
    <div className="space-y-6">
      {/* 输入区域 */}
      <Card>
        <CardHeader
          icon="📋"
          title="DDL 解析器"
          description="解析 MySQL DDL 语句，生成清晰的表结构展示"
        />
        
        <CardContent>
          <div className="space-y-4">
            {/* DDL 输入框 */}
            <Textarea
              value={ddlInput}
              onChange={(e) => setDdlInput(e.target.value)}
              placeholder={`支持 CREATE TABLE 和 CREATE INDEX 语句，例如：

CREATE TABLE \`users\` (
    \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    \`username\` varchar(50) NOT NULL COMMENT '用户名',
    \`email\` varchar(100) NOT NULL COMMENT '邮箱',
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_username\` (\`username\`),
    KEY \`idx_email\` (\`email\`)
) ENGINE=InnoDB COMMENT='用户表';

CREATE INDEX idx_created_at ON users (created_at);
CREATE UNIQUE INDEX uk_phone ON users (phone);`}
              className="min-h-[200px]"
            />

            {/* 操作按钮 */}
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={handleParse}>
                解析 DDL
              </Button>
              <Button variant="secondary" onClick={handleClear}>
                清空
              </Button>
              <Button variant="secondary" onClick={handleCopyMarkdown}>
                复制为 Markdown
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 解析结果 */}
      {parseResult && (
        <div className="space-y-6">
          {/* 表列表 */}
          {parseResult.tables.map((table) => (
            <TableResult key={table.tableName} table={table} />
          ))}

          {/* 独立索引 */}
          {parseResult.standaloneIndexes.length > 0 && (
            <Card>
              <CardHeader
                icon="🔗"
                title="独立索引（未找到对应表）"
              />
              <CardContent>
                <div className="space-y-2">
                  {parseResult.standaloneIndexes.map((item, idx) => (
                    <IndexItem
                      key={idx}
                      index={item.index}
                      tableName={item.tableName}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 空状态 */}
      {!parseResult && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-[var(--fg-muted)]">解析结果将显示在这里</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * 表结果组件
 */
function TableResult({ table }: { table: TableInfo }) {
  return (
    <Card>
      {/* 表头 */}
      <CardHeader
        icon="📋"
        title={`表名: ${table.tableName}`}
        description={table.tableComment || undefined}
      />
      
      <CardContent className="space-y-6">
        {/* 字段表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="text-left py-3 px-4 font-medium text-[var(--fg-secondary)]">字段名</th>
                <th className="text-left py-3 px-4 font-medium text-[var(--fg-secondary)]">类型</th>
                <th className="text-center py-3 px-4 font-medium text-[var(--fg-secondary)]">允许NULL</th>
                <th className="text-left py-3 px-4 font-medium text-[var(--fg-secondary)]">默认值</th>
                <th className="text-left py-3 px-4 font-medium text-[var(--fg-secondary)]">索引</th>
                <th className="text-left py-3 px-4 font-medium text-[var(--fg-secondary)]">注释</th>
              </tr>
            </thead>
            <tbody>
              {table.fields.map((field) => (
                <tr
                  key={field.name}
                  className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  {/* 字段名 */}
                  <td className="py-3 px-4">
                    <code className="font-mono text-[var(--fg-primary)]">
                      {field.name}
                    </code>
                    {field.autoIncrement && (
                      <span className="ml-2 text-xs text-[var(--fg-muted)]">(AI)</span>
                    )}
                  </td>
                  
                  {/* 类型 */}
                  <td className="py-3 px-4">
                    <code className="font-mono text-[var(--accent-start)]">
                      {field.type}
                    </code>
                  </td>
                  
                  {/* 允许 NULL */}
                  <td className="py-3 px-4 text-center">
                    <span className={field.nullable ? 'text-[var(--success)]' : 'text-[var(--error)]'}>
                      {field.nullable ? '✓' : '✗'}
                    </span>
                  </td>
                  
                  {/* 默认值 */}
                  <td className="py-3 px-4">
                    {field.defaultValue !== null ? (
                      <code className="font-mono text-xs text-[var(--fg-secondary)]">
                        {field.defaultValue}
                      </code>
                    ) : (
                      <span className="text-[var(--fg-muted)]">-</span>
                    )}
                  </td>
                  
                  {/* 索引 */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {field.isPrimaryKey && (
                        <Badge variant="primary">🔑 主键</Badge>
                      )}
                      {field.indexes
                        .filter((idx) => !(idx.type === 'PRIMARY' && field.isPrimaryKey))
                        .map((idx) => (
                          <Badge
                            key={idx.name}
                            variant={getIndexBadgeVariant(idx.type)}
                            title={idx.name}
                          >
                            {idx.isFirst ? '' : '↳ '}
                            {getIndexTypeLabel(idx.type)}
                          </Badge>
                        ))}
                      {!field.isPrimaryKey && field.indexes.length === 0 && (
                        <span className="text-[var(--fg-muted)]">-</span>
                      )}
                    </div>
                  </td>
                  
                  {/* 注释 */}
                  <td className="py-3 px-4 text-[var(--fg-secondary)] max-w-[200px] truncate">
                    {field.comment || <span className="text-[var(--fg-muted)]">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 索引列表 */}
        {table.indexes.length > 0 && (
          <div className="pt-4 border-t border-dashed border-[var(--border-default)]">
            <h4 className="text-sm font-medium text-[var(--fg-primary)] mb-3 flex items-center gap-2">
              🔑 索引列表
            </h4>
            <div className="space-y-2">
              {table.indexes.map((index) => (
                <IndexItem key={index.name} index={index} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * 索引项组件
 */
function IndexItem({ index, tableName }: { index: TableIndex; tableName?: string }) {
  const hasMissing = index.missingColumns && index.missingColumns.length > 0

  return (
    <div
      className={`
        flex items-center gap-3 p-3
        bg-[var(--bg-secondary)] rounded-[var(--radius-md)]
        ${hasMissing ? 'border border-[var(--warning)]' : ''}
      `}
    >
      {/* 类型徽章 */}
      <Badge variant={getIndexBadgeVariant(index.type)}>
        {getIndexTypeLabel(index.type)}
      </Badge>
      
      {/* 索引名 */}
      <code className="font-mono font-medium text-[var(--fg-primary)]">
        {index.name}
      </code>
      
      {/* 表名（独立索引时显示） */}
      {tableName && (
        <span className="text-xs text-[var(--success)]">
          ON {tableName}
        </span>
      )}
      
      {/* 列 */}
      <code className="font-mono text-[var(--accent-start)] flex-1">
        ({index.columns.map((col, idx) => {
          const isMissing = index.missingColumns?.includes(col)
          return (
            <span key={col}>
              {idx > 0 && ', '}
              <span className={isMissing ? 'text-[var(--error)] font-bold' : ''}>
                {col}
                {isMissing && ' ⚠️'}
              </span>
            </span>
          )
        })})
      </code>
      
      {/* 警告 */}
      {hasMissing && (
        <span className="text-xs text-[var(--error)] bg-[var(--error-bg)] px-2 py-1 rounded">
          字段不存在
        </span>
      )}
    </div>
  )
}

/**
 * 获取索引类型对应的 Badge 变体
 */
function getIndexBadgeVariant(type: IndexType): 'primary' | 'success' | 'info' | 'purple' {
  switch (type) {
    case 'PRIMARY':
      return 'primary'
    case 'UNIQUE':
      return 'success'
    case 'FULLTEXT':
      return 'purple'
    default:
      return 'info'
  }
}

