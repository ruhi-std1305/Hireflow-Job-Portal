import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ProfilePage() {
  const navigate  = useNavigate();
  const role      = localStorage.getItem("role") || "seeker";
  const email     = localStorage.getItem("email") || "";

  const fullName  = localStorage.getItem("name") || "";
  const nameParts = fullName.trim().split(" ");
  const initFirst = nameParts[0] || "";
  const initLast  = nameParts.slice(1).join(" ") || "";

  const [first,      setFirst]      = useState(initFirst);
  const [last,       setLast]       = useState(initLast);
  const [title,      setTitle]      = useState(localStorage.getItem("title")    || "");
  const [location,   setLocation]   = useState(localStorage.getItem("location") || "");
  const [bio,        setBio]        = useState(localStorage.getItem("bio")      || "");
  const [skills,     setSkills]     = useState(localStorage.getItem("skills")   || "");
  const [resumeName, setResumeName] = useState(localStorage.getItem("resumeName") || null);
  const [saved,      setSaved]      = useState(false);

  const initials = ((first[0] || "") + (last[0] || "")).toUpperCase() || "U";

  const handleSave = () => {
    const fullname = `${first.trim()} ${last.trim()}`.trim();
    localStorage.setItem("name",     fullname);
    localStorage.setItem("title",    title);
    localStorage.setItem("location", location);
    localStorage.setItem("bio",      bio);
    localStorage.setItem("skills",   skills);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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

  // Employer: redirect to employer dashboard
  if (role === "employer") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--surface2)", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div className="page-container" style={{ flex: 1 }}>
          <div className="page-title">My Profile</div>
          <div className="card" style={{ marginTop: 8 }}>
            <p style={{ color: "var(--ink2)", fontSize: 14 }}>
              Manage your company profile from the{" "}
              <span
                style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}
                onClick={() => navigate("/employer-dashboard")}
              >
                Employer Dashboard →
              </span>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Admin: show admin badge
  if (role === "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--surface2)", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div className="page-container" style={{ flex: 1 }}>
          <div className="page-title">My Profile</div>
          <div className="card" style={{ marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20, color: "#fff", fontFamily: "'Syne', sans-serif" }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{fullName}</div>
                <span className="badge badge-red" style={{ marginTop: 8 }}>🛡️ Administrator</span>
              </div>
            </div>
            <p style={{ color: "var(--ink2)", fontSize: 14 }}>
              You are logged in as the platform administrator. Manage the platform from the{" "}
              <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/admin")}>
                Admin Panel →
              </span>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Job Seeker profile page
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface2)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div className="page-container" style={{ flex: 1 }}>
        <div className="page-title">My Profile</div>
        <div className="page-sub" style={{ marginBottom: 24 }}>Manage your personal info and resume</div>

        {/* Success toast */}
        {saved && (
          <div style={{
            background: "var(--green)", color: "#fff", padding: "10px 18px",
            borderRadius: "var(--r-md)", fontSize: 14, fontWeight: 600,
            marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            ✓ Profile saved successfully
          </div>
        )}

        <div className="grid-2">
          {/* ── Left: Personal Info ───────────────────────── */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>Personal Info</h3>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">First name</label>
                  <input className="form-input" value={first} onChange={(e) => setFirst(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last name</label>
                  <input className="form-input" value={last} onChange={(e) => setLast(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job title</label>
                <input
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Chittagong, Bangladesh"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell employers about yourself..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills (comma separated)</label>
                <input
                  className="form-input"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node.js, MongoDB..."
                />
              </div>

              <button className="btn btn-primary" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>

          {/* ── Right: Resume + Account ───────────────────── */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>Resume</h3>

              {resumeName && (
                <div className="card-sm" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 24 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div className="fw-600 text-sm">{resumeName}</div>
                    <div className="text-xs text-muted">Current resume</div>
                  </div>
                  <button className="btn btn-success btn-sm" onClick={handleResumeDownload}>⬇</button>
                </div>
              )}

              <div className="upload-zone" onClick={() => document.getElementById("pfResumeInput").click()}>
                <div className="upload-icon">📎</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink2)" }}>
                  {resumeName ? "Update resume" : "Upload resume"}
                </div>
                <div className="text-sm text-muted mt-8">PDF, DOC, DOCX · Max 5MB</div>
                <input
                  type="file"
                  id="pfResumeInput"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontFamily: "'Syne', sans-serif", marginBottom: 12 }}>Account</h3>
              <div className="text-sm text-muted" style={{ marginBottom: 8 }}>
                Email: <strong>{email}</strong>
              </div>
              <span className="badge badge-blue">Job Seeker</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}