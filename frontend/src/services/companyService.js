import axios from "axios";
import { mockCompanies } from "../data/mockCompanies";
import { mockJobs }      from "../data/mockJobs";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const MOCK_DELAY = 300;

// ─── Mock helpers ──────────────────────────────────────────────────────────────
export function saveEmployerCompanyProfile(form) {
    const initials = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const profile = {
        id: "employer_company", name: form.name,
        industry: form.industry || "", location: form.location || "",
        website: form.website || "", description: form.desc || "",
        logo: form.logo || "", initials, color: "#1A5CFF",
    };
    localStorage.setItem("employerCompany", JSON.stringify(profile));
    try {
        const jobs = JSON.parse(localStorage.getItem("injectedJobs") || "[]");
        localStorage.setItem("injectedJobs", JSON.stringify(
            jobs.map(j => ({ ...j, companyId: "employer_company", company: profile }))
        ));
    } catch { /* ignore */ }
    return profile;
}

function getEmployerCompany() {
    try {
        const p = JSON.parse(localStorage.getItem("employerCompany") || "{}");
        return p?.name && p.name !== "Your Company" ? p : null;
    } catch { return null; }
}
function getInjectedJobs() {
    try { return JSON.parse(localStorage.getItem("injectedJobs") || "[]"); } catch { return []; }
}
function countOpenJobs(companyId) {
    return [...getInjectedJobs(), ...mockJobs]
        .filter(j => j.status === "open" && j.companyId === companyId).length;
}

// ─── getMyCompany — logged-in employer এর নিজের company (fresh from backend) ───
export function getMyCompany() {
    if (USE_MOCK) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const empCo = getEmployerCompany();
                if (empCo) return resolve({ ...empCo, openJobsCount: countOpenJobs(empCo.id) });
                reject(new Error("No company found"));
            }, MOCK_DELAY);
        });
    }
    const token = localStorage.getItem("token");
    return axios
        .get(`${BASE_URL}/api/companies/mine`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => r.data.company);
}

// ─── getCompanies ──────────────────────────────────────────────────────────────
export function getCompanies(search = "") {
    if (USE_MOCK) {
        return new Promise(resolve => {
            setTimeout(() => {
                let companies = [...mockCompanies];
                const empCo = getEmployerCompany();
                if (empCo && !companies.some(c => c.name === empCo.name)) companies.unshift(empCo);
                const q = search.trim().toLowerCase();
                if (q) companies = companies.filter(c =>
                    c.name.toLowerCase().includes(q) || (c.industry || "").toLowerCase().includes(q)
                );
                resolve(companies.map(c => ({ ...c, openJobsCount: countOpenJobs(c.id) })));
            }, MOCK_DELAY);
        });
    }
    return axios.get(`${BASE_URL}/api/companies`, { params: { search } })
        .then(r => r.data.companies || []);
}

// ─── getCompanyById ────────────────────────────────────────────────────────────
export function getCompanyById(id) {
    if (USE_MOCK) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const empCo = getEmployerCompany();
                if (empCo && empCo.id === id) return resolve({ ...empCo, openJobsCount: countOpenJobs(id) });
                const company = mockCompanies.find(c => c.id === id);
                if (!company) return reject(new Error("Company not found"));
                resolve({ ...company, openJobsCount: countOpenJobs(company.id) });
            }, MOCK_DELAY);
        });
    }
    return axios.get(`${BASE_URL}/api/companies/${id}`)
        .then(r => r.data.company);
}

// ─── getOpenJobsByCompany ──────────────────────────────────────────────────────
export function getOpenJobsByCompany(companyId) {
    if (USE_MOCK) {
        return new Promise(resolve => {
            setTimeout(() => {
                const empCo = getEmployerCompany();
                const jobs = [...getInjectedJobs(), ...mockJobs]
                    .filter(j => j.status === "open" && j.companyId === companyId)
                    .map(j => ({
                        ...j,
                        id: j.id || j._id,
                        company: j.company || (empCo?.id === companyId ? empCo : null)
                            || mockCompanies.find(c => c.id === j.companyId),
                    }));
                resolve(jobs);
            }, MOCK_DELAY);
        });
    }
    // Real API — আলাদা /:id/jobs endpoint
    return axios.get(`${BASE_URL}/api/companies/${companyId}/jobs`)
        .then(r => r.data.jobs || []);
}