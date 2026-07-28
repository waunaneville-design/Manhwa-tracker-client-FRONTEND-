import React, { useState, useMemo } from 'react';
import { seriesData, updates } from './data.js';

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

function UpdatesPanel({ updates }) {
  return (
    <section className="updates-panel">
      <div className="updates-header">
        <h2>Latest Chapters Releases</h2>
        <span>{updates.length} items</span>
      </div>
<div className="updates-list">
        {updates.map((update) => (
          <div key={`${update.series}-${update.time}`} className="update-item">
            <div>
              <strong>{update.series}</strong>
              <p>{update.note}</p>
            </div>
            <span>{update.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DetailModal({ item, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Detail view</p>
            <h2>{item.title}</h2>
            <p>{item.subtitle}</p>
          </div>
<button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-content">
          <div className="detail-grid">
            <div className="detail-card">
              <span>Total Chapters</span>
              <strong>{item.progress.latest}</strong>
            </div>
            <div className="detail-card">
              <span>Current</span>
              <strong>{item.progress.read}</strong>
            </div>
            <div className="detail-card">
              <span>Status</span>
              <strong>{item.status}</strong>
            </div>
<div className="detail-card">
              <span>Last Updated</span>
              <strong>{item.updated}</strong>
            </div>
          </div>
          <div className="genres-row">
            {item.genres.map((genre) => (
              <span key={genre} className="genre-pill">
                {genre}
              </span>
            ))}
          </div>
<div className="chapter-grid">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="chapter-pill">
                Ch {idx * 10 + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SeriesCard({ item, onOpenDetail }) {
  const [imageFailed, setImageFailed] = useState(false);
  const behind = item.progress.latest - item.progress.read;
  const ratio = item.progress.latest === 0 ? 0 : (item.progress.read / item.progress.latest) * 100;
  const statusClass = item.status.replace(/\s+/g, '-').toLowerCase();

  return (
    <article
      className="series-card"
      style={{ boxShadow: `0 24px 60px ${item.accent}30`, borderColor: `${item.accent}40` }}
    >
 <div className="card-visual">
        {!imageFailed ? (
          <img
            className="cover-image"
            src={item.cover}
            alt={`${item.title} cover`}
            onError={() => setImageFailed(true)}
          />
        ) : (
<div
            className="cover-fallback"
            style={{ backgroundImage: `linear-gradient(135deg, ${item.accent} 0%, rgba(2, 6, 23, 0.94) 100%)` }}
          >
