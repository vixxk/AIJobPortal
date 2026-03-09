import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { MapPin, Clock, DollarSign, Trash2, Edit2 } from 'lucide-react';

const AdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    if (loading) return null;

    return (
        <div className="space-y-4 lg:space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-slate-100 shadow-sm flex items-center">
                <input
                    type="text"
                    placeholder="Search by job title..."
                    className="w-full max-w-sm h-11 px-4 bg-slate-50 border-none rounded-xl text-[10px] lg:text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                {jobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase())).map(job => (
                    <div key={job._id} className="bg-white p-6 lg:p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-start justify-between group relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rotate-45 translate-x-12 -translate-y-12" />
                        <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600">
                                    {job.companyName[0]}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-lg lg:text-xl leading-tight uppercase line-clamp-1">{job.title}</h4>
                                    <p className="text-indigo-500 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em]">{job.companyName}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 tracking-wider">
                                    <MapPin className="w-3 h-3" /> {job.location}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 tracking-wider">
                                    <Clock className="w-3 h-3" /> {job.jobType}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl text-[9px] lg:text-[10px] font-black text-emerald-600 tracking-wider">
                                    <DollarSign className="w-3 h-3" /> {job.salary?.min ? (window.innerWidth < 640 ? `$${job.salary.min}k+` : `$${job.salary.min}k - $${job.salary.max}k`) : 'TBD'}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 tracking-wider">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                <div className="flex gap-2">
                                    <button className="p-3 bg-slate-50 text-slate-900 rounded-2xl hover:bg-slate-100 transition-all">
                                        <Edit2 className="w-4 h-4" />
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
        </div>
    );
};

export default AdminJobs;
