import { test } from '@japa/runner'
import { jsonToMarkdown } from '#utils/json_to_markdown'

test.group('Utils - JSON to Markdown', () => {
  test('should return empty string for null or undefined input', ({ assert }) => {
    assert.equal(jsonToMarkdown(null), '')
    assert.equal(jsonToMarkdown(undefined), '')
    assert.equal(jsonToMarkdown({}), '')
  })

  test('should process paragraph nodes', ({ assert }) => {
    const json = {
      content: [
        {
          type: 'paragraph',
          content: [{ text: 'Hello world' }]
        }
      ]
    }
    
    const result = jsonToMarkdown(json)
    assert.equal(result, 'Hello world')
  })

  test('should process heading nodes with different levels', ({ assert }) => {
    const json = {
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ text: 'Main Title' }]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ text: 'Subsection' }]
        }
      ]
    }
    
    const result = jsonToMarkdown(json)
    assert.equal(result, '# Main Title\n\n### Subsection')
  })

  test('should process bullet list nodes', ({ assert }) => {
    const json = {
      content: [
        {
          type: 'bulletList',
          content: [
            { content: [{ text: 'First item' }] },
            { content: [{ text: 'Second item' }] }
          ]
        }
      ]
    }
    
    const result = jsonToMarkdown(json)
    assert.equal(result, '* First item\n* Second item')
  })

  test('should process ordered list nodes', ({ assert }) => {
    const json = {
      content: [
        {
          type: 'orderedList',
          content: [
            { content: [{ text: 'First step' }] },
            { content: [{ text: 'Second step' }] }
          ]
        }
      ]
    }
    
    const result = jsonToMarkdown(json)
    assert.equal(result, '1. First step\n1. Second step')
  })

  test('should process code block nodes', ({ assert }) => {
    const json = {
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'javascript' },
          content: [
            { text: 'console.log("hello")' },
            { text: 'const x = 1' }
          ]
        }
      ]
    }
    
    const result = jsonToMarkdown(json)
    assert.equal(result, '```javascript\nconsole.log("hello")\nconst x = 1\n```')
  })

  test('should process code block without language', ({ assert }) => {
    const json = {
      content: [
        {
          type: 'codeBlock',
          attrs: {},
          content: [{ text: 'plain code' }]
        }
      ]
    }
    
    const result = jsonToMarkdown(json)
    assert.equal(result, '```\nplain code\n```')
  })

  test('should process inline formatting marks', ({ assert }) => {
    const json = {
      content: [
        {
          type: 'paragraph',
          content: [
            { text: 'This is ' },
            { text: 'bold', marks: [{ type: 'bold' }] },
            { text: ' and ' },
            { text: 'italic', marks: [{ type: 'italic' }] },
            { text: ' and ' },
            { text: 'code', marks: [{ type: 'code' }] }
          ]
        }
      ]
    }
    
    const result = jsonToMarkdown(json)
    assert.equal(result, 'This is **bold** and *italic* and `code`')
  })

  test('should handle multiple paragraph nodes with proper spacing', ({ assert }) => {
    const json = {
      content: [
        {
          type: 'paragraph',
          content: [{ text: 'First paragraph' }]
        },
        {
          type: 'paragraph',
          content: [{ text: 'Second paragraph' }]
        }
      ]
    }
    
    const result = jsonToMarkdown(json)
    assert.equal(result, 'First paragraph\n\nSecond paragraph')
  })

  test('should handle unknown node types by returning empty string', ({ assert }) => {
    const json = {
      content: [
        {
          type: 'unknownType',
          content: [{ text: 'Should be ignored' }]
        },
        {
          type: 'paragraph',
          content: [{ text: 'Should be processed' }]
        }
      ]
    }
    
    const result = jsonToMarkdown(json)
    assert.equal(result, '\n\nShould be processed')
  })

  test('should handle nodes without content', ({ assert }) => {
    const json = {
      content: [
        {
          type: 'paragraph'
        }
      ]
    }
    
    const result = jsonToMarkdown(json)
    assert.equal(result, '')
  })

  test('should handle complex mixed content', ({ assert }) => {
    const json = {
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ text: 'Documentation' }]
        },
        {
          type: 'paragraph',
          content: [
            { text: 'Here is some ' },
            { text: 'important', marks: [{ type: 'bold' }] },
            { text: ' information.' }
          ]
        },
        {
          type: 'bulletList',
          content: [
            { content: [{ text: 'Point one' }] },
            { content: [{ text: 'Point two' }] }
          ]
        }
      ]
    }
    
    const result = jsonToMarkdown(json)
    const expected = '## Documentation\n\nHere is some **important** information.\n\n* Point one\n* Point two'
    assert.equal(result, expected)
  })
})