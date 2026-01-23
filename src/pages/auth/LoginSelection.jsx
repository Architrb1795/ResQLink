import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { Shield, HeartHandshake, MapPin } from 'lucide-react';

const RoleCard = ({ icon: Icon, title, subtitle, color, onClick }) => (
    <button 
        onClick={onClick}
        className="group relative flex flex-col items-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300 w-full md:w-80 text-center shadow-lg hover:shadow-blue-500/20"
    >
        <div className={`p-4 rounded-full bg-slate-900 border border-slate-700 mb-6 group-hover:scale-110 transition-transform duration-300 ${color}`}>
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 tracking-wide group-hover:text-blue-400 transition-colors">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-[240px]">{subtitle}</p>
        
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
);

const LoginSelection = () => {
    const navigate = useNavigate();
    const { currentUser } = useAppState();

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

            <div className="relative z-10 flex flex-col items-center space-y-12">
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                         <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">ResQLink <span className="text-blue-500">Mission Control</span></h1>
                    </div>
                    <p className="text-slate-400 text-lg max-w-2xl font-light">
                        Select your operational role to enter the secure command environment.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    <RoleCard 
                        icon={Shield}
                        title="Agency Command"
                        subtitle="Coordinate response, manage resources, and control operations."
                        color="text-blue-400 shadow-blue-500/50"
                        onClick={() => navigate('/login/agency')}
                    />
                    <RoleCard 
                        icon={HeartHandshake}
                        title="Volunteer Unit"
                        subtitle="Assist on ground, deliver logistics, and update mission status."
                        color="text-green-400 shadow-green-500/50"
                        onClick={() => navigate('/login/volunteer')}
                    />
                    <RoleCard 
                        icon={MapPin}
                        title="Civilian Access"
                        subtitle="Report emergencies, request immediate aid, and track status."
                        color="text-amber-400 shadow-amber-500/50"
                        onClick={() => navigate('/login/civilian')}
                    />
                </div>

                <div className="text-xs text-slate-600 font-mono pt-8">
                    V2.4.0 // SYSTEM OPERATIONAL // SECURE CONNECTION
                </div>
            </div>
        </div>
    );
};

export default LoginSelection;
