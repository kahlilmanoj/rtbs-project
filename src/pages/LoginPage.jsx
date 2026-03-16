import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { seedDemoData } from '../services/busService';

// Demo credentials for each role
const DEMO_CREDS = {
  passenger: { email: 'passenger@test.com', password: '123456' },
  driver:    { email: 'driver@test.com',    password: '123456' },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const [role, setRole]             = useState('passenger'); // 'passenger' | 'driver'
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [seedLoading, setSeedLoading]   = useState(false);
  const [seedSuccess, setSeedSuccess]   = useState('');

  // Switch role toggle — also pre-fills demo credentials
  const switchRole = (newRole) => {
    setRole(newRole);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Save the role the user selected so AuthContext can read it instantly
      localStorage.setItem('rtbs_role', role);
    } catch (err) {
      const messages = {
        'auth/user-not-found':     'No account found with this email.',
        'auth/wrong-password':     'Incorrect password. Please try again.',
        'auth/invalid-email':      'Please enter a valid email address.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests':  'Too many attempts. Please wait and try again.',
      };
      setError(messages[err.code] || `Login failed: ${err.message}`);
      setLoginLoading(false);
    }
  };

  // Navigate once AuthContext resolves the role after sign-in
  React.useEffect(() => {
    if (userRole && loginLoading) {
      setLoginLoading(false);
      navigate(userRole === 'driver' ? '/driver-dashboard' : '/passenger-home');
    }
  }, [userRole, loginLoading, navigate]);

  const handleSeedData = async () => {
    setSeedLoading(true);
    setSeedSuccess('');
    setError('');
    try {
      await seedDemoData();
      setSeedSuccess('Demo data seeded! Routes and buses are ready.');
    } catch (err) {
      setError(`Seed failed: ${err.message}`);
    } finally {
      setSeedLoading(false);
    }
  };

  // Fill the form with demo credentials for the selected role
  const fillDemo = () => {
    setEmail(DEMO_CREDS[role].email);
    setPassword(DEMO_CREDS[role].password);
  };

  const isDriver = role === 'driver';

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">{isDriver ? '🚌' : '🧍'}</div>
        <h1 className="login-title">KSRTC</h1>
        <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 2 }}>
          Kerala State Road Transport
        </p>
        <p className="login-subtitle">Real-Time Bus Tracking System</p>

        {/* Role Toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-btn ${!isDriver ? 'role-btn-active' : ''}`}
            onClick={() => switchRole('passenger')}
          >
            🧍 Passenger
          </button>
          <button
            type="button"
            className={`role-btn ${isDriver ? 'role-btn-active role-btn-driver' : ''}`}
            onClick={() => switchRole('driver')}
          >
            🚌 Driver
          </button>
        </div>

        {/* Role label */}
        <p className="role-hint">
          {isDriver
            ? 'Sign in to start your trip and share live location'
            : 'Sign in to search buses and track live arrivals'}
        </p>

        {error      && <div className="error-message">{error}</div>}
        {seedSuccess && <div className="success-message">{seedSuccess}</div>}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <label className="input-label">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder={DEMO_CREDS[role].email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label className="input-label">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button
            type="submit"
            className={`btn mt-8 ${isDriver ? 'btn-driver' : 'btn-primary'}`}
            disabled={loginLoading}
          >
            {loginLoading ? 'Signing in…' : `Sign In as ${isDriver ? 'Driver' : 'Passenger'}`}
          </button>
        </form>

        {/* Quick fill demo creds */}
        <button
          type="button"
          className="btn btn-secondary mt-8"
          style={{ fontSize: 13 }}
          onClick={fillDemo}
        >
          Use Demo {isDriver ? 'Driver' : 'Passenger'} Account
        </button>

        <hr className="divider" />

        <details style={{ marginBottom: 0 }}>
          <summary style={{ fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 0', userSelect: 'none', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚙️</span>
            <span>First time? Setup demo data</span>
          </summary>
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 13 }}
              onClick={handleSeedData}
              disabled={seedLoading}
            >
              {seedLoading ? 'Setting up…' : 'Initialise Demo Routes &amp; Buses'}
            </button>
            <p className="seed-note">Run once to load demo data into Firebase</p>
          </div>
        </details>
      </div>
    </div>
  );
}
