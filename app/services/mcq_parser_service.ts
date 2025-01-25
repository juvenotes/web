export class MCQParserError extends Error {
  constructor(
    message: string,
    public line: number
  ) {
    super(message)
    this.name = 'MCQParserError'
  }
}

export class MCQParser {
  static parse(content: string) {
    const questions = []
    const lines = content.split('\n')
    let currentQuestion: any = {}
    let currentSection = 'stem'
    let lineNumber = 0

    for (let i = 0; i < lines.length; i++) {
      lineNumber++
      const line = lines[i].trim()

      if (!line) {
        if (currentSection === 'explanation') {
          // Two newlines indicate new question
          if (!lines[i + 1]?.trim()) {
            if (this.isValidQuestion(currentQuestion)) {
              questions.push({ ...currentQuestion })
              currentQuestion = {}
              currentSection = 'stem'
              i++ // Skip second newline
            }
          }
        }
        continue
      }

      if (currentSection === 'stem') {
        currentQuestion.stem = line
        currentQuestion.choices = []
        currentSection = 'choices'
      } else if (currentSection === 'choices') {
        if (line.startsWith('ANSWER:')) {
          currentQuestion.answer = line.replace('ANSWER:', '').trim()
          currentSection = 'explanation'
        } else if (/^[A-E]\.\s/.test(line)) {
          currentQuestion.choices.push(line)
        } else {
          throw new MCQParserError('Invalid choice format', lineNumber)
        }
      } else if (currentSection === 'explanation') {
        if (line.startsWith('EXPLANATION:')) {
          currentQuestion.explanation = line.replace('EXPLANATION:', '').trim()
        }
      }
    }

    // Add last question if valid
    if (this.isValidQuestion(currentQuestion)) {
      questions.push(currentQuestion)
    }

    return questions
  }

  private static isValidQuestion(question: any) {
    return (
      question.stem && question.choices?.length === 5 && question.answer && question.explanation
    )
  }
}
