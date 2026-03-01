const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dev-key";

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    // Support "Bearer <token>" with extra spaces
    const parts = String(header).trim().split(/\s+/);
    const type = parts[0];
    const bearerToken = parts[1];

    // Fallback for mobile clients
    const token =
      (type && type.toLowerCase() === "bearer" && bearerToken ? bearerToken : null) ||
      req.headers["x-access-token"] ||
      null;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Missing or invalid Authorization header" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded?.userId) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    req.userId = decoded.userId;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };