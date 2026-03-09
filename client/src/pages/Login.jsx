import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft, Mail, Lock, AlertCircle, Eye, EyeOff,
    Loader2, KeyRound, ShieldCheck, RefreshCw
} from 'lucide-react';
import Logo from '../components/Logo';
import letInImg from '../assets/let_in.png';
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);
const ErrorBanner = ({ error }) => error ? (
    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        {error}
    </div>
) : null;
const SuccessBanner = ({ success }) => success ? (
    <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100">
        {success}
    </div>
) : null;
const loadGoogleGSI = () => {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve(window.google.accounts.id);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google?.accounts?.id);
        script.onerror = reject;
        document.head.appendChild(script);
    });
};
const OTPInput = ({ value, onChange, disabled, idPrefix = 'otp' }) => {
    const inputs = value.split('').slice(0, 6);
    const paddedInputs = [...inputs, ...Array(6 - inputs.length).fill('')];
    const handleInput = (e, idx) => {
        const val = e.target.value.replace(/\D/g, '').slice(-1);
        const next = [...paddedInputs];
        next[idx] = val;
        onChange(next.join(''));
        if (val && idx < 5) {
            document.getElementById(`${idPrefix}-${idx + 1}`)?.focus();
        }
    };
    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !paddedInputs[idx] && idx > 0) {
            document.getElementById(`${idPrefix}-${idx - 1}`)?.focus();
        }
    };
    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        onChange(pasted);
        document.getElementById(`${idPrefix}-${Math.min(pasted.length, 5)}`)?.focus();
    };
    return (
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {paddedInputs.map((digit, idx) => (
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
                    className={`w-12 h-14 text-center text-xl font-bold rounded-2xl border-2 bg-slate-50 text-slate-900 transition-all focus:outline-none
                        ${digit
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 focus:border-blue-400'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                />
            ))}
        </div>
    );
};
const Login = () => {
    const [view, setView] = useState('social');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpEmail, setOtpEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [isRegistrationFlow, setIsRegistrationFlow] = useState(false);
    const { login, loginWithGoogle, sendOTP, verifyOTP, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const initView = async () => {
            if (location.state && location.state.view) {
                setView(location.state.view);
                if (location.state.email) {
                    setOtpEmail(location.state.email);
                }
                if (location.state.fromRegister) {
                    setSuccess(`Verification code sent to ${location.state.email}`);
                    setOtpTimer(60);
                    setIsRegistrationFlow(true);
                    window.history.replaceState({}, document.title)
                }
            }
        };
        initView();
    }, [location.state]);
    useEffect(() => {
        if (user) {
            if (user.needsRole) {
                navigate('/select-role', { replace: true });
            } else if (user.pendingApproval) {
                navigate('/pending-approval', { replace: true });
            } else {
                navigate('/app', { replace: true });
            }
        }
    }, [user, navigate]);
    useEffect(() => {
        if (otpTimer <= 0) return;
        const t = setInterval(() => setOtpTimer(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [otpTimer]);
    const afterAuth = (userData, isRegistration) => {
        if (userData.needsRole) {
            navigate('/select-role', { state: { isRegistration }, replace: true });
        } else if (userData.pendingApproval) {
            navigate('/pending-approval', { replace: true });
        } else if (isRegistration && !userData.profileCompleted) {
            navigate('/profile-setup', { replace: true });
        } else {
            navigate('/app', { replace: true });
        }
    };
    if (user) return null;
    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const result = await login(email, password);
        setIsLoading(false);
        if (result.success) {
            afterAuth(result.user, false);
        } else {
            setError(result.message);
        }
    };
    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            const gsi = await loadGoogleGSI();
            const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
            if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
                setError('Google login is not configured yet. Please use Email OTP or password login.');
                setGoogleLoading(false);
                return;
            }
            gsi.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response) => {
                    if (response.credential) {
                        const result = await loginWithGoogle(response.credential);
                        if (result.success) {
                            afterAuth(result.user, result.isNewUser);
                        } else {
                            setError(result.message);
                        }
                    } else {
                        setError('Google sign-in was cancelled.');
                    }
                    setGoogleLoading(false);
                },
                auto_select: false,
                cancel_on_tap_outside: true,
                ux_mode: 'popup'
            });
            gsi.prompt();
        } catch (err) {
            setError('Google sign-in is not available. Use Email OTP instead.');
            setGoogleLoading(false);
        }
    };
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        const result = await sendOTP(otpEmail);
        setIsLoading(false);
        if (result.success) {
            setView('otp-verify');
            setSuccess(`OTP sent to ${otpEmail}`);
            setOtpTimer(60);
            if (result.isNewUser) setIsRegistrationFlow(true);
        } else {
            setError(result.message);
        }
    };
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter all 6 digits of the OTP');
            return;
        }
        setIsLoading(true);
        setError('');
        const result = await verifyOTP(otpEmail, otp);
        setIsLoading(false);
        if (result.success) {
            afterAuth(result.user, isRegistrationFlow);
        } else {
            setError(result.message);
            setOtp('');
        }
    };
    const handleResend = async () => {
        if (otpTimer > 0) return;
        setIsLoading(true);
        setError('');
        const result = await sendOTP(otpEmail);
        setIsLoading(false);
        if (result.success) {
            setSuccess('New OTP sent!');
            setOtp('');
            setOtpTimer(60);
        } else {
            setError(result.message);
        }
    };
    return (
        <>

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
                                src={letInImg}
                                alt="Welcome back"
                                className="w-full object-contain"
                                style={{ mixBlendMode: 'multiply', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))' }}
                            />
                        </div>
                        <h2 className="text-3xl xl:text-4xl font-extrabold text-white text-center leading-tight mb-4">
                            Welcome Back!
                        </h2>
                        <p className="text-blue-200 text-center text-[15px] leading-relaxed max-w-[300px]">
                            Sign in to discover your next career move and connect with top opportunities.
                        </p>
                        <div className="flex gap-3 mt-8 flex-wrap justify-center">
                            {[{ icon: '🚀', label: 'Top Jobs' }, { icon: '🔐', label: 'Secure' }, { icon: '⚡', label: 'Fast Apply' }]
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
                            No account?{' '}
                            <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Sign up</Link>
                        </p>
                    </div>

                    <div className="flex-1 flex items-center justify-center px-8 xl:px-16 pb-10">
                        <div className="w-full max-w-[420px]">

                            {view !== 'social' && (
                                <button
                                    onClick={() => {
                                        if (view === 'password' || view === 'otp-email') setView('social');
                                        else if (view === 'otp-verify') setView('otp-email');
                                        setError(''); setSuccess('');
                                    }}
                                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors group mb-8"
                                >
                                    <div className="w-9 h-9 rounded-full border-2 border-slate-200 group-hover:border-slate-300 flex items-center justify-center transition-colors">
                                        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[13px] font-semibold">Back</span>
                                </button>
                            )}

                            <div className="mb-6 flex flex-col items-center text-center">
                                {view === 'social' && (
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                                        <KeyRound className="w-7 h-7 text-blue-600" />
                                    </div>
                                )}
                                {view === 'password' && (
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                                        <Lock className="w-7 h-7 text-blue-600" />
                                    </div>
                                )}
                                {(view === 'otp-email') && (
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                                        <Mail className="w-7 h-7 text-blue-600" />
                                    </div>
                                )}
                                {view === 'otp-verify' && (
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                                        <ShieldCheck className="w-7 h-7 text-blue-600" />
                                    </div>
                                )}
                                <h2 className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
                                    {view === 'otp-verify' ? 'Enter Your OTP' : view === 'otp-email' ? 'Sign in with OTP' : view === 'password' ? 'Sign in' : 'Welcome back'}
                                </h2>
                                {view === 'otp-verify' ? (
                                    <p className="text-slate-500 text-[14px] mt-1">Code sent to <span className="font-semibold text-slate-700">{otpEmail}</span></p>
                                ) : view === 'social' ? (
                                    <p className="text-slate-500 text-[14px] mt-2 mb-2">Please choose a sign in method to continue</p>
                                ) : view === 'password' ? (
                                    <p className="text-slate-500 text-[14px] mt-2 mb-2">Enter your email and password to sign in</p>
                                ) : view === 'otp-email' && (
                                    <p className="text-slate-500 text-[14px] mt-2 mb-2">We'll send a secure 6-digit code to your inbox</p>
                                )}
                            </div>

                            {view === 'social' && (
                                <div className="space-y-4">
                                    <ErrorBanner error={error} />
                                    <button
                                        onClick={handleGoogleLogin}
                                        disabled={googleLoading}
                                        className="w-full inline-flex justify-center items-center gap-3 py-4 px-4 rounded-full border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all text-slate-700 font-semibold shadow-sm text-[15px] disabled:opacity-60"
                                    >
                                        {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
                                        {googleLoading ? 'Connecting...' : 'Continue with Google'}
                                    </button>
                                    <div className="flex items-center w-full py-2">
                                        <div className="flex-1 h-px bg-slate-200" />
                                        <span className="px-4 text-slate-400 font-bold text-[11px] uppercase tracking-widest">or</span>
                                        <div className="flex-1 h-px bg-slate-200" />
                                    </div>
                                    <button
                                        onClick={() => { setView('otp-email'); setError(''); }}
                                        className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-[15px] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2"
                                    >
                                        <KeyRound className="w-5 h-5" />
                                        Sign in with Email OTP
                                    </button>
                                    <div className="text-center pt-2">
                                        <button
                                            onClick={() => { setView('password'); setError(''); }}
                                            className="text-[14px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            Use password instead →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {view === 'password' && (
                                <form className="space-y-4" onSubmit={handlePasswordLogin}>
                                    <ErrorBanner error={error} />
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="email" required value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <button type="submit" disabled={isLoading}
                                        className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-[15px] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : 'Sign in'}
                                    </button>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <button type="button" onClick={() => { setView('otp-email'); setOtpEmail(email); setError(''); }}
                                            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                            Use OTP instead
                                        </button>
                                        <Link to="/forgot-password" className="font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </form>
                            )}

                            {view === 'otp-email' && (
                                <form className="space-y-4" onSubmit={handleSendOTP}>
                                    <ErrorBanner error={error} />
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="email" required value={otpEmail}
                                            onChange={(e) => setOtpEmail(e.target.value)}
                                            className="w-full pl-11 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <button type="submit" disabled={isLoading}
                                        className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-[15px] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : 'Send Code'}
                                    </button>
                                </form>
                            )}

                            {view === 'otp-verify' && (
                                <form className="space-y-6" onSubmit={handleVerifyOTP}>
                                    <SuccessBanner success={success} />
                                    <ErrorBanner error={error} />
                                    <OTPInput value={otp} onChange={setOtp} disabled={isLoading} idPrefix="otp-desktop" />
                                    <button type="submit" disabled={isLoading || otp.length < 6}
                                        className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-[15px] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : <><ShieldCheck className="w-5 h-5" /> Verify & Sign In</>}
                                    </button>
                                    <div className="flex justify-between items-center text-[13.5px] font-semibold px-1">
                                        <button type="button" onClick={handleResend} disabled={otpTimer > 0}
                                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors">
                                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                            {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                                        </button>
                                        <button type="button" onClick={() => { setView('otp-email'); setOtp(''); setError(''); setSuccess(''); }}
                                            className="text-slate-500 hover:text-slate-700 transition-colors">
                                            Change email
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:hidden w-full min-h-[100dvh] bg-white flex flex-col font-sans relative overflow-hidden">

                <div className="pt-6 pb-0 px-6 flex items-center">
                    <button
                        onClick={() => {
                            if (view === 'password' || view === 'otp-email') setView('social');
                            else if (view === 'otp-verify') setView('otp-email');
                            else navigate(-1);
                            setError('');
                            setSuccess('');
                        }}
                        className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors text-slate-800"
                    >
                        <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
                    </button>
                </div>

                {view === 'social' && (
                    <div className="flex-1 flex flex-col items-center px-6 animate-in slide-in-from-left-4 fade-in duration-300">
                        <div className="w-56 h-56 mt-2 mb-8 relative flex items-center justify-center">
                            <img src={letInImg} alt="Let you in" className="w-[110%] h-[110%] object-contain scale-110" />
                        </div>
                        <h1 className="text-3xl leading-tight font-[700] text-slate-800 mb-8 tracking-tight relative z-10">Let's you in</h1>
                        {error && (
                            <div className="w-full mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}
                        <div className="w-full space-y-3">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={googleLoading}
                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-slate-700 font-semibold shadow-sm text-[15px] disabled:opacity-60"
                            >
                                {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
                                {googleLoading ? 'Connecting...' : 'Continue with Google'}
                            </button>
                            <button
                                onClick={() => { setView('otp-email'); setError(''); }}
                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-slate-700 font-semibold shadow-sm text-[15px]"
                            >
                                <KeyRound className="w-5 h-5 text-slate-500" />
                                Sign in with Email OTP
                            </button>
                        </div>
                        <div className="flex items-center w-full my-5">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="px-4 text-slate-400 font-medium text-sm">or</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>
                        <button
                            onClick={() => { setView('password'); setError(''); }}
                            className="w-full py-4 px-4 rounded-full bg-[#2F6FF7] hover:bg-blue-700 text-white font-semibold shadow-[0_8px_20px_-6px_rgba(47,111,247,0.4)] transition-all active:scale-95 text-[15px]"
                        >
                            Sign in with password
                        </button>
                        <div className="mt-6 mb-2 text-[13px] font-medium text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 font-semibold ml-1">Sign up</Link>
                        </div>
                    </div>
                )}

                {view === 'password' && (
                    <div className="flex-1 flex flex-col px-8 pb-8 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="flex-1 flex flex-col pt-8">
                            <div className="mb-4 w-16 h-16 rounded-full border-[4px] border-blue-500/20 flex items-center justify-center p-1.5 mx-auto">
                                <div className="w-full h-full rounded-full border-[3px] border-blue-500 flex flex-col items-center justify-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mb-1" />
                                    <div className="w-3.5 h-4 bg-blue-500 rounded-t-full rounded-b-sm" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center tracking-tight">Login to Account</h1>
                            <form className="w-full space-y-4" onSubmit={handlePasswordLogin}>
                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>
                                )}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 px-4 py-3 bg-slate-50 border border-transparent rounded-[16px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                                        placeholder="Email" />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input type={showPassword ? 'text' : 'password'} required value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-transparent rounded-[16px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                                        placeholder="Password" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <button type="submit" disabled={isLoading}
                                    className="w-full py-4 px-4 rounded-full bg-[#2F6FF7] hover:bg-blue-700 text-white font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 text-[15px] shadow-[0_8px_20px_-6px_rgba(47,111,247,0.4)] disabled:opacity-60">
                                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign in'}
                                </button>
                                <div className="text-right">
                                    <Link to="/forgot-password" className="text-[13px] font-semibold text-blue-600">
                                        Forgot password?
                                    </Link>
                                </div>
                            </form>
                            <div className="mt-4 text-center">
                                <button onClick={() => { setView('otp-email'); setOtpEmail(email); setError(''); }}
                                    className="text-[14px] font-semibold text-blue-600">
                                    Sign in with OTP instead
                                </button>
                            </div>
                        </div>
                        <div className="mt-auto text-[13px] font-medium text-slate-400 text-center">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 font-semibold ml-1">Sign up</Link>
                        </div>
                    </div>
                )}

                {view === 'otp-email' && (
                    <div className="flex-1 flex flex-col px-8 pb-8 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="flex-1 flex flex-col pt-8">
                            <div className="mb-4 w-16 h-16 rounded-full border-[4px] border-blue-500/20 flex items-center justify-center p-1.5 mx-auto">
                                <div className="w-full h-full rounded-full bg-blue-500/10 border-[3px] border-blue-500 flex items-center justify-center">
                                    <KeyRound className="w-7 h-7 text-blue-500" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center tracking-tight">Email OTP Login</h1>
                            <p className="text-sm text-slate-500 text-center mb-6">We'll send a one-time password to your email</p>
                            <form className="w-full space-y-4" onSubmit={handleSendOTP}>
                                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input type="email" required value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
                                        className="w-full pl-11 px-4 py-3 bg-slate-50 border border-transparent rounded-[16px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                                        placeholder="Your email address" />
                                </div>
                                <button type="submit" disabled={isLoading}
                                    className="w-full py-4 rounded-full bg-[#2F6FF7] hover:bg-blue-700 text-white font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 text-[15px] shadow-[0_8px_20px_-6px_rgba(47,111,247,0.4)] disabled:opacity-60">
                                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</> : 'Send OTP'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                { }
                {view === 'otp-verify' && (
                    <div className="flex-1 flex flex-col px-8 pb-8 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="flex-1 flex flex-col pt-8">
                            <div className="mb-4 w-16 h-16 rounded-full border-[4px] border-blue-500/20 flex items-center justify-center p-1.5 mx-auto">
                                <div className="w-full h-full rounded-full bg-blue-500/10 border-[3px] border-blue-500 flex items-center justify-center">
                                    <ShieldCheck className="w-7 h-7 text-blue-500" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center tracking-tight">Enter OTP</h1>
                            <p className="text-sm text-slate-500 text-center mb-6">
                                Sent to <span className="text-slate-700 font-medium">{otpEmail}</span>
                            </p>
                            {success && <div className="mb-3 p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100 text-center">{success}</div>}
                            <form className="w-full space-y-5" onSubmit={handleVerifyOTP}>
                                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}
                                <OTPInput value={otp} onChange={setOtp} disabled={isLoading} idPrefix="otp-mobile" />
                                <button type="submit" disabled={isLoading || otp.length < 6}
                                    className="w-full py-4 rounded-full bg-[#2F6FF7] hover:bg-blue-700 disabled:opacity-60 text-white font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 text-[15px] shadow-[0_8px_20px_-6px_rgba(47,111,247,0.4)]">
                                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <><ShieldCheck className="w-4 h-4" /> Verify & Sign In</>}
                                </button>
                                <div className="flex justify-between items-center text-sm mt-1">
                                    <button type="button" onClick={handleResend} disabled={otpTimer > 0}
                                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed font-medium transition-colors">
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                                    </button>
                                    <button type="button" onClick={() => { setView('otp-email'); setOtp(''); setError(''); setSuccess(''); }}
                                        className="text-slate-400 hover:text-slate-600 text-[13px]">
                                        Change email
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
export default Login;
