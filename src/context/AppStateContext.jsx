import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_INCIDENTS, INITIAL_RESOURCES, INITIAL_VOLUNTEERS } from '../data/mockData';

const AppStateContext = createContext();

export const AppProvider = ({ children }) => {
  // Application State
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [volunteers, setVolunteers] = useState(INITIAL_VOLUNTEERS);
  
  // User Role State: 'CIVILIAN', 'VOLUNTEER', 'AGENCY'
  const [userRole, setUserRole] = useState('AGENCY'); 

  // Actions
  const addIncident = (incident) => {
    const newIncident = {
      ...incident,
      id: `inc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'REPORTED',
      verified: false,
      votes: 0,
    };
    setIncidents(prev => [newIncident, ...prev]);
    return newIncident;
  };

  const updateIncidentStatus = (id, status) => {
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

  // Metrics (Derived State)
  const stats = {
    active: incidents.filter(i => i.status !== 'RESOLVED').length,
    critical: incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
    resourcesAvailable: resources.filter(r => r.status === 'AVAILABLE').length,
  };

  const value = {
    incidents,
    resources,
    volunteers,
    userRole,
    setUserRole,
    addIncident,
    updateIncidentStatus,
    deleteIncident,
    verifyIncident,
    stats,
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
