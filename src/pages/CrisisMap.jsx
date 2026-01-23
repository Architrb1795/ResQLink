import React, { useState } from 'react';
import MapWidget from '../components/dashboard/MapWidget';
import { Filter, Layers, ChevronLeft, ChevronRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

const CrisisMap = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState(null); // For drill-down
    const [filters, setFilters] = useState({
        critical: true,
        high: true,
        medium: true,
        low: true,
        units: true,
        infra: true,
        popDensity: false, // New
        floodZones: false // New
    });

    const toggleFilter = (key) => setFilters(prev => ({ ...prev, [key]: !prev[key] }));

    // Mock Timeline Data for Drill-Down
    const MOCK_TIMELINE = [
        { time: '10:42 AM', status: 'Incident Reported', color: 'text-slate-500' },
        { time: '10:45 AM', status: 'Verifying with local AI', color: 'text-blue-500' },
        { time: '10:48 AM', status: 'CRITICAL: Confirmed Fire', color: 'text-red-500 font-bold' },
        { time: '10:50 AM', status: 'Unit Alpha-1 Dispatched', color: 'text-green-600' },
    ];

    return (
        <div className="h-[calc(100vh-6rem)] flex relative overflow-hidden bg-slate-900 border border-slate-700 rounded-lg shadow-2xl">
            {/* LEFT: Tactical Sidebar */}
            <div className={cn(
                "absolute z-[1000] top-4 left-4 bottom-4 w-72 bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl transition-transform duration-300 flex flex-col",
                sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
            )}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="font-bold text-slate-100 uppercase tracking-widest text-xs flex items-center">
                        <Filter className="w-4 h-4 mr-2" />
                        Tactical Filters
                    </h2>
                    <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 space-y-6 flex-1 overflow-y-auto">
                    {/* Severity Filters */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Threat Levels</h3>
                        <div className="space-y-2">
                             {[
                                 { id: 'critical', label: 'Critical Threat', color: 'bg-red-600' },
                                 { id: 'high', label: 'High Priority', color: 'bg-orange-500' },
                                 { id: 'medium', label: 'Medium Priority', color: 'bg-yellow-500' },
                            ].map(level => (
                                <button 
                                    key={level.id}
                                    onClick={() => toggleFilter(level.id)}
                                    className="flex items-center justify-between w-full text-sm group"
                                >
                                    <div className="flex items-center text-slate-300 group-hover:text-white">
                                        <div className={`w-3 h-3 rounded-full mr-3 transition-opacity ${level.color} ${filters[level.id] ? 'opacity-100' : 'opacity-20'}`}></div>
                                        {level.label}
                                    </div>
                                    {filters[level.id] ? <Eye className="w-3 h-3 text-slate-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Operational Layers */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Operational Layers</h3>
                        <div className="space-y-2">
                            {[
                                { id: 'units', label: 'Active Response Units', color: 'bg-blue-600' },
                                { id: 'infra', label: 'Critical Infrastructure', color: 'bg-slate-500' },
                                { id: 'popDensity', label: 'Population Density', color: 'bg-purple-600' },
                                { id: 'floodZones', label: 'Flood-Prone Zones', color: 'bg-cyan-600' },
                            ].map(layer => (
                                <button key={layer.id} onClick={() => toggleFilter(layer.id)} className="flex items-center justify-between w-full text-sm group">
                                    <span className={cn("text-slate-300 group-hover:text-white", !filters[layer.id] && "opacity-50 line-through")}>{layer.label}</span>
                                    <div className={`w-8 h-4 rounded-full p-0.5 flex transition-colors ${filters[layer.id] ? 'bg-blue-600 justify-end' : 'bg-slate-600 justify-start'}`}>
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Simulation: List Incidents to Trigger Drill-Down */}
                    <div className="pt-4 border-t border-slate-700">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Detected Signals (Sim)</h3>
                        <div className="space-y-2">
                            <button 
                                onClick={() => setSelectedIncident({ id: 'inc-001', type: 'FIRE', loc: 'Sector 4', sev: 'CRITICAL' })}
                                className="w-full p-2 bg-slate-700/50 hover:bg-slate-700 rounded text-left border border-slate-600 hover:border-blue-500 transition-colors"
                            >
                                <div className="text-xs font-bold text-red-400">🔥 FIRE DETECTED</div>
                                <div className="text-[10px] text-slate-400">Sector 4 • 2 mins ago</div>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 bg-slate-900 border-t border-slate-700 text-[10px] text-slate-500 font-mono text-center">
                    TACTICAL VIEW V2.5 // LIVE DATA
                </div>
            </div>

            {/* Sidebar Toggle Button (When closed) */}
            {!sidebarOpen && (
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="absolute top-4 left-4 z-[1000] bg-slate-800 text-white p-2 rounded shadow-lg hover:bg-slate-700"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}

            {/* Map Area */}
            <div className="flex-1 bg-slate-100 relative">
                <MapWidget fullScreen={true} />
                
                {/* Overlay Status */}
                <div className="absolute top-4 right-4 z-[400] bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded text-xs font-mono border border-slate-700">
                    <span className="text-green-400">●</span> SYSTEM ONLINE
                </div>
            </div>

            {/* RIGHT: Drill-Down Details Drawer */}
            <div className={cn(
                "absolute z-[1000] top-4 right-4 bottom-4 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl transition-transform duration-300 flex flex-col",
                selectedIncident ? "translate-x-0" : "translate-x-[120%]"
            )}>
                {selectedIncident && (
                    <>
                        <div className="p-4 border-b border-slate-700 flex justify-between items-start bg-slate-950/50 rounded-t-lg">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{selectedIncident.sev}</span>
                                    <span className="text-slate-400 text-[10px] font-mono">{selectedIncident.id}</span>
                                </div>
                                <h2 className="font-bold text-white text-lg">{selectedIncident.type}</h2>
                                <p className="text-slate-400 text-xs flex items-center mt-1">
                                    <span className="w-2 h-2 bg-slate-500 rounded-full mr-2"></span>
                                    {selectedIncident.loc}
                                </p>
                            </div>
                            <button onClick={() => setSelectedIncident(null)} className="text-slate-500 hover:text-white">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Timeline */}
                            <div>
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-4">Incident Timeline</h3>
                                <div className="space-y-4 pl-2 border-l border-slate-700 ml-1">
                                    {MOCK_TIMELINE.map((item, idx) => (
                                        <div key={idx} className="relative pl-4">
                                            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-slate-900 border border-slate-500 rounded-full"></div>
                                            <div className="text-[10px] text-slate-500 font-mono mb-0.5">{item.time}</div>
                                            <div className={cn("text-xs font-medium", item.color)}>{item.status}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resources */}
                            <div>
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Resources Deployed</h3>
                                <div className="bg-slate-800 rounded p-3 space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-300">Unit Alpha-1 (Fire)</span>
                                        <span className="text-green-400">On Scene</span>
                                    </div>
                                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full w-[100%]"></div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs border-t border-slate-700 pt-2">
                                        <span className="text-slate-300">Ambulance 104</span>
                                        <span className="text-yellow-400">ETA 4m</span>
                                    </div>
                                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-yellow-500 h-full w-[60%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="p-4 border-t border-slate-700">
                            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded uppercase tracking-wider transition-colors">
                                Full Situation Report
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CrisisMap;
