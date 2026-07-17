import React, { useState, useMemo, useEffect } from 'react';

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
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found.');
  ReactDOM.createRoot(rootElement).render(<App />);
} catch (err) {
  console.error(err);
  document.body.innerHTML = `
    <div style="min-height:100vh;background:#05060c;color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;">
      <div style="max-width:700px;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:28px;background:rgba(15,23,42,.95);box-shadow:0 24px 60px rgba(0,0,0,.45);">
        <h1 style="margin-top:0;font-size:1.8rem;">App failed to load</h1>
        <pre style="white-space:pre-wrap;color:#f8fafc;font-size:.95rem;line-height:1.5;">${err.message}</pre>
        <p style="color:#cbd5e1;margin-top:16px;">Open the browser console for details.</p>
      </div>
    </div>
  `;
}

