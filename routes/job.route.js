import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
    postJob,
    getAllJobs,
    getJobById,
    getAdminJobs
} from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);

router.route("/get").get(getAllJobs);
router.route("/").get(getAllJobs);

router.route("/get/:id").get(getJobById);
router.route("/:id").get(getJobById);

export default router;