import env from '#start/env'
import Statsig from 'statsig-node'

export class StatsigService {
  private static instance: StatsigService
  private static initialized = false

  private constructor() {}

  static async init() {
    if (!this.initialized) {
      this.instance = new StatsigService()
      try {
        await Statsig.initialize(env.get('STATSIG_SERVER_SECRET'))
        this.initialized = true
        console.log('Statsig initialized successfully')
      } catch (error) {
        console.error('Failed to initialize Statsig:', error)
      }
    }
    return this.instance
  }

  static async shutdown() {
    if (this.initialized) {
      try {
        await Statsig.shutdown()
        this.initialized = false
        console.log('Statsig shut down successfully')
      } catch (error) {
        console.error('Failed to shutdown Statsig:', error)
      }
    }
  }

  static async logEvent(
    userId: string,
    event: string,
    value?: string,
    metadata?: Record<string, any>
  ) {
    if (!this.initialized) await this.init()
    return Statsig.logEvent({ userID: userId }, event, value, metadata)
  }

  static async checkGate(userId: string, gate: string) {
    if (!this.initialized) await this.init()
    return Statsig.checkGate({ userID: userId }, gate)
  }

  static async getConfig(userId: string, config: string) {
    if (!this.initialized) await this.init()
    return Statsig.getConfig({ userID: userId }, config)
  }

  static async getExperiment(userId: string, experimentName: string) {
    if (!this.initialized) await this.init()
    return Statsig.getExperiment({ userID: userId }, experimentName)
  }

  static async getLayer(userId: string, layerName: string) {
    if (!this.initialized) await this.init()
    return Statsig.getLayer({ userID: userId }, layerName)
  }

  // Add analytics tracking
  static async logExposure(userId: string, gateName: string, metadata?: Record<string, any>) {
    return this.logEvent(userId, 'feature_exposure', gateName, metadata)
  }

  static async logConversion(userId: string, event: string, metadata?: Record<string, any>) {
    return this.logEvent(userId, `conversion_${event}`, undefined, metadata)
  }
}
