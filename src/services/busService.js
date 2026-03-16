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
  const SEED = [
    {
      routeId: 'route-CC-1', busId: 'CC-1',
      routeName: 'City Circular - Thampanoor to Technopark',
      busType: 'City Circular (AC/Non-AC)', fare: 30, distance: 18.2, duration: 55, schedule: '06:00 AM',
      stops: [
        { name:'Thampanoor',       lat:8.4875, lng:76.9521, order:1 },
        { name:'Palayam',          lat:8.5006, lng:76.9510, order:2 },
        { name:'Vellayambalam',    lat:8.5065, lng:76.9495, order:3 },
        { name:'Kowdiar',          lat:8.5141, lng:76.9516, order:4 },
        { name:'Pattom',           lat:8.5219, lng:76.9468, order:5 },
        { name:'Medical College',  lat:8.5236, lng:76.9303, order:6 },
        { name:'Ulloor',           lat:8.5295, lng:76.9186, order:7 },
        { name:'Sreekaryam',       lat:8.5388, lng:76.9078, order:8 },
        { name:'Kazhakuttam',      lat:8.5617, lng:76.8756, order:9 },
        { name:'Technopark Phase 1',lat:8.5574,lng:76.8817, order:10},
        { name:'Technopark Phase 3',lat:8.5636,lng:76.8737, order:11},
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4905,lng:76.9519},{lat:8.4935,lng:76.9516},{lat:8.4963,lng:76.9513},{lat:8.4985,lng:76.9511},
        {lat:8.5006,lng:76.9510},{lat:8.5025,lng:76.9505},{lat:8.5045,lng:76.9500},{lat:8.5065,lng:76.9495},{lat:8.5085,lng:76.9500},
        {lat:8.5105,lng:76.9505},{lat:8.5125,lng:76.9510},{lat:8.5141,lng:76.9516},{lat:8.5158,lng:76.9505},{lat:8.5175,lng:76.9494},
        {lat:8.5193,lng:76.9483},{lat:8.5210,lng:76.9474},{lat:8.5219,lng:76.9468},{lat:8.5224,lng:76.9430},{lat:8.5229,lng:76.9390},
        {lat:8.5233,lng:76.9350},{lat:8.5236,lng:76.9303},{lat:8.5251,lng:76.9268},{lat:8.5265,lng:76.9237},{lat:8.5280,lng:76.9210},
        {lat:8.5295,lng:76.9186},{lat:8.5315,lng:76.9159},{lat:8.5338,lng:76.9130},{lat:8.5362,lng:76.9104},{lat:8.5388,lng:76.9078},
        {lat:8.5415,lng:76.9038},{lat:8.5445,lng:76.8995},{lat:8.5475,lng:76.8950},{lat:8.5505,lng:76.8905},{lat:8.5535,lng:76.8860},
        {lat:8.5570,lng:76.8810},{lat:8.5590,lng:76.8785},{lat:8.5617,lng:76.8756},{lat:8.5600,lng:76.8775},{lat:8.5585,lng:76.8795},
        {lat:8.5574,lng:76.8817},{lat:8.5595,lng:76.8793},{lat:8.5612,lng:76.8770},{lat:8.5625,lng:76.8752},{lat:8.5636,lng:76.8737},
      ],
    },
    {
      routeId: 'route-CC-2', busId: 'CC-2',
      routeName: 'City Circular - Thampanoor to Kazhakuttam via East Fort',
      busType: 'City Circular (AC/Non-AC)', fare: 25, distance: 14.6, duration: 50, schedule: '06:00 AM',
      stops: [
        { name:'Thampanoor',   lat:8.4875, lng:76.9521, order:1 },
        { name:'East Fort',    lat:8.4839, lng:76.9465, order:2 },
        { name:'Pettah',       lat:8.4925, lng:76.9308, order:3 },
        { name:'Chakkai',      lat:8.5028, lng:76.9175, order:4 },
        { name:'Mukkola',      lat:8.5175, lng:76.9052, order:5 },
        { name:'Enchakkal',    lat:8.5295, lng:76.8978, order:6 },
        { name:'Karyavattom',  lat:8.5436, lng:76.8876, order:7 },
        { name:'Kazhakuttam',  lat:8.5617, lng:76.8756, order:8 },
        { name:'Technopark',   lat:8.5574, lng:76.8817, order:9 },
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4862,lng:76.9500},{lat:8.4850,lng:76.9480},{lat:8.4839,lng:76.9465},{lat:8.4855,lng:76.9430},
        {lat:8.4870,lng:76.9395},{lat:8.4888,lng:76.9360},{lat:8.4905,lng:76.9335},{lat:8.4925,lng:76.9308},{lat:8.4955,lng:76.9280},
        {lat:8.4980,lng:76.9255},{lat:8.5000,lng:76.9225},{lat:8.5015,lng:76.9200},{lat:8.5028,lng:76.9175},{lat:8.5060,lng:76.9152},
        {lat:8.5095,lng:76.9130},{lat:8.5130,lng:76.9100},{lat:8.5155,lng:76.9075},{lat:8.5175,lng:76.9052},{lat:8.5210,lng:76.9022},
        {lat:8.5250,lng:76.9000},{lat:8.5295,lng:76.8978},{lat:8.5330,lng:76.8955},{lat:8.5365,lng:76.8930},{lat:8.5400,lng:76.8905},
        {lat:8.5436,lng:76.8876},{lat:8.5470,lng:76.8845},{lat:8.5505,lng:76.8815},{lat:8.5540,lng:76.8790},{lat:8.5575,lng:76.8770},
        {lat:8.5617,lng:76.8756},{lat:8.5600,lng:76.8775},{lat:8.5585,lng:76.8793},{lat:8.5574,lng:76.8817},
      ],
    },
    {
      routeId: 'route-CS-1', busId: 'CS-1',
      routeName: 'City Shuttle - Thampanoor to Neyyattinkara',
      busType: 'City Shuttle', fare: 40, distance: 26.3, duration: 75, schedule: '05:30 AM',
      stops: [
        { name:'Thampanoor',    lat:8.4875, lng:76.9521, order:1 },
        { name:'Karamana',      lat:8.4826, lng:76.9673, order:2 },
        { name:'Pappanamcode',  lat:8.4693, lng:76.9546, order:3 },
        { name:'Nemom',         lat:8.4588, lng:76.9542, order:4 },
        { name:'Kalliyoor',     lat:8.4438, lng:76.9838, order:5 },
        { name:'Aruvikkara',    lat:8.4310, lng:77.0018, order:6 },
        { name:'Balaramapuram', lat:8.3978, lng:77.0344, order:7 },
        { name:'Avanavanchery', lat:8.3930, lng:77.0540, order:8 },
        { name:'Parasuvaikkal', lat:8.3960, lng:77.0720, order:9 },
        { name:'Neyyattinkara', lat:8.4005, lng:77.0876, order:10},
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4865,lng:76.9540},{lat:8.4852,lng:76.9572},{lat:8.4840,lng:76.9620},{lat:8.4830,lng:76.9650},
        {lat:8.4826,lng:76.9673},{lat:8.4790,lng:76.9656},{lat:8.4765,lng:76.9635},{lat:8.4740,lng:76.9610},{lat:8.4720,lng:76.9590},
        {lat:8.4693,lng:76.9546},{lat:8.4660,lng:76.9544},{lat:8.4630,lng:76.9543},{lat:8.4605,lng:76.9542},{lat:8.4588,lng:76.9542},
        {lat:8.4555,lng:76.9580},{lat:8.4520,lng:76.9640},{lat:8.4490,lng:76.9710},{lat:8.4465,lng:76.9775},{lat:8.4438,lng:76.9838},
        {lat:8.4405,lng:76.9890},{lat:8.4370,lng:76.9940},{lat:8.4340,lng:76.9980},{lat:8.4310,lng:77.0018},{lat:8.4250,lng:77.0085},
        {lat:8.4185,lng:77.0155},{lat:8.4110,lng:77.0215},{lat:8.4045,lng:77.0280},{lat:8.3978,lng:77.0344},{lat:8.3960,lng:77.0402},
        {lat:8.3940,lng:77.0468},{lat:8.3930,lng:77.0540},{lat:8.3940,lng:77.0610},{lat:8.3950,lng:77.0660},{lat:8.3960,lng:77.0720},
        {lat:8.3975,lng:77.0790},{lat:8.3990,lng:77.0835},{lat:8.4005,lng:77.0876},
      ],
    },
    {
      routeId: 'route-CS-2', busId: 'CS-2',
      routeName: 'City Shuttle - Thampanoor to Attingal',
      busType: 'City Shuttle', fare: 50, distance: 34.8, duration: 90, schedule: '05:30 AM',
      stops: [
        { name:'Thampanoor',      lat:8.4875, lng:76.9521, order:1 },
        { name:'Palayam',         lat:8.5006, lng:76.9510, order:2 },
        { name:'Medical College', lat:8.5236, lng:76.9303, order:3 },
        { name:'Sreekaryam',      lat:8.5388, lng:76.9078, order:4 },
        { name:'Kazhakuttam',     lat:8.5617, lng:76.8756, order:5 },
        { name:'Chanthavila',     lat:8.5917, lng:76.8611, order:6 },
        { name:'Chirayinkeezhu',  lat:8.6355, lng:76.8517, order:7 },
        { name:'Kallambalam',     lat:8.6551, lng:76.8384, order:8 },
        { name:'Attingal Junction',lat:8.6840,lng:76.8218, order:9 },
        { name:'Attingal',        lat:8.6934, lng:76.8154, order:10},
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4935,lng:76.9516},{lat:8.5006,lng:76.9510},{lat:8.5065,lng:76.9495},{lat:8.5141,lng:76.9516},
        {lat:8.5219,lng:76.9468},{lat:8.5236,lng:76.9303},{lat:8.5295,lng:76.9186},{lat:8.5388,lng:76.9078},{lat:8.5445,lng:76.8995},
        {lat:8.5505,lng:76.8905},{lat:8.5617,lng:76.8756},{lat:8.5700,lng:76.8705},{lat:8.5780,lng:76.8660},{lat:8.5850,lng:76.8630},
        {lat:8.5917,lng:76.8611},{lat:8.5990,lng:76.8585},{lat:8.6075,lng:76.8562},{lat:8.6160,lng:76.8543},{lat:8.6250,lng:76.8530},
        {lat:8.6355,lng:76.8517},{lat:8.6420,lng:76.8480},{lat:8.6480,lng:76.8445},{lat:8.6515,lng:76.8415},{lat:8.6551,lng:76.8384},
        {lat:8.6620,lng:76.8340},{lat:8.6690,lng:76.8295},{lat:8.6760,lng:76.8258},{lat:8.6840,lng:76.8218},{lat:8.6885,lng:76.8188},
        {lat:8.6934,lng:76.8154},
      ],
    },
    {
      routeId: 'route-CS-3', busId: 'CS-3',
      routeName: 'City Shuttle - Thampanoor to Venjaramoodu',
      busType: 'City Shuttle', fare: 40, distance: 22.0, duration: 65, schedule: '06:00 AM',
      stops: [
        { name:'Thampanoor',   lat:8.4875, lng:76.9521, order:1 },
        { name:'Palayam',      lat:8.5006, lng:76.9510, order:2 },
        { name:'Vellayambalam',lat:8.5065, lng:76.9495, order:3 },
        { name:'Peroorkada',   lat:8.5167, lng:76.9067, order:4 },
        { name:'Vattiyoorkavu',lat:8.5531, lng:76.9476, order:5 },
        { name:'Karickom',     lat:8.5820, lng:76.9782, order:6 },
        { name:'Vembayam',     lat:8.5990, lng:77.0000, order:7 },
        { name:'Aryanad',      lat:8.6105, lng:77.0165, order:8 },
        { name:'Venjaramoodu', lat:8.6217, lng:77.0327, order:9 },
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4935,lng:76.9516},{lat:8.5006,lng:76.9510},{lat:8.5065,lng:76.9495},{lat:8.5090,lng:76.9380},
        {lat:8.5110,lng:76.9280},{lat:8.5130,lng:76.9185},{lat:8.5150,lng:76.9130},{lat:8.5167,lng:76.9067},{lat:8.5235,lng:76.9100},
        {lat:8.5310,lng:76.9170},{lat:8.5390,lng:76.9260},{lat:8.5460,lng:76.9350},{lat:8.5531,lng:76.9476},{lat:8.5610,lng:76.9540},
        {lat:8.5690,lng:76.9600},{lat:8.5755,lng:76.9670},{lat:8.5820,lng:76.9782},{lat:8.5900,lng:76.9870},{lat:8.5990,lng:77.0000},
        {lat:8.6050,lng:77.0082},{lat:8.6105,lng:77.0165},{lat:8.6160,lng:77.0240},{lat:8.6217,lng:77.0327},
      ],
    },
    {
      routeId: 'route-CS-4', busId: 'CS-4',
      routeName: 'City Shuttle - Thampanoor to Nedumangadu',
      busType: 'City Shuttle', fare: 40, distance: 25.2, duration: 72, schedule: '06:00 AM',
      stops: [
        { name:'Thampanoor',   lat:8.4875, lng:76.9521, order:1 },
        { name:'Vellayambalam',lat:8.5065, lng:76.9495, order:2 },
        { name:'Peroorkada',   lat:8.5167, lng:76.9067, order:3 },
        { name:'Vattiyoorkavu',lat:8.5531, lng:76.9476, order:4 },
        { name:'Karickom',     lat:8.5820, lng:76.9782, order:5 },
        { name:'Vembayam',     lat:8.5990, lng:77.0000, order:6 },
        { name:'Aryanad',      lat:8.6105, lng:77.0165, order:7 },
        { name:'Pothencode',   lat:8.6155, lng:77.0340, order:8 },
        { name:'Nedumangadu',  lat:8.6205, lng:77.0518, order:9 },
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4935,lng:76.9516},{lat:8.5006,lng:76.9510},{lat:8.5065,lng:76.9495},{lat:8.5110,lng:76.9280},
        {lat:8.5140,lng:76.9130},{lat:8.5167,lng:76.9067},{lat:8.5310,lng:76.9170},{lat:8.5460,lng:76.9350},{lat:8.5531,lng:76.9476},
        {lat:8.5690,lng:76.9600},{lat:8.5820,lng:76.9782},{lat:8.5990,lng:77.0000},{lat:8.6105,lng:77.0165},{lat:8.6155,lng:77.0340},
        {lat:8.6180,lng:77.0428},{lat:8.6205,lng:77.0518},
      ],
    },
    {
      routeId: 'route-CS-5', busId: 'CS-5',
      routeName: 'City Shuttle - Thampanoor to Kattakkada',
      busType: 'City Shuttle', fare: 40, distance: 22.5, duration: 65, schedule: '06:00 AM',
      stops: [
        { name:'Thampanoor',  lat:8.4875, lng:76.9521, order:1 },
        { name:'Karamana',    lat:8.4826, lng:76.9673, order:2 },
        { name:'Nemom',       lat:8.4588, lng:76.9542, order:3 },
        { name:'Kalliyoor',   lat:8.4438, lng:76.9838, order:4 },
        { name:'Maranalloor', lat:8.4400, lng:77.0220, order:5 },
        { name:'Vellarada',   lat:8.4430, lng:77.0650, order:6 },
        { name:'Peringamala', lat:8.4435, lng:77.0920, order:7 },
        { name:'Kattakkada',  lat:8.4440, lng:77.1201, order:8 },
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4852,lng:76.9572},{lat:8.4826,lng:76.9673},{lat:8.4730,lng:76.9610},{lat:8.4693,lng:76.9546},
        {lat:8.4640,lng:76.9543},{lat:8.4588,lng:76.9542},{lat:8.4530,lng:76.9650},{lat:8.4480,lng:76.9740},{lat:8.4438,lng:76.9838},
        {lat:8.4420,lng:76.9970},{lat:8.4405,lng:77.0080},{lat:8.4400,lng:77.0220},{lat:8.4405,lng:77.0380},{lat:8.4415,lng:77.0510},
        {lat:8.4430,lng:77.0650},{lat:8.4432,lng:77.0785},{lat:8.4435,lng:77.0920},{lat:8.4437,lng:77.1060},{lat:8.4440,lng:77.1201},
      ],
    },
    {
      routeId: 'route-CS-6', busId: 'CS-6',
      routeName: 'City Shuttle - Thampanoor to Kovalam',
      busType: 'City Shuttle', fare: 30, distance: 16.2, duration: 50, schedule: '06:00 AM',
      stops: [
        { name:'Thampanoor',     lat:8.4875, lng:76.9521, order:1 },
        { name:'East Fort',      lat:8.4839, lng:76.9465, order:2 },
        { name:'Pappanamcode',   lat:8.4693, lng:76.9546, order:3 },
        { name:'Nemom',          lat:8.4588, lng:76.9542, order:4 },
        { name:'Poovar Road',    lat:8.4380, lng:76.9710, order:5 },
        { name:'Vizhinjam',      lat:8.3814, lng:76.9932, order:6 },
        { name:'Kovalam Junction',lat:8.3940,lng:76.9900, order:7 },
        { name:'Kovalam',        lat:8.3990, lng:76.9834, order:8 },
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4862,lng:76.9500},{lat:8.4839,lng:76.9465},{lat:8.4785,lng:76.9486},{lat:8.4740,lng:76.9515},
        {lat:8.4693,lng:76.9546},{lat:8.4640,lng:76.9543},{lat:8.4588,lng:76.9542},{lat:8.4535,lng:76.9580},{lat:8.4490,lng:76.9620},
        {lat:8.4450,lng:76.9660},{lat:8.4380,lng:76.9710},{lat:8.4305,lng:76.9750},{lat:8.4220,lng:76.9790},{lat:8.4130,lng:76.9840},
        {lat:8.4030,lng:76.9880},{lat:8.3940,lng:76.9912},{lat:8.3860,lng:76.9930},{lat:8.3814,lng:76.9932},{lat:8.3860,lng:76.9920},
        {lat:8.3900,lng:76.9910},{lat:8.3940,lng:76.9900},{lat:8.3965,lng:76.9870},{lat:8.3980,lng:76.9852},{lat:8.3990,lng:76.9834},
      ],
    },
    {
      routeId: 'route-CS-7', busId: 'CS-7',
      routeName: 'City Shuttle - Thampanoor to Kaniyapuram',
      busType: 'City Shuttle', fare: 35, distance: 21.2, duration: 60, schedule: '06:00 AM',
      stops: [
        { name:'Thampanoor',   lat:8.4875, lng:76.9521, order:1 },
        { name:'Palayam',      lat:8.5006, lng:76.9510, order:2 },
        { name:'Kowdiar',      lat:8.5141, lng:76.9516, order:3 },
        { name:'Pattom',       lat:8.5219, lng:76.9468, order:4 },
        { name:'Medical College',lat:8.5236,lng:76.9303, order:5 },
        { name:'Ulloor',       lat:8.5295, lng:76.9186, order:6 },
        { name:'Sreekaryam',   lat:8.5388, lng:76.9078, order:7 },
        { name:'Kazhakuttam',  lat:8.5617, lng:76.8756, order:8 },
        { name:'Mangalapuram', lat:8.5690, lng:76.8958, order:9 },
        { name:'Kaniyapuram',  lat:8.5750, lng:76.9190, order:10},
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.5006,lng:76.9510},{lat:8.5065,lng:76.9495},{lat:8.5141,lng:76.9516},{lat:8.5219,lng:76.9468},
        {lat:8.5236,lng:76.9303},{lat:8.5295,lng:76.9186},{lat:8.5388,lng:76.9078},{lat:8.5445,lng:76.8995},{lat:8.5505,lng:76.8905},
        {lat:8.5617,lng:76.8756},{lat:8.5640,lng:76.8815},{lat:8.5660,lng:76.8880},{lat:8.5672,lng:76.8920},{lat:8.5690,lng:76.8958},
        {lat:8.5700,lng:76.9030},{lat:8.5712,lng:76.9090},{lat:8.5728,lng:76.9135},{lat:8.5750,lng:76.9190},
      ],
    },
    {
      routeId: 'route-CS-8', busId: 'CS-8',
      routeName: 'City Shuttle - Thampanoor to Vizhinjam',
      busType: 'City Shuttle', fare: 25, distance: 12.0, duration: 40, schedule: '06:00 AM',
      stops: [
        { name:'Thampanoor',  lat:8.4875, lng:76.9521, order:1 },
        { name:'East Fort',   lat:8.4839, lng:76.9465, order:2 },
        { name:'Pappanamcode',lat:8.4693, lng:76.9546, order:3 },
        { name:'Nemom',       lat:8.4588, lng:76.9542, order:4 },
        { name:'Poovar Road', lat:8.4380, lng:76.9710, order:5 },
        { name:'Veli',        lat:8.4115, lng:76.9848, order:6 },
        { name:'Vizhinjam',   lat:8.3814, lng:76.9932, order:7 },
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4862,lng:76.9500},{lat:8.4839,lng:76.9465},{lat:8.4785,lng:76.9486},{lat:8.4740,lng:76.9515},
        {lat:8.4693,lng:76.9546},{lat:8.4640,lng:76.9543},{lat:8.4588,lng:76.9542},{lat:8.4500,lng:76.9600},{lat:8.4430,lng:76.9650},
        {lat:8.4380,lng:76.9710},{lat:8.4310,lng:76.9748},{lat:8.4230,lng:76.9785},{lat:8.4150,lng:76.9815},{lat:8.4115,lng:76.9848},
        {lat:8.4060,lng:76.9875},{lat:8.3990,lng:76.9903},{lat:8.3900,lng:76.9920},{lat:8.3860,lng:76.9928},{lat:8.3814,lng:76.9932},
      ],
    },
    {
      routeId: 'route-CS-9', busId: 'CS-9',
      routeName: 'City Shuttle - Thampanoor to Varkala',
      busType: 'City Shuttle', fare: 70, distance: 52.0, duration: 130, schedule: '05:30 AM',
      stops: [
        { name:'Thampanoor',   lat:8.4875, lng:76.9521, order:1 },
        { name:'Sreekaryam',   lat:8.5388, lng:76.9078, order:2 },
        { name:'Kazhakuttam',  lat:8.5617, lng:76.8756, order:3 },
        { name:'Chirayinkeezhu',lat:8.6355,lng:76.8517, order:4 },
        { name:'Attingal',     lat:8.6934, lng:76.8154, order:5 },
        { name:'Parippally',   lat:8.7050, lng:76.7895, order:6 },
        { name:'Manamboor',    lat:8.7120, lng:76.7720, order:7 },
        { name:'Edava',        lat:8.7195, lng:76.7488, order:8 },
        { name:'Varkala Town', lat:8.7305, lng:76.7210, order:9 },
        { name:'Varkala',      lat:8.7337, lng:76.7162, order:10},
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.5006,lng:76.9510},{lat:8.5065,lng:76.9495},{lat:8.5219,lng:76.9468},{lat:8.5236,lng:76.9303},
        {lat:8.5295,lng:76.9186},{lat:8.5388,lng:76.9078},{lat:8.5480,lng:76.8930},{lat:8.5617,lng:76.8756},{lat:8.5780,lng:76.8660},
        {lat:8.5917,lng:76.8611},{lat:8.6160,lng:76.8543},{lat:8.6355,lng:76.8517},{lat:8.6551,lng:76.8384},{lat:8.6840,lng:76.8218},
        {lat:8.6934,lng:76.8154},{lat:8.6990,lng:76.8025},{lat:8.7050,lng:76.7895},{lat:8.7085,lng:76.7808},{lat:8.7120,lng:76.7720},
        {lat:8.7155,lng:76.7608},{lat:8.7195,lng:76.7488},{lat:8.7230,lng:76.7380},{lat:8.7268,lng:76.7295},{lat:8.7305,lng:76.7210},
        {lat:8.7320,lng:76.7186},{lat:8.7337,lng:76.7162},
      ],
    },
    {
      routeId: 'route-CS-10', busId: 'CS-10',
      routeName: 'City Shuttle - Thampanoor to Pongummoodu (via Kowdiar)',
      busType: 'City Shuttle', fare: 15, distance: 4.8, duration: 22, schedule: '06:00 AM',
      stops: [
        { name:'Thampanoor',   lat:8.4875, lng:76.9521, order:1 },
        { name:'Museum',       lat:8.5046, lng:76.9501, order:2 },
        { name:'Palayam',      lat:8.5006, lng:76.9510, order:3 },
        { name:'Vellayambalam',lat:8.5065, lng:76.9495, order:4 },
        { name:'Kowdiar',      lat:8.5141, lng:76.9516, order:5 },
        { name:'Jagathy',      lat:8.5098, lng:76.9528, order:6 },
        { name:'Pongummoodu',  lat:8.5131, lng:76.9557, order:7 },
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4940,lng:76.9515},{lat:8.5000,lng:76.9508},{lat:8.5046,lng:76.9501},{lat:8.5006,lng:76.9510},
        {lat:8.5040,lng:76.9502},{lat:8.5065,lng:76.9495},{lat:8.5098,lng:76.9503},{lat:8.5120,lng:76.9508},{lat:8.5141,lng:76.9516},
        {lat:8.5120,lng:76.9520},{lat:8.5098,lng:76.9528},{lat:8.5112,lng:76.9540},{lat:8.5131,lng:76.9557},
      ],
    },
    {
      routeId: 'route-CR-1', busId: 'CR-1',
      routeName: 'City Radial - Thampanoor to Peroorkada',
      busType: 'City Radial', fare: 20, distance: 8.8, duration: 35, schedule: '06:00 AM',
      stops: [
        { name:'Thampanoor',   lat:8.4875, lng:76.9521, order:1 },
        { name:'Aristo',       lat:8.4981, lng:76.9490, order:2 },
        { name:'Palayam',      lat:8.5006, lng:76.9510, order:3 },
        { name:'Vellayambalam',lat:8.5065, lng:76.9495, order:4 },
        { name:'PMG',          lat:8.5037, lng:76.9437, order:5 },
        { name:'Vikas Bhavan', lat:8.5050, lng:76.9368, order:6 },
        { name:'Peroorkada',   lat:8.5167, lng:76.9067, order:7 },
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4925,lng:76.9508},{lat:8.4981,lng:76.9490},{lat:8.5006,lng:76.9510},{lat:8.5040,lng:76.9502},
        {lat:8.5065,lng:76.9495},{lat:8.5052,lng:76.9465},{lat:8.5037,lng:76.9437},{lat:8.5044,lng:76.9403},{lat:8.5050,lng:76.9368},
        {lat:8.5075,lng:76.9310},{lat:8.5100,lng:76.9245},{lat:8.5125,lng:76.9180},{lat:8.5150,lng:76.9125},{lat:8.5167,lng:76.9067},
      ],
    },
    {
      routeId: 'route-CR-2', busId: 'CR-2',
      routeName: 'City Radial - Thampanoor to Sreekaryam',
      busType: 'City Radial', fare: 25, distance: 13.2, duration: 40, schedule: '06:00 AM',
      stops: [
        { name:'Thampanoor',   lat:8.4875, lng:76.9521, order:1 },
        { name:'Palayam',      lat:8.5006, lng:76.9510, order:2 },
        { name:'Vellayambalam',lat:8.5065, lng:76.9495, order:3 },
        { name:'Pattom',       lat:8.5219, lng:76.9468, order:4 },
        { name:'Medical College',lat:8.5236,lng:76.9303, order:5 },
        { name:'Ulloor',       lat:8.5295, lng:76.9186, order:6 },
        { name:'Sreekaryam',   lat:8.5388, lng:76.9078, order:7 },
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4935,lng:76.9516},{lat:8.5006,lng:76.9510},{lat:8.5065,lng:76.9495},{lat:8.5141,lng:76.9516},
        {lat:8.5219,lng:76.9468},{lat:8.5228,lng:76.9392},{lat:8.5233,lng:76.9350},{lat:8.5236,lng:76.9303},{lat:8.5258,lng:76.9252},
        {lat:8.5276,lng:76.9218},{lat:8.5295,lng:76.9186},{lat:8.5320,lng:76.9158},{lat:8.5350,lng:76.9130},{lat:8.5388,lng:76.9078},
      ],
    },
    {
      routeId: 'route-CR-3', busId: 'CR-3',
      routeName: 'City Radial - Thampanoor to Pappanamcode',
      busType: 'City Radial', fare: 15, distance: 5.2, duration: 20, schedule: '05:30 AM',
      stops: [
        { name:'Thampanoor',  lat:8.4875, lng:76.9521, order:1 },
        { name:'East Fort',   lat:8.4839, lng:76.9465, order:2 },
        { name:'Chalai',      lat:8.4875, lng:76.9590, order:3 },
        { name:'Karamana',    lat:8.4826, lng:76.9673, order:4 },
        { name:'Pappanamcode',lat:8.4693, lng:76.9546, order:5 },
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4862,lng:76.9500},{lat:8.4839,lng:76.9465},{lat:8.4848,lng:76.9510},{lat:8.4860,lng:76.9550},
        {lat:8.4875,lng:76.9590},{lat:8.4860,lng:76.9618},{lat:8.4845,lng:76.9643},{lat:8.4826,lng:76.9673},{lat:8.4800,lng:76.9658},
        {lat:8.4770,lng:76.9630},{lat:8.4740,lng:76.9610},{lat:8.4720,lng:76.9590},{lat:8.4693,lng:76.9546},
      ],
    },
    {
      routeId: 'route-CR-4', busId: 'CR-4',
      routeName: 'City Radial - Thampanoor to Pongumoodu',
      busType: 'City Radial', fare: 15, distance: 4.2, duration: 18, schedule: '06:00 AM',
      stops: [
        { name:'Thampanoor',  lat:8.4875, lng:76.9521, order:1 },
        { name:'Aristo',      lat:8.4981, lng:76.9490, order:2 },
        { name:'Palayam',     lat:8.5006, lng:76.9510, order:3 },
        { name:'Vellayambalam',lat:8.5065,lng:76.9495, order:4 },
        { name:'Jagathy',     lat:8.5098, lng:76.9528, order:5 },
        { name:'Pongumoodu',  lat:8.5131, lng:76.9557, order:6 },
      ],
      route_polyline: [
        {lat:8.4875,lng:76.9521},{lat:8.4925,lng:76.9508},{lat:8.4981,lng:76.9490},{lat:8.5006,lng:76.9510},{lat:8.5040,lng:76.9502},
        {lat:8.5065,lng:76.9495},{lat:8.5082,lng:76.9510},{lat:8.5098,lng:76.9528},{lat:8.5113,lng:76.9542},{lat:8.5131,lng:76.9557},
      ],
    },
  ];

  for (const entry of SEED) {
    await setDoc(doc(db, 'routes', entry.routeId), {
      name: entry.routeName,
      stops: entry.stops,
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
      lat: entry.stops[0].lat, lng: entry.stops[0].lng,
      speed: 0, tripStatus: 'idle', timestamp: serverTimestamp(),
    });
  }

  console.log(`KSRTC TVM city data seeded — ${SEED.length} routes, ${SEED.length} buses.`);
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
