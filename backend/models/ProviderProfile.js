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
    state: {
      type: String,
      trim: true,
      default: null,
    },
    lga: {
      type: String,
      trim: true,
      default: null,
    },
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

// A job matches this provider if job.category is in categories AND job.state/lga equal provider state/lga
// (Section 3.13 matching rule)
providerProfileSchema.index({ categories: 1 });
providerProfileSchema.index({ state: 1, lga: 1 });

export default mongoose.model("ProviderProfile", providerProfileSchema);