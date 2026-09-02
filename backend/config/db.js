import mongoose from "mongoose";

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env and configure it.");
  }

  mongoose.set("strictQuery", true);
  // Never let Mongoose silently build queries from unexpected operators nested in
  // user input; combined with express-mongo-sanitize this closes off NoSQL injection
  // via req.body/query/params containing keys like "$gt" or "$where".
 

  try {
    await mongoose.connect(uri);
    console.log(`[db] Connected to MongoDB (${mongoose.connection.name})`);
  } catch (err) {
    console.error("[db] Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}
