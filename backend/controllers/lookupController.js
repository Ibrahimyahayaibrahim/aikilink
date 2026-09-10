import Category from "../models/Category.js";

// GET /api/categories (FR21)
export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
};