import { v2 as cloudinary } from 'cloudinary'
import { logger } from './logger'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_SECRET!
})

export const uploadMediaToCloudinary = (file: Express.Multer.File) => {
  logger.info('hitting upload to image kit function')
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          logger.error('error while uploading media to cloudinary', error)
          reject(error)
        } else {
          resolve(result)
        }
      }
    )
    uploadStream.end(file.buffer)
  })
}
