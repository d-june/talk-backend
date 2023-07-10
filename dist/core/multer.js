"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require("multer");
const storage = multer.memoryStorage();
const uploader = multer({ storage });
exports.default = uploader;
//# sourceMappingURL=multer.js.map