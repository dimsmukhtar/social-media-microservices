import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { logger } from '../utils/logger'

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken
  if (!accessToken) {
    logger.warn('access attempt without valid token')
    return res.status(401).json({
      success: false,
      message: 'authentication token required'
    })
  }
  jwt.verify(accessToken, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      logger.warn('invalid token')
      return res.status(429).json({
        success: false,
        message: 'invalid token'
      })
    }
    req.user = user
    next()
  })
}
