import express from "express";
import multer from "multer";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Create a post (protected route)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
    try {
        const { caption } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        const base64Image = req.file.buffer.toString("base64");
        const base64EncodedImage = `data:${req.file.mimetype};base64,${base64Image}`;

        const newPost = await Post.create({
            author: req.user.userId,
            imageUrl: base64EncodedImage,
            caption: caption || ""
        });

        const populatedPost = await Post.findById(newPost._id)
            .populate("author", "username profileImage followers")
            .populate({
                path: "comments",
                populate: { path: "user", select: "username profileImage" }
            });
        res.status(201).json(populatedPost);
    } catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({ message: "Failed to create post", error: error.message });
    }
});

// Get ALL posts
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "username profileImage followers")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "username profileImage"
                }
            });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch posts" });
    }
});

// Get a SINGLE post per ID
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "username profileImage followers")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "username profileImage"
                }
            });

        if (!post) return res.status(404).json({ message: "Post not found" });
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch post" });
    }
});


// Populate a like (protected route)
router.post("/:id/like", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const userId = req.user.userId;
        const likedIndex = post.likes.indexOf(userId);

        if (likedIndex > -1) {
            post.likes.splice(likedIndex, 1);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.status(200).json({ likes: post.likes });
    } catch (error) {
        res.status(500).json({ message: "Failed to toggle like" });
    }
});

// Populate a comment (protected route)
router.post("/:id/comment", authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Comment text is required" });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const newComment = await Comment.create({
            user: req.user.userId,
            text
        });

        post.comments.push(newComment._id);
        await post.save();

        const updatedPost = await Post.findById(req.params.id)
            .populate("author", "username profileImage followers")
            .populate({
                path: "comments",
                populate: { path: "user", select: "username profileImage" }
            });

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({ message: "Failed to add comment" });
    }
});

export default router;