import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocs, collection, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { ensureDemoData, seedDemoData, getTripHistory, clearRoutePolylineCache } from '../services/busService';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');

  // ── Dashboard state ──
  const [buses, setBuses]   = useState([]);
  const [routes, setRoutes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  // ── History state ──
  const [history, setHistory]         = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [cacheMsg, setCacheMsg] = useState('');

  // ── Fetch buses on mount ──
  useEffect(() => {
    if (!user?.email) return;

    async function fetchDriverBuses() {
      // Run ensureDemoData in background — don't block the UI on it
      ensureDemoData().catch(() => {});
      try {
        const busQuery = query(
          collection(db, 'buses'),
          where('driverEmail', '==', user.email)
        );
        const busSnap = await getDocs(busQuery);
        const busData = busSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setBuses(busData);

        // Fetch all unique routes in parallel
        const uniqueRouteIds = [...new Set(busData.map((b) => b.routeId).filter(Boolean))];
        const routeSnaps = await Promise.all(
          uniqueRouteIds.map((rId) => getDoc(doc(db, 'routes', rId)))
        );
        const routeMap = {};
        routeSnaps.forEach((snap) => {
          if (snap.exists()) {
            // Exclude large route_polyline from dashboard display — not needed here
            const { route_polyline, ...rest } = snap.data();
            routeMap[snap.id] = { id: snap.id, ...rest };
          }
        });
        setRoutes(routeMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDriverBuses();
  }, [user]);

  // ── Fetch history when tab opens ──
  useEffect(() => {
    if (activeTab !== 'history' || !user?.email) return;
    setHistoryLoading(true);
    getTripHistory(user.email)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [activeTab, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleStartTrip = (busId) => navigate(`/driver-tracking?busId=${busId}`);

  /* ── Tab: Dashboard ────────────────────────────────────────────────────── */
  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading your buses…</p>
        </div>
      );
    }

    return (
      <div style={{ paddingTop: 24 }}>
        <h2 className="section-title">Your Assigned Buses</h2>
        <p className="text-sm text-muted mb-16">
          Logged in as <strong>{user?.email}</strong>
        </p>

        {error && <div className="error-message">{error}</div>}

        {buses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚌</div>
            <h3>No buses assigned</h3>
            <p>
              No buses found for <strong>{user?.email}</strong>. Make sure demo
              data is seeded and your email matches <code>driverEmail</code> in
              Firestore.
            </p>
            <button className="btn btn-secondary mt-16" onClick={() => navigate('/login')}>
              Back to Login
            </button>
          </div>
        ) : (
          buses.map((bus) => {
            const route = routes[bus.routeId];
            return (
              <div key={bus.id} className="driver-bus-card">
                <div className="bus-card-header" style={{ marginBottom: 8 }}>
                  <div className="driver-bus-number">{bus.busNumber}</div>
                  <span className={`badge ${bus.status === 'active' ? 'badge-active' : 'badge-idle'}`}>
                    {bus.status === 'active' ? '● Active' : '○ Idle'}
                  </span>
                </div>

                <div className="route-name">🗺️&nbsp; {route?.name || bus.routeId}</div>

                <div className="info-row">
                  <span className="info-label">Schedule</span>
                  <span className="info-value">{bus.schedule}</span>
                </div>

                {route?.stops?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p className="input-label mb-8">Route Stops</p>
                    <ul className="stops-list">
                      {route.stops.map((stop, idx) => (
                        <li key={idx}>
                          <span className={`stop-dot ${idx === 0 ? 'first' : idx === route.stops.length - 1 ? 'last' : ''}`} />
                          <span>{stop.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  className="btn btn-primary mt-16"
                  onClick={() => handleStartTrip(bus.id)}
                  disabled={bus.status === 'active'}
                >
                  {bus.status === 'active' ? '✅ Trip In Progress' : '▶ Start Trip'}
                </button>
              </div>
            );
          })
        )}
      </div>
    );
  };

  /* ── Tab: Trip History ─────────────────────────────────────────────────── */
  const renderHistory = () => {
    if (historyLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading trip history…</p>
        </div>
      );
    }

    return (
      <div style={{ paddingTop: 24 }}>
        <h2 className="section-title">Trip History</h2>
        <p className="text-sm text-muted mb-16">
          All completed trips for <strong>{user?.email}</strong>
        </p>

        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No trips yet</h3>
            <p>Start a trip from the Dashboard tab — it will appear here once completed.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {history.map((trip, i) => {
              const endDate = trip.endTime?.toDate
                ? trip.endTime.toDate()
                : null;
              const startDate = trip.startTime instanceof Date
                ? trip.startTime
                : trip.startTime?.toDate
                ? trip.startTime.toDate()
                : null;

              const durationMin = startDate && endDate
                ? Math.round((endDate - startDate) / 60000)
                : null;

              return (
                <div key={trip.id} className="card trip-history-card">
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)' }}>
                        Bus {trip.busNumber}
                      </span>
                      <span className="badge badge-completed" style={{ marginLeft: 10, fontSize: 11 }}>
                        ✓ Completed
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      #{history.length - i}
                    </span>
                  </div>

                  {/* Route */}
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    🗺️ {trip.routeName}
                  </p>

                  {/* Stats grid */}
                  <div className="trip-stats-grid">
                    <div className="trip-stat">
                      <span className="trip-stat-value">{trip.distanceKm ?? '—'}</span>
                      <span className="trip-stat-label">km covered</span>
                    </div>
                    <div className="trip-stat">
                      <span className="trip-stat-value">{trip.updateCount ?? '—'}</span>
                      <span className="trip-stat-label">GPS updates</span>
                    </div>
                    <div className="trip-stat">
                      <span className="trip-stat-value">
                        {durationMin !== null ? `${durationMin}m` : '—'}
                      </span>
                      <span className="trip-stat-label">duration</span>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    {startDate && (
                      <div className="info-row">
                        <span className="info-label">Started</span>
                        <span className="info-value" style={{ fontSize: 12 }}>
                          {startDate.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {endDate && (
                      <div className="info-row">
                        <span className="info-label">Ended</span>
                        <span className="info-value" style={{ fontSize: 12 }}>
                          {endDate.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ── Tab: Profile ──────────────────────────────────────────────────────── */
  const renderProfile = () => (
    <div style={{ paddingTop: 24 }}>
      <h2 className="section-title">Driver Profile</h2>

      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7b241c 0%, var(--primary) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          fontWeight: 900,
          color: '#fff',
          boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
          letterSpacing: 1,
        }}>
          {user?.email?.[0]?.toUpperCase() || '?'}
        </div>
      </div>

      {/* Info card */}
      <div className="card info-panel" style={{ marginBottom: 16 }}>
        <div className="info-row">
          <span className="info-label">Role</span>
          <span className="badge" style={{ background: '#fce4e4', color: '#c0392b' }}>Driver</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email</span>
          <span className="info-value" style={{ fontSize: 14 }}>{user?.email}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Buses Assigned</span>
          <span className="info-value">{buses.length}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Trips Completed</span>
          <span className="info-value">{history.length > 0 ? history.length : '—'}</span>
        </div>
      </div>

      {/* Assigned buses summary */}
      {buses.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="input-label mb-12">Assigned Buses</p>
          {buses.map((bus) => (
            <div key={bus.id} className="info-row">
              <span className="info-label" style={{ fontWeight: 700 }}>Bus {bus.busNumber}</span>
              <span className="info-value" style={{ fontSize: 13 }}>
                {routes[bus.routeId]?.name || bus.routeId}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* App info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="input-label mb-8">About</p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Real-Time Bus Tracking System (RTBS) — a college demo project. GPS
          simulation sends location updates to Firebase every 6 seconds.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12 }}>
          Version 1.0.0
        </p>
      </div>

      {/* Re-seed data (requires auth — safe to run here) */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="input-label mb-8">Demo Data</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Re-seed Firestore with the latest KSRTC route &amp; bus data.
        </p>
        {seedMsg ? (
          <p style={{ fontSize: 13, color: seedMsg.startsWith('✅') ? '#2e7d32' : '#c62828', marginBottom: 8 }}>
            {seedMsg}
          </p>
        ) : null}
        <button
          className="btn btn-secondary"
          disabled={seeding}
          onClick={async () => {
            setSeeding(true);
            setSeedMsg('');
            try {
              await seedDemoData();
              setSeedMsg('✅ Data seeded! Reload the page to see updated buses.');
            } catch (e) {
              setSeedMsg(`❌ ${e.message}`);
            } finally {
              setSeeding(false);
            }
          }}
        >
          {seeding ? 'Seeding…' : '⚙️ Re-seed Demo Data'}
        </button>
      </div>

      {/* Reset cached route polylines */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="input-label mb-8">Route Map Cache</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          If the route lines on the passenger map look wrong, reset the cache.
          They will be recomputed accurately next time someone views a route.
        </p>
        {cacheMsg ? (
          <div className={`inline-banner ${cacheMsg.startsWith('✅') ? 'inline-banner-success' : 'inline-banner-error'}`}>
            {cacheMsg}
          </div>
        ) : null}
        <button
          className="btn btn-secondary"
          onClick={async () => {
            setCacheMsg('');
            try {
              await clearRoutePolylineCache();
              setCacheMsg('✅ Route cache cleared! Lines will recompute on next view.');
            } catch (e) {
              setCacheMsg(`❌ ${e.message}`);
            }
          }}
        >
          🗺️ Reset Route Cache
        </button>
      </div>

      <button className="btn btn-secondary mt-8" style={{ color: 'var(--danger)', borderColor: '#f5c6c6' }} onClick={handleLogout}>
        🚪 Sign Out
      </button>
    </div>
  );

  /* ── Render ────────────────────────────────────────────────────────────── */
  const tabContent = {
    dashboard: renderDashboard,
    history:   renderHistory,
    profile:   renderProfile,
  };

  return (
    <div className="page">
      {/* Header */}
      <header className="app-header">
        <div className="header-title">
          <span>🚌</span>
          <span>Driver Mode</span>
        </div>
        <div className="header-actions">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            {user?.email?.split('@')[0]}
          </span>
        </div>
      </header>

      {/* Page content */}
      <div className="page-content">
        {tabContent[activeTab]?.()}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {[
          { key: 'dashboard', icon: '🚌', label: 'Dashboard' },
          { key: 'history',   icon: '📋', label: 'History'   },
          { key: 'profile',   icon: '👤', label: 'Profile'   },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`nav-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
