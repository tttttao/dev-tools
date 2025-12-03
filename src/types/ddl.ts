/**
 * DDL 解析相关类型定义
 */

/**
 * 索引类型
 */
export type IndexType = 'PRIMARY' | 'UNIQUE' | 'INDEX' | 'FULLTEXT' | 'SPATIAL'

/**
 * 字段索引信息
 */
export interface FieldIndex {
  /** 索引名称 */
  name: string
  /** 索引类型 */
  type: IndexType
  /** 是否是索引的第一个字段 */
  isFirst: boolean
}

/**
 * 表字段信息
 */
export interface TableField {
  /** 字段名 */
  name: string
  /** 字段类型 */
  type: string
  /** 是否允许 NULL */
  nullable: boolean
  /** 默认值 */
  defaultValue: string | null
  /** 是否自增 */
  autoIncrement: boolean
  /** 字段注释 */
  comment: string
  /** 是否是主键 (内联定义) */
  isPrimaryKey: boolean
  /** 关联的索引列表 */
  indexes: FieldIndex[]
}

/**
 * 索引信息
 */
export interface TableIndex {
  /** 索引类型 */
  type: IndexType
  /** 索引名称 */
  name: string
  /** 索引包含的列 */
  columns: string[]
  /** 缺失的列 (列在索引中定义但表中不存在) */
  missingColumns?: string[]
}

/**
 * 表信息
 */
export interface TableInfo {
  /** 表名 */
  tableName: string
  /** 表注释 */
  tableComment: string
  /** 字段列表 */
  fields: TableField[]
  /** 索引列表 */
  indexes: TableIndex[]
}

/**
 * 独立索引信息 (CREATE INDEX 语句)
 */
export interface StandaloneIndex {
  /** 目标表名 */
  tableName: string
  /** 索引信息 */
  index: TableIndex
}

/**
 * DDL 解析结果
 */
export interface DDLParseResult {
  /** 解析出的表列表 */
  tables: TableInfo[]
  /** 独立索引 (未找到对应表) */
  standaloneIndexes: StandaloneIndex[]
}

