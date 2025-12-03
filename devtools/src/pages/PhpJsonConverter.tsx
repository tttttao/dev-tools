import { useState } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { useToast } from '../hooks/useToast'
import { useClipboard } from '../hooks/useClipboard'
import { parsePHPArray, convertToPHP } from '../lib/php-parser'

/**
 * PHP/JSON 转换器页面
 * 
 * 支持 PHP 数组格式与 JSON 格式的双向转换。
 */
export function PhpJsonConverter() {
  // 状态
  const [phpInput, setPhpInput] = useState('')
  const [jsonInput, setJsonInput] = useState('')
  
  // Hooks
  const { success, error } = useToast()
  const { copy } = useClipboard()

  /**
   * PHP -> JSON 转换
   */
  const handlePhpToJson = () => {
    if (!phpInput.trim()) {
      error('请输入 PHP 数组格式')
      return
    }

    try {
      const result = parsePHPArray(phpInput)
      const jsonString = JSON.stringify(result, null, 2)
      setJsonInput(jsonString)
      success('转换成功！')
    } catch (err) {
      error('转换失败：' + (err instanceof Error ? err.message : '未知错误'))
    }
  }

  /**
   * JSON -> PHP 转换
   */
  const handleJsonToPhp = () => {
    if (!jsonInput.trim()) {
      error('请输入 JSON 格式')
      return
    }

    try {
      const jsonObj = JSON.parse(jsonInput)
      const phpString = convertToPHP(jsonObj)
      setPhpInput(phpString)
      success('转换成功！')
    } catch {
      error('转换失败：请检查 JSON 格式是否正确')
    }
  }

  /**
   * 清空输入
   */
  const handleClear = () => {
    setPhpInput('')
    setJsonInput('')
  }

  /**
   * 复制 PHP 结果
   */
  const handleCopyPhp = async () => {
    if (!phpInput) {
      error('没有可复制的内容')
      return
    }
    const copied = await copy(phpInput)
    if (copied) success('已复制 PHP 代码')
  }

  /**
   * 复制 JSON 结果
   */
  const handleCopyJson = async () => {
    if (!jsonInput) {
      error('没有可复制的内容')
      return
    }
    const copied = await copy(jsonInput)
    if (copied) success('已复制 JSON')
  }

  return (
    <div className="space-y-6">
      {/* 页面标题卡片 */}
      <Card>
        <CardHeader
          icon="🔄"
          title="PHP数组 ⇄ JSON 转换器"
          description="在 PHP 数组格式和 JSON 格式之间快速转换"
        />
        
        <CardContent>
          {/* 双栏布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PHP 输入区 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--fg-primary)]">
                  PHP 数组格式
                </h3>
                <Button variant="ghost" size="sm" onClick={handleCopyPhp}>
                  复制
                </Button>
              </div>
              <Textarea
                value={phpInput}
                onChange={(e) => setPhpInput(e.target.value)}
                placeholder={`请输入 PHP 数组格式，例如：

array(
    'name' => '张三',
    'age' => 25,
    'skills' => array('PHP', 'JavaScript', 'Python')
)

或者简化格式：
[
    'name' => '张三',
    'age' => 25,
    'skills' => ['PHP', 'JavaScript', 'Python']
]`}
                className="min-h-[300px]"
              />
            </div>

            {/* JSON 输入区 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--fg-primary)]">
                  JSON 格式
                </h3>
                <Button variant="ghost" size="sm" onClick={handleCopyJson}>
                  复制
                </Button>
              </div>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`请输入 JSON 格式，例如：

{
    "name": "张三",
    "age": 25,
    "skills": ["PHP", "JavaScript", "Python"]
}`}
                className="min-h-[300px]"
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-[var(--border-subtle)]">
            <Button onClick={handlePhpToJson}>
              PHP → JSON
            </Button>
            <Button onClick={handleJsonToPhp}>
              JSON → PHP
            </Button>
            <Button variant="secondary" onClick={handleClear}>
              清空
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardContent className="text-sm text-[var(--fg-secondary)] space-y-2">
          <h4 className="font-medium text-[var(--fg-primary)]">💡 使用说明</h4>
          <ul className="list-disc list-inside space-y-1 text-[var(--fg-muted)]">
            <li>支持传统 <code className="px-1 py-0.5 bg-[var(--bg-hover)] rounded">array()</code> 语法和简化 <code className="px-1 py-0.5 bg-[var(--bg-hover)] rounded">[]</code> 语法</li>
            <li>支持嵌套数组和关联数组</li>
            <li>支持 PHP 特殊值：<code className="px-1 py-0.5 bg-[var(--bg-hover)] rounded">true</code>, <code className="px-1 py-0.5 bg-[var(--bg-hover)] rounded">false</code>, <code className="px-1 py-0.5 bg-[var(--bg-hover)] rounded">null</code></li>
            <li>自动处理单引号和双引号字符串</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

