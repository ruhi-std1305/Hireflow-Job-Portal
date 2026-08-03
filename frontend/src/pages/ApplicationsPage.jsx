import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMyApplications } from "../services/applicationService";

const STATUS_STYLE = {
  pending:     { bg: "#F6F5F2", color: "#3A3A4C", label: "Pending"     },
  reviewing:   { bg: "#EEF3FF", color: "#1A5CFF", label: "Reviewing"   },
  shortlisted: { bg: "#FEF3C7", color: "#92400E", label: "Shortlisted" },
  rejected:    { bg: "#FEE2E2", color: "#991B1B", label: "Rejected"    },
  hired:       { bg: "#E6F9F1", color: "#065F46", label: "Hired ✓"    },
};

function timeAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7)  return `${days} days ago`;
  const w = Math.floor(days / 7);
  return `${w} week${w > 1 ? "s" : ""} ago`;
}

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");

  useEffect(() => {
    getMyApplications().then((data) => {
      setApplications(data);
      setLoading(false);
    });
  }, []);

  const STATUS_FILTERS = ["all", "pending", "reviewing", "shortlisted", "rejected", "hired"];

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface2)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div className="page-container" style={{ flex: 1 }}>

        {/* Header */}
        <div className="db-header">
          <div>
            <div className="page-title">My Applications</div>
            <div className="page-sub">Track your job applications and their status</div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/jobs")}>
            Browse Jobs →
          </button>
        </div>

        {/*  */}
        <div className="db-tabs">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`db-tab${filter === s ? " active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== "all" && (
                <span className="db-tab-count">
                  {applications.filter((a) => a.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Applications list */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <div className="empty-title">Loading...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">
                {filter === "all"
                  ? "No applications yet"
                  : `No "${filter}" applications`}
              </div>
              {filter === "all" && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 16 }}
                  onClick={() => navigate("/jobs")}
                >
                  Browse Jobs
                </button>
              )}
            </div>
          ) : (
            filtered.map((app) => {
              const st = STATUS_STYLE[app.status] || STATUS_STYLE.pending;
              return (
                <div
                  key={app.id}
                  className="applicant-row"
                  onClick={() => navigate(`/jobs/${app.jobId}`)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Company logo */}
                  <div
                    className="co-logo-sm"
                    style={{ color: app.companyColor || "var(--accent)" }}
                  >
                    {app.companyInitials || "?"}
                  </div>

                  {/* Info */}
                  <div className="ap-info">
                    <div className="ap-name">{app.jobTitle}</div>
                    <div className="ap-sub">
                      {app.companyName} · {app.location} · Applied {timeAgo(app.appliedAt)}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      <span className="badge badge-gray">{app.jobType}</span>
                      {app.salary && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink2)" }}>
                          {app.salary}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="ap-actions">
                    <span className="badge" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}