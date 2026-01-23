import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppStateContext';
import Layout from './components/layout/Layout';
import DashboardHome from './pages/DashboardHome';
import CrisisMap from './pages/CrisisMap';
import SubmitReport from './pages/SubmitReport';
import Resources from './pages/Resources';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardHome />} />
            <Route path="map" element={<CrisisMap />} />
            <Route path="report" element={<SubmitReport />} />
            <Route path="resources" element={<Resources />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
