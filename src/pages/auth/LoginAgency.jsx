import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { Shield, Lock, Fingerprint, ArrowRight, Loader2 } from 'lucide-react';

const LoginAgency = () => {
    const navigate = useNavigate();
    const { login } = useAppState();
    const [loading, setLoading] = useState(false);
    
    // Mock fields
    const [formData, setFormData] = useState({
        agencyId: '',
        email: '',
        password: ''
    });

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            login('AGENCY', { name: 'Commander R. Singh', id: 'CMD-001', role: 'AGENCY' });
            setLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-center border-b-4 border-blue-600">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                        <Shield className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-wide">Agency Command</h2>
                    <p className="text-slate-400 text-sm mt-1">Authorized Personnel Only</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Agency ID</label>
                        <div className="relative">
                            <Fingerprint className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input 
                                type="text"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-mono text-sm"
                                placeholder="AGENCY-ID-000"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Official Email</label>
                        <input 
                            type="email"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                            placeholder="officer@agency.gov"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Secure Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input 
                                type="password"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <label className="flex items-center text-slate-600 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2" />
                            Remember Session
                        </label>
                        <a href="#" className="text-blue-600 font-bold hover:underline">Reset Credentials</a>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-all flex items-center justify-center shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Enter Mission Control <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </button>
                    
                    <div className="text-[10px] text-center text-slate-400">
                        This system is monitored. All actions are logged for audit purposes.
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginAgency;
