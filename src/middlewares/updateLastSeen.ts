import express from "express";
import { UserModel } from "../models";

export default async (
  req: any,
  _: express.Response,
  next: express.NextFunction
) => {
  if (req.user) {
    const filter = { _id: req.user._id };
    const update = { lastSeen: new Date() };

    await UserModel.findOneAndUpdate(filter, update, {
      upsert: true,
    });
  }

  next();
};
