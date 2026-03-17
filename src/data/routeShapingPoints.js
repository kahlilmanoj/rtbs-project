/**
 * Hidden "via:" shaping waypoints injected between specific stop pairs.
 *
 * These force the Directions API onto the correct road without adding visible
 * stopover markers on the map.
 *
 * Key format: "<fromStopIndex>→<toStopIndex>" (0-based, within each route's stop list)
 */

// ── Reusable corridor segments ────────────────────────────────────────────────

// Pattom-Kowdiar Road: keeps route off the Zoo/Kumarapuram detour
const KOWDIAR_TO_PATTOM = [
  { lat: 8.5168, lng: 76.9496 }, // Thycaud — on Pattom-Kowdiar Rd
  { lat: 8.5198, lng: 76.9480 }, // approaching Pattom junction
];

// From Vellayambalam to Pattom (routes that skip Kowdiar stop)
const VELLAYAMBALAM_TO_PATTOM = [
  { lat: 8.5108, lng: 76.9497 }, // Kowdiar area — keeps on Statue/Pattom-Kowdiar Rd
  { lat: 8.5168, lng: 76.9496 }, // Thycaud
  { lat: 8.5198, lng: 76.9480 }, // approaching Pattom
];

// JN Road: Pattom junction going west toward Medical College
const PATTOM_TO_MEDCOLLEGE = [
  { lat: 8.5228, lng: 76.9382 }, // JN Road midpoint
];

// Inland bypass: Sreekaryam → Kazhakuttam (avoids NH-66 coastal loop)
const SREEKARYAM_TO_KAZHAKUTTAM = [
  { lat: 8.5452, lng: 76.8996 }, // Sreekaryam bypass junction
  { lat: 8.5537, lng: 76.8864 }, // mid bypass road
  { lat: 8.5580, lng: 76.8808 }, // approach Kazhakuttam
];

// Technopark Avenue: Phase 1 gate → Phase 3 gate (avoids exiting campus)
const TECHNOPARK_PHASE1_TO_PHASE3 = [
  { lat: 8.5600, lng: 76.8782 }, // Technopark Avenue inside campus
];

// Nemom → Kalliyoor (Neyyattinkara / Kattakkada corridor)
const NEMOM_TO_KALLIYOOR = [
  { lat: 8.4520, lng: 76.9645 },
  { lat: 8.4480, lng: 76.9740 },
];

// ── Per-route shaping point config ───────────────────────────────────────────

export const ROUTE_SHAPING_POINTS = {

  // CC-1: Thampanoor → Palayam → Vellayambalam → Kowdiar → Pattom → Med College
  //       → Ulloor → Sreekaryam → Kazhakuttam → Technopark Phase1 → Phase3
  'route-CC-1': {
    '3→4':  KOWDIAR_TO_PATTOM,          // kowdiar(northbound) → pattom
    '4→5':  PATTOM_TO_MEDCOLLEGE,       // pattom → medical_college
    '7→8':  SREEKARYAM_TO_KAZHAKUTTAM,  // sreekaryam → kazhakuttam
    '9→10': TECHNOPARK_PHASE1_TO_PHASE3,// technopark_phase1 → technopark_phase3
  },

  // CS-1: Thampanoor → Karamana → Pappanamcode → Nemom → Kalliyoor → …
  'route-CS-1': {
    '3→4': NEMOM_TO_KALLIYOOR,
  },

  // CS-2: Thampanoor → Palayam → Medical College → Sreekaryam → Kazhakuttam → …
  'route-CS-2': {
    '3→4': SREEKARYAM_TO_KAZHAKUTTAM,
  },

  // CS-5: Thampanoor → Karamana → Nemom → Kalliyoor → …
  'route-CS-5': {
    '2→3': NEMOM_TO_KALLIYOOR,
  },

  // CS-7: Thampanoor → Palayam → Kowdiar → Pattom → Med College
  //       → Ulloor → Sreekaryam → Kazhakuttam → Mangalapuram → Kaniyapuram
  'route-CS-7': {
    '2→3': KOWDIAR_TO_PATTOM,
    '3→4': PATTOM_TO_MEDCOLLEGE,
    '6→7': SREEKARYAM_TO_KAZHAKUTTAM,
  },

  // CS-9: Thampanoor → Sreekaryam → Kazhakuttam → …
  'route-CS-9': {
    '1→2': SREEKARYAM_TO_KAZHAKUTTAM,
  },

  // CR-2: Thampanoor → Palayam → Vellayambalam → Pattom → Med College → Ulloor → Sreekaryam
  'route-CR-2': {
    '2→3': VELLAYAMBALAM_TO_PATTOM,
    '3→4': PATTOM_TO_MEDCOLLEGE,
  },
};
