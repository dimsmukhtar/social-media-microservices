import { NextFunction, Request, Response } from 'express'
import redis from '../utils/redis'
import { logger } from '../utils/logger'

export function cache({ prefix = 'cache', ttl = 60 * 5 } = {}) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const key = `${prefix}:${req.originalUrl}`
      const cached = await redis.get(key)
      if (cached) {
        res.set('X-Cache', 'HIT')
        logger.info('hit the caching middleware')
        return res.json(JSON.parse(cached))
      }
      ;(res as any).cacheKey = key
      ;(res as any).cacheTTL = ttl
      res.set('X-Cache', 'MISS')
      next()
    } catch (error) {
      logger.error('error while set a cache')
      logger.error(error)
    }
  }
}
