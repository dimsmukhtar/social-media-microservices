import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import helmet from 'helmet'
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { RateLimiterRedis } from 'rate-limiter-flexible'
import { rateLimit } from 'express-rate-limit'
import { RedisReply, RedisStore } from 'rate-limit-redis'
import cookieParser from 'cookie-parser'

import { logger } from './utils/logger'
import authRoutes from './routes/identity.router'
import redis from './utils/redis'
import { errorHandler } from './middlewares/errorHandler'

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'middleware',
  points: 10,
  duration: 3 // 10 request in 3 seconds
})

const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 request in 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('sensitive endpoint rate limt exceeded for IP: ', req.ip)
    res.status(429).json({
      success: false,
      message: 'too many request'
    })
  },
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<RedisReply>
  })
})

mongoose
  .connect(process.env.MONGODB_URL!)
  .then(() => logger.info('connected to mongodb'))
  .catch((e) => logger.error('mongodb connection error', e))

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`recieved ${req.method} request to ${req.url}`)
  next()
})
app.use((req: Request, res: Response, next: NextFunction) => [
  rateLimiter
    .consume(req.ip as any)
    .then(() => next())
    .catch(() => {
      logger.warn('rate limit exceeded for IP:', req.ip)
      res.status(429).json({
        success: false,
        message: 'too many request'
      })
    })
])
app.use('/api/auth/register', sensitiveEndpointsLimiter)
app.use('/api/auth/login', sensitiveEndpointsLimiter)

app.get('/health', (_req: Request, res: Response) => {
  res.send('ok')
})

app.use('/api/auth', authRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log('identity service is running on port', PORT)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('unhandledRejection at:', promise, 'reason:', reason)
})
