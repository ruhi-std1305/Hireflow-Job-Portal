import React from 'react';
import { useNavigate } from 'react-router-dom';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const w = Math.floor(days / 7);
  return `${w} week${w > 1 ? 's' : ''} ago`;
}

export default function JobCard({ job, saved, onToggleSave }) {
  const navigate = useNavigate();
  const co  = job.company;
  // mock → id, MongoDB → _id; FindJobsPage always passes id after normalization
  const jid = job.id || job._id || "";

  return (
    <div
      className={`job-card${job.featured ? ' featured' : ''}`}
      onClick={() => navigate(`/jobs/${jid}`)}
    >
      <button
        className={`save-icon${saved ? ' saved' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleSave(jid); }}
        title={saved ? 'Unsave' : 'Save'}
        aria-label={saved ? 'Unsave job' : 'Save job'}
      >
        🔖
      </button>

      <div className="jc-top">
        <div className="co-logo-sm" style={{ color: co?.logo ? undefined : co?.color || 'var(--accent)' }}>
          {co?.logo ? <img src={co.logo} alt={co.name} /> : co?.initials || '?'}
        </div>
        <div>
          {job.featured && (
            <>
              <span className="badge badge-blue" style={{ marginBottom: 4 }}>✦ Featured</span>
              <br />
            </>
          )}
          <div className="jc-title">{job.title}</div>
          <div className="jc-company">{co?.name || 'Unknown'} · {job.location}</div>
        </div>
      </div>

      <div className="jc-tags">
        <span className="badge badge-blue">{job.type || job.jobType}</span>
        {job.location === 'Remote' && <span className="badge badge-green">Remote</span>}
        {(() => {
          const exp = job.experience ?? job.experienceLevel;
          if (exp === undefined || exp === null || exp === "") return null;
          const labels = { 0: "Entry Level", 2: "Mid Level", 5: "Senior", 8: "Lead" };
          const label = labels[Number(exp)] || (isNaN(Number(exp)) ? exp : null);
          return label ? <span className="badge badge-gray">{label}</span> : null;
        })()}
        {(job.skills || []).slice(0, 2).map((s) => (
          <span key={s} className="badge badge-gray">{s}</span>
        ))}
      </div>

      <div className="jc-footer">
        <div className="jc-salary">{job.salary}</div>
        <div className="jc-meta">Posted {timeAgo(job.postedAt || job.createdAt)}</div>
      </div>
    </div>
  );
}
