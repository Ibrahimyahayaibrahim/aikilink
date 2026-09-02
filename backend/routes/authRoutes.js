import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import { authLimiter } from "../middleware/security.js";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// authLimiter applies specifically here — this is the highest-value target for
// credential-stuffing/brute-force, separate from the general API-wide rate limit.
router.post("/register", authLimiter, asyncHandler(register));
router.post("/login", authLimiter, asyncHandler(login));

export default router;
