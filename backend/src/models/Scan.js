const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Scores you’ll store after scan pipeline
    p_img: { type: Number },
    p_clin: { type: Number },
    p_fused: { type: Number },

    // optional for later
    imageUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scan", scanSchema);