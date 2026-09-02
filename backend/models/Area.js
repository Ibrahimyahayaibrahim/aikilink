import mongoose from "mongoose";
import { baseToJSON } from "../utils/schemaOptions.js";

// Table 3.12: Area
// Structured, general-area location (Section 1.5) — not GPS/free text, so matching stays reliable.
const areaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
  },
  { toJSON: baseToJSON() }
);

areaSchema.index({ name: 1, city: 1 }, { unique: true });

export default mongoose.model("Area", areaSchema);
