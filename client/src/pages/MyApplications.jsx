import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Briefcase, MapPin, Search } from 'lucide-react';
import JobDetailsModal from '../components/JobDetailsModal';

const MyApplications = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                // Assuming a generic student applications endpoint
                const res = await axios.get('/applications/student');
                if (res.data.success) {
                    setApplications(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch applications", error);
                setError("Failed to fetch your applications. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPLIED': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'SHORTLISTED': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'ACCEPTED': return 'bg-green-50 text-green-600 border-green-200';
            case 'REJECTED': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Loading your applications...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">!</span>
                </div>
                <p className="text-slate-700 font-medium mb-2">Oops!</p>
                <p className="text-slate-500">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">

            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-indigo-700" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">My Applications</h1>
                    <p className="text-slate-500 mt-1">Track the status of roles you have applied for.</p>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Applications Found</h3>
                    <p className="text-slate-500 mb-6 max-w-sm">You haven't applied to any positions yet. Head over to the Job Search page to find your next role.</p>
                    <a href="/app/jobs" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm">
                        Find Jobs
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {applications.map((app) => (
                        <div key={app._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedJob(app.job)}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl border border-slate-100 flex items-center justify-center p-2 bg-slate-50 shrink-0">
                                        {app.job?.recruiter?.recruiterProfile?.logo ? (
                                            <img src={app.job.recruiter.recruiterProfile.logo} className="w-full h-full object-contain" alt="Logo" />
                                        ) : (
                                            <Briefcase className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="pr-4">
                                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{app.job?.title || 'Unknown Role'}</h4>
                                        <p className="text-sm font-medium text-slate-500">{app.job?.recruiter?.companyName || 'Company'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 my-4" />

                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                                    {app.status}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                    <MapPin className="w-3.5 h-3.5" /> {app.job?.location || 'Location'}
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between text-[11px] text-slate-400 font-medium">
                                <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                                <span>Updated: {new Date(app.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        </div>
    );
};

export default MyApplications;
