import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useAppState } from './context/AppStateContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import DashboardHome from './pages/DashboardHome';
import CrisisMap from './pages/CrisisMap';
import SubmitReport from './pages/SubmitReport';
import Resources from './pages/Resources';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';

// Auth Pages
import LoginSelection from './pages/auth/LoginSelection';
import LoginAgency from './pages/auth/LoginAgency';
import LoginVolunteer from './pages/auth/LoginVolunteer';
import LoginCivilian from './pages/auth/LoginCivilian';

const ProtectedRoute = () => {
  const { currentUser } = useAppState();
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/" element={<LoginSelection />} />
            <Route path="/login/agency" element={<LoginAgency />} />
            <Route path="/login/volunteer" element={<LoginVolunteer />} />
            <Route path="/login/civilian" element={<LoginCivilian />} />

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/map" element={<CrisisMap />} />
                <Route path="/report" element={<SubmitReport />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
