/**
 * PHP 数组解析器
 * 
 * 支持将 PHP 数组格式转换为 JSON，以及将 JSON 转换为 PHP 数组格式。
 * 支持两种 PHP 数组语法：
 * - 传统语法: array('key' => 'value')
 * - 简化语法: ['key' => 'value']
 */

import type { Token, TokenType, PHPValue, PHPObject, PHPArray } from '../types/php'

// ==================== PHP -> JSON ====================

/**
 * 将 PHP 数组字符串解析为 JavaScript 对象
 * 
 * @param phpString - PHP 数组字符串
 * @returns 解析后的 JavaScript 对象
 * @throws 解析失败时抛出错误
 * 
 * @example
 * ```ts
 * const result = parsePHPArray("['name' => '张三', 'age' => 25]")
 * // result: { name: '张三', age: 25 }
 * ```
 */
export function parsePHPArray(phpString: string): PHPValue {
  // 清理输入
  let cleanString = phpString
    .replace(/<\?php|<\?|\?>/g, '') // 移除 PHP 标签
    .trim()
  
  // 移除 return 关键字
  cleanString = cleanString.replace(/^return\s+/, '')
  // 移除变量赋值
  cleanString = cleanString.replace(/^\$\w+\s*=\s*/, '')
  // 移除末尾分号
  cleanString = cleanString.replace(/;$/, '')

  // 尝试智能解析
  try {
    return smartParsePHPArray(cleanString)
  } catch {
    // 降级到简单解析
    return simpleParsePHPArray(cleanString)
  }
}

/**
 * 智能 PHP 数组解析器
 * 使用词法分析和语法解析
 */
export function smartParsePHPArray(phpString: string): PHPValue {
  const tokens = tokenize(phpString)
  return parseTokens(tokens)
}

/**
 * 词法分析 - 将字符串转换为 Token 数组
 */
function tokenize(str: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < str.length) {
    const char = str[i]

    // 跳过空白字符
    if (/\s/.test(char)) {
      i++
      continue
    }

    // 字符串 (单引号或双引号)
    if (char === '"' || char === "'") {
      const quote = char
      let value = ''
      i++
      
      while (i < str.length && str[i] !== quote) {
        // 处理转义字符
        if (str[i] === '\\' && i + 1 < str.length) {
          value += str[i] + str[i + 1]
          i += 2
        } else {
          value += str[i]
          i++
        }
      }
      
      tokens.push({ type: 'STRING', value: unescapeString(value), quote })
      i++ // 跳过结束引号
      continue
    }

    // 数字 (包括负数和小数)
    if (/\d/.test(char) || (char === '-' && /\d/.test(str[i + 1]))) {
      let value = ''
      if (char === '-') {
        value += char
        i++
      }
      
      while (i < str.length && /[\d.]/.test(str[i])) {
        value += str[i]
        i++
      }
      
      tokens.push({ type: 'NUMBER', value: parseFloat(value) })
      continue
    }

    // 标识符 (关键字或变量名)
    if (/[a-zA-Z_]/.test(char)) {
      let value = ''
      
      while (i < str.length && /[a-zA-Z0-9_]/.test(str[i])) {
        value += str[i]
        i++
      }

      // 检查是否是关键字
      if (value === 'array') {
        tokens.push({ type: 'ARRAY' })
      } else if (['true', 'false', 'null'].includes(value.toLowerCase())) {
        tokens.push({ type: 'LITERAL', value: value.toLowerCase() })
      } else {
        tokens.push({ type: 'IDENTIFIER', value })
      }
      continue
    }

    // 箭头操作符 =>
    if (char === '=' && str[i + 1] === '>') {
      tokens.push({ type: 'ARROW' })
      i += 2
      continue
    }

    // 单字符 Token
    const singleCharTokens: Record<string, TokenType> = {
      '[': 'LBRACKET',
      ']': 'RBRACKET',
      '(': 'LPAREN',
      ')': 'RPAREN',
      ',': 'COMMA',
    }

    if (singleCharTokens[char]) {
      tokens.push({ type: singleCharTokens[char] })
      i++
      continue
    }

    // 跳过未知字符
    i++
  }

  return tokens
}

/**
 * 语法解析 - 将 Token 数组转换为 JavaScript 对象
 */
function parseTokens(tokens: Token[]): PHPValue {
  let pos = 0

  /**
   * 解析单个值
   */
  function parseValue(): PHPValue {
    const token = tokens[pos]
    
    if (!token) {
      throw new Error('意外的输入结束')
    }

    // 字符串
    if (token.type === 'STRING') {
      pos++
      return token.value as string
    }

    // 数字
    if (token.type === 'NUMBER') {
      pos++
      return token.value as number
    }

    // 字面量 (true, false, null)
    if (token.type === 'LITERAL') {
      pos++
      const val = token.value as string
      if (val === 'true') return true
      if (val === 'false') return false
      return null
    }

    // 数组
    if (token.type === 'LBRACKET' || token.type === 'ARRAY') {
      return parseArray()
    }

    throw new Error(`无法解析的值: ${JSON.stringify(token)}`)
  }

  /**
   * 解析数组
   */
  function parseArray(): PHPValue {
    const result: PHPObject = {}
    let isIndexedArray = true
    let index = 0

    // 跳过 array 关键字或左括号
    if (tokens[pos]?.type === 'ARRAY') {
      pos++
      if (tokens[pos]?.type === 'LPAREN') pos++
    } else if (tokens[pos]?.type === 'LBRACKET') {
      pos++
    }

    // 解析数组元素
    while (
      pos < tokens.length &&
      tokens[pos]?.type !== 'RBRACKET' &&
      tokens[pos]?.type !== 'RPAREN'
    ) {
      let key: string | number = index

      // 检查是否有键
      if (pos + 1 < tokens.length && tokens[pos + 1]?.type === 'ARROW') {
        const keyValue = parseValue()
        key = typeof keyValue === 'number' ? keyValue : String(keyValue)
        pos++ // 跳过箭头
        isIndexedArray = false
      }

      // 解析值
      const value = parseValue()
      result[key] = value

      if (isIndexedArray) index++

      // 跳过逗号
      if (tokens[pos]?.type === 'COMMA') pos++
    }

    // 跳过结束括号
    if (tokens[pos]?.type === 'RBRACKET' || tokens[pos]?.type === 'RPAREN') {
      pos++
    }

    // 如果是索引数组，转换为真正的数组
    if (isIndexedArray) {
      const arr: PHPArray = []
      for (let i = 0; i < index; i++) {
        arr[i] = result[i]
      }
      return arr
    }

    return result
  }

  return parseValue()
}

/**
 * 简单 PHP 数组解析器 (降级方案)
 * 通过字符串替换转换为 JSON 格式
 */
export function simpleParsePHPArray(phpString: string): PHPValue {
  let cleanString = phpString

  // 替换 array() 为 []
  cleanString = replaceArraySyntax(cleanString)
  
  // 替换 => 为 :
  cleanString = replaceArrowSyntax(cleanString)
  
  // 替换单引号为双引号
  cleanString = replaceSingleQuotes(cleanString)
  
  // 替换 PHP 特殊值
  cleanString = replacePhpValues(cleanString)
  
  // 修复键格式
  cleanString = fixKeyFormat(cleanString)

  // 转换关联数组的括号 [] -> {}
  cleanString = convertBrackets(cleanString)

  return JSON.parse(cleanString)
}

/**
 * 转换关联数组的括号 [] -> {}
 *
 * 只有当括号内包含键值对 (:) 时才进行转换
 */
function convertBrackets(str: string): string {
  const stack: { index: number; containsColon: boolean }[] = []
  const pairs: { open: number; close: number; containsColon: boolean }[] = []

  let inString = false
  let stringChar = ''
  let escaped = false

  for (let i = 0; i < str.length; i++) {
    const char = str[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"' || char === "'") {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
      }
      continue
    }

    if (inString) continue

    if (char === '[') {
      stack.push({ index: i, containsColon: false })
    } else if (char === ']') {
      const top = stack.pop()
      if (top) {
        pairs.push({ open: top.index, close: i, containsColon: top.containsColon })
        // 如果当前块包含冒号，那么父块也相当于"包含"了这个复杂结构（虽然不一定是冒号，但这里我们只关心当前层级）
        // 其实不需要传递给父级，因为父级只关心它直接包含的元素是否是 key: value。
        // 但是嵌套的对象 {"a": {"b": 1}} 在父级看来是 "key": value，所以父级肯定有冒号。
      }
    } else if (char === ':') {
      if (stack.length > 0) {
        stack[stack.length - 1].containsColon = true
      }
    }
  }

  // 从后往前替换，这样不会影响索引
  let result = str.split('')
  pairs.sort((a, b) => b.open - a.open)

  for (const pair of pairs) {
    if (pair.containsColon) {
      result[pair.open] = '{'
      result[pair.close] = '}'
    }
  }

  return result.join('')
}

/**
 * 替换 array() 语法为 []
 */
function replaceArraySyntax(str: string): string {
  let result = str
  let changed = true
  
  while (changed) {
    const before = result
    result = result.replace(/\barray\s*\(/g, '[')
    changed = before !== result
  }
  
  return balanceParentheses(result)
}

/**
 * 平衡括号 - 将 array() 的 ) 替换为 ]
 */
function balanceParentheses(str: string): string {
  let result = ''
  let inString = false
  let stringChar = ''
  let escaped = false

  for (let i = 0; i < str.length; i++) {
    const char = str[i]

    if (escaped) {
      result += char
      escaped = false
      continue
    }

    if (char === '\\') {
      result += char
      escaped = true
      continue
    }

    if (!inString && (char === '"' || char === "'")) {
      inString = true
      stringChar = char
      result += char
      continue
    }

    if (inString && char === stringChar) {
      inString = false
      stringChar = ''
      result += char
      continue
    }

    if (inString) {
      result += char
      continue
    }

    if (char === '(') {
      result += '['
    } else if (char === ')') {
      result += ']'
    } else {
      result += char
    }
  }

  return result
}

/**
 * 替换箭头语法 => 为 :
 */
function replaceArrowSyntax(str: string): string {
  return str.replace(
    /((?:'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"|\w+|\d+))\s*=>\s*/g,
    (_, key: string) => {
      if (/^\d+$/.test(key)) return key + ': '
      if (key.match(/^['"]/)) return key + ': '
      return '"' + key + '": '
    }
  )
}

/**
 * 替换单引号字符串为双引号
 */
function replaceSingleQuotes(str: string): string {
  let result = ''
  let inDoubleQuote = false
  let escaped = false

  for (let i = 0; i < str.length; i++) {
    const char = str[i]

    if (escaped) {
      result += char
      escaped = false
      continue
    }

    if (char === '\\') {
      result += char
      escaped = true
      continue
    }

    if (char === '"') {
      inDoubleQuote = !inDoubleQuote
      result += char
      continue
    }

    if (inDoubleQuote) {
      result += char
      continue
    }

    if (char === "'") {
      result += '"'
    } else {
      result += char
    }
  }

  return result
}

/**
 * 替换 PHP 特殊值
 */
function replacePhpValues(str: string): string {
  let result = str.replace(/\b(true|false|null|TRUE|FALSE|NULL)\b/g, (match) => {
    return match.toLowerCase()
  })
  
  result = result.replace(/\bINF\b/g, '"Infinity"')
  result = result.replace(/\bNAN\b/g, '"NaN"')
  result = result.replace(/\b-INF\b/g, '"-Infinity"')
  
  return result
}

/**
 * 修复键格式 - 确保键是带引号的字符串
 */
function fixKeyFormat(str: string): string {
  return str.replace(/(\w+)(\s*:\s*)/g, (match, key: string, colon: string) => {
    if (!/^\d+$/.test(key) && !key.match(/^['"]/)) {
      return '"' + key + '"' + colon
    }
    return match
  })
}

/**
 * 处理转义字符
 */
function unescapeString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

// ==================== JSON -> PHP ====================

/**
 * 将 JavaScript 对象转换为 PHP 数组字符串
 * 
 * @param obj - JavaScript 对象
 * @param indent - 当前缩进级别
 * @returns PHP 数组字符串
 * 
 * @example
 * ```ts
 * const php = convertToPHP({ name: '张三', age: 25 })
 * // php: "[\n    'name' => '张三',\n    'age' => 25\n]"
 * ```
 */
export function convertToPHP(obj: PHPValue, indent: number = 0): string {
  const spaces = '    '.repeat(indent)
  const nextSpaces = '    '.repeat(indent + 1)

  // 数组
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'

    let result = '[\n'
    obj.forEach((item, index) => {
      result += nextSpaces + convertToPHP(item, indent + 1)
      if (index < obj.length - 1) result += ','
      result += '\n'
    })
    result += spaces + ']'
    return result
  }

  // 对象
  if (typeof obj === 'object' && obj !== null) {
    const keys = Object.keys(obj)
    if (keys.length === 0) return '[]'

    // 检查是否是纯数字键的顺序数组
    const isNumericKeys = keys.every((key) => /^\d+$/.test(key))
    const isSequentialKeys =
      isNumericKeys &&
      keys
        .map(Number)
        .sort((a, b) => a - b)
        .every((num, index) => num === index)

    let result = '[\n'
    keys.forEach((key, index) => {
      let quotedKey: string

      if (isNumericKeys && isSequentialKeys) {
        // 顺序数字键，省略键
        quotedKey = ''
      } else if (/^\d+$/.test(key)) {
        // 非顺序数字键
        quotedKey = key + ' => '
      } else {
        // 字符串键
        const escapedKey = key.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
        quotedKey = `'${escapedKey}' => `
      }

      result += nextSpaces + quotedKey + convertToPHP((obj as PHPObject)[key], indent + 1)
      if (index < keys.length - 1) result += ','
      result += '\n'
    })
    result += spaces + ']'
    return result
  }

  // 字符串
  if (typeof obj === 'string') {
    const escaped = obj
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
    return `'${escaped}'`
  }

  // 布尔值
  if (typeof obj === 'boolean') {
    return obj ? 'true' : 'false'
  }

  // null
  if (obj === null) {
    return 'null'
  }

  // 数字
  if (typeof obj === 'number') {
    if (isNaN(obj)) return 'NAN'
    if (!isFinite(obj)) return obj > 0 ? 'INF' : '-INF'
    return obj.toString()
  }

  // 其他类型
  return String(obj)
}

