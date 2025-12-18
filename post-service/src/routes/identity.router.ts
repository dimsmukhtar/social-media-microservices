import express, { Router } from 'express'
import {
  loginUser,
  logout,
  refreshToken,
  registerUser
} from '../controllers/identity.controller'

const router: Router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/refresh', refreshToken)
router.post('/logout', logout)

export default router
