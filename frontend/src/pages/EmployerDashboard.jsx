import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getEmployerJobs,
  getApplicantsByJob,
  updateApplicationStatus,
  postJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
} from "../services/applicationService";
import { saveEmployerCompanyProfile, getMyCompany } from "../services/companyService";

const STATUS_OPTIONS = ["pending", "reviewing", "shortlisted", "rejected", "hired"];
const STATUS_STYLE = {
  pending:     { bg: "#F6F5F2", color: "#3A3A4C" },
  reviewing:   { bg: "#EEF3FF", color: "#1A5CFF" },
  shortlisted: { bg: "#FEF3C7", color: "#92400E" },
  rejected:    { bg: "#FEE2E2", color: "#991B1B" },
  hired:       { bg: "#E6F9F1", color: "#065F46" },
};

// ─── Applicant Row ─────────────────────────────────────────────────────────────
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
    } catch { alert("Status update failed."); }
    finally { setLoading(false); }
  };

  const st = STATUS_STYLE[status] || STATUS_STYLE.pending;

  return (
    <>
      <tr>
        <td>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{applicant.name}</div>
          <div style={{ fontSize: 12, color: "var(--ink3)" }}>{applicant.email}</div>
        </td>
        <td style={{ fontSize: 13, color: "var(--ink2)" }}>{applicant.location || "—"}</td>
        <td style={{ fontSize: 13, color: "var(--ink2)" }}>{applicant.experience || "—"}</td>
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
            style={{ padding: "5px 8px", border: "1.5px solid var(--border)", borderRadius: "var(--r-sm)", fontSize: 12, cursor: "pointer" }}
            value={status} onChange={handleChange} disabled={loading}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
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
            <div style={{ background: "var(--surface2)", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink3)", marginBottom: 6 }}>COVER LETTER</div>
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

// ─── Applicants Panel (demo র মতো inline view) ────────────────────────────────
function ApplicantsPanel({ job, onBack }) {
  const [applicants, setApplicants] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    getApplicantsByJob(job.id || job._id).then((data) => {
      setApplicants(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [job]);

  return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={onBack}>
        ← Back to Job Listings
      </button>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontFamily: "'Syne', sans-serif", fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
          Applicants for "{job.title}"
          <span style={{ background: "var(--accent-pale)", color: "var(--accent)", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>
            {applicants.length}
          </span>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--ink3)" }}>Loading...</div>
        ) : applicants.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-icon">📭</div>
            <div className="empty-title">No applicants yet</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table" style={{ borderRadius: 0, border: "none" }}>
              <thead>
                <tr>
                  <th>Applicant</th><th>Location</th><th>Experience</th>
                  <th>Skills</th><th>Status</th><th>Update</th><th></th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <ApplicantRow
                    key={a.id || a._id}
                    applicant={a}
                    onStatusChange={(id, s) =>
                      setApplicants((prev) => prev.map((ap) => (ap.id === id ? { ...ap, status: s } : ap)))
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Post Job Modal ────────────────────────────────────────────────────────────
const EMPTY_JOB_FORM = {
  title: "", description: "", requirements: "", salary: "",
  location: "", jobType: "Full-time", experienceLevel: "0", position: "1",
  category: "Technology", deadline: "", skills: "",
};

function PostJobModal({ initialData, onClose, onSubmit }) {
  const isEdit = !!initialData;
  const [form,   setForm]   = useState(() => isEdit ? {
    title:           initialData.title || "",
    description:     initialData.description || "",
    requirements:    Array.isArray(initialData.requirements)
                        ? initialData.requirements.join("\n")
                        : (initialData.requirements || ""),
    salary:          initialData.salary || "",
    location:        initialData.location || "",
    jobType:         initialData.jobType || initialData.type || "Full-time",
    experienceLevel: String(initialData.experienceLevel ?? "0"),
    position:        String(initialData.position ?? "1"),
    category:        initialData.category || "Technology",
    deadline:        initialData.deadline || "",
    skills:          Array.isArray(initialData.skills)
                        ? initialData.skills.join(", ")
                        : (initialData.skills || ""),
  } : EMPTY_JOB_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.location.trim())    e.location    = "Required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await onSubmit({ ...form });
      onClose();
    } catch { alert(isEdit ? "Failed to update job. Please try again." : "Failed to post job. Please try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? "Edit Job" : "Post a Job"}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input className="form-input" placeholder="e.g. Senior Frontend Developer"
              value={form.title} onChange={(e) => update("title", e.target.value)} />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input form-select" value={form.category} onChange={(e) => update("category", e.target.value)}>
              {["Technology","Design","Marketing","Finance","HR","Operations"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <input className="form-input" placeholder="e.g. Dhaka / Remote"
              value={form.location} onChange={(e) => update("location", e.target.value)} />
            {errors.location && <div className="form-error">{errors.location}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Job Type</label>
            <select className="form-input form-select" value={form.jobType} onChange={(e) => update("jobType", e.target.value)}>
              {["Full-time","Part-time","Contract","Internship"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Salary Range</label>
            <input className="form-input" placeholder="e.g. ৳60,000 – ৳90,000/mo"
              value={form.salary} onChange={(e) => update("salary", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input className="form-input" type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Job Description *</label>
          <textarea className="form-input" rows={5}
            placeholder="Describe the role, responsibilities..."
            value={form.description} onChange={(e) => update("description", e.target.value)} />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Requirements <span style={{fontWeight:400,color:"var(--ink3)"}}>(one per line)</span></label>
          <textarea className="form-input" rows={4}
            placeholder={"5+ years React experience\nStrong TypeScript skills"}
            value={form.requirements} onChange={(e) => update("requirements", e.target.value)} />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Skills <span style={{fontWeight:400,color:"var(--ink3)"}}>(comma separated)</span></label>
            <input className="form-input" placeholder="React, TypeScript, Node.js"
              value={form.skills} onChange={(e) => update("skills", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Experience Level</label>
            <select className="form-input form-select" value={form.experienceLevel} onChange={(e) => update("experienceLevel", e.target.value)}>
              <option value="0">Entry Level</option>
              <option value="2">Mid Level</option>
              <option value="5">Senior</option>
              <option value="8">Lead</option>
            </select>
          </div>
        </div>
        <div className="flex gap-12" style={{ marginTop: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : (isEdit ? "Update Job" : "Save Job")}
          </button>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Company Profile Modal (logo upload সহ) ────────────────────────────────────
function CompanyProfileModal({ companyName, initialProfile, onClose, onSave }) {
  const [form, setForm] = useState({
    name:     companyName || "",
    industry: initialProfile?.industry || "",
    location: initialProfile?.location || "",
    website:  initialProfile?.website  || "",
    desc:     initialProfile?.desc     || "",
    logo:     localStorage.getItem("companyLogo") || "",
  });
  const [logoPreview, setLogoPreview] = useState(localStorage.getItem("companyLogo") || "");

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Logo must be under 2MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target.result);
      setForm((f) => ({ ...f, logo: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    // Mock mode: localStorage এ save
    saveEmployerCompanyProfile(form);
    localStorage.setItem("companyName",     form.name);
    localStorage.setItem("companyIndustry", form.industry);
    localStorage.setItem("companyLocation", form.location);
    localStorage.setItem("companyWebsite",  form.website);
    localStorage.setItem("companyDesc",     form.desc);
    if (form.logo) localStorage.setItem("companyLogo", form.logo);

    // Real API mode: backend এ company update
    if (import.meta.env.VITE_USE_MOCK !== "true") {
      try {
        const token     = localStorage.getItem("token");
        const companyId = localStorage.getItem("companyId");
        const BASE      = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const headers   = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
        const body      = JSON.stringify({
          name: form.name, description: form.desc,
          website: form.website, location: form.location, industry: form.industry,
          logo: form.logo || "",
        });

        if (companyId) {
          await fetch(`${BASE}/api/companies/${companyId}`, { method: "PUT", headers, body });
        } else {
          // companyId নেই — নতুন create করো
          const res  = await fetch(`${BASE}/api/companies`, { method: "POST", headers, body: JSON.stringify({ companyName: form.name, description: form.desc, website: form.website, location: form.location, industry: form.industry, logo: form.logo || "" }) });
          const data = await res.json();
          if (data.company) localStorage.setItem("companyId", data.company._id || data.company.id);
        }
      } catch (err) { console.error("Company save error:", err); }
    }

    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Edit Company Profile</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Logo Upload */}
        <div className="form-group">
          <label className="form-label">Company Logo</label>
          <div className="upload-zone" onClick={() => document.getElementById("cpLogoInput").click()}>
            <div className="upload-icon">🖼️</div>
            <div style={{ fontSize: 14, color: "var(--ink2)", fontWeight: 600 }}>
              {logoPreview ? "Click to change logo" : "Click to upload logo"}
            </div>
            <div className="text-sm text-muted mt-8">PNG, JPG · Max 2MB</div>
            <input type="file" id="cpLogoInput" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
          </div>
          {logoPreview && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <img src={logoPreview} alt="Logo preview"
                style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", border: "1px solid var(--border)" }} />
              <button className="btn btn-ghost btn-sm" onClick={() => { setLogoPreview(""); setForm(f => ({...f, logo: ""})); localStorage.removeItem("companyLogo"); }}>
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Company Name</label>
          <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Industry</label>
          <input className="form-input" placeholder="e.g. Software Development"
            value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" placeholder="e.g. Dhaka, Bangladesh"
            value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Website</label>
          <input className="form-input" type="url" placeholder="https://company.com"
            value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={4} placeholder="Describe your company..."
            value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
        </div>

        <div className="flex gap-12" style={{ marginTop: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save Profile</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function EmployerDashboard() {
  const navigate = useNavigate();

  const [companyName,   setCompanyName]   = useState(localStorage.getItem("companyName") || "Your Company");
  const [companyLogo,   setCompanyLogo]   = useState(localStorage.getItem("companyLogo") || "");
  const userName = localStorage.getItem("name") || "Employer";
  const initials = companyName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const [jobs,         setJobs]         = useState([]);
  const [loadingJobs,  setLoadingJobs]  = useState(true);
  const [activeTab,    setActiveTab]    = useState("etab-jobs");
  const [viewingJob,   setViewingJob]   = useState(null); // applicants panel
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob,   setEditingJob]   = useState(null); // non-null হলে modal edit mode এ চলবে
  const [showCoModal,  setShowCoModal]  = useState(false);

  // logged-in employer এর নিজের company data — সবসময় backend থেকে fresh
  const [companyProfile, setCompanyProfile] = useState({
    industry: "", location: "", website: "", desc: "",
  });

  useEffect(() => {
    getEmployerJobs().then((data) => {
      setJobs(Array.isArray(data) ? data : []);
      setLoadingJobs(false);
    }).catch(() => setLoadingJobs(false));

    // company profile fresh fetch — localStorage এর পুরনো data trust করা যাবে না
    getMyCompany().then((company) => {
      if (!company) return;
      setCompanyName(company.name || "Your Company");
      setCompanyLogo(company.logo || "");
      setCompanyProfile({
        industry: company.industry    || "",
        location: company.location    || "",
        website:  company.website     || "",
        desc:     company.description || company.desc || "",
      });
      // localStorage ও fresh রাখা হলো, যাতে অন্য জায়গায় কেউ পুরনো cache না পায়
      localStorage.setItem("companyId",       company.id || company._id || "");
      localStorage.setItem("companyName",     company.name || "");
      localStorage.setItem("companyLogo",     company.logo || "");
      localStorage.setItem("companyIndustry", company.industry    || "");
      localStorage.setItem("companyLocation", company.location    || "");
      localStorage.setItem("companyWebsite",  company.website     || "");
      localStorage.setItem("companyDesc",     company.description || company.desc || "");
    }).catch(() => {
      // company এখনো তৈরি হয়নি — ঠিক আছে, empty profile থাকবে
    });
  }, []);

  const handlePostJob = async (formData) => {
    const companyId = localStorage.getItem("companyId") || undefined;
    const newJob = await postJob({ ...formData, companyId });
    setJobs((prev) => [newJob, ...prev]);
  };

  const handleUpdateJob = async (formData) => {
    const jobId = editingJob.id || editingJob._id;
    await updateJob(jobId, formData);
    const skillsArr = Array.isArray(formData.skills)
      ? formData.skills
      : (formData.skills || "").split(",").map((s) => s.trim()).filter(Boolean);
    const reqArr = Array.isArray(formData.requirements)
      ? formData.requirements
      : (formData.requirements || "").split("\n").map((r) => r.trim()).filter(Boolean);
    setJobs((prev) => prev.map((j) => (j.id || j._id) === jobId ? {
      ...j,
      ...formData,
      type:    formData.jobType,
      jobType: formData.jobType,
      skills:  skillsArr,
      requirements: reqArr,
    } : j));
  };

  const handleDeleteJob = async (job) => {
    const jobId = job.id || job._id;
    if (!window.confirm(`Delete job "${job.title}"? All applications associated with it will also be deleted.`)) return;
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => (j.id || j._id) !== jobId));
      if (viewingJob && (viewingJob.id || viewingJob._id) === jobId) setViewingJob(null);
    } catch { alert("Failed to delete job."); }
  };

  const handleToggleStatus = async (job) => {
    const jobId = job.id || job._id;
    try {
      await toggleJobStatus(jobId, job.status);
      setJobs((prev) => prev.map((j) => (j.id || j._id) === jobId
        ? { ...j, status: j.status === "open" ? "closed" : "open" }
        : j));
    } catch { alert("Failed to update job status."); }
  };

  const coIndustry = companyProfile.industry;
  const coLocation = companyProfile.location;
  const coWebsite  = companyProfile.website;
  const coDesc     = companyProfile.desc;

  const openJobs       = jobs.filter((j) => j.status === "open").length;
  const closedJobs     = jobs.filter((j) => j.status !== "open").length;
  const totalApplicants = jobs.reduce((s, j) => s + (j.applicants || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface2)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div className="dash-container" style={{ flex: 1 }}>

        {/* ── Profile Hero (demo র মতো exact) ── */}
        <div className="profile-hero">
          <div className="profile-avatar-lg" style={{ borderRadius: 14, padding: companyLogo ? 0 : undefined, overflow: "hidden" }}>
            {companyLogo
              ? <img src={companyLogo} alt={companyName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials
            }
          </div>
          <div className="profile-name">{companyName}</div>
          <div className="profile-role">{coIndustry || "Employer"} · {coLocation || userName}</div>
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

        {/* ── Stat Grid ── */}
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
            <div className="stat-val">{closedJobs}</div>
          </div>
        </div>

        {/* ── Tab Bar + Post New Job (demo র মতো same row) ── */}
        <div className="flex justify-between items-center mb-16">
          <div className="tabs" style={{ border: "none", margin: 0 }}>
            <button className={`tab-btn${activeTab === "etab-jobs" ? " active" : ""}`}
              onClick={() => { setActiveTab("etab-jobs"); setViewingJob(null); }}>
              Job Listings
            </button>
            <button className={`tab-btn${activeTab === "etab-company" ? " active" : ""}`}
              onClick={() => { setActiveTab("etab-company"); setViewingJob(null); }}>
              Company Profile
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditingJob(null); setShowJobModal(true); }}>
            + Post New Job
          </button>
        </div>

        {/* ── Tab: Job Listings ── */}
        {activeTab === "etab-jobs" && !viewingJob && (
          loadingJobs ? (
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <div className="empty-title">Loading...</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💼</div>
              <div className="empty-title">No jobs posted yet</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditingJob(null); setShowJobModal(true); }}>
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
                      {job.location} · {job.jobType || job.type} · {job.applicants || 0} applicant{job.applicants !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <span className={`badge ${job.status === "open" ? "badge-green" : "badge-gray"}`}>
                    {job.status === "open" ? "Open" : "Closed"}
                  </span>
                  <div className="manage-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setViewingJob(job)}>
                      👥 Applicants
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingJob(job); setShowJobModal(true); }}>
                      ✏ Edit
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleToggleStatus(job)}>
                      {job.status === "open" ? "Close" : "Reopen"}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(job)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Applicants Panel (Job Listings tab এ inline) ── */}
        {activeTab === "etab-jobs" && viewingJob && (
          <ApplicantsPanel job={viewingJob} onBack={() => setViewingJob(null)} />
        )}

        {/* ── Tab: Company Profile (demo র মতো) ── */}
        {activeTab === "etab-company" && (
          <div className="card">
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div className="co-logo-lg" style={{ color: companyLogo ? undefined : "var(--accent)", overflow: "hidden", padding: companyLogo ? 0 : undefined }}>
                {companyLogo
                  ? <img src={companyLogo} alt={companyName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
                  : initials
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{companyName}</div>
                <div style={{ color: "var(--ink3)", marginTop: 4 }}>
                  {coIndustry || "—"} · {coLocation || "—"}
                </div>
                <div style={{ marginTop: 10, fontSize: 14, color: "var(--ink2)" }}>
                  {coDesc || "No description yet."}
                </div>
                {coWebsite && (
                  <a href={coWebsite} target="_blank" rel="noreferrer"
                    style={{ fontSize: 13, color: "var(--accent)", marginTop: 6, display: "block" }}>
                    {coWebsite}
                  </a>
                )}
              </div>
              <button className="btn btn-primary" onClick={() => setShowCoModal(true)}>
                Edit Profile
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      {showJobModal && (
        <PostJobModal
          initialData={editingJob}
          onClose={() => { setShowJobModal(false); setEditingJob(null); }}
          onSubmit={editingJob ? handleUpdateJob : handlePostJob}
        />
      )}
      {showCoModal && (
        <CompanyProfileModal
          companyName={companyName}
          initialProfile={companyProfile}
          onClose={() => setShowCoModal(false)}
          onSave={(form) => {
            setCompanyName(form.name);
            setCompanyLogo(form.logo || "");
            setCompanyProfile({
              industry: form.industry || "",
              location: form.location || "",
              website:  form.website  || "",
              desc:     form.desc     || "",
            });
          }}
        />
      )}

      <Footer />
    </div>
  );
}