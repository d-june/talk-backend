import express from "express";
import { DialogModel, MessageModel } from "../models";
import socket from "socket.io";
import { th } from "date-fns/locale";

class DialogController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }

  async index(req: any, res: express.Response) {
    const userId = req.user._id;

    const dialogs = await DialogModel.find()
      .or([{ author: userId }, { partner: userId }])
      .populate(["author", "partner"])
      .populate({
        path: "lastMessage",
        populate: {
          path: "user",
        },
      })
      .exec();

    if (!dialogs) {
      return res.status(404).json({
        message: "Dialogs not found",
      });
    } else {
      return res.json(dialogs);
    }
  }

  async findDialog(req: any, res: express.Response) {
    const userId = req.user._id;
    const partnerId = req.params.id;

    const dialogs = await DialogModel.find()
      .or([
        { author: userId, partner: partnerId },
        { author: partnerId, partner: userId },
      ])
      .populate(["author", "partner"])
      .populate({
        path: "lastMessage",
        populate: {
          path: "user",
        },
      })
      .exec();

    if (!dialogs) {
      return res.status(404).json({
        message: "Dialogs not found",
      });
    } else {
      return res.json(dialogs);
    }
  }

  create = (req: any, res: express.Response) => {
    const postData = {
      author: req.user._id,
      partner: req.body.partner,
    };
    const dialog = new DialogModel(postData);
    dialog
      .save()
      .then((dialogObj: any) => {
        const message = new MessageModel({
          text: req.body.text,
          user: req.user._id,
          dialog: dialogObj._id,
        });

        message
          .save()
          .then((messageObj: any) => {
            dialogObj.lastMessage = message._id;
            dialogObj.save().then(() => {
              res.json({ dialogObj });
              this.io.emit("SERVER:DIALOG_CREATED", {
                ...postData,
                dialog: dialogObj,
              });
            });
          })
          .catch((reason) => {
            res.json(reason);
          });
      })
      .catch((reason: any) => {
        res.json(reason);
      });
  };

  delete(req: express.Request, res: express.Response) {
    const id: string = req.params.id;
    DialogModel.findOneAndRemove({ _id: id })
      .then((dialog) => {
        if (dialog) {
          res.json({
            message: "Dialog deleted",
          });
        }
      })
      .catch(() => {
        res.json({
          message: "Dialog not found",
        });
      });
  }
}

export default DialogController;
