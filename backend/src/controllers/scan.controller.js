const Prediction = require("../models/Prediction");
const User = require("../models/User");
const PDFDocument = require("pdfkit");

function riskLabel(pFused) {
  if (pFused == null || Number.isNaN(pFused)) return null;
  if (pFused < 0.33) return "Low Risk";
  if (pFused < 0.66) return "Medium Risk";
  return "High Risk";
}

function pct(x) {
  if (typeof x !== "number") return "--";
  return `${Math.round(x * 100)}%`;
}

// GET /api/scans (history list)
async function getMyScans(req, res) {
  try {
    // Your prediction pipeline stores docs in the `predictions` collection
    // and uses field `user` (not userId)
    const preds = await Prediction.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const data = preds.map((p) => {
      const fused = typeof p.p_fused === "number" ? p.p_fused : null;
      return {
        _id: p._id,
        createdAt: p.createdAt,
        p_img: p.p_img,
        p_clin: p.p_clin,
        p_fused: fused,
        confidence: fused, // frontend can multiply by 100
        riskLabel: riskLabel(fused),
        imageMeta: p.imageMeta || null,
      };
    });

    return res.json({ success: true, data });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Failed to fetch scans" });
  }
}

// GET /api/scans/latest (home card)
async function getLatestScan(req, res) {
  try {
    const p = await Prediction.findOne({ user: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!p) {
      return res.json({ success: true, data: null });
    }

    const fused = typeof p.p_fused === "number" ? p.p_fused : null;

    return res.json({
      success: true,
      data: {
        _id: p._id,
        createdAt: p.createdAt,
        confidence: fused, // frontend can multiply by 100
        riskLabel: riskLabel(fused) || "No Record",
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Failed to fetch latest" });
  }
}

// DELETE /api/scans/:id
async function deleteScan(req, res) {
  try {
    const scan = await Prediction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    }).lean();

    if (!scan) {
      return res.status(404).json({ success: false, message: "Scan not found" });
    }

    return res.json({ success: true, data: { _id: req.params.id } });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Failed to delete scan" });
  }
}

// ✅ NEW: GET /api/scans/:id/report  (PDF download)
async function getScanReport(req, res) {
  try {
    const scanId = req.params.id;

    // ensure scan belongs to the logged-in user
    const scan = await Prediction.findOne({ _id: scanId, user: req.userId }).lean();
    if (!scan) {
      return res.status(404).json({ success: false, message: "Scan not found" });
    }

    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // PDF headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="DiaTongue_Report_${scanId}.pdf"`
    );

    const doc = new PDFDocument({ margin: 48 });
    doc.pipe(res);

    // --- Header ---
    doc.fontSize(20).font("Helvetica-Bold").text("DiaTongue Clinical Report", {
      align: "left",
    });
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#444")
      .text(`Generated: ${new Date().toLocaleString()}`);
    doc.fillColor("#000");
    doc.moveDown(1);

    // --- Patient details ---
    doc.fontSize(14).font("Helvetica-Bold").text("Patient Information");
    doc.moveDown(0.4);

    const patientRows = [
      ["Full Name", user.fullName || "--"],
      ["Email", user.email || "--"],
      ["Age", user.age != null ? String(user.age) : "--"],
      ["BMI", user.bmi != null ? String(user.bmi) : "--"],
      ["Gender", user.gender || "--"],
      ["Smoking history", user.smoking_history || "--"],
      ["Hypertension", user.hypertension === 1 ? "Yes" : "No"],
      ["Heart disease", user.heart_disease === 1 ? "Yes" : "No"],
    ];

    patientRows.forEach(([k, v]) => {
      doc.font("Helvetica-Bold").fontSize(11).text(`${k}: `, { continued: true });
      doc.font("Helvetica").fontSize(11).text(v);
    });

    doc.moveDown(1);

    // --- Scan details ---
    doc.fontSize(14).font("Helvetica-Bold").text("Scan & Model Outputs");
    doc.moveDown(0.4);

    const pImg = scan.p_img;
    const pClin = scan.p_clin;
    const pFused = scan.p_fused;

    const risk = riskLabel(pFused) || "No Record";

    doc.font("Helvetica").fontSize(11).text(
      `Tongue image model indicates ${pct(pImg)} chance of diabetes.`
    );
    doc.font("Helvetica").fontSize(11).text(
      `Clinical data model indicates ${pct(pClin)} chance of diabetes.`
    );
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .moveDown(0.3)
      .text(`Final fused output indicates ${pct(pFused)} chance of diabetes (${risk}).`);

    doc.moveDown(1);

    // --- Notes / Disclaimer ---
    doc.fontSize(14).font("Helvetica-Bold").text("Clinical Notes");
    doc.moveDown(0.4);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#333")
      .text(
        "This report is generated by machine-learning models and is intended for informational purposes only. " +
          "It is not a medical diagnosis. Please consult a qualified healthcare professional for clinical interpretation and next steps."
      );
    doc.fillColor("#000");

    doc.moveDown(1);

    doc
      .fontSize(10)
      .fillColor("#666")
      .text("DiaTongue — Tongue + Clinical Diabetes Risk Screening", { align: "left" });

    doc.end();
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Failed to generate report" });
  }
}

module.exports = { getMyScans, getLatestScan, getScanReport, deleteScan };
