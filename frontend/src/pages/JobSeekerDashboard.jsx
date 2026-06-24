import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar  from "../components/Navbar";
import Footer  from "../components/Footer";
import JobCard from "../components/JobCard";
import { getMyApplications } from "../services/applicationService";

const STATUS_STYLE = {
  pending:     { bg: "#F6F5F2", color: "#3A3A4C", label: "Pending"     },
  reviewing:   { bg: "#EEF3FF", color: "#1A5CFF", label: "Reviewing"   },
  shortlisted: { bg: "#FEF3C7", color: "#92400E", label: "Shortlisted" },
  rejected:    { bg: "#FEE2E2", color: "#991B1B", label: "Rejected"    },
  hired:       { bg: "#E6F9F1", color: "#065F46", label: "Hired"       },
};

function timeAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7)  return `${days} days ago`;
  const w = Math.floor(days / 7);
  return `${w} week${w > 1 ? "s" : ""} ago`;
}

export default function JobSeekerDashboard() {
  const navigate = useNavigate();

  const userName  = localStorage.getItem("name")     || "User";
  const userTitle = localStorage.getItem("title")    || "Job Seeker";
  const userLoc   = localStorage.getItem("location") || "Bangladesh";
  const initials  = userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const [applications, setApplications] = useState([]);
  const [savedJobs,    setSavedJobs]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("tab-apps");
  const [resumeName,   setResumeName]   = useState(localStorage.getItem("resumeName") || null);

  useEffect(() => {
    getMyApplications().then((data) => {
      setApplications(data);
      setLoading(false);
    });

    try {
      const saved = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      setSavedJobs(Array.isArray(saved) ? saved : []);
    } catch {
      setSavedJobs([]);
    }
  }, []);

  const stats = {
    total:       applications.length,
    reviewing:   applications.filter((a) => a.status === "reviewing").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired:       applications.filter((a) => a.status === "hired").length,
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File must be under 5MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      localStorage.setItem("resume",     ev.target.result);
      localStorage.setItem("resumeName", file.name);
      setResumeName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleResumeDownload = () => {
    const data = localStorage.getItem("resume");
    if (!data) return;
    const a = document.createElement("a");
    a.href = data;
    a.download = resumeName || "resume.pdf";
    a.click();
  };

  
  const handleUnsave = (jobId) => {
    const updated = savedJobs.filter((j) => j.id !== jobId);
    setSavedJobs(updated);
    localStorage.setItem("savedJobs", JSON.stringify(updated));
    const ids = updated.map((j) => j.id);
    localStorage.setItem("savedJobIds", JSON.stringify(ids));
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface2)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div className="page-container" style={{ flex: 1 }}>

        {/* ── Profile Hero ────────────────────────────────── */}
        <div className="profile-hero">
          <div className="profile-avatar-lg">{initials}</div>
          <div className="profile-name">{userName}</div>
          <div className="profile-role">{userTitle} · {userLoc}</div>
          <div className="profile-stats">
            <div className="pstat">
              <div className="pstat-val">{stats.total}</div>
              <div className="pstat-lbl">Applied</div>
            </div>
            <div className="pstat">
              <div className="pstat-val">{stats.shortlisted}</div>
              <div className="pstat-lbl">Shortlisted</div>
            </div>
            <div className="pstat">
              <div className="pstat-val">{savedJobs.length}</div>
              <div className="pstat-lbl">Saved</div>
            </div>
          </div>
        </div>

        {/* ── Stat Grid ───────────────────────────────────── */}
        <div className="stat-grid">
          <div className="stat-item">
            <div className="stat-lbl">Total Applications</div>
            <div className="stat-val blue">{stats.total}</div>
          </div>
          <div className="stat-item">
            <div className="stat-lbl">Under Review</div>
            <div className="stat-val amber">{stats.reviewing}</div>
          </div>
          <div className="stat-item">
            <div className="stat-lbl">Shortlisted</div>
            <div className="stat-val green">{stats.shortlisted}</div>
          </div>
          <div className="stat-item">
            <div className="stat-lbl">Saved Jobs</div>
            <div className="stat-val">{savedJobs.length}</div>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────── */}
        <div className="tabs">
          {[
            { id: "tab-apps",   label: "My Applications" },
            { id: "tab-resume", label: "Resume"          },
            { id: "tab-savedj", label: "Saved Jobs"      },
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

        {/* ── Tab: My Applications ────────────────────────── */}
        {activeTab === "tab-apps" && (
          loading ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <div className="empty-title">Loading...</div>
            </div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No applications yet</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/jobs")}>
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {applications.map((app) => {
                const st = STATUS_STYLE[app.status] || STATUS_STYLE.pending;
                return (
                  <div
                    key={app.id}
                    className="applicant-row"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/jobs/${app.jobId}`)}
                  >
                    <div className="co-logo-sm" style={{ color: app.companyColor || "var(--accent)" }}>
                      {app.companyInitials || "?"}
                    </div>
                    <div className="ap-info">
                      <div className="ap-name">{app.jobTitle}</div>
                      <div className="ap-sub">{app.companyName} · Applied {timeAgo(app.appliedAt)}</div>
                    </div>
                    <div className="ap-actions">
                      <span className="badge" style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── Tab: Resume ─────────────────────────────────── */}
        {activeTab === "tab-resume" && (
          <div className="card">
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, marginBottom: 16 }}>
              Resume Management
            </h3>
            {resumeName && (
              <div className="card-sm" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>📄</span>
                <div style={{ flex: 1 }}>
                  <div className="fw-600 text-sm">{resumeName}</div>
                  <div className="text-xs text-muted">Current resume</div>
                </div>
                <button className="btn btn-success btn-sm" onClick={handleResumeDownload}>⬇ Download</button>
                <button className="btn btn-ghost btn-sm" onClick={() => document.getElementById("resumeUpload").click()}>Replace</button>
              </div>
            )}
            <div className="upload-zone" onClick={() => document.getElementById("resumeUpload").click()}>
              <div className="upload-icon">📎</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink2)" }}>
                {resumeName ? "Upload new resume" : "Upload your resume"}
              </div>
              <div className="text-sm text-muted mt-8">PDF or DOCX · Max 5MB</div>
              <input type="file" id="resumeUpload" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: "none" }} />
            </div>
          </div>
        )}

        {/* ── Tab: Saved Jobs ─────────────────────────────── */}
        {activeTab === "tab-savedj" && (
          savedJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔖</div>
              <div className="empty-title">No saved jobs yet</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/jobs")}>
                Browse Jobs
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {savedJobs.map((job) => (
                <JobCard
                  key={job.id || job._id}
                  job={job}
                  saved={true}
                  onToggleSave={() => handleUnsave(job.id || job._id)}
                />
              ))}
            </div>
          )
        )}

      </div>
      <Footer />
    </div>
  );
}