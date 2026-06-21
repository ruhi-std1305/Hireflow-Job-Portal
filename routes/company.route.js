import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  getAllCompanies,
  getCompanyById,
  registerCompany,
} from "../controllers/company.controller.js";

const router = express.Router();

// GET  /api/companies?search=keyword
router.get("/", getAllCompanies);

// GET  /api/companies/:id   (company detail + open jobs)
router.get("/:id", getCompanyById);

// POST /api/companies       (employer/admin only)
router.post("/", isAuthenticated, registerCompany);

export default router;