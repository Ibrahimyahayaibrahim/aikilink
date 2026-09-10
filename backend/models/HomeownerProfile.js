import mongoose from "mongoose";
import { baseToJSON } from "../utils/schemaOptions.js";

// Table 3.7: Homeowner Profile
const homeownerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    defaultState: {
      type: String,
      trim: true,
      default: null,
    },
    defaultLga: {
      type: String,
      trim: true,
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ["free", "subscribed"],
      default: "free",
    },
  },
  { toJSON: baseToJSON() }
);

export default mongoose.model("HomeownerProfile", homeownerProfileSchema);