import ProviderProfile from "../models/ProviderProfile.js";
import Rating from "../models/Rating.js";
import { isValidObjectId } from "../utils/validators.js";

const MAX_LOCATION_LENGTH = 100;

function isValidLocationString(value) {
  return (
    typeof value === "string" &&
    value.trim().length >= 2 &&
    value.trim().length <= MAX_LOCATION_LENGTH
  );
}

// GET /api/providers/me  — Provider only.
// Returns the logged-in provider's own full profile (categories populated), so the
// profile-edit screen can pre-fill existing selections — including the saved
// state/lga strings — instead of always rendering as a blank form.
// NOTE: populates ONLY "categories". The old "coverageAreas" path no longer exists
// on the schema; populating it would throw under Mongoose strictPopulate and 500
// this endpoint, which is exactly the blank-form bug this migration hit.
export const getMyProviderProfile = async (req, res) => {
  const profile = await ProviderProfile.findOne({ userId: req.user.id }).populate("categories");
  if (!profile) return res.status(404).json({ message: "Provider profile not found" });
  res.json(profile);
};

// PUT /api/providers/me  (FR3, FR4)
// Updates categories, service location (state + lga), and bio for the logged-in
// provider. Categories are validated as well-formed ObjectIds; location is validated
// as a state + lga string pair (both must be sent together).
export const updateMyProfile = async (req, res) => {
  const { categories, state, lga, bio } = req.body;

  if (categories !== undefined) {
    if (!Array.isArray(categories) || !categories.every(isValidObjectId)) {
      return res.status(400).json({ message: "categories must be an array of valid ids" });
    }
  }

  // Location must be written as a pair. A half-set location would silently exclude
  // the provider from every job match (Section 3.13 requires state AND lga equality),
  // which is far harder for the provider to notice than a clear 400 here.
  const hasState = state !== undefined;
  const hasLga = lga !== undefined;
  if (hasState !== hasLga) {
    return res.status(400).json({ message: "state and lga must be provided together" });
  }
  if (hasState && (!isValidLocationString(state) || !isValidLocationString(lga))) {
    return res.status(400).json({ message: "state and lga must be strings between 2 and 100 characters" });
  }

  if (bio !== undefined && (typeof bio !== "string" || bio.length > 1000)) {
    return res.status(400).json({ message: "bio must be a string under 1000 characters" });
  }

  const profile = await ProviderProfile.findOneAndUpdate(
    { userId: req.user.id },
    {
      $set: {
        ...(categories !== undefined && { categories }),
        ...(hasState && { state: state.trim(), lga: lga.trim() }),
        ...(bio !== undefined && { bio }),
      },
    },
    { new: true, runValidators: true }
  ).populate("categories");

  if (!profile) return res.status(404).json({ message: "Provider profile not found" });
  res.json(profile);
};

// POST /api/providers/me/id-upload  (FR5)
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
// Public profile: categories, service location (state/lga), bio, and average rating
// only — contact details are intentionally never exposed here.
export const getProviderPublicProfile = async (req, res) => {
  const profile = await ProviderProfile.findById(req.params.id)
    .populate("categories")
    .populate({ path: "userId", select: "name" });

  if (!profile) return res.status(404).json({ message: "Provider not found" });

  res.json({
    id: profile._id,
    name: profile.userId?.name,
    categories: profile.categories,
    state: profile.state,
    lga: profile.lga,
    bio: profile.bio,
    averageRating: profile.averageRating,
  });
};

// GET /api/providers/:id/ratings  (FR17)
export const getProviderRatings = async (req, res) => {
  const ratings = await Rating.find({ providerId: req.params.id }).sort({ created_at: -1 });
  res.json(ratings);
};