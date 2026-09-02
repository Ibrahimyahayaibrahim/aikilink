import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import { getCategories, getAreas } from "../controllers/lookupController.js";

export const categoryRouter = express.Router();
export const areaRouter = express.Router();

categoryRouter.get("/", asyncHandler(getCategories));
areaRouter.get("/", asyncHandler(getAreas));
