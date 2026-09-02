import JobPosting from "../models/JobPosting.js";
import JobInterestLog from "../models/JobInterestLog.js";
import ProviderProfile from "../models/ProviderProfile.js";
import HomeownerProfile from "../models/HomeownerProfile.js";
import Rating from "../models/Rating.js";
import { isValidObjectId, isValidScore } from "../utils/validators.js";

/*
 * Note on "push" vs "pull" (Section 3.13):
 * This MVP has no websocket/SMS/push infrastructure (Section 3.6 — in-app only).
 * "Push" is realised as a dedicated endpoint (GET /api/jobs/matches) that returns Open
 * jobs matching the logged-in provider's own categories/coverageAreas automatically,
 * with no filters required from the provider. "Pull" (GET /api/jobs) is the same
 * underlying query but driven by filters the provider supplies explicitly. Both read
 * from the same JobPosting collection — there is no separate notification store.
 */

const MAX_PAGE_SIZE = 100; // simple safety net against unbounded result-set responses

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
export const createJob = async (req, res) => {
  const { categoryId, areaId, description, urgency } = req.body;
  if (!categoryId || !areaId || !description) {
    return res.status(400).json({ message: "categoryId, areaId, and description are required" });
  }
  if (!isValidObjectId(categoryId) || !isValidObjectId(areaId)) {
    return res.status(400).json({ message: "categoryId and areaId must be valid ids" });
  }
  if (typeof description !== "string" || description.trim().length < 5 || description.length > 2000) {
    return res.status(400).json({ message: "description must be between 5 and 2000 characters" });
  }

  const homeownerProfile = await getHomeownerProfileOrFail(req.user.id);

  const job = await JobPosting.create({
    homeownerId: homeownerProfile._id,
    categoryId,
    areaId,
    description: description.trim(),
    urgency: !!urgency,
    status: "Open",
  });

  // Matching rule (Section 3.13): job.category IN provider.categories AND job.area IN provider.coverageAreas
  const matchingProviderCount = await ProviderProfile.countDocuments({
    categories: categoryId,
    coverageAreas: areaId,
  });

  res.status(201).json({ job, matchingProviderCount });
};

// GET /api/jobs  (FR8 — pull) — Provider only. Filters: category, area (Open jobs only)
export const searchJobs = async (req, res) => {
  const { category, area } = req.query;
  const filter = { status: "Open" };

  if (category !== undefined) {
    if (!isValidObjectId(category)) return res.status(400).json({ message: "Invalid category filter" });
    filter.categoryId = category;
  }
  if (area !== undefined) {
    if (!isValidObjectId(area)) return res.status(400).json({ message: "Invalid area filter" });
    filter.areaId = area;
  }

  const jobs = await JobPosting.find(filter)
    .populate("categoryId areaId")
    .sort({ created_at: -1 })
    .limit(MAX_PAGE_SIZE);
  res.json(jobs);
};

// GET /api/jobs/matches  (FR7 — push) — Provider only. Auto-filtered by the provider's own profile.
export const getMyMatches = async (req, res) => {
  const providerProfile = await getProviderProfileOrFail(req.user.id);

  const jobs = await JobPosting.find({
    status: "Open",
    categoryId: { $in: providerProfile.categories },
    areaId: { $in: providerProfile.coverageAreas },
  })
    .populate("categoryId areaId")
    .sort({ created_at: -1 })
    .limit(MAX_PAGE_SIZE);

  res.json(jobs);
};

// GET /api/jobs/mine — Homeowner only
export const getMyJobs = async (req, res) => {
  const homeownerProfile = await getHomeownerProfileOrFail(req.user.id);
  const jobs = await JobPosting.find({ homeownerId: homeownerProfile._id })
    .populate("categoryId areaId claimedBy")
    .sort({ created_at: -1 })
    .limit(MAX_PAGE_SIZE);
  res.json(jobs);
};
// GET /api/jobs/assigned — Provider only.
// Lets a provider see their own current work (status Claimed) and past work (status
// Completed) in one place.
export const getMyAssignedJobs = async (req, res) => {
  const providerProfile = await getProviderProfileOrFail(req.user.id);
  const jobs = await JobPosting.find({ claimedBy: providerProfile._id })
    .populate("categoryId areaId")
    .populate({ path: "homeownerId", populate: { path: "userId", select: "name" } })
    .sort({ claimedAt: -1 })
    .limit(MAX_PAGE_SIZE);
  res.json(jobs);
};
// GET /api/jobs/:id  (id format already validated by validateObjectIdParam in the route)
export const getJobById = async (req, res) => {
  const job = await JobPosting.findById(req.params.id).populate("categoryId areaId claimedBy");
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
};

// POST /api/jobs/:id/interest  (FR9) — Provider only
// Logs interest and reveals the homeowner's phone number, which is how the FCFS phone
// call (outside the system, Section 3.15.2) actually gets initiated. Contact details are
// scoped to exactly this job/provider pair, rather than being exposed more broadly.
export const expressInterest = async (req, res) => {
  const job = await JobPosting.findById(req.params.id);
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
    select: "name phone",
  });

  res.json({
    message: "Interest recorded",
    contact: {
      name: homeownerProfile.userId.name,
      phone: homeownerProfile.userId.phone,
    },
  });
};

// GET /api/jobs/:id/interested  — Homeowner only, must own the job.
// Not in the original Table 3.14 spec — added because the frontend claim flow needs a
// way to show the homeowner *who* has expressed interest (name, phone, providerId) so
// they can match a caller's voice to a system record and claim the right provider. This
// is a pull the homeowner triggers themselves (opening their job's detail screen), not a
// push notification, so it doesn't contradict the "phone call is the notification"
// design decision (Table 3.2) — it just makes the FCFS claim step actually usable.
export const getInterestedProviders = async (req, res) => {
  const job = await JobPosting.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const homeownerProfile = await getHomeownerProfileOrFail(req.user.id);
  if (String(job.homeownerId) !== String(homeownerProfile._id)) {
    return res.status(403).json({ message: "You do not own this job" });
  }

  const interests = await JobInterestLog.find({ jobId: job._id })
    .sort({ timestamp: 1 }) // earliest interest first, matching the FCFS spirit
    .populate({
      path: "providerId",
      select: "averageRating userId",
      populate: { path: "userId", select: "name phone" },
    });

  const providers = interests
    .filter((i) => i.providerId) // guard against a deleted provider profile
    .map((i) => ({
      providerId: i.providerId._id,
      name: i.providerId.userId?.name,
      phone: i.providerId.userId?.phone,
      averageRating: i.providerId.averageRating,
      expressedInterestAt: i.timestamp,
    }));

  res.json(providers);
};

// PATCH /api/jobs/:id/claim  (FR10, FR11) — Homeowner only, must own the job
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

  // Enforces the use case precondition (Table 3.4): the selected provider must actually
  // have expressed interest first, rather than a homeowner being able to claim a job for
  // an arbitrary provider id that never engaged with it.
  const hasExpressedInterest = await JobInterestLog.exists({ jobId: job._id, providerId });
  if (!hasExpressedInterest) {
    return res.status(409).json({ message: "This provider has not expressed interest in this job" });
  }

  job.status = "Claimed";
  job.claimedBy = providerId;
  job.claimedAt = new Date();
  await job.save();

  // FR11: other interested providers are implicitly "notified" the next time they poll
  // GET /api/jobs/matches or GET /api/jobs, since the job no longer appears there.
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

  // Recompute the provider's average rating (FR17)
  const agg = await Rating.aggregate([
    { $match: { providerId: job.claimedBy } },
    { $group: { _id: "$providerId", avg: { $avg: "$score" } } },
  ]);
  const newAverage = agg[0]?.avg || score;
  await ProviderProfile.findByIdAndUpdate(job.claimedBy, { averageRating: newAverage });

  res.status(201).json({ rating, providerAverageRating: newAverage });
};