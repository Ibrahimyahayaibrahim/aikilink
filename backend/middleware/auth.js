import jwt from "jsonwebtoken";

const ISSUER = "local-services-api";

// Verifies the JWT attached to the Authorization header (Section 3.18: stateless,
// token-based auth). The signing algorithm is pinned explicitly to HS256 to close off
// "alg confusion" attacks, where a token crafted with alg: "none" or an attacker-chosen
// algorithm could otherwise bypass signature verification on a permissively configured
// verifier.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token missing" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: ISSUER,
    });
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
  console.log("JWT Verification Failed:", err.message); // <-- Add this line
  return res.status(401).json({ message: "Invalid or expired token" });
}
  }


// Restricts a route to one or more roles, e.g. requireRole("provider").
// Always used after requireAuth, so req.user is guaranteed to exist here.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `This action requires role: ${roles.join(" or ")}` });
    }
    next();
  };
}

export { ISSUER };
