import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Briefcase, Building2, ArrowRight, Loader2, CheckCircle2, Clock } from 'lucide-react';
import Logo from '../components/Logo';
const roles = [
    {
        id: 'STUDENT',
        label: 'Student',
        subtitle: 'I am looking for jobs, internships, or career growth.',
        icon: GraduationCap,
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        activeBorder: 'border-blue-500',
        activeBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        pillBg: 'bg-blue-100 text-blue-700',
        badge: null,
        instant: true
    },
    {
        id: 'RECRUITER',
        label: 'Recruiter',
        subtitle: 'I hire talent and post job openings for my company.',
        icon: Briefcase,
        gradient: 'from-violet-500 to-purple-600',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        activeBorder: 'border-violet-500',
        activeBg: 'bg-violet-50',
        iconColor: 'text-violet-600',
        pillBg: 'bg-violet-100 text-violet-700',
        badge: 'Requires Approval',
        instant: false
    },
    {
        id: 'COLLEGE_ADMIN',
        label: 'College',
        subtitle: 'I represent a college or institution managing placements.',
        icon: Building2,
        gradient: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        activeBorder: 'border-emerald-500',
        activeBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        pillBg: 'bg-emerald-100 text-emerald-700',
        badge: 'Requires Approval',
        instant: false
    }
];
const RoleSelection = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { assignRole, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isRegistration = location.state?.isRegistration;
    const handleConfirm = async () => {
        if (!selectedRole) return;
        setIsLoading(true);
        setError('');
        const result = await assignRole(selectedRole);
        setIsLoading(false);
        if (result.success) {
            const roleData = result.user;
            if (roleData.pendingApproval) {
                navigate('/pending-approval', { replace: true });
            } else if (isRegistration && !roleData.profileCompleted) {
                navigate('/profile-setup', { replace: true });
            } else {
                navigate('/app', { replace: true });
            }
        } else {
            setError(result.message || 'Failed to assign role. Please try again.');
        }
    };
    const selectedRoleData = roles.find(r => r.id === selectedRole);
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 w-full max-w-lg">
                <div className="flex justify-center mb-8">
                    <Logo iconSize="w-10 h-10" textClassName="text-2xl text-white" />
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                            Welcome, {user?.name?.split(' ')[0] || 'there'}! 👋
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Select your role to personalize your experience.
                        </p>
                    </div>
                    <div className="space-y-3 mb-6">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.id;
                            return (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden
                                        ${isSelected
                                            ? 'border-white/40 bg-white/15 shadow-lg scale-[1.01]'
                                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-3 right-3">
                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${role.gradient}`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={`font-bold text-base ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                                    {role.label}
                                                </span>
                                                {role.badge && (
                                                    <span className="flex items-center gap-1 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        {role.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                {role.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {selectedRoleData && !selectedRoleData.instant && (
                        <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-300 leading-relaxed">
                                <span className="font-semibold">{selectedRoleData.label} accounts</span> require admin verification before you can access all features. We'll notify you once approved.
                            </p>
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedRole || isLoading}
                        className={`w-full py-4 rounded-2xl font-bold text-[15px] transition-all duration-200 flex items-center justify-center gap-2
                            ${selectedRole && !isLoading
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)] hover:shadow-[0_12px_32px_-8px_rgba(99,102,241,0.7)] hover:scale-[1.01] active:scale-[0.99]'
                                : 'bg-white/10 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Setting up your account...
                            </>
                        ) : (
                            <>
                                Continue as {selectedRoleData?.label || '...'}
                                {selectedRole && <ArrowRight className="w-4 h-4" />}
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-4">
                        Your role cannot be changed after selection.
                    </p>
                </div>
            </div>
        </div>
    );
};
export default RoleSelection;
