import dotenv from 'dotenv'
dotenv.config()
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { RedisReply, RedisStore } from 'rate-limit-redis'
import redis from './utils/redis'
import proxy from 'express-http-proxy'
import cookieParser from 'cookie-parser'

import { logger } from './utils/logger'
import { errorHandler } from './middlewares/errorHandler'
import { validateToken } from './middlewares/auth.middleware'

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 request in 15 minutes
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

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(globalRateLimiter)
app.use(cookieParser())

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`recieved ${req.method} request to ${req.url}`)
  next()
})

app.use(
  '/v1/auth',
  proxy(process.env.IDENTITY_SERVICE_URL!, {
    proxyReqPathResolver: (req: Request) => {
      return req.originalUrl.replace(/^\/v1/, '/api')
    },
    proxyErrorHandler: (err: Error, res: Response, next: NextFunction) => {
      logger.error(`proxy error: ${err.message}`)
      res.status(500).json({
        message: `internal server error, error: ${err.message}`
      })
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers['content-type'] = 'application/json'
      return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `response recieved from identity service: ${proxyRes.statusCode}, message: ${proxyRes.statusMessage}`
      )
      return proxyResData
    }
  })
)

app.use(
  '/v1/post',
  validateToken,
  proxy(process.env.POST_SERVICE_URL!, {
    proxyReqPathResolver: (req: Request) => {
      return req.originalUrl.replace(/^\/v1/, '/api')
    },
    proxyErrorHandler: (err: Error, res: Response, next: NextFunction) => {
      logger.error(`proxy error: ${err.message}`)
      res.status(500).json({
        message: `internal server error, error: ${err.message}`
      })
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers['content-type'] = 'application/json'
      proxyReqOpts.headers['x-user-id'] = srcReq.user?.userId
      return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `response recieved from post service: ${proxyRes.statusCode}, message: ${proxyRes.statusMessage}`
      )
      return proxyResData
    }
  })
)

app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`api gateway is running on port ${PORT}`)
  logger.info(
    `identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`
  )
  logger.info(`post service is running on port ${process.env.POST_SERVICE_URL}`)
})
