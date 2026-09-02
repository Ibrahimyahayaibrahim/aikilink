import User from "../models/User.js";
import { isValidEmail } from "../utils/validators.js";

// GET /api/users/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// PUT /api/users/me
// Deliberately whitelists exactly which fields can be updated (name, email) rather than
// spreading req.body into the update — this prevents mass-assignment vulnerabilities
// where a client could otherwise attempt to set role, accountStatus, or passwordHash
// directly through this endpoint.
export const updateMe = async (req, res) => {
  const { name, email } = req.body;

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100)) {
    return res.status(400).json({ message: "name must be between 2 and 100 characters" });
  }
  if (email !== undefined && !isValidEmail(email)) {
    return res.status(400).json({ message: "Please supply a valid email address" });
  }

  const update = {};
  if (name !== undefined) update.name = name.trim();
  if (email !== undefined) update.email = email;

  const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};
