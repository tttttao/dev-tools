import { describe, it, expect } from 'vitest'
import { safeJsonParse } from './json-utils'

describe('safeJsonParse', () => {
  it('should parse valid JSON', () => {
    const json = '{"a": 1, "b": "test", "c": [1, 2, 3]}'
    expect(safeJsonParse(json)).toEqual({
      a: 1,
      b: 'test',
      c: [1, 2, 3],
    })
  })

  it('should strip __proto__ key', () => {
    const json = '{"a": 1, "__proto__": {"polluted": true}}'
    const result = safeJsonParse(json)
    expect(result.a).toBe(1)
    expect(result.__proto__).not.toEqual({ polluted: true })
    expect(Object.keys(result)).not.toContain('__proto__')
  })

  it('should strip constructor key', () => {
    const json = '{"a": 1, "constructor": {"polluted": true}}'
    const result = safeJsonParse(json)
    expect(result.a).toBe(1)
    expect(result.constructor).toBeUndefined()
    expect(Object.keys(result)).not.toContain('constructor')
  })

  it('should strip prototype key', () => {
    const json = '{"a": 1, "prototype": {"polluted": true}}'
    const result = safeJsonParse(json)
    expect(result.a).toBe(1)
    expect(result.prototype).toBeUndefined()
    expect(Object.keys(result)).not.toContain('prototype')
  })

  it('should strip dangerous keys in nested objects', () => {
    const json = '{"obj": {"__proto__": {"polluted": true}, "a": 2}}'
    const result = safeJsonParse(json)
    expect(result.obj.a).toBe(2)
    expect(result.obj.__proto__).not.toEqual({ polluted: true })
    expect(Object.keys(result.obj)).not.toContain('__proto__')
  })

  it('should strip dangerous keys in arrays', () => {
    const json = '[{"__proto__": {"polluted": true}}, 1]'
    const result = safeJsonParse(json)
    expect(result[1]).toBe(1)
    expect(result[0].__proto__).not.toEqual({ polluted: true })
    expect(Object.keys(result[0])).not.toContain('__proto__')
  })
})
