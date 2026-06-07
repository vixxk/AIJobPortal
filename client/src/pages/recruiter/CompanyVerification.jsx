import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import CompanyVerificationForm from '../../components/CompanyVerificationForm';
import { Clock, Building2, User, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const CompanyVerification = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/recruiter/me');
                if (res.data.status === 'success') {
                    setProfile(res.data.data.profile || {});
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSuccess = async () => {
        await refreshUser();
        navigate('/app/recruiter');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const isSubmitted = profile?.verificationSubmitted;
    const approvalStatus = user?.approvalStatus || 'PENDING';

    if (isSubmitted && approvalStatus === 'PENDING') {
        return (
            <div className="max-w-xl mx-auto py-8 px-4 sm:px-0">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
                    <div className="p-8 text-center space-y-6">
                        <div className="relative mx-auto w-20 h-20">
                            <div className="absolute inset-0 bg-amber-100 rounded-[28px] animate-ping opacity-25" />
                            <div className="relative bg-amber-50 rounded-[28px] w-full h-full flex items-center justify-center text-amber-500">
                                <Clock className="w-10 h-10" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Verification Pending</h3>
                            <p className="text-slate-500 text-sm font-semibold leading-relaxed px-4">
                                Your verification request has already been submitted and is currently under review by our admin team. Please wait for some time.
                            </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/60 pb-2 mb-1">
                                Submitted Details
                            </h4>
                            <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Company Legal Name</p>
                                    <p className="text-xs font-bold text-slate-700">{profile?.companyName || 'Not Provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-slate-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Authorized Person</p>
                                    <p className="text-xs font-bold text-slate-700">{profile?.authorizedPersonName || 'Not Provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Official Email</p>
                                    <p className="text-xs font-bold text-slate-700">{profile?.officialEmail || 'Not Provided'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <button 
                                onClick={() => navigate('/app/recruiter')} 
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                RETURN TO HUB
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (approvalStatus === 'APPROVED') {
        return (
            <div className="max-w-xl mx-auto py-8 px-4 sm:px-0">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
                    <div className="p-8 text-center space-y-6">
                        <div className="relative mx-auto w-20 h-20">
                            <div className="absolute inset-0 bg-emerald-100 rounded-[28px] animate-ping opacity-25" />
                            <div className="relative bg-emerald-50 rounded-[28px] w-full h-full flex items-center justify-center text-emerald-500">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Profile Verified</h3>
                            <p className="text-slate-500 text-sm font-semibold leading-relaxed px-4">
                                Congratulations! Your company profile has been verified. You now have full access to publish jobs and internships.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <button 
                                onClick={() => navigate('/app/recruiter')} 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                GO TO DASHBOARD
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-6 lg:px-8">
            <CompanyVerificationForm 
                initialProfile={profile}
                onClose={() => navigate('/app/recruiter')}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default CompanyVerification;
