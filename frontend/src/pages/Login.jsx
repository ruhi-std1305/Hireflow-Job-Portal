import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("seeker");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    first: "", last: "", email: "", password: "", company: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get("mode");
    if (m === "signup" || m === "login") setMode(m);
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: loginForm.email,
        password: loginForm.password,
        role: role,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role",  res.data.role);
      localStorage.setItem("name",  res.data.name);
      localStorage.setItem("email", loginForm.email);

      if (res.data.companyName) {
        localStorage.setItem("companyName", res.data.companyName);
        const initials = res.data.companyName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
        localStorage.setItem("employerCompany", JSON.stringify({
          id: "employer_company", name: res.data.companyName,
          initials, color: "#1A5CFF", industry: "", location: "", logo: "", description: "",
        }));
      }

     
      if (res.data.companyId) {
        localStorage.setItem("companyId", res.data.companyId);
      }
      if (res.data.companyLogo) {
        localStorage.setItem("companyLogo", res.data.companyLogo);
      }
      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "employer") navigate("/employer-dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        first: signupForm.first,
        last: signupForm.last,
        email: signupForm.email,
        password: signupForm.password,
        company: signupForm.company,
        role: role,
      });
      setMode("login");
      setError("");
      alert("Account created! Please log in.");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0D0D12 0%,#1a1a2e 50%,#0D0D12 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative",
    }}>
      <div className="auth-card" style={{ position: "relative", maxWidth: "460px", width: "100%" }}>
        {/* Close button */}
        <button
          onClick={() => navigate("/")}
          style={{
            position: "fixed", top: "24px", right: "24px",
            background: "none", border: "none", color: "#aaa5a5",
            fontSize: "25px", cursor: "pointer", lineHeight: 1,
            fontWeight: 250, zIndex: 999,
          }}
        >✕</button>

        {/* Logo */}
        <div className="auth-logo">Hire<span>Flow</span></div>

        {/* Role Toggle */}
        <div className="role-toggle" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[
            { value: "seeker",   label: "👤 Job Seeker" },
            { value: "employer", label: "🏢 Employer"   },
            { value: "admin",    label: "🛡️ Admin"      },
          ].map((r) => (
            <button
              key={r.value}
              className={`role-btn ${role === r.value ? "active" : ""}`}
              onClick={() => {
                setRole(r.value);
                if (r.value === "admin") setMode("login");
                setError("");
              }}
              type="button"
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "var(--red-pale)", color: "var(--red)",
            padding: "10px 14px", borderRadius: "var(--r-md)",
            fontSize: "13px", marginBottom: "16px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input" type="email"
                placeholder={role === "admin" ? "Admin email" : "you@email.com"}
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input" type="password"
                placeholder={role === "admin" ? "Admin password" : "••••••••"}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit" className="btn btn-primary w-full"
              style={{ marginTop: "8px", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
            {role !== "admin" && (
              <div className="auth-switch" style={{ marginTop: "16px" }}>
                No account?{" "}
                <a onClick={() => { setMode("signup"); setError(""); }} style={{ cursor: "pointer" }}>
                  Sign up
                </a>
              </div>
            )}
          </form>
        )}

        {/* SIGNUP FORM */}
        {mode === "signup" && role !== "admin" && (
          <form onSubmit={handleSignup}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">First name</label>
                <input
                  className="form-input" placeholder="First name"
                  value={signupForm.first}
                  onChange={(e) => setSignupForm({ ...signupForm, first: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input
                  className="form-input" placeholder="Last name"
                  value={signupForm.last}
                  onChange={(e) => setSignupForm({ ...signupForm, last: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input" type="email" placeholder="you@email.com"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                required
              />
            </div>
            {role === "employer" && (
              <div className="form-group">
                <label className="form-label">Company name</label>
                <input
                  className="form-input" placeholder="........"
                  value={signupForm.company}
                  onChange={(e) => setSignupForm({ ...signupForm, company: e.target.value })}
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input" type="password" placeholder="Min 6 characters"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                required minLength={6}
              />
            </div>
            <button
              type="submit" className="btn btn-primary w-full"
              style={{ marginTop: "8px", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
            <div className="auth-switch" style={{ marginTop: "16px" }}>
              Have account?{" "}
              <a onClick={() => { setMode("login"); setError(""); }} style={{ cursor: "pointer" }}>
                Log in
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}