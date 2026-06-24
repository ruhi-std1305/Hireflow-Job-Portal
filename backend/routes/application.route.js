import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  applyToJob,
  getMyApplications,
  getApplicantsByJob,
  updateApplicationStatus,
} from "../controllers/application.controller.js";

const router = express.Router();

// Job Seeker
router.post("/apply/:jobId",            isAuthenticated, applyToJob);
router.get("/me",                       isAuthenticated, getMyApplications);

// Employer
router.get("/job/:jobId",               isAuthenticated, getApplicantsByJob);
router.patch("/:applicationId/status",  isAuthenticated, updateApplicationStatus);

export default router;
