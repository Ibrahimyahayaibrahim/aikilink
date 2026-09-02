import mongoose from "mongoose";
import { baseToJSON } from "../utils/schemaOptions.js";

// Table 3.10: Rating
const ratingSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
      unique: true, // one rating per completed job (FR16)
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },
    homeownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomeownerProfile",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    toJSON: baseToJSON(),
  }
);

ratingSchema.index({ providerId: 1 });

export default mongoose.model("Rating", ratingSchema);
