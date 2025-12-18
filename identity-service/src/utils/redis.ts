import Redis, { type RedisOptions } from 'ioredis'
import { URL } from 'url'
import { logger } from './logger'

const redisUrl = `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`

function createRedis(urlStr: string) {
  try {
    const url = new URL(urlStr)
    const options: RedisOptions = {}
    if (url.username && url.password) options.password = url.password
    if (url.protocol === 'rediss:') {
      options.tls = {} as any
    }
    return new Redis(urlStr, options)
  } catch (error) {
    logger.error('error creating redis connection', error)
    throw error
  }
}

const redis = createRedis(redisUrl)
redis.on('connect', () => {
  logger.info('redis connection is established')
})

redis.on('ready', () => {
  logger.info('redis is ready')
})

redis.on('error', (e) => {
  logger.error('redis connection error', e)
})

export default redis
