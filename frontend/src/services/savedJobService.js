import axios from "axios";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Mock helpers (localStorage — mock mode এ backend নাই তাই এখানেই থাকবে) ────
function getMockSavedJobs() {
  try {
    const raw = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    return Array.isArray(raw) ? raw.map((j) => ({ ...j, id: j.id || j._id || "" })) : [];
  } catch { return []; }
}
function getMockSavedIds() {
  try {
    const raw = JSON.parse(localStorage.getItem("savedJobIds") || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

// ─── getSavedJobs — logged-in user এর saved jobs list ─────────────────────────
export function getSavedJobs() {
  if (USE_MOCK) {
    return Promise.resolve(getMockSavedJobs());
  }
  return axios
    .get(`${BASE_URL}/api/saved-jobs`, { headers: authHeader() })
    .then((res) => res.data.jobs || []);
}

// ─── getSavedJobIds — শুধু id গুলো (bookmark icon state এর জন্য) ──────────────
export function getSavedJobIds() {
  if (USE_MOCK) {
    return Promise.resolve(getMockSavedIds());
  }
  return getSavedJobs().then((jobs) => jobs.map((j) => j.id || j._id));
}

// ─── saveJob — একটা job save করা ───────────────────────────────────────────────
export function saveJob(job) {
  const jobId = job.id || job._id;
  if (USE_MOCK) {
    const ids  = getMockSavedIds();
    const jobs = getMockSavedJobs();
    if (!ids.includes(jobId)) {
      localStorage.setItem("savedJobIds", JSON.stringify([...ids, jobId]));
      localStorage.setItem("savedJobs",   JSON.stringify([...jobs, { ...job, id: jobId }]));
    }
    return Promise.resolve({ success: true });
  }
  return axios
    .post(`${BASE_URL}/api/saved-jobs/${jobId}`, {}, { headers: authHeader() })
    .then((res) => res.data);
}

// ─── unsaveJob — একটা job unsave করা ───────────────────────────────────────────
export function unsaveJob(jobId) {
  if (USE_MOCK) {
    const ids  = getMockSavedIds().filter((i) => i !== jobId);
    const jobs = getMockSavedJobs().filter((j) => (j.id || j._id) !== jobId);
    localStorage.setItem("savedJobIds", JSON.stringify(ids));
    localStorage.setItem("savedJobs",   JSON.stringify(jobs));
    return Promise.resolve({ success: true });
  }
  return axios
    .delete(`${BASE_URL}/api/saved-jobs/${jobId}`, { headers: authHeader() })
    .then((res) => res.data);
}

// ─── toggleSaveJob — সুবিধার জন্য একটাই function দিয়ে save/unsave টগল ────────
export function toggleSaveJob(job, currentlySaved) {
  const jobId = job.id || job._id;
  return currentlySaved ? unsaveJob(jobId) : saveJob(job);
}