"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.default = [
    (0, express_validator_1.check)("email").isEmail(),
    (0, express_validator_1.check)("fullName").isLength({ min: 3 }),
    (0, express_validator_1.check)("password").isLength({ min: 5 }),
];
//# sourceMappingURL=register.js.map