import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Eye, EyeOff, Loader2, ShieldCheck, RefreshCw, Lock } from 'lucide-react';
import api from '../utils/axios';
import forgotIllustration from '../assets/forgot_password.png';
import Logo from '../components/Logo';
const maskEmail = (email) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const visible = local.slice(0, 3);
    const masked = '*'.repeat(Math.max(local.length - 3, 3));
    return `${visible}${masked}@${domain}`;
};
const OTPInput = ({ value, onChange, disabled, idPrefix = 'fp-otp' }) => {
    const [inputs, setInputs] = useState(Array(6).fill(''));
    useEffect(() => {
        const syncInputs = async () => {
            const filled = value.split('').slice(0, 6);
            setInputs([...filled, ...Array(6 - filled.length).fill('')]);
        };
        syncInputs();
    }, [value]);
    const handleInput = (e, idx) => {
        const val = e.target.value.replace(/\D/g, '').slice(-1);
        const next = [...inputs];
        next[idx] = val;
        setInputs(next);
        onChange(next.join(''));
        if (val && idx < 5) document.getElementById(`${idPrefix}-${idx + 1}`)?.focus();
    };
    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !inputs[idx] && idx > 0)
            document.getElementById(`${idPrefix}-${idx - 1}`)?.focus();
    };
    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const arr = [...pasted.split(''), ...Array(6 - pasted.length).fill('')];
        setInputs(arr);
        onChange(pasted);
        document.getElementById(`${idPrefix}-${Math.min(pasted.length, 5)}`)?.focus();
    };
    return (
        <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
            {inputs.map((digit, idx) => (
                <input
                    key={idx}
                    id={`${idPrefix}-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    onChange={(e) => handleInput(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`w-11 text-center text-xl font-bold rounded-2xl border-2 bg-slate-50 transition-all focus:outline-none
                        ${digit ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 focus:border-blue-400 text-slate-900'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    style={{ height: '3.25rem' }}
                />
            ))}
        </div>
    );
};
const StrengthBar = ({ password }) => {
    if (!password) return null;
    const strength =
        password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4
            : password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3
                : password.length >= 8 ? 2 : 1;
    const colors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
    return (
        <div className="flex gap-1.5 px-1">
            {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? colors[strength] : 'bg-slate-200'}`} />
            ))}
        </div>
    );
};
const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('method');
    const [selectedMethod] = useState('email');
    const [email, setEmail] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(0);
    useEffect(() => {
        if (timer <= 0) return;
        const t = setInterval(() => setTimer(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [timer]);
    const clearMessages = useCallback(() => { setError(''); setSuccess(''); }, []);
    const handleSendOTP = async () => {
        if (!emailInput.trim()) { setError('Please enter your email address.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) { setError('Please enter a valid email address.'); return; }
        setLoading(true); clearMessages();
        try {
            await api.post('/auth/forgot-password', { email: emailInput.trim() });
            setEmail(emailInput.trim());
            setStep('otp');
            setTimer(60);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
        }
        setLoading(false);
    };
    const handleVerifyOTP = async () => {
        if (otp.length !== 6) { setError('Please enter the complete 6-digit code.'); return; }
        setLoading(true); clearMessages();
        try {
            await api.post('/auth/check-reset-otp', { email, otp });
            setStep('reset');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP code.');
        }
        setLoading(false);
    };
    const handleResend = async () => {
        if (timer > 0) return;
        setLoading(true); clearMessages();
        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess('A new code has been sent!');
            setOtp('');
            setTimer(60);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code.');
        }
        setLoading(false);
    };
    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true); clearMessages();
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            setStep('done');
        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed. Please try again.');
            if (err.response?.status === 400) { setStep('otp'); setOtp(''); }
        }
        setLoading(false);
    };
    const handleBack = () => {
        clearMessages();
        if (step === 'method') navigate('/login');
        else if (step === 'otp') setStep('method');
        else if (step === 'reset') setStep('otp');
        else navigate('/login');
    };
    const stepMeta = {
        method: 'Forgot Password',
        otp: 'Verification',
        reset: 'New Password',
        done: 'All Done!',
    };
    const renderMethod = (isMobile) => (
        <div className="flex flex-col">
            {isMobile && (
                <div className="flex justify-center mt-2 mb-6">
                    <img src={forgotIllustration} alt="Forgot password" className="w-[210px] h-[210px] object-contain" />
                </div>
            )}
            <p className="text-slate-500 text-[14px] mb-6">
                Select which contact details we should use to reset your password
            </p>
            <div
                id="fp-email-option"
                onClick={() => { }}
                className="flex items-center p-4 rounded-2xl border-2 border-blue-600 bg-white shadow-[0_0_0_4px_rgba(37,99,235,0.08)] mb-4 cursor-default"
            >
                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-4">
                    <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">via Email</p>
                    <p className="text-[15px] font-semibold text-slate-800 truncate">
                        {emailInput ? maskEmail(emailInput) : 'Enter your email below'}
                    </p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center flex-shrink-0 ml-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                </div>
            </div>
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                    id="fp-email-input"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    placeholder="Enter your email address"
                    className="w-full pl-11 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                    autoComplete="email"
                />
            </div>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-[13px] rounded-xl border border-red-100">{error}</div>}
            <button
                id="fp-continue-btn"
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-[15px] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : 'Continue'}
            </button>
        </div>
    );
    const renderOTP = (isMobile) => (
        <div>
            {isMobile && (
                <div className="flex justify-center mt-2 mb-6">
                    <div className="w-[120px] h-[120px] bg-blue-50 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-14 h-14 text-blue-600" />
                    </div>
                </div>
            )}
            <p className="text-slate-500 text-[14px] mb-1">We sent a 6-digit code to</p>
            <p className="text-slate-800 font-semibold text-[15px] mb-7">{maskEmail(email)}</p>
            {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-[13px] rounded-xl border border-green-100 text-center">{success}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-[13px] rounded-xl border border-red-100">{error}</div>}
            <div className="mb-7">
                <OTPInput value={otp} onChange={setOtp} disabled={loading} idPrefix={isMobile ? 'fp-otp-mobile' : 'fp-otp-desktop'} />
            </div>
            <button
                id="fp-verify-btn"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length < 6}
                className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white font-semibold text-[15px] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 mb-5"
            >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : <><ShieldCheck className="w-5 h-5" /> Verify Code</>}
            </button>
            <div className="flex justify-between items-center text-[13px] font-semibold px-1">
                <button
                    id="fp-resend-btn"
                    onClick={handleResend}
                    disabled={timer > 0 || loading}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                </button>
                <button onClick={() => { setStep('method'); setOtp(''); clearMessages(); }}
                    className="text-slate-400 hover:text-slate-600 transition-colors">
                    Change email
                </button>
            </div>
        </div>
    );
    const renderReset = (isMobile) => (
        <div>
            {isMobile && (
                <div className="flex justify-center mt-2 mb-6">
                    <div className="w-[120px] h-[120px] bg-blue-50 rounded-full flex items-center justify-center">
                        <Lock className="w-14 h-14 text-blue-600" />
                    </div>
                </div>
            )}
            <p className="text-slate-500 text-[14px] mb-6">Create a new strong password for your account</p>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-[13px] rounded-xl border border-red-100">{error}</div>}
            <div className="space-y-3 mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        id="fp-new-password"
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min. 8 chars)"
                        className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                        autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        id="fp-confirm-password"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                        placeholder="Confirm new password"
                        className={`w-full pl-11 pr-11 py-3.5 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white text-[15px] font-medium transition-all
                            ${confirmPassword && newPassword !== confirmPassword
                                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                                : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'}`}
                        autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <StrengthBar password={newPassword} />
            </div>
            <button
                id="fp-reset-btn"
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-[15px] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Resetting...</> : 'Reset Password'}
            </button>
        </div>
    );
    const renderDone = () => (
        <div className="flex flex-col items-center text-center pt-4">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <ShieldCheck className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Password Reset!</h2>
            <p className="text-slate-500 text-[15px] mb-8 max-w-[260px] leading-relaxed">
                Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <button
                id="fp-done-btn"
                onClick={() => navigate('/login')}
                className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-[15px] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-all"
            >
                Back to Sign In
            </button>
        </div>
    );
    const renderContent = (isMobile) => {
        if (step === 'method') return renderMethod(isMobile);
        if (step === 'otp') return renderOTP(isMobile);
        if (step === 'reset') return renderReset(isMobile);
        return renderDone();
    };
    const stepIcon = {
        method: <Mail className="w-7 h-7 text-blue-600" />,
        otp: <ShieldCheck className="w-7 h-7 text-blue-600" />,
        reset: <Lock className="w-7 h-7 text-blue-600" />,
        done: <ShieldCheck className="w-7 h-7 text-green-600" />,
    };
    const stepIconBg = step === 'done' ? 'bg-green-50' : 'bg-blue-50';
    return (
        <>
            <div className="md:hidden w-full min-h-[100dvh] bg-white flex flex-col font-sans">
                <div className="flex items-center px-5 pt-6 pb-2 flex-shrink-0">
                    <button id="fp-back-btn-mobile" onClick={handleBack}
                        className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors text-slate-800">
                        <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
                    </button>
                    <h1 className="text-[20px] font-bold text-slate-900 ml-2">{stepMeta[step]}</h1>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-10 pt-2">
                    {renderContent(true)}
                </div>
            </div>
            <div className="hidden md:flex min-h-screen overflow-hidden">
                <div
                    className="hidden lg:flex w-[48%] xl:w-[52%] flex-col relative overflow-hidden"
                    style={{ background: 'linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 45%, #4f46e5 100%)' }}
                >
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-[0.12]"
                        style={{ background: 'radial-gradient(circle, white, transparent)' }} />
                    <div className="absolute -bottom-32 -right-16 w-[500px] h-[500px] rounded-full opacity-[0.08]"
                        style={{ background: 'radial-gradient(circle, white, transparent)' }} />
                    <div className="relative z-10 pt-10 pl-12">
                        <Logo iconSize="w-9 h-9" textClassName="text-2xl text-white" />
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-12 pb-16">
                        <div className="w-full max-w-[380px] xl:max-w-[420px] mb-10">
                            <img
                                src={forgotIllustration}
                                alt="Account security"
                                className="w-full object-contain"
                                style={{ mixBlendMode: 'multiply', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))' }}
                            />
                        </div>
                        <h2 className="text-3xl xl:text-4xl font-extrabold text-white text-center leading-tight mb-4">
                            Account Recovery
                        </h2>
                        <p className="text-blue-200 text-center text-[15px] leading-relaxed max-w-[300px]">
                            Don't worry — it happens to everyone. We'll get you back in a few quick steps.
                        </p>
                        <div className="flex gap-3 mt-8 flex-wrap justify-center">
                            {[{ icon: '🔐', label: 'OTP Verified' }, { icon: '⚡', label: 'Quick Reset' }, { icon: '🛡️', label: 'Secure' }]
                                .map(({ icon, label }) => (
                                    <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                                        <span className="text-[15px]">{icon}</span>
                                        <span className="text-white text-[13px] font-semibold">{label}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                <div className="flex-1 bg-white flex flex-col">
                    <div className="flex justify-end px-10 pt-8">
                        <p className="text-[13px] text-slate-400 font-medium">
                            Remember it?{' '}
                            <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Sign in</Link>
                        </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-8 xl:px-16 pb-10">
                        <div className="w-full max-w-[420px]">
                            <div className="flex items-center justify-between mb-8">
                                <button
                                    id="fp-back-btn-desktop"
                                    onClick={handleBack}
                                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors group"
                                >
                                    <div className="w-9 h-9 rounded-full border-2 border-slate-200 group-hover:border-slate-300 flex items-center justify-center transition-colors">
                                        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[13px] font-semibold">Back</span>
                                </button>
                                <div className="flex items-center gap-1.5">
                                    {['method', 'otp', 'reset', 'done'].map((s) => {
                                        const steps = ['method', 'otp', 'reset', 'done'];
                                        const isPast = steps.indexOf(s) < steps.indexOf(step);
                                        const isCurrent = s === step;
                                        return (
                                            <div key={s} className={`rounded-full transition-all duration-500
                                                ${isCurrent ? 'w-6 h-2 bg-blue-600' : isPast ? 'w-2 h-2 bg-blue-300' : 'w-2 h-2 bg-slate-200'}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="mb-6">
                                <div className={`w-14 h-14 rounded-2xl ${stepIconBg} flex items-center justify-center mb-5`}>
                                    {stepIcon[step]}
                                </div>
                                <h2 className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
                                    {stepMeta[step]}
                                </h2>
                            </div>
                            {renderContent(false)}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default ForgotPassword;
