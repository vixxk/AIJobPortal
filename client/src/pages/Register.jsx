import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Briefcase, GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';
import registerIllustration from '../assets/register_illustration.png';
const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, user } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (user) navigate('/app', { replace: true });
    }, [user, navigate]);
    if (user) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const result = await register(name, email, password, role);
        setIsLoading(false);
        if (result.success) {
            navigate('/login', { state: { view: 'otp-verify', email, name, fromRegister: true } });
        } else {
            setError(result.message);
        }
    };
    const roles = [
        { value: 'STUDENT', icon: User, label: 'Student' },
        { value: 'RECRUITER', icon: Briefcase, label: 'Recruiter' },
        { value: 'COLLEGE_ADMIN', icon: GraduationCap, label: 'College' },
    ];

    const formContent = () => (
        <>
            {successMessage && (
                <div className="p-3 mb-5 bg-green-50 text-green-700 text-sm font-medium rounded-xl border border-green-200 text-center">
                    {successMessage}
                </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                        {error}
                    </div>
                )}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text" required value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                        placeholder="Full Name"
                    />
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="email" required value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                        placeholder="Email Address"
                    />
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        required value={password} minLength={8}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-[15px] font-medium transition-all"
                        placeholder="Password (min. 8 characters)"
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <div>
                    <label className="block text-[12px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">I am a...</label>
                    <div className="grid grid-cols-3 gap-2">
                        {roles.map(({ value, icon: Icon, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRole(value)}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all
                                    ${role === value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}
                            >
                                <Icon className={`w-5 h-5 mb-1 ${role === value ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span className="text-xs font-semibold">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !!successMessage}
                    className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-[15px] shadow-[0_8px_20px_-6px_rgba(47,111,247,0.4)]"
                >
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</> : 'Create Account'}
                </button>
            </form>
        </>
    );
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
                                src={registerIllustration}
                                alt="Create your account"
                                className="w-full object-contain"
                                style={{ mixBlendMode: 'multiply', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))' }}
                            />
                        </div>
                        <h2 className="text-3xl xl:text-4xl font-extrabold text-white text-center leading-tight mb-4">
                            Join Gradnex
                        </h2>
                        <p className="text-blue-200 text-center text-[15px] leading-relaxed max-w-[300px]">
                            Create your profile and get discovered by top recruiters — or find your next great hire.
                        </p>
                        <div className="flex gap-3 mt-8 flex-wrap justify-center">
                            {[{ icon: '🎓', label: 'Students' }, { icon: '🏢', label: 'Recruiters' }, { icon: '🏫', label: 'Colleges' }]
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
                            Have an account?{' '}
                            <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Sign in</Link>
                        </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-8 xl:px-16 py-6">
                        <div className="w-full max-w-[420px]">
                            <div className="mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                                    <User className="w-7 h-7 text-blue-600" />
                                </div>
                                <h2 className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
                                    Create your account
                                </h2>
                                <p className="text-slate-500 text-[14px] mt-1">Fill in the details below to get started</p>
                            </div>
                            {formContent()}
                        </div>
                    </div>
                </div>
            </div>
            <div className="md:hidden min-h-[100dvh] w-full bg-white flex flex-col font-sans py-8 px-6">
                <div className="flex justify-center mb-6">
                    <Logo iconSize="w-10 h-10" textClassName="text-2xl text-slate-900" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">Create Account</h1>
                <p className="text-slate-500 text-sm text-center mb-7">Start your journey with Gradnex</p>
                {formContent()}
                <div className="mt-6 text-center text-[14px] font-medium text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">Sign in</Link>
                </div>
            </div>
        </>
    );
};
export default Register;
