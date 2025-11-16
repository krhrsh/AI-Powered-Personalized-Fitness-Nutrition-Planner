const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

async function auth(req, res, next) {
  const hdr = req.headers.authorization;
  if (!hdr) return res.status(401).json({ error: "no token" });
  const parts = hdr.split(" ");
  if (parts.length !== 2)
    return res.status(401).json({ error: "invalid auth header" });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: "user not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
}

module.exports = auth;
