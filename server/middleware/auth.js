// Simple JWT-like token verification middleware
// In a production app, you'd use proper JWT with jsonwebtoken library

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  // For demo purposes, extract user ID from simple token format
  // In production, use proper JWT verification
  let userId;

  if (token === "demo-token") {
    userId = 1; // Demo user
  } else if (token.startsWith("token-")) {
    userId = parseInt(token.replace("token-", ""));
  } else {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (!userId || isNaN(userId)) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  // Add user info to request
  req.user = { id: userId };
  next();
};

// Optional auth middleware - doesn't require token but adds user if present
const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    let userId;
    if (token === "demo-token") {
      userId = 1;
    } else if (token.startsWith("token-")) {
      userId = parseInt(token.replace("token-", ""));
    }

    if (userId && !isNaN(userId)) {
      req.user = { id: userId };
    }
  }

  next();
};

module.exports = { authMiddleware, optionalAuthMiddleware };
