import express, { Router } from 'express'
import { authenticateRequest } from '../middlewares/auth.middleware'
import { searchPost } from '../controllers/search.controller'

const router: Router = express.Router()

router.use(authenticateRequest)

router.get('/posts', searchPost)

export default router
