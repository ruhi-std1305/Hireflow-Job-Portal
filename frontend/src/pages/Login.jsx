import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [role, setRole] = useState("seeker");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    first: "", last: "", email: "", password: "", company: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: loginForm.email,
        password: loginForm.password
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);

      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "employer") navigate("/employer-dashboard");
      else navigate("/jobs");
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
        role: role
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
      padding: "24px", position: "relative"
    }}>

      {/* Auth Card */}
      <div className="auth-card" style={{ position: "relative", maxWidth: "460px", width: "100%" }}>

        {/* Logo */}
        <div className="auth-logo">Hire<span>Flow</span></div>

        {/* Role Toggle  */}
        <div className="role-toggle" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[
            { value: "seeker", label: "👤 Job Seeker" },
            { value: "employer", label: "🏢 Employer" },
            { value: "admin", label: "🛡️ Admin" },
          ].map(r => (
            <button
              key={r.value}
              className={`role-btn ${role === r.value ? "active" : ""}`}
              onClick={() => {
                setRole(r.value);
                // Admin select korle login mode 
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
            fontSize: "13px", marginBottom: "16px"
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
                className="form-input"
                type="email"
                placeholder={role === "admin" ? "Admin email" : "you@email.com"}
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder={role === "admin" ? "Admin password" : "••••••••"}
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ marginTop: "8px", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            {/* Admin hole "No account? Sign up" signup dekhabe na */}
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

        {/* SIGNUP FORM — Admin er jonno dekhabe na */}
        {mode === "signup" && role !== "admin" && (
          <form onSubmit={handleSignup}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">First name</label>
                <input
                  className="form-input"
                  placeholder="1st name"
                  value={signupForm.first}
                  onChange={e => setSignupForm({ ...signupForm, first: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input
                  className="form-input"
                  placeholder="last name"
                  value={signupForm.last}
                  onChange={e => setSignupForm({ ...signupForm, last: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@email.com"
                value={signupForm.email}
                onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                required
              />
            </div>

            {/* Employer hole Company name dekhabe */}
            {role === "employer" && (
              <div className="form-group">
                <label className="form-label">Company name</label>
                <input
                  className="form-input"
                  placeholder=".........."
                  value={signupForm.company}
                  onChange={e => setSignupForm({ ...signupForm, company: e.target.value })}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Min 8 characters"
                value={signupForm.password}
                onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
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