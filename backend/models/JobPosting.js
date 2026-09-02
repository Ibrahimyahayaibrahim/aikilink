import mongoose from "mongoose";
import { baseToJSON } from "../utils/schemaOptions.js";

// Table 3.8: Job Posting
// Status lifecycle (Section 3.14): Open -> Claimed -> Completed, with manual Reopen (Claimed -> Open)
const jobPostingSchema = new mongoose.Schema(
  {
    homeownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomeownerProfile",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },
    urgency: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Open", "Claimed", "Completed"],
      default: "Open",
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      default: null,
    },
    claimedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    toJSON: baseToJSON(),
  }
);

// Supports the matching algorithm (Section 3.13): filtering Open jobs by category/area
jobPostingSchema.index({ status: 1, categoryId: 1, areaId: 1 });

export default mongoose.model("JobPosting", jobPostingSchema);
