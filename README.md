# Smart Home IoT — Next-Gen Cross-Platform Command Center & Telemetry Engine

A modern, production-grade Smart Home IoT platform featuring real-time multisensory telemetry processing, intelligent multi-hazard anomaly detection (fire suppression, security intrusion, and energy conservation), room occupancy presence tracking, and an interactive cross-platform Web and Mobile application.

---

## 🌟 Key Features

- **Cross-Platform Web & Mobile App (PWA)**:
  - Responsive, mobile-first design tailored for mobile handsets, tablets, and desktop workstations.
  - Mobile bottom navigation bar, touch-friendly cards, high-contrast status gauges, and pull-to-refresh.
  - Progressive Web App (PWA) installable directly on iOS and Android with offline-ready manifest.
- **Multisensory Telemetry Ingestion**:
  - Live streams for Temperature (°F/°C), Relative Humidity (% RH), Ambient Illuminance (lux), PIR Indoor Motion, and 3-Axis Accelerometer ($a_x, a_y, a_z$ with net vector magnitude $|G|$).
- **Intelligent Anomaly Detection & Dispatch**:
  - **Fire Hazard (`FIRE_ALERT`)**: Detects hazardous thermal escalation ($\ge 125^\circ\text{F}$ / $51.7^\circ\text{C}$) combined with low relative humidity ($\le 30\%$).
  - **Intrusion Detection (`INTRUDER_ALERT`)**: Detects indoor motion while room is vacant (zero registered occupants present). Suppresses false alarms when members are present.
  - **Energy Conservation (`POWER_ALERT`)**: Detects sustained excessive lighting ($\ge 375$ lux) when room is unoccupied.
- **Presence & Room Occupancy Control**:
  - One-tap "ENTER ROOM" / "EXIT ROOM" state synchronizer.
  - Live occupancy roster showing registered members inside the zone.
- **Interactive IoT Hardware Simulator**:
  - Built-in simulator to test telemetry without requiring physical microcontrollers.
  - 1-click disaster scenario triggers: Fire Outbreak, Unauthorized Intrusion, Power Wastage, and Normal Baseline.
- **OTRK User Authentication & Device Management**:
  - One-Time Registration Key (OTRK) system for household residents.
  - Modern accessible validation (incorporating `:user-valid` and `:user-invalid` UX patterns).
  - FCM push notification device registration.
- **Backward Compatibility Engine**:
  - Full support for legacy firmware endpoints (`/u/state`, `/u/users`, `/u/device`), eliminating previous memory leaks and bugs.

---

## 🛠️ Modern Tech Stack

| Layer | Technologies |
|---|---|
| **Backend & Engine** | Node.js (v20+), TypeScript, Express, Zod (Schema Validation), Helmet, CORS |
| **Architecture** | Clean Architecture, Repository Pattern, Dependency Injection |
| **Frontend & Mobile** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, PWA |
| **Testing & Quality** | Vitest, React Testing Library, Supertest, JSDOM |
| **Data Storage** | Pluggable Repository: Thread-Safe In-Memory / TTL History Window, Firebase Realtime Database Adapter |

---

## 🐛 Bugs & Critical Flaws Fixed From Original Codebase

1. **Intruder Detection Bug**:
   - *Previous*: `detectAnomaly(state)` evaluated `state.inDoorMotion == true`, but `pushSensorData` stored `motion: im`. As a result, `state.inDoorMotion` was always `undefined`, preventing intruder alarms from ever triggering.
   - *Fixed*: Normalized motion telemetry across `motion` and `inDoorMotion` inputs, paired with active room occupancy validation.
2. **Asynchronous Race Condition in Alert Generation**:
   - *Previous*: In `server.js`, asynchronous Firebase callbacks populated `alerts` array, while `alerts.forEach(...)` was executed synchronously *before* the callbacks finished.
   - *Fixed*: Refactored to async/await promises in `AnomalyDetector` with atomic upserting.
3. **Severe Memory Leak & Listener Multiplication**:
   - *Previous*: Every incoming HTTP GET request to `/u/users` and `/u/state` attached a new persistent `child_added` and nested `value` listener, multiplying exponentially and causing memory exhaustion and duplicate email dispatches.
   - *Fixed*: Replaced dangling event listeners with clean stateless request handlers and isolated state stores.
4. **Credential Leak & Hardcoded Credentials**:
   - *Previous*: Hardcoded Gmail address and plaintext password in `nodemailer.createTransport`, hardcoded Heroku URLs, and crash on missing `serviceAccountKey.json`.
   - *Fixed*: Environment-driven configuration with safe mock/notification fallbacks and zero-crash initialization.
5. **REST API Standards & Security**:
   - *Previous*: Sensitive user data (including SSN and contact numbers) and sensor updates were sent via cleartext HTTP `GET` query strings.
   - *Fixed*: Standardized `POST` endpoints with Zod schema validation, sanitization, and structured JSON error responses.

---

## 🚀 Quick Start

### Prerequisites
- Node.js $\ge 20.0.0$
- npm $\ge 10.0.0$

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```
Runs 37 comprehensive unit and integration tests across both the backend service and the client application.

### 3. Build Monorepo
```bash
npm run build
```
Compiles TypeScript backend into `backend/dist` and Vite client into `client/dist`.

### 4. Start Production Server
```bash
npm start
```
Starts the unified server on port `8000` (or `PORT` env var). Serves both the REST API and the production React PWA at `http://localhost:8000`.

### 5. Development Mode (with Live Reload)
```bash
# Terminal 1: Backend with auto-reload (port 8000)
npm run dev:backend

# Terminal 2: Client with Vite HMR (port 3000)
npm run dev:client
```

---

## 📡 REST API Reference

### Sensors
- `POST /api/v1/sensors/reading`: Ingest sensor telemetry (temperature, humidity, light, motion, accelerometer).
- `GET /api/v1/sensors/latest`: Get most recent sensor reading.
- `GET /api/v1/sensors/history?limit=50`: Get chronological telemetry window.
- `GET /api/v1/sensors/stats?hours=1`: Aggregated min, max, average statistics.
- `POST /api/v1/sensors/simulate`: Inject simulation scenario (`FIRE`, `INTRUDER`, `POWER_WASTE`, `NORMAL`).

### Alerts
- `GET /api/v1/alerts`: Get active unresolved alerts.
- `GET /api/v1/alerts/all?limit=50`: Get full alert history.
- `POST /api/v1/alerts/:id/resolve`: Mark alert as resolved.
- `POST /api/v1/alerts/:id/acknowledge`: Acknowledge active alert.

### Room Presence & Security
- `GET /api/v1/room`: Get current room occupancy and member list.
- `POST /api/v1/room/toggle`: Toggle presence for a resident ("Enter" / "Exit").
- `POST /api/v1/room/presence`: Explicitly set resident presence (`isPresent: true/false`).

### Users & OTRK Identity
- `POST /api/v1/users`: Register new resident and issue unique OTRK token.
- `GET /api/v1/users/:id`: Lookup user details by OTRK.
- `POST /api/v1/users/device`: Register mobile FCM push device token.

### Legacy Backward Compatibility
- `GET /u/state?temp=...&humidity=...&light=...&inDoorMotion=...`
- `GET /u/users?name=...&email=...&contact=...`
- `GET /u/device?fcm_token=...&id_otr=...`

---

## 📱 Mobile App Deployment Options

1. **Progressive Web App (PWA)**:
   - Open `http://<your-host>:8000` on any mobile browser (Safari on iOS or Chrome on Android).
   - Tap **"Add to Home Screen"** to install as a standalone native-feeling application with full offline caching and theme integration.
2. **Capacitor / Android Integration**:
   - The compiled web assets in `client/dist` can be packaged directly into native Android (`.apk` / `.aab`) and iOS applications using `@capacitor/core` and `@capacitor/cli`.
