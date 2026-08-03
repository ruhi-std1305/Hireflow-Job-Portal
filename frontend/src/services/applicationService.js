import axios from "axios";
import {
  mockApplications,
  mockApplicants,
  mockEmployerJobs,
} from "../data/mockApplications";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// localStorage এ applied jobs store/check করা
function getAppliedFromStorage() {
  try { return JSON.parse(localStorage.getItem("myApplications") || "[]"); }
  catch { return []; }
}
function saveApplicationToStorage(app) {
  const existing = getAppliedFromStorage();
  existing.unshift(app);
  localStorage.setItem("myApplications", JSON.stringify(existing));
}
function hasAlreadyApplied(jobId) {
  return getAppliedFromStorage().some((a) => a.jobId === jobId);
}

// ─── Public: total applications count (homepage stats) ───────────────────────
export function getApplicationsCount() {
  if (USE_MOCK) {
    return Promise.resolve(148);
  }
  return axios
    .get(`${BASE_URL}/api/applications/count`)
    .then((res) => res.data.count)
    .catch(() => 0);
}

// ─── Job Seeker: get all my applications ──────────────────────────────────────
export function getMyApplications() {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // localStorage এ submit করা real applications + mock applications merge
        const storedApps = getAppliedFromStorage();
        const combined = [...storedApps, ...mockApplications];
        resolve(combined);
      }, 300);
    });
  }
  return axios
    .get(`${BASE_URL}/api/applications/me`, { headers: authHeader() })
    .then((res) => res.data.applications);
}

// ─── Job Seeker: apply to a job ───────────────────────────────────────────────
export function applyToJob({ jobId, coverLetter }) {
  if (USE_MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (hasAlreadyApplied(jobId)) {
          reject({ response: { data: { message: "You have already applied for this job." } } });
          return;
        }
        // Job info localStorage এ saved থাকলে সেখান থেকে, নইলে generic
        let jobTitle = "Job";
        let companyName = "";
        let companyInitials = "??";
        let companyColor = "#1A5CFF";
        let location = "";
        let jobType = "";
        let salary = "";
        try {
          const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
          const job = savedJobs.find((j) => (j.id || j._id) === jobId);
          if (job) {
            jobTitle = job.title || jobTitle;
            companyName = job.company?.name || "";
            companyInitials = job.company?.initials || companyName.slice(0, 2).toUpperCase() || "??";
            companyColor = job.company?.color || "#1A5CFF";
            location = job.location || "";
            jobType = job.type || job.jobType || "";
            salary = job.salary || "";
          }
        } catch { /* ignore */ }

        const newApp = {
          id: "app_" + Date.now(),
          jobId,
          jobTitle,
          companyName,
          companyInitials,
          companyColor,
          location,
          jobType,
          salary,
          appliedAt: new Date().toISOString(),
          status: "pending",
          coverLetter: coverLetter || "",
        };
        saveApplicationToStorage(newApp);
        resolve({ message: "Application submitted successfully.", success: true });
      }, 500);
    });
  }
  return axios
    .post(
      `${BASE_URL}/api/applications/apply/${jobId}`,
      { coverLetter },
      { headers: authHeader() }
    )
    .then((res) => res.data);
}

// ─── Employer: get applicants for one job ─────────────────────────────────────
export function getApplicantsByJob(jobId) {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve(mockApplicants.filter((a) => a.jobId === jobId)),
        300
      )
    );
  }
  return axios
    .get(`${BASE_URL}/api/applications/job/${jobId}`, { headers: authHeader() })
    .then((res) => res.data.applications);
}

// ─── Employer: update applicant status ───────────────────────────────────────
export function updateApplicationStatus(applicationId, status) {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ success: true }), 300)
    );
  }
  return axios
    .patch(
      `${BASE_URL}/api/applications/${applicationId}/status`,
      { status },
      { headers: authHeader() }
    )
    .then((res) => res.data);
}

// ─── Employer: get own posted jobs ────────────────────────────────────────────
export function getEmployerJobs() {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // localStorage এ employer এর posted jobs + mock jobs, deleted বাদ + edit/status override সহ
        const stored     = getStoredEmployerJobs();
        const deletedIds = getDeletedJobIds();
        const combined = [...stored, ...mockEmployerJobs]
          .filter((j) => !deletedIds.includes(j.id || j._id))
          .map(applyJobOverride);
        resolve(combined);
      }, 300);
    });
  }
  return axios
    .get(`${BASE_URL}/api/jobs/admin`, { headers: authHeader() })
    .then((res) => res.data.jobs);
}

// ─── Employer: post a new job ─────────────────────────────────────────────────
export function postJob(jobData) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const empProfile = (() => {
          try { return JSON.parse(localStorage.getItem("employerCompany") || "{}"); } catch { return {}; }
        })();
        const companyName     = empProfile.name     || localStorage.getItem("companyName") || "My Company";
        const companyInitials = empProfile.initials || companyName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
        const companyLogo     = empProfile.logo     || localStorage.getItem("companyLogo") || "";

        const newJob = {
          id:         "j_" + Date.now(),
          title:      jobData.title,
          location:   jobData.location,
          type:       jobData.jobType || "Full-time",
          jobType:    jobData.jobType || "Full-time",
          category:   jobData.category || "Technology",
          experience: jobData.experienceLevel || "Mid Level",
          skills:     Array.isArray(jobData.skills)
                        ? jobData.skills
                        : (jobData.skills || "").split(",").map((s) => s.trim()).filter(Boolean),
          salary:     jobData.salary || "",
          description: jobData.description || "",
          requirements: Array.isArray(jobData.requirements)
                          ? jobData.requirements
                          : (jobData.requirements || "").split("\n").map((r) => r.trim()).filter(Boolean),
          status:     "open",
          applicants: 0,
          deadline:   jobData.deadline || "",
          postedAt:   new Date().toISOString(),
          featured:   false,
          // company info যাতে Find Jobs এ দেখায়
          companyId:  "employer_company",   // fixed id — সবসময় match করবে
          company: {
            name:     companyName,
            initials: companyInitials,
            color:    "#1A5CFF",
            logo:     companyLogo,
          },
        };

        // localStorage এ employer jobs save
        saveEmployerJob(newJob);
        // mockJobs array তে inject (Find Jobs এ দেখাবে)
        injectJobToMockList(newJob);

        resolve(newJob);
      }, 500);
    });
  }
  return axios
    .post(`${BASE_URL}/api/jobs`, jobData, { headers: authHeader() })
    .then((res) => res.data.job);
}

// ─── Employer: existing job edit করা ───────────────────────────────────────────
export function updateJob(jobId, jobData) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const patch = {
          title:       jobData.title,
          location:    jobData.location,
          type:        jobData.jobType || "Full-time",
          jobType:     jobData.jobType || "Full-time",
          category:    jobData.category || "Technology",
          salary:      jobData.salary || "",
          description: jobData.description || "",
          skills:      Array.isArray(jobData.skills)
                         ? jobData.skills
                         : (jobData.skills || "").split(",").map((s) => s.trim()).filter(Boolean),
          requirements: Array.isArray(jobData.requirements)
                         ? jobData.requirements
                         : (jobData.requirements || "").split("\n").map((r) => r.trim()).filter(Boolean),
          deadline:    jobData.deadline || "",
          experienceLevel: jobData.experienceLevel,
        };

        // 1) override map এ সেভ করা (demo/mock static job হলেও edit reflect হবে)
        saveJobOverride(jobId, patch);

        // 2) employer নিজে যেই jobs post করেছে, সেটার list-ও সরাসরি update
        const stored = getStoredEmployerJobs();
        const idx    = stored.findIndex((j) => (j.id || j._id) === jobId);
        if (idx > -1) {
          stored[idx] = { ...stored[idx], ...patch };
          localStorage.setItem("employerPostedJobs", JSON.stringify(stored));
        }

        // 3) Find Jobs পেজে reflect করার জন্য injectedJobs-ও update
        try {
          const injected = JSON.parse(localStorage.getItem("injectedJobs") || "[]");
          const jIdx     = injected.findIndex((j) => (j.id || j._id) === jobId);
          if (jIdx > -1) {
            injected[jIdx] = { ...injected[jIdx], ...patch };
            localStorage.setItem("injectedJobs", JSON.stringify(injected));
          }
        } catch { /* ignore */ }

        resolve({ success: true, message: "Job updated successfully." });
      }, 400);
    });
  }
  return axios
    .put(`${BASE_URL}/api/jobs/${jobId}`, jobData, { headers: authHeader() })
    .then((res) => res.data.job);
}

// ─── Employer: job delete করা (সাথে related applications-ও বাদ) ───────────────
export function deleteJob(jobId) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        markJobDeleted(jobId);

        const stored = getStoredEmployerJobs().filter((j) => (j.id || j._id) !== jobId);
        localStorage.setItem("employerPostedJobs", JSON.stringify(stored));

        try {
          const injected = JSON.parse(localStorage.getItem("injectedJobs") || "[]")
            .filter((j) => (j.id || j._id) !== jobId);
          localStorage.setItem("injectedJobs", JSON.stringify(injected));
        } catch { /* ignore */ }

        resolve({ success: true, message: "Job deleted successfully." });
      }, 400);
    });
  }
  return axios
    .delete(`${BASE_URL}/api/jobs/${jobId}`, { headers: authHeader() })
    .then((res) => res.data);
}

// ─── Employer: job open ⇄ closed status টগল ───────────────────────────────────
export function toggleJobStatus(jobId, currentStatus) {
  const newStatus = currentStatus === "open" ? "closed" : "open";

  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        saveJobOverride(jobId, { status: newStatus });

        const stored = getStoredEmployerJobs();
        const idx    = stored.findIndex((j) => (j.id || j._id) === jobId);
        if (idx > -1) {
          stored[idx] = { ...stored[idx], status: newStatus };
          localStorage.setItem("employerPostedJobs", JSON.stringify(stored));
        }

        try {
          const injected = JSON.parse(localStorage.getItem("injectedJobs") || "[]");
          const jIdx     = injected.findIndex((j) => (j.id || j._id) === jobId);
          if (jIdx > -1) {
            injected[jIdx] = { ...injected[jIdx], status: newStatus };
            localStorage.setItem("injectedJobs", JSON.stringify(injected));
          }
        } catch { /* ignore */ }

        resolve({ success: true, status: newStatus });
      }, 300);
    });
  }
  return axios
    .patch(`${BASE_URL}/api/jobs/${jobId}/status`, {}, { headers: authHeader() })
    .then((res) => res.data);
}

// ─── localStorage helpers for mock employer jobs ──────────────────────────────
function getStoredEmployerJobs() {
  try { return JSON.parse(localStorage.getItem("employerPostedJobs") || "[]"); }
  catch { return []; }
}
function saveEmployerJob(job) {
  const existing = getStoredEmployerJobs();
  existing.unshift(job);
  localStorage.setItem("employerPostedJobs", JSON.stringify(existing));
}

// ─── localStorage helpers for mock job edit/delete overrides ──────────────────
// (mock demo job, বা user-posted job — দুটোতেই edit/close/delete reflect করার জন্য)
function getJobOverrides() {
  try { return JSON.parse(localStorage.getItem("employerJobOverrides") || "{}"); }
  catch { return {}; }
}
function saveJobOverride(jobId, patch) {
  const overrides = getJobOverrides();
  overrides[jobId] = { ...(overrides[jobId] || {}), ...patch };
  localStorage.setItem("employerJobOverrides", JSON.stringify(overrides));
}
function applyJobOverride(job) {
  const overrides = getJobOverrides();
  const id = job.id || job._id;
  return overrides[id] ? { ...job, ...overrides[id] } : job;
}
function getDeletedJobIds() {
  try { return JSON.parse(localStorage.getItem("employerDeletedJobIds") || "[]"); }
  catch { return []; }
}
function markJobDeleted(jobId) {
  const ids = getDeletedJobIds();
  if (!ids.includes(jobId)) {
    ids.push(jobId);
    localStorage.setItem("employerDeletedJobIds", JSON.stringify(ids));
  }
}

// mockJobs array এ inject করা (runtime এ Find Jobs এ দেখাবে)
function injectJobToMockList(newJob) {
  try {
    const existing = JSON.parse(localStorage.getItem("injectedJobs") || "[]");
    existing.unshift(newJob);
    localStorage.setItem("injectedJobs", JSON.stringify(existing));
  } catch { /* ignore */ }
}