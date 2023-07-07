"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (http) => {
    const io = require("socket.io")(http, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", function (socket) {
        socket.on("DIALOGS:JOIN", (dialogId) => {
            socket.dialogId = dialogId;
            socket.join(dialogId);
        });
        socket.on("DIALOGS:TYPING", (obj) => {
            socket.broadcast.emit("DIALOGS:TYPING", obj);
        });
    });
    return io;
};
