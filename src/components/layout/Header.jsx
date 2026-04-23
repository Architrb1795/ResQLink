import React from 'react';
import { Bell, Menu, Sun, Moon, ChevronDown, Pencil, Settings, Shield, LogOut, UserRound } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import LanguageSwitcher from '../LanguageSwitcher';
import { apiStatus } from '../../services/apiServices';

const ModalShell = ({ title, subtitle, onClose, children, footer }) => {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-900/40">
          <div>
            <div className="text-sm font-black text-slate-900 dark:text-white tracking-wide uppercase">{title}</div>
            {subtitle && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <span className="text-slate-400 dark:text-slate-500 text-lg leading-none">×</span>
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const CommandRail = ({ onMenuClick }) => {
  const { currentUser, logout, updateProfile, stats, incidents, lastSync, uiPrefs, updateUiPrefs } = useAppState();
  const role = currentUser?.role || 'GUEST';
  const [isDark, setIsDark] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [showApiDetails, setShowApiDetails] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const profileBtnRef = React.useRef(null);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const notifBtnRef = React.useRef(null);
  const settingsBtnRef = React.useRef(null);

  const [draft, setDraft] = React.useState({ name: '', phone: '', org: '' });

  React.useEffect(() => {
    if (editOpen && currentUser) {
      setDraft({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        org: currentUser.org || '',
      });
    }
  }, [editOpen, currentUser]);

  React.useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e) => {
      const el = profileBtnRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setProfileOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [profileOpen]);

  React.useEffect(() => {
    if (!notifOpen) return;
    const onDown = (e) => {
      const el = notifBtnRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setNotifOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [notifOpen]);

  React.useEffect(() => {
    if (!settingsOpen) return;
    const onDown = (e) => {
      const el = settingsBtnRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setSettingsOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [settingsOpen]);

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const ROLE_COLORS = {
      AGENCY: 'bg-blue-600',
      VOLUNTEER: 'bg-green-600',
      CIVILIAN: 'bg-amber-500',
      GUEST: 'bg-slate-500'
  };

  return (
    <>
    <header className="sticky top-0 z-10 bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border">
        <div className="flex items-center justify-between px-4 h-16">
            
            {/* Left: System Heartbeat */}
            <div className="flex items-center space-x-4">
                <button onClick={onMenuClick} className="md:hidden p-2 text-slate-600 dark:text-dark-text-muted hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                    <Menu className="w-5 h-5" />
                </button>
                
                <div 
                    className="relative cursor-pointer"
                    onMouseEnter={() => setShowApiDetails(true)}
                    onMouseLeave={() => setShowApiDetails(false)}
                >
                    <div className={`flex items-center space-x-3 px-3 py-1.5 rounded-full border transition-all ${apiStatus.isLive ? 'bg-slate-50 border-slate-100 dark:bg-slate-700 dark:border-slate-600' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700'}`}>
                        <div className="relative flex h-3 w-3 shrink-0">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiStatus.isLive ? 'bg-red-400' : 'bg-yellow-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${apiStatus.isLive ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${apiStatus.isLive ? 'text-slate-500 dark:text-slate-400' : 'text-yellow-700 dark:text-yellow-500'}`}>{apiStatus.isLive ? 'System Live' : 'Demo Mode'}</span>
                            <span className={`text-[10px] font-medium ${apiStatus.isLive ? 'text-slate-400 dark:text-slate-500' : 'text-yellow-600 dark:text-yellow-600'}`}>API: {apiStatus.isLive ? 'Active' : 'Missing Keys'}</span>
                        </div>
                        {/* Confidence Indicator - Elite Touch */}
                        <div className="hidden sm:flex items-center pl-3 border-l border-slate-200 dark:border-slate-600 ml-3">
                             <div className="flex flex-col leading-none text-right">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Confidence</span>
                                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">AI Verified: 98%</span>
                            </div>
                        </div>
                    </div>
                    {/* Tooltip API Detail Dropdown */}
                    {showApiDetails && (
                        <div className="absolute top-12 left-0 w-60 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-lg p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase border-b border-slate-100 dark:border-slate-700 pb-1.5 tracking-wider">External Operations API</h4>
                            <div className="space-y-2 mt-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-slate-700 dark:text-dark-text">What3Words (GPS)</span>
                                    <span className={`font-bold ${apiStatus.w3w ? "text-green-500" : "text-amber-500"}`}>{apiStatus.w3w ? "ACTIVE" : "NO KEY"}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-slate-700 dark:text-dark-text">OpenWeatherMap</span>
                                    <span className={`font-bold ${apiStatus.openweathermap ? "text-green-500" : "text-amber-500"}`}>{apiStatus.openweathermap ? "ACTIVE" : "NO KEY"}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-slate-700 dark:text-dark-text">Google Gemini AI</span>
                                    <span className={`font-bold ${apiStatus.gemini ? "text-green-500" : "text-amber-500"}`}>{apiStatus.gemini ? "ACTIVE" : "NO KEY"}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-slate-700 dark:text-dark-text">NASA EONET</span>
                                    <span className="font-bold text-blue-500">PUBLIC DATA</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-slate-700 dark:text-dark-text">GDACS Disaster</span>
                                    <span className="font-bold text-blue-500">PUBLIC DATA</span>
                                </div>
                                {!apiStatus.isLive && (
                                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2 italic pt-2 border-t border-slate-100 dark:border-slate-700">
                                        UI defaults to mock data for inactive elements. Add API Keys to .env to go live.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Center: Cleaned up stats for declutter */}
            <div className="hidden md:flex items-center justify-center flex-1">
                {/* Reserved for future global search or command palette if needed */}
            </div>

            {/* Right: User Context & Controls */}
            <div className="flex items-center space-x-3">
                <LanguageSwitcher />
                
                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                </button>
                
                {currentUser && (
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-dark-text">{currentUser.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-dark-text-muted uppercase tracking-wider">{currentUser.role} ID: {currentUser.id}</span>
                    </div>
                )}

                {/* Settings Menu (frontend-only) */}
                <div className="relative" ref={settingsBtnRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setSettingsOpen((v) => !v);
                            setNotifOpen(false);
                            setProfileOpen(false);
                        }}
                        className="relative hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded-full transition-colors group"
                        aria-haspopup="menu"
                        aria-expanded={settingsOpen}
                        title="Settings"
                    >
                        <Settings className="w-5 h-5 text-slate-600 dark:text-dark-text-muted group-hover:text-blue-600 transition-colors" />
                    </button>

                    {settingsOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[120]"
                        >
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
                                <div className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Settings</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Frontend-only preferences for this browser.</div>
                            </div>

                            <div className="p-4 space-y-4">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Map Density</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'minimal', label: 'Minimal' },
                                            { id: 'balanced', label: 'Balanced' },
                                            { id: 'full', label: 'Full' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => updateUiPrefs({ mapDensity: opt.id })}
                                                className={`px-3 py-2 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-colors ${
                                                    (uiPrefs?.mapDensity || 'balanced') === opt.id
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                                        Reduces map clutter by sampling external feeds into a visible grid.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => updateUiPrefs({ compact: !uiPrefs?.compact })}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors ${
                                            uiPrefs?.compact
                                                ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-700 dark:border-slate-600'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        <div>
                                            <div className="text-xs font-black uppercase tracking-widest">Compact UI</div>
                                            <div className="text-[11px] opacity-80">Tighter spacing on dense panels (demo)</div>
                                        </div>
                                        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-white/10 border border-white/10">
                                            {uiPrefs?.compact ? 'ON' : 'OFF'}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => updateUiPrefs({ reduceMotion: !uiPrefs?.reduceMotion })}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors ${
                                            uiPrefs?.reduceMotion
                                                ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-700 dark:border-slate-600'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        <div>
                                            <div className="text-xs font-black uppercase tracking-widest">Reduce Motion</div>
                                            <div className="text-[11px] opacity-80">Less shimmer and ping (demo)</div>
                                        </div>
                                        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-white/10 border border-white/10">
                                            {uiPrefs?.reduceMotion ? 'ON' : 'OFF'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <button
                                    type="button"
                                    onClick={() => setSettingsOpen(false)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notifications Menu (frontend-only) */}
                <div className="relative" ref={notifBtnRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setNotifOpen((v) => !v);
                            setSettingsOpen(false);
                            setProfileOpen(false);
                        }}
                        className="relative hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded-full transition-colors group"
                        aria-haspopup="menu"
                        aria-expanded={notifOpen}
                        title="Notifications"
                    >
                        <Bell className="w-5 h-5 text-slate-600 dark:text-dark-text-muted group-hover:text-blue-600 transition-colors" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
                    </button>

                    {notifOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[120]"
                        >
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Notifications</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        Last sync: {lastSync?.backend ? new Date(lastSync.backend).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'never'}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNotifOpen(false)}
                                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="p-2 max-h-[380px] overflow-y-auto">
                                {(() => {
                                    const list = [...(incidents || [])]
                                        .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
                                        .slice(0, 6);

                                    if (list.length === 0) {
                                        return (
                                            <div className="p-6 text-center">
                                                <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">All Clear</div>
                                                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                    No recent reports. Submit a test incident to populate alerts.
                                                </div>
                                            </div>
                                        );
                                    }

                                    return list.map((inc) => (
                                        <div
                                            key={inc.id}
                                            className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                                        {inc.type} {inc.severity === 'CRITICAL' ? 'Critical' : inc.severity}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        {inc.locationName || 'Unknown location'}
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                                                    inc.severity === 'CRITICAL'
                                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40'
                                                        : inc.severity === 'HIGH'
                                                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                                                        : 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                                                }`}>
                                                    {inc.severity || 'INFO'}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                                                {inc.timestamp ? new Date(inc.timestamp).toLocaleString() : 'timestamp unknown'}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Menu */}
                <div className="relative" ref={profileBtnRef}>
                  <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                  >
                    <div className={`h-8 w-8 rounded flex items-center justify-center text-white font-bold text-xs shadow-sm ${ROLE_COLORS[role] || ROLE_COLORS.GUEST}`}>
                      {role.charAt(0)}
                    </div>
                    <div className="hidden md:flex flex-col items-start leading-none">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{currentUser?.name || 'Guest'}</span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">{role}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[120]"
                    >
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black ${ROLE_COLORS[role] || ROLE_COLORS.GUEST}`}>
                            <UserRound className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-black text-slate-900 dark:text-white truncate">{currentUser?.name || 'Guest Session'}</div>
                            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                              {role}{currentUser?.id ? ` · ${currentUser.id}` : ''}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          role="menuitem"
                          onClick={() => {
                            setProfileOpen(false);
                            setEditOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                          <Pencil className="w-4 h-4 text-slate-500" />
                          <div className="flex-1">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Edit Profile</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">Name, contact, org label</div>
                          </div>
                        </button>

                        <button
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          <div className="flex-1">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Preferences</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">UI + alert tuning (demo)</div>
                          </div>
                        </button>

                        <button
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                          <Shield className="w-4 h-4 text-slate-500" />
                          <div className="flex-1">
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Security</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">Session + access (demo)</div>
                          </div>
                        </button>
                      </div>

                      <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        {currentUser ? (
                          <button
                            role="menuitem"
                            onClick={() => {
                              setProfileOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4 text-red-600" />
                            <div className="text-sm font-bold text-red-600">Logout</div>
                          </button>
                        ) : (
                          <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                            Login to enable profile controls.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
            </div>
        </div>
        
        {/* Mobile Stats Ticker */}
        <div className="md:hidden bg-slate-50 dark:bg-slate-700 border-t border-slate-100 dark:border-slate-600 py-2 px-4 flex space-x-6 overflow-x-auto no-scrollbar">
             <div className="flex items-center space-x-1 shrink-0">
                <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                <span className="text-xs font-bold text-slate-600 dark:text-dark-text">{stats.active} Active</span>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-xs font-bold text-red-600">{stats.critical} Critical</span>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-xs font-bold text-blue-600">Res OK</span>
            </div>
        </div>
    </header>

    {editOpen && currentUser && (
      <ModalShell
        title="Edit Profile"
        subtitle="Frontend-only. No backend changes."
        onClose={() => setEditOpen(false)}
        footer={
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {role}{currentUser?.id ? ` · ${currentUser.id}` : ''}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateProfile({
                    name: draft.name.trim() || currentUser.name,
                    phone: draft.phone.trim(),
                    org: draft.org.trim(),
                  });
                  setEditOpen(false);
                }}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${ROLE_COLORS[role] || ROLE_COLORS.GUEST}`}>
              <UserRound className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black text-slate-900 dark:text-white truncate">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                This updates your local session display only.
              </div>
            </div>
          </div>

          <label className="block">
            <div className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">Display Name</div>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="e.g. Commander R. Singh"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <div className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">Phone (Optional)</div>
              <input
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="+91 ..."
              />
            </label>

            <label className="block">
              <div className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">Org Label (Optional)</div>
              <input
                value={draft.org}
                onChange={(e) => setDraft((d) => ({ ...d, org: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="e.g. NDMA Ops"
              />
            </label>
          </div>
        </div>
      </ModalShell>
    )}
    </>
  );
};

export default CommandRail;
