import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ShieldCheck, MapPin, ArrowRight, Loader2, Phone } from 'lucide-react';

const LoginCivilian = () => {
    const navigate = useNavigate();
    const { login } = useAppState();
    const [loading, setLoading] = useState(false);
    
    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate OTP process
        setTimeout(() => {
            login('CIVILIAN', { name: 'Civilian User', id: 'CIV-999', role: 'CIVILIAN' });
            setLoading(false);
            navigate('/report'); // Redirect directly to reporting for civilians
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-amber-50/50 flex flex-col items-center justify-center p-4">
            
            <div className="text-center mb-8 animate-in slide-in-from-top duration-500">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-amber-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">ResQLink Public Access</h1>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">We are here to help. Sign in to report incidents or track status.</p>
            </div>

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                            <input 
                                type="tel"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 transition-all font-mono text-lg"
                                placeholder="98765 43210"
                                required
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2 ml-1">We will send a one-time verification code.</p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all flex items-center justify-center shadow-lg shadow-amber-200 disabled:opacity-70 text-lg"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get OTP Code'}
                    </button>
                </form>

                <div className="mt-8 flex flex-col gap-3">
                    <button onClick={() => navigate('/report')} className="w-full py-3 border-2 border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-colors flex items-center justify-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Report Without Signing In
                    </button>
                </div>
            </div>
            
            <p className="mt-8 text-center text-xs text-slate-400 max-w-sm">
                In a life-threatening emergency, always call <strong>112</strong> or your local emergency number first.
            </p>
        </div>
    );
};

export default LoginCivilian;
