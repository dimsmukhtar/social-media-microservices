import mongoose, {
  Schema,
  Types,
  model,
  type HydratedDocument,
  type Model
} from 'mongoose'

interface Post {
  user: Types.ObjectId
  content: string
  mediaIds: [string]
  createdAt?: Date
}

export type PostDocument = HydratedDocument<Post, {}> // TRawDocType, TInstanceMethods

/* generic Model = Model<
  TRawDocType,
  TQueryHelpers,
  TInstanceMethods
>

*/
type PostModel = Model<Post, {}, {}>

/* generic Schema = Schema<
  TRawDocType,
  TModelType,
  TInstanceMethods
*/
const postSchema = new Schema<Post, PostModel, {}>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    mediaIds: [
      {
        type: String
      }
    ]
  },
  { timestamps: true }
)

postSchema.index({ content: 'text' })

/*
generic model = model<
  TRawDocType,
  TModelType
>
*/
export const Post = model<Post, PostModel>('Post', postSchema)
