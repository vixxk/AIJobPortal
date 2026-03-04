import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Users, PlusCircle, Calendar, Eye, MapPin } from 'lucide-react';
import JobDetailsModal from '../components/JobDetailsModal';

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0 });
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // In a real app, this would be a specific recruiter stats endpoint
                // For now, we fetch the jobs posted by this recruiter
                const res = await axios.get('/jobs/me');
                if (res.data.success) {
                    const jobs = res.data.data;
                    setRecentJobs(jobs);

                    // Mock stats based on fetched jobs
                    let applicants = 0;
                    jobs.forEach(job => applicants += Math.floor(Math.random() * 20)); // Fake applicant count for look

                    setStats({
                        activeJobs: jobs.filter(j => j.status === 'open').length,
                        totalApplicants: applicants
                    });
                }
            } catch (error) {
                console.error("Failed to fetch recruiter data", error);
                setError("Failed to fetch recruiter data. Please check your network connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const name = user?.name || "Recruiter";
    const firstName = name.split(' ')[0];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {firstName}</h1>
                    <p className="text-slate-500 mt-1">Here is what is happening with your job listings today.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/app/recruiter/post-job" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        Post New Job
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Active Listings</p>
                        <h3 className="text-3xl font-bold text-slate-900">{loading ? '-' : stats.activeJobs}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Applicants</p>
                        <h3 className="text-3xl font-bold text-slate-900">{loading ? '-' : stats.totalApplicants}</h3>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 rounded-2xl border border-slate-800 shadow-lg text-white relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute opacity-10 right-[-10%] top-[-10%]">
                        <Briefcase className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2">Need Top Talent?</h3>
                        <p className="text-slate-300 text-sm mb-4 max-w-[80%]">Promote your listings to reach vetted students instantly.</p>
                        <button className="text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
                            Boost Listings
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Postings List */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800">Your Recent Listings</h2>
                    <Link to="/app/recruiter" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading your jobs...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 font-medium bg-red-50 rounded-lg mx-6">{error}</div>
                ) : recentJobs.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">No Jobs Posted Yet</h3>
                        <p className="text-slate-500 max-w-sm mb-6">Create your first job listing to start receiving applications from top students.</p>
                        <Link to="/app/recruiter/post-job" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">Post a Job</Link>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {recentJobs.slice(0, 5).map((job) => (
                            <div key={job._id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="text-base font-bold text-slate-900">{job.title}</h4>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            Posted {new Date(job.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => setSelectedJob(job)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent"
                                        title="View Details"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <Link
                                        to={`/app/recruiter/manage/${job._id}`}
                                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors bg-white shadow-sm"
                                    >
                                        Manage Applicants
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        </div>
    );
};

export default RecruiterDashboard;
