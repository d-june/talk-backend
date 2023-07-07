"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./core/routes"));
const core_1 = require("./core");
const app = (0, express_1.default)();
const http = (0, http_1.createServer)(app);
const io = (0, core_1.createSocket)(http);
dotenv_1.default.config();
(0, routes_1.default)(app, io);
mongoose_1.default.connect("mongodb://127.0.0.1:27017/chat");
http.listen(process.env.PORT, function () {
    console.log(`Server: http://localhost: ${process.env.PORT}`);
});
