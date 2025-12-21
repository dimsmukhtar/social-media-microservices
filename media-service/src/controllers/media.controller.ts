import { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'
import { uploadMediaToCloudinary } from '../utils/cloudinary'
import { Media } from '../models/Media'

export const uploadMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info('starting media upload')
  try {
    if (!req.file) {
      logger.error('no file included')
      return res.status(400).json({
        success: false,
        message: 'no file included'
      })
    }
    const { originalname, mimetype, buffer } = req.file
    const userId = req.user?.userId
    logger.info(`file details: name=${originalname}, type=${mimetype}`)
    logger.info('uploading to cloudinary starting...')
    const cloudinaryUploadResult: any = await uploadMediaToCloudinary(req.file)
    logger.info(
      'cloudinary upload successfully, Public ID:',
      cloudinaryUploadResult.publid_id
    )
    const newCreatedMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: cloudinaryUploadResult.secure_url,
      userId
    })
    await newCreatedMedia.save()
    res.status(201).json({
      success: true,
      mediaId: newCreatedMedia._id,
      url: newCreatedMedia.url,
      message: 'media upload is success'
    })
  } catch (error) {
    logger.error('upload media error occured', error)
    res.status(500).json({
      success: false,
      message: 'upload media internal server error'
    })
  }
}

export const getAllMedias = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await Media.find({})
    res.status(200).json({ result })
  } catch (error) {
    logger.error('fetching media error occured', error)
    res.status(500).json({
      success: false,
      message: 'fetching media internal server error'
    })
  }
}
