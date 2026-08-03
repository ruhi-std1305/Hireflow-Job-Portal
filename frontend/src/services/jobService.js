import axios from "axios";
import { mockJobs }     from "../data/mockJobs";
import { mockCompanies } from "../data/mockCompanies";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const MOCK_DELAY = 300;

// ─── Mock helpers ──────────────────────────────────────────────────────────────
function attachCompany(job) {
    if (job.company && typeof job.company === "object") return job;
    return { ...job, company: mockCompanies.find(c => c.id === job.companyId) || null };
}
function getInjectedJobs() {
    try { return JSON.parse(localStorage.getItem("injectedJobs") || "[]"); } catch { return []; }
}
// employer dashboard থেকে edit/delete/status-toggle করা হলে সেটা এখানেও reflect করার জন্য
function getJobOverrides() {
    try { return JSON.parse(localStorage.getItem("employerJobOverrides") || "{}"); } catch { return {}; }
}
function getDeletedJobIds() {
    try { return JSON.parse(localStorage.getItem("employerDeletedJobIds") || "[]"); } catch { return []; }
}
function applyJobOverride(job) {
    const overrides = getJobOverrides();
    const id = job.id || job._id;
    return overrides[id] ? { ...job, ...overrides[id] } : job;
}
function getAllMockJobs() {
    const deletedIds = getDeletedJobIds();
    return [...getInjectedJobs(), ...mockJobs]
        .filter(j => !deletedIds.includes(j.id || j._id))
        .map(applyJobOverride);
}

// ─── GET jobs ──────────────────────────────────────────────────────────────────
export function getJobs(filters = {}) {
    const { keyword = "", category = "", location = "", type = "" } = filters;

    if (USE_MOCK) {
        return new Promise(resolve => {
            setTimeout(() => {
                let jobs = getAllMockJobs().filter(j => j.status === "open");
                if (keyword.trim()) {
                    const kw = keyword.trim().toLowerCase();
                    jobs = jobs.filter(j => {
                        const co = j.company || mockCompanies.find(c => c.id === j.companyId);
                        return (j.title || "").toLowerCase().includes(kw)
                            || (j.skills || []).join(" ").toLowerCase().includes(kw)
                            || (co?.name || "").toLowerCase().includes(kw)
                            || (j.description || "").toLowerCase().includes(kw);
                    });
                }
                if (category) jobs = jobs.filter(j => j.category === category);
                if (location) jobs = jobs.filter(j => j.location === location);
                if (type)     jobs = jobs.filter(j => (j.type || j.jobType) === type);
                resolve(jobs.map(attachCompany));
            }, MOCK_DELAY);
        });
    }

    // Real API
    return axios
        .get(`${BASE_URL}/api/jobs`, { params: { keyword, category, location, jobType: type } })
        .then(res => res.data.jobs || []);
}

// ─── GET job by id ─────────────────────────────────────────────────────────────
export function getJobById(id) {
    if (USE_MOCK) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const job = getAllMockJobs().find(j => (j.id || j._id) === id);
                if (!job) return reject(new Error("Job not found"));
                resolve(attachCompany(job));
            }, MOCK_DELAY);
        });
    }

    // Real API
    return axios
        .get(`${BASE_URL}/api/jobs/${id}`)
        .then(res => res.data.job);
}
