import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import {
    ClipboardList, Briefcase, MapPin, Search, ChevronRight, Clock,
    CheckCircle, XCircle, Star, AlertCircle, Building2, Calendar,
    FileText, Sparkles, Filter, RefreshCw, ExternalLink, ArrowUpRight,
    TrendingUp, Users, Award, Loader2, ChevronDown, ChevronUp, Bell
} from 'lucide-react';

const STATUS_CONFIG = {
    APPLIED:     { label: 'Applied',     color: 'bg-blue-50 text-blue-600 border-blue-200',     dot: 'bg-blue-500',     icon: ClipboardList, step: 0 },
    SHORTLISTED: { label: 'Shortlisted', color: 'bg-amber-50 text-amber-600 border-amber-200',   dot: 'bg-amber-500',    icon: Star,          step: 1 },
    INTERVIEW:   { label: 'Interview',   color: 'bg-violet-50 text-violet-600 border-violet-200', dot: 'bg-violet-500',   icon: Users,         step: 2 },
    HIRED:       { label: 'Hired 🎉',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: Award,       step: 3 },
    REJECTED:    { label: 'Rejected',    color: 'bg-red-50 text-red-600 border-red-200',          dot: 'bg-red-400',      icon: XCircle,       step: -1 },
};

const PIPELINE_STEPS = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'HIRED'];

const ScoreRing = ({ score }) => {
    const radius = 26;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (score / 100) * circ;
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#6366f1';
    return (
        <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={radius} stroke="#f1f5f9" strokeWidth="6" fill="none" />
                <circle cx="32" cy="32" r={radius} stroke={color} strokeWidth="6" fill="none"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[13px] font-black text-slate-800">{score}%</span>
            </div>
        </div>
    );
};

const Timeline = ({ timeline }) => {
    if (!timeline?.length) return null;
    return (
        <div className="space-y-2">
            {timeline.map((entry, idx) => {
                const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.APPLIED;
                const Icon = cfg.icon;
                return (
                    <div key={idx} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${idx === 0 ? 'bg-slate-100' : 'bg-white border border-slate-200'}`}>
                            <Icon className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-xs font-bold text-slate-700">{cfg.label}</p>
                            <p className="text-[11px] text-slate-400">{new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {idx < timeline.length - 1 && <div className="absolute left-3.5 mt-7 w-0.5 h-4 bg-slate-100" />}
                    </div>
                );
            })}
        </div>
    );
};

const PipelineBar = ({ status }) => {
    const cfg = STATUS_CONFIG[status];
    const currentStep = cfg?.step ?? 0;
    const isRejected = status === 'REJECTED';
    return (
        <div className="flex items-center gap-1 mt-3">
            {PIPELINE_STEPS.map((step, idx) => {
                const passed = !isRejected && currentStep >= idx;
                const active = !isRejected && currentStep === idx;
                return (
                    <div key={step} className="flex items-center flex-1">
                        <div className={`h-1.5 flex-1 rounded-full transition-all ${passed ? (active ? 'bg-blue-500' : 'bg-emerald-400') : 'bg-slate-100'}`} />
                        {idx < PIPELINE_STEPS.length - 1 && <div className="w-1" />}
                    </div>
                );
            })}
            {isRejected && <div className="h-1.5 flex-1 rounded-full bg-red-200 ml-1" />}
        </div>
    );
};

const ApplicationCard = ({ app }) => {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED;
    const Icon = cfg.icon;
    const jobTitle = app.jobId?.title || 'Unknown Role';
    const company = app.jobId?.company || app.jobId?.companyName || 'Company';
    const location = app.jobId?.location || '';
    const jobId = app.jobId?._id || app.jobId;

    return (
        <div className={`bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${app.status === 'HIRED' ? 'border-emerald-200 ring-1 ring-emerald-100' : app.status === 'REJECTED' ? 'border-red-100' : 'border-slate-100 hover:border-blue-200'}`}>
            {/* Card Header */}
            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Company logo / icon */}
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="font-black text-slate-900 text-[15px] leading-tight truncate">{jobTitle}</h3>
                                <p className="text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 truncate">
                                    <Building2 className="w-3.5 h-3.5 shrink-0" />{company}
                                    {location && <><span className="text-slate-300">·</span><MapPin className="w-3.5 h-3.5 shrink-0" />{location}</>}
                                </p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border shrink-0 flex items-center gap-1 ${cfg.color}`}>
                                <Icon className="w-3 h-3" />{cfg.label}
                            </span>
                        </div>

                        {/* Pipeline */}
                        <PipelineBar status={app.status} />

                        {/* Meta row */}
                        <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            {app.updatedAt !== app.createdAt && (
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Updated {new Date(app.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Feedback banner */}
                {app.feedback && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-2.5">
                        <Bell className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Recruiter Feedback</p>
                            <p className="text-xs text-slate-700 font-medium leading-relaxed">{app.feedback}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Expanded: Timeline + Full AI */}
            {expanded && (
                <div className="px-5 pb-4 border-t border-slate-50 pt-4 space-y-4">
                    {app.timeline?.length > 0 && (
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Application History</p>
                            <Timeline timeline={app.timeline} />
                        </div>
                    )}
                    {app.resume && (
                        <a href={app.resume} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                            <FileText className="w-4 h-4" />
                            View Submitted CV <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex border-t border-slate-50">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                >
                    {expanded ? <><ChevronUp className="w-3.5 h-3.5" />Less</> : <><ChevronDown className="w-3.5 h-3.5" />Timeline & Details</>}
                </button>
                {jobId && (
                    <button
                        onClick={() => navigate(`/hyrego/${jobId}`)}
                        className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all border-l border-slate-100"
                    >
                        View Job <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
        </div>
    </div>
);

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const fetchApps = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const res = await axios.get('/applications/me');
            if (res.data.status === 'success') {
                setApplications(res.data.data.applications || []);
                setError(null);
            }
        } catch (err) {
            setError('Failed to fetch your applications. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchApps(); }, []);

    const filtered = applications.filter(app => {
        const matchesFilter = filter === 'ALL' || app.status === filter;
        const matchesSearch = !search ||
            (app.jobId?.title || '').toLowerCase().includes(search.toLowerCase()) ||
            (app.jobId?.company || app.jobId?.companyName || '').toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = {
        total: applications.length,
        shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
        interview: applications.filter(a => a.status === 'INTERVIEW').length,
        hired: applications.filter(a => a.status === 'HIRED').length,
        avgScore: applications.length ? Math.round(applications.reduce((s, a) => s + (a.matchingScore || 0), 0) / applications.length) : 0,
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 animate-pulse">
            <div className="h-8 w-56 bg-slate-200 rounded-xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100" />)}
            </div>
            <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-44 bg-white rounded-3xl border border-slate-100" />)}
            </div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-slate-700 font-bold mb-1">Something went wrong</p>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <button onClick={() => fetchApps()} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">Retry</button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 pb-24 space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">My Applications</h1>
                    <p className="text-slate-500 text-sm mt-1">Track every application, status update &amp; recruiter feedback in one place.</p>
                </div>
                <button onClick={() => fetchApps(true)} disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Total Applied" value={stats.total} icon={ClipboardList} color="bg-blue-50 text-blue-600" />
                <StatCard label="Shortlisted" value={stats.shortlisted} icon={Star} color="bg-amber-50 text-amber-600" />
                <StatCard label="Interviews" value={stats.interview} icon={Users} color="bg-violet-50 text-violet-600" />
                <StatCard label="Hired" value={stats.hired} icon={Award} color="bg-emerald-50 text-emerald-600" />
            </div>

            {/* Avg Match Score Banner removed */}

            {/* Filters + Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by job title or company..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {['ALL', 'APPLIED', 'SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'}`}>
                            {f === 'ALL' ? 'All' : STATUS_CONFIG[f]?.label || f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Application Cards */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-9 h-9 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">
                        {applications.length === 0 ? 'No Applications Yet' : 'No Results Found'}
                    </h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
                        {applications.length === 0
                            ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                            : 'Try adjusting your search or filter.'}
                    </p>
                    {applications.length === 0 && (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button onClick={() => navigate('/app/hyrego-jobs')}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-blue-200">
                                Browse Hyrego Jobs
                            </button>
                            <button onClick={() => navigate('/app/jobs')}
                                className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-colors">
                                Global Job Search
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                    {filtered.map(app => <ApplicationCard key={app._id} app={app} />)}
                </div>
            )}

            {/* Count */}
            {filtered.length > 0 && (
                <p className="text-center text-xs text-slate-400 font-medium">
                    Showing {filtered.length} of {applications.length} applications
                </p>
            )}
        </div>
    );
};

export default MyApplications;
