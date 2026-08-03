import { User }        from "../models/user.model.js";
import { Job }          from "../models/job.model.js";
import { Company }      from "../models/company.model.js";
import { Application }  from "../models/application.model.js";
import { Activity, logActivity } from "../models/activity.model.js";

// ─── helpers ────────────────────────────────────────────────────────────────
function formatUser(u, extra = {}) {
    const parts = (u.fullname || "").trim().split(" ");
    return {
        id:        u._id,
        _id:       u._id,
        first:     parts[0]  || "",
        last:      parts.slice(1).join(" ") || "",
        fullname:  u.fullname,
        email:     u.email,
        role:      u.role,
        suspended: !!u.suspended,
        skills:    u.profile?.skills || [],
        bio:       u.profile?.bio    || "",
        companyId: u.profile?.company || null,
        companyName: u.companyName || "",
        createdAt: u.createdAt,
        ...extra,
    };
}

// ─── GET /api/admin/overview ──────────────────────────────────────────────────
export const getOverview = async (req, res) => {
    try {
        const [seekers, employers, openJobs, closedJobs, totalApps, flaggedJobs, companiesCount] =
            await Promise.all([
                User.countDocuments({ role: "seeker" }),
                User.countDocuments({ role: "employer" }),
                Job.countDocuments({ status: "open" }),
                Job.countDocuments({ status: "closed" }),
                Application.countDocuments({}),
                Job.countDocuments({ flagged: true }),
                Company.countDocuments({}),
            ]);

        const recentUsers = await User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 }).limit(5);
        const recentJobs  = await Job.find().sort({ createdAt: -1 }).limit(5);

        return res.status(200).json({
            success: true,
            stats: { seekers, employers, openJobs, closedJobs, totalApps, flaggedJobs, companiesCount },
            recentUsers: recentUsers.map(u => formatUser(u)),
            recentJobs:  recentJobs.map(j => ({ id: j._id, title: j.title, status: j.status, flagged: j.flagged })),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── GET /api/admin/users?role=seeker|employer ────────────────────────────────
export const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const query = role ? { role } : { role: { $ne: "admin" } };
        const users = await User.find(query).sort({ createdAt: -1 });

        const formatted = await Promise.all(users.map(async (u) => {
            if (u.role === "seeker") {
                const appCount = await Application.countDocuments({ applicant: u._id });
                return formatUser(u, { appCount });
            }
            if (u.role === "employer") {
                const company = await Company.findOne({ userId: u._id });
                const jobCount = company ? await Job.countDocuments({ company: company._id }) : 0;
                return formatUser(u, {
                    company: company ? { id: company._id, name: company.name } : null,
                    jobCount,
                });
            }
            return formatUser(u);
        }));

        return res.status(200).json({ users: formatted, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── GET /api/admin/users/:id — single user detail ────────────────────────────
export const getUserDetail = async (req, res) => {
    try {
        const u = await User.findById(req.params.id);
        if (!u) return res.status(404).json({ message: "User not found.", success: false });
        const appCount = await Application.countDocuments({ applicant: u._id });
        return res.status(200).json({ user: formatUser(u, { appCount }), success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── PATCH /api/admin/users/:id/suspend ───────────────────────────────────────
export const suspendUser = async (req, res) => {
    try {
        const u = await User.findById(req.params.id);
        if (!u) return res.status(404).json({ message: "User not found.", success: false });
        if (u.role === "admin") return res.status(400).json({ message: "Cannot suspend an admin.", success: false });

        u.suspended = true;
        await u.save();
        logActivity("status", "⚠️", `Admin suspended user: ${u.fullname}`);
        return res.status(200).json({ message: "User suspended.", user: formatUser(u), success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── PATCH /api/admin/users/:id/unsuspend ─────────────────────────────────────
export const unsuspendUser = async (req, res) => {
    try {
        const u = await User.findById(req.params.id);
        if (!u) return res.status(404).json({ message: "User not found.", success: false });

        u.suspended = false;
        await u.save();
        logActivity("status", "✅", `Admin restored user: ${u.fullname}`);
        return res.status(200).json({ message: "User restored.", user: formatUser(u), success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── DELETE /api/admin/users/:id — cascade delete ─────────────────────────────
export const deleteUser = async (req, res) => {
    try {
        const u = await User.findById(req.params.id);
        if (!u) return res.status(404).json({ message: "User not found.", success: false });
        if (u.role === "admin") return res.status(400).json({ message: "Cannot delete an admin.", success: false });

        if (u.role === "employer") {
            const company = await Company.findOne({ userId: u._id });
            if (company) {
                const jobs = await Job.find({ company: company._id });
                const jobIds = jobs.map(j => j._id);
                await Application.deleteMany({ job: { $in: jobIds } });
                await Job.deleteMany({ company: company._id });
                await Company.deleteOne({ _id: company._id });
            }
        } else {
            await Application.deleteMany({ applicant: u._id });
        }

        await User.deleteOne({ _id: u._id });
        logActivity("delete", "🗑", `Admin removed user: ${u.fullname} (${u.email})`);
        return res.status(200).json({ message: "User removed.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── GET /api/admin/jobs ───────────────────────────────────────────────────────
export const getAllJobsAdmin = async (req, res) => {
    try {
        const jobs = await Job.find().populate("company").sort({ createdAt: -1 });
        const formatted = await Promise.all(jobs.map(async (j) => {
            const applicants = await Application.countDocuments({ job: j._id });
            return {
                id: j._id, title: j.title, category: j.category, status: j.status,
                flagged: j.flagged, flagReason: j.flagReason, applicants,
                postedAt: j.createdAt,
                company: j.company ? { id: j.company._id, name: j.company.name } : null,
            };
        }));
        return res.status(200).json({ jobs: formatted, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── PATCH /api/admin/jobs/:id/status — admin override, no ownership check ────
export const adminToggleJobStatus = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found.", success: false });

        job.status = job.status === "open" ? "closed" : "open";
        await job.save();
        logActivity("job", job.status === "open" ? "✅" : "🔒", `Admin ${job.status === "open" ? "reopened" : "closed"} job: "${job.title}"`);
        return res.status(200).json({ message: `Job ${job.status}.`, status: job.status, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── PATCH /api/admin/jobs/:id/flag ────────────────────────────────────────────
export const flagJob = async (req, res) => {
    try {
        const { reason } = req.body;
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found.", success: false });

        job.flagged = true;
        job.flagReason = reason || "Inappropriate content";
        await job.save();
        logActivity("flag", "🚩", `Admin flagged job: "${job.title}" — Reason: ${job.flagReason}`);
        return res.status(200).json({ message: "Job flagged.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── PATCH /api/admin/jobs/:id/unflag ──────────────────────────────────────────
export const unflagJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found.", success: false });

        job.flagged = false;
        job.flagReason = "";
        await job.save();
        logActivity("status", "✅", `Admin cleared flag on job: "${job.title}"`);
        return res.status(200).json({ message: "Flag cleared.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── DELETE /api/admin/jobs/:id — cascade delete applications ─────────────────
export const adminDeleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found.", success: false });

        await Application.deleteMany({ job: job._id });
        await Job.deleteOne({ _id: job._id });
        logActivity("delete", "🗑", `Admin removed job post: "${job.title}"`);
        return res.status(200).json({ message: "Job removed.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── GET /api/admin/companies ──────────────────────────────────────────────────
export const getAllCompaniesAdmin = async (req, res) => {
    try {
        const companies = await Company.find().sort({ createdAt: -1 });
        const formatted = await Promise.all(companies.map(async (co) => {
            const activeJobs = await Job.countDocuments({ company: co._id, status: "open" });
            return {
                id: co._id, name: co.name, industry: co.industry, location: co.location,
                initials: co.initials || co.name.slice(0, 2).toUpperCase(), color: co.color,
                logo: co.logo || "",
                activeJobs, employerId: co.userId,
            };
        }));
        return res.status(200).json({ companies: formatted, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── GET /api/admin/activity ───────────────────────────────────────────────────
export const getActivityLog = async (req, res) => {
    try {
        const log = await Activity.find().sort({ createdAt: -1 }).limit(100);
        return res.status(200).json({
            activity: log.map(a => ({ type: a.type, icon: a.icon, msg: a.message, time: a.createdAt })),
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── DELETE /api/admin/activity — clear log ────────────────────────────────────
export const clearActivityLog = async (req, res) => {
    try {
        await Activity.deleteMany({});
        return res.status(200).json({ message: "Activity log cleared.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
