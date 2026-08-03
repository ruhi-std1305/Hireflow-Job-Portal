import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
    getAllCompanies,
    getCompanyById,
    getJobsByCompany,
    registerCompany,
    updateCompany,
    getMyCompany,
} from "../controllers/company.controller.js";

const router = express.Router();

router.get("/",          getAllCompanies);                    // সব company list
router.get("/mine",      isAuthenticated, getMyCompany);     // employer নিজের company
router.get("/:id/jobs",  getJobsByCompany);                  // company র jobs
router.get("/:id",       getCompanyById);                    // single company
router.post("/",         isAuthenticated, registerCompany);  // company তৈরি
router.put("/:id",       isAuthenticated, updateCompany);    // company update

export default router;
