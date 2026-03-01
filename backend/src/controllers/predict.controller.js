const { runFusionForUser } = require("../services/predict.service");

async function runPrediction(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required (field name: file)" });
    }

    const result = await runFusionForUser({
      userId: req.userId,
      file: req.file, // buffer, mimetype, etc.
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("runPrediction error:", err);
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
}

module.exports = { runPrediction };