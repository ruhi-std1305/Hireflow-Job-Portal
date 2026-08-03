import { Company } from "../models/company.model.js";
import { Job }     from "../models/job.model.js";

// helper — company কে frontend format এ convert
function formatCompany(co, openJobsCount = 0) {
    return {
        id:          co._id,
        _id:         co._id,
        name:        co.name,
        industry:    co.industry    || "",
        location:    co.location    || "",
        website:     co.website     || "",
        description: co.description || "",
        logo:        co.logo        || "",
        initials:    co.initials    || co.name.slice(0, 2).toUpperCase(),
        color:       co.color       || "#1A5CFF",
        openJobsCount,
    };
}

// ─── POST /api/companies — employer company তৈরি ──────────────────────────────
export const registerCompany = async (req, res) => {
    try {
        const { companyName, description, website, location, industry, logo } = req.body;
        if (!companyName) {
            return res.status(400).json({ message: "Company name is required.", success: false });
        }

        let company = await Company.findOne({ name: companyName });
        if (company) {
            // নিজের company হলে return করো
            if (company.userId.toString() === req.id) {
                return res.status(200).json({ message: "Company already exists.", company: formatCompany(company), success: true });
            }
            return res.status(400).json({ message: "Company name already taken.", success: false });
        }

        const initials = companyName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

        company = await Company.create({
            name:        companyName,
            description: description || "",
            website:     website     || "",
            location:    location    || "",
            industry:    industry    || "",
            logo:        logo        || "",
            initials,
            color:       "#1A5CFF",
            userId:      req.id,
        });

        return res.status(201).json({ message: "Company registered.", company: formatCompany(company), success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── GET /api/companies — সব company (public) ────────────────────────────────
export const getAllCompanies = async (req, res) => {
    try {
        const { search = "" } = req.query;
        const query = search
            ? { $or: [{ name: { $regex: search, $options: "i" } }, { industry: { $regex: search, $options: "i" } }] }
            : {};

        const companies = await Company.find(query).sort({ createdAt: -1 });

        const withCount = await Promise.all(companies.map(async (co) => {
            const openJobsCount = await Job.countDocuments({ company: co._id, status: "open" });
            return formatCompany(co, openJobsCount);
        }));

        return res.status(200).json({ companies: withCount, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── GET /api/companies/mine — employer নিজের company ────────────────────────
export const getMyCompany = async (req, res) => {
    try {
        const company = await Company.findOne({ userId: req.id });
        if (!company) return res.status(404).json({ message: "No company found.", success: false });
        const openJobsCount = await Job.countDocuments({ company: company._id, status: "open" });
        return res.status(200).json({ company: formatCompany(company, openJobsCount), success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── GET /api/companies/:id ───────────────────────────────────────────────────
export const getCompanyById = async (req, res) => {
    try {
        const co = await Company.findById(req.params.id);
        if (!co) return res.status(404).json({ message: "Company not found.", success: false });
        const openJobsCount = await Job.countDocuments({ company: co._id, status: "open" });
        return res.status(200).json({ company: formatCompany(co, openJobsCount), success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── GET /api/companies/:id/jobs — oi company র open jobs ────────────────────
export const getJobsByCompany = async (req, res) => {
    try {
        const co = await Company.findById(req.params.id);
        if (!co) return res.status(404).json({ message: "Company not found.", success: false });

        const jobs = await Job.find({ company: req.params.id, status: "open" }).sort({ createdAt: -1 });

        const formatted = jobs.map(job => ({
            id:       job._id,
            _id:      job._id,
            title:    job.title,
            location: job.location,
            type:     job.jobType,
            jobType:  job.jobType,
            salary:   job.salary   || "",
            skills:   job.skills   || [],
            deadline: job.deadline || "",
            status:   job.status,
            postedAt: job.createdAt,
            company: {
                id:       co._id,
                name:     co.name,
                initials: co.initials || co.name.slice(0, 2).toUpperCase(),
                color:    co.color    || "#1A5CFF",
                logo:     co.logo     || "",
            },
        }));

        return res.status(200).json({ jobs: formatted, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// ─── PUT /api/companies/:id — company update ─────────────────────────────────
export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location, industry, logo } = req.body;

        const updateData = {};
        if (name        !== undefined) { updateData.name        = name; updateData.initials = name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase(); }
        if (description !== undefined) updateData.description = description;
        if (website     !== undefined) updateData.website      = website;
        if (location    !== undefined) updateData.location     = location;
        if (industry    !== undefined) updateData.industry     = industry;
        if (logo        !== undefined) updateData.logo         = logo;

        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!company) return res.status(404).json({ message: "Company not found.", success: false });

        return res.status(200).json({ message: "Company updated.", company: formatCompany(company), success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
