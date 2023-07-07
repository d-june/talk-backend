import mongoose from "mongoose";
import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";

import createRoutes from "./core/routes";
import { createSocket } from "./core";

const app = express();
const http = createServer(app);
const io = createSocket(http);

dotenv.config();

createRoutes(app, io);

mongoose.connect("mongodb://127.0.0.1:27017/chat");

http.listen(process.env.PORT, function () {
  console.log(`Server: http://localhost: ${process.env.PORT}`);
});
