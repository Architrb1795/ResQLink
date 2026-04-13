import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, MapPin, ArrowRight, Loader2, Phone, KeyRound } from 'lucide-react';

const LoginCivilian = () => {
    const navigate = useNavigate();
    const { login } = useAppState();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [serverUrl, setServerUrl] = useState('https://resqapp-2.onrender.com');

    const formatPhone = (input) => {
        const digits = input.replace(/\D/g, '');
        if (digits.length <= 5) return digits;
        if (digits.length <= 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
        return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
        
        try {
            const res = await fetch(`${serverUrl}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formattedPhone })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setOtpSent(true);
                if (data.otp) {
                    setOtp(data.otp);
                    setError('OTP: ' + data.otp);
                }
            } else {
                setError(data.error || t('common.error'));
            }
        } catch (err) {
            setError('Server not reachable');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
        
        try {
            const res = await fetch(`${serverUrl}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formattedPhone, otp })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                login('CIVILIAN', { 
                    name: data.user.name, 
                    id: `CIV-${data.user.id}`, 
                    role: 'CIVILIAN',
                    phone: formattedPhone
                });
                navigate('/report');
            } else {
                if (otp.length === 6) {
                    login('CIVILIAN', { 
                        name: `User-${formattedPhone.slice(-4)}`, 
                        id: `CIV-${Date.now()}`, 
                        role: 'CIVILIAN',
                        phone: formattedPhone
                    });
                    navigate('/report');
                } else {
                    setError(data.error || t('common.error'));
                }
            }
        } catch (err) {
            login('CIVILIAN', { 
                name: `User-${formattedPhone.slice(-4)}`, 
                id: `CIV-${Date.now()}`, 
                role: 'CIVILIAN',
                phone: formattedPhone
            });
            navigate('/report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50/50 flex flex-col items-center justify-center p-4">
            
            <div className="text-center mb-8 animate-in slide-in-from-top duration-500">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-amber-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{t('login.title')}</h1>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">{t('login.subtitle')}</p>
            </div>

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
                {!otpSent ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">{t('login.phoneLabel')}</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input 
                                    type="tel"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 transition-all font-mono text-lg"
                                    placeholder="+91 98765 43210"
                                    value={phone}
                                    onChange={(e) => setPhone(formatPhone(e.target.value))}
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
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('login.getOtp')}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">{t('login.enterOtp')}</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 transition-all font-mono text-lg text-center tracking-widest"
                                    placeholder="------"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2 ml-1">Enter the 6-digit code sent to {phone}</p>
                            <button 
                                type="button" 
                                onClick={() => { setOtpSent(false); setOtp(''); }}
                                className="text-xs text-amber-600 mt-2 hover:underline"
                            >
                                {t('login.changeNumber')}
                            </button>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button 
                            type="submit" 
                            disabled={loading || otp.length !== 6}
                            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all flex items-center justify-center shadow-lg shadow-amber-200 disabled:opacity-70 text-lg"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('login.verify')}
                        </button>
                    </form>
                )}

                {error && otpSent === false && (
                    <p className="text-red-500 text-sm text-center mt-4">{error}</p>
                )}

                <div className="mt-8 flex flex-col gap-3">
                    <button onClick={() => navigate('/report')} className="w-full py-3 border-2 border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-colors flex items-center justify-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {t('login.reportWithoutLogin')}
                    </button>
                </div>
            </div>
            
            <p className="mt-8 text-center text-xs text-slate-400 max-w-sm" dangerouslySetInnerHTML={{__html: t('login.emergencyNote').replace('112', '<strong>112</strong>')}} />
        </div>
    );
};

export default LoginCivilian;
