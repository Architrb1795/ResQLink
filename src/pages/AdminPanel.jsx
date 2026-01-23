import React, { useState } from 'react';
import { Shield, Server, Radio, Users, AlertTriangle, RefreshCw, Power } from 'lucide-react';

const Toggle = ({ label, active, onClick }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
        <span className="font-medium text-slate-700">{label}</span>
        <button 
            onClick={onClick}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? 'bg-green-500' : 'bg-slate-300'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const AdminPanel = () => {
    const [systemStatus, setSystemStatus] = useState({
        db: true,
        ai: true,
        notifications: true,
        publicGateway: true
    });

    const [broadcastMsg, setBroadcastMsg] = useState('');

    const toggleStatus = (key) => setSystemStatus(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center">
                    <Shield className="w-6 h-6 mr-2 text-blue-600" />
                    System Control Center
                </h2>
                <p className="text-slate-500 text-sm">Administrator controls for system integrity and emergency broadcasts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* System Infrastructure Status */}
                <div className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center">
                        <Server className="w-4 h-4 mr-2" />
                        Infrastructure Status
                    </h3>
                    <div className="space-y-3">
                        <Toggle label="Main Database Cluster" active={systemStatus.db} onClick={() => toggleStatus('db')} />
                        <Toggle label="AI Analysis Engine" active={systemStatus.ai} onClick={() => toggleStatus('ai')} />
                        <Toggle label="Push Notification Service" active={systemStatus.notifications} onClick={() => toggleStatus('notifications')} />
                        <Toggle label="Public API Gateway" active={systemStatus.publicGateway} onClick={() => toggleStatus('publicGateway')} />
                    </div>
                </div>

                {/* Broadcast Alert-System */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center">
                            <Radio className="w-4 h-4 mr-2" />
                            Emergency Broadcast
                        </h3>
                        <div className="space-y-4">
                            <textarea
                                className="w-full p-3 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                placeholder="Type emergency message to broadcast to all connect units..."
                                rows="3"
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                            ></textarea>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400 font-mono">TARGET: ALL_CHANNELS</span>
                                <button className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 flex items-center">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    BROADCAST NOW
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                            <Power className="w-4 h-4 mr-2" />
                            Simulation Controls
                        </h3>
                        <div className="flex gap-4">
                            <button className="flex-1 py-2 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset Demo Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Active User Sessions (Mock) */}
            <div className="bg-slate-900 rounded p-6 text-slate-300">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Active Personnel
                    </h3>
                    <span className="text-xs font-mono bg-blue-900/50 px-2 py-1 rounded text-blue-300">LIVE MONITORING</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-slate-800 p-3 rounded">
                        <div className="text-xs text-slate-500">ADMINS</div>
                        <div className="text-xl font-bold text-white">3</div>
                    </div>
                     <div className="bg-slate-800 p-3 rounded">
                        <div className="text-xs text-slate-500">AGENCIES</div>
                        <div className="text-xl font-bold text-white">12</div>
                    </div>
                     <div className="bg-slate-800 p-3 rounded">
                        <div className="text-xs text-slate-500">VOLUNTEERS</div>
                        <div className="text-xl font-bold text-white">84</div>
                    </div>
                     <div className="bg-slate-800 p-3 rounded">
                        <div className="text-xs text-slate-500">CIVILIANS</div>
                        <div className="text-xl font-bold text-white">1.2k</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
