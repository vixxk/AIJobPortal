import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
    // We'll use a state to toggle between the "Let's you in" screen and the actual password login screen
    const [view, setView] = useState('social'); // 'social' | 'password'

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    if (user) {
        navigate('/app');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate network delay
        setTimeout(() => {
            const success = login(email, password);
            setIsLoading(false);

            if (success) {
                navigate('/app');
            } else {
                setError('Invalid credentials. Please use the demo account.');
            }
        }, 800);
    };

    const handleSocialClick = (e) => {
        e.preventDefault();
        // Do nothing, just visual feedback as requested
    };

    return (
        <>
            {/* --- DESKTOP VIEW --- */}
            <div className="hidden md:flex min-h-screen bg-slate-50 flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center mb-6">
                        <Logo iconSize="w-12 h-12" textClassName="text-3xl text-slate-900" />
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                        Log in to your account
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-slate-200/60">
                        {/* Demo Credentials Helper */}
                        <div className="mb-6 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Demo Access</p>
                                <p>Email: <span className="font-mono bg-white border border-blue-100 px-1.5 py-0.5 rounded text-blue-600">demo@user.com</span></p>
                                <p>Password: <span className="font-mono bg-white border border-blue-100 px-1.5 py-0.5 rounded text-blue-600">password123</span></p>
                            </div>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Email address</label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Password</label>
                                <div className="mt-1 relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button onClick={handleSocialClick} className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                                    <span className="sr-only">Sign in with Facebook</span>
                                    <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </button>
                                <button onClick={handleSocialClick} className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                                    <span className="sr-only">Sign in with Google</span>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                </button>
                                <button onClick={handleSocialClick} className="w-full col-span-2 inline-flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                                    <span className="sr-only">Sign in with Apple</span>
                                    <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24"><path d="M16.365 21.444c-1.066 1.487-2.189 2.972-3.805 3.006-1.576.035-2.112-.916-3.886-.916-1.776 0-2.383.882-3.887.95-1.573.072-2.844-1.554-3.918-3.08-2.193-3.125-3.886-8.818-1.636-12.673 1.112-1.905 3.097-3.111 5.212-3.146 1.543-.036 2.981 1.01 3.886 1.01.905 0 2.656-1.259 4.542-1.069 1.93.189 3.654 1.171 4.673 2.645-3.987 2.378-3.344 8.163.743 9.845-.968 2.451-2.315 4.887-3.924 6.428zm-3.056-18.497c-.896 1.057-2.196 1.777-3.414 1.714-.15-1.378.472-2.73 1.341-3.765.885-1.056 2.226-1.802 3.39-1.713.152 1.383-.418 2.707-1.317 3.764z" /></svg>
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 text-center text-sm text-slate-500">
                            Don't have an account?{' '}
                            <span className="font-semibold text-blue-600 cursor-default">
                                Sign up
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MOBILE VIEW --- */}
            <div className="md:hidden w-full min-h-[100dvh] bg-white flex flex-col font-sans relative overflow-hidden">
                <div className="pt-6 pb-0 px-6 flex items-center">
                    <Link to={view === 'password' ? '#' : '/'} onClick={(e) => {
                        if (view === 'password') {
                            e.preventDefault();
                            setView('social');
                        }
                    }} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors text-slate-800">
                        <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
                    </Link>
                </div>

                {/* --- SOCIAL / MAIN ENTRY VIEW --- */}
                {view === 'social' && (
                    <div className="flex-1 flex flex-col items-center px-6 animate-in slide-in-from-left-4 fade-in duration-300">

                        {/* Abstract Illustration (CSS representation) */}
                        <div className="w-56 h-56 mt-2 mb-4 relative flex items-center justify-center transform scale-90">
                            <div className="absolute inset-0 bg-slate-100 rounded-full"></div>
                            <div className="absolute top-8 left-10 w-7 h-7 bg-red-400 rounded-full"></div>

                            {/* Window Graphic */}
                            <div className="absolute top-14 left-16 w-14 h-20 bg-white border-2 border-slate-200 grid grid-cols-2 grid-rows-3 gap-1 p-1">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-slate-100"></div>
                                ))}
                            </div>

                            {/* Abstract Blue Blobs */}
                            <div className="absolute right-6 top-10 w-24 h-20 bg-blue-600 rounded-[35px] rounded-bl-sm rotate-12"></div>
                            <div className="absolute right-14 top-28 w-14 h-14 bg-blue-600 rounded-full"></div>

                            {/* Abstract Person */}
                            <div className="absolute bottom-12 left-20 z-10 flex flex-col items-center">
                                <div className="w-5 h-5 bg-slate-800 rounded-full mb-1 flex items-center justify-center">
                                    <div className="w-3.5 h-1.5 bg-[#FFD1AF] mt-1.5 rounded-full"></div>
                                </div>
                                <div className="w-9 h-12 bg-blue-500 rounded-t-xl rounded-bl-xl relative">
                                    <div className="absolute top-1.5 -right-5 w-7 h-2.5 bg-blue-500 rounded-r-full rotate-[-20deg]"></div>
                                </div>
                                <div className="flex gap-1 mt-0">
                                    <div className="w-3 h-14 bg-slate-800 rotate-[15deg] origin-top rounded-b-md"></div>
                                    <div className="w-3 h-14 bg-slate-800 origin-top rounded-b-md translate-y-1.5"></div>
                                </div>
                            </div>
                        </div>

                        <h1 className="text-3xl leading-tight font-bold text-slate-900 mb-4 tracking-tight">Let's you in</h1>

                        <div className="w-full space-y-2.5">
                            <button onClick={handleSocialClick} className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700 font-semibold shadow-sm opacity-90 text-[14px]">
                                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                Continue with Facebook
                            </button>
                            <button onClick={handleSocialClick} className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700 font-semibold shadow-sm opacity-90 text-[14px]">
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Continue with Google
                            </button>
                            <button onClick={handleSocialClick} className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 bg-black hover:bg-slate-900 transition-colors text-white font-semibold shadow-sm text-[14px]">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.365 21.444c-1.066 1.487-2.189 2.972-3.805 3.006-1.576.035-2.112-.916-3.886-.916-1.776 0-2.383.882-3.887.95-1.573.072-2.844-1.554-3.918-3.08-2.193-3.125-3.886-8.818-1.636-12.673 1.112-1.905 3.097-3.111 5.212-3.146 1.543-.036 2.981 1.01 3.886 1.01.905 0 2.656-1.259 4.542-1.069 1.93.189 3.654 1.171 4.673 2.645-3.987 2.378-3.344 8.163.743 9.845-.968 2.451-2.315 4.887-3.924 6.428zm-3.056-18.497c-.896 1.057-2.196 1.777-3.414 1.714-.15-1.378.472-2.73 1.341-3.765.885-1.056 2.226-1.802 3.39-1.713.152 1.383-.418 2.707-1.317 3.764z" /></svg>
                                Continue with Apple
                            </button>
                        </div>

                        <div className="flex items-center w-full my-4">
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <span className="px-4 text-slate-400 font-medium text-sm">or</span>
                            <div className="flex-1 h-px bg-slate-200"></div>
                        </div>

                        <button
                            onClick={() => setView('password')}
                            className="w-full py-4 px-4 rounded-full bg-[#2F6FF7] hover:bg-blue-700 text-white font-semibold shadow-[0_8px_20px_-6px_rgba(47,111,247,0.4)] transition-all active:scale-95 text-[15px]"
                        >
                            Sign in with password
                        </button>

                        <div className="mt-6 mb-2 text-[13px] font-medium text-slate-400">
                            Don't have an account? <span className="text-blue-600 font-semibold ml-1 cursor-default">Sign up</span>
                        </div>
                    </div>
                )}

                {/* --- PASSWORD LOGIN VIEW --- */}
                {view === 'password' && (
                    <div className="flex-1 flex flex-col px-8 pb-8 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="flex-1 flex flex-col items-center pt-8">

                            {/* Blue Circular Icon */}
                            <div className="mb-4 w-16 h-16 rounded-full border-[4px] border-blue-500/20 flex items-center justify-center p-1.5">
                                <div className="w-full h-full rounded-full border-[3px] border-blue-500 flex flex-col items-center justify-center relative">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mb-1"></div>
                                    <div className="w-3.5 h-4 bg-blue-500 rounded-t-full rounded-b-sm"></div>
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center tracking-tight">Login to Your Account</h1>

                            {/* Demo Credentials Helper - Kept discreetly above form */}
                            <div className="w-full mb-3 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <div className="text-xs text-blue-800 flex-1">
                                    <p className="font-semibold mb-1">Demo Access</p>
                                    <div className="flex flex-col gap-1">
                                        <p>Email: <span className="font-mono bg-white border border-blue-100 px-1 py-0.5 rounded text-blue-600">demo@user.com</span></p>
                                        <p>Password: <span className="font-mono bg-white border border-blue-100 px-1 py-0.5 rounded text-blue-600">password123</span></p>
                                    </div>
                                </div>
                            </div>

                            <form className="w-full space-y-4" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="appearance-none block w-full pl-11 px-4 py-3 bg-slate-50 border border-transparent rounded-[16px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                                            placeholder="Email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="appearance-none block w-full pl-11 pr-11 px-4 py-3 bg-slate-50 border border-transparent rounded-[16px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                                            placeholder="Password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center mb-4 mt-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" className="w-5 h-5 rounded-[6px] border-2 border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 bg-transparent checked:border-blue-600 appearance-none transition-all placeholder-transparent" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")", backgroundSize: "100% 100%", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
                                        </div>
                                        <span className="text-[14px] font-semibold text-slate-700">Remember me</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 px-4 rounded-full bg-[#2F6FF7] hover:bg-blue-700 text-white font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 text-[15px] shadow-[0_8px_20px_-6px_rgba(47,111,247,0.4)]"
                                >
                                    {isLoading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </form>

                            <div className="mt-4 text-center w-full">
                                <Link to="#" className="text-[14px] font-semibold text-blue-600">
                                    Forgot the password?
                                </Link>
                            </div>

                            <div className="flex items-center w-full my-3">
                                <div className="flex-1 h-px bg-slate-200"></div>
                                <span className="px-4 text-slate-500 font-medium text-[13px]">or continue with</span>
                                <div className="flex-1 h-px bg-slate-200"></div>
                            </div>

                            <div className="flex gap-4 w-full justify-center">
                                <button onClick={handleSocialClick} className="w-[60px] h-[46px] flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors opacity-90">
                                    <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </button>
                                <button onClick={handleSocialClick} className="w-[60px] h-[46px] flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors opacity-90">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                </button>
                                <button onClick={handleSocialClick} className="w-[60px] h-[46px] flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors opacity-90">
                                    <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24"><path d="M16.365 21.444c-1.066 1.487-2.189 2.972-3.805 3.006-1.576.035-2.112-.916-3.886-.916-1.776 0-2.383.882-3.887.95-1.573.072-2.844-1.554-3.918-3.08-2.193-3.125-3.886-8.818-1.636-12.673 1.112-1.905 3.097-3.111 5.212-3.146 1.543-.036 2.981 1.01 3.886 1.01.905 0 2.656-1.259 4.542-1.069 1.93.189 3.654 1.171 4.673 2.645-3.987 2.378-3.344 8.163.743 9.845-.968 2.451-2.315 4.887-3.924 6.428zm-3.056-18.497c-.896 1.057-2.196 1.777-3.414 1.714-.15-1.378.472-2.73 1.341-3.765.885-1.056 2.226-1.802 3.39-1.713.152 1.383-.418 2.707-1.317 3.764z" /></svg>
                                </button>
                            </div>
                        </div>

                        <div className="mt-auto mb-2 flex flex-col justify-end items-center w-full flex-1 min-h-[40px]">
                            <div className="text-[13px] font-medium text-slate-400">
                                Don't have an account? <span className="text-blue-600 font-semibold ml-1 cursor-default">Sign up</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Login;
