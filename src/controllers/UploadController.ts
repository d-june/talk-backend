import express from "express";
import { UploadedFileModel } from "../models";
import cloudinary from "../core/cloudinary";

class UploadController {
  create = (req: any, res: express.Response): void => {
    const userId: string = req.user._id;
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
          user: userId,
        };

        const uploadFile = new UploadedFileModel(fileData);

        uploadFile
          .save()
          .then((fileObj) => {
            res.json({
              status: "success",
              file: fileObj,
            });
          })
          .catch((err: any) => {
            res.json({
              status: "error",
              message: err,
            });
          });
      })
      .end(file.buffer);
  };

  delete = (req: any, res: express.Response): void => {
    const fileId: string = req.user._id;
    UploadedFileModel.deleteOne({ _id: fileId }, function (err: any) {
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

export default UploadController;
