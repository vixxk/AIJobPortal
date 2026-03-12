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
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-8">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-10">
                    <Logo iconSize="w-8 h-8" textClassName="text-xl text-slate-900 font-bold" />
                </div>
                
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
                    <div className="flex items-center justify-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                            <Clock className="w-8 h-8 text-amber-600" strokeWidth={2} />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Verification Pending
                    </h1>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        Your <span className="text-slate-900 font-semibold">{roleLabel}</span> account is currently being reviewed by our administration team. This process typically takes <span className="text-slate-900 font-medium">24–48 hours</span>.
                    </p>
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-8 text-left space-y-4">
                        {[
                            { icon: CheckCircle, text: 'Account registration', done: true },
                            { icon: CheckCircle, text: `Role assignment: ${roleLabel}`, done: true },
                            { icon: Shield, text: 'Administrative verification', done: false },
                            { icon: CheckCircle, text: 'Platform access', done: false }
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0
                                    ${step.done ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-200 text-slate-400'}`}>
                                    <step.icon className="w-3.5 h-3.5" />
                                </div>
                                <span className={`text-sm font-medium ${step.done ? 'text-slate-700' : 'text-slate-400'}`}>
                                    {step.text}
                                </span>
                                {i === 2 && (
                                    <span className="ml-auto text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        In Progress
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {checkMsg && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${checkMsg.includes('❌') ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                            {checkMsg}
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        <button
                            onClick={handleCheckStatus}
                            disabled={checking}
                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            {checking ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Updating Status...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    Check Application Status
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
                
                <div className="mt-8 text-center space-y-4">
                    <p className="text-xs text-slate-500">
                        We'll send a notification to <span className="font-semibold text-slate-700">{user?.email}</span> once approved.
                    </p>
                    <p className="text-xs text-slate-400">
                        Need help? Contact{' '}
                        <a href="mailto:support@gradnex.com" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                            support@gradnex.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
