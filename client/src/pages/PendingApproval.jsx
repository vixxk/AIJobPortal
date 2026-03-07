import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, Mail, LogOut, RefreshCw, Shield, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { useState } from 'react';
const PendingApproval = () => {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);
    const [checkMsg, setCheckMsg] = useState('');
    const handleLogout = () => {
        logout();
    };
    const handleCheckStatus = async () => {
        setChecking(true);
        setCheckMsg('');
        const updatedUser = await refreshUser();
        setChecking(false);
        if (!updatedUser) {
            setCheckMsg('Could not connect to server. Please try again.');
            return;
        }
        if (updatedUser.approvalStatus === 'APPROVED') {
            navigate('/app', { replace: true });
        } else if (updatedUser.approvalStatus === 'REJECTED') {
            setCheckMsg('❌ Your application was rejected. Please contact support.');
        } else {
            setCheckMsg('⏳ Still pending. Our team typically reviews within 24–48 hours.');
        }
    };
    const roleLabel = user?.role === 'RECRUITER' ? 'Recruiter' : 'College';
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/30 flex flex-col items-center justify-center p-4">
            {}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-amber-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-orange-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 w-full max-w-md">
                {}
                <div className="flex justify-center mb-8">
                    <Logo iconSize="w-10 h-10" textClassName="text-2xl text-white" />
                </div>
                {}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
                    {}
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center">
                                    <Clock className="w-10 h-10 text-amber-400" strokeWidth={1.5} />
                                </div>
                            </div>
                            {}
                            <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
                        Verification Pending
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        Your <span className="text-amber-300 font-semibold">{roleLabel}</span> account is under review.
                        Our admin team will verify your details and approve your account within{' '}
                        <span className="text-white font-medium">24–48 hours</span>.
                    </p>
                    {}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left space-y-3">
                        {[
                            { icon: CheckCircle, text: 'Account created successfully', done: true },
                            { icon: CheckCircle, text: `Role assigned: ${roleLabel}`, done: true },
                            { icon: Shield, text: 'Admin verification in progress', done: false },
                            { icon: CheckCircle, text: 'Full platform access unlocked', done: false }
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                                    ${step.done ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-700/50 border border-slate-600/40'}`}>
                                    <step.icon className={`w-3.5 h-3.5 ${step.done ? 'text-emerald-400' : 'text-slate-500'}`} />
                                </div>
                                <span className={`text-sm ${step.done ? 'text-slate-200' : 'text-slate-500'}`}>
                                    {step.text}
                                </span>
                                {i === 2 && (
                                    <span className="ml-auto text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                        ACTIVE
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    {}
                    <div className="flex items-center gap-2 justify-center text-xs text-slate-500 mb-6">
                        <Mail className="w-3.5 h-3.5" />
                        <span>We'll notify you at <span className="text-slate-300">{user?.email}</span> when approved</span>
                    </div>
                    {}
                    {checkMsg && (
                        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300">
                            {checkMsg}
                        </div>
                    )}
                    {}
                    <div className="space-y-3">
                        <button
                            onClick={handleCheckStatus}
                            disabled={checking}
                            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_8px_24px_-8px_rgba(245,158,11,0.4)]"
                        >
                            {checking ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    Check Approval Status
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
                <p className="text-center text-xs text-slate-600 mt-6">
                    Questions? Contact us at{' '}
                    <a href="mailto:support@jobportal.com" className="text-slate-400 hover:text-slate-200 transition-colors">
                        support@jobportal.com
                    </a>
                </p>
            </div>
        </div>
    );
};
export default PendingApproval;