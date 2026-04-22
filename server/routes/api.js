const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const {
  insertPrediction,
  fetchPredictions,
  fetchPredictionsByDecision,
} = require("../db");
const { runPython } = require("../pythonBridge");

const router = express.Router();

// All routes in this file are protected behind auth
router.use(authMiddleware);

// Required fields for a loan application
const REQUIRED_FIELDS = [
  "no_of_dependents",
  "education",
  "self_employed",
  "income_annum",
  "loan_amount",
  "loan_term",
  "cibil_score",
  "residential_assets_value",
  "commercial_assets_value",
  "luxury_assets_value",
  "bank_asset_value",
];

// ── POST /api/predict ──────────────────────────────────────────────────────────

router.post("/predict", async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "JSON body is required." });
    }

    const missing = REQUIRED_FIELDS.filter((f) => !(f in payload));
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }

    // Call Python ML model via bridge script
    const result = await runPython("predict_bridge.py", payload);

    // Save prediction to SQLite
    const info = insertPrediction.run({
      user_id: req.user.id,
      input_payload: JSON.stringify(payload),
      prediction: result.prediction,
      approved_probability: result.probability.approved,
      rejected_probability: result.probability.rejected,
      confidence: result.confidence,
      risk_factors: JSON.stringify(result.risk_factors),
      model_name: result.model_name || "unknown",
    });

    return res.json({ id: Number(info.lastInsertRowid), ...result });
  } catch (err) {
    console.error("Predict error:", err);
    return res.status(500).json({ error: err.message || "Prediction failed." });
  }
});

// ── GET /api/history ───────────────────────────────────────────────────────────

router.get("/history", (req, res) => {
  try {
    const decision = req.query.decision || "";
    const limit = parseInt(req.query.limit) || 100;

    let rows;
    if (decision) {
      rows = fetchPredictionsByDecision.all(decision, limit);
    } else {
      rows = fetchPredictions.all(limit);
    }

    const items = rows.map((row) => ({
      id: row.id,
      input_payload: JSON.parse(row.input_payload),
      prediction: row.prediction,
      approved_probability: row.approved_probability,
      rejected_probability: row.rejected_probability,
      confidence: row.confidence,
      risk_factors: JSON.parse(row.risk_factors),
      model_name: row.model_name,
      created_at: row.created_at,
    }));

    return res.json({ count: items.length, items });
  } catch (err) {
    console.error("History error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/stats ─────────────────────────────────────────────────────────────

router.get("/stats", (req, res) => {
  try {
    const rows = fetchPredictions.all(5000);

    const items = rows.map((row) => ({
      id: row.id,
      input_payload: JSON.parse(row.input_payload),
      prediction: row.prediction,
      approved_probability: row.approved_probability,
      rejected_probability: row.rejected_probability,
      confidence: row.confidence,
      risk_factors: JSON.parse(row.risk_factors),
      model_name: row.model_name,
      created_at: row.created_at,
    }));

    const total = items.length;
    const approvedCount = items.filter((r) => r.prediction === "Approved").length;
    const rejectedCount = items.filter((r) => r.prediction === "Rejected").length;

    const loanAmounts = items.map(
      (r) => parseFloat(r.input_payload.loan_amount || 0)
    );
    const avgLoanAmount = total > 0
      ? loanAmounts.reduce((a, b) => a + b, 0) / total
      : 0;

    // Risk factor frequency
    const riskFreq = {};
    for (const item of items) {
      for (const factor of item.risk_factors) {
        riskFreq[factor] = (riskFreq[factor] || 0) + 1;
      }
    }

    const riskFactorFrequency = Object.entries(riskFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([factor, count]) => ({ factor, count }));

    // Loan amount distribution
    const loanDistribution = [
      { label: "0-5M", count: loanAmounts.filter((v) => v >= 0 && v < 5000000).length },
      { label: "5M-10M", count: loanAmounts.filter((v) => v >= 5000000 && v < 10000000).length },
      { label: "10M-20M", count: loanAmounts.filter((v) => v >= 10000000 && v < 20000000).length },
      { label: "20M+", count: loanAmounts.filter((v) => v >= 20000000).length },
    ];

    // Feature importance from model file (try to read via Python bridge)
    // For stats we return the cached data or empty array
    let featureImportanceSummary = [];
    try {
      const fs = require("fs");
      const path = require("path");
      const metricsPath = path.resolve(__dirname, "../../model/training_metrics.json");
      if (fs.existsSync(metricsPath)) {
        // Metrics file exists but doesn't contain feature importance —
        // we'll let the predict result carry that info instead.
      }
    } catch {
      // ignore
    }

    return res.json({
      total_predictions: total,
      approval_count: approvedCount,
      rejection_count: rejectedCount,
      average_loan_amount: avgLoanAmount,
      approval_vs_rejection: [
        { name: "Approved", value: approvedCount },
        { name: "Rejected", value: rejectedCount },
      ],
      loan_amount_distribution: loanDistribution,
      risk_factor_frequency: riskFactorFrequency,
      feature_importance_summary: featureImportanceSummary,
      recent_predictions: items.slice(0, 10),
    });
  } catch (err) {
    console.error("Stats error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/train ────────────────────────────────────────────────────────────

router.post("/train", async (req, res) => {
  try {
    const config = req.body || {};
    const result = await runPython("train_bridge.py", config);
    return res.json({ status: "completed", ...result });
  } catch (err) {
    console.error("Train error:", err);
    return res.status(500).json({ error: err.message || "Training failed." });
  }
});

module.exports = router;
