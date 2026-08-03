import { SavedJob } from "../models/savedJob.model.js";
import { Job }      from "../models/job.model.js";

// helper — populated job document কে frontend format এ convert করা (formatJob এর মতোই)
function formatJob(job) {
  const co = job.company;
  return {
    id:              job._id,
    _id:             job._id,
    title:           job.title,
    description:     job.description,
    requirements:    job.requirements  || [],
    salary:          job.salary        || "",
    location:        job.location,
    type:            job.jobType,
    jobType:         job.jobType,
    category:        job.category      || "Technology",
    experienceLevel: job.experienceLevel ?? 0,
    skills:          job.skills        || [],
    deadline:        job.deadline      || "",
    status:          job.status        || "open",
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

// ─── POST /api/saved-jobs/:jobId — job save করা ────────────────────────────────
export const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId     = req.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found.", success: false });
    }

    const already = await SavedJob.findOne({ user: userId, job: jobId });
    if (already) {
      return res.status(200).json({ message: "Already saved.", success: true });
    }

    await SavedJob.create({ user: userId, job: jobId });
    return res.status(201).json({ message: "Job saved.", success: true });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(200).json({ message: "Already saved.", success: true });
    }
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ─── DELETE /api/saved-jobs/:jobId — job unsave করা ────────────────────────────
export const unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId     = req.id;

    await SavedJob.findOneAndDelete({ user: userId, job: jobId });
    return res.status(200).json({ message: "Job removed from saved list.", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ─── GET /api/saved-jobs — logged-in user এর সব saved job ─────────────────────
export const getMySavedJobs = async (req, res) => {
  try {
    const userId = req.id;

    const saved = await SavedJob.find({ user: userId })
      .populate({
        path: "job",
        populate: { path: "company" },
      })
      .sort({ createdAt: -1 });

    // যেই job মুছে গেছে (deleted), সেগুলো বাদ দিয়ে বাকিগুলো format করা
    const jobs = saved
      .filter((s) => s.job)
      .map((s) => formatJob(s.job));

    return res.status(200).json({ jobs, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};