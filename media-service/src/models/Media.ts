import mongoose, {
  Schema,
  Types,
  model,
  type HydratedDocument,
  type Model
} from 'mongoose'

interface Media {
  publicId: string
  originalName: string
  mimeType: string
  url: string
  userId: Types.ObjectId
}

export type MediaDocument = HydratedDocument<Media, {}> // TRawDocType, TInstanceMethods

/* generic Model = Model<
  TRawDocType,
  TQueryHelpers,
  TInstanceMethods
>

*/
type MediaModel = Model<Media, {}, {}>

/* generic Schema = Schema<
  TRawDocType,
  TModelType,
  TInstanceMethods
*/
const mediaSchema = new Schema<Media, MediaModel, {}>(
  {
    publicId: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)

/*
generic model = model<
  TRawDocType,
  TModelType
>
*/
export const Media = model<Media, MediaModel>('Media', mediaSchema)
