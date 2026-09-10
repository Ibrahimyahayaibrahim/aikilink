// Implements the matching rule from Chapter 3, Section 3.13, as a pure function.
// The live query in jobController.getMyMatches expresses the same rule using Mongo's
// query engine directly in the database for efficiency; this function exists so the
// rule itself can be unit-tested independently of any database connection, and so it
// can be reused anywhere else the rule needs to be evaluated in application code
// (e.g. a future notification worker or in-memory filter).
//
// job:      { categoryId: string | ObjectId | { _id }, state: string, lga: string, status?: string }
// provider: { categories: (string | ObjectId)[], state: string, lga: string }
export function isMatch(job, provider) {
  if (!job || !provider) return false;
  if (job.status && job.status !== "Open") return false;

  // 1. Resolve category ID whether populated object or raw ObjectId/string
  const jobCatId = (job.categoryId?._id || job.categoryId)?.toString();
  const categoryMatches = (provider.categories || []).some(
    (cat) => (cat?._id || cat)?.toString() === jobCatId
  );

  if (!categoryMatches) return false;

  // 2. Normalize and compare State (case-insensitive, trimmed)
  const stateMatches =
    Boolean(job.state && provider.state) &&
    job.state.trim().toLowerCase() === provider.state.trim().toLowerCase();

  if (!stateMatches) return false;

  // 3. Normalize and compare LGA (case-insensitive, trimmed)
  const lgaMatches =
    Boolean(job.lga && provider.lga) &&
    job.lga.trim().toLowerCase() === provider.lga.trim().toLowerCase();

  return lgaMatches;
}