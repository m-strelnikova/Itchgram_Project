import express from "express";
import http from "http";
import "dotenv/config";
import connectDB from "./config/db.js";
import cors from "cors";
import authRouter from "./routes/auth.js";
import postRouter from "./routes/posts.js";
import usersRouter from "./routes/users.js";
import notificationsRouter from "./routes/notifications.js";
import messagesRouter from "./routes/messages.js";
import { initSocket } from "./socket.js";

const app = express();
const port = process.env.PORT || 3333;

// Middlewares:
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use("/users", usersRouter);

app.use("/notifications", notificationsRouter);
app.use("/messages", messagesRouter);

const httpServer = http.createServer(app);
initSocket(httpServer);

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();