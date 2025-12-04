/**
 * JSON 对比工具
 *
 * 支持两种对比模式：
 * - 严格模式 (strict): 比较 Key、Value 以及 Key 的顺序
 * - 宽松模式 (loose): 只比较 Key-Value 集合，忽略顺序
 *
 * 支持深层嵌套的对象和数组递归比较
 */

import type {
  JsonValue,
  JsonObject,
  JsonArray,
  DiffMode,
  DiffType,
  DiffItem,
  DiffResult,
} from '../types/json-diff'

/**
 * 比较两个 JSON 值
 *
 * @param oldJson - 旧 JSON 值
 * @param newJson - 新 JSON 值
 * @param mode - 对比模式 ('strict' | 'loose')
 * @returns 对比结果，包含是否相等和差异数组
 *
 * @example
 * ```ts
 * const result = compareJson(
 *   { name: '张三', age: 25 },
 *   { name: '李四', age: 25 },
 *   'loose'
 * )
 * // result.isEqual: false
 * // result.diffs: [{ path: 'name', type: 'modified', oldValue: '张三', newValue: '李四' }]
 * ```
 */
export function compareJson(
  oldJson: JsonValue,
  newJson: JsonValue,
  mode: DiffMode = 'loose'
): DiffResult {
  const diffs: DiffItem[] = []

  compareValues(oldJson, newJson, '', mode, diffs)

  return {
    isEqual: diffs.length === 0,
    diffs,
  }
}

/**
 * 递归比较两个值
 */
function compareValues(
  oldVal: JsonValue,
  newVal: JsonValue,
  path: string,
  mode: DiffMode,
  diffs: DiffItem[]
): void {
  const oldType = getValueType(oldVal)
  const newType = getValueType(newVal)

  // 类型不同，视为修改
  if (oldType !== newType) {
    diffs.push({
      path: path || '(root)',
      type: 'modified',
      oldValue: oldVal,
      newValue: newVal,
    })
    return
  }

  // 根据类型进行比较
  switch (oldType) {
    case 'object':
      compareObjects(oldVal as JsonObject, newVal as JsonObject, path, mode, diffs)
      break
    case 'array':
      compareArrays(oldVal as JsonArray, newVal as JsonArray, path, mode, diffs)
      break
    default:
      // 基本类型直接比较
      if (!isEqual(oldVal, newVal)) {
        diffs.push({
          path: path || '(root)',
          type: 'modified',
          oldValue: oldVal,
          newValue: newVal,
        })
      }
  }
}

/**
 * 比较两个对象
 */
function compareObjects(
  oldObj: JsonObject,
  newObj: JsonObject,
  basePath: string,
  mode: DiffMode,
  diffs: DiffItem[]
): void {
  const oldKeys = Object.keys(oldObj)
  const newKeys = Object.keys(newObj)
  const allKeys = new Set([...oldKeys, ...newKeys])

  // 严格模式下检查 key 顺序
  if (mode === 'strict') {
    checkKeyOrder(oldKeys, newKeys, basePath, diffs)
  }

  // 遍历所有 key
  for (const key of allKeys) {
    const currentPath = basePath ? `${basePath}.${key}` : key
    const hasOld = key in oldObj
    const hasNew = key in newObj

    if (hasOld && !hasNew) {
      // 删除的 key
      diffs.push({
        path: currentPath,
        type: 'removed',
        oldValue: oldObj[key],
      })
    } else if (!hasOld && hasNew) {
      // 新增的 key
      diffs.push({
        path: currentPath,
        type: 'added',
        newValue: newObj[key],
      })
    } else {
      // 两边都有，递归比较值
      compareValues(oldObj[key], newObj[key], currentPath, mode, diffs)
    }
  }
}

/**
 * 检查 key 顺序（严格模式）
 * 只检查共同 key 之间的相对顺序变化，忽略因删除/新增导致的索引变化
 */
function checkKeyOrder(
  oldKeys: string[],
  newKeys: string[],
  basePath: string,
  diffs: DiffItem[]
): void {
  // 找出共同的 key
  const commonKeys = oldKeys.filter((key) => newKeys.includes(key))
  
  // 获取共同 key 在旧数组中的相对顺序
  const oldCommonOrder = commonKeys.slice().sort((a, b) => 
    oldKeys.indexOf(a) - oldKeys.indexOf(b)
  )
  
  // 获取共同 key 在新数组中的相对顺序
  const newCommonOrder = commonKeys.slice().sort((a, b) => 
    newKeys.indexOf(a) - newKeys.indexOf(b)
  )

  // 只有当共同 key 的相对顺序发生变化时才报告
  for (let i = 0; i < oldCommonOrder.length; i++) {
    if (oldCommonOrder[i] !== newCommonOrder[i]) {
      // 找出在新顺序中位置发生变化的 key
      const key = oldCommonOrder[i]
      const newPosition = newCommonOrder.indexOf(key)
      
      if (i !== newPosition) {
        const currentPath = basePath ? `${basePath}.${key}` : key

        // 检查是否已经添加过顺序变化
        const alreadyAdded = diffs.some(
          (d) => d.path === currentPath && d.type === 'order_changed'
        )

        if (!alreadyAdded) {
          diffs.push({
            path: currentPath,
            type: 'order_changed',
            oldIndex: i,
            newIndex: newPosition,
          })
        }
      }
    }
  }
}

/**
 * 比较两个数组
 */
function compareArrays(
  oldArr: JsonArray,
  newArr: JsonArray,
  basePath: string,
  mode: DiffMode,
  diffs: DiffItem[]
): void {
  const maxLength = Math.max(oldArr.length, newArr.length)

  for (let i = 0; i < maxLength; i++) {
    const currentPath = `${basePath}[${i}]`
    const hasOld = i < oldArr.length
    const hasNew = i < newArr.length

    if (hasOld && !hasNew) {
      // 删除的元素
      diffs.push({
        path: currentPath,
        type: 'removed',
        oldValue: oldArr[i],
      })
    } else if (!hasOld && hasNew) {
      // 新增的元素
      diffs.push({
        path: currentPath,
        type: 'added',
        newValue: newArr[i],
      })
    } else {
      // 两边都有，递归比较
      compareValues(oldArr[i], newArr[i], currentPath, mode, diffs)
    }
  }
}

/**
 * 获取值的类型
 */
function getValueType(value: JsonValue): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

/**
 * 判断两个基本值是否相等
 */
function isEqual(a: JsonValue, b: JsonValue): boolean {
  // 处理 null
  if (a === null && b === null) return true
  if (a === null || b === null) return false

  // 处理数组
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => isEqual(item, b[index]))
  }

  // 处理对象
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    return keysA.every((key) => isEqual((a as JsonObject)[key], (b as JsonObject)[key]))
  }

  // 基本类型
  return a === b
}

/**
 * 格式化路径显示
 */
export function formatPath(path: string): string {
  if (!path) return '(root)'
  return path
}

/**
 * 格式化值显示
 */
export function formatValue(value: JsonValue | undefined): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

/**
 * 获取差异类型的显示名称
 */
export function getDiffTypeName(type: DiffType): string {
  const names: Record<DiffType, string> = {
    added: '新增',
    removed: '删除',
    modified: '修改',
    unchanged: '未变化',
    order_changed: '顺序变化',
  }
  return names[type]
}

/**
 * 获取差异类型的颜色
 */
export function getDiffTypeColor(type: DiffType): string {
  const colors: Record<DiffType, string> = {
    added: '#4ade80', // 绿色
    removed: '#f87171', // 红色
    modified: '#fbbf24', // 黄色
    unchanged: '#9ca3af', // 灰色
    order_changed: '#60a5fa', // 蓝色
  }
  return colors[type]
}

