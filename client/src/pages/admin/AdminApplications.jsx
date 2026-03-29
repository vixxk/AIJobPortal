import { useState, useEffect, useCallback } from 'react';
import { Eye } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from '../../utils/axios';
import clsx from 'clsx';
import Skeleton from '../../components/ui/Skeleton';
import JobDetailsModal from '../../components/JobDetailsModal';
import AIInterviewSetupModal from '../../components/interview/AIInterviewSetupModal';
import { Sparkles } from 'lucide-react';

const AdminApplications = () => {
    const { search } = useLocation();
    const jobIdFilter = new URLSearchParams(search).get('job');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedAppForInterview, setSelectedAppForInterview] = useState(null);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/admin/applications');
            setApplications(res.data.data.applications || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const TableSkeleton = () => (
        <div className="bg-white rounded-[32px] lg:rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-6 lg:p-8 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </div>
            <div className="p-6 lg:p-8 space-y-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex justify-between items-center gap-4">
                        <div className="flex gap-4 items-center flex-1">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-2 w-1/2" />
                            </div>
                        </div>
                        <div className="hidden sm:block flex-1">
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="hidden md:block w-24">
                            <Skeleton className="h-3 w-full" />
                        </div>
                        <Skeleton className="h-7 w-20 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );

    if (loading) return <TableSkeleton />;

    const filteredApplications = applications.filter(app => {
        if (jobIdFilter) return app.jobId?._id === jobIdFilter || app.jobId === jobIdFilter;
        return true;
    });

    return (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-indigo-600 rounded-full" />
                    <h3 className="font-black text-slate-900 tracking-tighter uppercase text-[10px] lg:text-sm">
                        {jobIdFilter ? `Applications for Job ID: ${jobIdFilter}` : 'Global Application Ledger'}
                    </h3>
                    <div className="flex items-center gap-2.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-100 animate-in zoom-in-95 duration-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                        <span className="text-[12px] font-black text-white tracking-[0.05em] uppercase">
                            {filteredApplications.length} <span className="text-blue-100/60 font-medium text-[10px] lowercase italic ml-0.5 tracking-normal">records</span>
                        </span>
                    </div>
                </div>
                {jobIdFilter && (
                    <a href="/admin/applications" className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50">Clear Filter</a>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-wider lg:tracking-[0.2em]">
                        <tr>
                            <th className="p-6 lg:p-8">STUDENT</th>
                            <th className="p-6 lg:p-8 hidden sm:table-cell">JOB POSITION</th>
                            <th className="p-6 lg:p-8 hidden md:table-cell">DATE</th>
                            <th className="p-6 lg:p-8 text-right">STATUS</th>
                            <th className="p-6 lg:p-8 text-right">AI INTERVIEW</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredApplications.map(app => (
                            <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-6 lg:p-8">
                                    <div className="flex items-center gap-3 lg:gap-4">
                                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">{app.studentId?.name?.[0]}</div>
                                        <div className="min-w-0">
                                            <p className="font-black text-slate-900 text-[11px] lg:text-sm truncate uppercase">{app.studentId?.name}</p>
                                            <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold truncate max-w-[100px] lg:max-w-none">{app.studentId?.email}</p>
                                            <p
                                                className="sm:hidden text-[9px] text-indigo-500 font-black mt-0.5 truncate flex items-center gap-1 cursor-pointer group/item"
                                                onClick={() => setSelectedJob({ ...app.jobId, isInternal: true })}
                                            >
                                                {app.jobId?.title}
                                                <Eye className="w-3 h-3 group-hover/item:scale-110 transition-transform" />
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 lg:p-8 font-black text-slate-900 text-sm hidden sm:table-cell">
                                    <div 
                                        className="flex items-center gap-2 cursor-pointer group/job hover:text-indigo-600 transition-colors"
                                        onClick={() => setSelectedJob({ ...app.jobId, isInternal: true })}
                                    >
                                        <span className="truncate max-w-[150px] lg:max-w-[250px]">
                                            {app.jobId?.title}
                                        </span>
                                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center group-hover/job:bg-indigo-50 group-hover/job:text-indigo-600 text-slate-400 border border-slate-100 group-hover/job:border-indigo-100 transition-all">
                                            <Eye className="w-4 h-4" />
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 lg:p-8 text-[11px] font-bold text-slate-400 hidden md:table-cell">
                                    {new Date(app.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-6 lg:p-8 text-right">
                                    <span className={clsx(
                                        "px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-[8px] lg:text-[10px] font-black tracking-widest uppercase border",
                                        app.status === 'ACCEPTED' || app.status === 'HIRED' || app.status === 'SHORTLISTED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            app.status === 'REJECTED' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="p-6 lg:p-8 text-right">
                                    <button
                                        onClick={() => setSelectedAppForInterview(app)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 transition-colors"
                                    >
                                        <Sparkles className="w-3 h-3" /> View Data
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <JobDetailsModal
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
                hideActions={true}
            />
            {selectedAppForInterview && (
                <AIInterviewSetupModal
                    isOpen={!!selectedAppForInterview}
                    onClose={() => setSelectedAppForInterview(null)}
                    application={selectedAppForInterview}
                    job={selectedAppForInterview.jobId}
                />
            )}
        </div>
    );
};

export default AdminApplications;
