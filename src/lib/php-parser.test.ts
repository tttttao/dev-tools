import { describe, it, expect } from 'vitest'
import {
  parsePHPArray,
  smartParsePHPArray,
  simpleParsePHPArray,
  convertToPHP,
} from './php-parser'

describe('PHP Parser', () => {
  describe('smartParsePHPArray', () => {
    it('should parse simple associative array with short syntax', () => {
      const input = "['name' => 'John', 'age' => 30]"
      const expected = { name: 'John', age: 30 }
      expect(smartParsePHPArray(input)).toEqual(expected)
    })

    it('should parse simple associative array with array() syntax', () => {
      const input = "array('name' => 'John', 'age' => 30)"
      const expected = { name: 'John', age: 30 }
      expect(smartParsePHPArray(input)).toEqual(expected)
    })

    it('should parse indexed array', () => {
      const input = "['apple', 'banana', 'cherry']"
      const expected = ['apple', 'banana', 'cherry']
      expect(smartParsePHPArray(input)).toEqual(expected)
    })

    it('should parse nested arrays', () => {
      const input = "['user' => ['name' => 'John', 'roles' => ['admin', 'editor']]]"
      const expected = {
        user: {
          name: 'John',
          roles: ['admin', 'editor'],
        },
      }
      expect(smartParsePHPArray(input)).toEqual(expected)
    })

    it('should handle different data types', () => {
      const input = "['is_active' => true, 'is_deleted' => false, 'score' => 12.5, 'nullable' => null]"
      const expected = {
        is_active: true,
        is_deleted: false,
        score: 12.5,
        nullable: null,
      }
      expect(smartParsePHPArray(input)).toEqual(expected)
    })

    it('should handle mixed quotes (single quotes inside double quotes)', () => {
      const input = `['description' => "It's a wonderful life"]`
      const expected = { description: "It's a wonderful life" }
      expect(smartParsePHPArray(input)).toEqual(expected)
    })

    it('should handle mixed quotes (double quotes inside single quotes)', () => {
      const input = `['quote' => 'He said "Hello"']`
      const expected = { quote: 'He said "Hello"' }
      expect(smartParsePHPArray(input)).toEqual(expected)
    })

    it('should handle escaped quotes', () => {
      const input = `['msg' => 'It\\'s me']`
      const expected = { msg: "It's me" }
      expect(smartParsePHPArray(input)).toEqual(expected)
    })

    it('should handle trailing commas', () => {
      const input = "['a' => 1, 'b' => 2,]"
      const expected = { a: 1, b: 2 }
      expect(smartParsePHPArray(input)).toEqual(expected)
    })

    it('should handle numbers as keys', () => {
       const input = "[1 => 'first', 2 => 'second']"
       // PHP arrays with integer keys are often treated as objects in JS if they are sparse or not 0-indexed sequential
       // The parser implementation seems to check for sequential 0-based index to return Array, otherwise Object.
       const expected = { 1: 'first', 2: 'second' }
       expect(smartParsePHPArray(input)).toEqual(expected)
    })
  })

  describe('simpleParsePHPArray (Fallback)', () => {
    it('should parse simple associative array', () => {
      const input = "['name' => 'John', 'age' => 30]"
      const expected = { name: 'John', age: 30 }
      expect(simpleParsePHPArray(input)).toEqual(expected)
    })

    it('should parse array() syntax', () => {
      const input = "array('name' => 'John', 'age' => 30)"
      const expected = { name: 'John', age: 30 }
      expect(simpleParsePHPArray(input)).toEqual(expected)
    })

    // Note: The simple parser relies on regex replacement to JSON.
    // It might be less robust with complex nested structures or mixed quotes if not handled carefully.

    it('should handle nested arrays', () => {
      const input = "['user' => ['name' => 'John']]"
      const expected = { user: { name: 'John' } }
      expect(simpleParsePHPArray(input)).toEqual(expected)
    })

    it('should handle mixed quotes', () => {
        // The simple parser implementation has specific logic for replacing quotes.
        // Let's verify if it handles "It's" correctly.
        const input = `['desc' => "It's ok"]`
        const expected = { desc: "It's ok" }
        expect(simpleParsePHPArray(input)).toEqual(expected)
    })
  })

  describe('parsePHPArray (Main Entry)', () => {
    it('should clean PHP tags', () => {
      const input = "<?php return ['a' => 1]; ?>"
      const expected = { a: 1 }
      expect(parsePHPArray(input)).toEqual(expected)
    })

    it('should clean variable assignment', () => {
      const input = "$config = ['a' => 1];"
      const expected = { a: 1 }
      expect(parsePHPArray(input)).toEqual(expected)
    })
  })

  describe('convertToPHP', () => {
    it('should convert simple object to PHP array string', () => {
      const input = { name: 'John', age: 30 }
      const output = convertToPHP(input)
      expect(output).toContain("'name' => 'John'")
      expect(output).toContain("'age' => 30")
      expect(output).toContain('[')
      expect(output).toContain(']')
    })

    it('should convert array to PHP array string', () => {
      const input = ['a', 'b']
      const output = convertToPHP(input)
      // Expecting sequential formatting
      expect(output).toContain("'a'")
      expect(output).toContain("'b'")
      // Should probably NOT have keys like 0 =>, 1 => if it detects sequential
    })

    it('should handle null, true, false', () => {
        const input = { a: null, b: true, c: false }
        const output = convertToPHP(input)
        expect(output).toContain("'a' => null")
        expect(output).toContain("'b' => true")
        expect(output).toContain("'c' => false")
    })
  })
})
