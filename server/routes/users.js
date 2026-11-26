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

router.get("/:id", authMiddleware, async (req, res) => {
    try {

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({
            _id: user._id,
            username: user.username,
            profileImage: user.profileImage, 
            fullName: user.fullName,
            bio: user.bio, 
            followers: user.followers, 
            following: user.following, 
            website: user.website,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user data" });
    }
});

// Edit current user's profile
router.patch("/profile/edit", authMiddleware, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const { username, fullName, website, bio, profileImage } = req.body;

        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: currentUserId } });
            if (existingUser) {
                return res.status(400).json({ message: "This username is already taken." });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            currentUserId,
            { 
                ...(username && { username }),
                ...(fullName && { fullName}),
                ...(website !== undefined && { website }),
                ...(bio !== undefined && { bio }),
                ...(profileImage && { profileImage })
            },
            { returnDocument: "after", runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                profileImage: updatedUser.profileImage,
                fullName: updatedUser.fullName,
                bio: updatedUser.bio,
                website: updatedUser.website
            }
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
});

export default router;