import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { getOpenWeatherData } from '../services/apiServices';
import { Activity, Radio, AlertTriangle, ArrowRight, Map as MapIcon, Clock, Thermometer, ShieldAlert, Network, MapPin, RefreshCw } from 'lucide-react';
import MapWidget from '../components/dashboard/MapWidget';

const DashboardHome = () => {
    const { stats, incidents, externalEvents, lastSync, refreshData, updateIncidentStatus, userRole } = useAppState();
    const [aqiData, setAqiData] = useState(null);
    const [feedFilter, setFeedFilter] = useState('ALL'); // ALL | CRITICAL | HIGH | RESOLVED
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [femaState, setFemaState] = useState('ALL');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        getOpenWeatherData(28.6139, 77.2090).then(data => setAqiData(data));
    }, []);

    const formatSync = (iso) => {
        if (!iso) return 'never';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return 'unknown';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const sortedIncidents = [...incidents].sort((a, b) => {
        const priority = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
        return (priority[b.severity] || 0) - (priority[a.severity] || 0);
    });

    const visibleIncidents = sortedIncidents.filter((inc) => {
        if (feedFilter === 'CRITICAL') return inc.severity === 'CRITICAL' && inc.status !== 'RESOLVED';
        if (feedFilter === 'HIGH') return inc.severity === 'HIGH' && inc.status !== 'RESOLVED';
        if (feedFilter === 'RESOLVED') return inc.status === 'RESOLVED';
        return true;
    });

    const femaStates = Array.from(new Set((externalEvents?.fema || []).map((f) => f.state).filter(Boolean))).sort();
    const visibleFema = (externalEvents?.fema || []).filter((f) => femaState === 'ALL' || f.state === femaState);

    const handleRefreshNow = async () => {
        if (!refreshData || refreshing) return;
        setRefreshing(true);
        try {
            await refreshData();
        } finally {
            setRefreshing(false);
        }
    };

    const canOperate = userRole === 'AGENCY' || userRole === 'VOLUNTEER';

    return (
        <div className="space-y-6 max-w-8xl mx-auto">
            
            {/* 1. KEY PERFORMANCE INDICATORS (KPIs) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Reports */}
                <button
                    type="button"
                    onClick={() => setFeedFilter('ALL')}
                    className={`bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm flex items-center justify-between group transition-colors text-left ${
                        feedFilter === 'ALL'
                            ? 'border-blue-500 dark:border-blue-500/60 ring-1 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-500'
                    }`}
                >
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Reports</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{incidents.length}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Network className="w-6 h-6" />
                    </div>
                </button>

                {/* Critical Events */}
                <button
                    type="button"
                    onClick={() => setFeedFilter('CRITICAL')}
                    className={`bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm flex items-center justify-between group transition-colors text-left ${
                        feedFilter === 'CRITICAL'
                            ? 'border-red-500 dark:border-red-500/60 ring-1 ring-red-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-red-500'
                    }`}
                >
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Critical Events</p>
                        <h3 className="text-3xl font-bold text-red-600 dark:text-red-500">{stats.critical}</h3>
                    </div>
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                </button>

                {/* Avg Response Time */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-green-500 transition-colors">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Response</p>
                        <h3 className="text-3xl font-bold text-green-600 dark:text-green-500">12m</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6" />
                    </div>
                </div>

                {/* Local Environment */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-amber-500 transition-colors">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Local Env ({aqiData?.weatherText || "N/A"})</p>
                        <h3 className="text-3xl font-bold text-amber-500">{aqiData ? Math.round(aqiData.temperature) + '°C' : '--'}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                        <Thermometer className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2. MAIN TACTICAL MAP */}
                <div className="lg:col-span-2 flex flex-col h-[700px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative">
                    <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0">
                         <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center">
                            <MapIcon className="w-4 h-4 mr-2 text-blue-500" />
                            Tactical Map Overview
                         </h3>
                         <div className="flex gap-2">
                              <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-[10px] font-bold rounded uppercase border border-blue-800/50">Tracking All Global Vectors</span>
                              <button
                                  type="button"
                                  onClick={handleRefreshNow}
                                  className="px-3 py-1 bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-[10px] font-bold rounded uppercase border border-slate-700 flex items-center gap-2 transition-colors"
                                  title="Refresh now"
                              >
                                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                                  Refresh
                              </button>
                         </div>
                    </div>
                    <div className="flex-1 relative">
                        <MapWidget />
                    </div>
                </div>

                {/* RIGHT SIDEBAR FEEDS */}
                <div className="lg:col-span-1 flex flex-col h-[700px] gap-6 min-h-0">
                    
                    {/* 3. LIVE OPERATIONS FEED (Priority Stack) */}
                    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center">
                                <Radio className="w-4 h-4 mr-2 text-blue-500" />
                                Live Operations Feed
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex items-center gap-1.5">
                                    {[
                                        { id: 'ALL', label: 'All' },
                                        { id: 'CRITICAL', label: 'Critical' },
                                        { id: 'HIGH', label: 'High' },
                                        { id: 'RESOLVED', label: 'Resolved' },
                                    ].map((chip) => (
                                        <button
                                            key={chip.id}
                                            type="button"
                                            onClick={() => setFeedFilter(chip.id)}
                                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                                feedFilter === chip.id
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                            }`}
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 px-2 py-0.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800">
                                    SYNC {formatSync(lastSync?.backend)}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto relative min-h-0">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600/10 z-10">
                                <div className="h-full bg-blue-500 w-1/3 animate-[shimmer_2s_infinite]"></div>
                            </div>
                            
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                 {visibleIncidents.slice(0, 12).map(inc => (
                                     <button
                                         type="button"
                                         key={inc.id}
                                         onClick={() => setSelectedIncident(inc)}
                                         className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-blue-500 relative"
                                     >
                                         {inc.severity === 'CRITICAL' && (
                                             <div className="absolute top-2 right-2 rotate-45">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
                                             </div>
                                         )}

                                         <div className="flex justify-between items-start mb-1.5">
                                             <span className={`text-[9px] font-bold uppercase py-0.5 px-1.5 rounded-sm tracking-wider ${
                                                 inc.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                             }`}>
                                                 {inc.type}
                                             </span>
                                             <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center font-mono">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {inc.timestamp ? new Date(inc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                             </span>
                                         </div>
                                         <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {inc.description.length > 60 ? inc.description.substring(0,60) + '...' : inc.description} 
                                         </h4>
                                         
                                         <div className="flex items-center justify-between mt-3">
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center">
                                                <MapPin className="w-3 h-3 mr-1 opacity-70" />
                                                {inc.locationName || 'Unknown'}
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 -translate-x-2 group-hover:translate-x-0 transition-transform" />
                                         </div>
                                     </button>
                                 ))}

                                 {visibleIncidents.length === 0 && (
                                    <div className="p-8 text-center">
                                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">No Matching Reports</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            If the backend is asleep or unreachable, this feed will stay empty.
                                            Try refreshing in a minute, or submit a test report to populate the console.
                                        </div>
                                    </div>
                                 )}
                            </div>
                        </div>
                    </div>

                    {/* 4. FEMA FEDERAL DISASTERS */}
                    <div className="h-[250px] flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden shrink-0">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                                FEMA Declarations
                            </h3>
                            <div className="flex items-center gap-2">
                                <select
                                    value={femaState}
                                    onChange={(e) => setFemaState(e.target.value)}
                                    className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300"
                                    aria-label="Filter FEMA by state"
                                >
                                    <option value="ALL">All States</option>
                                    {femaStates.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <span className="text-[9px] font-mono text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
                                    SYNC {formatSync(lastSync?.external)}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
                            {visibleFema.slice(0, 15).map(fema => (
                                <div key={fema.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:border-amber-400/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase bg-amber-500 text-white px-2 py-0.5 rounded">
                                                {fema.state}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                                {new Date(fema.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug mb-1">{fema.title}</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wide">{fema.type}</p>
                                </div>
                            ))}
                            {(!visibleFema || visibleFema.length === 0) && (
                                <div className="text-center text-xs text-slate-400 p-8">No active federal declarations.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Incident Detail Drawer (frontend-only quick actions) */}
            {selectedIncident && (
                <div className="fixed inset-0 z-[150]">
                    <button
                        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                        onClick={() => setSelectedIncident(null)}
                        aria-label="Close incident details"
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-y-auto">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    Incident Detail
                                </div>
                                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                                    {selectedIncident.type}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                    {selectedIncident.id}{selectedIncident.timestamp ? ` · ${new Date(selectedIncident.timestamp).toLocaleString()}` : ''}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedIncident(null)}
                                className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                                aria-label="Close"
                            >
                                <span className="text-slate-400 dark:text-slate-500 text-xl leading-none">×</span>
                            </button>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                                selectedIncident.severity === 'CRITICAL'
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40'
                                    : selectedIncident.severity === 'HIGH'
                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                            }`}>
                                {selectedIncident.severity}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800">
                                {selectedIncident.status || 'REPORTED'}
                            </span>
                        </div>

                        <div className="mt-5">
                            <div className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">Location</div>
                            <div className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                                {selectedIncident.locationName || 'Unknown'}{typeof selectedIncident.lat === 'number' && typeof selectedIncident.lng === 'number'
                                    ? ` · (${selectedIncident.lat.toFixed(4)}, ${selectedIncident.lng.toFixed(4)})`
                                    : ''}
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">Description</div>
                            <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                {selectedIncident.description || '—'}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                                disabled={!canOperate}
                                onClick={() => updateIncidentStatus?.(selectedIncident.id, 'IN_PROGRESS')}
                                className="px-3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
                            >
                                Mark In Progress
                            </button>
                            <button
                                disabled={!canOperate}
                                onClick={() => updateIncidentStatus?.(selectedIncident.id, 'RESOLVED')}
                                className="px-3 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-sm transition-colors disabled:opacity-50 disabled:hover:bg-green-600"
                            >
                                Resolve
                            </button>
                        </div>

                        {!canOperate && (
                            <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                                Quick actions are available for Agency/Volunteer roles only.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardHome;
