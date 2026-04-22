const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "loan_approval_secret_key_2026";

/**
 * Express middleware that verifies the JWT from the Authorization header.
 * Attaches decoded user payload to req.user on success.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
