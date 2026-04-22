const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "loan_approval.db");

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma("journal_mode = WAL");

// ── Create tables ──────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname    TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password_hash TEXT  NOT NULL,
    created_at  TEXT    DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS predictions (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id               INTEGER NOT NULL,
    input_payload         TEXT    NOT NULL,
    prediction            TEXT    NOT NULL,
    approved_probability  REAL    NOT NULL,
    rejected_probability  REAL    NOT NULL,
    confidence            REAL    NOT NULL,
    risk_factors          TEXT    NOT NULL,
    model_name            TEXT    NOT NULL,
    created_at            TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ── Prepared statements ────────────────────────────────────────────────────────

const insertUser = db.prepare(`
  INSERT INTO users (fullname, email, password_hash)
  VALUES (@fullname, @email, @password_hash)
`);

const findUserByEmail = db.prepare(`
  SELECT * FROM users WHERE email = ?
`);

const findUserById = db.prepare(`
  SELECT id, fullname, email, created_at FROM users WHERE id = ?
`);

const insertPrediction = db.prepare(`
  INSERT INTO predictions (
    user_id, input_payload, prediction,
    approved_probability, rejected_probability,
    confidence, risk_factors, model_name
  ) VALUES (
    @user_id, @input_payload, @prediction,
    @approved_probability, @rejected_probability,
    @confidence, @risk_factors, @model_name
  )
`);

const fetchPredictions = db.prepare(`
  SELECT * FROM predictions
  ORDER BY id DESC
  LIMIT ?
`);

const fetchPredictionsByDecision = db.prepare(`
  SELECT * FROM predictions
  WHERE prediction = ?
  ORDER BY id DESC
  LIMIT ?
`);

module.exports = {
  db,
  insertUser,
  findUserByEmail,
  findUserById,
  insertPrediction,
  fetchPredictions,
  fetchPredictionsByDecision,
};
