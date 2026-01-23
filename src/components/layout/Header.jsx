import React from 'react';
import { Bell, User, Menu } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

const MetricsTicker = () => {
    const { stats } = useAppState();
    
    return (
        <div className="bg-text text-white text-xs py-2 px-4 flex items-center overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="font-bold text-red-400 mr-2 sticky left-0 bg-text z-10 pr-2">LIVE UPDATES:</span>
            <div className="flex space-x-8 animate-pulse-fast pr-4">
                <span>Active Incidents: <strong className="text-white">{stats.active}</strong></span>
                <span>Critical: <strong className="text-red-400">{stats.critical}</strong></span>
                <span>Resources Available: <strong className="text-green-400">{stats.resourcesAvailable}</strong></span>
                <span>Volunteers Deployed: <strong>12</strong></span>
            </div>
        </div>
    );
};

const Header = ({ onMenuClick }) => {
  const { userRole, setUserRole } = useAppState();

  return (
    <div className="sticky top-0 z-10 flex flex-col bg-surface shadow-sm text-text border-b border-border">
      <MetricsTicker />
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center md:hidden">
            <button onClick={onMenuClick} className="p-2 text-text hover:bg-slate-100 rounded-md">
                <Menu className="w-6 h-6" />
            </button>
            <span className="font-serif font-bold text-lg text-primary ml-2">ResQLink</span>
        </div>

        <div className="hidden md:flex items-center text-sm text-text-muted">
            <span className="mr-2">Status:</span>
            <span className="flex items-center text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full text-xs border border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                System Operational
            </span>
        </div>

        <div className="flex items-center space-x-4">
            {/* Role Switcher for Demo */}
            <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
                className="text-sm bg-slate-50 border border-border rounded-md px-3 py-1.5 focus:ring-2 focus:ring-primary/20 outline-none"
            >
                <option value="CIVILIAN">Civilian View</option>
                <option value="VOLUNTEER">Volunteer View</option>
                <option value="AGENCY">Agency Admin</option>
            </select>

            <button className="relative p-2 text-text-muted hover:text-primary transition-colors hover:bg-slate-100 rounded-full">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full border border-white"></span>
            </button>
            
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                <User className="w-5 h-5" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
