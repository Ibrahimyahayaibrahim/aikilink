import { isMatch } from "../utils/matching.js";

describe("Matching rule (Section 3.13): job.category IN provider.categories AND job.area IN provider.coverageAreas", () => {
  const provider = {
    categories: ["cat-electrician", "cat-generator"],
    coverageAreas: ["area-bodija", "area-mokola"],
  };

  test("matches when both category and area overlap", () => {
    const job = { categoryId: "cat-electrician", areaId: "area-bodija" };
    expect(isMatch(job, provider)).toBe(true);
  });

  test("does not match when category is right but area is not covered", () => {
    const job = { categoryId: "cat-electrician", areaId: "area-agodi" };
    expect(isMatch(job, provider)).toBe(false);
  });

  test("does not match when area is right but category is not offered", () => {
    const job = { categoryId: "cat-plumber", areaId: "area-bodija" };
    expect(isMatch(job, provider)).toBe(false);
  });

  test("does not match when neither category nor area overlap", () => {
    const job = { categoryId: "cat-plumber", areaId: "area-agodi" };
    expect(isMatch(job, provider)).toBe(false);
  });

  test("a provider with no categories/areas never matches", () => {
    const emptyProvider = { categories: [], coverageAreas: [] };
    const job = { categoryId: "cat-electrician", areaId: "area-bodija" };
    expect(isMatch(job, emptyProvider)).toBe(false);
  });
});
