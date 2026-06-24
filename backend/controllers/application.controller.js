import { Application } from "../models/application.model.js";
import { Job }         from "../models/job.model.js";

export const applyToJob = async (req, res) => {
  try {
    const { jobId }       = req.params;
    const { coverLetter } = req.body;
    const applicantId     = req.id; 

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found.", success: false });
    }

  
    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: applicantId,
    });
    if (alreadyApplied) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job.", success: false });
    }

    const application = await Application.create({
      job:         jobId,
      applicant:   applicantId,
      coverLetter: coverLetter || "",
    });

  
    await Job.findByIdAndUpdate(jobId, {
      $push: { applications: application._id },
    });

    return res.status(201).json({
      message: "Application submitted successfully.",
      application,
      success: true,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job.", success: false });
    }
    return res.status(500).json({ message: "Server error", success: false });
  }
};


export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.id })
      .populate({
        path: "job",
        select: "title salary location jobType status deadline",
        populate: {
          path:   "company",
          select: "name industry initials color logo",
        },
      })
      .sort({ createdAt: -1 });

    
    const formatted = applications.map((app) => ({
      id:              app._id,
      jobId:           app.job?._id,
      jobTitle:        app.job?.title,
      companyName:     app.job?.company?.name,
      companyInitials: app.job?.company?.initials,
      companyColor:    app.job?.company?.color,
      location:        app.job?.location,
      jobType:         app.job?.jobType,
      salary:          app.job?.salary,
      appliedAt:       app.createdAt,
      status:          app.status,
      coverLetter:     app.coverLetter,
    }));

    return res.status(200).json({ applications: formatted, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getApplicantsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found.", success: false });
    }

    
    if (job.created_by.toString() !== req.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized. This is not your job.", success: false });
    }

    const applications = await Application.find({ job: jobId })
      .populate({
        path:   "applicant",
        select: "fullname email profile",
      })
      .sort({ createdAt: -1 });

    const formatted = applications.map((app) => ({
      id:          app._id,
      jobId,
      name:        app.applicant?.fullname,
      email:       app.applicant?.email,
      location:    app.applicant?.profile?.location || "—",
      experience:  app.applicant?.profile?.experience || "—",
      skills:      app.applicant?.profile?.skills    || [],
      coverLetter: app.coverLetter,
      appliedAt:   app.createdAt,
      status:      app.status,
    }));

    return res.status(200).json({ applications: formatted, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status }        = req.body;

    const VALID = ["pending", "reviewing", "shortlisted", "rejected", "hired"];
    if (!VALID.includes(status)) {
      return res.status(400).json({ message: "Invalid status value.", success: false });
    }

    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found.", success: false });
    }

    
    if (application.job.created_by.toString() !== req.id) {
      return res.status(403).json({ message: "Unauthorized.", success: false });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      message: "Status updated successfully.",
      application,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
