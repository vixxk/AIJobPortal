import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { MapPin, Clock, DollarSign, Trash2, Edit2, Plus, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        jobType: 'Full-time'
    });
    const [submitting, setSubmitting] = useState(false);

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

    const handleCreateJob = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                skillsRequired: formData.skillsRequired.split(',').map(s => s.trim()).filter(Boolean)
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
                jobType: 'Full-time'
            });
            fetchJobs();
        } catch (err) {
            console.error(err);
            alert('Creation failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

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
                                    <p className="text-indigo-500 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em]">{job.location}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 tracking-wider">
                                    <MapPin className="w-3 h-3" /> {job.location}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl text-[9px] lg:text-[10px] font-black text-emerald-600 tracking-wider">
                                    <DollarSign className="w-3 h-3" /> {job.salaryRange || 'TBD'}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[10px] font-bold text-slate-400 tracking-wider">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                <div className="flex gap-2">
                                    <Link to={`/admin/applications?job=${job._id}`} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all" title="View Applicants">
                                        <Users className="w-4 h-4" />
                                    </Link>
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
                        <form onSubmit={handleCreateJob} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Job Title</label>
                                <input required type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Senior Software Engineer" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Location</label>
                                <input required type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Remote, New York" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Salary Range</label>
                                    <input type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} placeholder="e.g. $100k - $120k" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Experience</label>
                                    <input type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" value={formData.experienceRange} onChange={e => setFormData({...formData, experienceRange: e.target.value})} placeholder="e.g. 3-5 years" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Skills Required</label>
                                <input required type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" value={formData.skillsRequired} onChange={e => setFormData({...formData, skillsRequired: e.target.value})} placeholder="e.g. React, Node.js, MongoDB (comma separated)" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Description</label>
                                <textarea required className="w-full p-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm min-h-[120px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Job description..." />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 h-12 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-6 h-12 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0">
                                    {submitting ? 'Creating...' : 'Create Job'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminJobs;
