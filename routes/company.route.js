import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  getAllCompanies,
  getCompanyById,
  registerCompany,
} from "../controllers/company.controller.js";

const router = express.Router();


router.get("/", getAllCompanies);


router.get("/:id", getCompanyById);


router.post("/", isAuthenticated, registerCompany);

export default router;
