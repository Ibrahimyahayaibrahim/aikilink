// Catches errors thrown or passed via next(err) from any route/controller.
// In production, internal error details (stack traces, raw driver messages) are never
// sent to the client — only a generic message — since leaking them can hand an
// attacker useful information about the stack, schema, or query structure.
export function errorHandler(err, req, res, next) {
  console.error(err);

  const isProd = process.env.NODE_ENV === "production";

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: isProd ? "Invalid input" : err.message });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ message: `A record with that ${field} already exists` });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier supplied" });
  }

  const status = err.statusCode || 500;
  const message = status < 500 ? err.message : isProd ? "Internal server error" : err.message;
  res.status(status).json({ message });
}

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}
