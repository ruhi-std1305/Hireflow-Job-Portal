import { User }    from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import bcrypt      from "bcryptjs";
import jwt         from "jsonwebtoken";
import fs           from "fs";
import path          from "path";
import { logActivity } from "../models/activity.model.js";
import { UPLOAD_DIR } from "../middlewares/uploadResume.js";

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
    try {
        const { first, last, email, password, role, company } = req.body;

        if (!first || !email || !password || !role) {
            return res.status(400).json({ message: "Something is missing", success: false });
        }

        const fullname = `${first} ${last || ""}`.trim();

        if (await User.findOne({ email })) {
            return res.status(400).json({ message: "User already exists with this email.", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullname,
            email,
            password:    hashedPassword,
            role,
            companyName: company || ""
        });

        // ── Employer হলে Company document auto-create ──────────────────────────
        if (role === "employer" && company) {
            const initials = company.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            const existing = await Company.findOne({ name: company });
            if (!existing) {
                const newCompany = await Company.create({
                    name:     company,
                    initials,
                    color:    "#1A5CFF",
                    userId:   user._id,
                });
                // user profile এ company ref save করা
                user.profile = { ...user.profile, company: newCompany._id };
                await user.save();
            }
        }

        logActivity("user", "🆕", `New ${role} registered: ${fullname} (${email})`);

        return res.status(201).json({ message: "Account created successfully.", success: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: "Something is missing", success: false });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Incorrect email or password.", success: false });
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ message: "Incorrect email or password.", success: false });
        }

        if (role !== user.role) {
            return res.status(400).json({ message: "Account doesn't exist with current role.", success: false });
        }

        if (user.suspended) {
            return res.status(403).json({ message: "Your account has been suspended by an admin.", success: false });
        }

        // ── Employer: company খুঁজে বের করা বা তৈরি করা ─────────────────────
        let companyId   = null;
        let companyName = user.companyName || "";
        let companyLogo = "";

        if (role === "employer") {
            let co = await Company.findOne({ userId: user._id });

            if (!co && user.companyName) {
                // পুরানো user যে register এর সময় company তৈরি হয়নি — এখন তৈরি করো
                const initials = user.companyName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                co = await Company.create({
                    name:     user.companyName,
                    initials,
                    color:    "#1A5CFF",
                    userId:   user._id,
                });
            }

            if (co) {
                companyId   = co._id;
                companyName = co.name;
                companyLogo = co.logo || "";
            }
        }

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });

        logActivity("user", "🔑", `User logged in: ${user.fullname} (${user.role})`);

        return res
            .status(200)
            .cookie("token", token, { maxAge: 86400000, httpOnly: true, sameSite: "strict" })
            .json({
                message:     `Welcome back ${user.fullname}`,
                token,
                role:        user.role,
                name:        user.fullname,
                companyName,
                companyLogo,    // ← employer dashboard এ logo দেখানোর জন্য
                companyId,      // ← frontend এ localStorage এ save করবে
                success:     true,
            });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 })
            .json({ message: "Logged out successfully", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── helper — user কে frontend format এ convert ────────────────────────────────
function formatUserProfile(user) {
    return {
        id:        user._id,
        fullname:  user.fullname,
        email:     user.email,
        role:      user.role,
        companyName: user.companyName || "",
        title:     user.profile?.title    || "",
        location:  user.profile?.location || "",
        bio:       user.profile?.bio      || "",
        skills:    user.profile?.skills   || [],
        resume:    user.profile?.resume   || "",
        resumeOriginalName: user.profile?.resumeOriginalName || "",
    };
}

// ─── GET /api/auth/me — লগইন করা ইউজারের নিজের profile ─────────────────────────
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.id);
        if (!user) return res.status(404).json({ message: "User not found", success: false });
        res.set("Cache-Control", "no-store");
        return res.status(200).json({ user: formatUserProfile(user), success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
export const updateprofile = async (req, res) => {
    try {
        const { fullname, email, bio, skills, title, location } = req.body;
        const user = await User.findById(req.id);
        if (!user) return res.status(400).json({ message: "User not found", success: false });

        if (fullname) user.fullname = fullname;
        if (email)    user.email    = email;
        if (!user.profile) user.profile = {};
        // পুরনো profile থেকে shuru kore নতুন object বানানো হচ্ছে —
        // এভাবে nested field mutation Mongoose সবসময় ঠিকভাবে ধরতে পারে
        const current = user.profile ? (user.profile.toObject ? user.profile.toObject() : user.profile) : {};
        const updatedProfile = { ...current };

        if (bio      !== undefined) updatedProfile.bio      = bio;
        if (title    !== undefined) updatedProfile.title    = title;
        if (location !== undefined) updatedProfile.location = location;
        if (skills   !== undefined) {
            updatedProfile.skills = Array.isArray(skills)
                ? skills
                : skills.split(",").map(s => s.trim()).filter(Boolean);
        }

        user.profile = updatedProfile;
        user.markModified("profile");

        await user.save();
        return res.status(200).json({
            message: "Profile updated successfully",
            user: formatUserProfile(user),
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── POST /api/auth/resume/upload — multer দিয়ে disk-এ resume save ───────────
export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded.", success: false });
        }

        const user = await User.findById(req.id);
        if (!user) return res.status(404).json({ message: "User not found", success: false });

        // পুরনো resume file থাকলে disk থেকে মুছে ফেলা — orphan file জমা না হয়
        const oldFilename = user.profile?.resume;
        if (oldFilename) {
            const oldPath = path.join(UPLOAD_DIR, oldFilename);
            fs.unlink(oldPath, () => {}); // fire-and-forget, error হলেও চলবে
        }

        const updatedProfile = { ...(user.profile ? (user.profile.toObject ? user.profile.toObject() : user.profile) : {}) };
        updatedProfile.resume             = req.file.filename;        // শুধু filename — disk path না
        updatedProfile.resumeOriginalName = req.file.originalname;
        user.profile = updatedProfile;
        user.markModified("profile");
        await user.save();

        return res.status(200).json({
            message: "Resume uploaded successfully",
            resume:             req.file.filename,
            resumeOriginalName: req.file.originalname,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || "Server error", success: false });
    }
};

// ─── GET /api/auth/resume/:userId — resume file download (auth লাগবে) ─────────
export const downloadResume = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user || !user.profile?.resume) {
            return res.status(404).json({ message: "Resume not found.", success: false });
        }

        const filePath = path.join(UPLOAD_DIR, user.profile.resume);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Resume file missing on server.", success: false });
        }

        const downloadName = user.profile.resumeOriginalName || "resume.pdf";
        return res.download(filePath, downloadName);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};