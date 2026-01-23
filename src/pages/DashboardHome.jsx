import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { Activity, Radio, LayoutTemplate } from 'lucide-react';
import MapWidget from '../components/dashboard/MapWidget';

const DashboardHome = () => {
    const { stats, incidents } = useAppState();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text">Command Center</h2>
                <div className="text-sm text-text-muted">Last updated: Just now</div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface p-4 rounded-lg border border-border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-full">
                        <Radio className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-text-muted text-sm font-medium">Active Incidents</p>
                        <p className="text-2xl font-bold text-text">{stats.active}</p>
                    </div>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-border shadow-sm flex items-center space-x-4">
                   <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-text-muted text-sm font-medium">Critical Priority</p>
                        <p className="text-2xl font-bold text-text">{stats.critical}</p>
                    </div>
                </div>
                {/* Add more stats... */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area (Map Placeholder) */}
                <div className="lg:col-span-2 bg-surface rounded-lg border border-border shadow-sm h-[300px] md:h-[400px] relative overflow-hidden">
                    <MapWidget />
                </div>

                {/* Right Panel (Recent Activity / Ticker) */}
                <div className="bg-surface rounded-lg border border-border shadow-sm p-4">
                    <h3 className="font-bold text-lg mb-4 flex items-center text-text">
                        <LayoutTemplate className="w-5 h-5 mr-2" />
                        Recent Reports
                    </h3>
                    <div className="space-y-3">
                         {incidents.slice(0, 5).map(inc => (
                             <div key={inc.id} className="p-3 border border-border rounded-md hover:bg-slate-50 transition-colors">
                                 <div className="flex justify-between items-start">
                                     <span className="font-bold text-sm text-text">{inc.type}</span>
                                     <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${inc.status === 'REPORTED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{inc.status}</span>
                                 </div>
                                 <p className="text-xs text-text-muted mt-1 truncate">{inc.description}</p>
                                 <div className="mt-2 text-[10px] text-text-muted text-right">
                                    {new Date(inc.timestamp).toLocaleTimeString()}
                                 </div>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
