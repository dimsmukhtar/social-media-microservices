import { PostCreateEvent } from '../contracts/events/post.events'
import { Search } from '../models/Search'
import { logger } from '../utils/logger'
import { consumeMessage } from '../utils/rabbitmq'

const CREATE_ROUTING_KEY = process.env.CREATE_ROUTING_KEY!
const CREATE_QUEUE_NAME = process.env.CREATE_QUEUE_NAME!

export const startPostCreateConsumer = async () => {
  try {
    await consumeMessage<PostCreateEvent>(
      CREATE_QUEUE_NAME,
      CREATE_ROUTING_KEY,
      async (event) => {
        logger.info(`recieved ${CREATE_ROUTING_KEY} event`, event)
        const { userId, postId, content, createdAt } = event
        const newSearchPost = new Search({
          postId,
          userId,
          content,
          createdAt
        })
        await newSearchPost.save()
        logger.info(`new search post created  for post with id ${postId}`)
      }
    )
  } catch (error) {
    logger.error('error while startPostCreateConsumer')
    logger.error(error)
  }
}
