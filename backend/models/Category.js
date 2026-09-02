import mongoose from "mongoose";
import { baseToJSON } from "../utils/schemaOptions.js";

// Table 3.11: Category
// A fixed, predefined list (Section 1.5) — not user-defined, to keep matching reliable.
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
  },
  { toJSON: baseToJSON() }
);

export default mongoose.model("Category", categorySchema);
