/**
 * PHP 解析相关类型定义
 */

/**
 * PHP 值类型 - 对应 JSON 中的基本类型
 */
export type PHPValue = string | number | boolean | null | PHPArray | PHPObject

/**
 * PHP 数组类型 (索引数组)
 */
export type PHPArray = PHPValue[]

/**
 * PHP 关联数组类型 (对象)
 */
export interface PHPObject {
  [key: string]: PHPValue
}

/**
 * Token 类型枚举
 */
export type TokenType =
  | 'STRING'
  | 'NUMBER'
  | 'LITERAL'
  | 'ARRAY'
  | 'IDENTIFIER'
  | 'ARROW'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'

/**
 * Token 结构
 */
export interface Token {
  type: TokenType
  value?: string | number | boolean | null
  quote?: string
}

/**
 * 解析结果
 */
export interface ParseResult {
  success: boolean
  data?: PHPValue
  error?: string
}

