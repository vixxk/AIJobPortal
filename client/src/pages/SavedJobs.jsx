import { useState, useEffect, useCallback } from 'react';
import { Bookmark, MapPin, Briefcase, DollarSign, Clock, ChevronRight, Search, Building2, Trash2 } from 'lucide-react';
import axios from '../utils/axios';
import JobDetailsModal from '../components/JobDetailsModal';
import SkeletonJobCard from '../components/SkeletonJobCard';

// ─── Gradient palette for company avatars ─────────────────────────────────────
const GRADIENTS = [
    'from-blue-400 to-indigo-600',
    'from-violet-400 to-purple-600',
    'from-cyan-400 to-blue-500',
    'from-emerald-400 to-teal-600',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-600',
];
const gradientFor = (str = '') => GRADIENTS[str.charCodeAt(0) % GRADIENTS.length];

// ─── Job Card ─────────────────────────────────────────────────────────────────
const JobCard = ({ job, onClick, onUnsave }) => {
    const [removing, setRemoving] = useState(false);
    const initial = (job.company || '?').charAt(0).toUpperCase();
    const grad = gradientFor(job.company);

    const handleUnsave = async (e) => {
        e.stopPropagation();
        setRemoving(true);
        try {
            const jobId = job.link || `${job.title}-${job.company}`.replace(/\s+/g, '-').toLowerCase();
            await axios.delete('/jobs/unsave', { data: { jobId } });
            onUnsave(jobId);
        } catch (err) {
            console.error('Failed to unsave job', err);
            setRemoving(false);
        }
    };

    return (
        <div
            onClick={() => onClick(job)}
            className={`group relative bg-white rounded-3xl border border-slate-100 p-5
                shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)]
                hover:shadow-[0_8px_32px_-6px_rgba(59,130,246,0.18)]
                hover:border-blue-200 hover:-translate-y-1
                transition-all duration-300 cursor-pointer overflow-hidden
                ${removing ? 'opacity-50 scale-95 pointer-events-none' : ''}`}
        >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/60 group-hover:to-indigo-50/40 transition-all duration-300 rounded-3xl pointer-events-none" />

            {/* Unsave button */}
            <button
                onClick={handleUnsave}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-500 hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                title="Remove from saved"
            >
                <Bookmark className="w-3.5 h-3.5" strokeWidth={2.5} fill="currentColor" />
            </button>

            {/* Header row */}
            <div className="flex items-start gap-3 mb-4 pr-10">
                {job.logo ? (
                    <div className="w-12 h-12 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                        <img
                            src={job.logo}
                            alt={job.company}
                            className="w-8 h-8 object-contain"
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                        />
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} items-center justify-center hidden`}>
                            <span className="text-white font-black text-lg">{initial}</span>
                        </div>
                    </div>
                ) : (
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md shrink-0`}>
                        <span className="text-white font-black text-lg">{initial}</span>
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-[15px] leading-tight mb-0.5 truncate">
                        {job.title}
                    </h4>
                    <p className="text-[13px] font-semibold text-slate-500 flex items-center gap-1.5 truncate">
                        <Building2 className="w-3 h-3 shrink-0" />
                        {job.company}
                    </p>
                </div>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
                {job.location && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.location.length > 18 ? job.location.slice(0, 18) + '…' : job.location}
                    </span>
                )}
                <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[11px] font-semibold text-blue-600">
                    <Briefcase className="w-3 h-3" />
                    {job.type === 'internship' ? 'Internship' : job.type === 'contract' ? 'Contract' : 'Full-time'}
                </span>
                {job.salary && job.salary !== 'Not specified' && job.salary !== 'Salary Undisclosed' && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] font-semibold text-emerald-700">
                        <DollarSign className="w-3 h-3" />
                        {job.salary}
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Bookmark className="w-3 h-3" fill="currentColor" />
                    Saved
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:gap-2 transition-all">
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
            </div>
        </div>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const SavedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSavedJobs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get('/jobs/saved');
            setJobs(res.data.jobs || []);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch saved jobs.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSavedJobs(); }, [fetchSavedJobs]);

    const handleUnsave = (jobId) => {
        setJobs(prev => prev.filter(job => {
            const jId = job.link || `${job.title}-${job.company}`.replace(/\s+/g, '-').toLowerCase();
            return jId !== jobId;
        }));
    };

    const handleToggleSave = (jobId, isSaved) => {
        if (!isSaved) handleUnsave(jobId);
    };

    const filtered = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-16">

            {/* ── Hero Banner ──────────────────────────────────────────────── */}
            <div className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-4 md:p-10 shadow-xl shadow-blue-200/60">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5" />
                    <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-white/5" />
                    <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-white/5" />
                </div>
                {/* Decorative icon */}
                <Bookmark className="absolute bottom-2 right-8 w-36 h-36 text-white/20 -rotate-6 pointer-events-none" fill="currentColor" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                                <Bookmark className="w-3 h-3 fill-white" />
                                YOUR BOOKMARKS
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight mb-1 md:mb-2">
                            Saved Jobs
                        </h1>
                        <p className="hidden md:block text-blue-100 font-medium text-sm md:text-base max-w-md">
                            All the opportunities you've bookmarked — review, compare, and apply at your own pace.
                        </p>
                    </div>

                    {!loading && (
                        <div className="hidden md:flex shrink-0 items-center gap-3">
                            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
                                <p className="text-3xl font-black text-white">{jobs.length}</p>
                                <p className="text-blue-100 text-xs font-semibold mt-0.5">Saved Jobs</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Search bar ───────────────────────────────────────────────── */}
            <div className="mb-7 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search saved jobs by title, company, or location..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-10 py-3.5 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm transition-all"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl leading-none"
                    >×</button>
                )}
            </div>

            {/* ── Content ──────────────────────────────────────────────────── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonJobCard key={i} />)}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-red-500 font-semibold">{error}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Bookmark className="w-9 h-9 text-blue-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">
                        {searchTerm ? 'No matching saved jobs' : 'No saved jobs yet'}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium max-w-xs mb-5">
                        {searchTerm
                            ? `No saved jobs match "${searchTerm}". Try a different keyword.`
                            : 'Browse jobs and click the bookmark icon to save them here.'}
                    </p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-200"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {searchTerm && (
                        <p className="text-sm text-slate-500 font-medium mb-4">
                            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of <span className="font-bold text-slate-800">{jobs.length}</span> saved jobs matching "<span className="text-blue-500">{searchTerm}</span>"
                        </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(job => {
                            const jobId = job.link || `${job.title}-${job.company}`.replace(/\s+/g, '-').toLowerCase();
                            return (
                                <JobCard
                                    key={jobId}
                                    job={job}
                                    onClick={setSelectedJob}
                                    onUnsave={handleUnsave}
                                />
                            );
                        })}
                    </div>
                </>
            )}

            <JobDetailsModal
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
                initiallySaved={true}
                onToggleSave={handleToggleSave}
            />
        </div>
    );
};

export default SavedJobs;
