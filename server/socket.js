import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "./models/Message.js";

let ioInstance = null;

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }
      const secret = process.env.JWT_SECRET || "your_jwt_secret";
      const decoded = jwt.verify(token, secret);
      socket.userId = decoded.userId || decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    if (userId) {
      socket.join(userId.toString());
    }

    socket.on("send_message", async ({ recipientId, text }, callback) => {
      try {
        const cleanText = String(text || "").trim();
        if (!recipientId || !cleanText || !userId) {
          return callback?.({ ok: false, error: "Invalid message payload" });
        }

        const saved = await Message.create({
          sender: userId,
          recipient: recipientId,
          text: cleanText
        });

        const populated = await Message.findById(saved._id)
          .populate("sender", "_id username profileImage")
          .populate("recipient", "_id username profileImage");

        io.to(recipientId.toString()).emit("new_message", populated);
        io.to(userId.toString()).emit("new_message", populated);

        callback?.({ ok: true, message: populated });
      } catch (error) {
        console.error("Socket send_message error:", error);
        callback?.({ ok: false, error: "Failed to send message" });
      }
    });
  });

  ioInstance = io;
  return io;
}

export function getIO() {
  return ioInstance;
}