import { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'
import { Search } from '../models/Search'

export const searchPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info('search endpoint hit!')
  try {
    const { query } = req.query
    if (typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'search query must be a string'
      })
    }
    const results = await Search.find(
      {
        $text: { $search: query }
      },
      {
        score: { $meta: 'textScore' }
      }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
    res.json(results)
  } catch (error) {
    logger.error('search post error occured', error)
    res.status(500).json({
      success: false,
      message: 'search post internal server error'
    })
  }
}
