import React from 'react';
import { Bell, User, Menu } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

const CommandRail = ({ onMenuClick }) => {
  const { currentUser, logout, stats } = useAppState();
  const role = currentUser?.role || 'GUEST';

  const ROLE_COLORS = {
      AGENCY: 'bg-blue-600',
      VOLUNTEER: 'bg-green-600',
      CIVILIAN: 'bg-amber-500',
      GUEST: 'bg-slate-500'
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 h-16">
            
            {/* Left: System Heartbeat */}
            <div className="flex items-center space-x-4">
                <button onClick={onMenuClick} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded">
                    <Menu className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Live</span>
                        <span className="text-[10px] font-medium text-slate-400">Sync: 2s ago</span>
                    </div>
                    {/* Confidence Indicator - Elite Touch */}
                    <div className="hidden sm:flex items-center pl-3 border-l border-slate-200 ml-3">
                         <div className="flex flex-col leading-none text-right">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Confidence</span>
                            <span className="text-[10px] font-medium text-slate-400">AI Verified: 98%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center: Mission Stats (Hidden on small mobile) */}
            <div className="hidden md:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-slate-700">{stats.active}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-tight">Active<br/>Incidents</span>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-red-600">{stats.critical}</span>
                    <span className="text-[10px] font-bold text-red-400 uppercase leading-tight">Critical<br/>Events</span>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-600">85%</span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase leading-tight">Resource<br/>Health</span>
                </div>
            </div>

            {/* Right: User Context & Controls */}
            <div className="flex items-center space-x-3">
                
                {currentUser && (
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-xs font-bold text-slate-700">{currentUser.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{currentUser.role} ID: {currentUser.id}</span>
                    </div>
                )}

                <div className="relative cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors group">
                    <Bell className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </div>

                <div className={`h-8 w-8 rounded flex items-center justify-center text-white font-bold text-xs shadow-sm ${ROLE_COLORS[role] || ROLE_COLORS.GUEST}`}>
                    {role.charAt(0)}
                </div>

                {currentUser && (
                    <button 
                        onClick={logout}
                        className="text-[10px] font-bold text-slate-400 hover:text-red-500 ml-2 uppercase tracking-wider"
                    >
                        Logout
                    </button>
                )}
            </div>
        </div>
        
        {/* Mobile Stats Ticker */}
        <div className="md:hidden bg-slate-50 border-t border-slate-100 py-2 px-4 flex space-x-6 overflow-x-auto no-scrollbar">
             <div className="flex items-center space-x-1 shrink-0">
                <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                <span className="text-xs font-bold text-slate-600">{stats.active} Active</span>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-xs font-bold text-red-600">{stats.critical} Critical</span>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-xs font-bold text-blue-600">Res OK</span>
            </div>
        </div>
    </header>
  );
};

export default CommandRail;
