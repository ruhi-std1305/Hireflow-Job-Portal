import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  postJob,
  getAllJobs,
  getJobById,
  getAdminJobs,
} from "../controllers/job.controller.js";

const router = express.Router();

router.post("/",       isAuthenticated, postJob);
router.get("/",        getAllJobs);
router.get("/admin",   isAuthenticated, getAdminJobs);  // /:id এর আগে রাখা জরুরি
router.get("/:id",     getJobById);

export default router;
