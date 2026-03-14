import { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import { Sparkles, Search, MapPin, Briefcase, DollarSign, Clock, ChevronRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobDetailsModal from '../components/JobDetailsModal';
import SkeletonJobCard from '../components/SkeletonJobCard';


// ─── Gradient palette for company avatars ────────────────────────────────────
const GRADIENTS = [
    'from-rose-400 to-pink-600',
    'from-blue-400 to-indigo-600',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600',
    'from-violet-400 to-purple-600',
    'from-cyan-400 to-blue-500',
];
const gradientFor = (str = '') =>
    GRADIENTS[str.charCodeAt(0) % GRADIENTS.length];

// ─── Single Job Card ─────────────────────────────────────────────────────────
const JobCard = ({ job, onClick }) => {
    const initial = (job.company || '?').charAt(0).toUpperCase();
    const grad = gradientFor(job.company);

    return (
        <div
            onClick={() => onClick(job)}
            className="group relative bg-white rounded-3xl border border-slate-100 p-5
                shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)]
                hover:shadow-[0_8px_32px_-6px_rgba(59,130,246,0.18)]
                hover:border-blue-200 hover:-translate-y-1
                transition-all duration-300 cursor-pointer overflow-hidden"
        >
            {/* Subtle hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/60 group-hover:to-indigo-50/40 transition-all duration-300 rounded-3xl pointer-events-none" />

            {/* Verified badge */}
            <div className="absolute top-4 right-4">
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-bold text-blue-600">
                    <Sparkles className="w-2.5 h-2.5" />
                    Verified
                </span>
            </div>

            {/* Header row */}
            <div className="flex items-start gap-3 mb-4 pr-16">
                {/* Company logo / avatar */}
                <div className="shrink-0">
                    {job.logo ? (
                        <div className="w-12 h-12 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                            <img src={job.logo} alt={job.company} className="w-8 h-8 object-contain" />
                        </div>
                    ) : (
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md`}>
                            <span className="text-white font-black text-lg">{initial}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-[15px] leading-tight mb-0.5 truncate">
                        {job.title}
                    </h4>
                    <p className="text-[13px] font-semibold text-slate-500 flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 shrink-0" />
                        {job.company}
                    </p>
                </div>
            </div>

            {/* Chips row */}
            <div className="flex flex-wrap gap-2 mb-4">
                {job.location && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.location}
                    </span>
                )}
                {job.jobType && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[11px] font-semibold text-blue-600">
                        <Briefcase className="w-3 h-3" />
                        {job.jobType}
                    </span>
                )}
                {job.salary && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] font-semibold text-emerald-700">
                        <DollarSign className="w-3 h-3" />
                        {job.salary}
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Clock className="w-3 h-3" />
                    {job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : 'Recent'}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:gap-2 transition-all">
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
            </div>
        </div>
    );
};

// ─── Page ────────────────────────────────────────────────────────────────────
const SpecialJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSpecialJobs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/jobs');
            if (res.data.status === 'success') setJobs(res.data.data.jobs);
        } catch (err) {
            console.error('Failed to fetch special jobs', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSpecialJobs(); }, [fetchSpecialJobs]);

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.recruiterId?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Normalize job shape
    const normalise = (job) => ({
        ...job,
        company: job.recruiterId?.companyName || 'Verified Partner',
        logo: job.recruiterId?.logo,
        salary: job.salaryRange,
        isInternal: true
    });

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-16">

            {/* ── Hero banner ─────────────────────────────────────────────── */}
            <div className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-4 md:p-10 shadow-xl shadow-blue-200/60">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5" />
                    <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-white/5" />
                    <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-white/5" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                                <Sparkles className="w-3 h-3 fill-white" />
                                EXCLUSIVE LISTINGS
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight mb-1 md:mb-2">
                            Gradnex Job Postings
                        </h1>
                        <p className="hidden md:block text-blue-100 font-medium text-sm md:text-base max-w-md">
                            Verified opportunities directly from our trusted recruitment partners — curated just for you.
                        </p>
                    </div>

                    {!loading && (
                        <div className="hidden md:flex shrink-0 items-center gap-4">
                            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
                                <p className="text-3xl font-black text-white">{jobs.length}</p>
                                <p className="text-blue-100 text-xs font-semibold mt-0.5">Open Roles</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Search bar ──────────────────────────────────────────────── */}
            <div className="mb-7 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search by title, company, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5
                        text-sm font-medium placeholder:text-slate-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                        shadow-sm transition-all"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl leading-none"
                    >×</button>
                )}
            </div>

            {/* ── Content ─────────────────────────────────────────────────── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonJobCard key={i} />)}
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Sparkles className="w-9 h-9 text-blue-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">
                        {searchTerm ? 'No matching jobs found' : 'No jobs posted yet'}
                    </h3>
                    <p className="text-slate-500 max-w-xs text-sm font-medium mb-6">
                        {searchTerm
                            ? `No results for "${searchTerm}". Try a different keyword.`
                            : 'Check back soon — our partners post new roles regularly.'}
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
                    {/* Result count */}
                    {searchTerm && (
                        <p className="text-sm text-slate-500 font-medium mb-4">
                            Showing <span className="font-bold text-slate-800">{filteredJobs.length}</span> result{filteredJobs.length !== 1 ? 's' : ''} for "<span className="text-blue-500">{searchTerm}</span>"
                        </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredJobs.map(job => (
                            <JobCard
                                key={job._id}
                                job={normalise(job)}
                                onClick={setSelectedJob}
                            />
                        ))}
                    </div>
                </>
            )}

            <JobDetailsModal
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
            />
        </div>
    );
};

export default SpecialJobs;
