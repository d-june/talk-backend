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
class DialogController {
    constructor(io) {
        this.create = (req, res) => {
            const postData = {
                author: req.user._id,
                partner: req.body.partner,
            };
            const dialog = new models_1.DialogModel(postData);
            dialog
                .save()
                .then((dialogObj) => {
                const message = new models_1.MessageModel({
                    text: req.body.text,
                    user: req.user._id,
                    dialog: dialogObj._id,
                });
                message
                    .save()
                    .then((messageObj) => {
                    dialogObj.lastMessage = message._id;
                    dialogObj.save().then(() => {
                        res.json({ dialogObj });
                        this.io.emit("SERVER:DIALOG_CREATED", Object.assign(Object.assign({}, postData), { dialog: dialogObj }));
                    });
                })
                    .catch((reason) => {
                    res.json(reason);
                });
            })
                .catch((reason) => {
                res.json(reason);
            });
        };
        this.io = io;
    }
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user._id;
            const dialogs = yield models_1.DialogModel.find()
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
            }
            else {
                return res.json(dialogs);
            }
        });
    }
    findDialog(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user._id;
            const partnerId = req.params.id;
            const dialogs = yield models_1.DialogModel.find()
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
            }
            else {
                return res.json(dialogs);
            }
        });
    }
    delete(req, res) {
        const id = req.params.id;
        models_1.DialogModel.findOneAndRemove({ _id: id })
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
exports.default = DialogController;
