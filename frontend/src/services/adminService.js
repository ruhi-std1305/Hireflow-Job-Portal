import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const api = axios.create({ baseURL: `${BASE_URL}/api/admin` });

// ─── Overview ──────────────────────────────────────────────────────────────────
export function getOverview() {
  return api.get("/overview", { headers: authHeader() }).then((res) => res.data);
}

// ─── Users (seekers / employers) ────────────────────────────────────────────────
export function getUsers(role) {
  return api
    .get("/users", { params: role ? { role } : {}, headers: authHeader() })
    .then((res) => res.data.users);
}

export function getUserDetail(userId) {
  return api.get(`/users/${userId}`, { headers: authHeader() }).then((res) => res.data.user);
}

export function suspendUser(userId) {
  return api.patch(`/users/${userId}/suspend`, {}, { headers: authHeader() }).then((res) => res.data);
}

export function unsuspendUser(userId) {
  return api.patch(`/users/${userId}/unsuspend`, {}, { headers: authHeader() }).then((res) => res.data);
}

export function deleteUser(userId) {
  return api.delete(`/users/${userId}`, { headers: authHeader() }).then((res) => res.data);
}

// ─── Jobs ────────────────────────────────────────────────────────────────────
export function getAllJobsAdmin() {
  return api.get("/jobs", { headers: authHeader() }).then((res) => res.data.jobs);
}

export function adminToggleJobStatus(jobId) {
  return api.patch(`/jobs/${jobId}/status`, {}, { headers: authHeader() }).then((res) => res.data);
}

export function flagJob(jobId, reason) {
  return api.patch(`/jobs/${jobId}/flag`, { reason }, { headers: authHeader() }).then((res) => res.data);
}

export function unflagJob(jobId) {
  return api.patch(`/jobs/${jobId}/unflag`, {}, { headers: authHeader() }).then((res) => res.data);
}

export function adminDeleteJob(jobId) {
  return api.delete(`/jobs/${jobId}`, { headers: authHeader() }).then((res) => res.data);
}

// ─── Companies ─────────────────────────────────────────────────────────────────
export function getAllCompaniesAdmin() {
  return api.get("/companies", { headers: authHeader() }).then((res) => res.data.companies);
}

// ─── Activity log ──────────────────────────────────────────────────────────────
export function getActivityLog() {
  return api.get("/activity", { headers: authHeader() }).then((res) => res.data.activity);
}

export function clearActivityLog() {
  return api.delete("/activity", { headers: authHeader() }).then((res) => res.data);
}
