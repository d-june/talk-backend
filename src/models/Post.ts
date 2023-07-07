import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  text: {
    type: string;
    require: true;
  };
  likes: {
    type: number;
    default: 0;
  };
  liked: {
    type: boolean;
    default: false;
  };
}

const PostSchema = new Schema(
  {
    text: { type: String, require: Boolean },
    user: { type: Schema.Types.ObjectId, ref: "User", require: true },
    likes: {
      type: Number,
      default: 0,
    },
    liked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    usePushEach: true,
  }
);

const PostModel = mongoose.model<IPost>("Post", PostSchema);

export default PostModel;
