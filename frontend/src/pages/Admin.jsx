import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getOverview,
  getUsers,
  getUserDetail,
  suspendUser,
  unsuspendUser,
  deleteUser,
  getAllJobsAdmin,
  adminToggleJobStatus,
  flagJob,
  unflagJob,
  adminDeleteJob,
  getAllCompaniesAdmin,
  getActivityLog,
  clearActivityLog,
} from "../services/adminService";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const w = Math.floor(days / 7);
  return `${w} week${w > 1 ? "s" : ""} ago`;
}

const NAV_ITEMS = [
  { group: "Overview",        tab: "overview",  label: "📊 Dashboard" },
  { group: "Overview",        tab: "activity",  label: "📋 Activity Log" },
  { group: "User Management", tab: "seekers",   label: "👤 Job Seekers" },
  { group: "User Management", tab: "employers", label: "🏢 Employers" },
  { group: "Content",         tab: "jobs",      label: "💼 All Job Posts" },
  { group: "Content",         tab: "companies", label: "🏭 Companies" },
  { group: "Security",        tab: "reports",   label: "🚩 Reports & Flags" },
];

const ICON_CLASS = { user: "blue", job: "green", delete: "red", flag: "amber", status: "blue" };

export default function Admin() {
  const navigate = useNavigate();
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // per-tab data
  const [overview, setOverview]   = useState(null);
  const [activity, setActivity]   = useState([]);
  const [seekers, setSeekers]     = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobs, setJobs]           = useState([]);
  const [companies, setCompanies] = useState([]);

  const [search, setSearch]           = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refresh = () => setRefreshKey((k) => k + 1);

  // ── access control ──────────────────────────────────────────────────────────
  useEffect(() => {
    const role  = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (!token || role !== "admin") {
      setAccessDenied(true);
      showToast("Access denied", "error");
      setTimeout(() => navigate("/"), 800);
    }
  }, [navigate]);

  // ── fetch data for active tab ───────────────────────────────────────────────
  const load = useCallback(async () => {
    if (accessDenied) return;
    setLoading(true);
    try {
      if (activeTab === "overview") setOverview(await getOverview());
      else if (activeTab === "activity") setActivity(await getActivityLog());
      else if (activeTab === "seekers") setSeekers(await getUsers("seeker"));
      else if (activeTab === "employers") setEmployers(await getUsers("employer"));
      else if (activeTab === "jobs") setJobs(await getAllJobsAdmin());
      else if (activeTab === "companies") setCompanies(await getAllCompaniesAdmin());
      else if (activeTab === "reports") {
        const [j, s, e] = await Promise.all([
          getAllJobsAdmin(), getUsers("seeker"), getUsers("employer"),
        ]);
        setJobs(j); setSeekers(s); setEmployers(e);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to load data.", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, accessDenied]);

  useEffect(() => { setSearch(""); load(); }, [activeTab, refreshKey, load]);

  if (accessDenied) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <h2>🛡️ Access denied</h2>
        <p style={{ color: "var(--ink3)" }}>Redirecting…</p>
      </div>
    );
  }

  // ── actions ──────────────────────────────────────────────────────────────────
  const handleView = async (userId) => {
    try {
      const u = await getUserDetail(userId);
      alert(
        `👤 User: ${u.first} ${u.last || ""}\n📧 Email: ${u.email}\n🏷 Role: ${u.role}\n📋 Applications: ${u.appCount ?? "—"}\n🔧 Skills: ${(u.skills || []).join(", ") || "—"}`
      );
    } catch {
      showToast("Could not load user.", "error");
    }
  };

  const handleSuspend = async (userId) => {
    try { await suspendUser(userId); showToast("User suspended.", "info"); refresh(); }
    catch (err) { showToast(err?.response?.data?.message || "Action failed.", "error"); }
  };
  const handleUnsuspend = async (userId) => {
    try { await unsuspendUser(userId); showToast("User restored."); refresh(); }
    catch (err) { showToast(err?.response?.data?.message || "Action failed.", "error"); }
  };
  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Remove user "${name}"?\n\nThis will also remove their job posts and applications.`)) return;
    try { await deleteUser(userId); showToast(`User "${name}" removed.`); refresh(); }
    catch (err) { showToast(err?.response?.data?.message || "Action failed.", "error"); }
  };

  const handleToggleJobStatus = async (jobId) => {
    try { const res = await adminToggleJobStatus(jobId); showToast(`Job ${res.status}.`); refresh(); }
    catch (err) { showToast(err?.response?.data?.message || "Action failed.", "error"); }
  };
  const handleFlag = async (jobId) => {
    const reason = window.prompt('Reason for flagging this job post:\n(Leave blank for "Inappropriate content")') || "Inappropriate content";
    try { await flagJob(jobId, reason); showToast("Job flagged 🚩", "info"); refresh(); }
    catch (err) { showToast(err?.response?.data?.message || "Action failed.", "error"); }
  };
  const handleUnflag = async (jobId) => {
    try { await unflagJob(jobId); showToast("Flag cleared ✅"); refresh(); }
    catch (err) { showToast(err?.response?.data?.message || "Action failed.", "error"); }
  };
  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Remove job post: "${title}"?\n\nThis will also remove all related applications.`)) return;
    try { await adminDeleteJob(jobId); showToast("Job post removed."); refresh(); }
    catch (err) { showToast(err?.response?.data?.message || "Action failed.", "error"); }
  };

  const handleClearActivity = async () => {
    if (!window.confirm("Clear all activity logs?")) return;
    try { await clearActivityLog(); showToast("Activity log cleared."); refresh(); }
    catch (err) { showToast(err?.response?.data?.message || "Action failed.", "error"); }
  };

  // ── filtered lists ──────────────────────────────────────────────────────────
  const kw = search.trim().toLowerCase();
  const filteredSeekers = seekers.filter(u => !kw || `${u.first} ${u.last} ${u.email}`.toLowerCase().includes(kw));
  const filteredEmployers = employers.filter(u => !kw || `${u.first} ${u.last} ${u.email} ${u.company?.name || ""}`.toLowerCase().includes(kw));
  const filteredCompanies = companies.filter(c => !kw || `${c.name} ${c.industry}`.toLowerCase().includes(kw));
  const filteredJobs = jobs.filter(j => {
    if (kw && !`${j.title} ${j.company?.name || ""}`.toLowerCase().includes(kw)) return false;
    if (jobStatusFilter === "flagged") return !!j.flagged;
    if (jobStatusFilter) return j.status === jobStatusFilter;
    return true;
  });
  const flaggedJobs = jobs.filter(j => j.flagged);
  const suspendedUsers = [...seekers, ...employers].filter(u => u.suspended);

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", padding: "8px 14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 8 }}>
            🛡️ Admin Panel
          </div>
          {NAV_ITEMS.reduce((groups, item) => {
            const last = groups[groups.length - 1];
            if (!last || last.group !== item.group) groups.push({ group: item.group, items: [item] });
            else last.items.push(item);
            return groups;
          }, []).map((g) => (
            <React.Fragment key={g.group}>
              <div className="admin-nav-label">{g.group}</div>
              {g.items.map((it) => (
                <button
                  key={it.tab}
                  className={`admin-nav-item ${activeTab === it.tab ? "active" : ""}`}
                  onClick={() => setActiveTab(it.tab)}
                >
                  {it.label}
                </button>
              ))}
            </React.Fragment>
          ))}
          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button className="admin-nav-item" style={{ color: "rgba(255,255,255,0.4)" }} onClick={() => navigate("/")}>
              ← Back to Site
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="admin-main">
          {loading ? (
            <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-title">Loading…</div></div>
          ) : (
            <>
              {activeTab === "overview" && overview && (
                <OverviewTab overview={overview} goTab={setActiveTab} />
              )}
              {activeTab === "activity" && (
                <ActivityTab activity={activity} onClear={handleClearActivity} />
              )}
              {activeTab === "seekers" && (
                <UserTable
                  title="👤 Job Seekers" sub="Manage all registered job seeker accounts"
                  users={filteredSeekers} total={seekers.length} search={search} setSearch={setSearch}
                  columns={["Name", "Email", "Applications", "Actions"]}
                  renderRow={(u) => (
                    <tr key={u.id}>
                      <td><strong>{u.first} {u.last}</strong>{u.suspended && <span className="badge badge-red" style={{ marginLeft: 6 }}>Suspended</span>}</td>
                      <td style={{ color: "var(--ink3)" }}>{u.email}</td>
                      <td><span className="badge badge-blue">{u.appCount ?? 0} apps</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleView(u.id)}>👁 View</button>
                          {u.suspended
                            ? <button className="btn btn-success btn-sm" onClick={() => handleUnsuspend(u.id)}>✅ Restore</button>
                            : <button className="btn btn-ghost btn-sm" onClick={() => handleSuspend(u.id)}>⚠️ Suspend</button>}
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id, u.first)}>🗑 Remove</button>
                        </div>
                      </td>
                    </tr>
                  )}
                  emptyText="No seekers registered yet"
                />
              )}
              {activeTab === "employers" && (
                <UserTable
                  title="🏢 Employers" sub="Manage employer accounts and their job postings"
                  users={filteredEmployers} total={employers.length} search={search} setSearch={setSearch}
                  columns={["Name", "Email", "Company", "Jobs Posted", "Actions"]}
                  renderRow={(u) => (
                    <tr key={u.id}>
                      <td><strong>{u.first} {u.last}</strong>{u.suspended && <span className="badge badge-red" style={{ marginLeft: 6 }}>Suspended</span>}</td>
                      <td style={{ color: "var(--ink3)" }}>{u.email}</td>
                      <td><span className="badge badge-blue">{u.company?.name || u.companyName || "—"}</span></td>
                      <td>{u.jobCount ?? 0} job{u.jobCount !== 1 ? "s" : ""}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleView(u.id)}>👁 View</button>
                          {u.suspended
                            ? <button className="btn btn-success btn-sm" onClick={() => handleUnsuspend(u.id)}>✅ Restore</button>
                            : <button className="btn btn-ghost btn-sm" onClick={() => handleSuspend(u.id)}>⚠️ Suspend</button>}
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id, u.first)}>🗑 Remove</button>
                        </div>
                      </td>
                    </tr>
                  )}
                  emptyText="No employers registered yet"
                />
              )}
              {activeTab === "jobs" && (
                <>
                  <div className="admin-header">
                    <div className="admin-title">💼 All Job Posts</div>
                    <div className="admin-sub">Monitor, approve, or remove job listings ({jobs.length} total)</div>
                  </div>
                  <div className="admin-search-bar">
                    <input className="form-input" placeholder="🔍 Search job title or company..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
                    <select className="form-input form-select" style={{ maxWidth: 160 }} value={jobStatusFilter} onChange={(e) => setJobStatusFilter(e.target.value)}>
                      <option value="">All Status</option>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="flagged">Flagged 🚩</option>
                    </select>
                  </div>
                  <table className="admin-table">
                    <thead><tr><th>Job Title</th><th>Company</th><th>Category</th><th>Status</th><th>Applicants</th><th>Posted</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredJobs.length ? filteredJobs.map((j) => (
                        <tr key={j.id}>
                          <td><strong>{j.title}</strong>{j.flagged && <span className="badge badge-red" style={{ marginLeft: 6 }}>🚩 Flagged</span>}</td>
                          <td>{j.company?.name || "Unknown"}</td>
                          <td><span className="badge badge-gray">{j.category}</span></td>
                          <td><span className={`badge ${j.status === "open" ? "badge-green" : "badge-gray"}`}>{j.status}</span></td>
                          <td>{j.applicants}</td>
                          <td style={{ color: "var(--ink3)", fontSize: 12 }}>{timeAgo(j.postedAt)}</td>
                          <td>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => handleToggleJobStatus(j.id)}>{j.status === "open" ? "Close" : "Reopen"}</button>
                              {j.flagged
                                ? <button className="btn btn-success btn-sm" onClick={() => handleUnflag(j.id)}>✅ Clear Flag</button>
                                : <button className="btn btn-ghost btn-sm" onClick={() => handleFlag(j.id)}>🚩 Flag</button>}
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(j.id, j.title)}>🗑 Remove</button>
                            </div>
                          </td>
                        </tr>
                      )) : <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--ink3)" }}>No jobs found</td></tr>}
                    </tbody>
                  </table>
                </>
              )}
              {activeTab === "companies" && (
                <>
                  <div className="admin-header">
                    <div className="admin-title">🏭 Companies</div>
                    <div className="admin-sub">Overview of all registered companies ({companies.length} total)</div>
                  </div>
                  <div className="admin-search-bar">
                    <input className="form-input" placeholder="🔍 Search company name or industry..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
                  </div>
                  <table className="admin-table">
                    <thead><tr><th>Company</th><th>Industry</th><th>Location</th><th>Active Jobs</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredCompanies.length ? filteredCompanies.map((co) => (
                        <tr key={co.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: co.logo ? "var(--surface2)" : (co.color || "var(--accent)"), border: co.logo ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0, overflow: "hidden" }}>
                                {co.logo
                                  ? <img src={co.logo} alt={co.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  : co.initials}
                              </div>
                              <strong>{co.name}</strong>
                            </div>
                          </td>
                          <td>{co.industry || "—"}</td>
                          <td>{co.location || "—"}</td>
                          <td><span className="badge badge-green">{co.activeJobs} open</span></td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab("jobs")}>💼 Jobs</button>
                              {co.employerId && <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(co.employerId, co.name)}>🗑 Remove</button>}
                            </div>
                          </td>
                        </tr>
                      )) : <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--ink3)" }}>No companies found</td></tr>}
                    </tbody>
                  </table>
                </>
              )}
              {activeTab === "reports" && (
                <ReportsTab
                  flaggedJobs={flaggedJobs} suspendedUsers={suspendedUsers} companiesCount={companies.length || overview?.stats?.companiesCount || 0}
                  onUnflag={handleUnflag} onDeleteJob={handleDeleteJob}
                  onUnsuspend={handleUnsuspend} onDeleteUser={handleDeleteUser}
                />
              )}
            </>
          )}
        </div>
      </div>

      {toast && (
        <div id="toast">
          <div className={`toast-msg toast-${toast.type === "error" ? "error" : toast.type === "info" ? "info" : "success"}`}>
            {toast.msg}
          </div>
        </div>
      )}
    </>
  );
}

// ── Overview tab ────────────────────────────────────────────────────────────────
function OverviewTab({ overview, goTab }) {
  const { stats, recentUsers, recentJobs } = overview;
  return (
    <>
      <div className="admin-header">
        <div className="admin-title">📊 Admin Dashboard</div>
        <div className="admin-sub">Platform overview and key metrics</div>
      </div>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
        <div className="stat-item"><div className="stat-lbl">Job Seekers</div><div className="stat-val blue">{stats.seekers}</div></div>
        <div className="stat-item"><div className="stat-lbl">Employers</div><div className="stat-val green">{stats.employers}</div></div>
        <div className="stat-item"><div className="stat-lbl">Active Jobs</div><div className="stat-val blue">{stats.openJobs}</div></div>
        <div className="stat-item"><div className="stat-lbl">Closed Jobs</div><div className="stat-val">{stats.closedJobs}</div></div>
        <div className="stat-item"><div className="stat-lbl">Applications</div><div className="stat-val green">{stats.totalApps}</div></div>
        <div className="stat-item"><div className="stat-lbl">Companies</div><div className="stat-val">{stats.companiesCount}</div></div>
        {stats.flaggedJobs > 0 && (
          <div className="stat-item" style={{ borderColor: "var(--red)" }}>
            <div className="stat-lbl" style={{ color: "var(--red)" }}>🚩 Flagged Jobs</div>
            <div className="stat-val" style={{ color: "var(--red)" }}>{stats.flaggedJobs}</div>
          </div>
        )}
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div>
          <div className="section-header mb-16"><div className="section-title" style={{ fontSize: 16 }}>Recent Users</div><span className="section-link" onClick={() => goTab("seekers")}>View all →</span></div>
          <div className="admin-table">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={thStyle}>Name</th><th style={thStyle}>Role</th><th style={thStyle}>Email</th>
              </tr></thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={tdStyle}>{u.first} {u.last}</td>
                    <td style={tdStyle}><span className={`badge ${u.role === "employer" ? "badge-blue" : "badge-green"}`}>{u.role}</span></td>
                    <td style={{ ...tdStyle, color: "var(--ink3)" }}>{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="section-header mb-16"><div className="section-title" style={{ fontSize: 16 }}>Recent Job Posts</div><span className="section-link" onClick={() => goTab("jobs")}>View all →</span></div>
          <div className="admin-table">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Title</th><th style={thStyle}>Status</th></tr></thead>
              <tbody>
                {recentJobs.map((j) => (
                  <tr key={j.id}>
                    <td style={tdStyle}>{j.title}</td>
                    <td style={tdStyle}>
                      <span className={`badge ${j.status === "open" ? "badge-green" : "badge-gray"}`}>{j.status}</span>
                      {j.flagged && <span className="badge badge-red" style={{ marginLeft: 4 }}>🚩</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="section-header mb-16"><div className="section-title" style={{ fontSize: 16 }}>Quick Actions</div></div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => goTab("jobs")}>💼 Manage Job Posts</button>
          <button className="btn btn-ghost" onClick={() => goTab("seekers")}>👤 Manage Users</button>
          <button className="btn btn-ghost" onClick={() => goTab("reports")}>🚩 View Reports</button>
          <button className="btn btn-ghost" onClick={() => goTab("activity")}>📋 Activity Log</button>
        </div>
      </div>
    </>
  );
}
const thStyle = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink3)", background: "var(--surface2)", borderBottom: "1px solid var(--border)" };
const tdStyle = { padding: "11px 14px", fontSize: 13, borderBottom: "1px solid var(--border)" };

// ── Activity tab ────────────────────────────────────────────────────────────────
function ActivityTab({ activity, onClear }) {
  return (
    <>
      <div className="admin-header">
        <div className="admin-title">📋 Activity Log</div>
        <div className="admin-sub">Real-time platform activity and admin actions</div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button className="btn btn-ghost btn-sm" onClick={onClear}>🗑 Clear Log</button>
      </div>
      <div className="activity-log">
        {activity.length ? activity.map((item, i) => (
          <div className="activity-item" key={i}>
            <div className={`activity-icon ${ICON_CLASS[item.type] || "blue"}`}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>{item.msg}</div>
              <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2 }}>{timeAgo(item.time)}</div>
            </div>
          </div>
        )) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No activity yet</div>
            <div className="text-muted text-sm">Actions you take will appear here</div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Generic user table ──────────────────────────────────────────────────────────
function UserTable({ title, sub, users, total, search, setSearch, columns, renderRow, emptyText }) {
  return (
    <>
      <div className="admin-header">
        <div className="admin-title">{title}</div>
        <div className="admin-sub">{sub} ({total} total)</div>
      </div>
      <div className="admin-search-bar">
        <input className="form-input" placeholder="🔍 Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
      </div>
      <table className="admin-table">
        <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {users.length ? users.map(renderRow) : (
            <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: 32, color: "var(--ink3)" }}>{emptyText}</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

// ── Reports tab ──────────────────────────────────────────────────────────────────
function ReportsTab({ flaggedJobs, suspendedUsers, companiesCount, onUnflag, onDeleteJob, onUnsuspend, onDeleteUser }) {
  return (
    <>
      <div className="admin-header">
        <div className="admin-title">🚩 Reports &amp; Flags</div>
        <div className="admin-sub">Review flagged content and maintain platform integrity</div>
      </div>

      <div className="card mb-20" style={{ borderLeft: "3px solid var(--accent)" }}>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Syne',sans-serif", marginBottom: 8 }}>Platform Integrity</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
          <div className="card-sm" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--red)", fontFamily: "'Syne',sans-serif" }}>{flaggedJobs.length}</div>
            <div style={{ fontSize: 12, color: "var(--ink3)", marginTop: 4 }}>Flagged Job Posts</div>
          </div>
          <div className="card-sm" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--amber)", fontFamily: "'Syne',sans-serif" }}>{suspendedUsers.length}</div>
            <div style={{ fontSize: 12, color: "var(--ink3)", marginTop: 4 }}>Suspended Users</div>
          </div>
          <div className="card-sm" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--green)", fontFamily: "'Syne',sans-serif" }}>{companiesCount}</div>
            <div style={{ fontSize: 12, color: "var(--ink3)", marginTop: 4 }}>Active Companies</div>
          </div>
        </div>
      </div>

      <div className="section-title mb-16" style={{ fontSize: 16 }}>🚩 Flagged Job Posts</div>
      {flaggedJobs.length ? (
        <table className="admin-table mb-24">
          <thead><tr><th>Job Title</th><th>Company</th><th>Reason</th><th>Actions</th></tr></thead>
          <tbody>
            {flaggedJobs.map((j) => (
              <tr key={j.id}>
                <td><strong>{j.title}</strong></td>
                <td>{j.company?.name || "Unknown"}</td>
                <td><span className="badge badge-red">{j.flagReason || "Inappropriate content"}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-success btn-sm" onClick={() => onUnflag(j.id)}>✅ Clear Flag</button>
                    <button className="btn btn-danger btn-sm" onClick={() => onDeleteJob(j.id, j.title)}>🗑 Remove Post</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state mb-24"><div className="empty-icon">✅</div><div className="empty-title">No flagged job posts</div><div className="text-muted text-sm">All job posts look clean</div></div>
      )}

      <div className="section-title mb-16" style={{ fontSize: 16 }}>⚠️ Suspended Users</div>
      {suspendedUsers.length ? (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {suspendedUsers.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.first} {u.last}</strong></td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === "employer" ? "badge-blue" : "badge-green"}`}>{u.role}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-success btn-sm" onClick={() => onUnsuspend(u.id)}>✅ Restore</button>
                    <button className="btn btn-danger btn-sm" onClick={() => onDeleteUser(u.id, u.first)}>🗑 Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">No suspended users</div><div className="text-muted text-sm">All users are in good standing</div></div>
      )}

      <div className="card mt-20" style={{ borderLeft: "3px solid var(--amber)" }}>
        <div style={{ fontWeight: 700, fontFamily: "'Syne',sans-serif", marginBottom: 12 }}>🛡️ Admin Guidelines</div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Remove fake or misleading job postings immediately",
            "Verify employer accounts before approving bulk posts",
            "Protect job seeker data and privacy at all times",
            "Monitor for duplicate or spam accounts",
            "Respond to user reports within 24 hours",
          ].map((t) => (
            <li key={t} style={{ fontSize: 13, color: "var(--ink2)", paddingLeft: 16, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "var(--accent)" }}>→</span>{t}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
