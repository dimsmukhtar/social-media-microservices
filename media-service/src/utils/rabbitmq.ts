import * as amqp from 'amqplib'
import { logger } from './logger'
import { Channel } from 'amqplib'

let connection
let channel: Channel | undefined

const EXCHANGE_NAME = process.env.EXCHANGE_NAME!
const QUEUE_NAME = process.env.QUEUE_NAME!

export const connectToRabbitMQ = async () => {
  if (channel) return channel

  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL!)
    channel = await connection.createChannel()

    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true })

    connection.on('error', (err: Error) => {
      logger.error('RabbitMQ connection error', err)
    })

    connection.on('close', () => {
      logger.error('RabbitMQ connection closed')
      process.exit(1)
    })
    logger.info('connected to RabbitMQ')
    return channel
  } catch (error) {
    logger.error('error connecting to RabbitMQ', error)
    throw error
  }
}

export const publishMessage = async (routingKey: string, message: any) => {
  if (!channel) {
    await connectToRabbitMQ()
  }
  channel!.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  )
  logger.info(
    'message successfully published to queque with routing key: ',
    routingKey
  )
}

export const consumeMessage = async <T>(
  routingKey: string,
  callback: (message: T) => Promise<void> | void
) => {
  if (!channel) {
    await connectToRabbitMQ()
  }

  await channel!.assertQueue(QUEUE_NAME, {
    durable: true
  })

  await channel?.bindQueue(QUEUE_NAME, EXCHANGE_NAME, routingKey)

  channel!.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return

    try {
      const content = JSON.parse(msg.content.toString()) as T
      await callback(content)
      channel!.ack(msg)
    } catch (error) {
      logger.error('error processing message', error)
      channel!.nack(msg, false, false) // reject → DLQ
    }
  })
  logger.info(
    `subscribed to queue: ${QUEUE_NAME} with routing key: ${routingKey}`
  )
}
