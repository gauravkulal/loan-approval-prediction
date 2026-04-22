const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { insertUser, findUserByEmail, findUserById } = require("../db");
const { authMiddleware, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

const TOKEN_EXPIRY = "7d";

// ── POST /api/auth/register ────────────────────────────────────────────────────

router.post("/register", (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "Full name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Check if user already exists
    const existing = findUserByEmail.get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Hash password and create user
    const password_hash = bcrypt.hashSync(password, 10);
    const result = insertUser.run({
      fullname: fullname.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
    });

    const token = jwt.sign(
      { id: result.lastInsertRowid, email: email.toLowerCase().trim(), fullname: fullname.trim() },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: result.lastInsertRowid,
        fullname: fullname.trim(),
        email: email.toLowerCase().trim(),
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────────

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = findUserByEmail.get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, fullname: user.fullname },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────────

router.get("/me", authMiddleware, (req, res) => {
  try {
    const user = findUserById.get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({ user });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
