import React, { useEffect, useState } from 'react';
import FilterBar from '../components/FilterBar';
import JobCard from '../components/JobCard';
import { getJobs } from '../services/jobService';
import '../styles/jobsCompanies.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";
import { getSavedJobIds, toggleSaveJob } from "../services/savedJobService";

const EMPTY_FILTERS = { keyword: '', category: '', location: '', type: '' };

// Job এর id বের করা — mock এ "id", MongoDB তে "_id"
function getJobId(job) {
  return job._id || job.id || "";
}

export default function FindJobsPage() {
  const [filters,  setFilters]  = useState(EMPTY_FILTERS);
  const [jobs,     setJobs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [savedIds, setSavedIds] = useState([]);

  const location = useLocation();

  useEffect(() => {
    getSavedJobIds().then(setSavedIds).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilters({
      keyword:  params.get("keyword") || params.get("q") || "",
      category: "",
      location: params.get("location") || params.get("loc") || "",
      type:     "",
    });
  }, [location.search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getJobs(filters).then((data) => {
      if (active) { setJobs(data); setLoading(false); }
    });
    return () => { active = false; };
  }, [filters]);

  const toggleSave = (jobId) => {
    const job = jobs.find((j) => getJobId(j) === jobId);
    const alreadySaved = savedIds.includes(jobId);

    toggleSaveJob({ ...job, id: jobId }, alreadySaved)
      .then(() => {
        setSavedIds((prev) =>
          alreadySaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]
        );
      })
      .catch(() => alert("Could not update saved jobs. Please try again."));
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface2)" }}>
      <Navbar />
      <div className="page-container">
        <div className="page-title">Find Jobs</div>
        <div className="page-sub">
          {loading ? 'Loading jobs...' : `Showing ${jobs.length} job${jobs.length !== 1 ? 's' : ''}`}
        </div>

        <FilterBar filters={filters} onChange={setFilters} onClear={() => setFilters(EMPTY_FILTERS)} />

        <div className="jobs-grid">
          {loading ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-icon">⏳</div>
              <div className="empty-title">Loading jobs...</div>
            </div>
          ) : jobs.length ? (
            jobs.map((job) => {
              const jid = getJobId(job);
              return (
                <JobCard
                  key={jid}
                  job={{ ...job, id: jid }}
                  saved={savedIds.includes(jid)}
                  onToggleSave={toggleSave}
                />
              );
            })
          ) : (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No jobs match your filters</div>
              <div className="text-muted text-sm">Try adjusting your search criteria</div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}