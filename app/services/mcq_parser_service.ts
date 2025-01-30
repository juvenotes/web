export class MCQParserError extends Error {
  constructor(
    public message: string,
    public line: number
  ) {
    super(message)
    this.name = 'MCQParserError'
  }
}

interface ParsedMCQ {
  stem: string
  choices: string[]
  answer: string
  explanation: string | null
}

export class MCQParser {
  static parse(content: string): ParsedMCQ[] {
    const startTime = Date.now()
    const questions: ParsedMCQ[] = []

    const context = {
      operation: 'parse_mcq',
      contentLength: content.length,
      startTime: new Date().toISOString(),
    }

    // Normalize and split content
    const normalizedContent = content.replace(/\r\n/g, '\n')
    const blocks = normalizedContent.split(/\n{2,}/).filter(Boolean)

    console.info('starting mcq parsing', {
      ...context,
      blockCount: blocks.length,
    })

    for (const [index, block] of blocks.entries()) {
      const blockContext = {
        ...context,
        blockIndex: index + 1,
        totalBlocks: blocks.length,
      }

      try {
        const lines = block.split('\n').filter(Boolean)

        if (lines.length < 7) {
          console.warn('skipping invalid block', {
            ...blockContext,
            reason: 'insufficient_lines',
            lineCount: lines.length,
          })
          continue
        }

        const stem = lines[0]
        const choices = lines.slice(1, 6).map((line) => line.substring(3).trim())

        const answerLine = lines.find((l) => l.startsWith('ANSWER:'))
        if (!answerLine) {
          console.warn('skipping block without answer', blockContext)
          continue
        }

        const answer = answerLine.split(':')[1].trim()

        const explanationLine = lines.find(
          (l) => l.startsWith('EXPLANATION:') || l.startsWith('FEEDBACK:')
        )
        const explanation = explanationLine ? explanationLine.split(':')[1].trim() : null

        questions.push({ stem, choices, answer, explanation })

        console.info('parsed question block', {
          ...blockContext,
          stemPreview: stem.substring(0, 50),
        })
      } catch (error) {
        console.error('failed to parse block', {
          ...blockContext,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    const duration = Date.now() - startTime
    console.info('completed mcq parsing', {
      ...context,
      questionCount: questions.length,
      durationMs: duration,
      status: 'success',
    })

    return questions
  }
}
