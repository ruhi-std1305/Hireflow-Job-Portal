import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getJobs }      from "../services/jobService";
import { getCompanies } from "../services/companyService";
import { getApplicationsCount } from "../services/applicationService";
import { getSavedJobIds, toggleSaveJob } from "../services/savedJobService";

const quickTags = ["Software Engineer", "Product Manager", "UX Designer", "Data Scientist", "Remote"];

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

// ─── HERO ────────────────────────────────────────────────────
function Hero({ onSearch, onQuickTag, jobCount, companyCount, applicationCount }) {
  const [keyword,  setKeyword]  = useState("");
  const [location, setLocation] = useState("");
  const handleKey = (e) => { if (e.key === "Enter") onSearch(keyword, location); };

  return (
    <section style={hero.section}>
      <div style={hero.glow1} />
      <div style={hero.glow2} />
      <div style={hero.content}>
        <p style={hero.eyebrow}>🚀 Now Hiring Everywhere</p>
        <h1 style={hero.h1}>
          Land your dream Job<br />
          with <span style={hero.gradient}>HireFlow</span>
        </h1>
        <p style={hero.sub}>
          Browse thousands of jobs from top companies. Your next career move is one search away.
        </p>

        <div style={hero.searchBox}>
          <input
            style={hero.input}
            placeholder="Job title"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKey}
          />
          <div style={hero.divider} />
          <input
            style={{ ...hero.input, flex: "none", width: "180px" }}
            placeholder="📍 City or remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKey}
          />
          <button style={hero.searchBtn} onClick={() => onSearch(keyword, location)}>
            Search Jobs
          </button>
        </div>

        <div style={hero.tags}>
          {quickTags.map((tag) => (
            <button
              key={tag}
              style={hero.tag}
              onClick={() => onQuickTag(tag)}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: "rgba(26,92,255,0.3)", color: "#fff" })}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" })}
            >{tag}</button>
          ))}
        </div>

        <div style={hero.stats}>
          {[
            { val: jobCount,     label: "Active Jobs"   },
            { val: companyCount, label: "Companies"     },
            { val: applicationCount, label: "Applications"  },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <strong style={hero.statVal}>{val}</strong>
              <span style={hero.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const hero = {
  section:   { background: "linear-gradient(135deg,#0D0D12 0%,#1a1a2e 50%,#0D0D12 100%)", color: "#fff", padding: "72px 24px", textAlign: "center", position: "relative", overflow: "hidden" },
  glow1:     { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%,rgba(26,92,255,0.15) 0%,transparent 60%)", pointerEvents: "none" },
  glow2:     { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 30%,rgba(14,159,110,0.10) 0%,transparent 50%)", pointerEvents: "none" },
  content:   { position: "relative", maxWidth: "760px", margin: "0 auto" },
  eyebrow:   { fontSize: "12px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "16px" },
  h1:        { fontFamily: "'Syne',sans-serif", fontSize: "clamp(32px,5vw,58px)", fontWeight: 700, lineHeight: 1.08, marginBottom: "18px", letterSpacing: "-1px" },
  gradient:  { background: "linear-gradient(90deg,#1A5CFF,#0E9F6E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  sub:       { fontSize: "16px", color: "rgba(255,255,255,0.65)", marginBottom: "36px", maxWidth: "500px", marginLeft: "auto", marginRight: "auto" },
  searchBox: { display: "flex", background: "#fff", borderRadius: "16px", overflow: "hidden", maxWidth: "640px", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" },
  input:     { flex: 1, padding: "14px 18px", border: "none", outline: "none", fontSize: "15px", fontFamily: "'Instrument Sans',sans-serif", color: "#0D0D12", background: "transparent", minWidth: 0 },
  divider:   { width: "1px", background: "#E2E0DA", margin: "10px 0" },
  searchBtn: { padding: "10px 24px", margin: "6px", background: "#1A5CFF", color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Instrument Sans',sans-serif", flexShrink: 0 },
  tags:      { display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" },
  tag:       { padding: "5px 12px", borderRadius: "20px", fontSize: "12px", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Instrument Sans',sans-serif" },
  stats:     { display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" },
  statVal:   { display: "block", fontFamily: "'Syne',sans-serif", fontSize: "28px", fontWeight: 700 },
  statLabel: { fontSize: "12px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" },
};

// ─── BADGE ───────────────────────────────────────────────────
function Badge({ children, blue, green }) {
  const bg    = blue ? "#EEF3FF" : green ? "#E6F9F1" : "#EEECEA";
  const color = blue ? "#1A5CFF" : green ? "#065F46" : "#3A3A4C";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px", background: bg, color, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

// ─── JOB CARD ────────────────────────────────────────────────
function HomeJobCard({ job, saved, onToggleSave }) {
  const [hov, setHov] = useState(false);
  const navigate = useNavigate();

  // job.company is a populated object: { name, logo, initials, color, ... }
  const co  = job.company || {};
  const jid = job.id || job._id || "";

  return (
    <div
      style={{ ...jc.card, ...(job.featured ? jc.featured : {}), ...(hov ? jc.hover : {}) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => navigate(`/jobs/${jid}`)}
    >
      <button
        style={{ ...jc.saveBtn, color: saved ? "#1A5CFF" : "#7A7A8C" }}
        onClick={(e) => { e.stopPropagation(); onToggleSave(jid); }}
      >🔖</button>

      <div style={jc.top}>
        <div style={{
          ...jc.logo,
          background: co.logo ? "#F6F5F2" : (co.color || "#EEF3FF"),
          color: co.logo ? "inherit" : (co.color ? "#fff" : "#1A5CFF"),
          padding: co.logo ? 0 : undefined,
          overflow: "hidden",
        }}>
          {co.logo
            ? <img src={co.logo} alt={co.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
            : <span>{co.initials || (co.name || "?").slice(0, 2).toUpperCase()}</span>
          }
        </div>
        <div>
          {job.featured && <span style={jc.featBadge}>✦ Featured</span>}
          <div style={jc.title}>{job.title}</div>
          <div style={jc.company}>{co.name || "Unknown"} · {job.location}</div>
        </div>
      </div>

      <div style={jc.badges}>
        <Badge blue>{job.type || job.jobType}</Badge>
        {job.location === "Remote" && <Badge green>Remote</Badge>}
        {(() => {
          const exp = job.experience ?? job.experienceLevel;
          if (!exp && exp !== 0) return null;
          const labels = { 0: "Entry Level", 2: "Mid Level", 5: "Senior", 8: "Lead" };
          const label  = labels[Number(exp)] || (isNaN(Number(exp)) ? exp : null);
          return label ? <Badge>{label}</Badge> : null;
        })()}
        {(job.skills || []).slice(0, 2).map((s) => <Badge key={s}>{s}</Badge>)}
      </div>

      <div style={jc.footer}>
        <span style={jc.salary}>{job.salary}</span>
        <span style={jc.meta}>Posted {timeAgo(job.postedAt || job.createdAt)}</span>
      </div>
    </div>
  );
}

const jc = {
  card:      { background: "#fff", border: "1px solid #E2E0DA", borderRadius: "16px", padding: "20px 22px", position: "relative", transition: "all 0.18s", cursor: "pointer" },
  hover:     { borderColor: "#1A5CFF", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", transform: "translateY(-1px)" },
  featured:  { borderLeft: "3px solid #1A5CFF" },
  saveBtn:   { position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", fontSize: "18px", padding: "4px" },
  top:       { display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "12px" },
  logo:      { width: "44px", height: "44px", borderRadius: "10px", background: "#F6F5F2", border: "1px solid #E2E0DA", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", flexShrink: 0, fontFamily: "'Syne',sans-serif" },
  featBadge: { display: "inline-block", background: "#EEF3FF", color: "#1A5CFF", fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px", marginBottom: "4px" },
  title:     { fontFamily: "'Syne',sans-serif", fontSize: "15px", fontWeight: 700, color: "#0D0D12", marginBottom: "2px" },
  company:   { fontSize: "13px", color: "#7A7A8C" },
  badges:    { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" },
  footer:    { display: "flex", justifyContent: "space-between", alignItems: "center" },
  salary:    { fontSize: "14px", fontWeight: 600, color: "#0D0D12" },
  meta:      { fontSize: "11px", color: "#7A7A8C" },
};

// ─── FEATURED JOBS SECTION ───────────────────────────────────
function FeaturedJobs({ jobs, savedJobs, onToggleSave, onViewAll }) {
  // featured jobs first, noyto recent 6
  const featured = jobs.filter((j) => j.featured && j.status === "open");
  const display  = featured.length > 0 ? featured.slice(0, 6) : jobs.filter((j) => j.status === "open").slice(0, 6);

  if (display.length === 0) return null;

  return (
    <section style={{ marginBottom: "40px" }}>
      <div style={sec.header}>
        <h2 style={sec.title}>Featured Jobs</h2>
        <button style={sec.link} onClick={onViewAll}>View all →</button>
      </div>
      <div style={sec.grid}>
        {display.map((job) => (
          <HomeJobCard
            key={job.id || job._id}
            job={job}
            saved={savedJobs.includes(job.id || job._id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </section>
  );
}

// ─── TOP COMPANIES SECTION ───────────────────────────────────
function TopCompanies({ companies, onViewAll }) {
  const display = companies.slice(0, 6);
  if (display.length === 0) return null;

  return (
    <section style={{ marginBottom: "40px" }}>
      <div style={sec.header}>
        <h2 style={sec.title}>Top Companies Hiring</h2>
        <button style={sec.link} onClick={onViewAll}>See all →</button>
      </div>
      <div style={sec.coGrid}>
        {display.map((co) => <HomeCompanyCard key={co.id || co._id} co={co} />)}
      </div>
    </section>
  );
}

function HomeCompanyCard({ co }) {
  const [hov, setHov] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      style={{ ...sec.coCard, ...(hov ? sec.coHover : {}) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => navigate(`/companies/${co.id || co._id}`)}
    >
      <div style={{
        ...sec.coLogo,
        background: co.logo ? "#F6F5F2" : (co.color || "#EEF3FF"),
        color: co.logo ? "inherit" : (co.color ? "#fff" : "#1A5CFF"),
        padding: co.logo ? 0 : undefined,
        overflow: "hidden",
      }}>
        {co.logo
          ? <img src={co.logo} alt={co.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "14px" }} />
          : <span>{co.initials || (co.name || "?").slice(0, 2).toUpperCase()}</span>
        }
      </div>
      <div style={sec.coName}>{co.name}</div>
      <div style={sec.coInd}>{co.industry}</div>
      <div style={sec.coLoc}>📍 {co.location || "Bangladesh"}</div>
    </div>
  );
}

const sec = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" },
  title:  { fontFamily: "'Syne',sans-serif", fontSize: "20px", fontWeight: 700, color: "#0D0D12" },
  link:   { fontSize: "13px", color: "#1A5CFF", cursor: "pointer", fontWeight: 600, background: "none", border: "none", fontFamily: "'Instrument Sans',sans-serif" },
  grid:   { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "14px" },
  coGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "16px" },
  coCard: { background: "#fff", border: "1px solid #E2E0DA", borderRadius: "16px", padding: "22px", textAlign: "center", cursor: "pointer", transition: "all 0.18s" },
  coHover:{ borderColor: "#1A5CFF", transform: "translateY(-2px)", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" },
  coLogo: { width: "64px", height: "64px", borderRadius: "14px", background: "#F6F5F2", border: "1px solid #E2E0DA", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "20px", margin: "0 auto 14px", fontFamily: "'Syne',sans-serif" },
  coName: { fontFamily: "'Syne',sans-serif", fontSize: "15px", fontWeight: 700, color: "#0D0D12", marginBottom: "4px" },
  coInd:  { fontSize: "13px", color: "#7A7A8C", marginBottom: "6px" },
  coLoc:  { fontSize: "12px", color: "#7A7A8C" },
};

// ─── MAIN ────────────────────────────────────────────────────
export default function HomePage() {
  const routerNavigate = useNavigate();

  const [jobs,      setJobs]      = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    // Jobs load — status:open, featuredগুলো আগে
    getJobs({}).then((data) => {
      const sorted = [...data].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      setJobs(sorted);
    }).catch(() => {});

    // Companies load
    getCompanies("").then((data) => {
      setCompanies(data);
    }).catch(() => {});

    // Applications count load
    getApplicationsCount().then((count) => {
      setApplicationCount(count);
    }).catch(() => {});

    // Saved job ids load
    getSavedJobIds().then(setSavedJobs).catch(() => {});
  }, []);

  const handleToggleSave = (id) => {
    const job = jobs.find((j) => (j.id || j._id) === id);
    const alreadySaved = savedJobs.includes(id);

    toggleSaveJob({ ...job, id }, alreadySaved)
      .then(() => {
        setSavedJobs((prev) =>
          alreadySaved ? prev.filter((x) => x !== id) : [...prev, id]
        );
      })
      .catch(() => alert("Could not update saved jobs. Please try again."));
  };

  const handleSearch = (kw, loc) => {
    const params = new URLSearchParams();
    if (kw)  params.set("keyword", kw);
    if (loc) params.set("location", loc);
    routerNavigate(`/jobs?${params.toString()}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F6F5F2", fontFamily: "'Instrument Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}`}</style>

      <Navbar />

      <Hero
        onSearch={handleSearch}
        onQuickTag={(tag) => handleSearch(tag, "")}
        jobCount={jobs.filter((j) => j.status === "open").length}
        companyCount={companies.length}
        applicationCount={applicationCount}
      />

      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "32px 24px", width: "100%" }}>
        <FeaturedJobs
          jobs={jobs}
          savedJobs={savedJobs}
          onToggleSave={handleToggleSave}
          onViewAll={() => routerNavigate("/jobs")}
        />
        <TopCompanies
          companies={companies}
          onViewAll={() => routerNavigate("/companies")}
        />
      </div>

      <Footer />
    </div>
  );
}