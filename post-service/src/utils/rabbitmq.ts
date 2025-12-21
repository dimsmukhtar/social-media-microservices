import * as amqp from 'amqplib'
import { logger } from './logger'
import { Channel } from 'amqplib'

let connection
let channel: Channel | undefined

const EXCHANGE_NAME = process.env.EXCHANGE_NAME!

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
