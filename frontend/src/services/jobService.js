import { mockJobs } from '../data/mockJobs';
import { mockCompanies } from '../data/mockCompanies';

const MOCK_DELAY = 300; // network delay simulate korar jonno (ms)

function attachCompany(job) {
  return { ...job, company: mockCompanies.find((c) => c.id === job.companyId) || null };
}

/**
 * GET /api/jobs?keyword=&category=&location=&type=
 * @param {{keyword?:string, category?:string, location?:string, type?:string}} filters
 * @returns {Promise<Array>}
 */
export function getJobs(filters = {}) {
  const { keyword = '', category = '', location = '', type = '' } = filters;

  return new Promise((resolve) => {
    setTimeout(() => {
      let jobs = mockJobs.filter((j) => j.status === 'open');

      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        jobs = jobs.filter((j) => {
          const company = mockCompanies.find((c) => c.id === j.companyId);
          return (
            j.title.toLowerCase().includes(kw) ||
            j.skills.join(' ').toLowerCase().includes(kw) ||
            (company && company.name.toLowerCase().includes(kw))
          );
        });
      }
      if (category) jobs = jobs.filter((j) => j.category === category);
      if (location) jobs = jobs.filter((j) => j.location === location);
      if (type) jobs = jobs.filter((j) => j.type === type);

      resolve(jobs.map(attachCompany));
    }, MOCK_DELAY);
  });
}

/**
 * GET /api/jobs/:id
 * @param {string} id
 * @returns {Promise<Object>}
 */
export function getJobById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const job = mockJobs.find((j) => j.id === id);
      if (!job) {
        reject(new Error('Job not found'));
        return;
      }
      resolve(attachCompany(job));
    }, MOCK_DELAY);
  });
}
