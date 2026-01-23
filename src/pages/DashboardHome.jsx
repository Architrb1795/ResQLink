import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { Activity, Radio, AlertTriangle, ArrowRight, Map as MapIcon, Clock } from 'lucide-react';
import MapWidget from '../components/dashboard/MapWidget';

const DashboardHome = () => {
    const { stats, incidents } = useAppState();

    return (
        <div className="space-y-6 max-w-8xl mx-auto">
            
            {/* 1. SITUATION BRIEF PANEL */}
            <div className="bg-white rounded border-l-4 border-l-blue-600 shadow-sm p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                     <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        Current Situation Brief
                     </h2>
                     <p className="text-xl font-serif font-medium text-slate-800 leading-relaxed">
                        <strong className="text-red-600">{stats.critical} Critical Incidents</strong> currently active. 
                        Response teams are deployed to Sector 4 (Connaught Place). 
                        Medical supply levels are stable (85%), but flood warnings remain in effect for low-lying areas.
                     </p>
                </div>
                <div className="flex gap-4 md:border-l md:pl-6 border-slate-100 shrink-0">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-slate-800">{incidents.length}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Total<br/>Reports</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">12m</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Avg<br/>Response</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2. MAIN TACTICAL MAP */}
                <div className="lg:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                            <MapIcon className="w-4 h-4 mr-2" />
                            Tactical Map Overview
                         </h3>
                         <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Critical Only</span>
                             <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">All Units</span>
                         </div>
                    </div>
                    <div className="bg-white rounded border border-slate-200 shadow-sm h-[450px] relative overflow-hidden group">
                        <MapWidget />
                        
                        {/* Map Overlay Controls */}
                        <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur border border-slate-200 p-2 rounded shadow-sm text-xs space-y-1">
                             <div className="font-bold mb-1 text-slate-500 uppercase text-[10px]">Signal Legend</div>
                             <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Critical Threat</div>
                             <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Infrastructure</div>
                             <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Response Unit</div>
                        </div>
                    </div>
                </div>

                {/* 3. LIVE OPERATIONS FEED */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <Radio className="w-4 h-4 mr-2" />
                        Live Operations Feed
                    </h3>
                    <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden h-[450px] overflow-y-auto relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600/10 z-10">
                            <div className="h-full bg-blue-600 w-1/3 animate-[shimmer_2s_infinite]"></div>
                        </div>
                        
                        <div className="divide-y divide-slate-100">
                             {incidents.slice(0, 8).map(inc => (
                                 <div key={inc.id} className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-blue-500">
                                     <div className="flex justify-between items-start mb-1">
                                         <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                             inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                         }`}>
                                             {inc.type}
                                         </span>
                                         <span className="text-[10px] text-slate-400 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {new Date(inc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                         </span>
                                     </div>
                                     <h4 className="text-sm font-bold text-slate-700 mb-1 group-hover:text-blue-600 transition-colors">
                                        {inc.description.length > 50 ? inc.description.substring(0,50) + '...' : inc.description} 
                                     </h4>
                                     <div className="flex items-center justify-between mt-2">
                                        <div className="text-xs text-slate-500 font-mono">{inc.locationName}</div>
                                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 -translate-x-2 group-hover:translate-x-0 transition-transform" />
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
