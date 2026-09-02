// Populates the fixed, predefined Category and Area lookup lists (Section 1.5, Table 3.11/3.12).
// Run with: npm run seed
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Area from "../models/Area.js";

const CATEGORIES = [
  "Electrician",
  "Plumber",
  "Mechanic",
  "Carpenter",
  "Painter",
  "AC/Refrigeration Technician",
  "Generator Repair Technician",
  "Locksmith",
  "Cleaner / Fumigation",
  "Mason / Tiler",
  "Welder",
];

// A starter list for Ibadan, Oyo State — adjust/extend to match your actual pilot area.
const AREAS = [
  { name: "Bodija", city: "Ibadan" },
  { name: "Iyaganku", city: "Ibadan" },
  { name: "Ring Road", city: "Ibadan" },
  { name: "Mokola", city: "Ibadan" },
  { name: "Dugbe", city: "Ibadan" },
  { name: "Agodi", city: "Ibadan" },
  { name: "Sango", city: "Ibadan" },
  { name: "Apata", city: "Ibadan" },
];

async function seed() {
  await connectDB();

  for (const name of CATEGORIES) {
    await Category.findOneAndUpdate({ name }, { name }, { upsert: true });
  }
  console.log(`[seed] Ensured ${CATEGORIES.length} categories`);

  for (const area of AREAS) {
    await Area.findOneAndUpdate(area, area, { upsert: true });
  }
  console.log(`[seed] Ensured ${AREAS.length} areas`);

  await mongoose.disconnect();
  console.log("[seed] Done");
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
