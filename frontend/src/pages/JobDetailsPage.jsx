import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../services/jobService';
import '../styles/jobsCompanies.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { applyToJob } from "../services/applicationService";
import { getSavedJobIds, toggleSaveJob } from "../services/savedJobService";

// ─── APPLY MODAL (demo র মতো) ─────────────────────────────────────────────
function ApplyModal({ job, onClose, onSuccess }) {
  const name  = localStorage.getItem("name")  || "";
  const email = localStorage.getItem("email") || "";

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile,  setResumeFile]  = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const jobId = job._id || job.id;
      await applyToJob({ jobId, coverLetter });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Application failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "24px",
          padding: "36px", width: "100%", maxWidth: "520px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          fontFamily: "'Instrument Sans', sans-serif",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "20px", fontWeight: 700, color: "#0D0D12" }}>
              Apply for Position
            </div>
            <div style={{ fontSize: "14px", color: "#7A7A8C", marginTop: "4px" }}>
              {job.title} · {job.company?.name || ""}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#7A7A8C" }}>✕</button>
        </div>

        <form onSubmit={handleApply}>
          {/* Name */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0D0D12", marginBottom: "6px" }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              readOnly
              style={{
                width: "100%", padding: "11px 14px", borderRadius: "12px",
                border: "1.5px solid #E2E0DA", fontSize: "14px",
                background: "#F6F5F2", color: "#3A3A4C",
                fontFamily: "'Instrument Sans', sans-serif",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0D0D12", marginBottom: "6px" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              readOnly
              style={{
                width: "100%", padding: "11px 14px", borderRadius: "12px",
                border: "1.5px solid #E2E0DA", fontSize: "14px",
                background: "#F6F5F2", color: "#3A3A4C",
                fontFamily: "'Instrument Sans', sans-serif",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Resume Upload */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0D0D12", marginBottom: "6px" }}>
              Resume / CV
            </label>
            <div
              onClick={() => document.getElementById("applyResume").click()}
              style={{
                border: "1.5px dashed #C5C2BA", borderRadius: "12px",
                padding: "16px", textAlign: "center", cursor: "pointer",
                background: resumeFile ? "#F0FFF4" : "#FAFAF8",
              }}
            >
              {resumeFile ? (
                <div style={{ fontSize: "14px", color: "#065F46", fontWeight: 600 }}>
                  📄 {resumeFile.name}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: "22px", marginBottom: "4px" }}>📎</div>
                  <div style={{ fontSize: "13px", color: "#7A7A8C" }}>
                    Click to upload PDF or DOCX · Max 5MB
                  </div>
                </>
              )}
              <input
                id="applyResume"
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f && f.size > 5 * 1024 * 1024) { alert("File must be under 5MB."); return; }
                  if (f) setResumeFile(f);
                }}
              />
            </div>
          </div>

          {/* Cover Letter */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#0D0D12", marginBottom: "6px" }}>
              Cover Letter <span style={{ color: "#7A7A8C", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              placeholder="Tell the employer why you're a great fit for this role..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "12px",
                border: "1.5px solid #E2E0DA", fontSize: "14px",
                fontFamily: "'Instrument Sans', sans-serif", resize: "vertical",
                boxSizing: "border-box", color: "#0D0D12", outline: "none",
              }}
            />
          </div>

          {error && (
            <div style={{ color: "#DC2626", fontSize: "13px", marginBottom: "14px", padding: "10px 14px", background: "#FEE2E2", borderRadius: "10px" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: "13px", borderRadius: "12px",
                background: loading ? "#93b8ff" : "#1A5CFF",
                color: "#fff", border: "none",
                fontSize: "14px", fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Instrument Sans', sans-serif",
              }}
            >
              {loading ? "Submitting..." : "Submit Application →"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "13px 20px", borderRadius: "12px",
                background: "#F6F5F2", color: "#0D0D12", border: "none",
                fontSize: "14px", fontWeight: 600, cursor: "pointer",
                fontFamily: "'Instrument Sans', sans-serif",
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

// ─── SUCCESS TOAST ────────────────────────────────────────────────────────────
function SuccessToast({ jobTitle, onClose }) {
  return (
    <div style={{
      position: "fixed", bottom: "32px", right: "32px", zIndex: 2000,
      background: "#065F46", color: "#fff",
      padding: "16px 22px", borderRadius: "14px",
      fontSize: "14px", fontWeight: 600,
      boxShadow: "0 8px 32px rgba(6,95,70,0.35)",
      fontFamily: "'Instrument Sans', sans-serif",
      display: "flex", alignItems: "center", gap: "10px",
      animation: "slideUp 0.3s ease",
      cursor: "pointer",
      maxWidth: "320px",
    }} onClick={onClose}>
      ✅ Application submitted for <strong>{jobTitle}</strong>!
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job,          setJob]        = useState(null);
  const [loading,      setLoading]    = useState(true);
  const [notFound,     setNotFound]   = useState(false);
  const [saved,        setSaved]      = useState(false);
  const [applied,      setApplied]    = useState(false);
  const [showApply,    setShowApply]  = useState(false);
  const [showToast,    setShowToast]  = useState(false);
  const [loginToast,   setLoginToast] = useState(false);

  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    getJobById(id)
      .then((data) => { if (active) { setJob(data); setLoading(false); } })
      .catch(() => { if (active) { setNotFound(true); setLoading(false); } });
    return () => { active = false; };
  }, [id]);

  // saved jobs check
  useEffect(() => {
    if (!id) return;
    getSavedJobIds()
      .then((ids) => setSaved(ids.includes(id)))
      .catch(() => {});
  }, [id]);

  const handleApplyClick = () => {
    if (!token) {
      setLoginToast(true);
      setTimeout(() => setLoginToast(false), 3000);
    } else {
      // applyToJob mock এ job info পাওয়ার জন্য savedJobs এ temporarily রাখা
      if (job) {
        const jid = job._id || job.id || id;
        try {
          const existing = JSON.parse(localStorage.getItem("savedJobs") || "[]");
          if (!existing.some((j) => (j.id || j._id) === jid)) {
            localStorage.setItem("savedJobs", JSON.stringify([...existing, { ...job, id: jid }]));
          }
        } catch { /* ignore */ }
      }
      setShowApply(true);
    }
  };

  const handleSaveToggle = () => {
    if (!job) return;
    const jid = job._id || job.id || id;
    toggleSaveJob({ ...job, id: jid }, saved)
      .then(() => setSaved((s) => !s))
      .catch(() => alert("Could not update saved jobs. Please try again."));
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--surface2)" }}>
      <Navbar />
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-title">Loading job details...</div>
        </div>
      </div>
    </div>
  );

  if (notFound || !job) return (
    <div style={{ minHeight: "100vh", background: "var(--surface2)" }}>
      <Navbar />
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <div className="empty-title">Job not found</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/jobs')}>
            Back to Find Jobs
          </button>
        </div>
      </div>
    </div>
  );

  const co = job.company;

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface2)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div className="page-container" style={{ flex: 1 }}>
        <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate('/jobs')}>
          ← Back to Jobs
        </button>

        {/* ── Job Hero ── */}
        <div className="job-detail-hero">
          <div className="jdh-top">
            <div className="jdh-logo" style={{ color: co?.logo ? undefined : co?.color || 'var(--accent)' }}>
              {co?.logo ? <img src={co.logo} alt={co.name} /> : co?.initials || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div className="jdh-title">{job.title}</div>
              <div className="jdh-company">{co?.name || 'Unknown'} · {job.location}</div>
              <div className="flex gap-8 mt-8" style={{ flexWrap: 'wrap' }}>
                <span className="badge badge-blue">{job.type || job.jobType}</span>
                {job.category && <span className="badge badge-gray">{job.category}</span>}
                {(() => {
                  const exp = job.experience ?? job.experienceLevel;
                  if (exp === undefined || exp === null || exp === "") return null;
                  const labels = { 0: "Entry Level", 2: "Mid Level", 5: "Senior", 8: "Lead" };
                  const label = labels[Number(exp)] || (isNaN(Number(exp)) ? exp : null);
                  return label ? <span className="badge badge-gray">{label}</span> : null;
                })()}
                {job.location === 'Remote' && <span className="badge badge-green">Remote</span>}
              </div>
            </div>
          </div>

          <div className="jdh-actions">
            {role === "employer" || role === "admin" ? (
              <button className="btn btn-ghost btn-lg" disabled>
                👁 View Only
              </button>
            ) : applied ? (
              <button className="btn btn-primary btn-lg" disabled style={{ opacity: 0.7 }}>
                ✅ Applied!
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleApplyClick}>
                Apply Now →
              </button>
            )}
            <button className="btn btn-ghost" onClick={handleSaveToggle}>
              {saved ? '🔖 Saved' : '🔖 Save'}
            </button>
          </div>
        </div>

        {/* ── Job Detail Grid ── */}
        <div className="job-detail-grid">
          <div>
            <div className="card mb-16">
              <div className="job-stats-grid">
                <div className="stat-item">
                  <div className="stat-lbl">Salary</div>
                  <div className="stat-val">{job.salary || "Negotiable"}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-lbl">Applicants</div>
                  <div className="stat-val">{job.applications?.length ?? job.applicantsCount ?? 0}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-lbl">Deadline</div>
                  <div className="stat-val">{job.deadline || 'Open'}</div>
                </div>
              </div>

              <h3 className="section-h3">About the Role</h3>
              <p className="job-desc">{job.description}</p>

              {job.requirements?.length > 0 && (
                <>
                  <h3 className="section-h3">Requirements</h3>
                  <ul className="req-list">
                    {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </>
              )}

              {job.skills?.length > 0 && (
                <>
                  <h3 className="section-h3">Skills</h3>
                  <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                    {job.skills.map((s) => <span key={s} className="badge badge-blue">{s}</span>)}
                  </div>
                </>
              )}
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
              {co?.location && <div className="co-side-location">{co.location}</div>}
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

      {/* ── Login Toast ── */}
      {loginToast && (
        <div
          style={{
            position: "fixed", bottom: "32px", right: "32px", zIndex: 2000,
            background: "#DC2626", color: "#fff",
            padding: "14px 22px", borderRadius: "14px",
            fontSize: "14px", fontWeight: 600,
            boxShadow: "0 8px 32px rgba(220,38,38,0.35)",
            fontFamily: "'Instrument Sans', sans-serif",
            cursor: "pointer", animation: "slideUp 0.3s ease",
          }}
          onClick={() => navigate("/login")}
        >
          🔒 Please log in to apply
        </div>
      )}

      {/* ── Success Toast ── */}
      {showToast && (
        <SuccessToast jobTitle={job.title} onClose={() => setShowToast(false)} />
      )}

      {/* ── Apply Modal ── */}
      {showApply && (
        <ApplyModal
          job={job}
          onClose={() => setShowApply(false)}
          onSuccess={() => {
            setShowApply(false);
            setApplied(true);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
          }}
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