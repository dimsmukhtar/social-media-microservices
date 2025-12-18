import { Response } from 'express'

const sameSite: 'lax' | 'none' =
  process.env.NODE_ENV === 'production' ? 'none' : 'lax'
export const clearAuthCookies = (res: Response) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite,
    path: '/'
  }

  res.clearCookie('accessToken', options)
  res.clearCookie('refreshToken', options)
}
