import Joi from 'joi'

export const validateCreatePost = <T>(data: T) => {
  const schema = Joi.object({
    content: Joi.string().min(3).max(5000).required()
  })

  return schema.validate(data)
}
