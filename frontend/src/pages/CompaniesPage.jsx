import React, { useEffect, useState } from 'react';
import CompanyCard from '../components/CompanyCard';
import { getCompanies } from '../services/companyService';
import '../styles/jobsCompanies.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";



export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getCompanies(search).then((data) => {
      if (active) {
        setCompanies(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [search]);

  return (
     <div style={{ minHeight: "100vh", background: "var(--surface2)" }}>
    <Navbar />
    <div className="page-container">

      <div className="page-title">Companies</div>
      <div className="page-sub">Explore top companies that are actively hiring</div>

      <div className="mb-20">
        <input
          className="form-input"
          placeholder="🔍 Search companies..."
          style={{ maxWidth: 400 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="company-card-grid">
        {loading ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-icon">⏳</div>
            <div className="empty-title">Loading companies...</div>
          </div>
        ) : companies.length ? (
          companies.map((c) => <CompanyCard key={c.id} company={c} />)
        ) : (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-icon">🏢</div>
            <div className="empty-title">No companies found</div>
            <div className="text-muted text-sm">Try a different search term</div>
          </div>
        )}
      </div>
    </div>

    <Footer />                      {/* */}
  </div>
  );
}
