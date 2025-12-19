import { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'
import { Post } from '../models/Post'
import { validateCreatePost } from '../utils/validation'
import { setRedis } from '../utils/setRedis'
import { invalidateCache } from '../utils/invalidateCache'
import mongoose from 'mongoose'

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error } = validateCreatePost(req.body)
    if (error) {
      logger.warn(
        'validation error while create a post',
        error.details[0]?.message
      )
      return res.status(400).json({
        success: false,
        message: `validation error while create a post ${error.details[0]?.message}`
      })
    }
    const createdPost = new Post({
      user: req.user!.userId,
      content: req.body.content,
      mediaIds: req.body.mediaIds || []
    })
    await createdPost.save()
    await invalidateCache('post')
    logger.info('post created successfully')
    res.status(201).json({
      success: true,
      message: 'post created successfully'
    })
  } catch (error) {
    logger.error('create post error occured', error)
    res.status(500).json({
      success: false,
      message: 'create post internal server error'
    })
  }
}

export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
    const totalPosts = await Post.countDocuments()
    const response = {
      success: true,
      posts,
      message: 'success get all posts',
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts
    }
    if ((res as any).cacheKey) {
      await setRedis((res as any).cacheKey, response, (res as any).cacheTTL)
      logger.info('success caching the get all posts')
    }
    res.status(200).json(response)
  } catch (error) {
    logger.error('get all posts error occured', error)
    res.status(500).json({
      success: false,
      message: 'get all posts internal server error'
    })
  }
}

export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id!)) {
      return res.status(400).json({
        success: false,
        message: 'invalid post id'
      })
    }
    const post = await Post.findById(id)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: `post with id ${req.params.id} not found`
      })
    }
    const response = {
      success: true,
      post,
      message: `success get post by id ${req.params.id}`
    }
    if ((res as any).cacheKey) {
      await setRedis((res as any).cacheKey, response, (res as any).cacheTTL)
      logger.info('success caching the get post by id')
    }
    res.status(200).json(response)
  } catch (error) {
    logger.error('get post by id error occured', error)
    res.status(500).json({
      success: false,
      message: 'get post  by id internal server error'
    })
  }
}

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id!)) {
      return res.status(400).json({
        success: false,
        message: 'invalid post id'
      })
    }
    const post = await Post.findOneAndDelete({ _id: id })
    if (!post) {
      return res.status(404).json({
        success: false,
        message: `post with id ${req.params.id} not found`
      })
    }
    await invalidateCache('post')
    res.status(200).json({
      success: false,
      message: `post with id ${id} deleted successfully`
    })
  } catch (error) {
    logger.error('deleting post error occured', error)
    res.status(500).json({
      success: false,
      message: 'deleting post internal server error'
    })
  }
}
