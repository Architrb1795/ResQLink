import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { Shield, HeartHandshake, MapPin, Sun, Moon } from 'lucide-react';
import ChatBot from '../../components/chatbot/ChatBot';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const RoleCard = ({ icon: Icon, title, subtitle, color, onClick }) => (
    <button 
        onClick={onClick}
        className="group relative flex flex-col items-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300 w-full md:w-80 text-center shadow-lg hover:shadow-blue-500/20 overflow-hidden"
    >
        <div className={`p-4 rounded-full bg-slate-900 border border-slate-700 mb-6 group-hover:scale-110 transition-transform duration-300 ${color}`}>
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 tracking-wide group-hover:text-blue-400 transition-colors">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-[240px]">{subtitle}</p>

        <div className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-slate-700 bg-slate-900/60 text-slate-300 group-hover:border-blue-500/40 group-hover:text-blue-300 transition-colors">
            Enter Console
            <span className="opacity-60 group-hover:opacity-100 transition-opacity">→</span>
        </div>
        
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
);

const LoginSelection = () => {
    const navigate = useNavigate();
    const { currentUser } = useAppState();
    const { t } = useLanguage();
    const [isDark, setIsDark] = React.useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    React.useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    useEffect(() => {
        if (currentUser) {
            if (currentUser.role === 'CIVILIAN') {
                 navigate('/report');
            } else {
                 navigate('/dashboard');
            }
        }
    }, [currentUser, navigate]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-full h-96 bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2" />
            <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:18px_18px]" />

            <div className="relative z-10 flex flex-col items-center space-y-12">
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                         <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">ResQLink <span className="text-blue-500">{t('app.missionControl')}</span></h1>
                    </div>
                    <p className="text-slate-400 text-lg max-w-2xl font-light">
                        {t('login.selectRole')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <button
                            onClick={() => navigate('/report')}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-900/30 transition-colors"
                        >
                            Report Incident (No Login)
                        </button>
                        <button
                            onClick={() => navigate('/login/civilian')}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-100 font-black border border-slate-700 transition-colors"
                        >
                            Sign In With OTP
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    <RoleCard 
                        icon={Shield}
                        title={t('roles.agency.title')}
                        subtitle={t('roles.agency.subtitle')}
                        color="text-blue-400 shadow-blue-500/50"
                        onClick={() => navigate('/login/agency')}
                    />
                    <RoleCard 
                        icon={HeartHandshake}
                        title={t('roles.volunteer.title')}
                        subtitle={t('roles.volunteer.subtitle')}
                        color="text-green-400 shadow-green-500/50"
                        onClick={() => navigate('/login/volunteer')}
                    />
                    <RoleCard 
                        icon={MapPin}
                        title={t('roles.civilian.title')}
                        subtitle={t('roles.civilian.subtitle')}
                        color="text-amber-400 shadow-amber-500/50"
                        onClick={() => navigate('/login/civilian')}
                    />
                </div>

                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: 'Live Maps', desc: 'Track incidents, units, and global vectors in one tactical view.' },
                        { title: 'Faster Triage', desc: 'Priority feed and quick actions help teams respond in minutes.' },
                        { title: 'AI Guidance', desc: 'Emergency coach provides structured, calm steps under stress.' },
                    ].map((f) => (
                        <div key={f.title} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
                            <div className="text-xs font-black uppercase tracking-widest text-blue-300">{f.title}</div>
                            <div className="text-sm text-slate-400 leading-relaxed mt-2">{f.desc}</div>
                        </div>
                    ))}
                </div>

                <div className="text-xs text-slate-600 font-mono pt-8">
                    {t('login.footer')}
                </div>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                <button 
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 rounded-full hover:bg-slate-800 transition-colors"
                >
                    {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-400" />}
                </button>
                <LanguageSwitcher />
            </div>
            {/* ChatBot available on login page for emergency access */}
            <ChatBot />
        </div>
    );
};

export default LoginSelection;
