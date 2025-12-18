import type { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'

interface ErrorRequestHandler {
  (err: Error, req: Request, res: Response, next: NextFunction): void
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.stack)
  res.status((err as any).status || 500).json({
    success: false,
    message: err.message || 'internal server error'
  })
}
