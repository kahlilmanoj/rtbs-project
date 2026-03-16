import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import SplashPage from './pages/SplashPage';
import LoginPage from './pages/LoginPage';
import PassengerHome from './pages/PassengerHome';
import BusListPage from './pages/BusListPage';
import LiveTrackingPage from './pages/LiveTrackingPage';
import DriverDashboard from './pages/DriverDashboard';
import DriverTrackingPage from './pages/DriverTrackingPage';

// ─── Protected Route Helper ────────────────────────────────────────────────────

function ProtectedRoute({ children, requiredRole }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="page" style={{ justifyContent: 'center' }}>
        <div className="loading-spinner" />
        <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect to the appropriate home page based on role
    if (userRole === 'driver') return <Navigate to="/driver-dashboard" replace />;
    return <Navigate to="/passenger-home" replace />;
  }

  return children;
}

// ─── App Routes ────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Passenger Routes */}
      <Route
        path="/passenger-home"
        element={
          <ProtectedRoute requiredRole="passenger">
            <PassengerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bus-list"
        element={
          <ProtectedRoute requiredRole="passenger">
            <BusListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/live-tracking"
        element={
          <ProtectedRoute requiredRole="passenger">
            <LiveTrackingPage />
          </ProtectedRoute>
        }
      />

      {/* Driver Routes */}
      <Route
        path="/driver-dashboard"
        element={
          <ProtectedRoute requiredRole="driver">
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver-tracking"
        element={
          <ProtectedRoute requiredRole="driver">
            <DriverTrackingPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
