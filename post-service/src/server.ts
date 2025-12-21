import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import helmet from 'helmet'
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'

import { logger } from './utils/logger'
import { errorHandler } from './middlewares/errorHandler'
import postRoutes from './routes/post.router'
import { connectToRabbitMQ } from './utils/rabbitmq'

mongoose
  .connect(process.env.MONGODB_URL!)
  .then(() => logger.info('connected to mongodb'))
  .catch((e) => logger.error('mongodb connection error', e))

const app = express()
const PORT = process.env.PORT || 3002

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

app.use('/api/post', postRoutes)

app.use(errorHandler)

async function startServer() {
  try {
    await connectToRabbitMQ()
    app.listen(PORT, () => {
      console.log('post service is running on port', PORT)
    })
  } catch (error) {
    logger.error('failed to start the server')
    logger.error(error)
    process.exit(1)
  }
}
startServer()

process.on('unhandledRejection', (reason, promise) => {
  logger.error('unhandledRejection at:', promise, 'reason:', reason)
})
