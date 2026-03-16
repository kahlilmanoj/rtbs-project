import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-page">
      <div className="splash-logo">🚌</div>
      <h1 className="splash-title">KSRTC</h1>
      <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', marginTop: -4 }}>
        Kerala State Road Transport
      </p>
      <p className="splash-subtitle">Real-Time Bus Tracking System</p>
      <div className="loading-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
