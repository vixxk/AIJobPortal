import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { MapPin, IndianRupee, Trash2, Users, Eye, Plus, X, Briefcase, List, Building2, CheckCircle2, Clock, Sparkles, BookOpen, Globe, Monitor, Calendar, Timer, Image, Link2, Lock, Unlock, Pencil } from 'lucide-react';
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
        companyName: '',
        eligibilityCriteria: '',
        workMode: 'Onsite',
        duration: '',
        applicationDeadline: '',
        startDate: '',
        aboutCompany: '',
        companyWebsite: '',
        applyLink: '',
        applyLinkVisibility: 'internal'
    });
    const [companyLogoFile, setCompanyLogoFile] = useState(null);
    const [companyBannerFile, setCompanyBannerFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [editingJob, setEditingJob] = useState(null);

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

    const handleEditJob = (job) => {
        setEditingJob(job);
        setFormData({
            title: job.title || '',
            description: job.description || '',
            location: job.location || '',
            salaryRange: job.salaryRange || '',
            skillsRequired: (job.skillsRequired || []).join(', '),
            experienceRange: job.experienceRange || '',
            jobType: job.jobType || 'Full-time',
            responsibilities: (job.responsibilities || []).join('\n'),
            companyName: job.companyName || '',
            eligibilityCriteria: (job.eligibilityCriteria || []).join('\n'),
            workMode: job.workMode || 'Onsite',
            duration: job.duration || '',
            applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
            startDate: job.startDate || '',
            aboutCompany: job.aboutCompany || '',
            companyWebsite: job.companyWebsite || '',
            applyLink: job.applyLink || '',
            applyLinkVisibility: job.applyLinkVisibility || 'internal'
        });
        setCompanyLogoFile(null);
        setCompanyBannerFile(null);
        setLogoPreview(job.companyLogo || null);
        setBannerPreview(job.companyBanner || null);
        setShowModal(true);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCompanyLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCompanyBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setFormData({
            title: '', description: '', location: '', salaryRange: '',
            skillsRequired: '', experienceRange: '', jobType: 'Full-time',
            responsibilities: '', companyName: '', eligibilityCriteria: '',
            workMode: 'Onsite', duration: '', applicationDeadline: '',
            startDate: '', aboutCompany: '', companyWebsite: '',
            applyLink: '', applyLinkVisibility: 'internal'
        });
        setCompanyLogoFile(null);
        setCompanyBannerFile(null);
        setLogoPreview(null);
        setBannerPreview(null);
        setEditingJob(null);
    };

    const handleSubmitJob = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = new FormData();
            
            // Append text fields
            payload.append('title', formData.title);
            payload.append('description', formData.description);
            payload.append('location', formData.location);
            payload.append('salaryRange', formData.salaryRange);
            payload.append('skillsRequired', formData.skillsRequired);
            payload.append('experienceRange', formData.experienceRange);
            payload.append('jobType', formData.jobType);
            payload.append('responsibilities', formData.responsibilities);
            payload.append('companyName', formData.companyName);
            payload.append('eligibilityCriteria', formData.eligibilityCriteria);
            payload.append('workMode', formData.workMode);
            payload.append('duration', formData.duration);
            payload.append('startDate', formData.startDate);
            payload.append('aboutCompany', formData.aboutCompany);
            payload.append('companyWebsite', formData.companyWebsite);
            payload.append('applyLink', formData.applyLink);
            payload.append('applyLinkVisibility', formData.applyLinkVisibility);
            if (formData.applicationDeadline) {
                payload.append('applicationDeadline', formData.applicationDeadline);
            }
            
            // Append files
            if (companyLogoFile) {
                payload.append('companyLogo', companyLogoFile);
            }
            if (companyBannerFile) {
                payload.append('companyBanner', companyBannerFile);
            }

            if (editingJob) {
                await axios.patch(`/admin/jobs/${editingJob._id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('/admin/jobs', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowModal(false);
            resetForm();
            fetchJobs();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || (editingJob ? 'Update failed' : 'Creation failed'));
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
                        onClick={() => { resetForm(); setShowModal(true); }}
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
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 bg-white shadow-sm shrink-0">
                                    {job.companyLogo ? (
                                        <img src={job.companyLogo} alt={job.companyName} className="w-10 h-10 object-contain" />
                                    ) : (
                                        <span className="font-black text-indigo-600 text-lg bg-indigo-50 w-full h-full flex items-center justify-center">{(job.title || 'J')[0]}</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-lg lg:text-xl leading-tight uppercase line-clamp-1">{job.title}</h4>
                                    <p className="text-indigo-500 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em]">{job.companyName || job.recruiterId?.companyName || 'Organization'}</p>
                                    <div className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${(job.status === 'APPROVED' && (job.isSpecial || job.courseId)) ? 'bg-emerald-50 text-emerald-600' :
                                            job.status === 'CLOSED' ? 'bg-slate-50 text-slate-600' :
                                                'bg-amber-50 text-amber-600 animate-pulse'
                                        }`}>
                                        {job.status === 'CLOSED' ? 'CLOSED' : (
                                            (job.status === 'APPROVED' && (job.isSpecial || job.courseId)) ? 'APPROVED' : 'PENDING'
                                        )}
                                    </div>
                                    {job.applyLinkVisibility && (
                                        <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${job.applyLinkVisibility === 'public' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {job.applyLinkVisibility === 'public' ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                                            {job.applyLinkVisibility === 'public' ? 'Public Apply' : 'Login Required'}
                                        </span>
                                    )}
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
                                {job.workMode && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-xl text-[10px] font-black text-violet-600 tracking-wider uppercase">
                                        <Monitor className="w-3 h-3" /> {job.workMode}
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
                                    <button onClick={() => handleEditJob(job)} className="p-3 bg-blue-50 text-blue-500 hover:text-blue-700 rounded-2xl hover:bg-blue-100 transition-all border border-blue-100/20" title="Edit Job">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <a href={`/hyrego/${job._id}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-slate-100/10" title="View Public Page">
                                        <Eye className="w-4 h-4" />
                                    </a>
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
                    <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 rounded-t-[32px]">
                            <h2 className="text-lg font-black uppercase text-slate-900">{editingJob ? 'Edit Job Listing' : 'Create Hyrego Job Listing'}</h2>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitJob} className="p-6 md:p-8 space-y-6">
                            {/* Company Branding */}
                            <div className="space-y-4">
                                <h3 className="text-[15px] font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                    <Image className="w-4 h-4 text-blue-500" />
                                    Company Branding
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">Company Logo</label>
                                        <div className="flex items-center gap-3">
                                            {logoPreview && (
                                                <img src={logoPreview} alt="Logo preview" className="w-12 h-12 rounded-xl object-contain border border-slate-200" />
                                            )}
                                            <label className="flex-1 cursor-pointer">
                                                <div className="px-4 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                                                    <p className="text-xs font-semibold text-slate-500">{companyLogoFile ? companyLogoFile.name : 'Click to upload logo'}</p>
                                                </div>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">Company Banner</label>
                                        <div className="space-y-2">
                                            {bannerPreview && (
                                                <img src={bannerPreview} alt="Banner preview" className="w-full h-20 rounded-xl object-cover border border-slate-200" />
                                            )}
                                            <label className="block cursor-pointer">
                                                <div className="px-4 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                                                    <p className="text-xs font-semibold text-slate-500">{companyBannerFile ? companyBannerFile.name : 'Click to upload banner'}</p>
                                                </div>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Core Details */}
                            <div className="space-y-4">
                                <h3 className="text-[15px] font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Core Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Job Title *</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                            <input required type="text" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Cyber Threat Analyst" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Organization *</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                            <input required type="text" className="w-full h-11 pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} placeholder="e.g. TCIL" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Location *</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                            <input required type="text" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="New Delhi, India" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Salary Range</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                            <input type="text" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.salaryRange} onChange={e => setFormData({ ...formData, salaryRange: e.target.value })} placeholder="e.g. ₹6-8 LPA" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                        <label className="block text-sm font-semibold text-slate-700">Experience</label>
                                        <select
                                            value={formData.experienceRange}
                                            onChange={e => setFormData({ ...formData, experienceRange: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                                        >
                                            <option value="">Select...</option>
                                            <option value="Fresher">Fresher</option>
                                            <option value="0-1 Years">0-1 Years</option>
                                            <option value="1-3 Years">1-3 Years</option>
                                            <option value="3-5 Years">3-5 Years</option>
                                            <option value="5+ Years">5+ Years</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Work Mode</label>
                                        <select
                                            value={formData.workMode}
                                            onChange={e => setFormData({ ...formData, workMode: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                                        >
                                            <option value="Onsite">Onsite</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Duration</label>
                                        <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. Full-Time" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Application Deadline</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                            <input type="date" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.applicationDeadline} onChange={e => setFormData({ ...formData, applicationDeadline: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Start Date</label>
                                        <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} placeholder="e.g. Immediate" />
                                    </div>
                                </div>
                            </div>

                            {/* Requirements & Description */}
                            <div className="space-y-4">
                                <h3 className="text-[15px] font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Requirements & Description</h3>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Required Skills (Comma separated) *</label>
                                    <div className="relative">
                                        <List className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                        <input required type="text" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.skillsRequired} onChange={e => setFormData({ ...formData, skillsRequired: e.target.value })} placeholder="e.g. Cybersecurity, Network Security, Python" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Key Responsibilities (One per line)</label>
                                    <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all min-h-[100px]" value={formData.responsibilities} onChange={e => setFormData({ ...formData, responsibilities: e.target.value })} placeholder={"Monitor security alerts and incidents\nAnalyse threats and vulnerabilities\nPrepare detailed reports"} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Eligibility Criteria (One per line)</label>
                                    <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all min-h-[100px]" value={formData.eligibilityCriteria} onChange={e => setFormData({ ...formData, eligibilityCriteria: e.target.value })} placeholder={"B.Tech / BCA / MCA\nExperience in cybersecurity\nKnowledge of security tools"} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Job Description / Overview *</label>
                                    <textarea required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all min-h-[140px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed job overview..." />
                                </div>
                            </div>

                            {/* About Company */}
                            <div className="space-y-4">
                                <h3 className="text-[15px] font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-blue-500" />
                                    About the Company
                                </h3>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Company Description</label>
                                    <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all min-h-[80px]" value={formData.aboutCompany} onChange={e => setFormData({ ...formData, aboutCompany: e.target.value })} placeholder="Brief about the company..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Company Website</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                        <input type="text" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.companyWebsite} onChange={e => setFormData({ ...formData, companyWebsite: e.target.value })} placeholder="https://company.com" />
                                    </div>
                                </div>
                            </div>

                            {/* Apply Settings */}
                            <div className="space-y-4">
                                <h3 className="text-[15px] font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                    <Link2 className="w-4 h-4 text-blue-500" />
                                    Application Settings
                                </h3>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">External Apply Link (Optional)</label>
                                    <div className="relative">
                                        <Link2 className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                        <input type="text" className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" value={formData.applyLink} onChange={e => setFormData({ ...formData, applyLink: e.target.value })} placeholder="https://career.company.com/apply" />
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium ml-1">If provided, the Apply button will redirect to this link. Otherwise, students apply directly on platform.</p>
                                </div>

                                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                {formData.applyLinkVisibility === 'public' ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-amber-500" />}
                                                Apply Button Visibility
                                            </p>
                                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                                                {formData.applyLinkVisibility === 'public'
                                                    ? 'Anyone can see and use the apply button without logging in.'
                                                    : 'Only registered & logged-in users can see the apply button.'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, applyLinkVisibility: 'internal' })}
                                                className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${formData.applyLinkVisibility === 'internal' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200'}`}
                                            >
                                                Login Required
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, applyLinkVisibility: 'public' })}
                                                className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${formData.applyLinkVisibility === 'public' ? 'bg-green-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200'}`}
                                            >
                                                Public
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 -mx-6 md:-mx-8 px-6 md:px-8 mt-6">
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50">
                                    {submitting ? (editingJob ? 'Updating...' : 'Publishing...') : (editingJob ? 'Update Job' : 'Publish Hyrego Job')}
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
