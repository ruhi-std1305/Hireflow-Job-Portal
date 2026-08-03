import React from 'react';

const CATEGORIES = ['Technology', 'Design', 'Marketing', 'Finance', 'HR', 'Operations'];
const LOCATIONS = ['Dhaka', 'Chittagong', 'Remote', 'Abroad'];
const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

/**
 * @param {Object} props
 * @param {{keyword:string, category:string, location:string, type:string}} props.filters
 * @param {(filters: Object) => void} props.onChange
 * @param {() => void} props.onClear
 */
export default function FilterBar({ filters, onChange, onClear }) {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="filter-bar">
      <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
        <label className="form-label">Keyword</label>
        <input
          className="form-input"
          name="keyword"
          placeholder="Title, skill, company..."
          value={filters.keyword}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <select
          className="form-input form-select"
          name="category"
          value={filters.category}
          onChange={handleChange}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Location</label>
        <select
          className="form-input form-select"
          name="location"
          value={filters.location}
          onChange={handleChange}
        >
          <option value="">All Locations</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Type</label>
        <select
          className="form-input form-select"
          name="type"
          value={filters.type}
          onChange={handleChange}
        >
          <option value="">All Types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn-ghost" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}
