import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ensureDemoData } from '../services/busService';

// Routes shown in the Routes tab (mirrors seeded Firestore KSRTC TVM city data)
const ALL_ROUTES = [
  { id:'route-CC-1',  name:'City Circular - Thampanoor to Technopark',
    stops:['Thampanoor','Palayam','Vellayambalam','Kowdiar','Pattom','Medical College','Ulloor','Sreekaryam','Kazhakuttam','Technopark Phase 1','Technopark Phase 3'],
    buses:['CC-1'],  type:'City Circular (AC/Non-AC)', fare:30,  distance:'18.2 km', duration:'55 min' },
  { id:'route-CC-2',  name:'City Circular - Thampanoor to Kazhakuttam via East Fort',
    stops:['Thampanoor','East Fort','Pettah','Chakkai','Mukkola','Enchakkal','Karyavattom','Kazhakuttam','Technopark'],
    buses:['CC-2'],  type:'City Circular (AC/Non-AC)', fare:25,  distance:'14.6 km', duration:'50 min' },
  { id:'route-CS-1',  name:'City Shuttle - Thampanoor to Neyyattinkara',
    stops:['Thampanoor','Karamana','Pappanamcode','Nemom','Kalliyoor','Aruvikkara','Balaramapuram','Avanavanchery','Parasuvaikkal','Neyyattinkara'],
    buses:['CS-1'],  type:'City Shuttle', fare:40,  distance:'26.3 km', duration:'75 min' },
  { id:'route-CS-2',  name:'City Shuttle - Thampanoor to Attingal',
    stops:['Thampanoor','Palayam','Medical College','Sreekaryam','Kazhakuttam','Chanthavila','Chirayinkeezhu','Kallambalam','Attingal Junction','Attingal'],
    buses:['CS-2'],  type:'City Shuttle', fare:50,  distance:'34.8 km', duration:'90 min' },
  { id:'route-CS-3',  name:'City Shuttle - Thampanoor to Venjaramoodu',
    stops:['Thampanoor','Palayam','Vellayambalam','Peroorkada','Vattiyoorkavu','Karickom','Vembayam','Aryanad','Venjaramoodu'],
    buses:['CS-3'],  type:'City Shuttle', fare:40,  distance:'22.0 km', duration:'65 min' },
  { id:'route-CS-4',  name:'City Shuttle - Thampanoor to Nedumangadu',
    stops:['Thampanoor','Vellayambalam','Peroorkada','Vattiyoorkavu','Karickom','Vembayam','Aryanad','Pothencode','Nedumangadu'],
    buses:['CS-4'],  type:'City Shuttle', fare:40,  distance:'25.2 km', duration:'72 min' },
  { id:'route-CS-5',  name:'City Shuttle - Thampanoor to Kattakkada',
    stops:['Thampanoor','Karamana','Nemom','Kalliyoor','Maranalloor','Vellarada','Peringamala','Kattakkada'],
    buses:['CS-5'],  type:'City Shuttle', fare:40,  distance:'22.5 km', duration:'65 min' },
  { id:'route-CS-6',  name:'City Shuttle - Thampanoor to Kovalam',
    stops:['Thampanoor','East Fort','Pappanamcode','Nemom','Poovar Road','Vizhinjam','Kovalam Junction','Kovalam'],
    buses:['CS-6'],  type:'City Shuttle', fare:30,  distance:'16.2 km', duration:'50 min' },
  { id:'route-CS-7',  name:'City Shuttle - Thampanoor to Kaniyapuram',
    stops:['Thampanoor','Palayam','Kowdiar','Pattom','Medical College','Ulloor','Sreekaryam','Kazhakuttam','Mangalapuram','Kaniyapuram'],
    buses:['CS-7'],  type:'City Shuttle', fare:35,  distance:'21.2 km', duration:'60 min' },
  { id:'route-CS-8',  name:'City Shuttle - Thampanoor to Vizhinjam',
    stops:['Thampanoor','East Fort','Pappanamcode','Nemom','Poovar Road','Veli','Vizhinjam'],
    buses:['CS-8'],  type:'City Shuttle', fare:25,  distance:'12.0 km', duration:'40 min' },
  { id:'route-CS-9',  name:'City Shuttle - Thampanoor to Varkala',
    stops:['Thampanoor','Sreekaryam','Kazhakuttam','Chirayinkeezhu','Attingal','Parippally','Manamboor','Edava','Varkala Town','Varkala'],
    buses:['CS-9'],  type:'City Shuttle', fare:70,  distance:'52.0 km', duration:'130 min' },
  { id:'route-CS-10', name:'City Shuttle - Thampanoor to Pongummoodu (via Kowdiar)',
    stops:['Thampanoor','Museum','Palayam','Vellayambalam','Kowdiar','Jagathy','Pongummoodu'],
    buses:['CS-10'], type:'City Shuttle', fare:15,  distance:'4.8 km',  duration:'22 min' },
  { id:'route-CR-1',  name:'City Radial - Thampanoor to Peroorkada',
    stops:['Thampanoor','Aristo','Palayam','Vellayambalam','PMG','Vikas Bhavan','Peroorkada'],
    buses:['CR-1'],  type:'City Radial', fare:20,  distance:'8.8 km',  duration:'35 min' },
  { id:'route-CR-2',  name:'City Radial - Thampanoor to Sreekaryam',
    stops:['Thampanoor','Palayam','Vellayambalam','Pattom','Medical College','Ulloor','Sreekaryam'],
    buses:['CR-2'],  type:'City Radial', fare:25,  distance:'13.2 km', duration:'40 min' },
  { id:'route-CR-3',  name:'City Radial - Thampanoor to Pappanamcode',
    stops:['Thampanoor','East Fort','Chalai','Karamana','Pappanamcode'],
    buses:['CR-3'],  type:'City Radial', fare:15,  distance:'5.2 km',  duration:'20 min' },
  { id:'route-CR-4',  name:'City Radial - Thampanoor to Pongumoodu',
    stops:['Thampanoor','Aristo','Palayam','Vellayambalam','Jagathy','Pongumoodu'],
    buses:['CR-4'],  type:'City Radial', fare:15,  distance:'4.2 km',  duration:'18 min' },
];

export default function PassengerHome() {
  const navigate   = useNavigate();
  const { logout, user } = useAuth();

  const [fromStop, setFromStop]   = useState('');
  const [toStop, setToStop]       = useState('');
  const [activeNav, setActiveNav] = useState('home');
  const [routeFilter, setRouteFilter] = useState('');

  // Auto-seed Firestore demo data if the buses collection is empty
  useEffect(() => { ensureDemoData(); }, []);

  // Favourites stored in localStorage
  const [favourites, setFavourites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rtbs_favourites') || '[]');
    } catch {
      return [];
    }
  });

  const saveFavourites = (list) => {
    setFavourites(list);
    localStorage.setItem('rtbs_favourites', JSON.stringify(list));
  };

  const addFavourite = (from, to) => {
    const exists = favourites.some((f) => f.from === from && f.to === to);
    if (!exists) saveFavourites([...favourites, { from, to }]);
  };

  const removeFavourite = (index) => {
    const updated = favourites.filter((_, i) => i !== index);
    saveFavourites(updated);
  };

  const handleSwap = () => {
    setFromStop(toStop);
    setToStop(fromStop);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!fromStop.trim() || !toStop.trim()) return;
    const params = new URLSearchParams({ from: fromStop.trim(), to: toStop.trim() });
    navigate(`/bus-list?${params.toString()}`);
  };

  const searchRoute = (from, to) => {
    const params = new URLSearchParams({ from, to });
    navigate(`/bus-list?${params.toString()}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  /* ── Render helpers ──────────────────────────────────────────────────────── */

  const renderHome = () => (
    <div style={{ paddingTop: 24 }}>
      <h2 className="section-title">Find Your Bus</h2>
      <p className="text-sm text-muted mb-16">
        Enter your pickup and drop-off stop to see available buses.
      </p>

      <form onSubmit={handleSearch} className="search-card card">
        <label className="input-label" htmlFor="from-stop">From</label>
        <input
          id="from-stop"
          type="text"
          className="input-field"
          placeholder="e.g. Thampanoor"
          value={fromStop}
          onChange={(e) => setFromStop(e.target.value)}
          required
          autoComplete="off"
        />

        {/* Swap stops button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <button
            type="button"
            className="swap-btn"
            onClick={handleSwap}
            aria-label="Swap from and to stops"
            title="Swap stops"
          >
            ⇅
          </button>
        </div>

        <label className="input-label" htmlFor="to-stop">To</label>
        <input
          id="to-stop"
          type="text"
          className="input-field"
          placeholder="e.g. Technopark"
          value={toStop}
          onChange={(e) => setToStop(e.target.value)}
          required
          autoComplete="off"
        />

        <button type="submit" className="btn btn-primary mt-8">
          🔍&nbsp; Search Buses
        </button>
      </form>

      {/* Quick-search suggestions */}
      <div className="card">
        <p className="input-label mb-8">Popular Routes</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { from: 'Thampanoor', to: 'Technopark Phase 3' },
            { from: 'Thampanoor', to: 'Kazhakuttam'        },
            { from: 'Thampanoor', to: 'Attingal'           },
            { from: 'Thampanoor', to: 'Neyyattinkara'      },
          ].map((route) => (
            <button
              key={`${route.from}-${route.to}`}
              className="route-chip"
              onClick={() => searchRoute(route.from, route.to)}
            >
              <span className="route-chip-label">
                📍 {route.from} → {route.to}
              </span>
              <span className="route-chip-arrow">Search →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRoutes = () => {
    const filtered = routeFilter.trim()
      ? ALL_ROUTES.filter((r) =>
          r.name.toLowerCase().includes(routeFilter.toLowerCase()) ||
          r.stops.some((s) => s.toLowerCase().includes(routeFilter.toLowerCase()))
        )
      : ALL_ROUTES;

    return (
    <div style={{ paddingTop: 24 }}>
      <h2 className="section-title">All Routes</h2>
      <p className="text-sm text-muted mb-16">
        {ALL_ROUTES.length} routes available · tap a route to search buses
      </p>

      {/* Filter bar */}
      <div className="filter-bar-wrapper">
        <span className="filter-bar-icon">🔍</span>
        <input
          type="search"
          className="filter-bar"
          placeholder="Search routes or stops…"
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          aria-label="Filter routes"
        />
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No matching routes</h3>
          <p style={{ fontSize: 14, marginTop: 8 }}>Try a different stop name or destination.</p>
        </div>
      )}

      {filtered.map((route) => (
        <div key={route.id} className="card" style={{ marginBottom: 16 }}>
          {/* Route name */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)', flex: 1 }}>
              🗺️ {route.name}
            </p>
            <span className="badge badge-active" style={{ flexShrink: 0 }}>
              {route.buses.length} bus{route.buses.length > 1 ? 'es' : ''}
            </span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>{route.type} · {route.distance} · {route.duration} · ₹{route.fare}</p>

          {/* Stops */}
          <div style={{ marginBottom: 12 }}>
            <p className="input-label mb-8">Stops</p>
            <ul className="stops-list">
              {route.stops.map((stop, i) => (
                <li key={stop}>
                  <span
                    className={`stop-dot ${i === 0 ? 'first' : i === route.stops.length - 1 ? 'last' : ''}`}
                  />
                  <span style={{ fontSize: 14 }}>{stop}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Buses on this route */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {route.buses.map((b) => (
              <span
                key={b}
                style={{
                  background: '#fce4e4',
                  color: 'var(--primary)',
                  borderRadius: 6,
                  padding: '3px 10px',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Bus {b}
              </span>
            ))}
          </div>

          {/* Search + Save favourite */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => searchRoute(route.stops[0], route.stops[route.stops.length - 1])}
              aria-label={`Search buses for ${route.name}`}
            >
              Search Buses
            </button>
            <button
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '0 16px', minWidth: 48 }}
              title="Save to saved routes"
              aria-label="Save to saved routes"
              onClick={() => addFavourite(route.stops[0], route.stops[route.stops.length - 1])}
            >
              ⭐
            </button>
          </div>
        </div>
      ))}
    </div>
    );
  };

  const renderFavourites = () => (
    <div style={{ paddingTop: 24 }}>
      <h2 className="section-title">Saved Routes</h2>
      <p className="text-sm text-muted mb-16">Your saved routes for quick access.</p>

      {favourites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <h3>No saved routes yet</h3>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            Go to <strong>Routes</strong> and tap ⭐ to save a route here for quick access.
          </p>
          <button
            className="btn btn-secondary mt-16"
            style={{ maxWidth: 200, margin: '16px auto 0' }}
            onClick={() => setActiveNav('routes')}
          >
            Browse Routes
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {favourites.map((fav, i) => (
            <div key={i} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                <p style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.4, flex: 1 }}>
                  ⭐ {fav.from} → {fav.to}
                </p>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: 'auto', padding: '6px 10px', fontSize: 18, color: 'var(--danger)', flexShrink: 0, lineHeight: 1 }}
                  onClick={() => removeFavourite(i)}
                  aria-label={`Remove saved route ${fav.from} to ${fav.to}`}
                  title="Remove saved route"
                >
                  🗑️
                </button>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => searchRoute(fav.from, fav.to)}
              >
                🔍 Search Buses
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div style={{ paddingTop: 24 }}>
      <h2 className="section-title">My Profile</h2>

      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, #922b21 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
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
          <span className="badge badge-active">Passenger</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email</span>
          <span className="info-value" style={{ fontSize: 14 }}>{user?.email}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Saved Routes</span>
          <span className="info-value">{favourites.length}</span>
        </div>
      </div>

      {/* App info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="input-label mb-8">About</p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          KSRTC Real-Time Bus Tracking — track live bus locations, get accurate ETAs,
          and browse all Thiruvananthapuram city routes.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12 }}>
          Version 1.0.0 · Kerala State Road Transport Corporation
        </p>
      </div>

      <button className="btn btn-secondary mt-8" style={{ color: 'var(--danger)', borderColor: '#f5c6c6' }} onClick={handleLogout}>
        🚪 Sign Out
      </button>
    </div>
  );

  const tabContent = {
    home:    renderHome,
    routes:  renderRoutes,
    fav:     renderFavourites,
    profile: renderProfile,
  };

  return (
    <div className="page">
      {/* Header */}
      <header className="app-header">
        <div className="header-title">
          <span>🚌</span>
          <span>KSRTC Tracker</span>
        </div>
        <div className="header-actions">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            {user?.email?.split('@')[0]}
          </span>
        </div>
      </header>

      {/* Page content — switches by active nav */}
      <div className="page-content">
        {tabContent[activeNav]?.()}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {[
          { key: 'home',    icon: '🏠',  label: 'Home'    },
          { key: 'routes',  icon: '🗺️',  label: 'Routes'  },
          { key: 'fav',     icon: '⭐',  label: 'Saved'   },
          { key: 'profile', icon: '👤',  label: 'Profile' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`nav-item ${activeNav === tab.key ? 'active' : ''}`}
            onClick={() => setActiveNav(tab.key)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
