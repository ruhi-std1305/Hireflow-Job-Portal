import express from "express";
import { 
    login, 
    register, 
    logout, 
    updateprofile,
    getMe,
    uploadResume,
    downloadResume
} from "../controllers/user.controller.js";

import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { uploadResumeMiddleware } from "../middlewares/uploadResume.js";

const router = express.Router();


router.route("/register").post(register);


router.route("/login").post(login);

router.route("/logout").post(logout);

router.route("/me").get(isAuthenticated, getMe);

router.route("/profile/update").post(isAuthenticated, updateprofile);

router.route("/resume/upload").post(isAuthenticated, (req, res, next) => {
    uploadResumeMiddleware.single("resume")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || "Upload failed.", success: false });
        }
        next();
    });
}, uploadResume);
router.route("/resume/:userId").get(isAuthenticated, downloadResume);

export default router;