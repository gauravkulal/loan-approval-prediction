const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────────

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost port in development
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

// ── Health check ───────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    message: "Loan Approval Prediction API (Node.js/Express) is running.",
    available_endpoints: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET  /api/auth/me",
      "POST /api/predict",
      "GET  /api/history",
      "GET  /api/stats",
      "POST /api/train",
    ],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ── Start server ───────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  🚀  Express server running at http://localhost:${PORT}`);
  console.log(`  📦  SQLite database: ${path.join(__dirname, "loan_approval.db")}`);
  console.log(`  🔑  Auth endpoints:  POST /api/auth/register, POST /api/auth/login`);
  console.log(`  🤖  ML endpoints:    POST /api/predict, POST /api/train`);
  console.log(`  📊  Data endpoints:  GET  /api/history, GET /api/stats\n`);
});
