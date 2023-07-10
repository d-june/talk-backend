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
const models_1 = require("../models");
const utils_1 = require("../utils");
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const cloudinary_1 = __importDefault(require("../core/cloudinary"));
class UserController {
    constructor(io) {
        this.io = io;
    }
    show(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const user = yield models_1.UserModel.findById(id).exec();
            if (!user) {
                return res.status(404).json({
                    message: "Not found",
                });
            }
            else {
                res.json(user);
            }
        });
    }
    getMe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.user._id;
            const user = yield models_1.UserModel.findById(id).exec();
            if (!id) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            else {
                res.json(user);
            }
        });
    }
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, perPage } = req.query;
                const options = {
                    page: parseInt(page, 10) || 1,
                    limit: parseInt(perPage, 8) || 8,
                };
                const users = yield models_1.UserModel.paginate({}, options);
                return res.json(users);
            }
            catch (err) {
                return res.status(500).send(err);
            }
        });
    }
    create(req, res) {
        const postData = {
            email: req.body.email,
            fullName: req.body.fullName,
            password: req.body.password,
        };
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        const user = new models_1.UserModel(postData);
        user
            .save()
            .then((obj) => {
            res.json(obj);
        })
            .catch((reason) => {
            res.status(500).json({
                status: "error",
                message: reason,
            });
        });
    }
    verify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = req.query.hash;
            if (!hash) {
                return res.status(422).json({ errors: "Invalid hah" });
            }
            const user = yield models_1.UserModel.find({ confirmHash: hash }).then((user) => {
                if (!user) {
                    return res.status(404).json({
                        status: "error",
                        message: "Hash not found",
                    });
                }
                user.confirmed = true;
                user.save((err) => {
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
            });
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const postData = {
                email: req.body.email,
                password: req.body.password,
            };
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            const user = yield models_1.UserModel.findOne({ email: postData.email }).exec();
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            if (bcrypt_1.default.compareSync(postData.password, user.password)) {
                const token = (0, utils_1.createJWTToken)(user);
                res.json({
                    status: "success",
                    token,
                });
            }
            else {
                res.status(403).json({
                    status: "error",
                    message: "Incorrect password or email",
                });
            }
        });
    }
    findUsers(req, res) {
        const query = req.query.query;
        models_1.UserModel.find()
            .or([
            { fullName: new RegExp(query, "i") },
            { email: new RegExp(query, "i") },
        ])
            .then((users) => {
            res.json(users);
        })
            .catch((err) => {
            return res.status(404).json({
                status: "error",
                message: err,
            });
        });
    }
    updateStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { _id: req.user._id };
            const update = { status: req.body.status };
            yield models_1.UserModel.findOneAndUpdate(filter, update, {
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
        });
    }
    updateAvatar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { _id: req.user._id };
            const file = req.file;
            cloudinary_1.default.v2.uploader
                .upload_stream({ resource_type: "auto" }, (error, result) => {
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
                models_1.UserModel.findOneAndUpdate(filter, update, {
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
                const uploadFile = new models_1.UploadedFileModel(fileData);
                uploadFile.save();
            })
                .end(file.buffer);
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { _id: req.user._id };
            const update = {
                fullName: req.body.fullName,
                birthday: new Date(req.body.birthday),
                city: req.body.city,
                about: req.body.about,
                hobbies: req.body.hobbies,
            };
            yield models_1.UserModel.findOneAndUpdate(filter, update, {
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
        });
    }
    getUserStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const user = yield models_1.UserModel.findById(id).exec();
            if (!id) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            else {
                res.json(user === null || user === void 0 ? void 0 : user.status);
            }
        });
    }
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.user._id;
            const user = yield models_1.UserModel.findById(id).exec();
            if (!id) {
                return res.status(404).json({
                    message: "User not found",
                });
            }
            else {
                res.json(user);
            }
        });
    }
    delete(req, res) {
        const id = req.params.id;
        models_1.UserModel.findOneAndRemove({ _id: id })
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
exports.default = UserController;
//# sourceMappingURL=UserController.js.map