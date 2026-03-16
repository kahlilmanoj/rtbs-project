import React from 'react';

export default function BusCard({ busNumber, busType, fare, routeDistance, duration, status, onTrack }) {
  const isActive = status === 'active';

  return (
    <div className="bus-card">
      {/* Header row: bus number + status badge */}
      <div className="bus-card-header">
        <div>
          <span className="bus-number">{busNumber}</span>
          {busType && (
            <span style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              {busType}
            </span>
          )}
        </div>
        <span className={`badge ${isActive ? 'badge-active' : 'badge-idle'}`}>
          {isActive ? '● Active' : '○ Idle'}
        </span>
      </div>

      {/* Info row: distance · duration · fare */}
      <div className="bus-card-meta">
        {routeDistance != null && (
          <span>📏 <span className="eta-value">{routeDistance}</span></span>
        )}
        {duration != null && (
          <span>🕐 <span className="eta-value">{duration}</span></span>
        )}
        {fare != null && (
          <span>💰 <span className="eta-value" style={{ color: '#c0392b' }}>₹{fare}</span></span>
        )}
      </div>

      {/* Track button */}
      <button
        className="btn btn-primary btn-sm"
        onClick={onTrack}
        aria-label={`Track bus ${busNumber} live location`}
      >
        📍&nbsp; Track Live
      </button>
    </div>
  );
}
