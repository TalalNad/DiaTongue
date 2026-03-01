const axios = require("axios");
const FormData = require("form-data");

const User = require("../models/User");
const Prediction = require("../models/Prediction");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

async function runFusionForUser({ userId, file }) {
  // 1) load user clinical data from DB
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found");

  // validate required clinical fields
  const required = ["age", "bmi", "gender", "smoking_history", "hypertension", "heart_disease"];
  for (const k of required) {
    if (user[k] === undefined || user[k] === null || user[k] === "") {
      throw new Error(`Missing clinical field '${k}' for this user`);
    }
  }

  // 2) call AI service /predict/fusion with multipart form
  const fd = new FormData();
  fd.append("file", file.buffer, {
    filename: file.originalname || "tongue.jpg",
    contentType: file.mimetype,
  });

  // IMPORTANT: these names must match FastAPI Form(...) names
  fd.append("age", String(user.age));
  fd.append("bmi", String(user.bmi));
  fd.append("hypertension", String(user.hypertension));
  fd.append("heart_disease", String(user.heart_disease));
  fd.append("gender", String(user.gender));
  fd.append("smoking_history", String(user.smoking_history));

  const aiResp = await axios.post(`${AI_SERVICE_URL}/predict/fusion`, fd, {
    headers: fd.getHeaders(),
    maxBodyLength: Infinity,
  });

  const { p_fused, p_img, p_clin } = aiResp.data;

  // 3) store to DB
  const pred = await Prediction.create({
    user: userId,
    imageMeta: {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    },
    p_img,
    p_clin,
    p_fused,
  });

  // 4) return to frontend
  return {
    id: pred._id,
    p_img,
    p_clin,
    p_fused,
    createdAt: pred.createdAt,
  };
}

module.exports = { runFusionForUser };