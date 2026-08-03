import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  postJob,
  getAllJobs,
  getJobById,
  getAdminJobs,
  updateJob,
  deleteJob,
  toggleJobStatus,
} from "../controllers/job.controller.js";

const router = express.Router();

router.post("/",            isAuthenticated, postJob);
router.get("/",              getAllJobs);
router.get("/admin",        isAuthenticated, getAdminJobs);
router.get("/:id",           getJobById);
router.put("/:id",          isAuthenticated, updateJob);
router.delete("/:id",       isAuthenticated, deleteJob);
router.patch("/:id/status", isAuthenticated, toggleJobStatus);

export default router;
