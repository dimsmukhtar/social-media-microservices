import mongoose, {
  Schema,
  Types,
  model,
  type HydratedDocument,
  type Model
} from 'mongoose'

interface Search {
  postId: string
  userId: string
  content: string
}

export type SearchDocument = HydratedDocument<Search, {}> // TRawDocType, TInstanceMethods

/* generic Model = Model<
  TRawDocType,
  TQueryHelpers,
  TInstanceMethods
>

*/
type SearchModel = Model<Search, {}, {}>

/* generic Schema = Schema<
  TRawDocType,
  TModelType,
  TInstanceMethods
*/
const searchSchema = new Schema<Search, SearchModel, {}>(
  {
    postId: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: String,
      index: true,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

searchSchema.index({ content: 'text' })
searchSchema.index({ createdAt: -1 })

/*
generic model = model<
  TRawDocType,
  TModelType
>
*/
export const Search = model<Search, SearchModel>('Search', searchSchema)
