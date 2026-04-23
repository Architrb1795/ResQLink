import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchEonetEvents, fetchGdacsEvents, fetchUsgsEarthquakes, fetchFemaDisasters } from '../services/apiServices';

const AppStateContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const AppProvider = ({ children }) => {
  const [incidents, setIncidents] = useState([]);
  const [externalEvents, setExternalEvents] = useState({ eonet: [], gdacs: [], usgs: [], fema: [] });
  const [resources, setResources] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState({ external: null, backend: null });
  
  const [currentUser, setCurrentUser] = useState(null);
  const userRole = currentUser?.role || 'GUEST';

  const [uiPrefs, setUiPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem('resqlink.uiPrefs');
      if (!raw) return { mapDensity: 'balanced', reduceMotion: false, compact: false };
      const parsed = JSON.parse(raw);
      return {
        mapDensity: parsed?.mapDensity || 'balanced',
        reduceMotion: !!parsed?.reduceMotion,
        compact: !!parsed?.compact,
      };
    } catch (_) {
      return { mapDensity: 'balanced', reduceMotion: false, compact: false };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('resqlink.uiPrefs', JSON.stringify(uiPrefs));
    } catch (_) {
      // ignore persistence errors
    }
  }, [uiPrefs]);

  const updateUiPrefs = (patch) => {
    setUiPrefs((prev) => ({ ...prev, ...patch }));
  };

  const normalizeIncident = (row) => {
    // Backend (Postgres) uses snake_case; UI expects camelCase + `timestamp`.
    const lat = row.lat ?? row.latitude;
    const lng = row.lng ?? row.longitude;
    return {
      ...row,
      id: row.id ?? row.external_id ?? row.externalId,
      externalId: row.externalId ?? row.external_id,
      locationName: row.locationName ?? row.location_name,
      reporterId: row.reporterId ?? row.reporter_id,
      reporterPhone: row.reporterPhone ?? row.reporter_phone,
      timestamp: row.timestamp ?? row.created_at ?? row.createdAt ?? row.updated_at ?? row.updatedAt,
      lat: typeof lat === 'string' ? parseFloat(lat) : lat,
      lng: typeof lng === 'string' ? parseFloat(lng) : lng,
    };
  };

  const normalizeResource = (row) => ({
    ...row,
    id: row.id,
    type: row.type,
    quantity: row.quantity ?? row.qty,
    unit: row.unit,
    lat: typeof row.lat === 'string' ? parseFloat(row.lat) : row.lat,
    lng: typeof row.lng === 'string' ? parseFloat(row.lng) : row.lng,
  });

  const normalizeVolunteer = (row) => ({
    ...row,
    id: row.id,
    currentTaskId: row.currentTaskId ?? row.current_task_id,
    lat: typeof row.lat === 'string' ? parseFloat(row.lat) : row.lat,
    lng: typeof row.lng === 'string' ? parseFloat(row.lng) : row.lng,
  });

  const fetchExternal = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchEonetEvents(),
      fetchGdacsEvents(),
      fetchUsgsEarthquakes(),
      fetchFemaDisasters(),
    ]);

    const [eonetRes, gdacsRes, usgsRes, femaRes] = results.map((r) => (r.status === 'fulfilled' ? r.value : []));

    setExternalEvents((prev) => ({
      ...prev,
      eonet: (eonetRes || []).filter((e) => Array.isArray(e.coordinates) && e.coordinates.length >= 2),
      gdacs: (gdacsRes || []).filter((e) => Array.isArray(e.coordinates) && e.coordinates.length >= 2),
      usgs: (usgsRes || []).filter((e) => Array.isArray(e.coordinates) && e.coordinates.length >= 2),
      fema: femaRes || [],
    }));
    setLastSync((s) => ({ ...s, external: new Date().toISOString() }));
  }, []);

  const fetchBackend = useCallback(async () => {
    try {
      const [incidentsRes, resourcesRes, volunteersRes] = await Promise.allSettled([
        fetch(`${API_URL}/incidents`),
        fetch(`${API_URL}/resources`),
        fetch(`${API_URL}/volunteers`),
      ]);

      if (incidentsRes.status === 'fulfilled' && incidentsRes.value.ok) {
        const data = await incidentsRes.value.json();
        setIncidents((Array.isArray(data) ? data : []).map(normalizeIncident));
      }

      if (resourcesRes.status === 'fulfilled' && resourcesRes.value.ok) {
        const data = await resourcesRes.value.json();
        setResources((Array.isArray(data) ? data : []).map(normalizeResource));
      }

      if (volunteersRes.status === 'fulfilled' && volunteersRes.value.ok) {
        const data = await volunteersRes.value.json();
        setVolunteers((Array.isArray(data) ? data : []).map(normalizeVolunteer));
      }

      setLastSync((s) => ({ ...s, backend: new Date().toISOString() }));
    } catch (backendErr) {
      console.warn('Backend server not reachable, keeping last known state.');
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      await Promise.allSettled([fetchExternal(), fetchBackend()]);
    } catch (err) {
      console.error('Error in primary app fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchBackend, fetchExternal]);

  useEffect(() => {
    fetchData();

    // Keep feeds fresh without changing auth/login flow.
    const interval = setInterval(() => {
      fetchExternal();
      fetchBackend();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchBackend, fetchData, fetchExternal]);

  const login = (role, userData) => {
    setCurrentUser({ role, ...userData });
  };

  const updateProfile = (patch) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...patch };
    });
  };

  const logout = () => {
    setCurrentUser(null);
  }; 

  const addIncident = async (incident) => {
    try {
      const response = await fetch(`${API_URL}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...incident,
          reporterPhone: currentUser?.phone
        })
      });
      
      const newIncident = await response.json();
      setIncidents(prev => [newIncident, ...prev]);
      return newIncident;
    } catch (err) {
      console.error('Error creating incident:', err);
      const fallbackIncident = {
        ...incident,
        id: `inc-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'REPORTED',
        verified: false,
        votes: 0,
      };
      setIncidents(prev => [fallbackIncident, ...prev]);
      return fallbackIncident;
    }
  };

  const updateIncidentStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, verified: true })
      });
    } catch (err) {
      console.error('Error updating incident:', err);
    }
    
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, status } : inc
    ));
  };

  const deleteIncident = (id) => {
    setIncidents(prev => prev.filter(inc => inc.id !== id));
  };

  const verifyIncident = (id) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, verified: true } : inc
    ));
  };

  const stats = {
    active: incidents.filter(i => i.status !== 'RESOLVED').length,
    critical: incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
    resourcesAvailable: resources.filter(r => r.status === 'AVAILABLE').length,
  };

  const value = {
    incidents,
    externalEvents,
    resources,
    volunteers,
    userRole,
    loading,
    lastSync,
    uiPrefs,
    updateUiPrefs,

    addIncident,
    updateIncidentStatus,
    deleteIncident,
    verifyIncident,
    stats,
    currentUser,
    login,
    updateProfile,
    logout,
    refreshData: fetchData,
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
