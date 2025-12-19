import { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'
import { Post } from '../models/Post'
import { validateCreatePost } from '../utils/validation'

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
  } catch (error) {
    logger.error('get post error occured', error)
    res.status(500).json({
      success: false,
      message: 'get post internal server error'
    })
  }
}

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    logger.error('deleting post error occured', error)
    res.status(500).json({
      success: false,
      message: 'deleting post internal server error'
    })
  }
}
