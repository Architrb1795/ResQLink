import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_INCIDENTS, INITIAL_RESOURCES, INITIAL_VOLUNTEERS } from '../data/mockData';
import { authApi } from '../api/authApi';
import { incidentApi } from '../api/incidentApi';
import { checkBackendHealth, tokenStore } from '../api/apiClient';

const AppStateContext = createContext();

// ─── Dual-Mode Provider ──────────────────────────────────────
// Connected mode: Real API calls, JWT auth, live data
// Fallback mode:  Mock data + console warnings (demo-ready)
// ─────────────────────────────────────────────────────────────

export const AppProvider = ({ children }) => {
  // ── Connection State ──────────────────────────────────────
  const [isConnected, setIsConnected] = useState(false);
  const [backendChecked, setBackendChecked] = useState(false);

  // ── Data State ────────────────────────────────────────────
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [volunteers, setVolunteers] = useState(INITIAL_VOLUNTEERS);

  // ── User State ────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const userRole = currentUser?.role || 'GUEST';

  // ── Global Loading / Error ────────────────────────────────
  const [globalError, setGlobalError] = useState(null);

  // ── Check backend on mount ────────────────────────────────
  useEffect(() => {
    const checkConnection = async () => {
      const health = await checkBackendHealth();
      setIsConnected(health.connected);
      setBackendChecked(true);

      if (!health.connected) {
        console.warn('[ResQLink] Backend unreachable — running in demo mode with mock data.');
      }
    };
    checkConnection();
  }, []);

  // ── Restore session from stored JWT ───────────────────────
  useEffect(() => {
    if (!backendChecked) return;

    const restoreSession = async () => {
      if (!isConnected || !authApi.hasToken()) {
        setAuthLoading(false);
        return;
      }

      try {
        const user = await authApi.getMe();
        setCurrentUser(user);
      } catch {
        // Token expired or invalid — clear silently
        tokenStore.clear();
      } finally {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, [backendChecked, isConnected]);

  // ── Fetch incidents from API when connected ───────────────
  useEffect(() => {
    if (!backendChecked || !isConnected || !currentUser) return;

    const fetchIncidents = async () => {
      try {
        const result = await incidentApi.list({ page: 1, limit: 50 });
        if (result.incidents?.length > 0) {
          setIncidents(result.incidents);
        }
      } catch (err) {
        console.warn('[ResQLink] Failed to fetch incidents, using mock data:', err.message);
      }
    };
    fetchIncidents();
  }, [backendChecked, isConnected, currentUser]);

  // ── Listen for auth expiry events ─────────────────────────
  useEffect(() => {
    const handleExpiry = () => {
      setCurrentUser(null);
      setGlobalError('Your session has expired. Please log in again.');
    };
    window.addEventListener('auth:expired', handleExpiry);
    return () => window.removeEventListener('auth:expired', handleExpiry);
  }, []);

  // ── Auth Actions ──────────────────────────────────────────

  const login = useCallback(async (role, userData, credentials = null) => {
    // API login: credentials = { email, password }
    if (isConnected && credentials) {
      try {
        const user = await authApi.login(credentials.email, credentials.password);
        setCurrentUser(user);
        return user;
      } catch (err) {
        throw err; // Let the login page handle the error
      }
    }
    // Fallback: mock login
    setCurrentUser({ role, ...userData });
    return { role, ...userData };
  }, [isConnected]);

  const register = useCallback(async (name, email, password, role) => {
    if (isConnected) {
      const user = await authApi.register(name, email, password, role);
      setCurrentUser(user);
      return user;
    }
    const mockUser = { id: `mock-${Date.now()}`, name, email, role };
    setCurrentUser(mockUser);
    return mockUser;
  }, [isConnected]);

  const logout = useCallback(async () => {
    if (isConnected) {
      try { await authApi.logout(); } catch { /* ignore */ }
    }
    setCurrentUser(null);
    tokenStore.clear();
  }, [isConnected]);

  // ── Incident Actions ──────────────────────────────────────

  const addIncident = useCallback(async (incident) => {
    if (isConnected) {
      try {
        const created = await incidentApi.create(incident);
        setIncidents(prev => [created, ...prev]);
        return created;
      } catch (err) {
        console.error('[ResQLink] Failed to create incident via API:', err.message);
        // Fall through to mock
      }
    }

    // Mock fallback
    const newIncident = {
      ...incident,
      id: `inc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'REPORTED',
      verified: false,
      votes: 0,
    };
    setIncidents(prev => [newIncident, ...prev]);
    return newIncident;
  }, [isConnected]);

  const updateIncidentStatus = useCallback(async (id, status) => {
    if (isConnected) {
      try {
        const updated = await incidentApi.updateStatus(id, status);
        setIncidents(prev => prev.map(inc => inc.id === id ? updated : inc));
        return updated;
      } catch (err) {
        console.error('[ResQLink] API status update failed:', err.message);
      }
    }
    setIncidents(prev => prev.map(inc =>
      inc.id === id ? { ...inc, status } : inc
    ));
  }, [isConnected]);

  const deleteIncident = useCallback((id) => {
    setIncidents(prev => prev.filter(inc => inc.id !== id));
  }, []);

  const verifyIncident = useCallback(async (id) => {
    if (isConnected) {
      try {
        const updated = await incidentApi.verify(id);
        setIncidents(prev => prev.map(inc => inc.id === id ? updated : inc));
        return updated;
      } catch (err) {
        console.error('[ResQLink] API verify failed:', err.message);
      }
    }
    setIncidents(prev => prev.map(inc =>
      inc.id === id ? { ...inc, verified: true } : inc
    ));
  }, [isConnected]);

  // ── Derived Stats ─────────────────────────────────────────
  const stats = {
    active: incidents.filter(i => i.status !== 'RESOLVED').length,
    critical: incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
    resourcesAvailable: resources.filter(r => r.status === 'AVAILABLE').length,
  };

  const value = {
    // State
    incidents,
    resources,
    volunteers,
    stats,
    currentUser,
    userRole,
    authLoading,
    isConnected,
    backendChecked,
    globalError,

    // Auth
    login,
    register,
    logout,

    // Incidents
    addIncident,
    updateIncidentStatus,
    deleteIncident,
    verifyIncident,

    // Util
    clearError: () => setGlobalError(null),
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
