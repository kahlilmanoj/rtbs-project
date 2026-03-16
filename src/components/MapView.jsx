import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { GoogleMap, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const DEFAULT_CENTER = { lat: 8.5241, lng: 76.9366 };
const MAP_CONTAINER  = { width: '100%', height: '100%' };
const API_KEY        = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES      = ['geometry'];

const MAP_OPTIONS = {
  mapTypeControl:    false,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl:       true,
  gestureHandling:   'greedy',
  tilt:              45,   // 3-D perspective tilt (visible on satellite/hybrid at zoom ≥ 12)
  styles: [
    { featureType: 'poi.business',  stylers: [{ visibility: 'off' }] },
    { featureType: 'transit',       elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { featureType: 'water',         elementType: 'geometry', stylers: [{ color: '#b3d9f5' }] },
    { featureType: 'landscape',     elementType: 'geometry', stylers: [{ color: '#f0f4f0' }] },
    { featureType: 'road.highway',  elementType: 'geometry', stylers: [{ color: '#e8e8e8' }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  ],
};

const BUS_ICON_URL = '/ksrtc-bus-model-3d-model-50fa7de9c9-removebg-preview.png';

function calcBearing(from, to) {
  const r  = Math.PI / 180;
  const dL = (to.lng - from.lng) * r;
  const y  = Math.sin(dL) * Math.cos(to.lat * r);
  const x  = Math.cos(from.lat * r) * Math.sin(to.lat * r)
            - Math.sin(from.lat * r) * Math.cos(to.lat * r) * Math.cos(dL);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function closestIndexOnPath(path, pos) {
  let minD = Infinity, idx = 0;
  path.forEach((p, i) => {
    const d = Math.hypot(p.lat() - pos.lat, p.lng() - pos.lng);
    if (d < minD) { minD = d; idx = i; }
  });
  return idx;
}

// Animate marker AND map centre together in the same RAF loop so they stay in sync.
// durationMs should match the GPS update interval.
function animateMarkerAndMap(marker, map, toLatLng, durationMs, rafRef) {
  if (rafRef.current) cancelAnimationFrame(rafRef.current);
  const G    = window.google.maps;
  const from = marker.getPosition();
  if (!from) {
    marker.setPosition(toLatLng);
    map.setCenter(toLatLng);
    return;
  }
  const fromLat = from.lat();
  const fromLng = from.lng();
  const toLat   = toLatLng.lat();
  const toLng   = toLatLng.lng();
  const start   = performance.now();

  function step(now) {
    const raw = Math.min((now - start) / durationMs, 1);
    // ease-in-out cubic
    const t   = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
    const pos = new G.LatLng(
      fromLat + (toLat - fromLat) * t,
      fromLng + (toLng - fromLng) * t,
    );
    marker.setPosition(pos);
    map.setCenter(pos);           // moves with marker — no lag, no separate pan
    if (raw < 1) rafRef.current = requestAnimationFrame(step);
  }
  rafRef.current = requestAnimationFrame(step);
}

// ── Fallback when API key is missing ────────────────────────────────────────
function MapPlaceholder({ busLocation, message }) {
  return (
    <div className="map-placeholder">
      <span style={{ fontSize: 36 }}>🗺️</span>
      <p style={{ fontWeight: 600, marginTop: 8, fontSize: 14 }}>{message}</p>
      <p style={{ fontSize: 12, marginTop: 4, color: 'var(--text-secondary)' }}>
        Set <code>VITE_GOOGLE_MAPS_API_KEY</code> in <code>.env.local</code>
      </p>
      {busLocation?.lat && (
        <p style={{ marginTop: 10, fontSize: 12, color: 'var(--primary)', fontFamily: 'monospace' }}>
          📍 {Number(busLocation.lat).toFixed(5)}, {Number(busLocation.lng).toFixed(5)}
        </p>
      )}
    </div>
  );
}

// ── Public export ────────────────────────────────────────────────────────────
export default function MapView({ busLocation, routeStops, routeId, encodedPolyline, routePath }) {
  if (!API_KEY || API_KEY === 'your_google_maps_api_key') {
    return <MapPlaceholder busLocation={busLocation} message="Google Maps API key not configured." />;
  }
  return (
    <MapContent
      busLocation={busLocation}
      routeStops={routeStops}
      routeId={routeId}
      encodedPolyline={encodedPolyline}
      routePath={routePath}
    />
  );
}

// ── Map implementation ───────────────────────────────────────────────────────
function MapContent({ busLocation, routeStops, routeId, encodedPolyline, routePath }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries:        LIBRARIES,
    id:               'rtbs-google-map-v2',
  });

  const mapRef              = useRef(null);
  const busMarkerRef        = useRef(null);
  const markerRafRef        = useRef(null);   // animation frame handle

  // Remaining route — solid dark blue ahead of bus
  const remainPolyRef       = useRef(null);

  // Covered route — two stacked polylines: dark blue border + light blue center
  const coveredBorderRef    = useRef(null);
  const coveredFillRef      = useRef(null);

  const stopMarkersRef      = useRef([]);
  const trafficRef          = useRef(null);
  const fullRoadPathRef     = useRef([]);
  const prevLocRef          = useRef(null);
  const headingRef          = useRef(0);

  // Stable initial center — computed once, never changes (avoids map re-render)
  const initialCenter = useMemo(() => {
    if (busLocation?.lat)  return { lat: Number(busLocation.lat),         lng: Number(busLocation.lng) };
    if (routeStops?.[0])   return { lat: Number(routeStops[0].lat),       lng: Number(routeStops[0].lng) };
    return DEFAULT_CENTER;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — only compute on first mount

  const [showInfo, setShowInfo] = useState(false);
  const [infoPos,  setInfoPos]  = useState(null);
  const [infoData, setInfoData] = useState(null);
  const [routeErr, setRouteErr] = useState('');

  // ── Create all overlays once map is ready ─────────────────────────────────
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    const G = window.google.maps;

    trafficRef.current = new G.TrafficLayer();
    trafficRef.current.setMap(map);

    // Remaining route — KSRTC red (full width)
    remainPolyRef.current = new G.Polyline({
      map,
      path:          [],
      strokeColor:   '#c0392b',
      strokeOpacity: 0.92,
      strokeWeight:  7,
      zIndex:        3,
    });

    // Covered — muted red border (same weight as remaining)
    coveredBorderRef.current = new G.Polyline({
      map,
      path:          [],
      strokeColor:   '#c0392b',
      strokeOpacity: 0.45,
      strokeWeight:  7,
      zIndex:        1,
    });

    // Covered — KSRTC amber transparent fill on top (narrower = shows border)
    coveredFillRef.current = new G.Polyline({
      map,
      path:          [],
      strokeColor:   '#f9a825',
      strokeOpacity: 0.55,
      strokeWeight:  3,
      zIndex:        2,
    });

    // Bus marker — initial position set to map centre so getPosition() is never undefined
    busMarkerRef.current = new G.Marker({
      map,
      position: map.getCenter(),
      zIndex:   1000,
      title:    'Bus',
      icon: {
        url:        BUS_ICON_URL,
        scaledSize: new G.Size(52, 34),
        anchor:     new G.Point(26, 17),
      },
    });
    busMarkerRef.current.addListener('click', () => setShowInfo((v) => !v));
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => {
    if (markerRafRef.current) cancelAnimationFrame(markerRafRef.current);
    busMarkerRef.current?.setMap(null);
    remainPolyRef.current?.setMap(null);
    coveredBorderRef.current?.setMap(null);
    coveredFillRef.current?.setMap(null);
    stopMarkersRef.current.forEach((m) => m.setMap(null));
    trafficRef.current?.setMap(null);
  }, []);

  // ── Build road path: use cached polyline or fetch segment-by-segment via Directions API ─
  useEffect(() => {
    if (!isLoaded) return;
    const G = window.google.maps;
    let cancelled = false;

    // ── Fast path: cached encoded polyline stored in Firestore ──────────────
    if (encodedPolyline) {
      try {
        const pts = G.geometry.encoding.decodePath(encodedPolyline);
        fullRoadPathRef.current = pts;
        remainPolyRef.current?.setPath(pts);
        coveredBorderRef.current?.setPath([]);
        coveredFillRef.current?.setPath([]);
        setRouteErr('');
        return;
      } catch {
        // Corrupted stored polyline — fall through to recompute
      }
    }

    if (!routeStops?.length || routeStops.length < 2) return;

    // ── Slow path: route each consecutive stop-pair independently ────────────
    // Routing stop-to-stop (2 points per call) gives more accurate road paths
    // than sending all stops as waypoints in a single request.
    const svc = new G.DirectionsService();

    async function buildSegmentedPath() {
      const combinedPath = [];

      for (let i = 0; i < routeStops.length - 1; i++) {
        if (cancelled) return;

        const segPath = await new Promise((resolve) => {
          svc.route(
            {
              origin:      { lat: Number(routeStops[i].lat),     lng: Number(routeStops[i].lng) },
              destination: { lat: Number(routeStops[i + 1].lat), lng: Number(routeStops[i + 1].lng) },
              travelMode:  G.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === G.DirectionsStatus.OK) {
                const pts = [];
                result.routes[0].legs[0].steps.forEach((step) =>
                  step.path.forEach((pt) => pts.push(pt)),
                );
                resolve(pts);
              } else {
                // Fallback: straight line between these two stops
                resolve([
                  new G.LatLng(Number(routeStops[i].lat),     Number(routeStops[i].lng)),
                  new G.LatLng(Number(routeStops[i + 1].lat), Number(routeStops[i + 1].lng)),
                ]);
              }
            },
          );
        });

        segPath.forEach((pt) => combinedPath.push(pt));

        // Small delay between calls to stay within rate limits
        if (i < routeStops.length - 2) {
          await new Promise((r) => setTimeout(r, 80));
        }
      }

      if (cancelled || combinedPath.length === 0) return;

      fullRoadPathRef.current = combinedPath;
      remainPolyRef.current?.setPath(combinedPath);
      coveredBorderRef.current?.setPath([]);
      coveredFillRef.current?.setPath([]);
      setRouteErr('');

      // Cache encoded polyline in Firestore so next load is instant
      if (routeId) {
        try {
          const encoded = G.geometry.encoding.encodePath(combinedPath);
          updateDoc(doc(db, 'routes', routeId), { encodedPolyline: encoded }).catch(() => {});
        } catch { /* ignore encode errors */ }
      }
    }

    buildSegmentedPath();
    return () => { cancelled = true; };
  }, [isLoaded, routeStops, encodedPolyline, routeId]);

  // ── Place stop markers when stops change ─────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !routeStops?.length) return;
    stopMarkersRef.current.forEach((m) => m.setMap(null));
    stopMarkersRef.current = [];

    const G = window.google.maps;
    routeStops.forEach((stop, i) => {
      const isFirst = i === 0;
      const isLast  = i === routeStops.length - 1;
      const color   = isFirst ? '#2e7d32' : isLast ? '#7b0000' : '#c0392b';
      const m = new G.Marker({
        map:      mapRef.current,
        position: { lat: Number(stop.lat), lng: Number(stop.lng) },
        title:    stop.name,
        zIndex:   500,
        icon: {
          path:         G.SymbolPath.CIRCLE,
          scale:        isFirst || isLast ? 9 : 6,
          fillColor:    color,
          fillOpacity:  1,
          strokeColor:  '#fff',
          strokeWeight: 2,
        },
        label: { text: stop.name, fontSize: '10px', fontWeight: '700', color: '#212121' },
      });
      stopMarkersRef.current.push(m);
    });
  }, [isLoaded, routeStops]);

  // ── Update bus position + split route into covered / remaining ────────────
  useEffect(() => {
    if (!isLoaded || !busMarkerRef.current || !busLocation?.lat) return;

    const G   = window.google.maps;
    const cur = { lat: Number(busLocation.lat), lng: Number(busLocation.lng) };

    // Snap target to nearest point on the road path so the icon stays on the road
    const fullPath = fullRoadPathRef.current;
    let targetLatLng = new G.LatLng(cur.lat, cur.lng);
    let snappedCur   = cur;

    if (fullPath.length > 1) {
      const splitIdx = closestIndexOnPath(fullPath, cur);
      targetLatLng = fullPath[splitIdx];                        // road-snapped target
      snappedCur   = { lat: targetLatLng.lat(), lng: targetLatLng.lng() };
      coveredBorderRef.current?.setPath(fullPath.slice(0, splitIdx + 1));
      coveredFillRef.current?.setPath(fullPath.slice(0, splitIdx + 1));
      remainPolyRef.current?.setPath(fullPath.slice(splitIdx));
    }

    if (prevLocRef.current) {
      const moved = Math.hypot(snappedCur.lat - prevLocRef.current.lat, snappedCur.lng - prevLocRef.current.lng);
      if (moved > 0.000005) headingRef.current = calcBearing(prevLocRef.current, snappedCur);
    }

    // Animate marker + map centre together (both move in sync, icon on road)
    animateMarkerAndMap(busMarkerRef.current, mapRef.current, targetLatLng, 5800, markerRafRef);

    setInfoPos(snappedCur);
    setInfoData({ speed: busLocation.speed, status: busLocation.tripStatus });
    prevLocRef.current = snappedCur;
  }, [isLoaded, busLocation]);

  if (loadError) {
    return <MapPlaceholder busLocation={busLocation} message={`Map error: ${loadError.message}`} />;
  }
  if (!isLoaded) {
    return (
      <div className="map-placeholder">
        <div className="loading-spinner" />
        <p style={{ marginTop: 12, fontSize: 13 }}>Loading map…</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER}
      center={initialCenter}
      zoom={14}
      options={MAP_OPTIONS}
      onLoad={onMapLoad}
    >
      {routeErr && (
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: 6,
          padding: '4px 12px', fontSize: 11, pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          ⚠ {routeErr}
        </div>
      )}

      {showInfo && infoPos && (
        <InfoWindow position={infoPos} onCloseClick={() => setShowInfo(false)}>
          <div style={{ minWidth: 140, fontFamily: 'system-ui, sans-serif', fontSize: 13 }}>
            <p style={{ fontWeight: 700, color: '#c0392b', marginBottom: 6 }}>🚌 Bus</p>
            <p>Speed: <strong>{infoData?.speed ?? 0} km/h</strong></p>
            <p style={{ marginTop: 3 }}>
              Status:{' '}
              <strong style={{ color: infoData?.status === 'active' ? '#2e7d32' : '#757575' }}>
                {infoData?.status === 'active' ? '● Moving' : '○ Idle'}
              </strong>
            </p>
            <p style={{ marginTop: 6, fontSize: 11, color: '#9e9e9e', fontFamily: 'monospace' }}>
              {infoPos.lat.toFixed(5)}, {infoPos.lng.toFixed(5)}
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
