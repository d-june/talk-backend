"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.default = (req, res, next) => {
    if (req.path === "/user/login" ||
        req.path === "/user/registration" ||
        req.path === "/user/registration/verify") {
        return next();
    }
    const token = req.headers.token;
    (0, utils_1.verifyJWTToken)(token)
        .then((user) => {
        req.user = user.data._doc;
        next();
    })
        .catch((err) => {
        res.status(403).json({ message: "Invalid auth token provided" });
    });
};
//# sourceMappingURL=checkAuth.js.map