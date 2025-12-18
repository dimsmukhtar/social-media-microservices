import { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'
import { validateLogin, validateRegistration } from '../utils/validation'
import { User } from '../models/User'
import { generateToken } from '../utils/generateToken'
import {
  setAccessTokenCookie,
  setRefreshTokenCookie
} from '../utils/setCookies'
import redis from '../utils/redis'
import { clearAuthCookies } from '../utils/clearCookies'

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    }
    const { error } = validateRegistration(payload)
    if (error) {
      logger.warn(
        'validation error while registration',
        error.details[0]?.message
      )
      return res.status(400).json({
        success: false,
        message: `validation error while registration ${error.details[0]?.message}`
      })
    }
    let user = await User.findOne({
      $or: [{ email: payload.email }, { username: payload.username }]
    })

    if (user) {
      logger.warn('user already exists')
      return res.status(400).json({
        success: false,
        message: 'user already exists'
      })
    }
    user = new User(payload)
    await user.save()
    logger.warn('user saved successfuly', user._id)

    res.status(201).json({
      success: true,
      message: 'user registered successfully'
    })
  } catch (error) {
    logger.error('registration error occured', error)
    res.status(500).json({
      success: false,
      message: 'registation internal server error'
    })
  }
}

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = {
      email: req.body.email,
      password: req.body.password
    }
    const { error } = validateLogin(payload)
    if (error) {
      logger.warn('validation error while login', error.details[0]?.message)
      return res.status(400).json({
        success: false,
        message: `validation error while login ${error.details[0]?.message}`
      })
    }
    let user = await User.findOne({
      email: payload.email
    }).select('password')
    if (!user) {
      logger.warn('user with that email not exists')
      return res.status(400).json({
        success: false,
        message: 'user with that email not exists'
      })
    }
    const isValidPassword = await user.comparePassword(payload.password)
    if (!isValidPassword) {
      logger.warn('password doesnt match')
      return res.status(400).json({
        success: false,
        message: 'password doesnt match'
      })
    }
    const { accessToken, refreshToken } = await generateToken(user._id)
    setAccessTokenCookie(res, accessToken, 1000 * 60 * 15) // 15 minute
    setRefreshTokenCookie(res, refreshToken, 1000 * 60 * 60 * 24 * 7) // 7 days
    res.status(200).json({
      success: true,
      message: 'user login successfully'
    })
  } catch (error) {
    logger.error('login error occured', error)
    res.status(500).json({
      success: false,
      message: 'login internal server error'
    })
  }
}

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      logger.warn('there is no refresh token in the cookie')
      return res.status(400).json({
        success: false,
        message: 'there is no refresh token in the cookie'
      })
    }
    const refreshTokenKey = `refresh-token:${refreshToken}`
    const value = await redis.get(refreshTokenKey)
    if (!value) {
      logger.warn('there is no refresh token in the redis')
      return res.status(400).json({
        success: false,
        message: 'there is no refresh token in the redis'
      })
    }
    const { userId } = JSON.parse(value)
    const user = await User.findOne({ _id: userId })
    if (!user) {
      return res.status(401).json({ success: false, message: 'user not found' })
    }
    await redis.del(refreshTokenKey)
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user._id)
    setAccessTokenCookie(res, newAccessToken, 1000 * 60 * 15) // 15 minute
    setRefreshTokenCookie(res, newRefreshToken, 1000 * 60 * 60 * 24 * 7) // 7 days
    res.status(200).json({
      success: true,
      message: 'access token refresh successfully'
    })
  } catch (error) {
    logger.error('refreshtoken error occured', error)
    res.status(500).json({
      success: false,
      message: 'refreshtoken internal server error'
    })
  }
}
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      clearAuthCookies(res)
      return res.status(200).json({
        success: true,
        message: 'nr logout successfully'
      })
    }
    try {
      await redis.del(`refresh-token:${refreshToken}`)
    } catch (error) {
      logger.error('error while deleting refresh token in redis')
    }
    clearAuthCookies(res)
    res.status(200).json({
      success: true,
      message: 's logout successfully'
    })
  } catch (error) {
    clearAuthCookies(res)
    console.error(error)
    res.status(200).json({
      success: true,
      message: 'e logout successfully'
    })
  }
}
