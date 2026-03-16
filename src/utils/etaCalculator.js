const EARTH_RADIUS_KM = 6371;

/**
 * Calculate the great-circle distance between two coordinates using the
 * Haversine formula. Returns distance in kilometres.
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate ETA in minutes from a bus position to a stop position.
 * Falls back to 30 km/h if speed is 0 or undefined.
 * Returns at minimum 1 minute.
 */
export function calculateETA(busLat, busLng, stopLat, stopLng, speedKmh) {
  const distance = haversineDistance(busLat, busLng, stopLat, stopLng);
  const effectiveSpeed = speedKmh && speedKmh > 0 ? speedKmh : 30;
  const hours = distance / effectiveSpeed;
  const minutes = hours * 60;
  return Math.max(1, Math.round(minutes));
}

/**
 * Format a minutes value into a human-readable string.
 * e.g. 5 → "5 min", 65 → "1 hr 5 min"
 */
export function formatETA(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hrs} hr`;
  }
  return `${hrs} hr ${mins} min`;
}
