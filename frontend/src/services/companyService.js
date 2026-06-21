import axios from 'axios';
import { mockCompanies } from '../data/mockCompanies';
import { mockJobs } from '../data/mockJobs';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MOCK_DELAY = 300;

function countOpenJobs(companyId) {
  return mockJobs.filter((j) => j.companyId === companyId && j.status === 'open').length;
}

export function getCompanies(search = '') {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const q = search.trim().toLowerCase();
        let companies = mockCompanies;
        if (q) {
          companies = companies.filter(
            (c) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
          );
        }
        resolve(companies.map((c) => ({ ...c, openJobsCount: countOpenJobs(c.id) })));
      }, MOCK_DELAY);
    });
  }

  // Real API
  return axios
    .get(`${BASE_URL}/api/companies`, { params: { search } })
    .then((res) => res.data.companies);
}

export function getCompanyById(id) {
  if (USE_MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const company = mockCompanies.find((c) => c.id === id);
        if (!company) return reject(new Error('Company not found'));
        resolve({ ...company, openJobsCount: countOpenJobs(company.id) });
      }, MOCK_DELAY);
    });
  }

  // Real API
  return axios
    .get(`${BASE_URL}/api/companies/${id}`)
    .then((res) => res.data.company);
}

export function getOpenJobsByCompany(companyId) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const company = mockCompanies.find((c) => c.id === companyId);
        const jobs = mockJobs
          .filter((j) => j.companyId === companyId && j.status === 'open')
          .map((j) => ({ ...j, company }));
        resolve(jobs);
      }, MOCK_DELAY);
    });
  }

  // Real API — backend /api/companies/:id response এ jobs[] included আছে
  return axios
    .get(`${BASE_URL}/api/companies/${companyId}`)
    .then((res) => res.data.jobs);
}