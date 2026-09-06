import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { getNotifications, markAllRead, markOneRead } from "../controllers/notificationController.js";

const router = express.Router();

router.use(requireAuth); // Protect all notification routes

router.get("/", asyncHandler(getNotifications));
router.patch("/read", asyncHandler(markAllRead));
router.patch("/:id/read", asyncHandler(markOneRead));

export default router;