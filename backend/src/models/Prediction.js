const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // optional: store image path/url if you later add S3/Cloudinary
    imageMeta: {
      filename: String,
      mimetype: String,
      size: Number,
    },

    p_img: { type: Number, required: true },
    p_clin: { type: Number, required: true },
    p_fused: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prediction", predictionSchema);