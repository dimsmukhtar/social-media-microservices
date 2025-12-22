import 'express'
import redis from '../utils/redis'

declare global {
  namespace Express {
    interface User {
      userId: string
    }

    interface Request {
      user?: User
    }
  }
}
