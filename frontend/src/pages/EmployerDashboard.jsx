import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getEmployerJobs,
  getApplicantsByJob,
  updateApplicationStatus,
  postJob,
} from "../services/applicationService";

const STATUS_OPTIONS = ["pending", "reviewing", "shortlisted", "rejected", "hired"];
const STATUS_STYLE = {
  pending:     { bg: "#F6F5F2", color: "#3A3A4C" },
  reviewing:   { bg: "#EEF3FF", color: "#1A5CFF" },
  shortlisted: { bg: "#FEF3C7", color: "#92400E" },
  rejected:    { bg: "#FEE2E2", color: "#991B1B" },
  hired:       { bg: "#E6F9F1", color: "#065F46" },
};

const EMPTY_JOB_FORM = {
  title:           "",
  description:     "",
  requirements:    "",
  salary:          "",
  location:        "",
  jobType:         "Full-time",
  experienceLevel: "0",
  position:        "1",
};

/* ── Applicant row inside table ────────────────────────────────────────── */
function ApplicantRow({ applicant, onStatusChange }) {
  const [status,   setStatus]   = useState(applicant.status || "pending");
  const [loading,  setLoading]  = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setLoading(true);
    try {
      await updateApplicationStatus(applicant.id, newStatus);
      setStatus(newStatus);
      onStatusChange?.(applicant.id, newStatus);
    } catch {
      alert("Status update failed.");
    } finally {
      setLoading(false);
    }
  };

  const st = STATUS_STYLE[status] || STATUS_STYLE.pending;

  return (
    <>
      <tr className="app-table-row">
        <td>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{applicant.name}</div>
          <div style={{ fontSize: 12, color: "var(--ink3)" }}>{applicant.email}</div>
        </td>
        <td style={{ fontSize: 13, color: "var(--ink2)" }}>{applicant.location}</td>
        <td style={{ fontSize: 13, color: "var(--ink2)" }}>{applicant.experience}</td>
        <td>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {(applicant.skills || []).slice(0, 3).map((s) => (
              <span key={s} className="badge badge-gray">{s}</span>
            ))}
          </div>
        </td>
        <td>
          <span className="badge" style={{ background: st.bg, color: st.color }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </td>
        <td>
          <select
            className="status-select"
            value={status}
            onChange={handleChange}
            disabled={loading}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </td>
        <td>
          <button className="btn btn-ghost btn-sm" onClick={() => setExpanded((p) => !p)}>
            {expanded ? "Hide" : "Cover Letter"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} style={{ padding: 0 }}>
            <div className="cover-letter-box">
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink3)", marginBottom: 6 }}>
                COVER LETTER
              </div>
              <p style={{ fontSize: 14, color: "var(--ink2)", lineHeight: 1.7, margin: 0 }}>
                {applicant.coverLetter || "No cover letter provided."}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Post Job Modal ────────────────────────────────────────────────────── */
function PostJobModal({ onClose, onSubmit }) {
  const [form,    setForm]    = useState(EMPTY_JOB_FORM);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.salary.trim())      e.salary      = "Salary is required";
    if (!form.location.trim())    e.location    = "Location is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        requirements:    form.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
        salary:          Number(form.salary.replace(/[^0-9]/g, "")),
        experienceLevel: Number(form.experienceLevel),
        position:        Number(form.position),
      });
      onClose();
    } catch {
      alert("Failed to post job. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">Post a New Job</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input
              className="form-input"
              placeholder="e.g. Frontend Developer"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <input
              className="form-input"
              placeholder="e.g. Dhaka"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
            {errors.location && <div className="form-error">{errors.location}</div>}
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Job Type</label>
            <select
              className="form-input form-select"
              value={form.jobType}
              onChange={(e) => update("jobType", e.target.value)}
            >
              {["Full-time", "Part-time", "Contract", "Remote", "Internship"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Salary (BDT) *</label>
            <input
              className="form-input"
              placeholder="e.g. 80000"
              value={form.salary}
              onChange={(e) => update("salary", e.target.value)}
            />
            {errors.salary && <div className="form-error">{errors.salary}</div>}
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Experience Level (years)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              value={form.experienceLevel}
              onChange={(e) => update("experienceLevel", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Open Positions</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={form.position}
              onChange={(e) => update("position", e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Job Description *</label>
          <textarea
            className="form-input"
            rows={4}
            placeholder="Describe the role, responsibilities..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Requirements (one per line)</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder={"3+ years React experience\nStrong communication skills"}
            value={form.requirements}
            onChange={(e) => update("requirements", e.target.value)}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Posting..." : "Post Job"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────── */
export default function EmployerDashboard() {
  const navigate = useNavigate();

  const companyName = localStorage.getItem("companyName") || "Your Company";
  const userName    = localStorage.getItem("name")        || "Employer";
  const initials    = companyName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const [jobs,         setJobs]         = useState([]);
  const [selectedJob,  setSelectedJob]  = useState(null);
  const [applicants,   setApplicants]   = useState([]);
  const [loadingJobs,  setLoadingJobs]  = useState(true);
  const [loadingApps,  setLoadingApps]  = useState(false);
  const [activeTab,    setActiveTab]    = useState("etab-jobs");
  const [showJobModal, setShowJobModal] = useState(false);

  useEffect(() => {
    getEmployerJobs().then((data) => {
      setJobs(data);
      setLoadingJobs(false);
    });
  }, []);

  const loadApplicants = (job) => {
    setSelectedJob(job);
    setActiveTab("etab-applicants");
    setLoadingApps(true);
    getApplicantsByJob(job.id || job._id).then((data) => {
      setApplicants(data);
      setLoadingApps(false);
    });
  };

  const handlePostJob = async (formData) => {
    const newJob = await postJob(formData);
    setJobs((prev) => [newJob, ...prev]);
  };

  const totalApplicants = jobs.reduce((s, j) => s + (j.applicants || 0), 0);
  const openJobs        = jobs.filter((j) => j.status === "open").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface2)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div className="page-container" style={{ flex: 1 }}>

        {/* ── Profile Hero ───────────────────────────────────────── */}
        <div className="profile-hero">
          <div className="profile-avatar-lg" style={{ borderRadius: 14 }}>
            {initials}
          </div>
          <div className="profile-name">{companyName}</div>
          <div className="profile-role">Employer · {userName}</div>
          <div className="profile-stats">
            <div className="pstat">
              <div className="pstat-val">{openJobs}</div>
              <div className="pstat-lbl">Active Jobs</div>
            </div>
            <div className="pstat">
              <div className="pstat-val">{totalApplicants}</div>
              <div className="pstat-lbl">Total Applicants</div>
            </div>
            <div className="pstat">
              <div className="pstat-val">{jobs.length}</div>
              <div className="pstat-lbl">Total Posted</div>
            </div>
          </div>
        </div>

        {/* ── Stat Grid ──────────────────────────────────────────── */}
        <div className="stat-grid">
          <div className="stat-item">
            <div className="stat-lbl">Active Listings</div>
            <div className="stat-val blue">{openJobs}</div>
          </div>
          <div className="stat-item">
            <div className="stat-lbl">Total Applicants</div>
            <div className="stat-val green">{totalApplicants}</div>
          </div>
          <div className="stat-item">
            <div className="stat-lbl">Closed Jobs</div>
            <div className="stat-val">{jobs.filter((j) => j.status === "closed").length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-lbl">Shortlisted</div>
            <div className="stat-val amber">
              {applicants.filter((a) => a.status === "shortlisted").length}
            </div>
          </div>
        </div>

        {/* ── Tab header + Post Job button ───────────────────────── */}
        <div className="flex justify-between items-center" style={{ marginBottom: 0 }}>
          <div className="tabs" style={{ borderBottom: "none", marginBottom: 0 }}>
            {[
              { id: "etab-jobs",       label: "Job Listings"     },
              { id: "etab-applicants", label: "Applicants"       },
            ].map((t) => (
              <button
                key={t.id}
                className={`tab-btn${activeTab === t.id ? " active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowJobModal(true)}>
            + Post New Job
          </button>
        </div>
        <div style={{ borderBottom: "1px solid var(--border)", marginBottom: 20 }} />

        {/* ── Tab: Job Listings (manage-row) ─────────────────────── */}
        <div style={{ display: activeTab === "etab-jobs" ? "block" : "none" }}>
          {loadingJobs ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <div className="empty-title">Loading...</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💼</div>
              <div className="empty-title">No jobs posted yet</div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => setShowJobModal(true)}
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {jobs.map((job) => (
                <div key={job.id || job._id} className="manage-row">
                  <div className="manage-info">
                    <div className="manage-title">{job.title}</div>
                    <div className="manage-sub">
                      {job.location} · {job.jobType || job.type} ·{" "}
                      {job.applicants || 0} applicant{job.applicants !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <span className={`badge ${job.status === "open" ? "badge-green" : "badge-gray"}`}>
                    {job.status === "open" ? "Open" : "Closed"}
                  </span>
                  <div className="manage-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => loadApplicants(job)}
                    >
                      👥 Applicants
                    </button>
                    {job.deadline && (
                      <span style={{ fontSize: 11, color: "var(--ink3)" }}>
                        Deadline: {job.deadline}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Tab: Applicants table ──────────────────────────────── */}
        <div style={{ display: activeTab === "etab-applicants" ? "block" : "none" }}>
          {!selectedJob ? (
            <div className="empty-state">
              <div className="empty-icon">👈</div>
              <div className="empty-title">Select a job from Job Listings to view applicants</div>
            </div>
          ) : (
            <div className="emp-applicants-panel">
              <div className="panel-title" style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                "{selectedJob.title}" — Applicants
                <span style={{
                  background: "var(--accent-pale)", color: "var(--accent)",
                  fontSize: 12, fontWeight: 700, padding: "2px 8px",
                  borderRadius: 12, marginLeft: 8,
                }}>
                  {applicants.length}
                </span>
              </div>

              {loadingApps ? (
                <div style={{ padding: 20, color: "var(--ink3)", fontSize: 13 }}>Loading...</div>
              ) : applicants.length === 0 ? (
                <div className="empty-state" style={{ padding: 40 }}>
                  <div className="empty-icon">📭</div>
                  <div className="empty-title">No one has applied yet</div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="app-table">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Location</th>
                        <th>Experience</th>
                        <th>Skills</th>
                        <th>Status</th>
                        <th>Update</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((a) => (
                        <ApplicantRow
                          key={a.id}
                          applicant={a}
                          onStatusChange={(id, newStatus) => {
                            setApplicants((prev) =>
                              prev.map((ap) => ap.id === id ? { ...ap, status: newStatus } : ap)
                            );
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── Post Job Modal ─────────────────────────────────────────── */}
      {showJobModal && (
        <PostJobModal
          onClose={() => setShowJobModal(false)}
          onSubmit={handlePostJob}
        />
      )}

      <Footer />
    </div>
  );
}