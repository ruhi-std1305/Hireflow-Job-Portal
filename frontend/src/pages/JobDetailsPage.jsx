import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../services/jobService';
import '../styles/jobsCompanies.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";

// ─── APPLY MODAL ─────────────────────────────────────────────
function ApplyModal({ job, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const token = localStorage.getItem("token");

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(
        "http://localhost:5000/api/applications",
        { jobId: job._id, coverLetter },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Application failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "24px",
          padding: "36px", width: "100%", maxWidth: "460px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          fontFamily: "'Instrument Sans', sans-serif"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: 700, color: "#0D0D12" }}>
            Apply for {job.title}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#7A7A8C" }}>✕</button>
        </div>

        <form onSubmit={handleApply}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#0D0D12", marginBottom: "8px" }}>
              Cover Letter <span style={{ color: "#7A7A8C", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              placeholder="Tell the employer why you're a great fit..."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              rows={5}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "12px",
                border: "1.5px solid #E2E0DA", fontSize: "14px", outline: "none",
                fontFamily: "'Instrument Sans', sans-serif", resize: "vertical",
                boxSizing: "border-box", color: "#0D0D12"
              }}
            />
          </div>

          {error && (
            <div style={{ color: "#DC2626", fontSize: "13px", marginBottom: "14px" }}>⚠️ {error}</div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: "12px", borderRadius: "12px",
                background: "#1A5CFF", color: "#fff", border: "none",
                fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Instrument Sans', sans-serif", opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 20px", borderRadius: "12px",
                background: "#F6F5F2", color: "#0D0D12", border: "none",
                fontSize: "14px", fontWeight: 600, cursor: "pointer",
                fontFamily: "'Instrument Sans', sans-serif"
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job,       setJob]       = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [applied,   setApplied]   = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    getJobById(id)
      .then((data) => { if (active) { setJob(data); setLoading(false); } })
      .catch(() => { if (active) { setNotFound(true); setLoading(false); } });
    return () => { active = false; };
  }, [id]);

  const handleApplyClick = () => {
    if (!token) {
    
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      setShowApply(true);
    }
  };

  if (loading) return (
    <div className="page-container">
      <div className="empty-state">
        <div className="empty-icon">⏳</div>
        <div className="empty-title">Loading job details...</div>
      </div>
    </div>
  );

  if (notFound || !job) return (
    <div className="page-container">
      <div className="empty-state">
        <div className="empty-icon">❌</div>
        <div className="empty-title">Job not found</div>
        <button className="btn btn-primary mt-16" onClick={() => navigate('/jobs')}>
          Back to Find Jobs
        </button>
      </div>
    </div>
  );

  const co = job.company;

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface2)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div className="page-container" style={{ flex: 1 }}>
        <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate('/jobs')}>
          <span>←</span> Back
        </button>

        <div className="job-detail-hero">
          <div className="jdh-top">
            <div className="jdh-logo" style={{ color: co?.logo ? undefined : co?.color || 'var(--accent)' }}>
              {co?.logo ? <img src={co.logo} alt={co.name} /> : co?.initials || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div className="jdh-title">{job.title}</div>
              <div className="jdh-company">{co?.name || 'Unknown'} · {job.location}</div>
              <div className="flex gap-8 mt-8" style={{ flexWrap: 'wrap' }}>
                <span className="badge badge-blue">{job.type}</span>
                <span className="badge badge-gray">{job.category}</span>
                <span className="badge badge-gray">{job.experience}</span>
                {job.location === 'Remote' && <span className="badge badge-green">Remote</span>}
              </div>
            </div>
          </div>

          <div className="jdh-actions">
            {applied ? (
              <button className="btn btn-primary btn-lg" disabled style={{ opacity: 0.7 }}>
                ✅ Applied!
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleApplyClick}>
                Apply Now →
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => setSaved(s => !s)}>
              {saved ? '🔖 Saved' : '🔖 Save'}
            </button>
          </div>
        </div>

        <div className="job-detail-grid">
          <div>
            <div className="card mb-16">
              <div className="job-stats-grid">
                <div className="stat-item">
                  <div className="stat-lbl">Salary</div>
                  <div className="stat-val">{job.salary}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-lbl">Applicants</div>
                  <div className="stat-val">{job.applicants?.length ?? 0}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-lbl">Deadline</div>
                  <div className="stat-val">{job.deadline || 'Open'}</div>
                </div>
              </div>

              <h3 className="section-h3">About the Role</h3>
              <p className="job-desc">{job.description}</p>

              <h3 className="section-h3">Requirements</h3>
              <ul className="req-list">
                {job.requirements?.map((r, i) => <li key={i}>{r}</li>)}
              </ul>

              <h3 className="section-h3">Skills</h3>
              <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                {job.skills?.map((s) => <span key={s} className="badge badge-blue">{s}</span>)}
              </div>
            </div>
          </div>

          <div>
            <div className="card company-sidebar">
              <div className="co-logo-lg" style={{ margin: '0 auto 14px', color: co?.logo ? undefined : co?.color || 'var(--accent)' }}>
                {co?.logo ? <img src={co.logo} alt={co.name} /> : co?.initials || '?'}
              </div>
              <div className="co-side-name">{co?.name || 'Unknown'}</div>
              <div className="co-side-industry">{co?.industry || ''}</div>
              <p className="co-side-desc">{co?.description || ''}</p>
              <div className="co-side-location">{co?.location || ''}</div>
              {co?.website && (
                <a href={co.website} target="_blank" rel="noreferrer" className="co-side-link">
                  {co.website}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* ── TOAST ── */}
      {showToast && (
        <div style={{
          position: "fixed", bottom: "32px", right: "32px", zIndex: 2000,
          background: "#DC2626", color: "#fff",
          padding: "14px 22px", borderRadius: "14px",
          fontSize: "14px", fontWeight: 600,
          boxShadow: "0 8px 32px rgba(220,38,38,0.35)",
          fontFamily: "'Instrument Sans', sans-serif",
          display: "flex", alignItems: "center", gap: "8px",
          animation: "slideUp 0.3s ease",
          cursor: "pointer"
        }}
          onClick={() => navigate("/login")} 
        >
          🔒 Please log in to apply
        </div>
      )}

      {/* ── APPLY MODAL ── */}
      {showApply && (
        <ApplyModal
          job={job}
          onClose={() => setShowApply(false)}
          onSuccess={() => { setShowApply(false); setApplied(true); }}
        />
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}