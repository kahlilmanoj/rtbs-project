/**
 * Thiruvananthapuram KSRTC Bus Stop Database
 *
 * For stops that exist on both sides of the road, a `variants` object holds
 * direction-specific coordinates so each route can pin the correct platform:
 *
 *   northbound — heading away from Thampanoor towards Kowdiar / Pattom / beyond
 *   southbound — heading back towards Thampanoor from the north
 *   eastbound  — heading east towards Karamana / Neyyattinkara corridor
 *   westbound  — heading west back towards Thampanoor from the east
 *   outbound   — generic "away from Thampanoor" where N/S/E/W is ambiguous
 *   inbound    — generic "returning to Thampanoor"
 *
 * Coordinate offsets between the two sides are ~15–25 m, matching the actual
 * separation between the northbound and southbound kerb-side bus shelters.
 *
 * Terminals and single-platform stops have only `lat`/`lng` (no variants).
 */

export const STOP_DB = {

  // ── Major Terminals ─────────────────────────────────────────────────────────

  thampanoor: {
    id: 'thampanoor',
    name: 'Thampanoor',
    fullName: 'Thampanoor Central Bus Stand (KSRTC)',
    lat: 8.4869, lng: 76.9525,
    // Large terminus — all routes share the same platform area
  },

  neyyattinkara: {
    id: 'neyyattinkara',
    name: 'Neyyattinkara',
    fullName: 'Neyyattinkara Bus Stand',
    lat: 8.4010, lng: 77.0882,
  },

  attingal: {
    id: 'attingal',
    name: 'Attingal',
    fullName: 'Attingal Bus Stand',
    lat: 8.6937, lng: 76.8152,
  },

  varkala: {
    id: 'varkala',
    name: 'Varkala',
    fullName: 'Varkala Bus Stand',
    lat: 8.7339, lng: 76.7164,
  },

  kovalam: {
    id: 'kovalam',
    name: 'Kovalam',
    fullName: 'Kovalam Bus Stop',
    lat: 8.3992, lng: 76.9832,
  },

  vizhinjam: {
    id: 'vizhinjam',
    name: 'Vizhinjam',
    fullName: 'Vizhinjam Bus Stand',
    lat: 8.3811, lng: 76.9934,
  },

  kattakkada: {
    id: 'kattakkada',
    name: 'Kattakkada',
    fullName: 'Kattakkada Bus Stand',
    lat: 8.4442, lng: 77.1203,
  },

  venjaramoodu: {
    id: 'venjaramoodu',
    name: 'Venjaramoodu',
    fullName: 'Venjaramoodu Bus Stand',
    lat: 8.6220, lng: 77.0330,
  },

  nedumangadu: {
    id: 'nedumangadu',
    name: 'Nedumangadu',
    fullName: 'Nedumangadu Bus Stand',
    lat: 8.6208, lng: 77.0520,
  },

  // Technopark has two distinct stops (Phase 1 / Phase 3 gates)
  technopark_phase1: {
    id: 'technopark_phase1',
    name: 'Technopark Phase 1',
    lat: 8.5572, lng: 76.8819,
  },

  technopark_phase3: {
    id: 'technopark_phase3',
    name: 'Technopark Phase 3',
    lat: 8.5637, lng: 76.8735,
  },

  // CC-2 ends at the general Technopark stop (Phase 1 gate area)
  technopark: {
    id: 'technopark',
    name: 'Technopark',
    lat: 8.5572, lng: 76.8819,
  },

  // ── Directional Stops — MG Road / Statue Road corridor (N–S axis) ───────────
  // Buses heading north use the western-kerb shelter; southbound the eastern-kerb.

  palayam: {
    id: 'palayam',
    name: 'Palayam',
    fullName: 'Palayam Bus Stop',
    lat: 8.5005, lng: 76.9509,                        // midpoint fallback
    variants: {
      northbound: { lat: 8.5008, lng: 76.9505 },      // western kerb — towards Kowdiar / Statue Jn
      southbound: { lat: 8.5001, lng: 76.9513 },      // eastern kerb — towards Thampanoor / East Fort
    },
  },

  vellayambalam: {
    id: 'vellayambalam',
    name: 'Vellayambalam',
    fullName: 'Vellayambalam Bus Stop',
    lat: 8.5065, lng: 76.9494,
    variants: {
      northbound: { lat: 8.5068, lng: 76.9491 },      // western kerb — towards Kowdiar
      southbound: { lat: 8.5062, lng: 76.9497 },      // eastern kerb — towards Thampanoor
    },
  },

  kowdiar: {
    id: 'kowdiar',
    name: 'Kowdiar',
    fullName: 'Kowdiar Bus Stop',
    lat: 8.5143, lng: 76.9514,
    variants: {
      northbound: { lat: 8.5146, lng: 76.9511 },      // towards Pattom / Medical College
      southbound: { lat: 8.5140, lng: 76.9518 },      // towards Vellayambalam / Thampanoor
    },
  },

  museum: {
    id: 'museum',
    name: 'Museum',
    fullName: 'Museum Bus Stop (Natural History Museum)',
    lat: 8.5036, lng: 76.9502,
    variants: {
      northbound: { lat: 8.5038, lng: 76.9499 },
      southbound: { lat: 8.5033, lng: 76.9505 },
    },
  },

  aristo: {
    id: 'aristo',
    name: 'Aristo',
    fullName: 'Aristo Junction Bus Stop',
    lat: 8.4982, lng: 76.9488,
    variants: {
      northbound: { lat: 8.4984, lng: 76.9485 },      // towards Palayam
      southbound: { lat: 8.4980, lng: 76.9491 },      // towards Thampanoor
    },
  },

  // ── Directional Stops — East Fort / Chalai / Karamana corridor (E axis) ─────
  // Buses heading east use the northern-kerb shelter; westbound the southern-kerb.

  east_fort: {
    id: 'east_fort',
    name: 'East Fort',
    fullName: 'East Fort Bus Stop',
    lat: 8.4836, lng: 76.9463,
    variants: {
      outbound: { lat: 8.4834, lng: 76.9461 },        // heading towards Chalai / Pappanamcode
      inbound:  { lat: 8.4838, lng: 76.9465 },        // heading back to Thampanoor
    },
  },

  chalai: {
    id: 'chalai',
    name: 'Chalai',
    fullName: 'Chalai Bus Stop',
    lat: 8.4878, lng: 76.9592,
    variants: {
      eastbound: { lat: 8.4876, lng: 76.9595 },
      westbound: { lat: 8.4880, lng: 76.9589 },
    },
  },

  karamana: {
    id: 'karamana',
    name: 'Karamana',
    fullName: 'Karamana Bus Stop',
    lat: 8.4823, lng: 76.9675,
    variants: {
      eastbound: { lat: 8.4821, lng: 76.9678 },       // towards Pappanamcode / Neyyattinkara
      westbound: { lat: 8.4825, lng: 76.9672 },       // back towards Thampanoor
    },
  },

  nemom: {
    id: 'nemom',
    name: 'Nemom',
    fullName: 'Nemom Bus Stop',
    lat: 8.4585, lng: 76.9540,
    variants: {
      outbound: { lat: 8.4583, lng: 76.9542 },        // heading south / east
      inbound:  { lat: 8.4587, lng: 76.9538 },        // returning north
    },
  },

  // ── Single-platform intermediate stops ──────────────────────────────────────

  pattom:          { id: 'pattom',          name: 'Pattom',            lat: 8.5222, lng: 76.9466 },
  medical_college: { id: 'medical_college', name: 'Medical College',   lat: 8.5238, lng: 76.9298 },
  ulloor:          { id: 'ulloor',          name: 'Ulloor',            lat: 8.5298, lng: 76.9183 },
  sreekaryam:      { id: 'sreekaryam',      name: 'Sreekaryam',        lat: 8.5390, lng: 76.9076 },
  kazhakuttam:     { id: 'kazhakuttam',     name: 'Kazhakuttam',       lat: 8.5618, lng: 76.8753 },

  pettah:          { id: 'pettah',          name: 'Pettah',            lat: 8.4925, lng: 76.9308 },
  chakkai:         { id: 'chakkai',         name: 'Chakkai',           lat: 8.5028, lng: 76.9175 },
  mukkola:         { id: 'mukkola',         name: 'Mukkola',           lat: 8.5175, lng: 76.9052 },
  enchakkal:       { id: 'enchakkal',       name: 'Enchakkal',         lat: 8.5295, lng: 76.8978 },
  karyavattom:     { id: 'karyavattom',     name: 'Karyavattom',       lat: 8.5436, lng: 76.8876 },

  pappanamcode:    { id: 'pappanamcode',    name: 'Pappanamcode',      lat: 8.4690, lng: 76.9543 },
  kalliyoor:       { id: 'kalliyoor',       name: 'Kalliyoor',         lat: 8.4435, lng: 76.9840 },
  aruvikkara:      { id: 'aruvikkara',      name: 'Aruvikkara',        lat: 8.4308, lng: 77.0020 },
  balaramapuram:   { id: 'balaramapuram',   name: 'Balaramapuram',     lat: 8.3975, lng: 77.0348 },
  avanavanchery:   { id: 'avanavanchery',   name: 'Avanavanchery',     lat: 8.3928, lng: 77.0543 },
  parasuvaikkal:   { id: 'parasuvaikkal',   name: 'Parasuvaikkal',     lat: 8.3958, lng: 77.0723 },

  chanthavila:     { id: 'chanthavila',     name: 'Chanthavila',       lat: 8.5920, lng: 76.8608 },
  chirayinkeezhu:  { id: 'chirayinkeezhu',  name: 'Chirayinkeezhu',    lat: 8.6358, lng: 76.8515 },
  kallambalam:     { id: 'kallambalam',     name: 'Kallambalam',       lat: 8.6553, lng: 76.8382 },
  attingal_jn:     { id: 'attingal_jn',     name: 'Attingal Junction', lat: 8.6838, lng: 76.8220 },

  peroorkada:      { id: 'peroorkada',      name: 'Peroorkada',        lat: 8.5165, lng: 76.9065 },
  vattiyoorkavu:   { id: 'vattiyoorkavu',   name: 'Vattiyoorkavu',     lat: 8.5530, lng: 76.9478 },
  karickom:        { id: 'karickom',        name: 'Karickom',          lat: 8.5818, lng: 76.9784 },
  vembayam:        { id: 'vembayam',        name: 'Vembayam',          lat: 8.5992, lng: 77.0002 },
  aryanad:         { id: 'aryanad',         name: 'Aryanad',           lat: 8.6108, lng: 77.0168 },
  pothencode:      { id: 'pothencode',      name: 'Pothencode',        lat: 8.6157, lng: 77.0342 },

  maranalloor:     { id: 'maranalloor',     name: 'Maranalloor',       lat: 8.4402, lng: 77.0222 },
  vellarada:       { id: 'vellarada',       name: 'Vellarada',         lat: 8.4432, lng: 77.0652 },
  peringamala:     { id: 'peringamala',     name: 'Peringamala',       lat: 8.4437, lng: 77.0922 },

  poovar_road:     { id: 'poovar_road',     name: 'Poovar Road',       lat: 8.4378, lng: 76.9712 },
  kovalam_jn:      { id: 'kovalam_jn',      name: 'Kovalam Junction',  lat: 8.3938, lng: 76.9902 },
  veli:            { id: 'veli',            name: 'Veli',              lat: 8.4112, lng: 76.9850 },

  mangalapuram:    { id: 'mangalapuram',    name: 'Mangalapuram',      lat: 8.5692, lng: 76.8960 },
  kaniyapuram:     { id: 'kaniyapuram',     name: 'Kaniyapuram',       lat: 8.5752, lng: 76.9192 },

  jagathy:         { id: 'jagathy',         name: 'Jagathy',           lat: 8.5097, lng: 76.9530 },
  pongummoodu:     { id: 'pongummoodu',     name: 'Pongummoodu',       lat: 8.5130, lng: 76.9558 },

  pmg:             { id: 'pmg',             name: 'PMG',               lat: 8.5035, lng: 76.9438 },
  vikas_bhavan:    { id: 'vikas_bhavan',    name: 'Vikas Bhavan',      lat: 8.5052, lng: 76.9366 },

  parippally:      { id: 'parippally',      name: 'Parippally',        lat: 8.7052, lng: 76.7897 },
  manamboor:       { id: 'manamboor',       name: 'Manamboor',         lat: 8.7122, lng: 76.7722 },
  edava:           { id: 'edava',           name: 'Edava',             lat: 8.7197, lng: 76.7490 },
  varkala_town:    { id: 'varkala_town',    name: 'Varkala Town',      lat: 8.7307, lng: 76.7212 },
};

/**
 * Resolve a stop to {name, lat, lng}.
 *
 * @param {string} stopId   - Key in STOP_DB (e.g. 'palayam')
 * @param {string|null} variant - Direction variant (e.g. 'northbound') or null for default
 */
export function getStopCoords(stopId, variant = null) {
  const stop = STOP_DB[stopId];
  if (!stop) throw new Error(`Unknown bus stop id: "${stopId}"`);
  if (variant && stop.variants?.[variant]) {
    return { name: stop.name, ...stop.variants[variant] };
  }
  return { name: stop.name, lat: stop.lat, lng: stop.lng };
}
