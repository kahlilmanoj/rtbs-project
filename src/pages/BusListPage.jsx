import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getBusesByStops } from '../services/busService';
import BusCard from '../components/BusCard';

export default function BusListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fromStop = searchParams.get('from') || '';
  const toStop = searchParams.get('to') || '';

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch matching buses once
  useEffect(() => {
    let cancelled = false;

    async function fetchBuses() {
      setLoading(true);
      try {
        const result = await getBusesByStops(fromStop, toStop);
        if (!cancelled) {
          setBuses(result);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (fromStop && toStop) {
      fetchBuses();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [fromStop, toStop]);

  const handleTrack = (busId) => {
    navigate(`/live-tracking?busId=${busId}`);
  };

  if (loading) {
    return (
      <div className="page">
        <header className="app-header">
          <div className="header-title">🔍 Searching…</div>
        </header>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Finding buses for your route…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <header className="app-header">
        <div className="header-title">
          <button
            className="icon-btn"
            onClick={() => navigate('/passenger-home')}
            style={{ marginRight: 8 }}
            aria-label="Go back to search"
          >
            ← Back
          </button>
          Available Buses
        </div>
      </header>

      <div className="page-content">
        {/* Route display */}
        <div className="route-header mt-16">
          <span>🚏</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{fromStop}</span>
            <span style={{ fontSize: 11, opacity: 0.75 }}>→ {toStop}</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {buses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚌</div>
            <h3>No buses found</h3>
            <p style={{ fontSize: 14, marginTop: 8 }}>
              No buses serve <strong>{fromStop} → {toStop}</strong>.
              <br />Check spelling or try a nearby stop.
            </p>
            <button
              className="btn btn-primary mt-16"
              onClick={() => navigate('/passenger-home')}
            >
              ← Search Again
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-12">
              {buses.length} bus{buses.length !== 1 ? 'es' : ''} found
            </p>

            {buses.map((bus) => (
              <BusCard
                key={bus.id}
                busNumber={bus.busNumber}
                busType={bus.busType}
                fare={bus.fare}
                routeDistance={bus.distance}
                duration={bus.duration}
                status={bus.status}
                onTrack={() => handleTrack(bus.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
