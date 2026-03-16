# RTBS - Real-Time Bus Tracking System

A React + Firebase web application for real-time local bus tracking, supporting both passenger and driver roles.

---

## Setup Instructions

### 1. Clone / Create the Project

```bash
cd /Users/Kahlil/RTBS-Project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g., `rtbs-project`)
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Enable **Firestore Database** → Start in test mode

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Firebase config values from the Firebase console (Project Settings → Your apps → Web app config):

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

For Google Maps API key, go to [Google Cloud Console](https://console.cloud.google.com), enable **Maps JavaScript API**, and create an API key.

### 5. Create Demo Users in Firebase Auth Console

Go to Firebase Console → Authentication → Users → Add user:

| Email               | Password |
|---------------------|----------|
| driver@test.com     | 123456   |
| passenger@test.com  | 123456   |

### 6. Add User Documents to Firestore

In Firestore, create a `users` collection with two documents using the UID from Firebase Auth:

**Document ID:** `<uid of driver@test.com>`
```json
{
  "name": "Test Driver",
  "email": "driver@test.com",
  "role": "driver"
}
```

**Document ID:** `<uid of passenger@test.com>`
```json
{
  "name": "Test Passenger",
  "email": "passenger@test.com",
  "role": "passenger"
}
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 8. Seed Demo Data

On the Login page, click the **"Setup Demo Data"** button **once** to initialize the Firestore database with:
- 2 routes (Central Bus Stand → Airport, Market Road → Railway Station)
- 3 buses (47A, 22B, 31C)
- Initial bus location documents

> Only click this once. Clicking multiple times will overwrite with the same data.

---

## Demo Flow

### Passenger Flow

1. Log in as `passenger@test.com` / `123456`
2. You land on **Passenger Home**
3. Enter "Central" in **From** and "Airport" in **To**
4. Click **Search Buses** — see the list of matching buses
5. Click **Track Bus** on any bus — see the live map
6. The bus will move on the map once the driver starts a trip

### Driver Flow

1. Log in as `driver@test.com` / `123456` (use a different browser/incognito)
2. You land on **Driver Dashboard** showing assigned buses
3. Click **Start Trip** — you go to the Driver Tracking page
4. The app simulates GPS movement, sending location updates to Firebase every 3 seconds
5. Watch the bus move on the passenger's map in real time!
6. Click **Stop Trip** to end the simulation and return to the dashboard

---

## Project Structure

```
src/
├── main.jsx              # React entry point
├── App.jsx               # Router + route protection
├── index.css             # Global styles
├── context/
│   └── AuthContext.jsx   # Auth state + user role
├── components/
│   ├── BusCard.jsx       # Bus info card component
│   └── MapView.jsx       # Google Maps wrapper
├── pages/
│   ├── SplashPage.jsx    # Animated splash screen
│   ├── LoginPage.jsx     # Login + demo seed
│   ├── PassengerHome.jsx # Passenger search page
│   ├── BusListPage.jsx   # List of matching buses
│   ├── LiveTrackingPage.jsx  # Passenger live map view
│   ├── DriverDashboard.jsx   # Driver's assigned buses
│   └── DriverTrackingPage.jsx # GPS simulation + Firestore updates
├── services/
│   ├── firebase.js       # Firebase init
│   └── busService.js     # Firestore CRUD operations
├── hooks/
│   └── useBusLocation.js # Real-time bus location hook
└── utils/
    └── etaCalculator.js  # Haversine distance + ETA
```

---

## Tech Stack

- **React 18** with React Router v6
- **Firebase 10** (Authentication + Firestore)
- **Google Maps** via `@react-google-maps/api`
- **Vite** for development and build
