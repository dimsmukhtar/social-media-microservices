import { logger } from './logger'
import redis from './redis'

export async function setRedis(key: string, value: any, ttlSeconds = 60 * 5) {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch (error) {
    logger.error('error while set the data to redis')
  }
}
