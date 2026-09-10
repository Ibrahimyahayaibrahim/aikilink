import JobPosting from "../models/JobPosting.js";
import JobInterestLog from "../models/JobInterestLog.js";
import ProviderProfile from "../models/ProviderProfile.js";
import HomeownerProfile from "../models/HomeownerProfile.js";
import Rating from "../models/Rating.js";
import { isValidObjectId, isValidScore } from "../utils/validators.js";
import Notification from "../models/Notification.js";

const MAX_PAGE_SIZE = 100;

async function getHomeownerProfileOrFail(userId) {
  const profile = await HomeownerProfile.findOne({ userId });
  if (!profile) {
    const err = new Error("Homeowner profile not found");
    err.statusCode = 404;
    throw err;
  }
  return profile;
}

async function getProviderProfileOrFail(userId) {
  const profile = await ProviderProfile.findOne({ userId });
  if (!profile) {
    const err = new Error("Provider profile not found");
    err.statusCode = 404;
    throw err;
  }
  return profile;
}

// POST /api/jobs  (FR6) — Homeowner only
// POST /api/jobs  (FR6) — Homeowner only
export const createJob = async (req, res) => {
  try {
    const { categoryId, state, lga, description, urgency } = req.body;

    // 1. Validate the new string fields
    if (!categoryId || !state || !lga || !description) {
      return res.status(400).json({ message: "categoryId, state, lga, and description are required" });
    }

    const homeownerProfile = await getHomeownerProfileOrFail(req.user.id);

    // 2. Save the job with text instead of ObjectIds
    const job = await JobPosting.create({
      homeownerId: homeownerProfile._id,
      categoryId,
      state: state.trim(),
      lga: lga.trim(),
      description: description.trim(),
      urgency: !!urgency,
      status: "Open",
    });

    // 3. Find providers matching the exact state and LGA (case-insensitive)
    const matchingProviders = await ProviderProfile.find({
      categories: categoryId,
      state: { $regex: new RegExp(`^${state.trim()}$`, "i") },
      lga: { $regex: new RegExp(`^${lga.trim()}$`, "i") }
    });

    const matchingProviderCount = matchingProviders.length;

    // 4. Create and Emit Notifications
    if (matchingProviderCount > 0) {
      const notifications = matchingProviders.map((provider) => ({
        // Map to your schema's exact required fields
        recipient: provider.userId,
        title: "New Job Alert",
        body: `A new job is available in ${lga.trim()}, ${state.trim()}`,
        
        // Include these if your schema supports them
        type: "new_job",
        link: `/provider/jobs/${job._id}`,
      }));

      // Save to database so they persist if the user is offline
      await Notification.insertMany(notifications);

      // Grab the global Socket.io instance and emit to online users
      const io = req.app.get("io");
      if (io) {
        notifications.forEach((notif) => {
          // Send only to the specific artisan's private room
          // Ensure we emit to the correct ID string
          io.to(notif.recipient.toString()).emit("notification", notif);
        });
      }
    }

    res.status(201).json({ job, matchingProviderCount });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs  (FR8 — pull) — Provider only. 
// GET /api/jobs  (FR8 — pull) — Provider only. 
export const searchJobs = async (req, res) => {
  const { category, state, lga } = req.query;
  const filter = { status: "Open" };

  if (category !== undefined) {
    if (!isValidObjectId(category)) return res.status(400).json({ message: "Invalid category filter" });
    filter.categoryId = category;
  }
  
  // NEW: Filter by state and lga instead of areaId
  if (state !== undefined) {
    filter.state = { $regex: new RegExp(`^${state.trim()}$`, "i") };
  }
  if (lga !== undefined) {
    filter.lga = { $regex: new RegExp(`^${lga.trim()}$`, "i") };
  }

  const jobs = await JobPosting.find(filter)
    .populate("categoryId")
    .sort({ created_at: -1 })
    .limit(MAX_PAGE_SIZE);
  res.json(jobs);
};

// GET /api/jobs/matches  (FR7 — push) — Provider only. 
// GET /api/jobs/matches  (FR7 — push) — Provider only. 
export const getMyMatches = async (req, res) => {
  const providerProfile = await getProviderProfileOrFail(req.user.id);

  if (!providerProfile.state || !providerProfile.lga || !providerProfile.categories?.length) {
    return res.json([]);
  }

  const jobs = await JobPosting.find({
    status: "Open",
    categoryId: { $in: providerProfile.categories },
    // Use regex to avoid case-mismatch drops (e.g., "Gombe" vs "gombe")
    state: { $regex: new RegExp(`^${providerProfile.state.trim()}$`, "i") },
    lga: { $regex: new RegExp(`^${providerProfile.lga.trim()}$`, "i") },
  })
    .populate("categoryId")
    .sort({ created_at: -1 })
    .limit(MAX_PAGE_SIZE);

  res.json(jobs);
};

// GET /api/jobs/mine — Homeowner only
// GET /api/jobs/mine — Homeowner only
// GET /api/jobs/mine — Homeowner only
export const getMyJobs = async (req, res) => {
  try {
    const homeownerProfile = await getHomeownerProfileOrFail(req.user.id);

    const jobs = await JobPosting.find({ homeownerId: homeownerProfile._id })
      .populate("categoryId claimedBy")
      .sort({ created_at: -1 })
      .limit(MAX_PAGE_SIZE)
      .lean();

    if (!jobs.length) {
      return res.json([]);
    }

    const jobIds = jobs.map((j) => j._id);

    // Mongoose .find() automatically handles ObjectId casting across documents
    const allInterests = await JobInterestLog.find({
      jobId: { $in: jobIds },
    })
      .select("jobId")
      .lean();

    console.log(`[getMyJobs] Found ${allInterests.length} total applicant interest records for homeowner ${homeownerProfile._id}`);

    const countMap = {};
    allInterests.forEach((item) => {
      const idStr = item.jobId.toString();
      countMap[idStr] = (countMap[idStr] || 0) + 1;
    });

    const jobsWithCounts = jobs.map((j) => ({
      ...j,
      applicantCount: countMap[j._id.toString()] || 0,
    }));

    res.json(jobsWithCounts);
  } catch (error) {
    console.error("Error fetching homeowner jobs:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs/assigned — Provider only.
export const getMyAssignedJobs = async (req, res) => {
  const providerProfile = await getProviderProfileOrFail(req.user.id);
  const jobs = await JobPosting.find({ claimedBy: providerProfile._id })
    .populate("categoryId")
    .populate({ path: "homeownerId", populate: { path: "userId", select: "name" } })
    .sort({ claimedAt: -1 })
    .limit(MAX_PAGE_SIZE);
  res.json(jobs);
};

// GET /api/jobs/:id 
export const getJobById = async (req, res) => {
  const job = await JobPosting.findById(req.params.id).populate("categoryId claimedBy");
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
};

// POST /api/jobs/:id/interest  (FR9) — Provider only
// POST /api/jobs/:id/interest  (FR9) — Provider only
export const expressInterest = async (req, res) => {
  const job = await JobPosting.findById(req.params.id).populate("categoryId");
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (job.status !== "Open") {
    return res.status(409).json({ message: "This job is no longer open" });
  }

  const providerProfile = await getProviderProfileOrFail(req.user.id);
  
  await JobInterestLog.findOneAndUpdate(
    { jobId: job._id, providerId: providerProfile._id },
    { $setOnInsert: { timestamp: new Date() } },
    { upsert: true }
  );

  const homeownerProfile = await HomeownerProfile.findById(job.homeownerId).populate({
    path: "userId",
    select: "name phone _id",
  });

  const categoryName = job.categoryId?.name || "posted";
  
  // Notify the homeowner (DB + WebSocket)
  if (homeownerProfile && homeownerProfile.userId) {
    const homeownerUserId = homeownerProfile.userId._id.toString();

    const notif = await Notification.create({
      recipient: homeownerUserId,
      type: "quote",
      title: "New Artisan Interest",
      body: `An artisan is interested in your ${categoryName} job.`,
      link: `/homeowner/jobs/${job._id}`,
    });

    // Real-time socket push to homeowner's private room
    const io = req.app.get("io");
    if (io) {
      io.to(homeownerUserId).emit("notification", notif);
    }
  }

  res.json({
    message: "Interest recorded",
    contact: {
      name: homeownerProfile?.userId?.name,
      phone: homeownerProfile?.userId?.phone,
    },
  });
};
// GET /api/jobs/:id/interested  — Homeowner only
export const getInterestedProviders = async (req, res) => {
  const job = await JobPosting.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const homeownerProfile = await getHomeownerProfileOrFail(req.user.id);
  if (String(job.homeownerId) !== String(homeownerProfile._id)) {
    return res.status(403).json({ message: "You do not own this job" });
  }

  const interests = await JobInterestLog.find({ jobId: job._id })
    .sort({ timestamp: 1 }) 
    .populate({
      path: "providerId",
      select: "averageRating userId",
      populate: { path: "userId", select: "name phone" },
    });

  const providers = interests
    .filter((i) => i.providerId) 
    .map((i) => ({
      providerId: i.providerId._id,
      name: i.providerId.userId?.name,
      phone: i.providerId.userId?.phone,
      averageRating: i.providerId.averageRating,
      expressedInterestAt: i.timestamp,
    }));

  res.json(providers);
};

// PATCH /api/jobs/:id/claim  (FR10, FR11) — Homeowner only
export const claimJob = async (req, res) => {
  const { providerId } = req.body;
  if (!isValidObjectId(providerId)) {
    return res.status(400).json({ message: "A valid providerId is required" });
  }

  const job = await JobPosting.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const homeownerProfile = await getHomeownerProfileOrFail(req.user.id);
  if (String(job.homeownerId) !== String(homeownerProfile._id)) {
    return res.status(403).json({ message: "You do not own this job" });
  }
  if (job.status !== "Open") {
    return res.status(409).json({ message: "Only an Open job can be claimed" });
  }

  const hasExpressedInterest = await JobInterestLog.exists({ jobId: job._id, providerId });
  if (!hasExpressedInterest) {
    return res.status(409).json({ message: "This provider has not expressed interest in this job" });
  }

  job.status = "Claimed";
  job.claimedBy = providerId;
  job.claimedAt = new Date();
  await job.save();

  // 1. Notify the chosen provider (DB + WebSocket)
  const providerProfile = await ProviderProfile.findById(providerId).populate("userId");

  if (providerProfile && providerProfile.userId) {
    const providerUserId = providerProfile.userId._id.toString();

    const notif = await Notification.create({
      recipient: providerUserId,
      type: "claim",
      title: "Job Awarded!",
      body: `You have been selected for "${job.title}". Check your active jobs!`,
      link: `/provider/jobs/${job._id}`,
    });

    // Real-time socket emission to the artisan's private room
    const io = req.app.get("io");
    if (io) {
      io.to(providerUserId).emit("notification", notif);
    }
  }

  const otherInterestedProviderIds = (
    await JobInterestLog.find({ jobId: job._id, providerId: { $ne: providerId } })
  ).map((i) => i.providerId);

  res.json({ job, otherInterestedProviderIds });
};

// PATCH /api/jobs/:id/reopen  (FR12, FR13) — Homeowner only
export const reopenJob = async (req, res) => {
  const job = await JobPosting.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const homeownerProfile = await getHomeownerProfileOrFail(req.user.id);
  if (String(job.homeownerId) !== String(homeownerProfile._id)) {
    return res.status(403).json({ message: "You do not own this job" });
  }
  if (job.status !== "Claimed") {
    return res.status(409).json({ message: "Only a Claimed/In Progress job can be reopened" });
  }

  job.status = "Open";
  job.claimedBy = null;
  job.claimedAt = null;
  await job.save();

  res.json(job);
};

// PATCH /api/jobs/:id/complete  (FR14, FR15) — Homeowner only
export const completeJob = async (req, res) => {
  const job = await JobPosting.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const homeownerProfile = await getHomeownerProfileOrFail(req.user.id);
  if (String(job.homeownerId) !== String(homeownerProfile._id)) {
    return res.status(403).json({ message: "You do not own this job" });
  }
  if (job.status !== "Claimed") {
    return res.status(409).json({ message: "Only a Claimed/In Progress job can be marked Completed" });
  }

  job.status = "Completed";
  job.completedAt = new Date();
  await job.save();

  res.json({ job, ratingPrompt: true });
};

// POST /api/jobs/:id/rating  (FR16, FR17) — Homeowner only
export const submitRating = async (req, res) => {
  const { score, comment } = req.body;
  if (!isValidScore(score)) {
    return res.status(400).json({ message: "score must be a number between 1 and 5" });
  }
  if (comment !== undefined && (typeof comment !== "string" || comment.length > 500)) {
    return res.status(400).json({ message: "comment must be a string under 500 characters" });
  }

  const job = await JobPosting.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const homeownerProfile = await getHomeownerProfileOrFail(req.user.id);
  if (String(job.homeownerId) !== String(homeownerProfile._id)) {
    return res.status(403).json({ message: "You do not own this job" });
  }
  if (job.status !== "Completed") {
    return res.status(409).json({ message: "Only a Completed job can be rated" });
  }

  const existing = await Rating.findOne({ jobId: job._id });
  if (existing) {
    return res.status(409).json({ message: "This job has already been rated" });
  }

  const rating = await Rating.create({
    jobId: job._id,
    providerId: job.claimedBy,
    homeownerId: homeownerProfile._id,
    score,
    comment: comment || "",
  });

  const agg = await Rating.aggregate([
    { $match: { providerId: job.claimedBy } },
    { $group: { _id: "$providerId", avg: { $avg: "$score" } } },
  ]);
  const newAverage = agg[0]?.avg || score;
  await ProviderProfile.findByIdAndUpdate(job.claimedBy, { averageRating: newAverage });

  res.status(201).json({ rating, providerAverageRating: newAverage });
};