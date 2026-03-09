import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { User, Mail, Link as LinkIcon, CheckCircle, XCircle, ArrowLeft, Download } from 'lucide-react';
const ManageApplicants = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobRes = await axios.get(`/jobs/${jobId}`);
                if (jobRes.data.success) {
                    setJob(jobRes.data.data);
                }
                const appRes = await axios.get(`/applications/job/${jobId}`);
                if (appRes.data.success) {
                    setApplications(appRes.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch application data", error);
                setError("Failed to fetch application data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [jobId]);
    const updateStatus = async (appId, newStatus) => {
        setStatusUpdating(appId);
        try {
            const res = await axios.patch(`/applications/${appId}/status`, { status: newStatus });
            if (res.data.success) {
                setApplications(apps => apps.map(app =>
                    app._id === appId ? { ...app, status: newStatus } : app
                ));
            }
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Error updating application status");
        } finally {
            setStatusUpdating(null);
        }
    };
    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading applicant data...</div>;
    }
    if (error) {
        return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
    }
    if (!job) {
        return <div className="p-8 text-center text-red-500 font-medium">Job not found</div>;
    }
    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center gap-3 mb-2">
                <Link to="/app/recruiter" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Candidates for {job.title}</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{applications.length} total applications</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">No applicants yet.</h3>
                        <p className="text-slate-500 mt-1 text-sm">Applications for this role will appear here.</p>
                    </div>
                ) : (
                    applications.map((app) => (
                        <div key={app._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                                            {app.student.studentProfile?.profileImage ? (
                                                <img src={app.student.studentProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 line-clamp-1">{app.student.name}</h4>
                                            <p className="text-xs font-medium text-slate-500">{app.student.email}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${app.status === 'APPLIED' ? 'bg-blue-50 text-blue-600' :
                                        app.status === 'SHORTLISTED' ? 'bg-orange-50 text-orange-600' :
                                            app.status === 'ACCEPTED' ? 'bg-green-50 text-green-600' :
                                                'bg-red-50 text-red-600'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>
                                <div className="space-y-3 mb-4">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Top Skills</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(app.student.studentProfile?.skills || []).slice(0, 4).map((skill, i) => (
                                                <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{skill}</span>
                                            ))}
                                            {(!app.student.studentProfile?.skills || app.student.studentProfile?.skills.length === 0) && (
                                                <span className="text-[11px] text-slate-400 italic">No skills listed</span>
                                            )}
                                        </div>
                                    </div>
                                    {app.student.studentProfile?.resume && (
                                        <a href={app.student.studentProfile.resume} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-2">
                                            <Download className="w-4 h-4" /> View Resume
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                                {app.status === 'APPLIED' && (
                                    <>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => updateStatus(app._id, 'SHORTLISTED')}
                                            className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                        >
                                            Shortlist
                                        </button>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => updateStatus(app._id, 'REJECTED')}
                                            className="flex-1 py-2 bg-white border border-red-200 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {app.status === 'SHORTLISTED' && (
                                    <>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => updateStatus(app._id, 'ACCEPTED')}
                                            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Final Accept
                                        </button>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => updateStatus(app._id, 'REJECTED')}
                                            className="px-3 py-2 bg-white border border-red-200 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                {(app.status === 'ACCEPTED' || app.status === 'REJECTED') && (
                                    <div className="w-full text-center py-1.5 text-sm font-medium text-slate-400">
                                        Decision Finalized
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
export default ManageApplicants;
