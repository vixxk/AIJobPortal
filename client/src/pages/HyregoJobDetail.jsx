import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import {
    MapPin, Briefcase, IndianRupee, Clock, Calendar, Globe, Monitor,
    ArrowLeft, Menu, Share2, ExternalLink, CheckCircle, ChevronRight,
    Building2, BookOpen, Users, AlertCircle, Lock, Sparkles, Timer, Play
} from 'lucide-react';

const HyregoJobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [applyError, setApplyError] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/jobs/public/${id}`);
                if (res.data.status === 'success') {
                    setJob(res.data.data.job);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Job not found');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    useEffect(() => {
        if (job && user && user.role === 'STUDENT' && job.isSpecial) {
            const checkAppStatus = async () => {
                try {
                    const res = await axios.get('/applications/me');
                    if (res.data.status === 'success') {
                        const alreadyApplied = res.data.data.applications.some(
                            app => app.jobId?._id === job._id || app.jobId === job._id
                        );
                        setApplied(alreadyApplied);
                    }
                } catch (err) { /* ignore */ }
            };
            checkAppStatus();
        }
    }, [job, user]);

    const handleCopyLink = () => {
        const url = window.location.href;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleApplyInternal = async () => {
        if (!user) {
            navigate(`/login?redirect=/hyrego/${id}`);
            return;
        }
        setIsApplying(true);
        setApplyError(null);
        try {
            const profileRes = await axios.get('/student/me');
            const resumeUrl = profileRes.data?.data?.profile?.resumeUrl;
            const res = await axios.post('/applications', { jobId: job._id, resume: resumeUrl });
            if (res.data.status === 'success') {
                setApplied(true);
            }
        } catch (err) {
            setApplyError(err.response?.data?.message || 'Failed to apply. Please complete your profile first.');
        } finally {
            setIsApplying(false);
        }
    };

    const timeSince = (date) => {
        if (!date) return 'Recently';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        if (seconds < 2592000) return Math.floor(seconds / 86400) + ' days ago';
        return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const daysUntilDeadline = (deadline) => {
        if (!deadline) return null;
        const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'Expired';
        if (diff === 0) return 'Today';
        return `${diff} days left`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold text-sm">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-10 text-center max-w-md shadow-xl border border-slate-100">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">Job Not Found</h2>
                    <p className="text-slate-500 text-sm mb-6">{error || 'This job listing may have been removed or is no longer available.'}</p>
                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all">
                        <ArrowLeft className="w-4 h-4" /> Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const companyName = job.companyName || job.recruiterId?.companyName || 'Organization';
    const companyLogo = job.companyLogo || job.recruiterId?.logo;
    const companyBanner = job.companyBanner;
    const deadlineText = daysUntilDeadline(job.applicationDeadline);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Banner Section */}
            <div className="relative">
                {companyBanner ? (
                    <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
                        <img src={companyBanner} alt="Company Banner" className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
                    </div>
                ) : (
                    <div className="h-48 md:h-64 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5" />
                            <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-white/5" />
                            <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-white/5" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
                    </div>
                )}

                {/* Floating action buttons on banner */}
                <div className="absolute top-4 left-4 right-4 md:top-6 md:left-8 md:right-8 flex items-center justify-end z-20">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopyLink}
                            className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all border border-white/10 shadow-lg"
                            title={copied ? 'Copied!' : 'Share'}
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        {!user && (
                            <Link
                                to={`/login?redirect=/hyrego/${id}`}
                                className="px-4 py-2.5 md:px-5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white text-sm font-bold transition-all border border-white/10 shadow-lg"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-20 md:-mt-24 relative z-10 pb-16 md:pb-24">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left Column - Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header Card */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 md:p-8 mb-6">
                            <div className="flex items-start gap-4 md:gap-5 mb-6">
                                {/* Company Logo */}
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-lg shrink-0 p-2">
                                    {companyLogo ? (
                                        <img src={companyLogo} alt={companyName} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <span className="text-white font-black text-2xl">{companyName.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-1.5">
                                        {job.title}
                                    </h1>
                                    <p className="text-blue-600 font-bold text-sm md:text-base">{companyName}</p>
                                </div>
                            </div>

                            {/* Quick Info Chips */}
                            <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-[13px] font-semibold text-slate-600">
                                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                    {job.location}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-[13px] font-semibold text-slate-600">
                                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                                    {job.jobType || 'Full-time'}
                                </span>
                                {(job.salaryRange) && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs md:text-[13px] font-bold text-emerald-700">
                                        <IndianRupee className="w-3.5 h-3.5" />
                                        {job.salaryRange}
                                    </span>
                                )}
                                {job.experienceRange && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-[13px] font-semibold text-slate-600">
                                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                                        {job.experienceRange} Exp
                                    </span>
                                )}
                            </div>

                            {/* Detail Pills Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {job.applicationDeadline && (
                                    <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3 md:p-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                            <p className="text-[10px] md:text-[11px] font-bold text-blue-500 uppercase tracking-wider">Deadline</p>
                                        </div>
                                        <p className="text-xs md:text-sm font-bold text-slate-800">
                                            {new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                )}
                                {job.startDate && (
                                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 md:p-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                            <Play className="w-3.5 h-3.5 text-emerald-500" />
                                            <p className="text-[10px] md:text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Start Date</p>
                                        </div>
                                        <p className="text-xs md:text-sm font-bold text-slate-800">{job.startDate}</p>
                                    </div>
                                )}
                                {job.workMode && (
                                    <div className="bg-violet-50/70 border border-violet-100 rounded-2xl p-3 md:p-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                            <Monitor className="w-3.5 h-3.5 text-violet-500" />
                                            <p className="text-[10px] md:text-[11px] font-bold text-violet-500 uppercase tracking-wider">Work Mode</p>
                                        </div>
                                        <p className="text-xs md:text-sm font-bold text-slate-800">{job.workMode}</p>
                                    </div>
                                )}
                                {job.duration && (
                                    <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3 md:p-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                            <Timer className="w-3.5 h-3.5 text-amber-500" />
                                            <p className="text-[10px] md:text-[11px] font-bold text-amber-500 uppercase tracking-wider">Duration</p>
                                        </div>
                                        <p className="text-xs md:text-sm font-bold text-slate-800">{job.duration}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Job Overview */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 mb-6">
                            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                Job Overview
                            </h2>
                            <div className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
                                {job.description || 'No description provided.'}
                            </div>
                        </div>

                        {/* Key Responsibilities */}
                        {job.responsibilities && job.responsibilities.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 mb-6">
                                <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                    Key Responsibilities
                                </h2>
                                <ul className="space-y-3">
                                    {job.responsibilities.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm md:text-base text-slate-600">
                                            <span className="mt-1.5 w-2 h-2 bg-blue-400 rounded-full shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Eligibility Criteria */}
                        {job.eligibilityCriteria && job.eligibilityCriteria.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 mb-6">
                                <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                    Eligibility Criteria
                                </h2>
                                <ul className="space-y-3">
                                    {job.eligibilityCriteria.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm md:text-base text-slate-600">
                                            <span className="mt-1.5 w-2 h-2 bg-emerald-400 rounded-full shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Skills Required */}
                        {job.skillsRequired && job.skillsRequired.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 mb-6">
                                <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                                    Skills Required
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.skillsRequired.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-sm font-semibold text-blue-700"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* About the Company */}
                        {(job.aboutCompany || job.companyWebsite) && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 mb-6">
                                <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-slate-700 rounded-full" />
                                    About the Company
                                </h2>
                                {job.aboutCompany && (
                                    <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-4 whitespace-pre-line">
                                        {job.aboutCompany}
                                    </p>
                                )}
                                {job.companyWebsite && (
                                    <a
                                        href={job.companyWebsite.startsWith('http') ? job.companyWebsite : `https://${job.companyWebsite}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                                    >
                                        <Globe className="w-4 h-4" /> Visit Website
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:w-[340px] xl:w-[380px] shrink-0">
                        <div className="lg:sticky lg:top-6 space-y-5">
                            {/* Apply Now Card */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[60px] -z-0" />
                                <div className="relative z-10">
                                    <h3 className="text-lg font-black text-slate-900 mb-4">Apply Now</h3>
                                    
                                    {deadlineText && (
                                        <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                            <Timer className="w-4 h-4 text-slate-400" />
                                            <span className={`text-sm font-bold ${deadlineText === 'Expired' ? 'text-red-500' : 'text-slate-700'}`}>
                                                Deadline: {deadlineText}
                                            </span>
                                        </div>
                                    )}

                                    {applyError && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
                                            {applyError}
                                        </div>
                                    )}

                                    {applied ? (
                                        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl mb-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-emerald-800">Applied!</p>
                                                <p className="text-[11px] font-medium text-emerald-600">Your application is under review.</p>
                                            </div>
                                        </div>
                                    ) : job.applyHidden ? (
                                        /* Apply link requires login */
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-4 bg-amber-50/80 border border-amber-100 rounded-2xl">
                                                <Lock className="w-5 h-5 text-amber-500 shrink-0" />
                                                <p className="text-xs font-semibold text-amber-700">Login or register to see the apply link and submit your application.</p>
                                            </div>
                                            <Link
                                                to={`/login?redirect=/hyrego/${id}`}
                                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                            >
                                                Login to Apply <ChevronRight className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                to="/register"
                                                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-blue-200 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all"
                                            >
                                                Create Account
                                            </Link>
                                        </div>
                                    ) : job.applyLink ? (
                                        /* External apply link */
                                        <a
                                            href={job.applyLink.startsWith('http') ? job.applyLink : `https://${job.applyLink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                        >
                                            Apply Now <ExternalLink className="w-4 h-4" />
                                        </a>
                                    ) : user ? (
                                        /* Internal apply for logged-in students */
                                        <button
                                            onClick={handleApplyInternal}
                                            disabled={isApplying || deadlineText === 'Expired'}
                                            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                                                deadlineText === 'Expired'
                                                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                            }`}
                                        >
                                            {isApplying ? 'Applying...' : deadlineText === 'Expired' ? 'Deadline Passed' : 'Apply Now'}
                                        </button>
                                    ) : (
                                        <Link
                                            to={`/login?redirect=/hyrego/${id}`}
                                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                        >
                                            Login to Apply <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Job Info Card */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Job Summary</h3>
                                <div className="space-y-3">
                                    <InfoRow icon={Building2} label="Company" value={companyName} />
                                    <InfoRow icon={MapPin} label="Location" value={job.location} />
                                    <InfoRow icon={Briefcase} label="Job Type" value={job.jobType || 'Full-time'} />
                                    {job.salaryRange && <InfoRow icon={IndianRupee} label="Salary" value={job.salaryRange} />}
                                    {job.experienceRange && <InfoRow icon={Clock} label="Experience" value={job.experienceRange} />}
                                    {job.workMode && <InfoRow icon={Monitor} label="Work Mode" value={job.workMode} />}
                                    {job.duration && <InfoRow icon={Timer} label="Duration" value={job.duration} />}
                                    <InfoRow icon={Calendar} label="Posted" value={timeSince(job.createdAt)} />
                                </div>
                            </div>

                            {/* Share Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-6 text-center">
                                <p className="text-sm font-bold text-slate-700 mb-3">Know someone perfect for this role?</p>
                                <button
                                    onClick={handleCopyLink}
                                    className="w-full py-3 bg-white border border-blue-200 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Share2 className="w-4 h-4" />
                                    {copied ? 'Link Copied!' : 'Share this Job'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Fixed Bottom Apply Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-4 shadow-2xl shadow-slate-900/10">
                {applied ? (
                    <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-bold text-sm">
                        <CheckCircle className="w-4 h-4" /> Already Applied
                    </div>
                ) : job.applyHidden ? (
                    <Link
                        to={`/login?redirect=/hyrego/${id}`}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200"
                    >
                        <Lock className="w-4 h-4" /> Login to Apply
                    </Link>
                ) : job.applyLink ? (
                    <a
                        href={job.applyLink.startsWith('http') ? job.applyLink : `https://${job.applyLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200"
                    >
                        Apply Now <ExternalLink className="w-4 h-4" />
                    </a>
                ) : user ? (
                    <button
                        onClick={handleApplyInternal}
                        disabled={isApplying || deadlineText === 'Expired'}
                        className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg ${
                            deadlineText === 'Expired'
                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                                : 'bg-blue-600 text-white shadow-blue-200'
                        }`}
                    >
                        {isApplying ? 'Applying...' : deadlineText === 'Expired' ? 'Deadline Passed' : 'Apply Now'}
                    </button>
                ) : (
                    <Link
                        to={`/login?redirect=/hyrego/${id}`}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200"
                    >
                        Login to Apply <ChevronRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
        </div>
    );
};

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
        </div>
    </div>
);

export default HyregoJobDetail;
