import mongoose from "mongoose";
import { baseToJSON } from "../utils/schemaOptions.js";

// Table 3.9: Job Interest Log
// Records every provider who expresses interest in a job, independent of who is selected.
// Powers the "job taken, stop calling" notification to unsuccessful providers (FR11).
const jobInterestLogSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: baseToJSON() }
);

// A provider should only register interest once per job
jobInterestLogSchema.index({ jobId: 1, providerId: 1 }, { unique: true });

export default mongoose.model("JobInterestLog", jobInterestLogSchema);
