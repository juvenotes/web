import emitter from '@adonisjs/core/services/emitter'
import AppBoot from '#events/app_boot'

/**
 * Register listeners using lazy-loading for better performance
 */
const ScheduleTodayArchiving = () => import('#listeners/schedule_today_archiving')

/**
 * Register the class-based event with its listener
 */
emitter.listen(AppBoot, [ScheduleTodayArchiving])

/**
 * Since 'app:boot' is a framework event that we can't directly replace with a class,
 * we'll use it to dispatch our class-based event
 */
// emitter.on('app:boot', () => {
//   // Dispatch our class-based event when the app boots
//   AppBoot.dispatch()
// })
