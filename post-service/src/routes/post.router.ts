import express, { Router } from 'express'
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost
} from '../controllers/post.controller'
import { authenticateRequest } from '../middlewares/auth.middleware'
import { cache } from '../middlewares/caching'

const router: Router = express.Router()

router.use(authenticateRequest)

router.post('/create', createPost)
router.get('/all-posts', cache({ prefix: 'post', ttl: 60 * 5 }), getAllPosts)
router.get('/:id', cache({ prefix: 'post', ttl: 60 * 5 }), getPost)
router.delete('/delete/:id', deletePost)

export default router
