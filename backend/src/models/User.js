// src/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    // From signup
    age: {
      type: Number,
      required: true,
      min: 6,
    },

    // From questionnaire
    bmi: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    smoking_history: {
      type: String,
      enum: ["never", "current", "former"],
    },
    hypertension: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    heart_disease: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;