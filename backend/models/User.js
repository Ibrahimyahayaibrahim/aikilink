import mongoose from "mongoose";
import { baseToJSON } from "../utils/schemaOptions.js";

// Table 3.5: User
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned by default queries
    },
    role: {
      type: String,
      enum: ["provider", "homeowner"],
      required: true,
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    // Basic brute-force throttling at the account level, independent of the
    // IP-based rate limiter on the /api/auth routes (defense in depth).
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockedUntil: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    // Belt-and-braces: even if passwordHash is ever explicitly selected in a query,
    // it can never leak out through res.json(user) because toJSON strips it here too.
    toJSON: baseToJSON(["passwordHash", "failedLoginAttempts", "lockedUntil"]),
  }
);

export default mongoose.model("User", userSchema);
