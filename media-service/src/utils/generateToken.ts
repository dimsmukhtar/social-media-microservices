import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { setRedis } from './setRedis'
import { Types } from 'mongoose'

export const generateToken = async (
  userId: Types.ObjectId
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '15m'
  })
  const refreshToken = crypto.randomBytes(64).toString('hex')
  const refreshTokenKey = `refresh-token:${refreshToken}`
  await setRedis(
    refreshTokenKey,
    JSON.stringify({
      userId: userId.toString()
    }),
    60 * 60 * 24 * 7
  ) // 7 days
  return { accessToken, refreshToken }
}
