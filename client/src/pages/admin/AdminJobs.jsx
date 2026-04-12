import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { MapPin, IndianRupee, Trash2, Users, Eye, Plus, X, Briefcase, List, Building2, CheckCircle2, Clock, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import Skeleton from '../../components/ui/Skeleton';
import JobDetailsModal from '../../components/JobDetailsModal';

const AdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        salaryRange: '',
        skillsRequired: '',
        experienceRange: '',
        jobType: 'Full-time',
        responsibilities: '',
        companyName: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/admin/jobs');
            setJobs(res.data.data.jobs || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleDeleteJob = async (id) => {
        if (!confirm('Delete this job listing?')) return;
        try {
            await axios.delete(`/admin/jobs/${id}`);
            fetchJobs();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleApproveJob = async (id) => {
        try {
            await axios.patch(`/admin/jobs/${id}`, { status: 'APPROVED' });
            fetchJobs();
        } catch (err) {
            alert('Approval failed');
        }
    };

    const handleToggleSpecial = async (id, currentStatus) => {
        try {
            await axios.patch(`/admin/jobs/${id}`, { isSpecial: !currentStatus });
            fetchJobs();
        } catch (err) {
            alert('Status update failed');
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                skillsRequired: formData.skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
                responsibilities: formData.responsibilities.split('\n').map(s => s.trim()).filter(Boolean)
            };
            await axios.post('/admin/jobs', payload);
            setShowModal(false);
            setFormData({
                title: '',
                description: '',
                location: '',
                salaryRange: '',
                skillsRequired: '',
                experienceRange: '',
                jobType: 'Full-time',
                responsibilities: '',
                companyName: ''
            });
            fetchJobs();
        } catch (err) {
            console.error(err);
            alert('Creation failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 lg:space-y-8">
                <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white p-6 lg:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-14 h-14 rounded-2xl" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-1/2" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-24 rounded-xl" />
                                <Skeleton className="h-8 w-24 rounded-xl" />
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                <Skeleton className="h-4 w-32" />
                                <div className="flex gap-2">
                                    <Skeleton className="w-10 h-10 rounded-xl" />
                                    <Skeleton className="w-10 h-10 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 lg:space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-indigo-600 rounded-full" />
                    <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm whitespace-nowrap">Active Job Registry</h3>
                    <div className="flex items-center gap-2.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-lg shadow-emerald-100 animate-in zoom-in-95 duration-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                        <span className="text-[12px] font-black text-white tracking-[0.05em] uppercase">
                            {jobs.length} <span className="text-emerald-100/60 font-medium text-[10px] lowercase italic ml-0.5 tracking-normal">listings</span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search by job title..."
                        className="w-full sm:w-64 h-11 px-6 bg-slate-50 border-none rounded-2xl text-[10px] lg:text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button
                        onClick={() => setShowModal(true)}
                        className="h-11 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-xs hover:bg-indigo-700 transition"
                    >
                        <Plus className="w-4 h-4" /> Create
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                {jobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase())).map(job => (
                    <div key={job._id} className="bg-white p-6 lg:p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-start justify-between group relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rotate-45 translate-x-12 -translate-y-12" />
                        <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600">
                                    {job.title?.[0] || 'J'}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-lg lg:text-xl leading-tight uppercase line-clamp-1">{job.title}</h4>
                                    <p className="text-indigo-500 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em]">{job.companyName || job.recruiterId?.companyName || 'Organization'}</p>
                                    <div className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                        (job.status === 'APPROVED' && (job.isSpecial || job.courseId)) ? 'bg-emerald-50 text-emerald-600' : 
                                        job.status === 'CLOSED' ? 'bg-slate-50 text-slate-600' :
                                        'bg-amber-50 text-amber-600 animate-pulse'
                                    }`}>
                                        {job.status === 'CLOSED' ? 'CLOSED' : (
                                            (job.status === 'APPROVED' && (job.isSpecial || job.courseId)) ? 'APPROVED' : 'PENDING'
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 tracking-wider">
                                    <MapPin className="w-3 h-3" /> {job.location}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl text-[10px] font-black text-emerald-600 tracking-wider">
                                    <IndianRupee className="w-3 h-3" /> {job.salaryRange || 'TBD'}
                                </div>
                                {job.jobType && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-xl text-[10px] font-black text-indigo-600 tracking-wider uppercase">
                                        <Briefcase className="w-3 h-3" /> {job.jobType}
                                    </div>
                                )}
                                {job.experienceRange && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl text-[10px] font-black text-amber-600 tracking-wider uppercase">
                                        <Clock className="w-3 h-3" /> {job.experienceRange}
                                    </div>
                                )}
                                {job.courseId && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-xl text-[10px] font-black text-violet-600 tracking-wider uppercase" title="Job requires enrollment in this course">
                                        <BookOpen className="w-3 h-3" /> For Course: {job.courseId.title || 'Specific Course'}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[10px] font-bold text-slate-400 tracking-wider">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleToggleSpecial(job._id, job.isSpecial)} 
                                        className={clsx(
                                            "p-3 rounded-2xl transition-all border shrink-0",
                                            job.isSpecial 
                                                ? "bg-amber-50 text-amber-600 border-amber-100 shadow-sm" 
                                                : "bg-slate-50 text-slate-400 border-slate-100 hover:text-amber-500 hover:bg-white"
                                        )}
                                        title={job.isSpecial ? "Remove from Hyrego Jobs" : "Mark as Hyrego Job (Special)"}
                                    >
                                        <Sparkles className={clsx("w-4 h-4", job.isSpecial && "fill-current")} />
                                    </button>
                                    {job.status === 'PENDING' && (
                                        <button onClick={() => handleApproveJob(job._id)} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100/20" title="Approve Job">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <Link to={`/app/admin/applications?job=${job._id}`} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all" title="View Applicants">
                                        <Users className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => setSelectedJob({ ...job, isInternal: true })} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-slate-100/10" title="View Details">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteJob(job._id)} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                            <h2 className="text-lg font-black uppercase text-slate-900">Create New Job Listing</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateJob} className="p-6 md:p-8 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-[15px] font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Core Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Job Title</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                            <input required type="text" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Senior Backend Dev" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Organization</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                            <input required type="text" className="w-full h-11 pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} placeholder="e.g. Acme Corp" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                            <input required type="text" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="City, State, or Remote" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Salary Range</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                            <input type="text" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.salaryRange} onChange={e => setFormData({ ...formData, salaryRange: e.target.value })} placeholder="e.g. ₹ 8L - 12L" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Job Type</label>
                                        <select
                                            value={formData.jobType}
                                            onChange={e => setFormData({ ...formData, jobType: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Contract">Contract</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Experience Level</label>
                                        <select
                                            value={formData.experienceRange}
                                            onChange={e => setFormData({ ...formData, experienceRange: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                                        >
                                            <option value="Internship">Internship</option>
                                            <option value="Entry Level">Entry Level</option>
                                            <option value="Mid Level">Mid Level</option>
                                            <option value="Senior">Senior</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[15px] font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Requirements & Description</h3>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Required Skills (Comma separated)</label>
                                    <div className="relative">
                                        <List className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                        <input required type="text" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.skillsRequired} onChange={e => setFormData({ ...formData, skillsRequired: e.target.value })} placeholder="e.g. React, Node.js, Typescript" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Key Responsibilities (One per line)</label>
                                    <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all min-h-[100px]" value={formData.responsibilities} onChange={e => setFormData({ ...formData, responsibilities: e.target.value })} placeholder="e.g. Design user interfaces&#10;Develop core logic..." />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Job Description</label>
                                    <textarea required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all min-h-[140px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the responsibilities and requirements..." />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 -mx-6 md:-mx-8 px-6 md:px-8 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50">
                                    {submitting ? 'Publishing...' : 'Publish Job'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <JobDetailsModal
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
            />
        </div>
    );
};

export default AdminJobs;
