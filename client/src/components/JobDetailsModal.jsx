import { X, MapPin, Briefcase, Building, IndianRupee, ExternalLink, Calendar, Users, Globe, Copy, Check, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
const JobDetailsModal = ({ job, onClose, initiallySaved, onToggleSave, hideActions = false }) => {
    const { user } = useAuth();
    const [didSave, setDidSave] = useState(initiallySaved || false);
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState(null);
    const [profileCompleteness, setProfileCompleteness] = useState({ complete: true, missing: [] });
    const [showWarning, setShowWarning] = useState(false);
    
    // Explicitly hide actions for recruiters and admins
    const isRestrictedRole = user?.role === 'RECRUITER' || user?.role === 'SUPER_ADMIN';
    const effectiveHideActions = hideActions || isRestrictedRole;
    
    const timeSince = (date) => {
        if (!date) return 'Recently';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    };
    const companyDisplayName = job?.company || job?.companyName || job?.recruiterId?.companyName || job?.recruiterId?.name || 'Organization';
    const companyLogo = job?.logo || job?.recruiterId?.logo || job?.recruiterId?.avatar;

    const handleCopyLink = () => {
        if (job?.link) {
            navigator.clipboard.writeText(job.link || window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else if (job?._id) {
            const url = `${window.location.origin}/app/special-jobs/${job._id}`;
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    useEffect(() => {
        if (job) {
            setDidSave(initiallySaved || false);
        }
    }, [job, initiallySaved]);
    useEffect(() => {
        if (job) {
            document.body.style.overflow = 'hidden';
            setApplied(false);
            setError(null);
            // Only check application status for students and recruiters
            if (job.isInternal && (user?.role === 'STUDENT' || user?.role === 'RECRUITER')) {
                checkApplicationStatus();
                checkProfileCompleteness();
            }
        } else {
            document.body.style.overflow = '';
            setShowWarning(false);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [job]);

    const checkProfileCompleteness = async () => {
        try {
            const res = await axios.get('/student/me');
            if (res.data.status === 'success' && res.data.data.profile) {
                const profile = res.data.data.profile;
                const missing = [];
                if (!profile.resumeUrl) missing.push("Resume");
                if (!profile.skills || profile.skills.length === 0) missing.push("Critical Skills");
                if (!profile.education || profile.education.length === 0) missing.push("Education History");
                if (!profile.summary || profile.summary.length < 20) missing.push("Professional Summary");
                
                setProfileCompleteness({
                    complete: missing.length === 0,
                    missing
                });
            }
        } catch (err) {
            console.error("Profile check failed", err);
        }
    };

    const checkApplicationStatus = async () => {
        try {
            const res = await axios.get('/applications/me');
            if (res.data.status === 'success') {
                const alreadyApplied = res.data.data.applications.some(app => app.jobId?._id === job?._id || app.jobId === job?._id);
                setApplied(alreadyApplied);
            }
        } catch (err) {
            console.error("Failed to check app status", err);
        }
    };

    const handleApply = async () => {
        if (!job?.isInternal) return;
        setIsApplying(true);
        setError(null);
        try {
            const res = await axios.post('/applications', { jobId: job?._id });
            if (res.data.status === 'success') {
                setApplied(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to apply. Please try again.");
        } finally {
            setIsApplying(false);
        }
    };

    if (!job) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="absolute -bottom-8 left-8 w-20 h-20 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden p-2">
                        {companyLogo ? (
                            <img src={companyLogo} alt={companyDisplayName} className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold rounded-lg uppercase">
                                {String(companyDisplayName || job.title || 'J').substring(0, 1)}
                            </div>
                        )}
                    </div>
                </div>
                <div className="pt-14 px-8 pb-8 overflow-y-auto no-scrollbar flex-1">
                    <div className="mb-8">
                        <h2 className="text-[22px] md:text-[26px] font-black text-slate-900 leading-tight mb-3 tracking-tight">{job.title || 'Untitled Position'}</h2>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-500 font-semibold text-[13px] md:text-sm">
                            <div className="flex items-center gap-2">
                                <div className="p-1 px-1.5 bg-blue-50 rounded-md">
                                    <Building className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <span>{companyDisplayName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1 px-1.5 bg-blue-50 rounded-md">
                                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <span>{job.location || 'Remote Options'}</span>
                            </div>
                            {(job.salary || job.salaryRange) && (
                                <div className="flex items-center gap-2">
                                    <div className="p-1 px-1.5 bg-emerald-50 rounded-md">
                                        <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                                    </div>
                                    <span className="text-emerald-600">{job.salary || job.salaryRange}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Job Type</p>
                            <p className="text-sm font-bold text-slate-800 capitalize">{job.type || job.jobType || 'Full Time'}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Experience</p>
                            <p className="text-sm font-bold text-slate-800">{job.experienceRange || 'Entry Level'}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 hidden sm:block">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Posted</p>
                            <p className="text-sm font-bold text-slate-800">{timeSince(job.createdAt)}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">Job Description</h3>
                        <div className="text-slate-600 leading-relaxed space-y-4 text-sm md:text-base">
                            <div className="whitespace-pre-line">
                                {job.description || job.snippet || "No additional description provided for this position."}
                            </div>
                            
                            {job.responsibilities && job.responsibilities.length > 0 && (
                                <>
                                    <h4 className="font-bold text-slate-800 pt-2">Key Responsibilities:</h4>
                                    <ul className="list-disc pl-5 space-y-2">
                                        {job.responsibilities.map((res, i) => (
                                            <li key={i}>{res}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {!effectiveHideActions && (
                    <div className="p-4 md:p-5 border-t border-slate-100 bg-white flex flex-col gap-3 shrink-0 relative">
                        {showWarning && (
                            <div className="mb-1 p-4 bg-amber-50 border border-amber-100 rounded-2xl animate-in slide-in-from-bottom-2 duration-300">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                    <div>
                                        <p className="text-[13px] font-bold text-amber-800 tracking-tight leading-tight mb-1">Your profile is incomplete</p>
                                        <p className="text-[11px] font-medium text-amber-700/80 leading-normal">
                                            Recruiters prefer complete profiles. Missing: <span className="font-extrabold">{profileCompleteness.missing.join(', ')}</span>.
                                        </p>
                                        <button 
                                            onClick={() => window.location.href = '/app/profile'}
                                            className="mt-2 text-[11px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                                        >
                                            Complete Profile <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {applied && (
                            <div className="mb-1 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in zoom-in-95 duration-500">
                                <div className="flex items-center gap-3 text-emerald-700">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                                        <Check className="w-5 h-5" strokeWidth={3} />
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-black tracking-tight">Applied Successfully!</p>
                                        <p className="text-[11px] font-semibold text-emerald-600/80">Recruiter will review your profile shortly.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto sm:flex-1">
                            <button
                                onClick={handleCopyLink}
                                className="p-3.5 sm:p-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center justify-center shrink-0 w-[52px] sm:w-auto"
                                title="Copy Job Link"
                            >
                                {copied ? <Check className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-emerald-500" /> : <Copy className="w-[18px] h-[18px] sm:w-5 sm:h-5" />}
                            </button>
                            <button
                                onClick={async () => {
                                    setIsSaving(true);
                                    try {
                                        const title = job.title || 'Untitled Position';
                                        const company = job.company || job.companyName || (job.recruiterId?.companyName) || 'Organization';
                                        const jobId = job._id || job.id || job.link || `${title}-${company}`.replace(/\s+/g, '-').toLowerCase();
                                        if (didSave) {
                                            await axios.delete('/jobs/unsave', {
                                                data: { jobId }
                                            });
                                            setDidSave(false);
                                            if (onToggleSave) onToggleSave(jobId, false);
                                        } else {
                                            await axios.post('/jobs/save', { job });
                                            setDidSave(true);
                                            if (onToggleSave) onToggleSave(jobId, true);
                                        }
                                    } catch (err) {
                                        console.error('Failed to toggle save job', err);
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                disabled={isSaving}
                                className={`flex-1 font-bold py-3 px-4 rounded-xl text-sm whitespace-nowrap transition-all ${didSave ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                            >
                                {isSaving ? 'Processing...' : didSave ? 'Remove from saved' : 'Save for later'}
                            </button>
                        </div>
                        {job.isInternal ? (
                            <button
                                onClick={() => {
                                    if (!profileCompleteness.complete && !showWarning) {
                                        setShowWarning(true);
                                    } else {
                                        handleApply();
                                    }
                                }}
                                disabled={isApplying || applied}
                                className={`w-full sm:w-auto sm:flex-[1.2] font-bold py-3 px-4 rounded-xl text-sm whitespace-nowrap transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 ${applied ? 'bg-emerald-500 text-white cursor-default' : 'bg-[#1a56f0] text-white hover:bg-[#1546c7]'}`}
                            >
                                {isApplying ? 'Applying...' : applied ? (
                                    <><Check className="w-4 h-4" /> Applied Successfully</>
                                ) : showWarning ? 'Apply Anyway' : 'Apply Now'}
                            </button>
                        ) : (
                            <a
                                href={job.link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto sm:flex-[1.2] bg-[#1a56f0] text-white font-bold py-3 px-4 rounded-xl text-sm whitespace-nowrap hover:bg-[#1546c7] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                            >
                                Apply Now <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                        </div>
                    </div>
                )}
                {error && !effectiveHideActions && (
                    <div className="px-8 pb-4 text-center">
                        <p className="text-rose-500 text-xs font-semibold">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default JobDetailsModal;
