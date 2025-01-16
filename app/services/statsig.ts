// import logger from '@adonisjs/core/services/logger'
// import env from '#start/env'
// import Statsig from 'statsig-node'

// export class StatsigService {
//   private static instance: StatsigService
//   private static initialized = false

//   private constructor() {}

//   static async init() {
//     if (!this.initialized) {
//       this.instance = new StatsigService()
//       try {
//         await Statsig.initialize(env.get('STATSIG_SERVER_SECRET'))
//         this.initialized = true
//         logger.info('Statsig initialized successfully')
//       } catch (error) {
//         logger.error('Failed to initialize Statsig', {
//           error,
//           context: 'StatsigService.init',
//         })
//       }
//     }
//     return this.instance
//   }

//   static async shutdown() {
//     if (this.initialized) {
//       try {
//         await Statsig.shutdown()
//         this.initialized = false
//         logger.info('Statsig shut down successfully')
//       } catch (error) {
//         logger.error('Failed to shutdown Statsig', {
//           error,
//           context: 'StatsigService.shutdown',
//         })
//       }
//     }
//   }

//   static async logEvent(
//     userId: string,
//     event: string,
//     value?: string,
//     metadata?: Record<string, any>
//   ) {
//     try {
//       if (!this.initialized) await this.init()

//       const result = await Statsig.logEvent({ userID: userId }, event, value, metadata)

//       logger.debug('Statsig event logged', {
//         userId,
//         event,
//         value,
//         metadata,
//       })

//       return result
//     } catch (error) {
//       logger.error('Failed to log Statsig event', {
//         error,
//         context: 'StatsigService.logEvent',
//         userId,
//         event,
//       })
//       throw error
//     }
//   }

//   static async checkGate(userId: string, gate: string) {
//     if (!this.initialized) await this.init()
//     return Statsig.checkGate({ userID: userId }, gate)
//   }

//   static async getConfig(userId: string, config: string) {
//     if (!this.initialized) await this.init()
//     return Statsig.getConfig({ userID: userId }, config)
//   }

//   static async getExperiment(userId: string, experimentName: string) {
//     if (!this.initialized) await this.init()
//     return Statsig.getExperiment({ userID: userId }, experimentName)
//   }

//   static async getLayer(userId: string, layerName: string) {
//     if (!this.initialized) await this.init()
//     return Statsig.getLayer({ userID: userId }, layerName)
//   }

//   // Add analytics tracking
//   static async logExposure(userId: string, gateName: string, metadata?: Record<string, any>) {
//     return this.logEvent(userId, 'feature_exposure', gateName, metadata)
//   }

//   static async logConversion(userId: string, event: string, metadata?: Record<string, any>) {
//     return this.logEvent(userId, `conversion_${event}`, undefined, metadata)
//   }
// }
