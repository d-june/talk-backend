"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const isEmail_1 = __importDefault(require("validator/lib/isEmail"));
const utils_1 = require("../utils");
const date_fns_1 = require("date-fns");
const mongoose_paginate_1 = __importDefault(require("mongoose-paginate"));
const UserModule = new mongoose_1.Schema({
    email: {
        type: String,
        require: "Email address is required",
        validate: [isEmail_1.default, "Invalid email"],
        unique: true,
    },
    fullName: {
        type: String,
        require: "FullName is required",
    },
    password: {
        type: String,
        require: "Password is required",
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
    avatar: String,
    confirmHash: String,
    lastSeen: {
        type: Date,
        default: new Date(),
    },
    status: String,
    birthday: Date,
    city: String,
    about: String,
    hobbies: String,
}, {
    timestamps: true,
});
UserModule.virtual("isOnline").get(function () {
    return (0, date_fns_1.differenceInMinutes)(new Date(), this.lastSeen) < 5;
});
UserModule.set("toJSON", {
    virtuals: true,
});
UserModule.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password"))
        return next();
    (0, utils_1.generatePasswordHash)(user.password)
        .then((hash) => {
        user.password = String(hash);
        (0, utils_1.generatePasswordHash)(`${+new Date()}`).then((confirmHash) => {
            user.confirmHash = String(confirmHash);
        });
        next();
    })
        .catch((err) => {
        next(err);
    });
});
UserModule.plugin(mongoose_paginate_1.default);
const User = mongoose_1.default.model("User", UserModule);
exports.default = User;
//# sourceMappingURL=User.js.map