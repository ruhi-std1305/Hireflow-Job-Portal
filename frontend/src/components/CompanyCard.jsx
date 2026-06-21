import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * @param {Object} props
 * @param {Object} props.company - { id, name, industry, logo, initials, color, openJobsCount }
 */
export default function CompanyCard({ company }) {
  const navigate = useNavigate();
  const openJobs = company.openJobsCount ?? 0;

  return (
    <div className="company-card" onClick={() => navigate(`/companies/${company._id || company.id}`)}>
      <div
        className="co-logo-lg"
        style={{ color: company.logo ? undefined : company.color || 'var(--accent)' }}
      >
        {company.logo ? (
          <img src={company.logo} alt={company.name} />
        ) : (
          company.initials || company.name.slice(0, 2)
        )}
      </div>
      <div className="co-name">{company.name}</div>
      <div className="co-industry">{company.industry}</div>
      <div className="co-openjobs">
        {openJobs} open position{openJobs !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
