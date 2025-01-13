export function jsonToMarkdown(json: any): string {
  if (!json || !json.content) return ''

  return json.content
    .map((node: any) => {
      switch (node.type) {
        case 'paragraph':
          return processParagraph(node)
        case 'heading':
          return processHeading(node)
        case 'bulletList':
          return processList(node, '*')
        case 'orderedList':
          return processList(node, '1.')
        case 'codeBlock':
          return processCode(node)
        default:
          return ''
      }
    })
    .join('\n\n')
}

// Helper functions for each node type
function processParagraph(node: any): string {
  return processInlineContent(node.content || [])
}

function processHeading(node: any): string {
  const level = '#'.repeat(node.attrs.level)
  return `${level} ${processInlineContent(node.content || [])}`
}

function processList(node: any, marker: string): string {
  return node.content
    .map((item: any) => `${marker} ${processInlineContent(item.content || [])}`)
    .join('\n')
}

function processCode(node: any): string {
  return (
    '```' +
    (node.attrs.language || '') +
    '\n' +
    node.content.map((n: any) => n.text).join('\n') +
    '\n```'
  )
}

function processInlineContent(content: any[]): string {
  return content
    .map((node) => {
      let text = node.text || ''
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case 'bold':
              text = `**${text}**`
              break
            case 'italic':
              text = `*${text}*`
              break
            case 'code':
              text = `\`${text}\``
              break
          }
        })
      }
      return text
    })
    .join('')
}
