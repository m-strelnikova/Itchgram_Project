import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Chatlist
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const myId = new mongoose.Types.ObjectId(req.user.userId);

    const messages = await Message.find({
      $or: [{ sender: myId }, { recipient: myId }]
    }).sort({ createdAt: -1 });

    const lastMessageByUser = new Map();
    for (const msg of messages) {
      const otherId =
        msg.sender.toString() === req.user.userId
          ? msg.recipient.toString()
          : msg.sender.toString();

      if (!lastMessageByUser.has(otherId)) {
        lastMessageByUser.set(otherId, msg);
      }
    }

    const me = await User.findById(req.user.userId).select("following followers");
    const relatedIds = new Set([
      ...lastMessageByUser.keys(),
      ...(me?.following || []).map((id) => id.toString()),
      ...(me?.followers || []).map((id) => id.toString())
    ]);
    relatedIds.delete(req.user.userId);

    const users = await User.find({ _id: { $in: [...relatedIds] } }).select(
      "_id username fullName profileImage"
    );

    const conversations = users.map((u) => {
      const lastMsg = lastMessageByUser.get(u._id.toString()) || null;
      return {
        user: u,
        lastMessage: lastMsg
          ? {
              text: lastMsg.text,
              sender: lastMsg.sender.toString(),
              createdAt: lastMsg.createdAt
            }
          : null
      };
    });

    conversations.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ message: "Failed to load conversations" });
  }
});

// Chat history
router.get("/:otherUserId", authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const myId = req.user.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: otherUserId },
        { sender: otherUserId, recipient: myId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("sender", "_id username profileImage")
      .populate("recipient", "_id username profileImage");

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ message: "Failed to load messages" });
  }
});

export default router;