import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import {
  secureHeaders,
  generalLimiter,
  sanitizeMongo,
  preventParamPollution,
} from "./middleware/security.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import { categoryRouter, areaRouter } from "./routes/lookupRoutes.js";

// Fail fast on weak/missing security-critical configuration rather than booting into an
// insecure state (e.g. a short or default JWT secret that would make tokens forgeable).
function assertSecureConfig() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error(
      "JWT_SECRET is missing or too short (need at least 24 characters). " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
    );
  }
}

const app = express();

app.set("trust proxy", 1); // needed for correct client IPs behind a reverse proxy/load balancer

// --- Security middleware (applied before any route handling) ---
app.use(secureHeaders);
app.use(generalLimiter);

const allowedOrigins = (process.env.CLIENT_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false, credentials: true }));

app.use(express.json({ limit: "10kb" })); // caps request body size against payload-based DoS
app.use(sanitizeMongo);
app.use(preventParamPollution);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// --- Health check ---
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// --- Routes (Table 3.14) ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/categories", categoryRouter);
app.use("/api/areas", areaRouter);

// --- 404 + error handling ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  assertSecureConfig();
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
  });
}

// Only auto-start when run directly (not when imported by tests)
if (process.argv[1] && process.argv[1].endsWith("server.js")) {
  start().catch((err) => {
    console.error("[server] Failed to start:", err.message);
    process.exit(1);
  });
}

export default app;
