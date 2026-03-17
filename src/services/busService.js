import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { getStopCoords } from '../data/busStops';

// ─── Pure-JS Google Encoded Polyline encoder ──────────────────────────────────
// Encodes [{lat,lng}] to a polyline string without needing Google Maps loaded.
function encodePolylineValue(v) {
  v = v < 0 ? ~(v << 1) : v << 1;
  let s = '';
  while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; }
  return s + String.fromCharCode(v + 63);
}

export function encodePolylineJs(points) {
  let out = '', pLat = 0, pLng = 0;
  for (const { lat, lng } of points) {
    const eLat = Math.round(lat * 1e5);
    const eLng = Math.round(lng * 1e5);
    out += encodePolylineValue(eLat - pLat) + encodePolylineValue(eLng - pLng);
    pLat = eLat; pLng = eLng;
  }
  return out;
}

// ─── Delete all docs in a collection ─────────────────────────────────────────
async function clearCollection(name) {
  const snap = await getDocs(collection(db, name));
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, name, d.id))));
}

// ─── Seed Demo Data (KSRTC Kerala — Thampanoor Central Bus Stand) ─────────────

export async function seedDemoData() {

  // ── Clear old data first ─────────────────────────────────────────────────────
  await clearCollection('routes');
  await clearCollection('buses');
  await clearCollection('busLocations');

  // ── Route + bus definitions (Thiruvananthapuram city routes) ─────────────────
  // Each stop uses { stopId, variant?, order }.
  // Variant selects the correct directional platform from busStops.js.
  // Coordinates are resolved just before writing to Firestore (see loop below).
  const SEED = [
    {
      routeId: 'route-CC-1', busId: 'CC-1',
      routeName: 'City Circular - Thampanoor to Technopark',
      busType: 'City Circular (AC/Non-AC)', fare: 30, distance: 18.2, duration: 55, schedule: '06:00 AM',
      stops: [
        { stopId:'thampanoor',       order:1  },
        { stopId:'palayam',          variant:'northbound', order:2  },
        { stopId:'vellayambalam',    variant:'northbound', order:3  },
        { stopId:'kowdiar',          variant:'northbound', order:4  },
        { stopId:'pattom',           order:5  },
        { stopId:'medical_college',  order:6  },
        { stopId:'ulloor',           order:7  },
        { stopId:'sreekaryam',       order:8  },
        { stopId:'kazhakuttam',      order:9  },
        { stopId:'technopark_phase1',order:10 },
        { stopId:'technopark_phase3',order:11 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4905,lng:76.9519},{lat:8.4935,lng:76.9516},{lat:8.4963,lng:76.9513},{lat:8.4985,lng:76.9511},
        {lat:8.5008,lng:76.9505},{lat:8.5025,lng:76.9500},{lat:8.5045,lng:76.9497},{lat:8.5068,lng:76.9491},{lat:8.5085,lng:76.9498},
        {lat:8.5105,lng:76.9504},{lat:8.5125,lng:76.9509},{lat:8.5146,lng:76.9511},{lat:8.5158,lng:76.9503},{lat:8.5175,lng:76.9492},
        {lat:8.5193,lng:76.9481},{lat:8.5210,lng:76.9472},{lat:8.5222,lng:76.9466},{lat:8.5224,lng:76.9430},{lat:8.5229,lng:76.9390},
        {lat:8.5233,lng:76.9350},{lat:8.5238,lng:76.9298},{lat:8.5251,lng:76.9268},{lat:8.5265,lng:76.9237},{lat:8.5280,lng:76.9210},
        {lat:8.5298,lng:76.9183},{lat:8.5315,lng:76.9159},{lat:8.5338,lng:76.9130},{lat:8.5362,lng:76.9104},{lat:8.5390,lng:76.9076},
        {lat:8.5415,lng:76.9038},{lat:8.5445,lng:76.8995},{lat:8.5475,lng:76.8950},{lat:8.5505,lng:76.8905},{lat:8.5535,lng:76.8860},
        {lat:8.5570,lng:76.8810},{lat:8.5590,lng:76.8785},{lat:8.5618,lng:76.8753},{lat:8.5600,lng:76.8775},{lat:8.5585,lng:76.8795},
        {lat:8.5572,lng:76.8819},{lat:8.5595,lng:76.8793},{lat:8.5612,lng:76.8770},{lat:8.5625,lng:76.8752},{lat:8.5637,lng:76.8735},
      ],
    },
    {
      routeId: 'route-CC-2', busId: 'CC-2',
      routeName: 'City Circular - Thampanoor to Kazhakuttam via East Fort',
      busType: 'City Circular (AC/Non-AC)', fare: 25, distance: 14.6, duration: 50, schedule: '07:30 AM',
      stops: [
        { stopId:'thampanoor',  order:1 },
        { stopId:'east_fort',   variant:'outbound', order:2 },
        { stopId:'pettah',      order:3 },
        { stopId:'chakkai',     order:4 },
        { stopId:'mukkola',     order:5 },
        { stopId:'enchakkal',   order:6 },
        { stopId:'karyavattom', order:7 },
        { stopId:'kazhakuttam', order:8 },
        { stopId:'technopark',  order:9 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4862,lng:76.9500},{lat:8.4850,lng:76.9480},{lat:8.4834,lng:76.9461},{lat:8.4855,lng:76.9430},
        {lat:8.4870,lng:76.9395},{lat:8.4888,lng:76.9360},{lat:8.4905,lng:76.9335},{lat:8.4925,lng:76.9308},{lat:8.4955,lng:76.9280},
        {lat:8.4980,lng:76.9255},{lat:8.5000,lng:76.9225},{lat:8.5015,lng:76.9200},{lat:8.5028,lng:76.9175},{lat:8.5060,lng:76.9152},
        {lat:8.5095,lng:76.9130},{lat:8.5130,lng:76.9100},{lat:8.5155,lng:76.9075},{lat:8.5175,lng:76.9052},{lat:8.5210,lng:76.9022},
        {lat:8.5250,lng:76.9000},{lat:8.5295,lng:76.8978},{lat:8.5330,lng:76.8955},{lat:8.5365,lng:76.8930},{lat:8.5400,lng:76.8905},
        {lat:8.5436,lng:76.8876},{lat:8.5470,lng:76.8845},{lat:8.5505,lng:76.8815},{lat:8.5540,lng:76.8790},{lat:8.5575,lng:76.8770},
        {lat:8.5618,lng:76.8753},{lat:8.5600,lng:76.8775},{lat:8.5585,lng:76.8793},{lat:8.5572,lng:76.8819},
      ],
    },
    {
      routeId: 'route-CS-1', busId: 'CS-1',
      routeName: 'City Shuttle - Thampanoor to Neyyattinkara',
      busType: 'City Shuttle', fare: 40, distance: 26.3, duration: 75, schedule: '08:00 AM',
      stops: [
        { stopId:'thampanoor',    order:1  },
        { stopId:'karamana',      variant:'eastbound', order:2  },
        { stopId:'pappanamcode',  order:3  },
        { stopId:'nemom',         variant:'outbound',  order:4  },
        { stopId:'kalliyoor',     order:5  },
        { stopId:'aruvikkara',    order:6  },
        { stopId:'balaramapuram', order:7  },
        { stopId:'avanavanchery', order:8  },
        { stopId:'parasuvaikkal', order:9  },
        { stopId:'neyyattinkara', order:10 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4865,lng:76.9540},{lat:8.4852,lng:76.9572},{lat:8.4840,lng:76.9620},{lat:8.4830,lng:76.9650},
        {lat:8.4821,lng:76.9678},{lat:8.4790,lng:76.9656},{lat:8.4765,lng:76.9635},{lat:8.4740,lng:76.9610},{lat:8.4720,lng:76.9590},
        {lat:8.4690,lng:76.9543},{lat:8.4660,lng:76.9544},{lat:8.4630,lng:76.9543},{lat:8.4605,lng:76.9542},{lat:8.4583,lng:76.9542},
        {lat:8.4555,lng:76.9580},{lat:8.4520,lng:76.9640},{lat:8.4490,lng:76.9710},{lat:8.4465,lng:76.9775},{lat:8.4435,lng:76.9840},
        {lat:8.4405,lng:76.9890},{lat:8.4370,lng:76.9940},{lat:8.4340,lng:76.9980},{lat:8.4308,lng:77.0020},{lat:8.4250,lng:77.0085},
        {lat:8.4185,lng:77.0155},{lat:8.4110,lng:77.0215},{lat:8.4045,lng:77.0280},{lat:8.3975,lng:77.0348},{lat:8.3960,lng:77.0402},
        {lat:8.3940,lng:77.0468},{lat:8.3928,lng:77.0543},{lat:8.3940,lng:77.0610},{lat:8.3950,lng:77.0660},{lat:8.3958,lng:77.0723},
        {lat:8.3975,lng:77.0790},{lat:8.3990,lng:77.0835},{lat:8.4010,lng:77.0882},
      ],
    },
    {
      routeId: 'route-CS-2', busId: 'CS-2',
      routeName: 'City Shuttle - Thampanoor to Attingal',
      busType: 'City Shuttle', fare: 50, distance: 34.8, duration: 90, schedule: '06:30 AM',
      stops: [
        { stopId:'thampanoor',      order:1  },
        { stopId:'palayam',         variant:'northbound', order:2  },
        { stopId:'medical_college', order:3  },
        { stopId:'sreekaryam',      order:4  },
        { stopId:'kazhakuttam',     order:5  },
        { stopId:'chanthavila',     order:6  },
        { stopId:'chirayinkeezhu',  order:7  },
        { stopId:'kallambalam',     order:8  },
        { stopId:'attingal_jn',     order:9  },
        { stopId:'attingal',        order:10 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4935,lng:76.9516},{lat:8.5008,lng:76.9505},{lat:8.5065,lng:76.9495},{lat:8.5141,lng:76.9516},
        {lat:8.5219,lng:76.9468},{lat:8.5238,lng:76.9298},{lat:8.5295,lng:76.9186},{lat:8.5390,lng:76.9076},{lat:8.5445,lng:76.8995},
        {lat:8.5505,lng:76.8905},{lat:8.5618,lng:76.8753},{lat:8.5700,lng:76.8705},{lat:8.5780,lng:76.8660},{lat:8.5850,lng:76.8630},
        {lat:8.5920,lng:76.8608},{lat:8.5990,lng:76.8585},{lat:8.6075,lng:76.8562},{lat:8.6160,lng:76.8543},{lat:8.6250,lng:76.8530},
        {lat:8.6358,lng:76.8515},{lat:8.6420,lng:76.8480},{lat:8.6480,lng:76.8445},{lat:8.6515,lng:76.8415},{lat:8.6553,lng:76.8382},
        {lat:8.6620,lng:76.8340},{lat:8.6690,lng:76.8295},{lat:8.6760,lng:76.8258},{lat:8.6838,lng:76.8220},{lat:8.6885,lng:76.8188},
        {lat:8.6937,lng:76.8152},
      ],
    },
    {
      routeId: 'route-CS-3', busId: 'CS-3',
      routeName: 'City Shuttle - Thampanoor to Venjaramoodu',
      busType: 'City Shuttle', fare: 40, distance: 22.0, duration: 65, schedule: '09:30 AM',
      stops: [
        { stopId:'thampanoor',   order:1 },
        { stopId:'palayam',      variant:'northbound', order:2 },
        { stopId:'vellayambalam',variant:'northbound', order:3 },
        { stopId:'peroorkada',   order:4 },
        { stopId:'vattiyoorkavu',order:5 },
        { stopId:'karickom',     order:6 },
        { stopId:'vembayam',     order:7 },
        { stopId:'aryanad',      order:8 },
        { stopId:'venjaramoodu', order:9 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4935,lng:76.9516},{lat:8.5008,lng:76.9505},{lat:8.5068,lng:76.9491},{lat:8.5090,lng:76.9380},
        {lat:8.5110,lng:76.9280},{lat:8.5130,lng:76.9185},{lat:8.5150,lng:76.9130},{lat:8.5165,lng:76.9065},{lat:8.5235,lng:76.9100},
        {lat:8.5310,lng:76.9170},{lat:8.5390,lng:76.9260},{lat:8.5460,lng:76.9350},{lat:8.5530,lng:76.9478},{lat:8.5610,lng:76.9540},
        {lat:8.5690,lng:76.9600},{lat:8.5755,lng:76.9670},{lat:8.5818,lng:76.9784},{lat:8.5900,lng:76.9870},{lat:8.5992,lng:77.0002},
        {lat:8.6050,lng:77.0082},{lat:8.6108,lng:77.0168},{lat:8.6160,lng:77.0240},{lat:8.6220,lng:77.0330},
      ],
    },
    {
      routeId: 'route-CS-4', busId: 'CS-4',
      routeName: 'City Shuttle - Thampanoor to Nedumangadu',
      busType: 'City Shuttle', fare: 40, distance: 25.2, duration: 72, schedule: '07:00 AM',
      stops: [
        { stopId:'thampanoor',   order:1 },
        { stopId:'vellayambalam',variant:'northbound', order:2 },
        { stopId:'peroorkada',   order:3 },
        { stopId:'vattiyoorkavu',order:4 },
        { stopId:'karickom',     order:5 },
        { stopId:'vembayam',     order:6 },
        { stopId:'aryanad',      order:7 },
        { stopId:'pothencode',   order:8 },
        { stopId:'nedumangadu',  order:9 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4935,lng:76.9516},{lat:8.5008,lng:76.9505},{lat:8.5068,lng:76.9491},{lat:8.5110,lng:76.9280},
        {lat:8.5140,lng:76.9130},{lat:8.5165,lng:76.9065},{lat:8.5310,lng:76.9170},{lat:8.5460,lng:76.9350},{lat:8.5530,lng:76.9478},
        {lat:8.5690,lng:76.9600},{lat:8.5818,lng:76.9784},{lat:8.5992,lng:77.0002},{lat:8.6108,lng:77.0168},{lat:8.6157,lng:77.0342},
        {lat:8.6180,lng:77.0428},{lat:8.6208,lng:77.0520},
      ],
    },
    {
      routeId: 'route-CS-5', busId: 'CS-5',
      routeName: 'City Shuttle - Thampanoor to Kattakkada',
      busType: 'City Shuttle', fare: 40, distance: 22.5, duration: 65, schedule: '05:30 AM',
      stops: [
        { stopId:'thampanoor',  order:1 },
        { stopId:'karamana',    variant:'eastbound', order:2 },
        { stopId:'nemom',       variant:'outbound',  order:3 },
        { stopId:'kalliyoor',   order:4 },
        { stopId:'maranalloor', order:5 },
        { stopId:'vellarada',   order:6 },
        { stopId:'peringamala', order:7 },
        { stopId:'kattakkada',  order:8 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4852,lng:76.9572},{lat:8.4821,lng:76.9678},{lat:8.4730,lng:76.9610},{lat:8.4690,lng:76.9543},
        {lat:8.4640,lng:76.9543},{lat:8.4583,lng:76.9542},{lat:8.4530,lng:76.9650},{lat:8.4480,lng:76.9740},{lat:8.4435,lng:76.9840},
        {lat:8.4420,lng:76.9970},{lat:8.4405,lng:77.0080},{lat:8.4402,lng:77.0222},{lat:8.4405,lng:77.0380},{lat:8.4415,lng:77.0510},
        {lat:8.4432,lng:77.0652},{lat:8.4432,lng:77.0785},{lat:8.4437,lng:77.0922},{lat:8.4437,lng:77.1060},{lat:8.4442,lng:77.1203},
      ],
    },
    {
      routeId: 'route-CS-6', busId: 'CS-6',
      routeName: 'City Shuttle - Thampanoor to Kovalam',
      busType: 'City Shuttle', fare: 30, distance: 16.2, duration: 50, schedule: '08:30 AM',
      stops: [
        { stopId:'thampanoor',  order:1 },
        { stopId:'east_fort',   variant:'outbound', order:2 },
        { stopId:'pappanamcode',order:3 },
        { stopId:'nemom',       variant:'outbound', order:4 },
        { stopId:'poovar_road', order:5 },
        { stopId:'vizhinjam',   order:6 },
        { stopId:'kovalam_jn',  order:7 },
        { stopId:'kovalam',     order:8 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4862,lng:76.9500},{lat:8.4834,lng:76.9461},{lat:8.4785,lng:76.9486},{lat:8.4740,lng:76.9515},
        {lat:8.4690,lng:76.9543},{lat:8.4640,lng:76.9543},{lat:8.4583,lng:76.9542},{lat:8.4535,lng:76.9580},{lat:8.4490,lng:76.9620},
        {lat:8.4450,lng:76.9660},{lat:8.4378,lng:76.9712},{lat:8.4305,lng:76.9750},{lat:8.4220,lng:76.9790},{lat:8.4130,lng:76.9840},
        {lat:8.4030,lng:76.9880},{lat:8.3938,lng:76.9902},{lat:8.3860,lng:76.9930},{lat:8.3811,lng:76.9934},{lat:8.3860,lng:76.9920},
        {lat:8.3900,lng:76.9910},{lat:8.3938,lng:76.9902},{lat:8.3965,lng:76.9870},{lat:8.3980,lng:76.9852},{lat:8.3992,lng:76.9832},
      ],
    },
    {
      routeId: 'route-CS-7', busId: 'CS-7',
      routeName: 'City Shuttle - Thampanoor to Kaniyapuram',
      busType: 'City Shuttle', fare: 35, distance: 21.2, duration: 60, schedule: '07:30 AM',
      stops: [
        { stopId:'thampanoor',   order:1  },
        { stopId:'palayam',      variant:'northbound', order:2  },
        { stopId:'kowdiar',      variant:'northbound', order:3  },
        { stopId:'pattom',       order:4  },
        { stopId:'medical_college',order:5 },
        { stopId:'ulloor',       order:6  },
        { stopId:'sreekaryam',   order:7  },
        { stopId:'kazhakuttam',  order:8  },
        { stopId:'mangalapuram', order:9  },
        { stopId:'kaniyapuram',  order:10 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.5008,lng:76.9505},{lat:8.5068,lng:76.9491},{lat:8.5146,lng:76.9511},{lat:8.5222,lng:76.9466},
        {lat:8.5238,lng:76.9298},{lat:8.5298,lng:76.9183},{lat:8.5390,lng:76.9076},{lat:8.5445,lng:76.8995},{lat:8.5505,lng:76.8905},
        {lat:8.5618,lng:76.8753},{lat:8.5640,lng:76.8815},{lat:8.5660,lng:76.8880},{lat:8.5672,lng:76.8920},{lat:8.5692,lng:76.8960},
        {lat:8.5700,lng:76.9030},{lat:8.5712,lng:76.9090},{lat:8.5728,lng:76.9135},{lat:8.5752,lng:76.9192},
      ],
    },
    {
      routeId: 'route-CS-8', busId: 'CS-8',
      routeName: 'City Shuttle - Thampanoor to Vizhinjam',
      busType: 'City Shuttle', fare: 25, distance: 12.0, duration: 40, schedule: '10:00 AM',
      stops: [
        { stopId:'thampanoor',  order:1 },
        { stopId:'east_fort',   variant:'outbound', order:2 },
        { stopId:'pappanamcode',order:3 },
        { stopId:'nemom',       variant:'outbound', order:4 },
        { stopId:'poovar_road', order:5 },
        { stopId:'veli',        order:6 },
        { stopId:'vizhinjam',   order:7 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4862,lng:76.9500},{lat:8.4834,lng:76.9461},{lat:8.4785,lng:76.9486},{lat:8.4740,lng:76.9515},
        {lat:8.4690,lng:76.9543},{lat:8.4640,lng:76.9543},{lat:8.4583,lng:76.9542},{lat:8.4500,lng:76.9600},{lat:8.4430,lng:76.9650},
        {lat:8.4378,lng:76.9712},{lat:8.4310,lng:76.9748},{lat:8.4230,lng:76.9785},{lat:8.4150,lng:76.9815},{lat:8.4112,lng:76.9850},
        {lat:8.4060,lng:76.9875},{lat:8.3990,lng:76.9903},{lat:8.3900,lng:76.9920},{lat:8.3860,lng:76.9928},{lat:8.3811,lng:76.9934},
      ],
    },
    {
      routeId: 'route-CS-9', busId: 'CS-9',
      routeName: 'City Shuttle - Thampanoor to Varkala',
      busType: 'City Shuttle', fare: 70, distance: 52.0, duration: 130, schedule: '06:00 AM',
      stops: [
        { stopId:'thampanoor',    order:1  },
        { stopId:'sreekaryam',    order:2  },
        { stopId:'kazhakuttam',   order:3  },
        { stopId:'chirayinkeezhu',order:4  },
        { stopId:'attingal',      order:5  },
        { stopId:'parippally',    order:6  },
        { stopId:'manamboor',     order:7  },
        { stopId:'edava',         order:8  },
        { stopId:'varkala_town',  order:9  },
        { stopId:'varkala',       order:10 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.5008,lng:76.9505},{lat:8.5068,lng:76.9491},{lat:8.5222,lng:76.9466},{lat:8.5238,lng:76.9298},
        {lat:8.5298,lng:76.9183},{lat:8.5390,lng:76.9076},{lat:8.5480,lng:76.8930},{lat:8.5618,lng:76.8753},{lat:8.5780,lng:76.8660},
        {lat:8.5920,lng:76.8608},{lat:8.6160,lng:76.8543},{lat:8.6358,lng:76.8515},{lat:8.6553,lng:76.8382},{lat:8.6838,lng:76.8220},
        {lat:8.6937,lng:76.8152},{lat:8.6990,lng:76.8025},{lat:8.7052,lng:76.7897},{lat:8.7085,lng:76.7808},{lat:8.7122,lng:76.7722},
        {lat:8.7155,lng:76.7608},{lat:8.7197,lng:76.7490},{lat:8.7230,lng:76.7380},{lat:8.7268,lng:76.7295},{lat:8.7307,lng:76.7212},
        {lat:8.7320,lng:76.7186},{lat:8.7339,lng:76.7164},
      ],
    },
    {
      routeId: 'route-CS-10', busId: 'CS-10',
      routeName: 'City Shuttle - Thampanoor to Pongummoodu (via Kowdiar)',
      busType: 'City Shuttle', fare: 15, distance: 4.8, duration: 22, schedule: '09:00 AM',
      stops: [
        { stopId:'thampanoor',   order:1 },
        { stopId:'museum',       variant:'northbound', order:2 },
        { stopId:'palayam',      variant:'northbound', order:3 },
        { stopId:'vellayambalam',variant:'northbound', order:4 },
        { stopId:'kowdiar',      variant:'northbound', order:5 },
        { stopId:'jagathy',      order:6 },
        { stopId:'pongummoodu',  order:7 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4940,lng:76.9515},{lat:8.5000,lng:76.9508},{lat:8.5038,lng:76.9499},{lat:8.5008,lng:76.9505},
        {lat:8.5040,lng:76.9499},{lat:8.5068,lng:76.9491},{lat:8.5098,lng:76.9503},{lat:8.5120,lng:76.9508},{lat:8.5146,lng:76.9511},
        {lat:8.5120,lng:76.9520},{lat:8.5097,lng:76.9530},{lat:8.5112,lng:76.9540},{lat:8.5130,lng:76.9558},
      ],
    },
    {
      routeId: 'route-CR-1', busId: 'CR-1',
      routeName: 'City Radial - Thampanoor to Peroorkada',
      busType: 'City Radial', fare: 20, distance: 8.8, duration: 35, schedule: '07:00 AM',
      stops: [
        { stopId:'thampanoor',   order:1 },
        { stopId:'aristo',       variant:'northbound', order:2 },
        { stopId:'palayam',      variant:'northbound', order:3 },
        { stopId:'vellayambalam',variant:'northbound', order:4 },
        { stopId:'pmg',          order:5 },
        { stopId:'vikas_bhavan', order:6 },
        { stopId:'peroorkada',   order:7 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4925,lng:76.9508},{lat:8.4984,lng:76.9485},{lat:8.5008,lng:76.9505},{lat:8.5040,lng:76.9499},
        {lat:8.5068,lng:76.9491},{lat:8.5052,lng:76.9465},{lat:8.5035,lng:76.9438},{lat:8.5044,lng:76.9403},{lat:8.5052,lng:76.9366},
        {lat:8.5075,lng:76.9310},{lat:8.5100,lng:76.9245},{lat:8.5125,lng:76.9180},{lat:8.5150,lng:76.9125},{lat:8.5165,lng:76.9065},
      ],
    },
    {
      routeId: 'route-CR-2', busId: 'CR-2',
      routeName: 'City Radial - Thampanoor to Sreekaryam',
      busType: 'City Radial', fare: 25, distance: 13.2, duration: 40, schedule: '08:00 AM',
      stops: [
        { stopId:'thampanoor',   order:1 },
        { stopId:'palayam',      variant:'northbound', order:2 },
        { stopId:'vellayambalam',variant:'northbound', order:3 },
        { stopId:'pattom',       order:4 },
        { stopId:'medical_college',order:5 },
        { stopId:'ulloor',       order:6 },
        { stopId:'sreekaryam',   order:7 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4935,lng:76.9516},{lat:8.5008,lng:76.9505},{lat:8.5068,lng:76.9491},{lat:8.5141,lng:76.9516},
        {lat:8.5222,lng:76.9466},{lat:8.5228,lng:76.9392},{lat:8.5233,lng:76.9350},{lat:8.5238,lng:76.9298},{lat:8.5258,lng:76.9252},
        {lat:8.5276,lng:76.9218},{lat:8.5298,lng:76.9183},{lat:8.5320,lng:76.9158},{lat:8.5350,lng:76.9130},{lat:8.5390,lng:76.9076},
      ],
    },
    {
      routeId: 'route-CR-3', busId: 'CR-3',
      routeName: 'City Radial - Thampanoor to Pappanamcode',
      busType: 'City Radial', fare: 15, distance: 5.2, duration: 20, schedule: '06:30 AM',
      stops: [
        { stopId:'thampanoor',  order:1 },
        { stopId:'east_fort',   variant:'outbound',  order:2 },
        { stopId:'chalai',      variant:'eastbound', order:3 },
        { stopId:'karamana',    variant:'eastbound', order:4 },
        { stopId:'pappanamcode',order:5 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4862,lng:76.9500},{lat:8.4834,lng:76.9461},{lat:8.4848,lng:76.9510},{lat:8.4860,lng:76.9550},
        {lat:8.4876,lng:76.9595},{lat:8.4860,lng:76.9618},{lat:8.4845,lng:76.9643},{lat:8.4821,lng:76.9678},{lat:8.4800,lng:76.9658},
        {lat:8.4770,lng:76.9630},{lat:8.4740,lng:76.9610},{lat:8.4720,lng:76.9590},{lat:8.4690,lng:76.9543},
      ],
    },
    {
      routeId: 'route-CR-4', busId: 'CR-4',
      routeName: 'City Radial - Thampanoor to Pongumoodu',
      busType: 'City Radial', fare: 15, distance: 4.2, duration: 18, schedule: '10:30 AM',
      stops: [
        { stopId:'thampanoor',   order:1 },
        { stopId:'aristo',       variant:'northbound', order:2 },
        { stopId:'palayam',      variant:'northbound', order:3 },
        { stopId:'vellayambalam',variant:'northbound', order:4 },
        { stopId:'jagathy',      order:5 },
        { stopId:'pongummoodu',  order:6 },
      ],
      route_polyline: [
        {lat:8.4869,lng:76.9525},{lat:8.4925,lng:76.9508},{lat:8.4984,lng:76.9485},{lat:8.5008,lng:76.9505},{lat:8.5040,lng:76.9499},
        {lat:8.5068,lng:76.9491},{lat:8.5082,lng:76.9510},{lat:8.5097,lng:76.9530},{lat:8.5113,lng:76.9542},{lat:8.5130,lng:76.9558},
      ],
    },
  ];

  for (const entry of SEED) {
    // Resolve stopId + variant → { name, lat, lng } for every stop in this route
    const resolvedStops = entry.stops.map((s) => {
      const c = getStopCoords(s.stopId, s.variant ?? null);
      return { name: c.name, lat: c.lat, lng: c.lng, order: s.order };
    });

    await setDoc(doc(db, 'routes', entry.routeId), {
      name: entry.routeName,
      stops: resolvedStops,
      route_polyline: entry.route_polyline,
      // encodedPolyline intentionally omitted — MapView computes it via
      // Directions API (segment-by-segment with shaping points) on first load,
      // then caches the result back to Firestore automatically.
    });
    await setDoc(doc(db, 'buses', entry.busId), {
      busNumber:   entry.busId,
      routeId:     entry.routeId,
      driverEmail: 'driver@test.com',
      schedule:    entry.schedule,
      busType:     entry.busType,
      fare:        entry.fare,
      distance:    entry.distance,
      duration:    entry.duration,
      status:      'idle',
    });
    await setDoc(doc(db, 'busLocations', entry.busId), {
      lat: resolvedStops[0].lat, lng: resolvedStops[0].lng,
      speed: 0, tripStatus: 'idle', timestamp: serverTimestamp(),
    });
  }

  console.log(`KSRTC TVM city data seeded — ${SEED.length} routes, ${SEED.length} buses.`);
}

// ─── Remove Bus (and its route + location doc) ────────────────────────────────

export async function removeBus(busId, routeId) {
  await Promise.all([
    deleteDoc(doc(db, 'buses', busId)),
    deleteDoc(doc(db, 'busLocations', busId)),
    deleteDoc(doc(db, 'routes', routeId)),
  ]);
}

// ─── Get Buses by Stops ───────────────────────────────────────────────────────

export async function getBusesByStops(fromStop, toStop) {
  const routesSnap = await getDocs(collection(db, 'routes'));

  const matchingRouteIds = [];

  routesSnap.forEach((routeDoc) => {
    const data = routeDoc.data();
    const stops = data.stops || [];

    const stopNames = stops.map((s) => s.name.toLowerCase());

    const fromLower = fromStop.toLowerCase();
    const toLower = toStop.toLowerCase();

    const hasFrom = stopNames.some((name) => name.includes(fromLower));
    const hasTo = stopNames.some((name) => name.includes(toLower));

    if (hasFrom && hasTo) {
      matchingRouteIds.push(routeDoc.id);
    }
  });

  if (matchingRouteIds.length === 0) return [];

  const buses = [];

  for (const routeId of matchingRouteIds) {
    const busQuery = query(
      collection(db, 'buses'),
      where('routeId', '==', routeId)
    );
    const busSnap = await getDocs(busQuery);
    busSnap.forEach((busDoc) => {
      buses.push({ id: busDoc.id, ...busDoc.data() });
    });
  }

  return buses;
}

// ─── Clear all cached route polylines (force recompute on next passenger view) ─

export async function clearRoutePolylineCache() {
  const snap = await getDocs(collection(db, 'routes'));
  await Promise.all(
    snap.docs.map((d) =>
      updateDoc(doc(db, 'routes', d.id), { encodedPolyline: null }),
    ),
  );
}

// ─── Clear cached polylines for routes with shaping-point fixes ───────────────
// Call this once after deploying the shaping-point update so those routes
// recompute via Directions API (with the new via: waypoints) on next load.
export async function bustShapingPointsCache() {
  const affected = [
    'route-CC-1', 'route-CS-1', 'route-CS-2',
    'route-CS-5', 'route-CS-7', 'route-CS-9',
  ];
  await Promise.all(
    affected.map((id) =>
      updateDoc(doc(db, 'routes', id), { encodedPolyline: null }).catch(() => {}),
    ),
  );
  console.log('✅ Shaping-point route cache cleared — routes will recompute on next load.');
}

// ─── Save raw GPS recording for a route ──────────────────────────────────────
// Called at the end of a real driver trip. Stores the raw watchPosition trace
// in Firestore so it can later be snapped + baked via bakeRecordedRoute().
export async function saveRawGpsPath(routeId, points) {
  if (points.length < 20) return; // too few to be meaningful
  await updateDoc(doc(db, 'routes', routeId), {
    recordedPolyline: points,
    recordedAt: new Date().toISOString(),
  });
  console.log(`GPS recording saved for ${routeId}: ${points.length} raw points`);
}

// ─── Bake a route from GPS recording via Roads API snapToRoads ────────────────
// Call this once per route after a real driver trip has been recorded.
// Snaps the raw GPS trace to actual roads, encodes the result, and saves it
// as encodedPolyline — which MapView will use for every future load.
export async function bakeRecordedRoute(routeId, roadsApiKey) {
  const routeSnap = await getDoc(doc(db, 'routes', routeId));
  if (!routeSnap.exists()) throw new Error('Route not found');

  const rawPoints = routeSnap.data().recordedPolyline;
  if (!rawPoints?.length) throw new Error('No GPS recording found — drive the route first');

  const BATCH = 100; // Roads API limit per request
  const snapped = [];

  for (let i = 0; i < rawPoints.length; i += BATCH) {
    const batch = rawPoints.slice(i, i + BATCH);
    const path  = batch.map((p) => `${p.lat},${p.lng}`).join('|');
    const res   = await fetch(
      `https://roads.googleapis.com/v1/snapToRoads?path=${encodeURIComponent(path)}&interpolate=true&key=${roadsApiKey}`,
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Roads API ${res.status}`);
    }
    const data = await res.json();
    (data.snappedPoints || []).forEach((p) =>
      snapped.push({ lat: p.location.latitude, lng: p.location.longitude }),
    );
  }

  if (snapped.length === 0) throw new Error('Roads API returned no points');

  await updateDoc(doc(db, 'routes', routeId), {
    encodedPolyline:  encodePolylineJs(snapped),
    polylineSource:   'roads_api_gps_recording',
    polylineBakedAt:  new Date().toISOString(),
  });

  return snapped.length;
}

// ─── Get Bus Route ────────────────────────────────────────────────────────────

export async function getBusRoute(busId) {
  const busSnap = await getDoc(doc(db, 'buses', busId));
  if (!busSnap.exists()) return null;

  const busData = busSnap.data();
  const routeSnap = await getDoc(doc(db, 'routes', busData.routeId));
  if (!routeSnap.exists()) return null;

  return { id: routeSnap.id, ...routeSnap.data() };
}

// ─── Update Bus Location ──────────────────────────────────────────────────────

export async function updateBusLocation(busId, lat, lng, speed) {
  await setDoc(
    doc(db, 'busLocations', busId),
    {
      lat,
      lng,
      speed,
      tripStatus: 'active',
      timestamp: serverTimestamp(),
    },
    { merge: true }
  );
}

// ─── Start Trip ───────────────────────────────────────────────────────────────

export async function startTrip(busId) {
  await updateDoc(doc(db, 'buses', busId), {
    status: 'active',
  });
  await setDoc(
    doc(db, 'busLocations', busId),
    { tripStatus: 'active' },
    { merge: true }
  );
}

// ─── Stop Trip ────────────────────────────────────────────────────────────────

export async function stopTrip(busId) {
  await updateDoc(doc(db, 'buses', busId), {
    status: 'idle',
  });
  await setDoc(
    doc(db, 'busLocations', busId),
    { tripStatus: 'idle', speed: 0 },
    { merge: true }
  );
}

// ─── Get All Buses ────────────────────────────────────────────────────────────

export async function getAllBuses() {
  const snap = await getDocs(collection(db, 'buses'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Trip History ─────────────────────────────────────────────────────────────

export async function saveTripHistory({ busId, busNumber, routeName, driverEmail, startTime, distanceKm, updateCount }) {
  await addDoc(collection(db, 'tripHistory'), {
    busId,
    busNumber,
    routeName,
    driverEmail,
    startTime,
    endTime: serverTimestamp(),
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    updateCount,
    status: 'completed',
  });
}

export async function getTripHistory(driverEmail) {
  try {
    const q = query(
      collection(db, 'tripHistory'),
      where('driverEmail', '==', driverEmail),
      orderBy('endTime', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    // orderBy requires a composite index — fallback without ordering
    const q = query(collection(db, 'tripHistory'), where('driverEmail', '==', driverEmail));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.endTime?.seconds || 0) - (a.endTime?.seconds || 0));
  }
}

// ─── Add a custom route + bus created by a driver ────────────────────────────
export async function addCustomRoute(
  { busNumber, routeName, busType, fare, distance, duration, schedule, stops },
  driverEmail,
) {
  const routeId = `route-${busNumber}`;
  const resolvedStops = stops.map((s, i) => ({
    name: s.name, lat: s.lat, lng: s.lng, order: i + 1,
  }));

  await setDoc(doc(db, 'routes', routeId), {
    name: routeName,
    stops: resolvedStops,
    route_polyline: [],
    // encodedPolyline omitted — MapView will compute via Directions API on first view
  });
  await setDoc(doc(db, 'buses', busNumber), {
    busNumber,
    routeId,
    driverEmail,
    schedule,
    busType,
    fare:     Number(fare),
    distance: Number(distance),
    duration: Number(duration),
    status:   'idle',
  });
  await setDoc(doc(db, 'busLocations', busNumber), {
    lat: resolvedStops[0].lat,
    lng: resolvedStops[0].lng,
    speed: 0, tripStatus: 'idle', timestamp: serverTimestamp(),
  });
}

// ─── Auto-seed if Firestore is empty ─────────────────────────────────────────
// Call this on any page that needs data. It checks first so it's safe to call
// multiple times — it will only seed when the buses collection is empty.

export async function ensureDemoData() {
  try {
    const cc1 = await getDoc(doc(db, 'buses', 'CC-1'));
    if (cc1.exists()) return;
    console.log('Firestore missing data — seeding KSRTC TVM city routes (CC/CS/CR)…');
    await seedDemoData();
    console.log('✅ Demo data seeded successfully.');
  } catch (err) {
    if (err.code === 'permission-denied') {
      console.error(
        '🔴 Firestore permission denied.\n' +
        'Go to Firebase Console → Firestore → Rules and set:\n' +
        '  allow read, write: if request.auth != null;'
      );
    } else {
      console.warn('ensureDemoData error:', err.message);
    }
  }
}
