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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Post_1 = __importDefault(require("../models/Post"));
class PostController {
    constructor() {
        this.create = (req, res) => {
            const userId = req.user._id;
            const postData = {
                text: req.body.text,
                user: userId,
            };
            const post = new Post_1.default(postData);
            post
                .save()
                .then((obj) => {
                obj.populate("user").then((post) => {
                    if (!post) {
                        return res.status(500).json({
                            status: "error",
                            message: "error",
                        });
                    }
                    return res.json(post);
                });
            })
                .catch((reason) => {
                res.json(reason);
            });
        };
        this.delete = (req, res) => {
            const id = req.query.id;
            Post_1.default.findOneAndRemove({ _id: id })
                .then((post) => {
                if (post) {
                    res.json({
                        message: `Post deleted`,
                    });
                }
            })
                .catch(() => {
                res.json({
                    message: "Post not found",
                });
            });
        };
    }
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            Post_1.default.find({ user: userId })
                .populate("user")
                .then((posts) => {
                if (!posts) {
                    return res.status(404).json({
                        status: "error",
                        message: "Message not found",
                    });
                }
                return res.json(posts);
            });
        });
    }
    updateLikesCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { _id: req.query.id };
            const update = { likes: req.body.likes, liked: req.body.liked };
            yield Post_1.default.findOneAndUpdate(filter, update, {
                upsert: true,
            })
                .then((post) => {
                if (post) {
                    res.json({
                        message: `Likes count updated`,
                    });
                }
            })
                .catch(() => {
                res.json({
                    message: "Post not found",
                });
            });
        });
    }
}
exports.default = PostController;
