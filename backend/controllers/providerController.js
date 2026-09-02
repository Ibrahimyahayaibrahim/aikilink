import ProviderProfile from "../models/ProviderProfile.js";
import Rating from "../models/Rating.js";
import { isValidObjectId } from "../utils/validators.js";

// PUT /api/providers/me  (FR3, FR4)
// Updates categories, coverage areas, and bio for the logged-in provider. Categories and
// areas are validated as well-formed ObjectIds before being written — since they are
// matched against the fixed Category/Area lookup lists elsewhere, this endpoint does not
// need to (and deliberately does not) verify the referenced documents actually exist;
// that responsibility stays with a future admin-facing category/area management flow.
// GET /api/providers/me  — Provider only.
// Returns the logged-in provider's own full profile (including categories/areas
// populated), so the profile-edit screen can pre-fill existing selections instead of
// always rendering as a blank form.
export const getMyProviderProfile = async (req, res) => {
  const profile = await ProviderProfile.findOne({ userId: req.user.id }).populate("categories coverageAreas");
  if (!profile) return res.status(404).json({ message: "Provider profile not found" });
  res.json(profile);
};
export const updateMyProfile = async (req, res) => {
  const { categories, coverageAreas, bio } = req.body;

  if (categories !== undefined) {
    if (!Array.isArray(categories) || !categories.every(isValidObjectId)) {
      return res.status(400).json({ message: "categories must be an array of valid ids" });
    }
  }
  if (coverageAreas !== undefined) {
    if (!Array.isArray(coverageAreas) || !coverageAreas.every(isValidObjectId)) {
      return res.status(400).json({ message: "coverageAreas must be an array of valid ids" });
    }
  }
  if (bio !== undefined && (typeof bio !== "string" || bio.length > 1000)) {
    return res.status(400).json({ message: "bio must be a string under 1000 characters" });
  }

  const profile = await ProviderProfile.findOneAndUpdate(
    { userId: req.user.id },
    {
      $set: {
        ...(categories !== undefined && { categories }),
        ...(coverageAreas !== undefined && { coverageAreas }),
        ...(bio !== undefined && { bio }),
      },
    },
    { new: true, runValidators: true }
  ).populate("categories coverageAreas");

  if (!profile) return res.status(404).json({ message: "Provider profile not found" });
  res.json(profile);
};

// POST /api/providers/me/id-upload  (FR5)
// Accepts a reference/key to an already-uploaded file (self-serve, unverified — Table 3.2).
// A real file-upload pipeline (e.g. multer + virus scan + private cloud storage bucket)
// would sit in front of this endpoint; this controller only persists the resulting
// document reference and never accepts raw file bytes directly, keeping upload-handling
// attack surface (zip bombs, oversized files, executable payloads) out of this API.
export const uploadIdDocument = async (req, res) => {
  const { idDocumentUrl } = req.body;
  if (!idDocumentUrl || typeof idDocumentUrl !== "string" || idDocumentUrl.length > 500) {
    return res.status(400).json({ message: "idDocumentUrl is required and must be under 500 characters" });
  }

  const profile = await ProviderProfile.findOneAndUpdate(
    { userId: req.user.id },
    { $set: { idDocumentUrl } },
    { new: true }
  );
  if (!profile) return res.status(404).json({ message: "Provider profile not found" });
  res.json(profile);
};

// GET /api/providers/:id
// Public profile: category, coverage areas, bio, and average rating only — contact
// details are intentionally never exposed here (they are revealed solely through
// POST /api/jobs/:id/interest, scoped to a specific job a provider has responded to).
export const getProviderPublicProfile = async (req, res) => {
  const profile = await ProviderProfile.findById(req.params.id)
    .populate("categories coverageAreas")
    .populate({ path: "userId", select: "name" });

  if (!profile) return res.status(404).json({ message: "Provider not found" });

  res.json({
    id: profile._id,
    name: profile.userId?.name,
    categories: profile.categories,
    coverageAreas: profile.coverageAreas,
    bio: profile.bio,
    averageRating: profile.averageRating,
  });
};

// GET /api/providers/:id/ratings  (FR17, part of view-own-ratings use case)
export const getProviderRatings = async (req, res) => {
  const ratings = await Rating.find({ providerId: req.params.id }).sort({ created_at: -1 });
  res.json(ratings);
};
