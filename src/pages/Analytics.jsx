import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, AlertTriangle, Clock, Map } from 'lucide-react';

const data = [
  { time: '10:00', incidents: 2, resolved: 0 },
  { time: '11:00', incidents: 5, resolved: 1 },
  { time: '12:00', incidents: 8, resolved: 3 },
  { time: '13:00', incidents: 12, resolved: 5 },
  { time: '14:00', incidents: 20, resolved: 8 },
  { time: '15:00', incidents: 18, resolved: 12 },
  { time: '16:00', incidents: 15, resolved: 15 },
];

const categoryData = [
    { name: 'Fire', count: 12 },
    { name: 'Flood', count: 8 },
    { name: 'Medical', count: 18 },
    { name: 'Supply', count: 5 },
];

const InsightCard = ({ title, value, subtitle, trend, color, icon: Icon }) => (
    <div className="bg-white p-6 rounded border border-slate-200 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

const Analytics = () => {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                    Operational Intelligence
                </h2>
                <p className="text-slate-500 text-sm">Post-incident analysis and real-time trend monitoring.</p>
            </div>

            {/* 1. KEY INSIGHTS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InsightCard 
                    title="Avg Response Time" 
                    value="12m 30s" 
                    subtitle="↓ 15% better than yesterday" 
                    color="bg-green-100 text-green-600"
                    icon={Clock}
                />
                <InsightCard 
                    title="Incident Volume" 
                    value="42" 
                    subtitle="↑ High activity in Sector 4" 
                    color="bg-red-100 text-red-600"
                    icon={AlertTriangle}
                />
                 <InsightCard 
                    title="Heatmap Focus" 
                    value="North" 
                    subtitle="Concentration shifting rapidly" 
                    color="bg-blue-100 text-blue-600"
                    icon={Map}
                />
            </div>

            {/* 2. CHARTS SECTION */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-sm uppercase text-slate-500 tracking-widest">Incident Volume vs Resolution</h3>
                        <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">LAST 6 HOURS</span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="time" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px'}}
                                    itemStyle={{color: '#1e293b'}}
                                />
                                <Area type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                                <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRes)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-sm uppercase text-slate-500 tracking-widest">Incident Distribution</h3>
                        <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">BY TYPE</span>
                    </div>
                    <div className="h-72">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" tick={{fontSize: 11, fontWeight: 600, fill: '#475569'}} width={60} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{fill: '#f1f5f9'}}
                                    contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px'}}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
             </div>

             {/* 3. INTELLIGENCE SUMMARY */}
             <div className="bg-slate-900 rounded p-6 text-slate-300">
                 <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Strategic Assessment</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                         <h4 className="text-white font-bold mb-2">Primary Bottlenecks</h4>
                         <p className="text-sm leading-relaxed">
                             Medical units are facing 15m delays due to waterlogging in Sector 4. 
                             Recommendation: Reroute via Northern Highway for all non-critical logistics.
                         </p>
                     </div>
                     <div>
                         <h4 className="text-white font-bold mb-2">Resource Projection</h4>
                         <p className="text-sm leading-relaxed">
                             At current consumption rates, sterile medical kits will reach critical low (30%) within 4 hours.
                             Suggest initiating resupply from Central Depot immediately.
                         </p>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export default Analytics;
