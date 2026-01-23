import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { Package, Truck, MapPin, Clock, AlertTriangle } from 'lucide-react';

const Resources = () => {
    const { resources, volunteers } = useAppState();

    const getStatusColor = (current, total) => {
        const percentage = (current / total) * 100;
        if (percentage < 30) return 'bg-red-500';
        if (percentage < 70) return 'bg-orange-500';
        return 'bg-blue-500';
    };

    // Mock Predictive Alerts
    const PREDICTIVE_ALERTS = [
        { id: 1, msg: "Medical kits will fall below safe levels (20%) in approx 2 hours based on current consumption.", type: 'warning' },
        { id: 2, msg: "Flood barriers in Sector 4 are sufficient for next 6 hours.", type: 'success' }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
             <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center">
                    <Package className="w-6 h-6 mr-2 text-blue-600" />
                    Logistics & Supply Chain
                </h2>
                <p className="text-slate-500 text-sm">Real-time inventory tracking across all deployed forward bases.</p>
            </div>

            {/* Predictive Logistics AI Panel */}
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Package className="w-24 h-24 text-blue-500" /></div>
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
                    AI Predictive Logistics
                </h3>
                <div className="space-y-2 relative z-10">
                    {PREDICTIVE_ALERTS.map(alert => (
                        <div key={alert.id} className={`p-3 rounded border text-sm flex items-start ${alert.type === 'warning' ? 'bg-orange-500/10 border-orange-500/30 text-orange-200' : 'bg-green-500/10 border-green-500/30 text-green-200'}`}>
                            <AlertTriangle className={`w-4 h-4 mr-2 shrink-0 ${alert.type === 'warning' ? 'text-orange-500' : 'text-green-500'}`} />
                            {alert.msg}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inventory Section */}
                <div className="bg-white rounded border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Critical Inventory Levels</h3>
                    <div className="space-y-6">
                        {resources.map(item => {
                             const percentage = Math.round((item.count / 500) * 100); // Assuming 500 is max cap
                             const isLow = percentage < 30;
                             
                             return (
                                <div key={item.id} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <div className="font-bold text-slate-800 text-lg flex items-center">
                                                {item.name}
                                                {isLow && <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] uppercase font-bold rounded">Low Stock</span>}
                                            </div>
                                            <div className="text-xs text-slate-400">Sector 4 Depot</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-slate-700">{item.count}</span>
                                            <span className="text-xs text-slate-400 ml-1">/ 500 units</span>
                                        </div>
                                    </div>
                                    
                                    {/* Visual Progress Bar */}
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                        {/* Tick marks */}
                                        <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/50 z-10"></div>
                                        <div className="absolute top-0 bottom-0 left-2/4 w-px bg-white/50 z-10"></div>
                                        <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/50 z-10"></div>
                                        
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${getStatusColor(item.count, 500)}`} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-mono">
                                        <span>STATUS: {isLow ? 'RESUPPLY REQUESTED' : 'OPTIMAL'}</span>
                                        <span>{percentage}% CAPACITY</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Active Units Section */}
                <div>
                     <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                        <span>Active Response Units</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">12 TEAMS DEPLOYED</span>
                     </h3>
                     
                     <div className="grid grid-cols-1 gap-3">
                         {volunteers.map(vol => (
                             <div key={vol.id} className="bg-white p-4 rounded border border-slate-200 shadow-sm flex flex-col gap-3 hover:border-blue-400 transition-colors cursor-pointer group">
                                 <div className="flex items-start justify-between w-full">
                                     <div className="flex items-start gap-4">
                                         <div className={`p-2 rounded-lg ${vol.status === 'BUSY' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                             <Truck className="w-5 h-5" />
                                         </div>
                                         <div>
                                             <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                 {vol.name}
                                                 <span className="text-[10px] font-normal text-slate-400 uppercase bg-slate-50 px-1 border rounded">{vol.role}</span>
                                             </h4>
                                             <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                                                 <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> Sector 4, Block B</span>
                                                 <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> On task: 24m</span>
                                             </div>
                                         </div>
                                     </div>
                                     <div className="text-right">
                                         <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase ${
                                             vol.status === 'BUSY' ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-green-50 text-green-700 border border-green-100'
                                         }`}>
                                             {vol.status === 'BUSY' ? 'ENGAGED' : 'STANDBY'}
                                         </div>
                                     </div>
                                 </div>
                                 
                                 {/* Mission Timeline Visualization */}
                                 {vol.status === 'BUSY' && (
                                     <div className="w-full bg-slate-50 rounded p-2 mt-1">
                                         <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                                             <span>START: 14:00</span>
                                             <span>ETA: 45m</span>
                                         </div>
                                         <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                                             <div className="h-full bg-green-500/50 w-[30%]"></div> {/* Completed */}
                                             <div className="h-full bg-blue-500 w-[20%] animate-pulse"></div> {/* Active */}
                                         </div>
                                     </div>
                                 )}
                             </div>
                         ))}
                         
                         {/* Mock extra units for visual density */}
                         <div className="bg-slate-50 p-3 rounded border border-slate-200 border-dashed flex justify-center items-center text-xs text-slate-400 font-medium cursor-pointer hover:bg-slate-100 transition-colors">
                             + LOAD 8 MORE UNITS
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Resources;
