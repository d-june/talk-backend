import mongoose, { Schema, Document } from "mongoose";
import User from "./User";

export interface IDialog extends Document {
  partner: {
    type: Schema.Types.ObjectId;
    ref: string;
    require: true;
  };
  author: {
    type: Schema.Types.ObjectId;
    ref: string;
    require: true;
  };
  lastMessage: {
    type: Schema.Types.ObjectId;
    ref: string;
  };
}

const DialogModule = new Schema(
  {
    partner: { type: Schema.Types.ObjectId, ref: "User" },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  {
    timestamps: true,
  }
);

const Dialog = mongoose.model<IDialog>("Dialog", DialogModule);

export default Dialog;
