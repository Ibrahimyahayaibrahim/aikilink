import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
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
import notificationRoutes from "./routes/notificationRoutes.js";
import { categoryRouter, areaRouter } from "./routes/lookupRoutes.js";

// Import HTTP and Socket.io
import http from "http";
import { Server } from "socket.io";

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

// Wrap Express with a native HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173").split(",").map((s) => s.trim()).filter(Boolean);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Make io globally accessible to your controllers via req.app.get('io')
app.set("io", io);

// Socket.io Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure this matches how you structured your JWT payload (usually id or userId)
    socket.userId = decoded.id; 
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

// Authenticated Socket Connection Logic
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id} | User ID: ${socket.userId}`);

  // Join a private room named exactly after the user's database ID
  if (socket.userId) {
    socket.join(socket.userId.toString());
  }

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.set("trust proxy", 1); 

// --- Security middleware ---
app.use(secureHeaders);
app.use(generalLimiter);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false, credentials: true }));
app.use(express.json({ limit: "10kb" })); 
app.use(sanitizeMongo);
app.use(preventParamPollution);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// --- Health check ---
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/categories", categoryRouter);
app.use("/api/areas", areaRouter);
app.use("/api/notifications", notificationRoutes);

// --- 404 + error handling ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  assertSecureConfig();
  await connectDB();
  
  // IMPORTANT: Server listens, binding both Express and Socket.io to the port
  server.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
  });
}

if (process.argv[1] && process.argv[1].endsWith("server.js")) {
  start().catch((err) => {
    console.error("[server] Failed to start:", err.message);
    process.exit(1);
  });
}

// Export both for potential testing environments
export { app, server };