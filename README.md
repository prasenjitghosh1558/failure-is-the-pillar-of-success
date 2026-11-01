# NEXTRAK — Intelligent Shipment Tracking & Logistics Management Platform

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-teal?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Mapbox GL](https://img.shields.io/badge/Mapbox-GL--JS-333333?style=for-the-badge&logo=mapbox)](https://www.mapbox.com/)

NEXTRAK is an enterprise-grade, full-stack logistics control center and shipment tracking platform engineered for commercial SaaS operations. It unites real-time operational visibility, interactive geospatial mapping, multi-stop Traveling Salesperson Problem (TSP) route optimization, IoT fleet telematics management, multi-carrier status synchronization, and analytics.

---

## 🌟 Key Capabilities & Architectural Modules

### 1. Dedicated Public Shipment Tracking Portal (`/track` & `/track/[trackingNumber]`)
- **Instant Search**: Search by internal identifier (`NX-89412-US`) or master carrier code (`1Z9999999999999999`).
- **Interactive Geographical Map**: Displays origin node, destination node, current asset position, and curved transit route.
- **Chronological Milestone Stepper**:
  1. *Shipment Created*
  2. *Picked Up*
  3. *Arrived at Origin Facility*
  4. *Departed Origin Facility*
  5. *In Transit*
  6. *Arrived at Destination Facility*
  7. *Out for Delivery*
  8. *Delivered & Signed*
  (Supports *Weather Delayed*, *Exception*, *Failed*, *Returned*, and *Cancelled* states).
- **Strict Data Provenance**: Explicitly badges and distinguishes **Live GPS Telematics** from **Carrier Scan Checkpoints** and **Demonstration Data**.

### 2. Operational Live Command Matrix (`/dashboard/live-tracking`)
- **Geospatial Map Canvas**: Multi-asset visualization displaying both moving vehicle nodes and freight consignments.
- **Interactive Asset Inspection**: Click any marker to view live speed (mph), battery/fuel %, CDL driver, and ETA.
- **Dynamic Filtering**: Filter between *All*, *In-Transit*, *Out-For-Delivery*, and *Delayed* consignments.

### 3. Consignment Manifest Management (`/dashboard/shipments`)
- **Complete Lifecycle CRUD**: Create manifests, advance checkpoints, edit destination, or cancel/delete consignments.
- **Server-Side Validation**: Zod-enforced schemas, address geocoding, and automated tracking event logging.
- **Transactional Email Triggers**: Integrated with Resend to dispatch status alerts to recipients on milestone updates.

### 4. Fleet Telematics & Driver Command (`/dashboard/fleet`)
- **IoT Health & Battery Monitoring**: Battery % / Fuel level gauges, maintenance tracking, and vehicle status.
- **Telematics Provider Adapters**: Integrated abstraction supporting Samsara, Geotab, and local telematics feeds.
- **CDL Driver Profiles**: Star ratings, active route assignments, and delivery completion tallies.

### 5. Multi-Stop TSP Route Optimizer (`/dashboard/routes`)
- **Heuristic 2-Opt & Mapbox Directions**: Solves multi-stop waypoint sequences to eliminate backtracking.
- **Economic Metrics**: Displays total kilometers, driving duration, and percentage of transit time saved.
- **Turn-by-Turn Waypoints**: Ordered stop sequences with automated delivery window scheduling.

### 6. Analytics & Intelligence Engine (`/dashboard/analytics`)
- **Interactive Recharts**:
  - Weekly consignment volume & fulfillment trends (Area chart)
  - Status pipeline breakdown (Donut chart)
  - Carrier on-time SLA benchmarking (Bar chart)
  - Continental regional hub allocation (Midwest, Northeast, West Coast, South)
- **Report Exports**: One-click export to CSV spreadsheet and raw JSON data.

### 7. Notification & Dispatch Center (`/dashboard/notifications`)
- Categorized by *Delay Alerts*, *Pickups*, *Deliveries*, and *Vehicle Assignments*.
- Real-time unread counter badge and test email dispatch trigger.

---

## 🎨 Visual Design System

- **Primary Background**: Deep Navy (`#080E1B`)
- **Secondary Background**: Midnight Blue (`#101A2B`)
- **Card Background**: Navy Elevation (`#142238`)
- **Primary Accent**: Electric Cyan (`#00D4FF`)
- **Secondary Accent**: Royal Purple (`#6C63FF`)
- **Status Indicators**: Success (`#20C997`), Warning (`#FFB547`), Error (`#FF5B70`)
- **Typography**: Inter (Body), Space Grotesk (Headings & Metrics), JetBrains Mono (Tracking Numbers & Telemetry Coordinates)

---

## 🔑 Role-Based Access Control & Demo Accounts

All accounts use the password: `Password123!`

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Super Admin** | `admin@nextrak.io` | Full system governance, API keys, delete records, manage users |
| **Dispatcher** | `dispatch@nextrak.io` | Create shipments, assign drivers, optimize multi-stop routes |
| **Fleet Manager** | `fleet@nextrak.io` | Manage vehicles, driver assignments, IoT telematics diagnostics |
| **CDL Driver** | `marcus.driver@nextrak.io` | View assigned routes, vehicle status, and mobile inspection |
| **Customer** | `sarah.jenkins@acmecorp.com` | Consignment tracking, receipt downloads, notification history |

*Tip: Use the 1-Click Role Switcher in the dashboard bottom-left corner to test any role instantly.*

---

## 📦 Pre-Seeded Consignments for Testing

Enter any of these into the search bar at `/track` or `/`:

- `NX-89412-US` — **In Transit**: Chicago, IL → Detroit, MI (Robotic Components, Tesla Semi NX-TRK-801)
- `NX-10492-US` — **Out for Delivery**: Newark, NJ → Brooklyn, NY (BioHealth Diagnostic Reagents)
- `NX-77301-EXP` — **Delivered**: Los Angeles, CA → San Francisco, CA (Signed by Sarah Jenkins)
- `NX-55219-US` — **Weather Delay**: Dallas, TX → Denver, CO (Blizzard hold on I-25 corridor)
- `NX-33902-INT` — **Origin Facility**: Frankfurt, Germany → Seattle, WA (Transatlantic Aerospace Titanium)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="nextrak_super_secret_jwt_key_2026_production_grade"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional Third-Party Keys
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="pk.eyJ1I..."
AFTERSHIP_API_KEY=""
SAMSARA_API_TOKEN=""
RESEND_API_KEY=""
```

### 3. Initialize & Seed Database
```bash
npm run db:push
npm run db:seed
```

### 4. Run Automated Test Suite
```bash
npm test
```

### 5. Launch Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 🧪 Automated Testing

Run the included verification suite:
```bash
npm test
```
The test suite validates:
- Relational integrity and foreign key constraints
- 2-Opt TSP Route Optimizer & Haversine formula
- Server-side RBAC authorization matrix
- HS256 JWT session tokens
- Carrier & telematics provider abstraction adapters

