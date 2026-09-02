// Implements the matching rule from Chapter 3, Section 3.13, as a pure function.
// The live query in jobController.getMyMatches expresses the same rule using Mongo's
// $in operator directly in the database for efficiency; this function exists so the
// rule itself can be unit-tested independently of any database connection, and so it
// can be reused anywhere else the rule needs to be evaluated in application code
// (e.g. a future notification worker).
//
// job:      { categoryId: string, areaId: string }
// provider: { categories: string[], coverageAreas: string[] }
export function isMatch(job, provider) {
  const categories = (provider.categories || []).map(String);
  const areas = (provider.coverageAreas || []).map(String);
  return categories.includes(String(job.categoryId)) && areas.includes(String(job.areaId));
}
