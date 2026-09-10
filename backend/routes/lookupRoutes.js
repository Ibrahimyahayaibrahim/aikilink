import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import { getCategories } from "../controllers/lookupController.js";

export const categoryRouter = express.Router();

categoryRouter.get("/", asyncHandler(getCategories));