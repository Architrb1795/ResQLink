# ResQLink (Evaluation Build: Elite)

> **"Command, Clarity, Coordination."**

ResQLink is a next-generation **Crisis Response Operating System (CROS)**. It bridges the critical gap between distress signals and relief efforts by providing a unified, real-time "Mission Control" for government agencies, volunteer units, and affected civilians.

![ResQLink Mission Control](public/mission_control_preview.png)

## 🚀 Live Demo

- **Frontend (Vercel)**: [https://resqlink.vercel.app](https://resqlink.vercel.app) _(Replace with your URL)_
- **Backend API (Render)**: [https://resqlink-api.onrender.com](https://resqlink-api.onrender.com) _(Replace with your URL)_

---

## 🌟 Elite Features

This build features the **"Elite Project"** refinements—a comprehensive UX/DX overhaul designed for high-stakes decision making and rapid deployment.

### 🛡️ Dual-Mode Architecture

ResQLink is built for resilience. It operates in two distinct modes:

- **Connected Mode**: Fully integrated with the backend API, real-time WebSocket updates, and live database persistence.
- **Demo Mode (Fallback)**: If the backend is unreachable (e.g., during cold starts or network failure), the frontend seamlessly switches to a high-fidelity local simulation using mock data. **Zero downtime UX.**

### 🔐 Role-Based Mission Control

A single entry point securely routes users to their specific operational view:

1.  **Agency Command**: Strategic oversight, resource allocation, aggregate analytics, and simulation controls.
2.  **Volunteer Unit**: Mobile-first task management, logistics delivery, and on-ground reporting.
3.  **Civilian Access**: Rapid SOS reporting with geolocation, status tracking, and critical safety alerts.

### 🧠 Operational Intelligence

- **AI-Powered Insights**: The analytics engine highlights bottlenecks (e.g., "Medical Supply Critical in Sector 4") and verifies incident reports with confidence scores.
- **Real-Time Logistics**: Predictive alerts for resource shortages before they happen.
- **Live Crisis Feeds**: Integrates real-time data from **USGS (Earthquakes)** and **ReliefWeb (Global Disasters)** directly into the command dashboard.

### 🗺️ Advanced Tactical Map

- **Geospatial Intelligence**: Built on Leaflet with custom layers for "Population Density", "Flood Zones", and "Active Units".
- **Drill-Down Drawers**: Inspect incident timelines and resources without leaving the map context.
- **Smart Routing**: Integrated routing services for optimal pathfinding in disaster zones.

---

## 🛠️ Tech Stack

### Frontend (Client)

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Custom "Mission Dark" & "Signal" Themes)
- **State Management**: React Context API + Custom Hooks (`useApi`, `useAppState`)
- **Mapping**: Leaflet + React-Leaflet + OpenStreetMap
- **HTTP Client**: Axios with JWT Interceptors & Retry Logic
- **Visuals**: Lucide React Icons, Recharts

### Backend (Server)

- **Runtime**: Node.js + Express
- **Database**: PostgreSQL + PostGIS (Spatial Data)
- **ORM**: Prisma
- **Real-Time**: Socket.io (Bi-directional events)
- **Security**: JWT Authentication (Access + Refresh Tokens), Helmet, Rate Limiting, Zod Validation
- **External APIs**: OpenWeather, TomTom (Routing), USGS, ReliefWeb, Twilio (SMS - Optional)

### DevOps & Deployment

- **Frontend**: Vercel (SPA Rewrites, API Proxy)
- **Backend**: Render (Web Service, Managed PostgreSQL)
- **CI/CD**: GitHub Actions
- **Containerization**: Docker support included

---

## ⚡ Local Development Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+) _Optional - app runs in Demo Mode without it_

### 1. Clone the Repository

```bash
git clone https://github.com/Architrb1795/ResQLink.git
cd ResQLink
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure Environment Variables
# Copy .env.example to .env
cp .env.example .env

# Update .env with your local DB credentials and JWT secrets
# DATABASE_URL="postgresql://user:password@localhost:5432/resqlink"
# JWT_SECRET="your-secret"

# Initialize Database
npx prisma migrate dev --name init

# Seed Database (Optional)
npx prisma db seed

# Start Server
npm run dev
```

### 3. Frontend Setup

```bash
# Return to root directory
cd ..

# Install dependencies
npm install

# Start Development Server
# Vite proxy forwards /api requests to localhost:4000
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

---

## 🌍 Deployment Guide

### Backend (Render)

1.  Create a **New Web Service** on [Render](https://render.com).
2.  Connect your GitHub repository.
3.  Render will auto-detect `backend/render.yaml` and provision the service + database.
4.  **Environment Variables**: Add `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `CORS_ORIGIN` (your frontend URL).
5.  **Build Command**: `cd backend && npm install && npx prisma generate && npm run build`
6.  **Start Command**: `cd backend && npm run start`

### Frontend (Vercel)

1.  Import the project to [Vercel](https://vercel.com).
2.  **Framework Preset**: Vite.
3.  **Environment Variables**: Add `VITE_API_URL` pointing to your Render backend (e.g., `https://resqlink-api.onrender.com/api`).
4.  Deploy! `vercel.json` handles the routing configuration.

---

## 📂 Project Structure

```
ResQLink/
├── backend/                # Express API Server
│   ├── prisma/             # Database Schema & Migrations
│   ├── src/
│   │   ├── config/         # Environment Config
│   │   ├── middleware/     # Auth, Error Handling, Validation
│   │   ├── modules/        # Feature Modules (Auth, Incidents, Map, etc.)
│   │   ├── services/       # External Services (Weather, Geo, Socket)
│   │   └── index.ts        # Entry Point
│   └── tests/              # Vitest Tests
│
├── public/                 # Static Assets
├── src/                    # React Client
│   ├── api/                # API Client & Endpoints
│   ├── components/         # Reusable UI Components
│   ├── context/            # Global State (AppStateContext)
│   ├── hooks/              # Custom Hooks
│   ├── pages/              # Route Pages (Dashboard, Map, Auth)
│   └── utils/              # Helpers
└── ...config files         # Vite, Tailwind, ESLint, Vercel
```

---

## 🎨 Design Philosophy

- **Cognitive Load Reduction**: Interfaces are designed to be scanned in milliseconds by stressed operators.
- **Semantic Color Theory**: Strict adherence to **Red** (Critical), **Blue** (Operational), and **Amber** (Warning) for instant status recognition.
- **Hierarchy First**: The most important data is always the largest and brightest element on screen.

---

_ResQLink Elite: Engineering order out of chaos._
