import { Job }         from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { logActivity } from "../models/activity.model.js";

// helper — job কে frontend format এ convert করা
function formatJob(job, applicants = 0) {
    const co = job.company;
    return {
        id:              job._id,
        _id:             job._id,
        title:           job.title,
        description:     job.description,
        requirements:    job.requirements  || [],
        salary:          job.salary        || "",
        location:        job.location,
        type:            job.jobType,       // frontend "type" use করে
        jobType:         job.jobType,
        category:        job.category      || "Technology",
        experienceLevel: job.experienceLevel ?? 0,
        skills:          job.skills        || [],
        deadline:        job.deadline      || "",
        status:          job.status        || "open",
        applicants,
        postedAt:        job.createdAt,
        featured:        false,
        company: co ? {
            id:          co._id,
            name:        co.name,
            industry:    co.industry    || "",
            location:    co.location    || "",
            website:     co.website     || "",
            description: co.description || "",
            logo:        co.logo        || "",
            initials:    co.initials    || co.name.slice(0, 2).toUpperCase(),
            color:       co.color       || "#1A5CFF",
        } : null,
    };
}

// ─── POST /api/jobs ───────────────────────────────────────────────────────────
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType,
                experienceLevel, position, skills, deadline, category, companyId } = req.body;

        if (!title || !description || !location || !jobType) {
            return res.status(400).json({ message: "Title, description, location and job type are required.", success: false });
        }

        // requirements: array বা newline/comma string
        const reqArray = Array.isArray(requirements)
            ? requirements.filter(Boolean)
            : (requirements || "").split(/[\n,]/).map(r => r.trim()).filter(Boolean);

        // skills: array বা comma string
        const skillsArray = Array.isArray(skills)
            ? skills.filter(Boolean)
            : (skills || "").split(",").map(s => s.trim()).filter(Boolean);

        const job = await Job.create({
            title,
            description,
            requirements:    reqArray,
            salary:          salary          || "",
            location,
            jobType,
            category:        category        || "Technology",
            experienceLevel: Number(experienceLevel) || 0,
            position:        Number(position)        || 1,
            skills:          skillsArray,
            deadline:        deadline        || "",
            status:          "open",
            company:         companyId       || undefined,
            created_by:      req.id,
        });

        logActivity("job", "💼", `New job posted: "${job.title}"`);

        return res.status(201).json({
            message: "New job created successfully.",
            job:     formatJob(job),
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── GET /api/jobs?keyword=&category=&location=&jobType= ──────────────────────
export const getAllJobs = async (req, res) => {
    try {
        const { keyword = "", category = "", location = "", jobType = "", type = "" } = req.query;

        const query = { status: "open" };

        if (keyword) {
            query.$or = [
                { title:       { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { location:    { $regex: keyword, $options: "i" } },
            ];
        }
        if (category)        query.category = category;
        if (location)        query.location = location;
        if (jobType || type) query.jobType  = jobType || type;

        const jobs = await Job.find(query).populate("company").sort({ createdAt: -1 });

        return res.status(200).json({
            jobs:    jobs.map(j => formatJob(j)),
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── GET /api/jobs/admin — employer নিজের jobs ────────────────────────────────
export const getAdminJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ created_by: req.id }).populate("company").sort({ createdAt: -1 });

        const formatted = await Promise.all(jobs.map(async (job) => {
            const applicants = await Application.countDocuments({ job: job._id });
            return formatJob(job, applicants);
        }));

        return res.status(200).json({ jobs: formatted, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── GET /api/jobs/:id ────────────────────────────────────────────────────────
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate("company");
        if (!job) return res.status(404).json({ message: "Job not found.", success: false });

        const applicants = await Application.countDocuments({ job: job._id });
        return res.status(200).json({ job: formatJob(job, applicants), success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── PUT /api/jobs/:id — job edit (শুধু owner employer) ───────────────────────
export const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found.", success: false });

        if (job.created_by.toString() !== req.id) {
            return res.status(403).json({ message: "Unauthorized. This is not your job.", success: false });
        }

        const { title, description, requirements, salary, location, jobType,
                experienceLevel, position, skills, deadline, category } = req.body;

        if (title           !== undefined) job.title           = title;
        if (description     !== undefined) job.description     = description;
        if (salary          !== undefined) job.salary          = salary;
        if (location        !== undefined) job.location        = location;
        if (jobType         !== undefined) job.jobType         = jobType;
        if (category        !== undefined) job.category        = category;
        if (deadline        !== undefined) job.deadline        = deadline;
        if (experienceLevel !== undefined) job.experienceLevel = Number(experienceLevel) || 0;
        if (position        !== undefined) job.position        = Number(position) || 1;

        if (requirements !== undefined) {
            job.requirements = Array.isArray(requirements)
                ? requirements.filter(Boolean)
                : (requirements || "").split(/[\n,]/).map(r => r.trim()).filter(Boolean);
        }
        if (skills !== undefined) {
            job.skills = Array.isArray(skills)
                ? skills.filter(Boolean)
                : (skills || "").split(",").map(s => s.trim()).filter(Boolean);
        }

        await job.save();
        await job.populate("company");
        const applicants = await Application.countDocuments({ job: job._id });

        return res.status(200).json({
            message: "Job updated successfully.",
            job:     formatJob(job, applicants),
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── DELETE /api/jobs/:id — job delete + সাথে related applications cascade delete ──
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found.", success: false });

        if (job.created_by.toString() !== req.id) {
            return res.status(403).json({ message: "Unauthorized. This is not your job.", success: false });
        }

        await Application.deleteMany({ job: job._id });
        await Job.findByIdAndDelete(job._id);

        return res.status(200).json({ message: "Job deleted successfully.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── PATCH /api/jobs/:id/status — open ⇄ closed টগল (শুধু owner employer) ─────
export const toggleJobStatus = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found.", success: false });

        if (job.created_by.toString() !== req.id) {
            return res.status(403).json({ message: "Unauthorized. This is not your job.", success: false });
        }

        job.status = job.status === "open" ? "closed" : "open";
        await job.save();
        await job.populate("company");
        const applicants = await Application.countDocuments({ job: job._id });

        return res.status(200).json({
            message: `Job ${job.status === "open" ? "reopened" : "closed"} successfully.`,
            job:     formatJob(job, applicants),
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
