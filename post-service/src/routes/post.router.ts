import express, { Router } from 'express'
import { createPost } from '../controllers/post.controller'
import { authenticateRequest } from '../middlewares/auth.middleware'

const router: Router = express.Router()

router.use(authenticateRequest)

router.post('/create', createPost)

export default router
