const User = require("../models/User");

function deriveFirstName(fullName) {
  return (fullName || "User").trim().split(/\s+/)[0] || "User";
}

// GET /api/users/me
async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.json({
      success: true,
      data: {
        ...user.toObject(),
        firstName: deriveFirstName(user.fullName),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch user" });
  }
}

// PUT /api/users/me (Profile edit screen)
async function updateMe(req, res) {
  try {
    const {
      fullName,
      phone,
      age,
      bmi,
      gender,
      smoking_history,
      hypertension,
      heart_disease,
    } = req.body;

    const updates = {};
    if (typeof fullName === "string") updates.fullName = fullName.trim();
    if (typeof phone === "string") updates.phone = phone.trim();

    // Optional clinical/profile fields (safe additive updates)
    if (age !== undefined) updates.age = age;
    if (bmi !== undefined) updates.bmi = bmi;
    if (gender !== undefined) updates.gender = gender;
    if (smoking_history !== undefined) updates.smoking_history = smoking_history;
    if (hypertension !== undefined) updates.hypertension = hypertension;
    if (heart_disease !== undefined) updates.heart_disease = heart_disease;

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.json({
      success: true,
      data: {
        ...user.toObject(),
        firstName: deriveFirstName(user.fullName),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to update user" });
  }
}

module.exports = { getMe, updateMe };