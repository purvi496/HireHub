
const express = require("express");
const router = express.Router();

const users = require("../data/users");
const crypto = require("crypto");

// In-memory sessions
const sessions = new Map();

// Register
router.post("/register", (req, res) => {
    const { name, email, password, role, skills, company } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({
            message: "All required fields must be provided"
        });
    }

    if (!["candidate", "recruiter"].includes(role)) {
        return res.status(400).json({
            message: "Invalid role"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must contain at least 6 characters"
        });
    }

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({
            message: "Email already registered"
        });
    }

    if (role === "recruiter" && !company) {
        return res.status(400).json({
            message: "Company name is required for recruiters"
        });
    }

    const salt = crypto.randomBytes(16).toString("hex");

    const hashedPassword = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    const newUser = {
        id: users.length > 0
            ? Math.max(...users.map(u => u.id)) + 1
            : 1,
        name,
        email,
        password: hashedPassword,
        salt,
        role,
        ...(role === "candidate" ? { skills: skills || [] } : { company })
    };

    users.push(newUser);

    res.status(201).json({
        message: "Registration successful",
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        }
    });
});

// Login
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const salt = user.salt || "";
    const storedPassword = user.password;

    // Verify hashed password for newly registered users
    let isValid = false;

    if (user.salt) {
        const hashedPassword = crypto
            .scryptSync(password, salt, 64);

        const storedBuffer = Buffer.from(storedPassword, "hex");

        isValid =
            storedBuffer.length === hashedPassword.length &&
            crypto.timingSafeEqual(storedBuffer, hashedPassword);
    } else {
        // Temporary compatibility with original sample accounts
        isValid = storedPassword === password;
    }

    if (!isValid) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const sessionId = crypto.randomBytes(32).toString("hex");

    sessions.set(sessionId, user.id);

    res.status(200).json({
        message: "Login successful",
        sessionId,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

// Logout
router.post("/logout", (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({
            message: "Invalid session"
        });
    }

    sessions.delete(sessionId);

    res.status(200).json({
        message: "Logout successful"
    });
});

module.exports = { router, sessions };
