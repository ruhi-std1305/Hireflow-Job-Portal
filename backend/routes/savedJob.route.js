import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  saveJob,
  unsaveJob,
  getMySavedJobs,
} from "../controllers/savedJob.controller.js";

const router = express.Router();

router.get("/",          isAuthenticated, getMySavedJobs);
router.post("/:jobId",   isAuthenticated, saveJob);
router.delete("/:jobId", isAuthenticated, unsaveJob);

export default router;