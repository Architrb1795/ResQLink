import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

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

const Analytics = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold font-serif text-text">Crisis Analytics</h2>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-bold mb-4 text-sm uppercase text-text-muted">Incident Trends (Last 6 Hours)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D93025" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#D93025" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#188038" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#188038" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="time" tick={{fontSize: 12}} />
                                <YAxis tick={{fontSize: 12}} />
                                <Tooltip />
                                <Area type="monotone" dataKey="incidents" stroke="#D93025" fillOpacity={1} fill="url(#colorInc)" />
                                <Area type="monotone" dataKey="resolved" stroke="#188038" fillOpacity={1} fill="url(#colorRes)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-bold mb-4 text-sm uppercase text-text-muted">Incidents by Category</h3>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 12}} />
                                <YAxis tick={{fontSize: 12}} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#0056D2" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default Analytics;
