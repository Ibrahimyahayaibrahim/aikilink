import mongoose from "mongoose";
import { baseToJSON } from "../utils/schemaOptions.js";

// Table 3.6: Provider Profile
const providerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    coverageAreas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Area",
      },
    ],
    idDocumentUrl: {
      type: String,
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ["free", "subscribed"],
      default: "free",
    },
    subscriptionExpiry: {
      type: Date,
      default: null,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 1000,
    },
  },
  { toJSON: baseToJSON() }
);

// A job matches this provider if job.category is in categories AND job.area is in coverageAreas
// (Section 3.13 matching rule)
providerProfileSchema.index({ categories: 1 });
providerProfileSchema.index({ coverageAreas: 1 });

export default mongoose.model("ProviderProfile", providerProfileSchema);
