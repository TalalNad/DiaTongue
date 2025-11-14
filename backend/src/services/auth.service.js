// src/services/auth.service.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dev-key";
const JWT_EXPIRES_IN = "7d";

async function signupUser(payload) {
  const {
    fullName,
    email,
    password,
    phone,
    age,
    bmi,
    gender,
    smoking_history,
    hypertension,
    heart_disease,
  } = payload;

  if (!fullName || !email || !password || !age) {
    throw new Error("fullName, email, password, and age are required");
  }

  if (age <= 5) {
    throw new Error("Age must be greater than 5");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    passwordHash,
    phone,
    age,
    bmi,
    gender,
    smoking_history,
    hypertension,
    heart_disease,
  });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      age: user.age,
    },
  };
}

// 🔹 NEW: login logic
async function loginUser(payload) {
  const { email, password } = payload;

  if (!email || !password) {
    throw new Error("email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      age: user.age,
    },
  };
}

module.exports = {
  signupUser,
  loginUser,
};