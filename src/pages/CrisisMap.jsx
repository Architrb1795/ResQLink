import React, { useState } from 'react';
import MapWidget from '../components/dashboard/MapWidget';
import { Filter, Layers, ChevronLeft, ChevronRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

const CrisisMap = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [filters, setFilters] = useState({
        critical: true,
        high: true,
        medium: true,
        low: true,
        units: true,
        infra: true
    });

    const toggleFilter = (key) => setFilters(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="h-[calc(100vh-6rem)] flex relative overflow-hidden bg-slate-900 border border-slate-700 rounded-lg shadow-2xl">
            {/* Tactical Sidebar */}
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

                    {/* Layer Toggles */}
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Operational Layers</h3>
                        <div className="space-y-2">
                            <button onClick={() => toggleFilter('units')} className="flex items-center justify-between w-full text-sm group">
                                <span className={cn("text-slate-300 group-hover:text-white", !filters.units && "opacity-50 line-through")}>Active Response Units</span>
                                <div className={`w-8 h-4 rounded-full p-0.5 flex transition-colors ${filters.units ? 'bg-blue-600 justify-end' : 'bg-slate-600 justify-start'}`}>
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </button>
                             <button onClick={() => toggleFilter('infra')} className="flex items-center justify-between w-full text-sm group">
                                <span className={cn("text-slate-300 group-hover:text-white", !filters.infra && "opacity-50 line-through")}>Critical Infrastructure</span>
                                <div className={`w-8 h-4 rounded-full p-0.5 flex transition-colors ${filters.infra ? 'bg-blue-600 justify-end' : 'bg-slate-600 justify-start'}`}>
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="pt-4 border-t border-slate-700">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Map Symbol Index</h3>
                        <div className="space-y-3 text-xs text-slate-400">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded border border-slate-600">
                                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                                    <div className="relative w-3 h-3 bg-red-600 rounded-full"></div>
                                </div>
                                <span>Active Critical Incident</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded border border-slate-600">
                                    <div className="w-4 h-4 bg-green-600 text-white flex items-center justify-center text-[8px] font-bold rotate-45 rounded-sm"><span className="-rotate-45">+</span></div>
                                </div>
                                <span>Medical Emergency</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <div className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded border border-slate-600">
                                    <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                                </div>
                                <span>Logistics / Resource</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-900 border-t border-slate-700 text-[10px] text-slate-500 font-mono text-center">
                    TACTICAL VIEW V2.4 // LIVE DATA
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
        </div>
    );
};

export default CrisisMap;
