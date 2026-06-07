import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { Briefcase, MapPin, Calendar, Clock, Trash2, Edit3, ArrowRight, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const RecruiterDrafts = () => {
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDrafts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/jobs/me');
            if (res.data.status === 'success') {
                const data = res.data.data;
                const allJobs = Array.isArray(data) ? data : (data.jobs || []);
                const draftJobs = allJobs.filter(job => job.status === 'DRAFT');
                setDrafts(draftJobs);
            }
        } catch (err) {
            console.error('Failed to fetch drafts', err);
            toast.error('Failed to load your drafts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDrafts();
    }, [fetchDrafts]);

    const handleDeleteDraft = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) return;
        try {
            const res = await axios.delete(`/jobs/${id}`);
            if (res.status === 204 || res.data?.status === 'success') {
                toast.success('Draft deleted successfully');
                fetchDrafts();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete draft');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-20 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                        <FileText className="w-8 h-8 text-indigo-650" />
                        My Drafts
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">Continue editing or delete your saved drafts.</p>
                </div>
            </div>

            {/* Drafts List */}
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
                                    <div className="h-10 w-24 bg-slate-100 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    ) : drafts.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[30px] flex items-center justify-center mb-6">
                                <FileText className="w-10 h-10 text-slate-305" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase">No Drafts Found</h3>
                            <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">You don't have any job or internship drafts yet. Head to "Post a Job" and save as draft.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {drafts.map((job) => (
                                <div 
                                    key={job._id} 
                                    onClick={() => navigate(`/app/recruiter/post-job?draftId=${job._id}`)}
                                    className="group p-6 lg:p-8 hover:bg-slate-50/70 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer border-l-4 border-transparent hover:border-indigo-650"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            {job.opportunityType && (
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${job.opportunityType === 'Internship' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {job.opportunityType}
                                                </span>
                                            )}
                                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-650 transition-colors truncate">{job.title || 'Untitled Draft'}</h4>
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                                                DRAFT
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            {job.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {job.location}
                                                </div>
                                            )}
                                            {job.workMode && (
                                                <div className="flex items-center gap-1.5 text-violet-500">
                                                    {job.workMode}
                                                </div>
                                            )}
                                            {job.workSchedule && (
                                                <div className="flex items-center gap-1.5 text-sky-500">
                                                    {job.workSchedule}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                Saved {new Date(job.updatedAt || job.createdAt).toLocaleDateString()}
                                            </div>
                                            {job.salaryRange && (
                                                <div className="flex items-center gap-1.5 text-indigo-500">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    {job.salaryRange}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            onClick={(e) => handleDeleteDraft(e, job._id)}
                                            className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-slate-100 hover:border-rose-100"
                                            title="Delete Draft"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="px-5 py-3 bg-indigo-600 group-hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2">
                                            <Edit3 className="w-4 h-4" />
                                            CONTINUE EDITING
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecruiterDrafts;
