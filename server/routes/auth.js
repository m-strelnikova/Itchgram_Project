import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email, fullName, username, password } = req.body;

        if (!email || !fullName || !username || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 10 characters and include uppercase, lowercase, number and special character."
            });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "This username or email is already taken." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            fullName,
            username,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "Registration successful",
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Registration failed!" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ message: "Login and password are required!" });
        }

        const user = await User.findOne({
            $or: [{ username: login }, { email: login }]
        });

        if (!user) {
            return res.status(404).json({ message: "Invalid login data or user doesn't exist." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            userId: user._id,
            username: user.username,
            profileImage: user.profileImage
        });
        
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error during login." });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { emailOrUsername, newPassword } = req.body;

        if (!emailOrUsername || !newPassword) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const user = await User.findOne({
            $or: [{ username: emailOrUsername }, { email: emailOrUsername }]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password successfully updated!" });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: "Internal server error during password reset." });
    }
});

export default router;