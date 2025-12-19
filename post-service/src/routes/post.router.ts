import express, { Router } from 'express'
import { createPost, getAllPosts } from '../controllers/post.controller'
import { authenticateRequest } from '../middlewares/auth.middleware'
import { cache } from '../middlewares/caching'

const router: Router = express.Router()

router.use(authenticateRequest)

router.post('/create', createPost)
router.get('/all-posts', cache({ prefix: 'post', ttl: 60 * 60 }), getAllPosts)

export default router
