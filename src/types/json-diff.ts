/**
 * JSON 对比工具类型定义
 */

/**
 * JSON 值类型
 */
export type JsonValue = string | number | boolean | null | JsonArray | JsonObject

/**
 * JSON 数组类型
 */
export type JsonArray = JsonValue[]

/**
 * JSON 对象类型
 */
export interface JsonObject {
  [key: string]: JsonValue
}

/**
 * 对比模式
 * - strict: 严格模式，校验 key 顺序
 * - loose: 宽松模式，忽略 key 顺序
 */
export type DiffMode = 'strict' | 'loose'

/**
 * 差异类型
 * - added: 新增
 * - removed: 删除
 * - modified: 修改
 * - unchanged: 未变化
 * - order_changed: 顺序变化（仅严格模式）
 */
export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged' | 'order_changed'

/**
 * 差异项
 */
export interface DiffItem {
  /** 差异路径，如 "user.address.city" 或 "items[0].name" */
  path: string
  /** 差异类型 */
  type: DiffType
  /** 旧值 */
  oldValue?: JsonValue
  /** 新值 */
  newValue?: JsonValue
  /** 严格模式下的原始索引位置 */
  oldIndex?: number
  /** 严格模式下的新索引位置 */
  newIndex?: number
}

/**
 * 对比结果
 */
export interface DiffResult {
  /** 是否完全相等 */
  isEqual: boolean
  /** 差异数组 */
  diffs: DiffItem[]
}

