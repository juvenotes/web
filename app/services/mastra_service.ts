import QuestionFeedback from '#models/question_feedback'
import Question from '#models/question'
import mastraConfig from '#config/mastra'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

// Mastra imports
import { Mastra } from '@mastra/core'
import { Agent } from '@mastra/core'

export interface FeedbackResolutionResult {
  success: boolean
  resolution?: string
  suggestions?: string[]
  questionUpdate?: {
    questionId: number
    action: 'update_choice' | 'correct_answer' | 'clarify_text'
    choiceId?: number
    newText?: string
    newIsCorrect?: boolean
  }
  error?: string
}

class MastraService {
  private initialized = false
  private mastra: Mastra | null = null
  private feedbackAgent: Agent | null = null

  constructor() {
    // Initialize service with minimal setup
  }

  /**
   * Initialize Mastra service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Set up the question feedback resolver agent
      await this.setupQuestionFeedbackAgent()

      this.initialized = true
      logger.info('Mastra service initialized successfully')
    } catch (error: any) {
      logger.error('Failed to initialize Mastra service:', error)
      throw error
    }
  }

  /**
   * Set up the question feedback resolver agent
   */
  private async setupQuestionFeedbackAgent(): Promise<void> {
    const agentConfig = mastraConfig.agents?.questionFeedbackResolver

    if (!agentConfig?.enabled) {
      logger.info('Question feedback agent is disabled')
      return
    }

    try {
      // Create the feedback resolution agent
      this.feedbackAgent = new Agent({
        name: 'question-feedback-resolver',
        instructions: agentConfig.systemPrompt,
        model: {
          provider: 'openai',
          config: {
            model: mastraConfig.llm.model,
            apiKey: mastraConfig.llm.apiKey,
            baseURL: `${mastraConfig.llm.endpoint}/openai/deployments/${mastraConfig.llm.deploymentName}`,
            defaultQuery: {
              'api-version': mastraConfig.llm.apiVersion,
            },
          },
        },
      })

      logger.info('Question feedback resolver agent initialized successfully')
    } catch (error: any) {
      logger.error('Failed to setup Mastra agent:', error)
      throw error
    }
  }

  /**
   * Process question feedback and provide resolution suggestions
   */
  async processFeedback(feedbackId: number): Promise<FeedbackResolutionResult> {
    try {
      await this.initialize()

      const feedback = await QuestionFeedback.query()
        .where('id', feedbackId)
        .preload('question')
        .preload('user')
        .first()

      if (!feedback) {
        return {
          success: false,
          error: 'Feedback not found',
        }
      }

      if (feedback.isResolved) {
        return {
          success: false,
          error: 'Feedback is already resolved',
        }
      }

      // Analyze the feedback and generate resolution
      const resolution = await this.generateResolution(feedback)

      return {
        success: true,
        resolution: resolution.text,
        suggestions: resolution.suggestions,
        questionUpdate: resolution.questionUpdate,
      }
    } catch (error: any) {
      logger.error('Error processing feedback:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Resolve question feedback with AI-generated resolution
   */
  async resolveFeedback(
    feedbackId: number,
    resolvedById: number,
    customResolution?: string
  ): Promise<FeedbackResolutionResult> {
    try {
      const feedback = await QuestionFeedback.find(feedbackId)

      if (!feedback) {
        return {
          success: false,
          error: 'Feedback not found',
        }
      }

      if (feedback.isResolved) {
        return {
          success: false,
          error: 'Feedback is already resolved',
        }
      }

      let resolution: string

      if (customResolution) {
        resolution = customResolution
      } else {
        const result = await this.processFeedback(feedbackId)
        if (!result.success || !result.resolution) {
          return {
            success: false,
            error: result.error || 'Failed to generate resolution',
          }
        }
        resolution = result.resolution
      }

      // Update the feedback record
      feedback.isResolved = true
      feedback.resolvedAt = DateTime.now()
      feedback.resolvedBy = resolvedById

      // Store the resolution in a way that fits the current schema
      // Note: The current schema doesn't have a resolution field
      // We could use feedbackText for internal notes or add a resolution field
      // For now, we'll just mark as resolved and log the resolution
      
      // Update the feedback record
      feedback.isResolved = true
      feedback.resolvedAt = DateTime.now()
      feedback.resolvedBy = resolvedById

      await feedback.save()

      logger.info(`Feedback ${feedbackId} resolved by user ${resolvedById} with resolution: ${resolution}`)

      return {
        success: true,
        resolution,
      }
    } catch (error: any) {
      logger.error('Error resolving feedback:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Generate resolution suggestions using Mastra AI agent
   */
  private async generateResolution(feedback: QuestionFeedback): Promise<{
    text: string
    suggestions: string[]
    questionUpdate?: {
      questionId: number
      action: 'update_choice' | 'correct_answer' | 'clarify_text'
      choiceId?: number
      newText?: string
      newIsCorrect?: boolean
    }
  }> {
    if (this.feedbackAgent) {
      try {
        // Load the question and its choices for context
        let question: Question | null = null
        try {
          question = await Question.query()
            .where('id', feedback.questionId)
            .preload('choices')
            .first()
        } catch (error) {
          logger.error('Failed to load question for analysis:', error)
        }

        // Prepare context for the AI agent
        const contextInfo = {
          feedbackText: feedback.feedbackText,
          questionText: question?.questionText || 'Question not available',
          choices: question?.choices?.map(c => ({
            id: c.id,
            text: c.choiceText,
            isCorrect: c.isCorrect
          })) || [],
          difficultyLevel: question?.difficultyLevel || 'unknown'
        }

        // Create a structured prompt for the agent
        const prompt = `
        Please analyze the following question feedback and provide a resolution:

        Feedback: "${feedback.feedbackText}"
        
        Question Context:
        - Question Text: "${contextInfo.questionText}"
        - Difficulty Level: ${contextInfo.difficultyLevel}
        - Choices: ${JSON.stringify(contextInfo.choices, null, 2)}

        Please provide:
        1. A resolution text explaining the issue and recommended action
        2. A list of specific suggestions for improvement
        3. If applicable, recommend specific actions for question updates

        Focus on being constructive and actionable. Consider whether the feedback indicates:
        - Incorrect answers
        - Unclear question wording
        - Inappropriate difficulty level
        - Issues with specific choices

        Return your response in this JSON format:
        {
          "resolution": "Your resolution text here",
          "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
          "questionUpdate": {
            "questionId": ${feedback.questionId},
            "action": "update_choice|correct_answer|clarify_text",
            "choiceId": null,
            "newText": null,
            "newIsCorrect": null
          }
        }
        `

        // Use the agent to generate resolution
        const response = await this.feedbackAgent.generate([
          {
            role: 'user',
            content: prompt
          }
        ])
        
        try {
          // Parse the AI response
          let responseText = '';
          
          // Handle different response formats
          if (typeof response === 'string') {
            responseText = response;
          } else if (response && typeof response === 'object') {
            responseText = response.text || response.content || JSON.stringify(response);
          } else {
            responseText = String(response);
          }
          
          const aiResult = JSON.parse(responseText)
          
          return {
            text: aiResult.resolution || 'AI analysis completed. Please review the feedback.',
            suggestions: aiResult.suggestions || ['Review feedback content', 'Consider necessary improvements'],
            questionUpdate: aiResult.questionUpdate
          }
        } catch (parseError) {
          logger.error('Failed to parse AI response:', parseError)
          
          // Return the raw response if JSON parsing fails
          let responseText = '';
          if (typeof response === 'string') {
            responseText = response;
          } else if (response && typeof response === 'object') {
            responseText = response.text || response.content || JSON.stringify(response);
          } else {
            responseText = String(response);
          }
          
          return {
            text: responseText || 'AI analysis completed. Please review the feedback.',
            suggestions: ['Review AI analysis above', 'Determine appropriate action']
          }
        }
      } catch (error: any) {
        logger.error('Error using Mastra agent for resolution:', error)
        // Fall back to enhanced rule-based logic if AI fails
        return this.generateEnhancedResolution(feedback)
      }
    }

    // Fallback to enhanced rule-based logic if agent is not available
    return this.generateEnhancedResolution(feedback)
  }

  /**
   * Enhanced rule-based resolution with question analysis
   */
  private async generateEnhancedResolution(feedback: QuestionFeedback): Promise<{
    text: string
    suggestions: string[]
    questionUpdate?: {
      questionId: number
      action: 'update_choice' | 'correct_answer' | 'clarify_text'
      choiceId?: number
      newText?: string
      newIsCorrect?: boolean
    }
  }> {
    const feedbackLower = feedback.feedbackText.toLowerCase()
    let resolution = ''
    const suggestions: string[] = []
    let questionUpdate: any = undefined

    // Load the question and its choices for analysis
    let question: Question | null = null
    try {
      question = await Question.query()
        .where('id', feedback.questionId)
        .preload('choices')
        .first()
    } catch (error) {
      logger.error('Failed to load question for analysis:', error)
    }

    // Enhanced categorization and resolution logic
    if (feedbackLower.includes('wrong') || feedbackLower.includes('incorrect')) {
      resolution = `This feedback indicates a potential error in the question or answer. `
      
      if (question && question.choices && question.choices.length > 0) {
        const correctChoices = question.choices.filter(c => c.isCorrect)
        resolution += `The question has ${correctChoices.length} correct choice(s) out of ${question.choices.length} total choices. `
        
        // Suggest reviewing the correct answer if feedback mentions specific issues
        if (feedbackLower.includes('answer') && correctChoices.length === 1) {
          questionUpdate = {
            questionId: feedback.questionId,
            action: 'correct_answer' as const,
            choiceId: correctChoices[0].id,
          }
          resolution += `Consider reviewing if choice "${correctChoices[0].choiceText}" is actually correct.`
        }
      }
      
      resolution += ` Please review the question content and verify the correct answer.`
      suggestions.push('Review question content for accuracy')
      suggestions.push('Verify answer choices and explanations')
      suggestions.push('Consider updating question if error is confirmed')
      if (question?.choices) {
        suggestions.push('Check if the marked correct answer is actually correct')
      }
    } else if (feedbackLower.includes('unclear') || feedbackLower.includes('confusing')) {
      resolution = `This feedback suggests the question may need clarification. `
      
      if (question) {
        resolution += `Question text: "${question.questionText.substring(0, 100)}..." `
        questionUpdate = {
          questionId: feedback.questionId,
          action: 'clarify_text' as const,
        }
      }
      
      resolution += `Consider rewording for better understanding.`
      suggestions.push('Improve question wording for clarity')
      suggestions.push('Add more context if needed')
      suggestions.push('Simplify complex terminology')
      suggestions.push('Consider adding examples or explanations')
    } else if (feedbackLower.includes('difficult') || feedbackLower.includes('hard')) {
      resolution = `This feedback indicates the question difficulty may be inappropriate for the target level. `
      
      if (question) {
        resolution += `Current difficulty level: ${question.difficultyLevel}. `
      }
      
      suggestions.push('Review question difficulty level')
      suggestions.push('Consider adjusting complexity')
      suggestions.push('Ensure alignment with learning objectives')
      suggestions.push('Possibly move to advanced section')
    } else if (feedbackLower.includes('choice') || feedbackLower.includes('option')) {
      resolution = `This feedback appears to be about a specific choice/option. `
      
      if (question?.choices) {
        resolution += `The question has ${question.choices.length} choices. Please review each choice for accuracy.`
        suggestions.push('Review all answer choices for accuracy')
        suggestions.push('Check for typos in choice text')
        suggestions.push('Verify choice explanations')
        suggestions.push('Ensure choices are distinct and clear')
      }
    } else {
      resolution = `General feedback received: "${feedback.feedbackText}". Please review and determine appropriate action.`
      suggestions.push('Analyze feedback content')
      suggestions.push('Determine necessary improvements')
      suggestions.push('Update question if needed')
      if (question) {
        suggestions.push('Review question and all choices')
      }
    }

    return { text: resolution, suggestions, questionUpdate }
  }

  /**
   * Get all unresolved feedback for processing
   */
  async getUnresolvedFeedback(): Promise<QuestionFeedback[]> {
    return await QuestionFeedback.query()
      .where('isResolved', false)
      .preload('question')
      .preload('user')
      .orderBy('createdAt', 'asc')
  }

  /**
   * Get feedback statistics
   */
  async getFeedbackStats(): Promise<{
    total: number
    resolved: number
    unresolved: number
    recentlyAdded: number
  }> {
    const total = await QuestionFeedback.query().count('* as total')
    const resolved = await QuestionFeedback.query().where('isResolved', true).count('* as resolved')
    const unresolved = await QuestionFeedback.query()
      .where('isResolved', false)
      .count('* as unresolved')
    const recentlyAdded = await QuestionFeedback.query()
      .where('createdAt', '>=', DateTime.now().minus({ days: 7 }).toSQL())
      .count('* as recent')

    return {
      total: Number(total[0].$extras.total),
      resolved: Number(resolved[0].$extras.resolved),
      unresolved: Number(unresolved[0].$extras.unresolved),
      recentlyAdded: Number(recentlyAdded[0].$extras.recent),
    }
  }
}

export default new MastraService()
