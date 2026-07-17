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
        <h2>Latest Chapter Releases</h2>
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
            <span className="cover-initial" style={{ color: '#fff', textShadow: '0 0 24px rgba(255,255,255,0.2)' }}>
              {item.title[0]}
            </span>
            <span className="cover-caption">{item.subtitle}</span>
          </div>
        )}
        <div className="visual-overlay" />
        {!imageFailed && (
          <span className="cover-initial" style={{ color: item.accent, textShadow: `0 0 30px ${item.accent}` }}>
            {item.title[0]}
          </span>
        )}
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span className={`badge status-${statusClass}`}>{item.status}</span>
          <span className="score">{item.score.toFixed(1)}</span>
        </div>
        <h2>{item.title}</h2>
        <p>{item.subtitle}</p>
        <div className="progress-row">
          <span>
            {item.progress.read}/{item.progress.latest}
          </span>
          <span>{behind > 0 ? `+${behind} new` : 'Up to date'}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(ratio, 100)}%`,
              background: `linear-gradient(90deg, ${item.accent}, rgba(255,255,255,0.5))`,
            }}
          />
        </div>
        <button type="button" className="details-button" onClick={() => onOpenDetail(item.id)}>
          View details
        </button>
      </div>
    </article>
  );
}

function App() {
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState(null);
  const [updatesOpen, setUpdatesOpen] = useState(false);

  const filteredSeries = useMemo(
    () =>
      seriesData.filter((item) => {
        const matchesStatus = activeStatus === 'All' || item.status === activeStatus;
        const lower = search.toLowerCase();
        return (
          matchesStatus &&
          (item.title.toLowerCase().includes(lower) || item.subtitle.toLowerCase().includes(lower))
        );
      }),
    [activeStatus, search]
  );

  const statusCounts = useMemo(() => {
    const counts = { Reading: 0, Completed: 0, 'On Hold': 0, 'Plan to Read': 0, Dropped: 0 };
    seriesData.forEach((item) => {
      counts[item.status] += 1;
    });
    return counts;
  }, []);

  const counts = useMemo(() => ({ ...statusCounts, All: seriesData.length }), [statusCounts]);

  const newChapters = useMemo(
    () => seriesData.reduce((sum, item) => sum + Math.max(0, item.progress.latest - item.progress.read), 0),
    []
  );

  const detailItem = seriesData.find((item) => item.id === detailId);

  return (
    <div className="page-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">MangaTrack</p>
          <h1>Dark kinetic tracker</h1>
          <p className="subhead">
            Track reading, latest chapters, and upcoming releases across manga, manhwa, and manhua.
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="updates-toggle" onClick={() => setUpdatesOpen(!updatesOpen)}>
            Updates panel
          </button>
          <HeaderStats
            total={seriesData.length}
            reading={statusCounts.Reading}
            completed={statusCounts.Completed}
            newChapters={newChapters}
          />
        </div>
      </header>

      {updatesOpen && <UpdatesPanel updates={updates} />}

      <div className="toolbar">
        <FilterTabs statuses={statuses} activeStatus={activeStatus} counts={counts} onSelectStatus={setActiveStatus} />
        <div className="search-wrap">
          <input
            type="search"
            placeholder="Search series..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <main className="grid-shell">
        {filteredSeries.map((item) => (
          <SeriesCard key={item.id} item={item} onOpenDetail={setDetailId} />
        ))}
      </main>

      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailId(null)} />}
    </div>
  );
}

export default App;

