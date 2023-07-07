import mongoose, { Schema, Document } from "mongoose";
import isEmail from "validator/lib/isEmail";
import { generatePasswordHash } from "../utils";
import { differenceInMinutes, format, parseISO } from "date-fns";
import mongoosePaginate from "mongoose-paginate";

export interface IUser extends Document {
  email?: string;
  fullName?: string;
  password: string;
  confirmed?: Boolean;
  avatar?: string;
  confirmHash?: string;
  lastSeen: Date;
  status: string;
  birthday: Date;
  city: string;
  about: string;

  hobbies: string;
}

const UserModule = new Schema(
  {
    email: {
      type: String,
      require: "Email address is required",
      validate: [isEmail, "Invalid email"],
      unique: true,
    },
    fullName: {
      type: String,
      require: "FullName is required",
    },
    password: {
      type: String,
      require: "Password is required",
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    avatar: String,
    confirmHash: String,
    lastSeen: {
      type: Date,
      default: new Date(),
    },
    status: String,
    birthday: Date,
    city: String,
    about: String,
    hobbies: String,
  },
  {
    timestamps: true,
  }
);

UserModule.virtual("isOnline").get(function (this: any) {
  return differenceInMinutes(new Date(), this.lastSeen) < 5;
});

UserModule.set("toJSON", {
  virtuals: true,
});
UserModule.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  generatePasswordHash(user.password)
    .then((hash) => {
      user.password = String(hash);
      generatePasswordHash(`${+new Date()}`).then((confirmHash) => {
        user.confirmHash = String(confirmHash);
      });
      next();
    })
    .catch((err) => {
      next(err);
    });
});

UserModule.plugin(mongoosePaginate);
const User = mongoose.model<IUser>("User", UserModule);
allowCors(User);
export default User;
