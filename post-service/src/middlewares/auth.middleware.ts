import { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'
import { getSingleHeader } from '../utils/getSingleHeader'

export const authenticateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = getSingleHeader(req.headers['x-user-id'])
  console.log('USER ID =====', userId)
  if (!userId) {
    logger.warn('access attempted without user ID')
    return res.status(401).json({
      success: false,
      message: 'authentication required! please login to continue'
    })
  }
  req.user = { userId }
  next()
}
