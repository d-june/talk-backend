import express from "express";
import { DialogModel, MessageModel } from "../models";
import socket from "socket.io";
import { tr } from "date-fns/locale";

class MessageController {
  io: socket.Server;

  constructor(io: socket.Server) {
    this.io = io;
  }

  index = (req: any, res: express.Response) => {
    const dialogId = req.query.dialog;
    const userId = req.user._id;

    MessageModel.updateMany(
      { dialog: dialogId, user: { $ne: userId } },
      { $set: { read: true } },
      { upsert: true }
    ).then((err: any) => {
      this.io.emit("SERVER:MESSAGES_READED", {
        userId,
        dialogId,
      });
    });

    MessageModel.find({ dialog: dialogId })
      .populate(["dialog", "user", "attachments"])
      .then((messages) => {
        if (!messages) {
          return res.status(404).json({
            status: "error",
            message: "Message not found",
          });
        }
        return res.json(messages);
      });
  };

  create = (req: any, res: express.Response) => {
    const userId = req.user._id;

    const postData = {
      text: req.body.text,
      dialog: req.body.dialog_id,
      attachments: req.body.attachments,
      user: userId,
    };

    const message = new MessageModel(postData);

    message
      .save()
      .then((obj: any) => {
        obj.populate("dialog user attachments").then((message: any) => {
          DialogModel.findOneAndUpdate(
            { _id: postData.dialog },
            { lastMessage: message._id },
            {
              upsert: true,
            }
          ).then(function (message) {
            if (!message) {
              return res.status(500).json({
                status: "error",
                message: "error",
              });
            }
            return res.json(message);
          });
          this.io.emit("SERVER:NEW_MESSAGE", message);
        });
      })

      .catch((reason) => {
        res.json(reason);
      });
  };

  delete = (req: any, res: express.Response) => {
    const id: string = req.query.id;
    const userId: string = req.user._id;
    MessageModel.findById(id).then((message: any) => {
      if (!message) {
        return res.status(404).json({
          status: "error",
          message: "Message not found",
        });
      }

      if (message.user.toString() === userId) {
        const dialogId = message.dialog;
        message.deleteOne();
        MessageModel.findOne(
          { dialog: dialogId },
          {},
          { sort: { createdAt: -1 } }
        ).then((lastMessage) => {
          if (!lastMessage) {
            res.status(500).json({
              status: "error",
              message: "Last message not found",
            });
          }

          DialogModel.findById(dialogId).then((dialog: any) => {
            if (!dialog) {
              res.status(500).json({
                status: "error",
                message: "Dialog not found",
              });
            }
            dialog.lastMessage = lastMessage;
            dialog.save();
          });
        });

        return res.json({
          status: "success",
          message: "Message deleted",
        });
      } else {
        return res.status(403).json({
          status: "error",
          message: "Not have permission",
        });
      }
    });
  };
}

export default MessageController;
