import { PostDeleteEvent } from '../contracts/events/post.events'
import { Media } from '../models/Media'
import { deleteMediaFromCloudinary } from '../utils/cloudinary'
import { logger } from '../utils/logger'
import { consumeMessage } from '../utils/rabbitmq'

const DELETE_ROUTING_KEY = process.env.DELETE_ROUTING_KEY!
const DELETE_QUEUE_NAME = process.env.DELETE_QUEUE_NAME!

export const startPostDeletedConsumer = async () => {
  try {
    await consumeMessage<PostDeleteEvent>(
      DELETE_QUEUE_NAME,
      DELETE_ROUTING_KEY,
      async (event) => {
        logger.info(`recieved ${DELETE_ROUTING_KEY} event`, event)
        const { postId, mediaIds, userId } = event
        for (const mediaId of mediaIds) {
          const media = await Media.findById(mediaId)
          if (!media) {
            logger.warn(`media ${mediaId} not found, skipping`)
            continue
          }

          await deleteMediaFromCloudinary(media.publicId)
          await media.deleteOne()
          logger.info(`media ${mediaId} deleted for post ${postId}`)
        }
      }
    )
  } catch (error) {
    logger.error('error while startPostDeleteConsumer')
    logger.error(error)
  }
}
