"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostCtrl = exports.UploadCtrl = exports.MessageCtrl = exports.DialogCtrl = exports.UserCtrl = void 0;
var UserController_1 = require("./UserController");
Object.defineProperty(exports, "UserCtrl", { enumerable: true, get: function () { return __importDefault(UserController_1).default; } });
var DialogController_1 = require("./DialogController");
Object.defineProperty(exports, "DialogCtrl", { enumerable: true, get: function () { return __importDefault(DialogController_1).default; } });
var MessageController_1 = require("./MessageController");
Object.defineProperty(exports, "MessageCtrl", { enumerable: true, get: function () { return __importDefault(MessageController_1).default; } });
var UploadController_1 = require("./UploadController");
Object.defineProperty(exports, "UploadCtrl", { enumerable: true, get: function () { return __importDefault(UploadController_1).default; } });
var PostController_1 = require("./PostController");
Object.defineProperty(exports, "PostCtrl", { enumerable: true, get: function () { return __importDefault(PostController_1).default; } });
