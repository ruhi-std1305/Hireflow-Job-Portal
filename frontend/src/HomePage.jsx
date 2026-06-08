import { useState } from "react";
import { useNavigate } from "react-router-dom";


// ─── MOCK DATA ───────────────────────────────────────────────
const companies = [
  { id: "co1", name: "Brain Station 23", industry: "Software Development", location: "Dhaka", initials: "BS", color: "#1A5CFF" },
  { id: "co2", name: "Pathao",            industry: "Tech / Mobility",       location: "Dhaka", initials: "PA", color: "#0E9F6E" },
  { id: "co3", name: "bKash",             industry: "Fintech",               location: "Dhaka", initials: "BK", color: "#D97706" },
  { id: "co4", name: "ShopUp",            industry: "E-commerce / B2B",      location: "Dhaka", initials: "SU", color: "#7C3AED" },
  { id: "co5", name: "Robi Axiata",       industry: "Telecommunications",    location: "Dhaka", initials: "RA", color: "#DC2626" },
  { id: "co6", name: "Daraz",             industry: "E-commerce",            location: "Dhaka", initials: "DZ", color: "#F59E0B" },
];

const jobs = [
  { id: "j1", title: "Senior Frontend Developer", companyId: "co1", location: "Dhaka",  type: "Full-time", salary: "৳80,000–120,000/mo", skills: ["React","TypeScript","Next.js"], experience: "Senior",    featured: true,  posted: "2026-04-01" },
  { id: "j2", title: "Product Manager",            companyId: "co2", location: "Dhaka",  type: "Full-time", salary: "৳60,000–90,000/mo",  skills: ["Strategy","Analytics","SQL"],   experience: "Mid Level", featured: true,  posted: "2026-04-02" },
  { id: "j3", title: "Backend Engineer (Node.js)", companyId: "co3", location: "Dhaka",  type: "Full-time", salary: "৳85,000–130,000/mo", skills: ["Node.js","PostgreSQL","AWS"],   experience: "Senior",    featured: false, posted: "2026-04-01" },
  { id: "j4", title: "UX Designer",                companyId: "co5", location: "Dhaka",  type: "Full-time", salary: "৳50,000–75,000/mo",  skills: ["Figma","User Research"],        experience: "Mid Level", featured: false, posted: "2026-04-03" },
  { id: "j5", title: "Data Scientist",             companyId: "co4", location: "Remote", type: "Full-time", salary: "৳70,000–100,000/mo", skills: ["Python","TensorFlow","SQL"],    experience: "Mid Level", featured: true,  posted: "2026-04-02" },
  { id: "j6", title: "Android Developer",          companyId: "co6", location: "Dhaka",  type: "Full-time", salary: "৳65,000–95,000/mo",  skills: ["Kotlin","Android","Firebase"],  experience: "Mid Level", featured: false, posted: "2026-04-03" },
];

const quickTags = ["Software Engineer", "Product Manager", "UX Designer", "Data Scientist", "Remote"];

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

function getCompany(id) {
  return companies.find((c) => c.id === id);
}

// ─── NAVBAR ──────────────────────────────────────────────────
function Navbar({ currentPage, onNavigate, user, onLogin, onSignup, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const links = [
    { id: "home",      label: "Home" },
    { id: "jobs",      label: "Find Jobs" },
    { id: "companies", label: "Companies" },
  ];

  return (
    <nav style={nav.bar}>
      <div style={nav.logo} onClick={() => onNavigate("home")}>
        Hire<span style={{ color: "#1A5CFF" }}>Flow</span>
      </div>

      <div style={nav.links}>
        {links.map((l) => (
          <button
            key={l.id}
            style={{ ...nav.link, ...(currentPage === l.id ? nav.linkActive : {}) }}
            onClick={() => { onNavigate(l.id); setMenuOpen(false); }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div style={nav.right}>
        {!user ? (
          <>
            <button style={nav.ghost}   onClick={onLogin}>Log in</button>
            <button style={nav.primary} onClick={onSignup}>Sign up</button>
          </>
        ) : (
          <div style={{ position: "relative" }}>
            <div
              style={{ ...nav.avatar, background: user.role === "admin" ? "#DC2626" : "#1A5CFF" }}
              onClick={() => setDropOpen((v) => !v)}
            >
              {user.first[0]}{user.last ? user.last[0] : ""}
            </div>
            {dropOpen && (
              <div style={nav.dropdown}>
                <DDItem onClick={() => { onNavigate("dashboard"); setDropOpen(false); }}>📊 Dashboard</DDItem>
                <DDItem onClick={() => { onNavigate("profile");   setDropOpen(false); }}>👤 My Profile</DDItem>
                {user.role === "seeker" && <>
                  <DDItem onClick={() => { onNavigate("saved");        setDropOpen(false); }}>🔖 Saved Jobs</DDItem>
                  <DDItem onClick={() => { onNavigate("applications"); setDropOpen(false); }}>📋 My Applications</DDItem>
                </>}
                {user.role === "admin" && (
                  <DDItem onClick={() => { onNavigate("admin"); setDropOpen(false); }}>🛡️ Admin Panel</DDItem>
                )}
                <div style={{ height: "1px", background: "#E2E0DA" }} />
                <DDItem danger onClick={() => { onLogout(); setDropOpen(false); }}>⬅ Log out</DDItem>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function DDItem({ children, onClick, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      style={{ ...nav.ddItem, background: hov ? "#F6F5F2" : "transparent", color: danger ? "#DC2626" : "#0D0D12" }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >{children}</button>
  );
}

const nav = {
  bar:      { background: "#fff", borderBottom: "1px solid #E2E0DA", padding: "0 24px", height: "62px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" },
  logo:     { fontFamily: "'Syne',sans-serif", fontSize: "22px", fontWeight: 700, color: "#0D0D12", cursor: "pointer", letterSpacing: "-0.5px" },
  links:    { display: "flex", gap: "4px", alignItems: "center" },
  link:     { padding: "7px 14px", borderRadius: "12px", fontSize: "14px", fontWeight: 500, color: "#3A3A4C", cursor: "pointer", border: "none", background: "transparent", fontFamily: "'Instrument Sans',sans-serif" },
  linkActive:{ background: "#F6F5F2", color: "#0D0D12" },
  right:    { display: "flex", gap: "10px", alignItems: "center" },
  ghost:    { padding: "6px 13px", borderRadius: "12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "1.5px solid #E2E0DA", background: "transparent", color: "#0D0D12", fontFamily: "'Instrument Sans',sans-serif" },
  primary:  { padding: "6px 13px", borderRadius: "12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", background: "#1A5CFF", color: "#fff", fontFamily: "'Instrument Sans',sans-serif" },
  avatar:   { width: "36px", height: "36px", borderRadius: "50%", color: "#fff", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  dropdown: { position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #E2E0DA", borderRadius: "16px", minWidth: "180px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", overflow: "hidden", zIndex: 300 },
  ddItem:   { display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", fontSize: "14px", cursor: "pointer", border: "none", width: "100%", textAlign: "left", fontFamily: "'Instrument Sans',sans-serif" },
};

// ─── HERO ────────────────────────────────────────────────────
function Hero({ onSearch, onQuickTag }) {
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
            { val: jobs.length,      label: "Active Jobs"  },
            { val: companies.length, label: "Companies"    },
            { val: 148,              label: "Applications" },
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
function JobCard({ job, saved, onToggleSave }) {
  const [hov, setHov] = useState(false);
  const co = getCompany(job.companyId);

  return (
    <div
      style={{ ...jc.card, ...(job.featured ? jc.featured : {}), ...(hov ? jc.hover : {}) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <button
        style={{ ...jc.saveBtn, color: saved ? "#1A5CFF" : "#7A7A8C" }}
        onClick={(e) => { e.stopPropagation(); onToggleSave(job.id); }}
      >🔖</button>

      <div style={jc.top}>
        <div style={{ ...jc.logo, color: co?.color || "#1A5CFF" }}>{co?.initials || "?"}</div>
        <div>
          {job.featured && <span style={jc.featBadge}>✦ Featured</span>}
          <div style={jc.title}>{job.title}</div>
          <div style={jc.company}>{co?.name} · {job.location}</div>
        </div>
      </div>

      <div style={jc.badges}>
        <Badge blue>{job.type}</Badge>
        {job.location === "Remote" && <Badge green>Remote</Badge>}
        <Badge>{job.experience}</Badge>
        {job.skills.slice(0, 2).map((s) => <Badge key={s}>{s}</Badge>)}
      </div>

      <div style={jc.footer}>
        <span style={jc.salary}>{job.salary}</span>
        <span style={jc.meta}>Posted {timeAgo(job.posted)}</span>
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

// ─── FEATURED JOBS ───────────────────────────────────────────
function FeaturedJobs({ savedJobs, onToggleSave, onViewAll }) {
  const featured = jobs.filter((j) => j.featured);
  return (
    <section style={{ marginBottom: "40px" }}>
      <div style={sec.header}>
        <h2 style={sec.title}>Featured Jobs</h2>
        <button style={sec.link} onClick={onViewAll}>View all →</button>
      </div>
      <div style={sec.grid}>
        {featured.map((job) => (
          <JobCard key={job.id} job={job} saved={savedJobs.includes(job.id)} onToggleSave={onToggleSave} />
        ))}
      </div>
    </section>
  );
}

// ─── TOP COMPANIES ───────────────────────────────────────────
function TopCompanies({ onViewAll }) {
  return (
    <section style={{ marginBottom: "40px" }}>
      <div style={sec.header}>
        <h2 style={sec.title}>Top Companies Hiring</h2>
        <button style={sec.link} onClick={onViewAll}>See all →</button>
      </div>
      <div style={sec.coGrid}>
        {companies.map((co) => <CompanyCard key={co.id} co={co} />)}
      </div>
    </section>
  );
}

function CompanyCard({ co }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ ...sec.coCard, ...(hov ? sec.coHover : {}) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ ...sec.coLogo, color: co.color }}>{co.initials}</div>
      <div style={sec.coName}>{co.name}</div>
      <div style={sec.coInd}>{co.industry}</div>
      <div style={sec.coLoc}>📍 {co.location}</div>
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

// ─── FOOTER ──────────────────────────────────────────────────
function Footer({ onNavigate }) {
  return (
    <footer style={ft.footer}>
      <div style={ft.inner}>
        <div style={ft.topRow}>
          <div>
            <div style={ft.logo}>Hire<span style={{ color: "#1A5CFF" }}>Flow</span></div>
            <p style={ft.tagline}>Connecting top talent with great companies.</p>
          </div>
         <div style={ft.socials}>
  {[
    {
      t: "Twitter/X",
      url: "https://twitter.com",
      svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/></svg>
    },
    {
      t: "LinkedIn",
      url: "https://linkedin.com",
      svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    },
    {
      t: "Facebook",
      url: "https://facebook.com",
      svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    },
    {
      t: "Instagram",
      url: "https://instagram.com",
      svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
    },
  ].map(({ t, url, svg }) => (
    <a key={t} href={url} title={t} target="_blank" rel="noreferrer" style={ft.socialBtn}>
      {svg}
    </a>
  ))}
</div>
        </div>
        <div style={ft.bottom}>
          <span style={ft.copy}>© 2026 HireFlow. All rights reserved.</span>
          <div style={ft.badges}>
            {["🔒 Secure & Trusted", "✅ Verified Employers", "🌍 JobPortal"].map((b) => (
              <span key={b} style={ft.badge}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

const ft = {
  footer:    { background: "#0D0D12", padding: "60px 24px 0", marginTop: "auto" },
  inner:     { maxWidth: "1180px", margin: "0 auto" },
  topRow:    { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", paddingBottom: "32px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  logo:      { fontFamily: "'Syne',sans-serif", fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "12px", letterSpacing: "-0.5px" },
  tagline:   { fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.5)", maxWidth: "260px" },
  socials:   { display: "flex", gap: "10px" },
  socialBtn: { width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "14px", textDecoration: "none", color: "rgba(255,255,255,0.7)", flexShrink: 0 },
  bottom:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", flexWrap: "wrap", gap: "12px" },
  copy:      { fontSize: "13px", color: "rgba(255,255,255,0.35)" },
  badges:    { display: "flex", gap: "10px", flexWrap: "wrap" },
  badge:     { display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)" },
};

// ─── PLACEHOLDER PAGE ────────────────────────────────────────
function PlaceholderPage({ page, onBack }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</div>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "24px", fontWeight: 700, color: "#0D0D12", marginBottom: "8px", textTransform: "capitalize" }}>
        "{page}" page
      </h2>
      <p style={{ color: "#7A7A8C", fontSize: "15px", marginBottom: "24px" }}>
        
      </p>
      <button
        style={{ padding: "9px 20px", borderRadius: "12px", background: "#1A5CFF", color: "#fff", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Instrument Sans',sans-serif" }}
        onClick={onBack}
      >← Back to Home</button>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────
export default function HomePage() {
  const [page,      setPage]      = useState("home");
  const [user,      setUser]      = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const routerNavigate = useNavigate();
  
  const navigate = (p) => { setPage(p); window.scrollTo(0, 0); };

  const handleToggleSave = (id) => {
    setSavedJobs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSearch = (kw, loc) => {
    navigate("jobs");
  };

  const renderPage = () => {
    if (page === "home") {
      return (
        <>
          <Hero
            onSearch={handleSearch}
            onQuickTag={(tag) => handleSearch(tag, "")}
          />
          <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "32px 24px", width: "100%" }}>
            <FeaturedJobs
              savedJobs={savedJobs}
              onToggleSave={handleToggleSave}
              onViewAll={() => navigate("jobs")}
            />
            <TopCompanies
              onViewAll={() => navigate("companies")}
            />
          </div>
        </>
      );
    }
    return <PlaceholderPage page={page} onBack={() => navigate("home")} />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F6F5F2", fontFamily: "'Instrument Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}`}</style>

      <Navbar
        currentPage={page}
        onNavigate={navigate}
        user={user}
       onLogin={() => routerNavigate("/login")}
       onSignup={() => routerNavigate("/login?mode=signup")} 
       onLogout={() => { setUser(null); navigate("home"); }}
      />

      {renderPage()}

      <Footer onNavigate={navigate} />
    </div>
  );
}