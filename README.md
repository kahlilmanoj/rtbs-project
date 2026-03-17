# RTBS — Real-Time Bus Tracking System

A web application that lets passengers track live bus locations and drivers share their GPS position — built for KSRTC (Kerala State Road Transport Corporation) Thiruvananthapuram city routes as a college demo project.

---

## What This Project Does

RTBS simulates a real-time bus tracking system with two types of users:

- **Passengers** can search for buses between two stops, see which buses are running, track a bus live on a map, and get an estimated arrival time.
- **Drivers** log in, select their assigned bus, start a trip, and share their location — which passengers see updating in real time on a map.

The entire system is connected through **Firebase** — the moment a driver updates their position, every passenger watching that bus sees the marker move on their map within seconds.

---

## Tech Stack

| Technology | What it's used for |
|---|---|
| **React 18** | UI — all screens, components, and navigation |
| **React Router v6 (HashRouter)** | Page routing without a backend server |
| **Firebase Authentication** | Login / logout for both passenger and driver |
| **Firebase Firestore** | Real-time database — stores buses, routes, and live GPS positions |
| **Google Maps JavaScript API** | Renders the map, routes, and animated bus marker |
| **Google Directions API** | Draws accurate road-following route lines on the map |
| **Vite** | Fast development server and build tool |
| **GitHub Pages** | Free hosting for the deployed app |

---

## Project Structure

```
src/
├── main.jsx                   # App entry point, sets up routing
├── App.jsx                    # Route definitions + access control (who can see what)
├── index.css                  # All styling — colors, cards, buttons, layout
│
├── context/
│   └── AuthContext.jsx        # Manages login state and user role across the whole app
│
├── services/
│   ├── firebase.js            # Connects to Firebase using environment variables
│   └── busService.js          # All database operations (read/write buses, routes, locations)
│
├── hooks/
│   └── useBusLocation.js      # Live listener — auto-updates when bus position changes in Firestore
│
├── utils/
│   └── etaCalculator.js       # Haversine distance formula + ETA calculation
│
├── data/
│   ├── busStops.js            # Database of 60+ TVM bus stops with exact coordinates
│   └── routeShapingPoints.js  # Waypoints to fix Google Maps routing errors on specific roads
│
├── components/
│   ├── BusCard.jsx            # Reusable card showing bus number, fare, status, track button
│   └── MapView.jsx            # The Google Map — handles route drawing, bus marker animation
│
└── pages/
    ├── SplashPage.jsx         # Opening screen (2.5 second animated intro)
    ├── LoginPage.jsx          # Email + password login for both roles
    ├── PassengerHome.jsx      # Passenger app (search, routes, saved, profile)
    ├── BusListPage.jsx        # Search results — buses that serve a From→To pair
    ├── LiveTrackingPage.jsx   # Passenger's live map view for a specific bus
    ├── DriverDashboard.jsx    # Driver app (dashboard, history, add route, profile)
    └── DriverTrackingPage.jsx # Driver's active trip screen — sends GPS to Firebase
```

---

## How to Set Up and Run

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Firebase

1. Go to [firebase.google.com](https://firebase.google.com) and create a new project
2. Enable **Authentication** → Sign-in method → **Email/Password**
3. Enable **Firestore Database** → Start in test mode
4. Go to Project Settings → Your Apps → Web — copy the config values

### 3. Set up Google Maps

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Maps JavaScript API** and **Directions API**
3. Create an API key

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
```

### 5. Create demo accounts in Firebase Console

Go to Firebase Console → Authentication → Users → Add user:

| Email | Password | Role |
|---|---|---|
| `driver@test.com` | `123456` | Driver |
| `passenger@test.com` | `123456` | Passenger |

Add a `users` collection in Firestore with two documents (document ID = the user's UID from Auth):

```json
{ "email": "driver@test.com", "role": "driver" }
{ "email": "passenger@test.com", "role": "passenger" }
```

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 7. Seed demo data

Log in as the driver, go to **Profile** → **Re-seed Demo Data**. This populates Firestore with all 14 KSRTC routes and 16 buses. Only needs to be done once.

---

## How to Use the App

### As a Passenger

1. Log in with `passenger@test.com` / `123456`
2. You land on the **Home** tab — enter a pickup stop (e.g. "Thampanoor") and a drop stop (e.g. "Technopark")
3. Tap **Search Buses** — you see a list of buses on that route with fare, distance, and status
4. Tap **Track Live** on any bus — the map opens showing the bus's current position
5. The bus marker moves in real time as the driver updates their location
6. The panel below the map shows: ETA to destination, distance remaining, current speed, next stop, and the full route stops list with progress indicators

You can also:
- Browse all 14 KSRTC TVM routes under the **Routes** tab
- Star routes to save them under **Saved** for quick access
- View your recent trips and edit your name/phone in **Profile**

### As a Driver

1. Log in with `driver@test.com` / `123456` (use a different browser or incognito window)
2. You see your **Dashboard** with assigned buses, their routes, schedules, and stop lists
3. Tap **Start Trip** on a bus — the tracking screen opens
4. The app begins sending your bus's GPS position to Firebase every 2 seconds
5. A passenger tracking that bus will see it move on their map in real time
6. The driver screen shows: current speed, distance covered, GPS update count, current and next stop, route progress
7. Tap **Stop Trip** (or **Complete Trip** when the last stop is reached) to end the session

---

## Seeded Demo Data

The app comes with 16 real KSRTC Thiruvananthapuram city routes pre-loaded:

| Type | Routes | Examples |
|---|---|---|
| City Circular | CC-1, CC-2 | Thampanoor → Technopark, Thampanoor → Kazhakuttam via East Fort |
| City Shuttle | CS-1 to CS-10 | Thampanoor → Neyyattinkara, Thampanoor → Attingal, Thampanoor → Varkala |
| City Radial | CR-1 to CR-4 | Thampanoor → Sreekaryam, Thampanoor → Peroorkada |

Each route has:
- Real stop names and coordinates from Thiruvananthapuram
- Directional stop variants (e.g. Palayam northbound platform vs southbound platform — ~20m apart)
- Fare, distance, duration, and schedule times
- Staggered departure times (5:30 AM to 10:30 AM with ~1–2 hour gaps)

---

## Firestore Data Structure

```
firestore/
├── users/          {uid}  → { email, role }
├── routes/       {routeId} → { name, stops: [{name, lat, lng, order}], encodedPolyline }
├── buses/         {busId}  → { busNumber, routeId, driverEmail, fare, schedule, status }
├── busLocations/  {busId}  → { lat, lng, speed, tripStatus, timestamp }
└── tripHistory/   {docId}  → { busId, busNumber, driverEmail, startTime, endTime, distanceKm, updateCount }
```

The key collection is **busLocations** — it's updated every 2 seconds by the driver, and every passenger tracking that bus is subscribed to it via Firestore's `onSnapshot` listener, which fires instantly whenever the document changes.

---

## Key Features Explained

### Real-Time Location Sync

Firestore's `onSnapshot` is used as a live listener on the `busLocations/{busId}` document. The moment the driver's app writes a new lat/lng, Firebase pushes it to all connected passengers. There is no polling — it's event-driven.

```
Driver writes → Firestore → onSnapshot fires → Passenger map updates
```

### ETA Calculation

ETA is calculated using the **Haversine formula** — a mathematical formula that calculates the straight-line distance between two GPS coordinates on a sphere (the earth). The result is divided by the bus's current speed to get the estimated time in minutes. If the bus is stopped (speed = 0), a default of 30 km/h is assumed.

### Route Drawing on Map

The map uses Google's **Directions API** to draw road-following route lines rather than straight lines between stops. To prevent incorrect routing on problem road segments (e.g., the Sreekaryam–Kazhakuttam stretch where Google would route via the coastal highway), custom **shaping waypoints** are injected silently into the API request — the route snaps to the correct road without showing extra stops on screen.

### Bus Marker Animation

When the bus position updates, the marker doesn't jump — it smoothly animates to the new position over 1.8 seconds using `requestAnimationFrame`, matching the 2-second update interval so movement looks continuous.

### Directional Bus Stops

Real KSRTC buses stop on opposite sides of the road depending on which direction they're travelling. The stop database reflects this — e.g., "Palayam Northbound" and "Palayam Southbound" are stored as separate coordinate pairs. When a route is seeded, it picks the correct platform for the bus's direction of travel.

---

## Current Implementation vs. Real-World Deployment

This is the most important section to understand. The app is fully functional as a demo — the real-time sync, maps, ETA, and UI all work exactly as they would in production. The only difference is **where the GPS data comes from**.

---

### GPS — What's Different

| | Current Demo | Real Deployment |
|---|---|---|
| **How the bus moves** | Simulated — the app interpolates position between pre-defined stop coordinates on a fixed schedule | Real — the driver's phone GPS is read using the browser's `navigator.geolocation` API and sent to Firebase |
| **GPS source** | Calculated coordinates (linear interpolation between stops) | Live device GPS (latitude/longitude from the phone's hardware) |
| **Update frequency** | Every 2 seconds (simulated sub-steps between stops) | Every 2–5 seconds (real GPS position from the device) |
| **Speed value** | Random value between 35–79 km/h depending on bus type | Actual speed from `geolocation.getCurrentPosition()` coords diff or device speedometer |
| **Accuracy** | Route follows the stop sequence exactly, but the path between stops is a straight line | Real path follows the actual road the driver drives on |

---

### Route Path Accuracy — What's Different

| | Current Demo | Real Deployment |
|---|---|---|
| **Route line on map** | Drawn by Google Directions API using stop coordinates as waypoints | Baked from a recorded real GPS trace, snapped to roads using Google Roads API |
| **Bus path between stops** | Linear interpolation (straight line in the data, Directions API draws the road line on map) | Real GPS trail recorded while a driver actually drove the route |
| **Problem segments** | Partially fixed using manual shaping waypoints | Fixed permanently by using recorded GPS data |

> **Note:** The GPS recording infrastructure is already built into the app. `DriverTrackingPage.jsx` silently records the device's real GPS position during every trip using `navigator.geolocation.watchPosition()`. In a real deployment, this recorded trace would be used to bake a permanent, accurate route polyline into Firestore — replacing the Directions API entirely for that route.

---

### Why Simulate at All?

For a live demo or college presentation, you can't have a real bus driving around Thiruvananthapuram to show the app working. The simulation fills that gap — it lets you demonstrate the entire end-to-end flow (driver starts trip → passenger sees bus move → ETA updates → bus arrives) in a controlled, repeatable way without any real hardware.

---

### What Would Change for a Real Deployment

1. **Remove** the GPS simulation loop in `DriverTrackingPage.jsx`
2. **Replace it** with `navigator.geolocation.watchPosition()` (already partially in the code)
3. **Request location permissions** from the driver on trip start
4. Everything else — Firebase sync, passenger map, ETA, history — stays exactly the same

The app is intentionally architected so that swapping simulated GPS for real GPS requires changing only the data source, not the rest of the system.

---

## Deployment (GitHub Pages)

```bash
npm run deploy
```

This builds the app and pushes it to the `gh-pages` branch. The app uses **HashRouter** (`/#/route`) instead of BrowserRouter so GitHub Pages can handle direct URL loads without returning a 404.

Live URL: `https://<your-username>.github.io/rtbs-project/`

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Passenger | `passenger@test.com` | `123456` |
| Driver | `driver@test.com` | `123456` |

Use two different browsers (or one normal + one incognito) to run both roles simultaneously.
