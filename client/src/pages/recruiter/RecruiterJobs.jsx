import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { Briefcase, MapPin, Calendar, Eye, XCircle, Clock, Search, Filter, ChevronRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobDetailsModal from '../../components/JobDetailsModal';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

const RecruiterJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const fetchMyJobs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/jobs/me');
            if (res.data.status === 'success') {
                const data = res.data.data;
                setJobs(Array.isArray(data) ? data : (data.jobs || []));
            }
        } catch (err) {
            console.error('Failed to fetch jobs', err);
            toast.error('Failed to load your listings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyJobs();
    }, [fetchMyJobs]);

    const handleCloseJob = async (id) => {
        if (!confirm('Are you sure you want to close this job listing? It will no longer be visible to students.')) return;
        try {
            const res = await axios.patch(`/jobs/${id}/close`);
            if (res.data.status === 'success') {
                toast.success('Job listing closed');
                fetchMyJobs();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to close job');
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             job.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || job.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-20 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">My Job Listings</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage and track your recruitment nodes.</p>
                </div>
                <Link 
                    to="/app/recruiter/post-job" 
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                >
                    <PlusCircle className="w-5 h-5" />
                    CREATE NEW LISTING
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by title or location..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                    {['ALL', 'PENDING', 'APPROVED', 'CLOSED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={clsx(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                filterStatus === status 
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Jobs List */}
            <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="divide-y divide-slate-50">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-8 flex items-center gap-6 animate-pulse">
                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-5 w-1/3 bg-slate-100 rounded-md" />
                                        <div className="h-4 w-1/4 bg-slate-50 rounded-md" />
                                    </div>
                                    <div className="h-10 w-32 bg-slate-100 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[30px] flex items-center justify-center mb-6">
                                <Briefcase className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase">No Listings Found</h3>
                            <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Try adjusting your filters or create a new job listing to get started.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {filteredJobs.map((job) => (
                                <div key={job._id} className="group p-6 lg:p-8 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{job.title}</h4>
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0",
                                                job.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                job.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' : 
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            )}>
                                                {job.status || 'PENDING'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </div>
                                            {job.salaryRange && (
                                                <div className="flex items-center gap-1.5 text-indigo-500">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    {job.salaryRange}
                                                </div>
                                            )}
                                            {job.jobType && (
                                                <div className="flex items-center gap-1.5 text-emerald-600">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    {job.jobType}
                                                </div>
                                            )}
                                            {job.experienceRange && (
                                                <div className="flex items-center gap-1.5 text-amber-600">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {job.experienceRange}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                                        <button
                                            onClick={() => setSelectedJob(job)}
                                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all border border-slate-100"
                                            title="View Preview"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <Link
                                            to={`/app/recruiter/manage/${job._id}`}
                                            className="px-6 py-3 bg-white border border-slate-200 text-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                                        >
                                            Applications ({job.applicants?.length || 0})
                                        </Link>
                                        {job.status !== 'CLOSED' && (
                                            <button
                                                onClick={() => handleCloseJob(job._id)}
                                                className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Close Listing
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <JobDetailsModal 
                job={selectedJob ? { ...selectedJob, isInternal: true } : null} 
                onClose={() => setSelectedJob(null)} 
            />
        </div>
    );
};

export default RecruiterJobs;
