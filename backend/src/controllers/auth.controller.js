// src/controllers/auth.controller.js
const { signupUser } = require("../services/auth.service");

async function signup(req, res) {
  try {
    // Expecting:
    // fullName, email, password, phone, age, bmi,
    // gender, smoking_history, hypertension, heart_disease
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

module.exports = {
  signup,
};