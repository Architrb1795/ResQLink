import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { HeartHandshake, Truck, MapPin, ArrowRight, Loader2 } from 'lucide-react';

const LoginVolunteer = () => {
    const navigate = useNavigate();
    const { login } = useAppState();
    const [loading, setLoading] = useState(false);
    
    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            login('VOLUNTEER', { name: 'Vol. Rahul Verma', id: 'VOL-404', role: 'VOLUNTEER' });
            setLoading(false);
            navigate('/dashboard');
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                
                {/* Visual Context Panel (Left) */}
                <div className="hidden md:flex md:w-5/12 bg-emerald-600 p-8 flex-col justify-between text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-6 backdrop-blur-sm">
                            <HeartHandshake className="w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Join the Response</h2>
                        <p className="text-emerald-100 opacity-90">Your help makes a difference. Connect now to see nearby relief tasks.</p>
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                            <MapPin className="w-5 h-5 text-emerald-200" />
                            <div className="text-sm">
                                <div className="font-bold">Live Map</div>
                                <div className="text-xs text-emerald-200">See incidents near you</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                            <Truck className="w-5 h-5 text-emerald-200" />
                            <div className="text-sm">
                                <div className="font-bold">Logistics</div>
                                <div className="text-xs text-emerald-200">Help deliver supplies</div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-900/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                </div>

                {/* Login Form (Right) */}
                <div className="flex-1 p-8 md:p-12">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-slate-800">Volunteer Sign In</h3>
                        <p className="text-slate-500">Enter your registered details to assist.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / ID</label>
                            <input 
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
                                placeholder="e.g. Rahul Verma"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                            <input 
                                type="tel"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
                                placeholder="+91 98765 43210"
                                required
                            />
                        </div>
                        
                        <div className="border-t border-slate-100 pt-2"></div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center shadow-lg shadow-emerald-200 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Join Active Response <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-400">
                        Not registered? <a href="#" className="text-emerald-600 font-bold hover:underline">Sign up as a volunteer</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginVolunteer;
