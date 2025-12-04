import { describe, it, expect } from 'vitest'
import { parseDDL } from './ddl-parser'

describe('DDL Parser', () => {
  describe('CREATE TABLE', () => {
    it('should parse simple CREATE TABLE statement', () => {
      const ddl = `
        CREATE TABLE users (
          id INT PRIMARY KEY,
          name VARCHAR(100)
        );
      `
      const result = parseDDL(ddl)
      expect(result.tables).toHaveLength(1)
      const table = result.tables[0]
      expect(table.tableName).toBe('users')
      expect(table.fields).toHaveLength(2)
      expect(table.fields[0].name).toBe('id')
      expect(table.fields[0].type).toBe('INT')
      expect(table.fields[0].isPrimaryKey).toBe(true)
      expect(table.fields[1].name).toBe('name')
      expect(table.fields[1].type).toBe('VARCHAR(100)')
    })

    it('should parse table with comments and options', () => {
      const ddl = `
        CREATE TABLE \`products\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
          \`price\` decimal(10,2) DEFAULT '0.00',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Product Table';
      `
      const result = parseDDL(ddl)
      expect(result.tables).toHaveLength(1)
      const table = result.tables[0]
      expect(table.tableName).toBe('products')
      expect(table.tableComment).toBe('Product Table')
      expect(table.fields[0].autoIncrement).toBe(true)
      expect(table.fields[0].comment).toBe('ID')
      expect(table.fields[1].defaultValue).toBe('0.00')
    })

    it('should parse inline indexes', () => {
      const ddl = `
        CREATE TABLE logs (
          id INT,
          user_id INT,
          action VARCHAR(50),
          INDEX idx_user (user_id),
          UNIQUE KEY uk_action (action)
        );
      `
      const result = parseDDL(ddl)
      const table = result.tables[0]
      expect(table.indexes).toHaveLength(2)
      expect(table.indexes.find(i => i.name === 'idx_user')?.type).toBe('INDEX')
      expect(table.indexes.find(i => i.name === 'uk_action')?.type).toBe('UNIQUE')
    })
  })

  describe('CREATE INDEX', () => {
    it('should parse standalone CREATE INDEX statements', () => {
      const ddl = `
        CREATE TABLE users (id INT);
        CREATE INDEX idx_name ON users (name);
        CREATE UNIQUE INDEX idx_email ON users (email);
      `
      const result = parseDDL(ddl)
      const table = result.tables[0]
      // Indexes should be attached to the table if it exists in the same context
      expect(table.indexes).toHaveLength(2)
      expect(table.indexes.find(i => i.name === 'idx_name')).toBeDefined()
      expect(table.indexes.find(i => i.name === 'idx_email')?.type).toBe('UNIQUE')
    })

    it('should handle standalone indexes for unknown tables', () => {
        const ddl = `CREATE INDEX idx_unknown ON unknown_table (col1);`
        const result = parseDDL(ddl)
        expect(result.standaloneIndexes).toHaveLength(1)
        expect(result.standaloneIndexes[0].tableName).toBe('unknown_table')
        expect(result.standaloneIndexes[0].index.name).toBe('idx_unknown')
    })
  })

  describe('Robustness', () => {
    it('should ignore comments', () => {
      const ddl = `
        -- This is a comment
        /* Multi-line
           comment */
        CREATE TABLE test (id INT); -- Inline comment
      `
      const result = parseDDL(ddl)
      expect(result.tables).toHaveLength(1)
    })

    it('should handle invalid DDL gracefully (or throw handled error)', () => {
       // The current implementation throws Error('无法识别 CREATE TABLE 语句') or similar.
       // We want to ensure it doesn't crash effectively, or throws a specific error we can catch.
       const ddl = `CREATE TABLE;`
       expect(() => parseDDL(ddl)).toThrow()
    })

    it('should handle multiple statements with messy formatting', () => {
        const ddl = `CREATE TABLE t1(id int);;;   CREATE TABLE t2(id int)`
        const result = parseDDL(ddl)
        expect(result.tables).toHaveLength(2)
    })
  })
})
