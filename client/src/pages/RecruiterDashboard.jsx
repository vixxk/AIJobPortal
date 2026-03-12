import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Users, PlusCircle, Calendar, Eye, MapPin, Trophy, GraduationCap } from 'lucide-react';
import JobDetailsModal from '../components/JobDetailsModal';
import clsx from 'clsx';
const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:border-slate-300">
        <div className={`w-14 h-14 rounded-2xl ${color.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-6 h-6 ${color.text}`} />
        </div>
        <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{title}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {loading ? <div className="h-8 w-12 bg-slate-100 animate-pulse rounded-md" /> : value}
            </h3>
        </div>
    </div>
);

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0 });
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [statsRes, jobsRes] = await Promise.all([
                    axios.get('/jobs/stats'),
                    axios.get('/jobs/me')
                ]);

                if (statsRes.data.status === 'success') {
                    setStats(statsRes.data.data);
                }

                if (jobsRes.data.status === 'success') {
                    // Normalize data structure if needed
                    const jobsData = jobsRes.data.data;
                    setRecentJobs(Array.isArray(jobsData) ? jobsData : (jobsData.jobs || []));
                }
            } catch (error) {
                console.error("Failed to fetch recruiter data", error);
                setError("Unable to sync dashboard data. Check your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const firstName = (user?.name || "Recruiter").split(' ')[0];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Hello, {firstName}! 👋
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Your talent pipeline is looking <span className="text-indigo-600 font-bold">active</span> today.
                    </p>
                </div>
                <Link 
                    to="/app/recruiter/post-job" 
                    className="group bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    CREATE NEW LISTING
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Active Listings" 
                    value={stats.activeJobs} 
                    icon={Briefcase} 
                    loading={loading}
                    color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }} 
                />
                <StatCard 
                    title="Total Applicants" 
                    value={stats.totalApplicants} 
                    icon={Users} 
                    loading={loading}
                    color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
               <Link to="/app/recruiter/competitions" className="group flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all">
                   <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                           <Trophy className="w-6 h-6" />
                       </div>
                       <div>
                           <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Host Competitions</h3>
                           <p className="text-xs font-bold text-slate-500 max-w-[200px]">Organize hackathons & hire top performers.</p>
                       </div>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                       <Eye className="w-4 h-4" />
                   </div>
               </Link>

               <Link to="/app/recruiter/colleges" className="group flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                   <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                           <GraduationCap className="w-6 h-6" />
                       </div>
                       <div>
                           <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">College Connect</h3>
                           <p className="text-xs font-bold text-slate-500 max-w-[200px]">Invite placement cells directly.</p>
                       </div>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                       <Eye className="w-4 h-4" />
                   </div>
               </Link>
            </div>

            {/* Recent Jobs Table */}
            <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Recent Ecosystem Nodes</h2>
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="divide-y divide-slate-50">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-8 flex items-center justify-between gap-4 animate-pulse">
                                    <div className="flex-1 space-y-3">
                                        <div className="h-5 w-1/3 bg-slate-100 rounded-md" />
                                        <div className="h-4 w-1/4 bg-slate-50 rounded-md" />
                                    </div>
                                    <div className="h-10 w-24 bg-slate-100 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                                <Eye className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">{error}</h3>
                            <button onClick={() => window.location.reload()} className="mt-4 text-indigo-600 font-bold text-sm uppercase tracking-widest">Retry Connection</button>
                        </div>
                    ) : recentJobs.length === 0 ? (
                        <div className="p-12 sm:p-20 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center animate-bounce-slow">
                                    <PlusCircle className="w-12 h-12 text-indigo-400" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border-4 border-white shadow-lg rounded-full flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-indigo-600" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">EMPTY LISTING PROTOCOL</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-10">
                                No active job nodes detected in your dashboard. Initialize your first recruitment node to start aggregating talent profiles.
                            </p>
                            <Link 
                                to="/app/recruiter/post-job" 
                                className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                START INITIALIZATION
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {recentJobs.slice(0, 5).map((job) => (
                                <div key={job._id} className="group p-6 sm:p-8 hover:bg-slate-50/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-l-[6px] border-l-transparent hover:border-l-indigo-500">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{job.title}</h4>
                                            <span className={clsx(
                                                "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                                            )}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            {job.salaryRange && (
                                                <div className="flex items-center gap-1.5 text-indigo-500">
                                                    <span className="px-1.5 py-0.5 bg-indigo-50 rounded-md">
                                                        {job.salaryRange}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                        <button
                                            onClick={() => setSelectedJob(job)}
                                            className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-2xl transition-all border border-slate-100/10 group-hover:border-slate-200"
                                            title="View Details"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <Link
                                            to={`/app/recruiter/manage/${job._id}`}
                                            className="flex-1 sm:flex-none px-6 py-3.5 bg-white border border-slate-200 rounded-[18px] text-[11px] font-black text-slate-700 uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-[0.98] text-center"
                                        >
                                            Manage Applicants
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Modal Context */}
            <JobDetailsModal 
                job={selectedJob ? { ...selectedJob, isInternal: true } : null} 
                onClose={() => setSelectedJob(null)} 
            />
        </div>
    );
};
export default RecruiterDashboard;
