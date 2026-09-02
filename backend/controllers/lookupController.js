import Category from "../models/Category.js";
import Area from "../models/Area.js";

// GET /api/categories  (FR21)
export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
};

// GET /api/areas  (FR21)
export const getAreas = async (req, res) => {
  const areas = await Area.find().sort({ city: 1, name: 1 });
  res.json(areas);
};
