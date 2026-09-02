import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateObjectIdParam } from "../utils/validators.js";
import {
  createJob,
  searchJobs,
  getMyMatches,
  getMyJobs,
  getMyAssignedJobs,
  getJobById,
  expressInterest,
  getInterestedProviders,
  claimJob,
  reopenJob,
  completeJob,
  submitRating,
} from "../controllers/jobController.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("homeowner"), asyncHandler(createJob));
router.get("/", requireAuth, requireRole("provider"), asyncHandler(searchJobs));
router.get("/matches", requireAuth, requireRole("provider"), asyncHandler(getMyMatches));
router.get("/mine", requireAuth, requireRole("homeowner"), asyncHandler(getMyJobs));
router.get("/assigned", requireAuth, requireRole("provider"), asyncHandler(getMyAssignedJobs));
router.get("/:id", requireAuth, validateObjectIdParam("id"), asyncHandler(getJobById));
router.post(
  "/:id/interest",
  requireAuth,
  requireRole("provider"),
  validateObjectIdParam("id"),
  asyncHandler(expressInterest)
);
router.get(
  "/:id/interested",
  requireAuth,
  requireRole("homeowner"),
  validateObjectIdParam("id"),
  asyncHandler(getInterestedProviders)
);
router.patch(
  "/:id/claim",
  requireAuth,
  requireRole("homeowner"),
  validateObjectIdParam("id"),
  asyncHandler(claimJob)
);
router.patch(
  "/:id/reopen",
  requireAuth,
  requireRole("homeowner"),
  validateObjectIdParam("id"),
  asyncHandler(reopenJob)
);
router.patch(
  "/:id/complete",
  requireAuth,
  requireRole("homeowner"),
  validateObjectIdParam("id"),
  asyncHandler(completeJob)
);
router.post(
  "/:id/rating",
  requireAuth,
  requireRole("homeowner"),
  validateObjectIdParam("id"),
  asyncHandler(submitRating)
);

export default router;