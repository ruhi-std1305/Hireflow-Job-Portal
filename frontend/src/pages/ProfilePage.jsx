import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMyProfile, updateMyProfile, uploadResume, downloadResume } from "../services/userService";
import "../styles/dashboard.css";

export default function ProfilePage() {
  const navigate  = useNavigate();
  const role      = localStorage.getItem("role") || "seeker";

  const [email,       setEmail]       = useState(localStorage.getItem("email") || "");
  const [userId,      setUserId]      = useState(null);
  const [first,       setFirst]       = useState("");
  const [last,        setLast]        = useState("");
  const [title,       setTitle]       = useState("");
  const [location,    setLocation]    = useState("");
  const [bio,         setBio]         = useState("");
  const [skills,      setSkills]      = useState("");
  const [resumeName,  setResumeName]  = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);

  const fullName = `${first} ${last}`.trim();
  const initials = ((first[0] || "") + (last[0] || "")).toUpperCase() || "U";

  // ── ফ্রেশ profile সবসময় backend থেকে load — এতে অন্য user এর data leak হয় না ──
  useEffect(() => {
    if (role !== "seeker") { setLoading(false); return; }
    let active = true;
    getMyProfile()
      .then((u) => {
        if (!active) return;
        const parts = (u.fullname || "").trim().split(" ");
        setFirst(parts[0] || "");
        setLast(parts.slice(1).join(" ") || "");
        setTitle(u.title || "");
        setLocation(u.location || "");
        setBio(u.bio || "");
        setSkills((u.skills || []).join(", "));
        setUserId(u.id || null);
        setResumeName(u.resumeOriginalName || null);
        setEmail(u.email || email);
        localStorage.setItem("name", u.fullname || "");
      })
      .catch(() => {
        if (active) alert("Could not load your profile. Please refresh and try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fullname = `${first.trim()} ${last.trim()}`.trim();
      await updateMyProfile({ fullname, title, location, bio, skills });
      localStorage.setItem("name", fullname);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File must be under 5MB."); e.target.value = ""; return; }
    setUploadingResume(true);
    try {
      const res = await uploadResume(file);
      setResumeName(res.resumeOriginalName || file.name);
    } catch (err) {
      alert(err?.response?.data?.message || "Could not upload resume. Please try again.");
    } finally {
      setUploadingResume(false);
      e.target.value = ""; // same file আবার select করলেও onChange fire করার জন্য
    }
  };

  const handleResumeDownload = async () => {
    if (!userId) return;
    try {
      await downloadResume(userId, resumeName);
    } catch {
      alert("Could not download resume. Please try again.");
    }
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
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{localStorage.getItem("name") || ""}</div>
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

              <div
                className="upload-zone"
                onClick={() => !uploadingResume && document.getElementById("pfResumeInput").click()}
                style={{ opacity: uploadingResume ? 0.6 : 1, pointerEvents: uploadingResume ? "none" : "auto" }}
              >
                <div className="upload-icon">📎</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink2)" }}>
                  {uploadingResume ? "Uploading…" : resumeName ? "Update resume" : "Upload resume"}
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