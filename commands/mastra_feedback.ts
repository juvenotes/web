import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import mastraService from '#services/mastra_service'

export default class MastraFeedback extends BaseCommand {
  static commandName = 'mastra:feedback'
  static description = 'Manage question feedback using Mastra AI agents'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({
    description: 'Action to perform: stats|process|resolve|process-all|resolve-all',
    required: true,
  })
  declare action: string

  @args.string({
    description: 'Feedback ID (required for process/resolve actions)',
    required: false,
  })
  declare feedbackId?: string

  @flags.string({
    description: 'Custom resolution text for resolve action',
  })
  declare resolution?: string

  @flags.number({
    description: 'User ID for resolve action (defaults to 1)',
    default: 1,
  })
  declare userId: number

  async run() {
    try {
      switch (this.action.toLowerCase()) {
        case 'stats':
          await this.showStats()
          break
        case 'process':
          await this.processFeedback()
          break
        case 'resolve':
          await this.resolveFeedback()
          break
        case 'process-all':
          await this.processAllFeedback()
          break
        case 'resolve-all':
          await this.resolveAllFeedback()
          break
        default:
          this.logger.error('Invalid action. Use: stats|process|resolve|process-all|resolve-all')
          return
      }
    } catch (error: any) {
      this.logger.error('Command failed:', error.message)
    }
  }

  private async showStats() {
    this.logger.info('Fetching feedback statistics...')
    const stats = await mastraService.getFeedbackStats()

    this.logger.info('Feedback Statistics:')
    this.logger.info(`Total feedback: ${stats.total}`)
    this.logger.info(`Resolved: ${stats.resolved}`)
    this.logger.info(`Unresolved: ${stats.unresolved}`)
    this.logger.info(`Recently added (last 7 days): ${stats.recentlyAdded}`)
  }

  private async processFeedback() {
    if (!this.feedbackId) {
      this.logger.error('Feedback ID is required for process action')
      return
    }

    this.logger.info(`Processing feedback ${this.feedbackId}...`)
    const result = await mastraService.processFeedback(Number(this.feedbackId))

    if (result.success) {
      this.logger.success('Feedback processed successfully!')
      if (result.resolution) {
        this.logger.info(`Resolution: ${result.resolution}`)
      }
      if (result.suggestions && result.suggestions.length > 0) {
        this.logger.info('Suggestions:')
        result.suggestions.forEach((suggestion, index) => {
          this.logger.info(`  ${index + 1}. ${suggestion}`)
        })
      }
    } else {
      this.logger.error(`Failed to process feedback: ${result.error}`)
    }
  }

  private async resolveFeedback() {
    if (!this.feedbackId) {
      this.logger.error('Feedback ID is required for resolve action')
      return
    }

    this.logger.info(`Resolving feedback ${this.feedbackId}...`)
    const result = await mastraService.resolveFeedback(
      Number(this.feedbackId),
      this.userId,
      this.resolution
    )

    if (result.success) {
      this.logger.success(`Feedback ${this.feedbackId} resolved successfully!`)
      if (result.resolution) {
        this.logger.info(`Resolution: ${result.resolution}`)
      }
    } else {
      this.logger.error(`Failed to resolve feedback: ${result.error}`)
    }
  }

  private async processAllFeedback() {
    this.logger.info('Processing all unresolved feedback...')
    const unresolved = await mastraService.getUnresolvedFeedback()

    if (unresolved.length === 0) {
      this.logger.info('No unresolved feedback found')
      return
    }

    this.logger.info(`Found ${unresolved.length} unresolved feedback items`)
    let processed = 0
    let failed = 0

    for (const feedback of unresolved) {
      try {
        const result = await mastraService.processFeedback(feedback.id)
        if (result.success) {
          processed++
          this.logger.info(`✓ Processed feedback ${feedback.id}`)
        } else {
          failed++
          this.logger.error(`✗ Failed to process feedback ${feedback.id}: ${result.error}`)
        }
      } catch (error: any) {
        failed++
        this.logger.error(`✗ Error processing feedback ${feedback.id}: ${error.message}`)
      }
    }

    this.logger.info(`Processing complete: ${processed} processed, ${failed} failed`)
  }

  private async resolveAllFeedback() {
    this.logger.info('Resolving all unresolved feedback...')
    const unresolved = await mastraService.getUnresolvedFeedback()

    if (unresolved.length === 0) {
      this.logger.info('No unresolved feedback found')
      return
    }

    this.logger.info(`Found ${unresolved.length} unresolved feedback items`)
    let resolved = 0
    let failed = 0

    for (const feedback of unresolved) {
      try {
        const result = await mastraService.resolveFeedback(feedback.id, this.userId)
        if (result.success) {
          resolved++
          this.logger.info(`✓ Resolved feedback ${feedback.id}`)
        } else {
          failed++
          this.logger.error(`✗ Failed to resolve feedback ${feedback.id}: ${result.error}`)
        }
      } catch (error: any) {
        failed++
        this.logger.error(`✗ Error resolving feedback ${feedback.id}: ${error.message}`)
      }
    }

    this.logger.info(`Resolution complete: ${resolved} resolved, ${failed} failed`)
  }
}
