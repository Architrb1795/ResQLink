# ResQLink (Evaluation Build: Elite)

> **"Command, Clarity, Coordination."**

ResQLink is a next-generation crisis response operating system. It bridges the gap between distress and relief by providing a unified, role-aware "Mission Control" for agencies, volunteers, and civilians.

![ResQLink Mission Control](public/mission_control_preview.png)

## 🌟 Elite Project Highlights

This build features the **"Elite Project"** refinements—a comprehensive UX overhaul designed for high-stakes decision making.

### 🛡️ Mission Control (Role-Based Access)

A dedicated "Mission Entry" screen securely routes users to their specific operational view:

- **Agency Command**: For strategic oversight, resource allocation, and simulation controls.
- **Volunteer Unit**: For on-ground task management and logistics delivery.
- **Civilian Access**: For rapid SOS reporting and status tracking.

### 🧠 Operational Intelligence

- **AI-Powered Insights**: The analytics dashboard uses AI callouts to highlight bottlenecks (e.g., "Medical Supply Critical in Sector 4").
- **Predictive Logistics**: Real-time alerts forecast resource shortages before they happen.
- **Confidence Scores**: Incident reports display AI verification levels (e.g., "98% Verified") to reduce misinformation.

### �️ Advanced Tactical Map

- **Drill-Down Drawers**: Interactive drawers allow commanders to inspect individual incident timelines without leaving the map.
- **Dynamic Layers**: Toggleable overlays for "Population Density", "Flood Zones", and "Active Units".
- **Visual Clarity**: Critical incidents pulse on the map to draw immediate attention.

## 🚀 Key Features

### 🖥️ The Command Rail

Replaces traditional navigation with a tactical "Command Rail" header, featuring:

- **System Heartbeat**: Visual indicator of system uptime.
- **Sync Timer**: Real-time data synchronization status.
- **Global Alert Ticker**: Scrolling urgency notifications.

### 🆘 Smart Reporting

- **Context-Aware Guidance**: The SOS form suggests details based on the selected emergency type (e.g., "Fire" -> "Distance from structure?").
- **Reassurance UX**: Immediate visual feedback confirms that specific nearby units have notified.

### ⚙️ Admin Simulation

- **Scenario Triggers**: Admins can trigger simulated events (e.g., "Flood Surge", "Supply Collapse") to test system resilience during demos.

## 🛠️ Tech Stack

- **Framework**: React.js + Vite
- **State Management**: React Context API (Role-Aware)
- **Styling**: Tailwind CSS (Custom "Mission Dark" & "Signal" Themes)
- **Maps**: Leaflet + React-Leaflet
- **Visuals**: Lucide React Icons + Recharts

## ⚡ Getting Started

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/resqlink.git
    cd resqlink
    ```

### Backend

1.  **Navigate to backend**

    ```bash
    cd backend
    ```

2.  **Install & Setup**

    ```bash
    npm install
    # Create .env from .env.example
    npx prisma generate
    ```

3.  **Start Server**
    ```bash
    npm run dev
    ```

### Frontend

1.  **Navigate to root**

    ```bash
    cd ..
    ```

2.  **Install & Start**
    ```bash
    npm install
    npm run dev
    ```

## 🎨 Design Philosophy

- **Cognitive Load Reduction**: Interfaces are designed to be scanned in milliseconds.
- **Semantic Color Theory**: Strict adherence to Red (Critical), Blue (Operational), and Amber (Warning).
- **Hierarchy first**: The most important data is always the largest and brightest element on screen.

---

_ResQLink Elite: Engineering order out of chaos._
