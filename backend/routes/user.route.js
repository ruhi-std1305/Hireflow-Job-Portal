import express from "express";
import { 
    login, 
    register, 
    logout, 
    updateprofile 
} from "../controllers/user.controller.js";

import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();


router.route("/register").post(register);


router.route("/login").post(login);

router.route("/logout").post(logout);

router.route("/profile/update").post(isAuthenticated, updateprofile);

export default router;