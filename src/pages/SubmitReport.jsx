import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { INCIDENT_TYPES, SEVERITY_LEVELS } from '../data/mockData';
import { Camera, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import * as Icons from 'lucide-react';

const SubmitReport = () => {
    const navigate = useNavigate();
    const { addIncident } = useAppState();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        type: '',
        severity: 'MEDIUM',
        description: '',
        locationConfirmed: false,
    });

    const handleTypeSelect = (typeId) => {
        setFormData(prev => ({ ...prev, type: typeId }));
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulate network delay
        setTimeout(() => {
            const typeConfig = Object.values(INCIDENT_TYPES).find(t => t.id === formData.type);
            addIncident({
                type: formData.type.toUpperCase(), // basic mapping
                severity: formData.severity,
                description: formData.description,
                lat: 28.6139 + (Math.random() - 0.5) * 0.01, // Mock location near center
                lng: 77.2090 + (Math.random() - 0.5) * 0.01,
                locationName: 'Current Location (GPS)',
                reporterId: 'current-user',
            });
            setLoading(false);
            navigate('/');
        }, 1500);
    };

    return (
        <div className="max-w-xl mx-auto py-6">
            <h2 className="text-2xl font-bold font-serif mb-6 text-text">Report Incident</h2>

            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                {/* Progress Bar */}
                <div className="h-1 bg-slate-100 flex">
                    <div className={cn("h-full bg-primary transition-all duration-300", step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full")}></div>
                </div>

                <div className="p-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-semibold mb-4">What's the emergency?</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.values(INCIDENT_TYPES).map((type) => {
                                    const Icon = Icons[type.icon] || AlertTriangle;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => handleTypeSelect(type.id)}
                                            className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-slate-50 hover:border-primary/50 transition-all gap-2 text-center h-32"
                                        >
                                            <div className={cn("p-3 rounded-full text-white", type.color)}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <span className="font-medium text-sm text-text">{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                           
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Severity Assessment</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {Object.values(SEVERITY_LEVELS).map((level) => (
                                        <button
                                            key={level.id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, severity: level.id.toUpperCase() }))}
                                            className={cn(
                                                "py-2 px-1 rounded-lg text-xs font-bold border transition-all",
                                                formData.severity === level.id.toUpperCase()
                                                    ? `${level.bg} ${level.color} ring-2 ring-offset-1 ring-${level.color.split('-')[1]}-400`
                                                    : "bg-slate-50 text-slate-500 border-slate-200"
                                            )}
                                        >
                                            {level.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Details</label>
                                <textarea
                                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                                    placeholder="Describe the situation..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-semibold text-text">Location Detected</div>
                                        <div className="text-text-muted text-xs">Lat: 28.6139, Long: 77.2090</div>
                                    </div>
                                </div>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 px-4 rounded-lg border border-border text-text font-medium hover:bg-slate-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-2 w-full py-3 px-4 rounded-lg bg-critical text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Sending SOS...' : 'SEND SOS ALERT'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmitReport;
