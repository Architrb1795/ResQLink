import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { INCIDENT_TYPES } from '../data/mockData';
import { geoApi } from '../api/geoApi';
import {
    MapPin, CheckCircle, AlertOctagon, Info, ShieldCheck,
    Droplets, Flame, HeartPulse, Package, AlertTriangle,
    Search, Loader2, CloudRain
} from 'lucide-react';
import { cn } from '../lib/utils';

// Icon mapping
const ICON_MAP = {
    Droplets,
    Flame,
    HeartPulse,
    Package,
    TriangleAlert: AlertTriangle
};

const SubmitReport = () => {
    const navigate = useNavigate();
    const { addIncident, isConnected } = useAppState();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Location state
    const [locationSearch, setLocationSearch] = useState('');
    const [locationResults, setLocationResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [gpsDetected, setGpsDetected] = useState(false);
    const searchTimeout = useRef(null);

    const [formData, setFormData] = useState({
        type: '',
        severity: 'HIGH',
        description: '',
    });

    const SEVERITY_OPTIONS = [
        { id: 'LOW', label: 'Needs Attention', desc: 'Property damage, blocked roads, non-urgent.', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        { id: 'HIGH', label: 'Urgent', desc: 'Injuries, active fire, major hazard.', color: 'bg-orange-100 text-orange-800 border-orange-300' },
        { id: 'CRITICAL', label: 'Life-Threatening', desc: 'Immediate danger to life. Needs rapid response.', color: 'bg-red-100 text-red-800 border-red-300 animate-pulse' },
    ];

    const GUIDANCE_TIPS = {
        medical: "For mass casualties, please indicate the approximate number of injured in details.",
        fire: "Ensure you are at a safe distance before reporting. Do not enter burning structures.",
        flood: "If water level is rising rapidly, mark severity as CRITICAL immediately.",
        supply: "Specify if water or food is the primary need.",
        infrastructure: "Stay clear of damaged bridges or power lines."
    };

    // Auto-detect GPS location on mount
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const loc = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        name: 'GPS Detected Location',
                    };

                    // Try reverse geocoding
                    if (isConnected) {
                        try {
                            const result = await geoApi.reverse(loc.lat, loc.lng);
                            if (result?.display_name) {
                                loc.name = result.display_name.split(',').slice(0, 3).join(',');
                            }
                        } catch { /* ignore */ }
                    }

                    setSelectedLocation(loc);
                    setGpsDetected(true);
                },
                () => {
                    // GPS denied — user must search manually
                    setSelectedLocation({
                        lat: 28.6139 + (Math.random() - 0.5) * 0.01,
                        lng: 77.2090 + (Math.random() - 0.5) * 0.01,
                        name: 'Connaught Place, New Delhi (Default)',
                    });
                }
            );
        }
    }, [isConnected]);

    // Debounced location search
    const handleLocationSearch = (query) => {
        setLocationSearch(query);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (query.length < 3) {
            setLocationResults([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            if (!isConnected) return;
            setSearchLoading(true);
            try {
                const results = await geoApi.search(query);
                setLocationResults(results.slice(0, 5));
            } catch {
                setLocationResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
    };

    const selectSearchResult = (result) => {
        setSelectedLocation({
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            name: result.display_name?.split(',').slice(0, 3).join(',') || result.name,
        });
        setLocationSearch('');
        setLocationResults([]);
        setGpsDetected(false);
    };

    const handleTypeSelect = (typeId) => {
        setFormData(prev => ({ ...prev, type: typeId }));
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const incidentData = {
            type: formData.type.toUpperCase(),
            severity: formData.severity,
            description: formData.description,
            lat: selectedLocation?.lat || 28.6139,
            lng: selectedLocation?.lng || 77.2090,
            locationName: selectedLocation?.name || 'Unknown Location',
        };

        try {
            await addIncident(incidentData);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to submit report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto py-12 px-6 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-200 shadow-lg">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Help is on the way.</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Your report has been received and nearest response teams have been notified.
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
                {!isConnected && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">⚡ Demo Mode — report saved locally</p>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

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

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>

                            {/* Current Location Display */}
                            {selectedLocation && (
                                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg text-blue-800 text-sm mb-3 border border-blue-100">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <span className="flex-1">
                                        {gpsDetected ? 'GPS: ' : ''}<strong>{selectedLocation.name}</strong>
                                    </span>
                                </div>
                            )}

                            {/* Location Search */}
                            {isConnected && (
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={locationSearch}
                                        onChange={(e) => handleLocationSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        placeholder="Search for a different location..."
                                    />
                                    {searchLoading && <Loader2 className="absolute right-3 top-3 w-4 h-4 text-blue-500 animate-spin" />}

                                    {/* Search Results Dropdown */}
                                    {locationResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {locationResults.map((result, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => selectSearchResult(result)}
                                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 border-b border-slate-100 last:border-0"
                                                >
                                                    <MapPin className="w-3 h-3 inline mr-2 text-slate-400" />
                                                    {result.display_name || result.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Describe the situation</label>
                            <textarea
                                className="w-full p-4 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-0 outline-none min-h-[100px] text-sm font-medium resize-none"
                                placeholder="Describe the situation briefly..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                required
                            />
                        </div>

                        {/* Submit */}
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
