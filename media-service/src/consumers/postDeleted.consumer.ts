import { PostDeleteEvent } from '../contracts/events/post.events'
import { Media } from '../models/Media'
import { deleteMediaFromCloudinary } from '../utils/cloudinary'
import { logger } from '../utils/logger'
import { consumeMessage } from '../utils/rabbitmq'

const ROUTING_KEY = process.env.ROUTING_KEY!

export const startPostDeletedConsumer = async () => {
  await consumeMessage<PostDeleteEvent>(ROUTING_KEY, async (event) => {
    logger.info(`recieved ${ROUTING_KEY} event`, event)
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
  })
}
