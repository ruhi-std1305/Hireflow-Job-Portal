import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { getCompanyById, getOpenJobsByCompany } from '../services/companyService';
import '../styles/jobsCompanies.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    Promise.all([getCompanyById(id), getOpenJobsByCompany(id)])
      .then(([co, jobsData]) => {
        if (active) {
          setCompany(co);
          setJobs(jobsData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setNotFound(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-title">Loading company details...</div>
        </div>
      </div>
    );
  }

  if (notFound || !company) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <div className="empty-title">Company not found</div>
          <button className="btn btn-primary mt-16" onClick={() => navigate('/companies')}>
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface2)" }}>
        <Navbar />
    <div className="page-container">
      <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate('/companies')}>
        <span>←</span> Back
      </button>

      <div className="card company-header mb-20">
        <div
          className="co-logo-lg co-logo-xl"
          style={{ color: company.logo ? undefined : company.color || 'var(--accent)' }}
        >
          {company.logo ? (
            <img src={company.logo} alt={company.name} />
          ) : (
            company.initials || company.name.slice(0, 2)
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div className="co-header-name">{company.name}</div>
          <div className="co-header-meta">
            {company.industry} · {company.location}
          </div>
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer" className="co-header-link">
              {company.website}
            </a>
          )}
          <p className="co-header-desc">{company.description}</p>
        </div>
      </div>

      <div className="section-title mb-16">
        {jobs.length} Open Position{jobs.length !== 1 ? 's' : ''}
      </div>

      <div className="jobs-grid">
        {jobs.length ? (
          jobs.map((j) => <JobCard key={j.id} job={j} saved={false} onToggleSave={() => {}} />)
        ) : (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-icon">💼</div>
            <div className="empty-title">No open positions</div>
          </div>
        )}
      </div>
    </div>

    <Footer />                      {/* */}
  </div>
  );
}
