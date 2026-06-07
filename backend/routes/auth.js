const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// 🔥 LOGIN DEBUG (temporary)
router.post("/login", (req, res, next) => {
  console.log("🔥 LOGIN HIT");
  console.log("RAW BODY:", req.body);
  next();
});


// 🔑 LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    console.log("===== LOGIN DEBUG START =====");
    console.log("HEADERS:", req.headers);
    console.log("BODY:", req.body);
    console.log("EMAIL:", req.body?.email);
    console.log("PASSWORD:", req.body?.password);
    console.log("===== LOGIN DEBUG END =====");

    const { email, password } = req.body;

    // ❌ validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
        debug: { receivedBody: req.body }
      });
    }

    // 🔍 user find
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
        success: false
      });
    }

    // 🚫 suspended check
    if (user.suspended) {
      return res.status(403).json({
        message: "Account suspended",
        success: false
      });
    }

    // 🔐 password check
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
        success: false
      });
    }

    // 🎟️ token generate
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      role: user.role,
      name: user.fullname || user.name
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      success: false
    });
  }
});

module.exports = router;