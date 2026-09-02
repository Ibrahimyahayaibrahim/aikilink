import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateObjectIdParam } from "../utils/validators.js";
import {
  getMyProviderProfile,
  updateMyProfile,
  uploadIdDocument,
  getProviderPublicProfile,
  getProviderRatings,
} from "../controllers/providerController.js";

const router = express.Router();

// NOTE: "/me" must be registered before the generic "/:id" route below, or Express
// will try to interpret "me" as a provider id.
router.get("/me", requireAuth, requireRole("provider"), asyncHandler(getMyProviderProfile));
router.put("/me", requireAuth, requireRole("provider"), asyncHandler(updateMyProfile));
router.post("/me/id-upload", requireAuth, requireRole("provider"), asyncHandler(uploadIdDocument));
router.get("/:id", validateObjectIdParam("id"), asyncHandler(getProviderPublicProfile));
router.get("/:id/ratings", validateObjectIdParam("id"), asyncHandler(getProviderRatings));

export default router;