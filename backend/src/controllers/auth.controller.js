// src/controllers/auth.controller.js
const { signupUser, loginUser } = require("../services/auth.service");

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const result = await signupUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(400).json({
      success: false,
      message: err.message || "Signup failed",
    });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(400).json({
      success: false,
      message: err.message || "Login failed",
    });
  }
}

module.exports = {
  signup,
  login,
};