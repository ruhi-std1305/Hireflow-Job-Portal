import React from 'react';
import { useNavigate } from 'react-router-dom';


function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

/**
 * @param {Object} props
 * @param {Object} props.job 
 * @param {boolean} props.saved 
 * @param {(jobId: string) => void} props.onToggleSave 
 */
export default function JobCard({ job, saved, onToggleSave }) {
  const navigate = useNavigate();
  const co = job.company;

  return (
    <div
      className={`job-card${job.featured ? ' featured' : ''}`}
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <button
        className={`save-icon${saved ? ' saved' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave(job.id);
        }}
        title={saved ? 'Unsave' : 'Save'}
        aria-label={saved ? 'Unsave job' : 'Save job'}
      >
        🔖
      </button>

      <div className="jc-top">
        <div
          className="co-logo-sm"
          style={{ color: co?.logo ? undefined : co?.color || 'var(--accent)' }}
        >
          {co?.logo ? <img src={co.logo} alt={co.name} /> : co?.initials || '?'}
        </div>
        <div>
          {job.featured && (
            <>
              <span className="badge badge-blue" style={{ marginBottom: 4 }}>
                ✦ Featured
              </span>
              <br />
            </>
          )}
          <div className="jc-title">{job.title}</div>
          <div className="jc-company">
            {co?.name || 'Unknown'} · {job.location}
          </div>
        </div>
      </div>

      <div className="jc-tags">
        <span className="badge badge-blue">{job.type}</span>
        {job.location === 'Remote' && <span className="badge badge-green">Remote</span>}
        <span className="badge badge-gray">{job.experience}</span>
        {job.skills.slice(0, 2).map((s) => (
          <span key={s} className="badge badge-gray">
            {s}
          </span>
        ))}
      </div>

      <div className="jc-footer">
        <div className="jc-salary">{job.salary}</div>
        <div className="jc-meta">Posted {timeAgo(job.postedAt)}</div>
      </div>
    </div>
  );
}
