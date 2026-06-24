import { Job }         from "../models/job.model.js";
import { Application } from "../models/application.model.js";

// ─── POST /api/jobs ───────────────────────────────────────────────────────────
export const postJob = async (req, res) => {
  try {
    const {
      title, description, requirements, salary,
      location, jobType, experienceLevel, position, companyId,
    } = req.body;
    const userId = req.id;

    if (!title || !description || !requirements || !salary || !location || !jobType || !experienceLevel || !position) {
      return res.status(400).json({ message: "Something is missing.", success: false });
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary:       Number(salary),
      location,
      jobType,
      experienceLevel,
      position,
      company:    companyId,
      created_by: userId,
    });

    return res.status(201).json({ message: "New job created successfully.", job, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ─── GET /api/jobs ────────────────────────────────────────────────────────────
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const query = keyword
      ? {
          $or: [
            { title:       { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
            { location:    { $regex: keyword, $options: "i" } },
          ],
        }
      : {};

    const jobs = await Job.find(query)
      .populate({ path: "company" })
      .sort({ createdAt: -1 });

    return res.status(200).json({ jobs, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ─── GET /api/jobs/admin ──────────────────────────────────────────────────────
// Employer dashboard-এর জন্য — নিজের posted jobs + applicant count
export const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ created_by: req.id })
      .populate("company")
      .sort({ createdAt: -1 });

    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await Application.countDocuments({ job: job._id });
        return {
          id:         job._id,
          _id:        job._id,
          title:      job.title,
          status:     job.status || "open",
          applicants,
          postedAt:   job.createdAt,
          deadline:   job.deadline || "",
          company:    job.company,
          location:   job.location,
          jobType:    job.jobType,
        };
      })
    );

    return res.status(200).json({ jobs: jobsWithCount, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ─── GET /api/jobs/:id ────────────────────────────────────────────────────────
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("company");
    if (!job) {
      return res.status(404).json({ message: "Job not found.", success: false });
    }
    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
