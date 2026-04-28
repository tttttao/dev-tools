/**
 * DDL 解析器
 * 
 * 支持解析 MySQL DDL 语句，包括：
 * - CREATE TABLE 语句
 * - CREATE INDEX 语句
 * 
 * 解析结果包含表结构、字段信息、索引关系等。
 */

import type {
  DDLParseResult,
  TableInfo,
  TableField,
  TableIndex,
  StandaloneIndex,
  IndexType,
} from '../types/ddl'

/**
 * 解析 DDL 语句
 * 
 * @param ddl - DDL 语句字符串，可包含多条语句
 * @returns 解析结果
 * 
 * @example
 * ```ts
 * const result = parseDDL(`
 *   CREATE TABLE users (
 *     id INT PRIMARY KEY,
 *     name VARCHAR(100)
 *   );
 * `)
 * ```
 */
export function parseDDL(ddl: string): DDLParseResult {
  // 移除注释
  const cleanDDL = ddl
    .replace(/--.*$/gm, '') // 单行注释
    .replace(/\/\*[\s\S]*?\*\//g, '') // 多行注释

  const tables = new Map<string, TableInfo>()
  const standaloneIndexes: StandaloneIndex[] = []

  // 分割语句
  const statements = cleanDDL
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  for (const stmt of statements) {
    // 解析 CREATE TABLE
    if (/CREATE\s+TABLE/i.test(stmt)) {
      const tableResult = parseCreateTable(stmt)
      tables.set(tableResult.tableName.toLowerCase(), tableResult)
    }
    // 解析 CREATE INDEX
    else if (/CREATE\s+(UNIQUE\s+)?INDEX/i.test(stmt)) {
      const indexResult = parseCreateIndex(stmt)
      if (indexResult) {
        const tableName = indexResult.tableName.toLowerCase()

        if (tables.has(tableName)) {
          // 将索引添加到已有的表中
          const table = tables.get(tableName)!
          const fieldNames = new Set(table.fields.map((f) => f.name.toLowerCase()))

          // 检查索引字段是否存在
          indexResult.index.missingColumns = []
          for (const col of indexResult.index.columns) {
            if (!fieldNames.has(col.toLowerCase())) {
              indexResult.index.missingColumns.push(col)
            }
          }

          table.indexes.push(indexResult.index)

          // 更新字段的索引信息
          for (const field of table.fields) {
            if (
              indexResult.index.columns.some(
                (col) => col.toLowerCase() === field.name.toLowerCase()
              )
            ) {
              field.indexes.push({
                name: indexResult.index.name,
                type: indexResult.index.type,
                isFirst:
                  indexResult.index.columns[0].toLowerCase() === field.name.toLowerCase(),
              })
            }
          }
        } else {
          // 表不存在，记录为独立索引
          standaloneIndexes.push(indexResult)
        }
      }
    }
  }

  return {
    tables: Array.from(tables.values()),
    standaloneIndexes,
  }
}

/**
 * 解析 CREATE TABLE 语句
 */
function parseCreateTable(ddl: string): TableInfo {
  // 提取表名
  const tableNameMatch = ddl.match(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?/i
  )
  if (!tableNameMatch) {
    throw new Error('无法识别 CREATE TABLE 语句')
  }
  const tableName = tableNameMatch[1]

  // 提取表注释
  const tableCommentMatch = ddl.match(/\)\s*[^;]*COMMENT\s*=?\s*['"]([^'"]+)['"]/i)
  const tableComment = tableCommentMatch ? tableCommentMatch[1] : ''

  // 提取括号内的内容
  const contentMatch = ddl.match(/CREATE\s+TABLE[^(]*\(([\s\S]+)\)[^)]*$/i)
  if (!contentMatch) {
    throw new Error('无法解析表定义内容')
  }

  const content = contentMatch[1]
  const definitions = splitDefinitions(content)

  const fields: TableField[] = []
  const indexes: TableIndex[] = []

  for (const def of definitions) {
    const trimmedDef = def.trim()
    if (!trimmedDef) continue

    // 检查是否是索引定义
    if (
      /^(PRIMARY\s+KEY|UNIQUE\s+KEY|UNIQUE\s+INDEX|KEY|INDEX|FULLTEXT\s+KEY|FULLTEXT\s+INDEX|SPATIAL\s+KEY|SPATIAL\s+INDEX|CONSTRAINT)/i.test(
        trimmedDef
      )
    ) {
      const indexInfo = parseInlineIndex(trimmedDef)
      if (indexInfo) indexes.push(indexInfo)
    }
    // 检查是否是字段定义
    else if (/^[`"']?\w+[`"']?\s+/i.test(trimmedDef)) {
      const fieldInfo = parseField(trimmedDef)
      if (fieldInfo) fields.push(fieldInfo)
    }
  }

  // 获取所有字段名（小写）
  const fieldNames = new Set(fields.map((f) => f.name.toLowerCase()))

  // 为字段添加索引信息，并检查索引字段是否存在
  for (const field of fields) {
    field.indexes = []
    for (const index of indexes) {
      if (index.columns.some((col) => col.toLowerCase() === field.name.toLowerCase())) {
        field.indexes.push({
          name: index.name,
          type: index.type,
          isFirst: index.columns[0].toLowerCase() === field.name.toLowerCase(),
        })
      }
    }
  }

  // 检查每个索引的字段是否都存在
  for (const index of indexes) {
    index.missingColumns = []
    for (const col of index.columns) {
      if (!fieldNames.has(col.toLowerCase())) {
        index.missingColumns.push(col)
      }
    }
  }

  return { tableName, tableComment, fields, indexes }
}

/**
 * 解析 CREATE INDEX 语句
 */
function parseCreateIndex(stmt: string): StandaloneIndex | null {
  // CREATE [UNIQUE|FULLTEXT|SPATIAL] INDEX index_name ON table_name (column_list)
  const match = stmt.match(
    /CREATE\s+(UNIQUE\s+|FULLTEXT\s+|SPATIAL\s+)?INDEX\s+[`"']?(\w+)[`"']?\s+ON\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i
  )

  if (!match) return null

  const typeStr = (match[1] || '').trim().toUpperCase()
  let type: IndexType = 'INDEX'
  if (typeStr === 'UNIQUE') type = 'UNIQUE'
  else if (typeStr === 'FULLTEXT') type = 'FULLTEXT'
  else if (typeStr === 'SPATIAL') type = 'SPATIAL'

  const name = match[2]
  const tableName = match[3]
  const columns = parseIndexColumns(match[4])

  return {
    tableName,
    index: { type, name, columns },
  }
}

/**
 * 分割定义（处理括号嵌套）
 */
function splitDefinitions(content: string): string[] {
  const definitions: string[] = []
  let current = ''
  let depth = 0
  let inString = false
  let stringChar = ''

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (inString) {
      current += char
      if (char === stringChar && content[i - 1] !== '\\') {
        inString = false
      }
      continue
    }

    if (char === "'" || char === '"' || char === '`') {
      inString = true
      stringChar = char
      current += char
      continue
    }

    if (char === '(') {
      depth++
      current += char
      continue
    }

    if (char === ')') {
      depth--
      current += char
      continue
    }

    if (char === ',' && depth === 0) {
      definitions.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  if (current.trim()) {
    definitions.push(current.trim())
  }

  return definitions
}

/**
 * 解析字段定义
 */
function parseField(fieldDef: string): TableField | null {
  // 规范化空白字符
  const normalizedDef = fieldDef.replace(/\s+/g, ' ').trim()

  // 匹配字段名和剩余定义
  const nameMatch = normalizedDef.match(/^[`"']?(\w+)[`"']?\s+(.+)$/i)
  if (!nameMatch) return null

  const name = nameMatch[1]
  const rest = nameMatch[2]

  // 匹配类型
  const typeMatch = rest.match(
    /^(\w+(?:\s*\([^)]+\))?(?:\s+unsigned)?(?:\s+zerofill)?)/i
  )
  const type = typeMatch ? typeMatch[1].trim().replace(/\s+/g, ' ') : 'UNKNOWN'

  // 是否允许 NULL
  const nullable = !/\bNOT\s+NULL\b/i.test(rest)

  // 默认值
  let defaultValue: string | null = null
  const defaultMatch = rest.match(
    /DEFAULT\s+('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|[\w()]+)/i
  )
  if (defaultMatch) {
    defaultValue = defaultMatch[1].replace(/^['"]|['"]$/g, '')
  }

  // 是否自增
  const autoIncrement = /\bAUTO_INCREMENT\b/i.test(rest)

  // 注释
  let comment = ''
  const commentMatch = rest.match(/COMMENT\s+['"]([^'"]*)['"]/i)
  if (commentMatch) {
    comment = commentMatch[1]
  }

  // 是否是主键（内联定义）
  const isPrimaryKey = /\bPRIMARY\s+KEY\b/i.test(rest)

  return {
    name,
    type,
    nullable,
    defaultValue,
    autoIncrement,
    comment,
    isPrimaryKey,
    indexes: [],
  }
}

/**
 * 解析内联索引（CREATE TABLE 内的索引定义）
 */
function parseInlineIndex(indexDef: string): TableIndex | null {
  // 规范化空白字符
  const normalizedDef = indexDef.replace(/\s+/g, ' ').trim()

  let type: IndexType = 'INDEX'
  let name = ''
  let columns: string[] = []

  // PRIMARY KEY
  if (/^PRIMARY\s+KEY/i.test(normalizedDef)) {
    type = 'PRIMARY'
    name = 'PRIMARY'
    const colMatch = normalizedDef.match(/\(([^)]+)\)/)
    if (colMatch) columns = parseIndexColumns(colMatch[1])
  }
  // UNIQUE KEY/INDEX
  else if (/^UNIQUE\s+(KEY|INDEX)/i.test(normalizedDef)) {
    type = 'UNIQUE'
    const nameMatch = normalizedDef.match(
      /^UNIQUE\s+(?:KEY|INDEX)\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i
    )
    if (nameMatch) {
      name = nameMatch[1]
      columns = parseIndexColumns(nameMatch[2])
    }
  }
  // FULLTEXT KEY/INDEX
  else if (/^FULLTEXT\s+(KEY|INDEX)/i.test(normalizedDef)) {
    type = 'FULLTEXT'
    const nameMatch = normalizedDef.match(
      /^FULLTEXT\s+(?:KEY|INDEX)\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i
    )
    if (nameMatch) {
      name = nameMatch[1]
      columns = parseIndexColumns(nameMatch[2])
    }
  }
  // KEY/INDEX
  else if (/^(KEY|INDEX)/i.test(normalizedDef)) {
    type = 'INDEX'
    const nameMatch = normalizedDef.match(
      /^(?:KEY|INDEX)\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i
    )
    if (nameMatch) {
      name = nameMatch[1]
      columns = parseIndexColumns(nameMatch[2])
    }
  }

  if (columns.length === 0) return null

  return { type, name, columns }
}

/**
 * 解析索引列
 */
function parseIndexColumns(columnsStr: string): string[] {
  return columnsStr
    .split(',')
    .map((col) => {
      const match = col.trim().match(/[`"']?(\w+)[`"']?/)
      return match ? match[1] : ''
    })
    .filter(Boolean)
}

/**
 * 生成 Markdown 表格
 * 
 * @param result - DDL 解析结果
 * @returns Markdown 格式的表格字符串
 */
export function generateMarkdown(result: DDLParseResult): string {
  let md = ''

  for (const table of result.tables) {
    md += `## 表名: ${table.tableName}`
    if (table.tableComment) md += ` (${table.tableComment})`
    md += '\n\n'

    // 字段表格
    md += '| 字段名 | 类型 | 允许NULL | 默认值 | 索引 | 注释 |\n'
    md += '|--------|------|----------|--------|------|------|\n'

    for (const field of table.fields) {
      const indexLabels: string[] = []
      if (field.isPrimaryKey) indexLabels.push('主键')
      for (const idx of field.indexes) {
        if (idx.type === 'PRIMARY' && field.isPrimaryKey) continue
        indexLabels.push(`${getIndexTypeText(idx.type)}(${idx.name})`)
      }

      md += `| ${field.name}${field.autoIncrement ? ' (AI)' : ''} `
      md += `| ${field.type} `
      md += `| ${field.nullable ? '是' : '否'} `
      md += `| ${field.defaultValue !== null ? field.defaultValue : '-'} `
      md += `| ${indexLabels.length > 0 ? indexLabels.join(', ') : '-'} `
      md += `| ${field.comment || '-'} |\n`
    }

    // 索引列表
    if (table.indexes.length > 0) {
      md += '\n### 索引列表\n\n'
      md += '| 索引名 | 类型 | 字段 |\n'
      md += '|--------|------|------|\n'

      for (const index of table.indexes) {
        md += `| ${index.name} | ${getIndexTypeText(index.type)} | ${index.columns.join(', ')} |\n`
      }
    }

    md += '\n'
  }

  return md
}

/**
 * 获取索引类型的中文描述
 */
export function getIndexTypeText(type: IndexType): string {
  switch (type) {
    case 'PRIMARY':
      return '主键'
    case 'UNIQUE':
      return '唯一索引'
    case 'FULLTEXT':
      return '全文索引'
    case 'SPATIAL':
      return '空间索引'
    default:
      return '普通索引'
  }
}

/**
 * 获取索引类型的简短标签
 */
export function getIndexTypeLabel(type: IndexType): string {
  switch (type) {
    case 'PRIMARY':
      return '🔑 主键'
    case 'UNIQUE':
      return '🎯 唯一'
    case 'FULLTEXT':
      return '📝 全文'
    case 'SPATIAL':
      return '🌍 空间'
    default:
      return '📇 索引'
  }
}

