import socket from "socket.io";
import http from "http";

export default (http: http.Server) => {
  const io = require("socket.io")(http, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", function (socket: any) {
    socket.on("DIALOGS:JOIN", (dialogId: string) => {
      socket.dialogId = dialogId;
      socket.join(dialogId);
    });
    socket.on("DIALOGS:TYPING", (obj: any) => {
      socket.to(obj.dialogId).broadcast.emit("DIALOGS:TYPING", obj);
    });
  });

  return io;
};
