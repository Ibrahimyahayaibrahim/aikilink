import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { getMe, updateMe } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", requireAuth, asyncHandler(getMe));
router.put("/me", requireAuth, asyncHandler(updateMe));

export default router;
