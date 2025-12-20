import express, { NextFunction, Router, Request, Response } from 'express'
import multer from 'multer'
import { uploadMedia } from '../controllers/media.controller'
import { authenticateRequest } from '../middlewares/auth.middleware'
import { logger } from '../utils/logger'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5mb
  }
}).single('file')

const router: Router = express.Router()

router.use(authenticateRequest)

router.post(
  '/upload',
  (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        logger.error('multer error while uploading:', err)
        return res.status(400).json({
          message: 'multer error while uploading',
          error: err.message,
          stack: err.stack
        })
      } else if (err) {
        logger.error('unknown error while uploading:', err)
        return res.status(500).json({
          message: 'unknown error while uploading',
          error: err.message,
          stack: err.stack
        })
      }
      if (!req.file) {
        return res.status(400).json({
          message: 'no file found'
        })
      }
      next()
    })
  },
  uploadMedia
)

export default router
