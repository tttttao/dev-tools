/**
 * JSON 对比工具测试用例
 */
import { describe, it, expect } from 'vitest'
import { compareJson, formatValue, getDiffTypeName, getDiffTypeColor } from './json-diff'

describe('compareJson - 宽松模式 (loose)', () => {
  it('相同的简单对象应该返回相等', () => {
    const old = { name: '张三', age: 25 }
    const newObj = { name: '张三', age: 25 }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(true)
    expect(result.diffs).toHaveLength(0)
  })

  it('不同顺序但内容相同的对象应该返回相等（宽松模式）', () => {
    const old = { name: '张三', age: 25 }
    const newObj = { age: 25, name: '张三' }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(true)
    expect(result.diffs).toHaveLength(0)
  })

  it('应该检测到新增的属性', () => {
    const old = { name: '张三' }
    const newObj = { name: '张三', age: 25 }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs).toHaveLength(1)
    expect(result.diffs[0].type).toBe('added')
    expect(result.diffs[0].path).toBe('age')
    expect(result.diffs[0].newValue).toBe(25)
  })

  it('应该检测到删除的属性', () => {
    const old = { name: '张三', age: 25 }
    const newObj = { name: '张三' }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs).toHaveLength(1)
    expect(result.diffs[0].type).toBe('removed')
    expect(result.diffs[0].path).toBe('age')
    expect(result.diffs[0].oldValue).toBe(25)
  })

  it('应该检测到修改的属性', () => {
    const old = { name: '张三', age: 25 }
    const newObj = { name: '李四', age: 25 }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs).toHaveLength(1)
    expect(result.diffs[0].type).toBe('modified')
    expect(result.diffs[0].path).toBe('name')
    expect(result.diffs[0].oldValue).toBe('张三')
    expect(result.diffs[0].newValue).toBe('李四')
  })

  it('应该递归比较嵌套对象', () => {
    const old = { 
      user: { 
        name: '张三', 
        address: { city: '北京' } 
      } 
    }
    const newObj = { 
      user: { 
        name: '张三', 
        address: { city: '上海' } 
      } 
    }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs).toHaveLength(1)
    expect(result.diffs[0].path).toBe('user.address.city')
    expect(result.diffs[0].type).toBe('modified')
  })

  it('应该比较数组元素', () => {
    const old = { items: ['a', 'b', 'c'] }
    const newObj = { items: ['a', 'x', 'c'] }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs).toHaveLength(1)
    expect(result.diffs[0].path).toBe('items[1]')
    expect(result.diffs[0].type).toBe('modified')
  })

  it('应该检测数组长度变化 - 新增元素', () => {
    const old = { items: ['a', 'b'] }
    const newObj = { items: ['a', 'b', 'c'] }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs).toHaveLength(1)
    expect(result.diffs[0].path).toBe('items[2]')
    expect(result.diffs[0].type).toBe('added')
  })

  it('应该检测数组长度变化 - 删除元素', () => {
    const old = { items: ['a', 'b', 'c'] }
    const newObj = { items: ['a', 'b'] }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs).toHaveLength(1)
    expect(result.diffs[0].path).toBe('items[2]')
    expect(result.diffs[0].type).toBe('removed')
  })

  it('应该处理 null 值', () => {
    const old = { value: null }
    const newObj = { value: 'test' }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs[0].type).toBe('modified')
  })

  it('应该处理布尔值', () => {
    const old = { active: true }
    const newObj = { active: false }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs[0].type).toBe('modified')
  })

  it('应该处理数字类型', () => {
    const old = { count: 10 }
    const newObj = { count: 20 }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs[0].oldValue).toBe(10)
    expect(result.diffs[0].newValue).toBe(20)
  })

  it('应该检测类型变化', () => {
    const old = { value: '123' }
    const newObj = { value: 123 }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs[0].type).toBe('modified')
  })
})

describe('compareJson - 严格模式 (strict)', () => {
  it('相同顺序的对象应该返回相等', () => {
    const old = { name: '张三', age: 25 }
    const newObj = { name: '张三', age: 25 }
    
    const result = compareJson(old, newObj, 'strict')
    
    expect(result.isEqual).toBe(true)
  })

  it('不同顺序的对象应该检测到顺序变化', () => {
    const old = { name: '张三', age: 25 }
    const newObj = { age: 25, name: '张三' }
    
    const result = compareJson(old, newObj, 'strict')
    
    expect(result.isEqual).toBe(false)
    // 应该检测到 key 顺序变化
    const orderChanges = result.diffs.filter(d => d.type === 'order_changed')
    expect(orderChanges.length).toBeGreaterThan(0)
  })

  it('严格模式下应该同时检测值修改和顺序变化', () => {
    const old = { a: 1, b: 2, c: 3 }
    const newObj = { c: 3, b: 5, a: 1 }
    
    const result = compareJson(old, newObj, 'strict')
    
    expect(result.isEqual).toBe(false)
    // 应该有值修改
    const modified = result.diffs.filter(d => d.type === 'modified')
    expect(modified.length).toBeGreaterThan(0)
    // 应该有顺序变化
    const orderChanges = result.diffs.filter(d => d.type === 'order_changed')
    expect(orderChanges.length).toBeGreaterThan(0)
  })
})

describe('compareJson - 边界情况', () => {
  it('应该处理空对象', () => {
    const result = compareJson({}, {}, 'loose')
    expect(result.isEqual).toBe(true)
  })

  it('应该处理空数组', () => {
    const result = compareJson([], [], 'loose')
    expect(result.isEqual).toBe(true)
  })

  it('应该处理根级别的数组', () => {
    const old = [1, 2, 3]
    const newObj = [1, 2, 4]
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs[0].path).toBe('[2]')
  })

  it('应该处理深层嵌套', () => {
    const old = { a: { b: { c: { d: { e: 1 } } } } }
    const newObj = { a: { b: { c: { d: { e: 2 } } } } }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs[0].path).toBe('a.b.c.d.e')
  })

  it('应该处理混合数组和对象', () => {
    const old = { 
      users: [
        { name: '张三', scores: [90, 85] }
      ] 
    }
    const newObj = { 
      users: [
        { name: '张三', scores: [90, 95] }
      ] 
    }
    
    const result = compareJson(old, newObj, 'loose')
    
    expect(result.isEqual).toBe(false)
    expect(result.diffs[0].path).toBe('users[0].scores[1]')
  })
})

describe('辅助函数', () => {
  describe('formatValue', () => {
    it('应该格式化字符串', () => {
      expect(formatValue('test')).toBe('"test"')
    })

    it('应该格式化数字', () => {
      expect(formatValue(123)).toBe('123')
    })

    it('应该格式化 null', () => {
      expect(formatValue(null)).toBe('null')
    })

    it('应该格式化 undefined', () => {
      expect(formatValue(undefined)).toBe('undefined')
    })

    it('应该格式化对象', () => {
      const result = formatValue({ a: 1 })
      expect(result).toContain('"a"')
      expect(result).toContain('1')
    })
  })

  describe('getDiffTypeName', () => {
    it('应该返回正确的中文名称', () => {
      expect(getDiffTypeName('added')).toBe('新增')
      expect(getDiffTypeName('removed')).toBe('删除')
      expect(getDiffTypeName('modified')).toBe('修改')
      expect(getDiffTypeName('unchanged')).toBe('未变化')
      expect(getDiffTypeName('order_changed')).toBe('顺序变化')
    })
  })

  describe('getDiffTypeColor', () => {
    it('应该返回颜色值', () => {
      expect(getDiffTypeColor('added')).toBe('#4ade80')
      expect(getDiffTypeColor('removed')).toBe('#f87171')
      expect(getDiffTypeColor('modified')).toBe('#fbbf24')
      expect(getDiffTypeColor('order_changed')).toBe('#60a5fa')
    })
  })
})

