import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar  from "../components/Navbar";
import Footer  from "../components/Footer";
import JobCard from "../components/JobCard";
import { getMyApplications } from "../services/applicationService";
import { getSavedJobs, unsaveJob } from "../services/savedJobService";
import { getMyProfile, uploadResume, downloadResume } from "../services/userService";

const STATUS_STYLE = {
  pending:     { bg: "#F6F5F2", color: "#3A3A4C", label: "Pending"     },
  reviewing:   { bg: "#EEF3FF", color: "#1A5CFF", label: "Under Review"},
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

  // নাম/টাইটেল/লোকেশন/রিজিউম — আর localStorage থেকে না, সবসময় backend থেকে
  // fresh fetch করা হয় যাতে অন্য user এর আগের পুরনো data দেখা না যায়
  const [profile, setProfile] = useState({
    id: null, name: localStorage.getItem("name") || "User",
    title: "", location: "", resumeName: null,
  });
  const initials = (profile.name || "User")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const [applications, setApplications] = useState([]);
  const [savedJobs,    setSavedJobs]    = useState([]);
  const [savedIds,     setSavedIds]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("tab-apps");

  useEffect(() => {
    let active = true;
    getMyProfile().then((u) => {
      if (!active) return;
      setProfile({
        id:         u.id || null,
        name:       u.fullname || localStorage.getItem("name") || "User",
        title:      u.title    || "",
        location:   u.location || "",
        resumeName: u.resumeOriginalName || null,
      });
    }).catch(() => {});

    getMyApplications().then((data) => {
      setApplications(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));

    getSavedJobs().then((jobs) => {
      setSavedJobs(jobs);
      setSavedIds(jobs.map((j) => j.id || j._id));
    }).catch(() => {});

    return () => { active = false; };
  }, []);

  // Saved jobs থেকে unsave করা
  const handleUnsave = (jobId) => {
    unsaveJob(jobId)
      .then(() => {
        setSavedJobs((prev) => prev.filter((j) => (j.id || j._id) !== jobId));
        setSavedIds((prev) => prev.filter((id) => id !== jobId));
      })
      .catch(() => alert("Could not remove saved job. Please try again."));
  };

  const stats = {
    total:       applications.length,
    reviewing:   applications.filter((a) => a.status === "reviewing").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    saved:       savedJobs.length,
  };

  const [uploadingResume, setUploadingResume] = useState(false);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File must be under 5MB."); e.target.value = ""; return; }
    setUploadingResume(true);
    try {
      const res = await uploadResume(file);
      setProfile((p) => ({ ...p, resumeName: res.resumeOriginalName || file.name }));
    } catch (err) {
      alert(err?.response?.data?.message || "Could not upload resume. Please try again.");
    } finally {
      setUploadingResume(false);
      e.target.value = "";
    }
  };

  const handleResumeDownload = async () => {
    if (!profile.id) return;
    try {
      await downloadResume(profile.id, profile.resumeName);
    } catch {
      alert("Could not download resume. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface2)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div className="dash-container" style={{ flex: 1 }}>

        {/* ── Profile Hero ── */}
        <div className="profile-hero">
          <div className="profile-avatar-lg">{initials}</div>
          <div className="profile-name">{profile.name}</div>
          <div className="profile-role">{profile.title || "Job Seeker"} · {profile.location || "Bangladesh"}</div>
          <div className="profile-stats">
            <div className="pstat">
              <div className="pstat-val">{stats.total}</div>
              <div className="pstat-lbl">Applied</div>
            </div>
            <div className="pstat">
              <div className="pstat-val">{stats.shortlisted}</div>
              <div className="pstat-lbl">Interviews</div>
            </div>
            <div className="pstat">
              <div className="pstat-val">{stats.saved}</div>
              <div className="pstat-lbl">Saved</div>
            </div>
          </div>
        </div>

        {/* ── Stat Grid ── */}
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
            <div className="stat-lbl">Interviews</div>
            <div className="stat-val green">{stats.shortlisted}</div>
          </div>
          <div className="stat-item">
            <div className="stat-lbl">Saved Jobs</div>
            <div className="stat-val">{stats.saved}</div>
          </div>
        </div>

        {/* ── Tabs ── */}
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

        {/* ── Tab: My Applications ── */}
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
                  <div key={app.id} className="applicant-row">
                    <div className="ap-avatar">
                      {app.companyInitials || "?"}
                    </div>
                    <div className="ap-info">
                      <div className="ap-name">{app.jobTitle || "Job"}</div>
                      <div className="ap-sub">{app.companyName || ""} · Applied {timeAgo(app.appliedAt)}</div>
                    </div>
                    <span className="badge" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── Tab: Resume ── */}
        {activeTab === "tab-resume" && (
          <div className="card">
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, marginBottom: 16 }}>
              Resume Management
            </h3>
            {profile.resumeName && (
              <div className="card-sm flex items-center gap-16 mb-16">
                <span style={{ fontSize: 28 }}>📄</span>
                <div style={{ flex: 1 }}>
                  <div className="fw-600">{profile.resumeName}</div>
                  <div className="text-sm text-muted">Uploaded resume</div>
                </div>
                <button className="btn btn-success btn-sm" onClick={handleResumeDownload}>⬇ Download</button>
                <button className="btn btn-ghost btn-sm" onClick={() => document.getElementById("resumeUpload").click()}>Replace</button>
              </div>
            )}
            <div
              className="upload-zone"
              onClick={() => !uploadingResume && document.getElementById("resumeUpload").click()}
              style={{ opacity: uploadingResume ? 0.6 : 1, pointerEvents: uploadingResume ? "none" : "auto" }}
            >
              <div className="upload-icon">📎</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink2)" }}>
                {uploadingResume ? "Uploading…" : profile.resumeName ? "Upload new resume" : "Upload your resume"}
              </div>
              <div className="text-sm text-muted mt-8">PDF or DOCX · Max 5MB</div>
              <input type="file" id="resumeUpload" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: "none" }} />
            </div>
          </div>
        )}

        {/* ── Tab: Saved Jobs ── */}
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