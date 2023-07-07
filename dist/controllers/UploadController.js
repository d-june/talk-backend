"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const cloudinary_1 = __importDefault(require("../core/cloudinary"));
class UploadController {
    constructor() {
        this.create = (req, res) => {
            const userId = req.user._id;
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
                    user: userId,
                };
                const uploadFile = new models_1.UploadedFileModel(fileData);
                uploadFile
                    .save()
                    .then((fileObj) => {
                    res.json({
                        status: "success",
                        file: fileObj,
                    });
                })
                    .catch((err) => {
                    res.json({
                        status: "error",
                        message: err,
                    });
                });
            })
                .end(file.buffer);
        };
        this.delete = (req, res) => {
            const fileId = req.user._id;
            models_1.UploadedFileModel.deleteOne({ _id: fileId }, function (err) {
                if (err) {
                    return res.status(500).json({
                        status: "error",
                        message: err,
                    });
                }
                res.json({
                    status: "success",
                });
            });
        };
    }
}
exports.default = UploadController;
