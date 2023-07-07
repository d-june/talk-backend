"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class MessageController {
    constructor(io) {
        this.create = (req, res) => {
            const userId = req.user._id;
            const postData = {
                text: req.body.text,
                dialog: req.body.dialog_id,
                attachments: req.body.attachments,
                user: userId,
            };
            const message = new models_1.MessageModel(postData);
            message
                .save()
                .then((obj) => {
                obj.populate("dialog user attachments").then((message) => {
                    models_1.DialogModel.findOneAndUpdate({ _id: postData.dialog }, { lastMessage: message._id }, {
                        upsert: true,
                    }).then(function (message) {
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
        this.delete = (req, res) => {
            const id = req.query.id;
            const userId = req.user._id;
            models_1.MessageModel.findById(id).then((message) => {
                if (!message) {
                    return res.status(404).json({
                        status: "error",
                        message: "Message not found",
                    });
                }
                if (message.user.toString() === userId) {
                    const dialogId = message.dialog;
                    message.deleteOne();
                    models_1.MessageModel.findOne({ dialog: dialogId }, {}, { sort: { createdAt: -1 } }).then((lastMessage) => {
                        if (!lastMessage) {
                            res.status(500).json({
                                status: "error",
                                message: "Last message not found",
                            });
                        }
                        models_1.DialogModel.findById(dialogId).then((dialog) => {
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
                }
                else {
                    return res.status(403).json({
                        status: "error",
                        message: "Not have permission",
                    });
                }
            });
        };
        this.io = io;
    }
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogId = req.query.dialog;
            const userId = req.user._id;
            models_1.MessageModel.updateMany({ dialog: dialogId, user: { $ne: userId } }, { $set: { readed: true } });
            models_1.MessageModel.find({ dialog: dialogId })
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
        });
    }
}
exports.default = MessageController;
