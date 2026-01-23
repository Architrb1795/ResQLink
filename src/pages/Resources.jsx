import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { Package, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';

const Resources = () => {
    const { resources, volunteers } = useAppState();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold font-serif text-text">Resource & Logistics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inventory Panel */}
                <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg flex items-center">
                            <Package className="w-5 h-5 mr-2 text-primary" />
                            Inventory
                        </h3>
                        <button className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold hover:bg-primary/20 transition-colors">
                            + Add Supply
                        </button>
                    </div>

                    <div className="space-y-4">
                        {resources.map(res => (
                            <div key={res.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-slate-50">
                                <div>
                                    <p className="font-bold text-text">{res.type}</p>
                                    <p className="text-xs text-text-muted">{res.quantity} {res.unit}</p>
                                </div>
                                <div className="flex items-center">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                        res.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 
                                        res.status === 'LIMITED' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {res.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Volunteer & Logistics Panel */}
                <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg flex items-center">
                            <Truck className="w-5 h-5 mr-2 text-blue-600" />
                            Active Units
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {volunteers.map(vol => (
                            <div key={vol.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-slate-50">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                                        {vol.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-text text-sm">{vol.name}</p>
                                        <p className="text-xs text-text-muted">
                                            {vol.currentTaskId ? `Responding to ${vol.currentTaskId}` : 'Standby'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {vol.status === 'DEPLOYED' ? (
                                        <Truck className="w-4 h-4 text-blue-500 animate-pulse" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resources;
