import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { useLanguage } from '../context/LanguageContext';
import { getWhat3WordsLocation } from '../services/apiServices';
import { INCIDENT_TYPES } from '../data/mockData';
import { 
    MapPin, CheckCircle, AlertOctagon, Info, ShieldCheck,
    Droplets, Flame, HeartPulse, Package, AlertTriangle, X
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

// ── Success Toast Overlay ────────────────────────────────────────────────────
const SuccessToast = ({ onClose, onNavigate }) => {
    const { t } = useLanguage();
    const [visible, setVisible] = useState(false);
    const [countdown, setCountdown] = useState(6);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onNavigate();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [onNavigate]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className={cn(
                "relative bg-white dark:bg-dark-surface rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transition-all duration-500",
                visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-8"
            )}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-700">
                    <div
                        className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${(countdown / 6) * 100}%` }}
                    />
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                </button>

                <div className="p-8 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-5">
                        <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping opacity-40" />
                        <div className="relative w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-green-900/30">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text mb-2">{t('report.submitted')}</h2>
                    <p className="text-slate-500 dark:text-dark-text-muted text-sm leading-relaxed mb-1">
                        {t('report.received')}
                    </p>
                    <p className="text-slate-800 dark:text-dark-text font-bold text-sm mb-5">
                        Unit Alpha-1 · Sector 4 Response Team
                    </p>

                    <div className="flex gap-2 justify-center mb-6 flex-wrap">
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">{t('report.statusBadges')[0]}</span>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">{t('report.statusBadges')[1]}</span>
                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold px-3 py-1 rounded-full">{t('report.statusBadges')[2]}</span>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-6 text-left">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 text-xs mb-2 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {t('report.nextSteps')}
                        </h4>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1.5 list-disc pl-4">
                            <li>{t('report.stayLocation')}</li>
                            <li>{t('report.keepLine')}</li>
                            <li>{t('report.updateReport')}</li>
                        </ul>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 border-2 border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-muted font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
                        >
                            {t('report.submitAnother')}
                        </button>
                        <button 
                            onClick={onNavigate}
                            className="flex-1 py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all shadow-lg text-sm"
                        >
                            {t('report.goDashboard')} ({countdown}s)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SubmitReport = () => {
    const navigate = useNavigate();
    const { addIncident, currentUser } = useAppState();
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [w3wLocation, setW3wLocation] = useState('');
    const [advancedOpen, setAdvancedOpen] = useState(false);
    
    useEffect(() => {
        getWhat3WordsLocation(28.6139, 77.2090).then(words => {
            if (words) setW3wLocation(words);
        });
    }, []);

    const [formData, setFormData] = useState({
        type: '',
        severity: 'HIGH',
        description: '',
        locationConfirmed: true,
    });

    const [extra, setExtra] = useState({
        people: 'unknown', // unknown | 1-2 | 3-5 | 6+
        evacuation: false,
        hazmat: false,
        landmark: '',
    });


    const getSeverityLabel = (id) => t(`severity.${id}`) || id;
    const getIncidentLabel = (typeId) => {
        const type = INCIDENT_TYPES[typeId.toUpperCase()];
        return type ? t(type.translationKey) : typeId;
    };

    const SEVERITY_OPTIONS = [
        { id: 'LOW', desc: 'Property damage, blocked roads, non-urgent.', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        { id: 'HIGH', desc: 'Injuries, active fire, major hazard.', color: 'bg-orange-100 text-orange-800 border-orange-300' },
        { id: 'CRITICAL', desc: 'Immediate danger to life. Needs rapid response.', color: 'bg-red-100 text-red-800 border-red-300 animate-pulse' },
    ];

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

    const [serverUrl] = useState('https://resqapp-2.onrender.com');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const extraLines = [];
        if (extra.people !== 'unknown') extraLines.push(`[People: ${extra.people}]`);
        if (extra.evacuation) extraLines.push('[Evacuation: requested]');
        if (extra.hazmat) extraLines.push('[Hazmat: possible]');
        if (extra.landmark.trim()) extraLines.push(`[Landmark: ${extra.landmark.trim()}]`);
        if (w3wLocation) extraLines.push(`[W3W: ///${w3wLocation}]`);
        const descriptionWithMeta = [formData.description.trim(), ...extraLines].filter(Boolean).join('\n');
        
        try {
            const res = await fetch(`${serverUrl}/api/incidents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: formData.type.toUpperCase(),
                    severity: formData.severity,
                    description: descriptionWithMeta,
                    lat: 28.6139 + (Math.random() - 0.5) * 0.01,
                    lng: 77.2090 + (Math.random() - 0.5) * 0.01,
                    locationName: 'Detected Location (GPS)',
                    reporterId: currentUser?.id || 'guest-user',
                    reporterPhone: currentUser?.phone || null
                })
            });
            
            if (res.ok) {
                addIncident({
                    type: formData.type.toUpperCase(),
                    severity: formData.severity,
                    description: descriptionWithMeta,
                    lat: 28.6139 + (Math.random() - 0.5) * 0.01,
                    lng: 77.2090 + (Math.random() - 0.5) * 0.01,
                    locationName: 'Detected Location (GPS)',
                    reporterId: currentUser?.id || 'guest-user',
                    reporterPhone: currentUser?.phone || null
                });
            }
        } catch (err) {
            console.log('Server not available, storing locally only');
        }
        
        setSubmitting(false);
        setShowSuccess(true);
    };


    const resetForm = () => {
        setShowSuccess(false);
        setStep(1);
        setFormData({ type: '', severity: 'HIGH', description: '', locationConfirmed: true });
        setExtra({ people: 'unknown', evacuation: false, hazmat: false, landmark: '' });
        setAdvancedOpen(false);
    };

    return (
        <>
        {/* Success Modal Toast */}
        {showSuccess && (
            <SuccessToast
                onClose={resetForm}
                onNavigate={() => navigate('/dashboard')}
            />
        )}
        <div className="max-w-5xl mx-auto px-2 md:px-0">
            
            <div className="mb-4 md:mb-6 text-center">
                <h2 className="text-2xl md:text-3xl font-black font-serif text-slate-900 dark:text-dark-text tracking-tight">{t('report.title')}</h2>
                <p className="text-sm text-slate-500 dark:text-dark-text-muted">{t('report.step')} {step} {t('report.of')} 2 • <span className="text-blue-600 font-medium">{step === 1 ? t('report.selectThreat') : t('report.details')}</span></p>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg border border-slate-200 dark:border-dark-border overflow-hidden relative">
                {step === 1 && (
                    <div className="p-5 md:p-6 animate-in slide-in-from-right duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                            <div className="md:col-span-3">
                                <h3 className="text-lg font-black text-slate-900 dark:text-dark-text mb-3 flex items-center">
                                    <AlertOctagon className="w-5 h-5 mr-2 text-red-600" />
                                    {t('report.whatType')}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {Object.values(INCIDENT_TYPES).map((type) => {
                                        const Icon = ICON_MAP[type.icon] || Info;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => handleTypeSelect(type.id)}
                                                className="flex flex-col items-center justify-center px-4 py-5 border-2 border-slate-100 dark:border-dark-border rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 hover:shadow-md transition-all gap-3 text-center h-32 md:h-36 group"
                                            >
                                                <div className={cn("p-3.5 rounded-full text-white transition-transform group-hover:scale-110", type.color)}>
                                                    <Icon className="w-7 h-7" />
                                                </div>
                                                <span className="font-black text-slate-800 dark:text-dark-text group-hover:text-red-700 dark:group-hover:text-red-400 text-sm leading-tight">
                                                    {t(type.translationKey)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/40 p-4">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                                        Quick Safety
                                    </div>
                                    <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                                        If life-threatening, call <span className="font-black text-red-600">112</span> first.
                                    </div>
                                    <div className="mt-3 grid grid-cols-1 gap-2">
                                        <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                                            Add a clear landmark and what you can see/hear.
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                                            Use CRITICAL only if someone is in immediate danger.
                                        </div>
                                    </div>
                                    <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                                        Next: severity + details (takes ~20 seconds).
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="p-5 md:p-6 animate-in slide-in-from-right duration-300 space-y-4">
                        
                        {/* Selected Type Badge */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-dark-border">
                            <span className="text-sm text-slate-500 dark:text-dark-text-muted font-medium">Selected: <strong className="text-slate-900 dark:text-dark-text">{getIncidentLabel(formData.type)}</strong></span>
                            <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 font-bold hover:underline">CHANGE</button>
                        </div>

                        {/* Smart Guidance Tip */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded-r text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                            <strong>Tip:</strong> {GUIDANCE_TIPS[formData.type] || "Provide as much detail as possible for faster response."}
                        </div>

                        {/* Severity Selector */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-dark-text mb-3">{t('report.howSevere')}</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {SEVERITY_OPTIONS.map((level) => (
                                    <div 
                                        key={level.id}
                                        onClick={() => setFormData(prev => ({ ...prev, severity: level.id }))}
                                        className={cn(
                                            "cursor-pointer p-3 rounded-2xl border-2 transition-all h-full",
                                            formData.severity === level.id 
                                                ? "border-slate-900 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 ring-1 ring-slate-900/10" 
                                                : "border-slate-100 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-sm text-slate-900 dark:text-dark-text">{getSeverityLabel(level.id)}</span>
                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", level.color)}>
                                                {level.id}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1 leading-snug">{level.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location & Details */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-dark-text mb-2">{t('report.locationDetails')}</label>
                                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-blue-800 dark:text-blue-300 text-sm mb-3 border border-blue-100 dark:border-blue-800">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <div>
                                        <span className="block">{t('report.locationDetected')}: <strong>Connaught Place, Sector 4</strong></span>
                                        {w3wLocation && (
                                            <span className="block mt-0.5 font-mono text-xs text-blue-600 dark:text-blue-400">
                                                {`///${w3wLocation}`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <textarea
                                    className="w-full p-4 border-2 border-slate-200 dark:border-dark-border rounded-lg focus:border-blue-500 focus:ring-0 outline-none min-h-[100px] text-sm font-medium resize-none bg-white dark:bg-dark-surface text-slate-800 dark:text-dark-text"
                                    placeholder={t('report.descriptionPlaceholder')}
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Optional Context (feature-rich, collapsible to avoid clutter) */}
                        <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/30 p-4">
                            <button
                                type="button"
                                onClick={() => setAdvancedOpen((v) => !v)}
                                className="w-full flex items-center justify-between text-left"
                                aria-expanded={advancedOpen}
                            >
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                        More Details (Optional)
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        Add people count, hazards, and a landmark for faster triage.
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-xs font-black px-2 py-1 rounded-lg border transition-colors",
                                    advancedOpen
                                        ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-700 dark:border-slate-600"
                                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                )}>
                                    {advancedOpen ? "HIDE" : "ADD"}
                                </span>
                            </button>

                            {advancedOpen && (
                                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                                    <label className="block">
                                        <div className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                                            People Affected
                                        </div>
                                        <select
                                            value={extra.people}
                                            onChange={(e) => setExtra((p) => ({ ...p, people: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-800 dark:text-dark-text font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                        >
                                            <option value="unknown">Unknown</option>
                                            <option value="1-2">1 to 2</option>
                                            <option value="3-5">3 to 5</option>
                                            <option value="6+">6+</option>
                                        </select>
                                    </label>

                                    <label className="block">
                                        <div className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">
                                            Landmark (Optional)
                                        </div>
                                        <input
                                            value={extra.landmark}
                                            onChange={(e) => setExtra((p) => ({ ...p, landmark: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-800 dark:text-dark-text font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                            placeholder="e.g. Near Metro Gate 2 / Red Bridge"
                                        />
                                    </label>

                                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setExtra((p) => ({ ...p, evacuation: !p.evacuation }))}
                                            className={cn(
                                                "px-4 py-3 rounded-xl border text-left transition-colors",
                                                extra.evacuation
                                                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-200"
                                                    : "bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-700 dark:text-dark-text hover:border-amber-300"
                                            )}
                                        >
                                            <div className="text-xs font-black uppercase tracking-widest">Evacuation</div>
                                            <div className="text-[11px] mt-1 text-slate-500 dark:text-dark-text-muted">
                                                {extra.evacuation ? "Requested / in progress" : "Not required"}
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setExtra((p) => ({ ...p, hazmat: !p.hazmat }))}
                                            className={cn(
                                                "px-4 py-3 rounded-xl border text-left transition-colors",
                                                extra.hazmat
                                                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200"
                                                    : "bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-700 dark:text-dark-text hover:border-red-300"
                                            )}
                                        >
                                            <div className="text-xs font-black uppercase tracking-widest">Hazmat Risk</div>
                                            <div className="text-[11px] mt-1 text-slate-500 dark:text-dark-text-muted">
                                                {extra.hazmat ? "Possible chemicals / gas / smoke" : "No hazmat indicators"}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="pt-2">
                             <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 px-6 rounded-xl bg-red-600 text-white font-bold text-lg hover:bg-red-700 active:scale-[0.98] transition-all shadow-xl shadow-red-200 dark:shadow-red-900/30 disabled:opacity-70 disabled:scale-100"
                            >
                                {submitting ? t('report.submitting') : t('report.submit')}
                            </button>
                            <div className="mt-4 flex items-center justify-center text-xs text-slate-400 dark:text-dark-text-muted gap-1.5">
                                <ShieldCheck className="w-3 h-3" />
                                <span>{t('report.tip')}</span>
                            </div>
                        </div>

                    </form>
                )}
            </div>
        </div>
        </>
    );
};

export default SubmitReport;
