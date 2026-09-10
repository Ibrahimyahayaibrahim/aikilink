import mongoose from "mongoose";
import { baseToJSON } from "../utils/schemaOptions.js";

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
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    lga: {
      type: String,
      required: [true, "LGA is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },
    // --- ADD BUDGET FIELDS ---
    budgetMin: {
      type: Number,
      default: 0,
    },
    budgetMax: {
      type: Number,
      default: 0,
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

jobPostingSchema.index({ status: 1, categoryId: 1, state: 1, lga: 1 });

export default mongoose.model("JobPosting", jobPostingSchema);