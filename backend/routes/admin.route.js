import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
    getOverview,
    getUsers,
    getUserDetail,
    suspendUser,
    unsuspendUser,
    deleteUser,
    getAllJobsAdmin,
    adminToggleJobStatus,
    flagJob,
    unflagJob,
    adminDeleteJob,
    getAllCompaniesAdmin,
    getActivityLog,
    clearActivityLog,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(isAuthenticated, isAdmin);

router.get("/overview",              getOverview);

router.get("/users",                 getUsers);
router.get("/users/:id",             getUserDetail);
router.patch("/users/:id/suspend",   suspendUser);
router.patch("/users/:id/unsuspend", unsuspendUser);
router.delete("/users/:id",          deleteUser);

router.get("/jobs",                  getAllJobsAdmin);
router.patch("/jobs/:id/status",     adminToggleJobStatus);
router.patch("/jobs/:id/flag",       flagJob);
router.patch("/jobs/:id/unflag",     unflagJob);
router.delete("/jobs/:id",           adminDeleteJob);

router.get("/companies",             getAllCompaniesAdmin);

router.get("/activity",              getActivityLog);
router.delete("/activity",           clearActivityLog);

export default router;
