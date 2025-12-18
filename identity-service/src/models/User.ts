import { Schema, model, type HydratedDocument, type Model } from 'mongoose'
import argon2 from 'argon2'

interface User {
  username: string
  email: string
  password: string
}

interface UserMethods {
  comparePassword(password: string): Promise<boolean>
}
export type UserDocument = HydratedDocument<User, UserMethods>
type UserModel = Model<User, {}, UserMethods>

const userSchema = new Schema<User, UserModel, UserMethods>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      select: false
    }
  },
  { timestamps: true }
)

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await argon2.hash(this.password)
})

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  try {
    return await argon2.verify(this.password, password)
  } catch (error) {
    throw error
  }
}

userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ username: 'text' })
userSchema.set('toJSON', {
  transform(_doc, ret) {
    const { password, __v, ...rest } = ret
    return rest
  }
})

export const User = model<User, UserModel>('User', userSchema)
