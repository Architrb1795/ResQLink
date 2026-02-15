import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { feedsApi } from '../api/feedsApi';
import { Activity, Radio, AlertTriangle, ArrowRight, Map as MapIcon, Clock, Globe, Loader2 } from 'lucide-react';
import MapWidget from '../components/dashboard/MapWidget';

const DashboardHome = () => {
    const { stats, incidents, isConnected } = useAppState();
    const [crisisFeed, setCrisisFeed] = useState(null);
    const [feedLoading, setFeedLoading] = useState(false);

    // Fetch live crisis data when connected
    useEffect(() => {
        if (!isConnected) return;
        const fetchFeed = async () => {
            setFeedLoading(true);
            try {
                const data = await feedsApi.getSummary('India');
                setCrisisFeed(data);
            } catch {
                // Silently fail — crisis feed is supplementary
            } finally {
                setFeedLoading(false);
            }
        };
        fetchFeed();
    }, [isConnected]);

    return (
        <div className="space-y-6 max-w-8xl mx-auto">

            {/* Demo Mode Banner */}
            {!isConnected && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span><strong>Demo Mode</strong> — Showing mock data. Connect the backend for live operations.</span>
                </div>
            )}

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

                {/* 3. LIVE OPERATIONS FEED (Priority Stack) */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                            <Radio className="w-4 h-4 mr-2" />
                            Live Operations Feed
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400">PRIORITY SORT ACTIVE</span>
                    </div>
                    <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden h-[450px] overflow-y-auto relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600/10 z-10">
                            <div className="h-full bg-blue-600 w-1/3 animate-[shimmer_2s_infinite]"></div>
                        </div>

                        <div className="divide-y divide-slate-100">
                             {incidents
                                .sort((a, b) => {
                                    const priority = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
                                    return (priority[b.severity] || 0) - (priority[a.severity] || 0);
                                })
                                .slice(0, 8)
                                .map(inc => (
                                 <div key={inc.id} className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-blue-500 relative">
                                     {inc.severity === 'CRITICAL' && (
                                         <div className="absolute top-2 right-2 rotate-45 text-slate-300">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                         </div>
                                     )}

                                     <div className="flex justify-between items-start mb-1">
                                         <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                             inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                         }`}>
                                             {inc.type}
                                         </span>
                                         <span className="text-[10px] text-slate-400 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {new Date(inc.timestamp || inc.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                         </span>
                                     </div>
                                     <h4 className="text-sm font-bold text-slate-700 mb-1 group-hover:text-blue-600 transition-colors">
                                        {inc.description?.length > 50 ? inc.description.substring(0,50) + '...' : inc.description}
                                     </h4>

                                     {/* AI Confidence Score Bar */}
                                     <div className="mt-2 flex items-center gap-2">
                                         <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                             <div
                                                className="h-full bg-blue-500/50 rounded-full"
                                                style={{ width: `${inc.aiConfidence ? Math.round(inc.aiConfidence * 100) : Math.floor(Math.random() * 18 + 80)}%` }}
                                             ></div>
                                         </div>
                                         <span className="text-[9px] font-bold text-slate-400">
                                            {inc.verified ? 'VERIFIED' : inc.aiConfidence ? `${Math.round(inc.aiConfidence * 100)}%` : 'PENDING'}
                                         </span>
                                     </div>

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

            {/* 4. GLOBAL CRISIS FEED (Live from APIs) */}
            {isConnected && (
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Global Crisis Intelligence
                    </h3>
                    <div className="bg-white rounded border border-slate-200 shadow-sm p-4">
                        {feedLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                                <span className="text-sm text-slate-500">Loading crisis feeds...</span>
                            </div>
                        ) : crisisFeed ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Earthquakes */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">🌍 Recent Earthquakes</h4>
                                    {crisisFeed.earthquakes?.slice(0, 3).map((eq, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-slate-50 last:border-0">
                                            <span className="font-bold text-orange-600 min-w-[2rem]">M{eq.magnitude?.toFixed(1)}</span>
                                            <span className="text-slate-600 truncate flex-1">{eq.place || eq.title}</span>
                                        </div>
                                    )) || <p className="text-xs text-slate-400">No recent earthquakes</p>}
                                </div>

                                {/* Reports */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">📋 UN ReliefWeb Reports</h4>
                                    {crisisFeed.reports?.slice(0, 3).map((rpt, i) => (
                                        <div key={i} className="text-xs py-1.5 border-b border-slate-50 last:border-0">
                                            <span className="text-slate-700 font-medium">{rpt.title?.substring(0, 80)}...</span>
                                        </div>
                                    )) || <p className="text-xs text-slate-400">No recent reports</p>}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 py-4 text-center">Crisis feeds unavailable</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardHome;
