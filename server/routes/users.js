import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:id/follow", authMiddleware, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.userId;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = targetUser.followers.includes(currentUserId);

        if (isFollowing) {
            targetUser.followers.pull(currentUserId);
            currentUser.following.pull(targetUserId);
        } else {
            targetUser.followers.push(currentUserId);
            currentUser.following.push(targetUserId);
        }

        await targetUser.save();
        await currentUser.save();

        res.status(200).json({ followers: targetUser.followers });
    } catch (error) {
        res.status(500).json({ message: "Failed to update follow status" });
    }
});

export default router;