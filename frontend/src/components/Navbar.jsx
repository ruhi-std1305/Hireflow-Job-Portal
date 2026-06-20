import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name");
  const userRole = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav id="navbar">
      <div className="nav-logo" onClick={() => navigate("/")}>
        Hire<span>Flow</span>
      </div>

      <div className="nav-links">
        <button className={`nav-link ${isActive("/") ? "active" : ""}`} onClick={() => navigate("/")}>Home</button>
        <button className={`nav-link ${isActive("/jobs") ? "active" : ""}`} onClick={() => navigate("/jobs")}>Find Jobs</button>
        <button className={`nav-link ${isActive("/companies") ? "active" : ""}`} onClick={() => navigate("/companies")}>Companies</button>
      </div>

      <div className="nav-right">
        {!token ? (
          <div className="flex gap-8">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/login")}>Log in</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/login")}>Sign up</button>
          </div>
        ) : (
          <div className="user-menu">
            <div className="nav-avatar" onClick={() => setShowDropdown(!showDropdown)}>
              {userName ? userName[0].toUpperCase() : "U"}
            </div>
            {showDropdown && (
              <div className="user-dropdown">
                {userRole === "seeker" && (
                  <>
                    <button className="ud-item" onClick={() => { navigate("/dashboard"); setShowDropdown(false); }}>📊 Dashboard</button>
                    <button className="ud-item" onClick={() => { navigate("/applications"); setShowDropdown(false); }}>📋 My Applications</button>
                    <button className="ud-item" onClick={() => { navigate("/saved"); setShowDropdown(false); }}>🔖 Saved Jobs</button>
                  </>
                )}
                {userRole === "employer" && (
                  <button className="ud-item" onClick={() => { navigate("/employer-dashboard"); setShowDropdown(false); }}>📊 Dashboard</button>
                )}
                {userRole === "admin" && (
                  <button className="ud-item" onClick={() => { navigate("/admin"); setShowDropdown(false); }}>🛡️ Admin Panel</button>
                )}
                <div className="ud-divider"></div>
                <button className="ud-item danger" onClick={handleLogout}>⬅ Log out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}