import { Response } from 'express'

export const setAccessTokenCookie = (
  res: Response,
  accessToken: string,
  maxAge: number
) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  })
}

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
  maxAge: number
) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  })
}
