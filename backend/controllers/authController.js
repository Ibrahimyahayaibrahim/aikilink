import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ProviderProfile from "../models/ProviderProfile.js";
import HomeownerProfile from "../models/HomeownerProfile.js";
import { isValidPhone, isValidEmail, isStrongEnoughPassword } from "../utils/validators.js";
import { ISSUER } from "../middleware/auth.js";

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    issuer: ISSUER,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register  (FR1)
// Minimal shared fields; role-specific fields (categories/areas/ID) are set later via
// PUT /api/providers/me and POST /api/providers/me/id-upload, keeping registration itself fast.
export const register = async (req, res) => {
  const { name, phone, email, password, role } = req.body;

  if (!name || !phone || !password || !role) {
    return res.status(400).json({ message: "name, phone, password, and role are required" });
  }
  if (!["provider", "homeowner"].includes(role)) {
    return res.status(400).json({ message: "role must be 'provider' or 'homeowner'" });
  }
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({ message: "name must be between 2 and 100 characters" });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ message: "Please supply a valid Nigerian phone number" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Please supply a valid email address" });
  }
  if (!isStrongEnoughPassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters and include at least one number" });
  }

  const existing = await User.findOne({ phone });
  if (existing) {
    // Deliberately generic — confirming *which* field collided would let an attacker
    // enumerate registered phone numbers.
    return res.status(409).json({ message: "A user with this phone number already exists" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name: name.trim(), phone, email, passwordHash, role });

  if (role === "provider") {
    await ProviderProfile.create({ userId: user._id });
  } else {
    await HomeownerProfile.create({ userId: user._id });
  }

  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
  });
};

// POST /api/auth/login  (FR2)
// Implements account-level lockout after repeated failures, in addition to the
// IP-based rate limiter applied at the route level (middleware/security.js). A
// deliberately generic "Invalid credentials" message is used for every failure case
// (unknown phone, wrong password, locked, suspended) so a caller cannot use the
// response to enumerate which phone numbers are registered.
export const login = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ message: "phone and password are required" });
  }

  const genericFailure = () => res.status(401).json({ message: "Invalid credentials" });

  const user = await User.findOne({ phone }).select("+passwordHash +failedLoginAttempts +lockedUntil");
  if (!user || user.accountStatus === "suspended") {
    return genericFailure();
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return res.status(423).json({ message: "Account temporarily locked. Please try again later." });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    return genericFailure();
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await user.save();

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
  });
};
