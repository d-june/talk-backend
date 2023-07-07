import express from "express";
import socket from "socket.io";
import {
  UserCtrl,
  DialogCtrl,
  MessageCtrl,
  UploadCtrl,
  PostCtrl,
} from "../controllers";
import bodyParser from "body-parser";
import { updateLastSeen, checkAuth } from "../middlewares";
import { loginValidation, registerValidation } from "../utils/validations";
import multer from "./multer";

const createRoutes = (app: express.Express, io: socket.Server) => {
  const UserController = new UserCtrl(io);
  const DialogController = new DialogCtrl(io);
  const MessageController = new MessageCtrl(io);
  const UploadFileController = new UploadCtrl();
  const PostController = new PostCtrl();

  app.use(bodyParser.json());

  app.use(checkAuth);
  app.use(updateLastSeen);

  app.get("/users", UserController.getUsers);

  app.get("/user/me", UserController.getMe);
  app.post("/user/registration/verify", UserController.verify);
  app.post("/user/registration", registerValidation, UserController.create);
  app.post("/user/login", loginValidation, UserController.login);
  app.get("/user/status/:id", UserController.getUserStatus);
  app.get("/user/profile/:id", UserController.getProfile);
  app.post("/user/status", UserController.updateStatus);

  app.post("/user/profile", UserController.updateProfile);
  app.post("/user/avatar", multer.single("file"), UserController.updateAvatar);
  app.get("/user/find", UserController.findUsers);
  app.get("/user/:id", UserController.show);
  app.delete("/user/:id", UserController.delete);

  app.get("/dialogs/:id", DialogController.index);
  app.delete("/dialogs/:id", DialogController.delete);
  app.post("/dialogs", DialogController.create);
  app.get("/dialogs/find/:id", DialogController.findDialog);

  app.get("/messages", MessageController.index);
  app.post("/messages", MessageController.create);
  app.delete("/messages", MessageController.delete);

  app.get("/posts/:id", PostController.index);
  app.post("/posts", PostController.create);
  app.post("/post/likes", PostController.updateLikesCount);
  app.delete("/posts", PostController.delete);

  app.post("/files", multer.single("file"), UploadFileController.create);
  app.delete("/files", UploadFileController.delete);
};

export default createRoutes;
