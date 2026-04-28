/**
 * 安全地解析 JSON 字符串
 * 防止原型污染漏洞 (Prototype Pollution)
 */
export function safeJsonParse(text: string): any {
  return JSON.parse(text, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined
    }
    return value
  })
}
