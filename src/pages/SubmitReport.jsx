import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { INCIDENT_TYPES } from '../data/mockData';
import { 
    MapPin, CheckCircle, AlertOctagon, Info, ShieldCheck,
    Droplets, Flame, HeartPulse, Package, AlertTriangle 
} from 'lucide-react';
import { cn } from '../lib/utils';

// Icon mapping to avoid 'import * as Icons'
const ICON_MAP = {
    Droplets,
    Flame,
    HeartPulse,
    Package,
    TriangleAlert: AlertTriangle // Map the data string 'TriangleAlert' to the component AlertTriangle
};

const SubmitReport = () => {
    const navigate = useNavigate();
    const { addIncident } = useAppState();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false); // New Success State
    
    const [formData, setFormData] = useState({
        type: '',
        severity: 'HIGH',
        description: '',
        locationConfirmed: true,
    });

    const SEVERITY_OPTIONS = [
        { id: 'LOW', label: 'Needs Attention', desc: 'Property damage, blocked roads, non-urgent.', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        { id: 'HIGH', label: 'Urgent', desc: 'Injuries, active fire, major hazard.', color: 'bg-orange-100 text-orange-800 border-orange-300' },
        { id: 'CRITICAL', label: 'Life-Threatening', desc: 'Immediate danger to life. Needs rapid response.', color: 'bg-red-100 text-red-800 border-red-300 animate-pulse' },
    ];

    // Smart Guidance Mapping
    const GUIDANCE_TIPS = {
        medical: "For mass casualties, please indicate the approximate number of injured in details.",
        fire: "Ensure you are at a safe distance before reporting. Do not enter burning structures.",
        flood: "If water level is rising rapidly, mark severity as CRITICAL immediately.",
        supply: "Specify if water or food is the primary need.",
        infrastructure: "Stay clear of damaged bridges or power lines."
    };

    const handleTypeSelect = (typeId) => {
        setFormData(prev => ({ ...prev, type: typeId }));
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        // Simulate network delay
        setTimeout(() => {
            addIncident({
                type: formData.type.toUpperCase(), // Using ID as type for now
                severity: formData.severity,
                description: formData.description,
                lat: 28.6139 + (Math.random() - 0.5) * 0.01,
                lng: 77.2090 + (Math.random() - 0.5) * 0.01,
                locationName: 'Detected Location (GPS)',
                reporterId: 'current-user',
            });
            setSubmitting(false);
            setSuccess(true); // Show success screen instead of immediate redirect
        }, 1500);
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto py-12 px-6 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-200 shadow-lg">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Help is on the way.</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Your report has been received by <strong className="text-slate-800">Unit Alpha-1</strong> and nearest response teams in <strong>Sector 4</strong>.
                </p>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8 text-left">
                    <h4 className="font-bold text-blue-800 text-sm mb-1 flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Next Steps
                    </h4>
                    <ul className="text-xs text-blue-700 space-y-2 list-disc pl-4">
                        <li>Stay near your location if safe.</li>
                        <li>Keep your phone line open for verification.</li>
                        <li>Update the report if the situation changes.</li>
                    </ul>
                </div>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
                >
                    Return to Mission Control
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-6 px-4">
            
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold font-serif text-slate-900">Emergency Report</h2>
                <p className="text-sm text-slate-500">Step {step} of 2 • <span className="text-blue-600 font-medium">{step === 1 ? 'Identify Threat' : 'Details & Location'}</span></p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
                {step === 1 && (
                    <div className="p-6 animate-in slide-in-from-right duration-300">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                            <AlertOctagon className="w-5 h-5 mr-2 text-red-600" />
                            What type of emergency is it?
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.values(INCIDENT_TYPES).map((type) => {
                                const Icon = ICON_MAP[type.icon] || Info;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => handleTypeSelect(type.id)}
                                        className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-xl hover:bg-red-50 hover:border-red-200 hover:shadow-md transition-all gap-3 text-center h-40 group"
                                    >
                                        <div className={cn("p-4 rounded-full text-white transition-transform group-hover:scale-110", type.color)}>
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <span className="font-bold text-slate-700 group-hover:text-red-700">{type.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="p-6 animate-in slide-in-from-right duration-300 space-y-6">
                        
                        {/* Selected Type Badge */}
                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <span className="text-sm text-slate-500 font-medium">Selected: <strong className="text-slate-900">{INCIDENT_TYPES[formData.type]?.label}</strong></span>
                            <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 font-bold hover:underline">CHANGE</button>
                        </div>

                        {/* Smart Guidance Tip */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r text-xs text-blue-800 leading-relaxed font-medium">
                            <strong>Tip:</strong> {GUIDANCE_TIPS[formData.type] || "Provide as much detail as possible for faster response."}
                        </div>

                        {/* Severity Selector */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">How severe is it?</label>
                            <div className="space-y-3">
                                {SEVERITY_OPTIONS.map((level) => (
                                    <div 
                                        key={level.id}
                                        onClick={() => setFormData(prev => ({ ...prev, severity: level.id }))}
                                        className={cn(
                                            "cursor-pointer p-3 rounded-lg border-2 flex items-center transition-all",
                                            formData.severity === level.id 
                                                ? `border-slate-800 bg-slate-50 ring-1 ring-slate-800` 
                                                : "border-slate-100 hover:border-slate-300"
                                        )}
                                    >
                                        <div className={cn("w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center shrink-0", 
                                            formData.severity === level.id ? "border-slate-900" : "border-slate-300"
                                        )}>
                                            {formData.severity === level.id && <div className="w-2 h-2 rounded-full bg-slate-900"></div>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm text-slate-900">{level.label}</span>
                                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", level.color)}>
                                                    {level.id}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">{level.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location & Details */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Location & Details</label>
                                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg text-blue-800 text-sm mb-3 border border-blue-100">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <span>GPS Location Detected: <strong>Connaught Place, Sector 4</strong></span>
                                </div>
                                <textarea
                                    className="w-full p-4 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-0 outline-none min-h-[100px] text-sm font-medium resize-none"
                                    placeholder="Describe the situation briefly (optional)..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2">
                             <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 px-6 rounded-xl bg-red-600 text-white font-bold text-lg hover:bg-red-700 active:scale-[0.98] transition-all shadow-xl shadow-red-200 disabled:opacity-70 disabled:scale-100"
                            >
                                {submitting ? 'Transmitting Alert...' : 'SEND EMERGENCY REPORT'}
                            </button>
                            <div className="mt-4 flex items-center justify-center text-xs text-slate-400 gap-1.5">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Report will be immediately visible to nearby response units.</span>
                            </div>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
};

export default SubmitReport;
