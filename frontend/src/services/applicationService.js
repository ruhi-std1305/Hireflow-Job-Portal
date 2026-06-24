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

// ─── Job Seeker: get all my applications ──────────────────────────────────────
export function getMyApplications() {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...mockApplications]), 300)
    );
  }
  return axios
    .get(`${BASE_URL}/api/applications/me`, { headers: authHeader() })
    .then((res) => res.data.applications);
}

// ─── Job Seeker: apply to a job ───────────────────────────────────────────────
export function applyToJob({ jobId, coverLetter }) {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ message: "Applied (mock)", success: true }), 400)
    );
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
    return new Promise((resolve) =>
      setTimeout(() => resolve([...mockEmployerJobs]), 300)
    );
  }
  return axios
    .get(`${BASE_URL}/api/jobs/admin`, { headers: authHeader() })
    .then((res) => res.data.jobs);
}

// ─── Employer: post a new job ─────────────────────────────────────────────────
export function postJob(jobData) {
  if (USE_MOCK) {
    const newJob = {
      id:         "j_" + Date.now(),
      title:      jobData.title,
      location:   jobData.location,
      jobType:    jobData.jobType,
      status:     "open",
      applicants: 0,
      deadline:   "",
      postedAt:   new Date().toISOString(),
    };
    return new Promise((resolve) =>
      setTimeout(() => resolve(newJob), 400)
    );
  }
  return axios
    .post(`${BASE_URL}/api/jobs`, jobData, { headers: authHeader() })
    .then((res) => res.data.job);
}