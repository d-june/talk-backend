import mongoose from "mongoose";
import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";

import createRoutes from "./core/routes";
import { createSocket } from "./core";
const cors = require("cors");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
  methods: ["GET", "POST", "DELETE"],
};

const app = express();
app.use(cors(corsOptions));
const http = createServer(app);
const io = createSocket(http);

dotenv.config();

createRoutes(app, io);

// @ts-ignore
mongoose.connect(process.env.MONGO_URI);

http.listen(process.env.PORT || 9999, function () {
  console.log(`Server:  ${process.env.PORT}`);
});
