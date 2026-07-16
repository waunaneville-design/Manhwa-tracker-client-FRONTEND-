const { useState, useMemo } = React;
const statuses = ['All', 'Reading', 'Completed', 'On Hold', 'Plan to Read', 'Dropped'];

function HeaderStats({ total, reading, completed, newChapters }) {
  return (
    <div className="stat-pill-row">
      <span className="stat-pill">Total {total}</span>
      <span className="stat-pill">Reading {reading}</span>
      <span className="stat-pill">Completed {completed}</span>
      <span className="stat-pill">New {newChapters}</span>
    </div>
  );
}

function FilterTabs({ statuses, activeStatus, counts, onSelectStatus }) {
  return (
    <div className="tabs">
      {statuses.map((status) => (
        <button
          key={status}
          type="button"
          className={activeStatus === status ? 'tab active' : 'tab'}
          onClick={() => onSelectStatus(status)}
        >
          {status}
          <span>{counts[status] || 0}</span>
        </button>
      ))}
    </div>
  );
}
