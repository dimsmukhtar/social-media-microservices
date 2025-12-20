import { logger } from './logger'
import redis from './redis'

export async function invalidateCache(prefix: string) {
  try {
    const keys = await redis.keys(`${prefix}:*`)
    if (keys.length > 0) {
      await redis.del(...keys)
      logger.info('caching invalidated successfully')
    }
  } catch (error) {
    logger.error('error while invalidateCache')
    logger.error(error)
  }
}
