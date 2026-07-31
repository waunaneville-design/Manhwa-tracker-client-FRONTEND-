import React, { useState, useMemo } from 'react';
import { seriesData, updates } from './data.js';
import SignIn from './SignIn.jsx';

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
  // --- state ---
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState(null);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('Sign in with your email to view the tracker.');

  // --- handlers ---
  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      setAuthMessage('Please enter both email and password.');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      const data = await res.json();
      setAuthMessage(res.ok ? (data.message || 'Signup successful.') : (data.error || 'Signup failed.'));
    } catch (err) {
      setAuthMessage('Server error. Please try again.');
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthMessage('Please enter both email and password.');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true);
        setAuthMessage(`Welcome back, ${email}!`);
      } else {
        setAuthMessage(data.error || 'Login failed.');
      }
    } catch (err) {
      setAuthMessage('Server error. Please try again later.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthMessage('You have been logged out.');
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setAuthMessage('Enter your email to receive a reset link.');
      return;
    }
    setAuthMessage(`A password reset link has been sent to ${email}.`);
  };

  // --- JSX ---
  return (
    <div className="page-shell">
      <form className="auth-card" onSubmit={handleLogin}>
        <div className="auth-card-header">
          <p className="eyebrow">Account</p>
          <h2>{isLoggedIn ? 'Signed in' : 'Sign in'}</h2>
        </div>

        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="auth-actions">
          {!isLoggedIn ? (
            <>
              <button type="submit" className="auth-button primary">Log in</button>
              <button type="button" className="auth-button secondary" onClick={handleForgotPassword}>Forgot password</button>
              <button type="button" className="auth-button secondary" onClick={handleSignup}>Sign up</button>
            </>
          ) : (
            <button type="button" className="auth-button secondary" onClick={handleLogout}>Log out</button>
          )}
        </div>

        {authMessage && <p className={`auth-message ${isLoggedIn ? 'success' : ''}`}>{authMessage}</p>}
      </form>

      {!isLoggedIn ? (
        <section className="auth-gate">
          <h2>Access required</h2>
          <p>Please sign in with your email to unlock the tracker and see your content.</p>
        </section>
      ) : (
        <>
          {/* tracker UI here */}
        </>
      )}
    </div>
  );
}

export default App;
