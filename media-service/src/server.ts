import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import helmet from 'helmet'
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'

import { logger } from './utils/logger'
import { errorHandler } from './middlewares/errorHandler'
import mediaRoutes from './routes/media.router'

mongoose
  .connect(process.env.MONGODB_URL!)
  .then(() => logger.info('connected to mongodb'))
  .catch((e) => logger.error('mongodb connection error', e))

const app = express()
const PORT = process.env.PORT || 3003

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`recieved ${req.method} request to ${req.url}`)
  next()
})

app.get('/health', (_req: Request, res: Response) => {
  res.send('ok')
})

app.use('/api/media', mediaRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log('media service is running on port', PORT)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('unhandledRejection at:', promise, 'reason:', reason)
})
