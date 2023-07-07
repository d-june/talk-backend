import express from "express";
import { UploadedFileModel, UserModel } from "../models";
import { createJWTToken } from "../utils";
import socket from "socket.io";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/User";
import cloudinary from "../core/cloudinary";

class UserController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }

  async show(req: express.Request, res: express.Response) {
    const id: string = req.params.id;
    const user = await UserModel.findById(id).exec();
    if (!user) {
      return res.status(404).json({
        message: "Not found",
      });
    } else {
      res.json(user);
    }
  }

  async getMe(req: any, res: express.Response) {
    const id: string = req.user._id;
    const user = await UserModel.findById(id).exec();
    if (!id) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      res.json(user);
    }
  }

  async getUsers(req: any, res: express.Response) {
    try {
      const { page, perPage } = req.query;
      const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(perPage, 8) || 8,
      };
      const users = await UserModel.paginate({}, options);
      return res.json(users);
    } catch (err) {
      return res.status(500).send(err);
    }
  }

  create(req: express.Request, res: express.Response) {
    const postData = {
      email: req.body.email,
      fullName: req.body.fullName,
      password: req.body.password,
    };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = new UserModel(postData);

    user
      .save()
      .then((obj: any) => {
        res.json(obj);
      })
      .catch((reason) => {
        res.status(500).json({
          status: "error",
          message: reason,
        });
      });
  }

  async verify(req: express.Request, res: express.Response) {
    const hash = req.query.hash;

    if (!hash) {
      return res.status(422).json({ errors: "Invalid hah" });
    }
    const user = await UserModel.find({ confirmHash: hash }).then(
      (user: any) => {
        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "Hash not found",
          });
        }

        user.confirmed = true;

        user.save((err: any) => {
          if (err) {
            return res.status(404).json({
              status: "error",
              message: err,
            });
          }
          res.json({
            status: "success",
            message: "Аккаунт успешно подтвержден!",
          });
        });
      }
    );
  }

  async login(req: express.Request, res: express.Response) {
    const postData = {
      email: req.body.email,
      password: req.body.password,
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = await UserModel.findOne({ email: postData.email }).exec();
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (bcrypt.compareSync(postData.password, user.password)) {
      const token = createJWTToken(user);
      res.json({
        status: "success",
        token,
      });
    } else {
      res.status(403).json({
        status: "error",
        message: "Incorrect password or email",
      });
    }
  }

  findUsers(req: any, res: express.Response) {
    const query: string = req.query.query;

    UserModel.find()
      .or([
        { fullName: new RegExp(query, "i") },
        { email: new RegExp(query, "i") },
      ])
      .then((users: any) => {
        res.json(users);
      })
      .catch((err: any) => {
        return res.status(404).json({
          status: "error",
          message: err,
        });
      });
  }

  async updateStatus(req: any, res: express.Response) {
    const filter = { _id: req.user._id };
    const update = { status: req.body.status };

    await UserModel.findOneAndUpdate(filter, update, {
      upsert: true,
    })
      .then((user) => {
        if (user) {
          res.json({
            message: `User status updated`,
          });
        }
      })
      .catch(() => {
        res.json({
          message: "User not found",
        });
      });
  }

  async updateAvatar(req: any, res: express.Response) {
    const filter = { _id: req.user._id };
    const file: any = req.file;

    cloudinary.v2.uploader
      .upload_stream({ resource_type: "auto" }, (error: any, result: any) => {
        if (error || !result) {
          return res.status(500).json({
            status: "error",
            message: error || "upload error",
          });
        }

        const fileData = {
          filename: result.original_filename,
          size: result.bytes,
          ext: result.format,
          url: result.url,
          user: filter,
        };

        const update = { avatar: fileData.url };

        UserModel.findOneAndUpdate(filter, update, {
          upsert: true,
        })
          .then((user) => {
            if (user) {
              res.json({
                message: `User avatar updated`,
              });
            }
          })
          .catch(() => {
            res.json({
              message: "User not found",
            });
          });

        const uploadFile = new UploadedFileModel(fileData);
        uploadFile.save();
      })
      .end(file.buffer);
  }

  async updateProfile(req: any, res: express.Response) {
    const filter = { _id: req.user._id };
    const update = {
      fullName: req.body.fullName,
      birthday: new Date(req.body.birthday),
      city: req.body.city,
      about: req.body.about,
      hobbies: req.body.hobbies,
    };

    await UserModel.findOneAndUpdate(filter, update, {
      upsert: true,
    })
      .then((user) => {
        if (user) {
          res.json({
            message: `User profile updated`,
          });
        }
      })
      .catch(() => {
        res.json({
          message: "User not found",
        });
      });
  }

  async getUserStatus(req: any, res: express.Response) {
    const id: string = req.params.id;
    const user = await UserModel.findById(id).exec();
    if (!id) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      res.json(user?.status);
    }
  }

  async getProfile(req: any, res: express.Response) {
    const id: string = req.user._id;
    const user = await UserModel.findById(id).exec();
    if (!id) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      res.json(user);
    }
  }

  delete(req: express.Request, res: express.Response) {
    const id: string = req.params.id;
    UserModel.findOneAndRemove({ _id: id })
      .then((user) => {
        if (user) {
          res.json({
            message: `User ${user.fullName} deleted`,
          });
        }
      })
      .catch(() => {
        res.json({
          message: "User not found",
        });
      });
  }
}

export default UserController;
