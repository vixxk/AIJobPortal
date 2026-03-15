import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { Globe, Trash2, Calendar, Users, Plus, Pencil, XCircle, MapPin, Award, BookOpen, Layers, Building2, BarChart3, ChevronRight, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import Skeleton from '../../components/ui/Skeleton';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const AdminCompetitions = () => {
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showModal]);

    const [form, setForm] = useState({
        title: '',
        organizer: '',
        description: '',
        category: 'Hackathon',
        mode: 'Online',
        location: '',
        startDate: '',
        endDate: '',
        deadline: '',
        rewards: '',
        rules: '',
        eligibility: '',
        avatar: null,
        preview: null,
        rounds: [{ title: '', description: '', date: '' }]
    });

    const [editingId, setEditingId] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [selectedStats, setSelectedStats] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    const fetchCompetitions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/admin/competitions');
            setCompetitions(res.data.data.competitions || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompetitions();
    }, [fetchCompetitions]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({
                ...form,
                avatar: file,
                preview: URL.createObjectURL(file)
            });
        }
    };

    const handleAddRound = () => {
        setForm({
            ...form,
            rounds: [...form.rounds, { title: '', description: '', date: '' }]
        });
    };
    const handleRemoveRound = (index) => {
        const newRounds = [...form.rounds];
        newRounds.splice(index, 1);
        setForm({ ...form, rounds: newRounds });
    };
    const handleRoundChange = (index, field, value) => {
        const newRounds = [...form.rounds];
        newRounds[index][field] = value;
        setForm({ ...form, rounds: newRounds });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (key === 'avatar') {
                    if (form.avatar) formData.append('image', form.avatar);
                } else if (key === 'rounds') {
                    formData.append('rounds', JSON.stringify(form.rounds));
                } else if (key !== 'preview') {
                    formData.append(key, form[key]);
                }
            });

            if (editingId) {
                await axios.patch(`/admin/competitions/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('/admin/competitions', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setShowModal(false);
            setEditingId(null);
            setForm({
                title: '', organizer: '', description: '', category: 'Hackathon',
                mode: 'Online', location: '', startDate: '', endDate: '',
                deadline: '', rewards: '', rules: '', eligibility: '',
                avatar: null, preview: null, rounds: [{ title: '', description: '', date: '' }]
            });
            fetchCompetitions();
            alert(editingId ? 'Competition updated!' : 'Competition created successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to process competition');
        }
    };

    const handleEditCompetition = (comp) => {
        setEditingId(comp._id);
        setForm({
            title: comp.title || '',
            organizer: comp.organizer || '',
            description: comp.description || '',
            category: comp.category || 'Hackathon',
            mode: comp.mode || 'Online',
            location: comp.location || '',
            startDate: comp.startDate ? new Date(comp.startDate).toISOString().split('T')[0] : '',
            endDate: comp.endDate ? new Date(comp.endDate).toISOString().split('T')[0] : '',
            deadline: comp.deadline ? new Date(comp.deadline).toISOString().split('T')[0] : '',
            rewards: comp.rewards || '',
            rules: comp.rules || '',
            eligibility: comp.eligibility || '',
            avatar: null,
            preview: comp.bannerImage ? getImageUrl(comp.bannerImage) : null,
            rounds: comp.rounds || [{ title: '', description: '', date: '' }]
        });
        setShowModal(true);
    };

    const handleShowAnalytics = async (id) => {
        setAnalyticsLoading(true);
        setShowAnalytics(true);
        try {
            const res = await axios.get(`/admin/competitions/${id}`);
            setSelectedStats(res.data.data.competition);
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleApproveCompetition = async (id) => {
        try {
            await axios.patch(`/admin/competitions/${id}`, { status: 'APPROVED' });
            fetchCompetitions();
            alert('Competition approved!');
        } catch (err) {
            alert('Approval failed');
        }
    };

    const handleDeleteCompetition = async (id) => {
        if (!confirm('Delete this competition?')) return;
        try {
            await axios.delete(`/admin/competitions/${id}`);
            fetchCompetitions();
        } catch (err) {
            alert('Delete failed');
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 lg:space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 lg:p-8 rounded-[32px] border border-slate-100 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32 rounded-full" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-11 w-64 rounded-2xl" />
                        <Skeleton className="h-11 w-48 rounded-2xl" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col lg:flex-row overflow-hidden">
                            <Skeleton className="w-full lg:w-48 h-48 md:h-56 lg:h-auto shrink-0" />
                            <div className="p-8 flex-1 space-y-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <Skeleton className="h-6 w-12 rounded-lg" />
                                        <Skeleton className="h-6 w-12 rounded-lg" />
                                    </div>
                                    <Skeleton className="h-3 w-20" />
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
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 lg:p-8 rounded-[32px] border border-slate-100 shadow-sm gap-4">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-indigo-600 rounded-full" />
                    <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm whitespace-nowrap">Competition Registry</h3>
                    <div className="flex items-center gap-2.5 px-3 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-lg shadow-violet-100 animate-in zoom-in-95 duration-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                        <span className="text-[12px] font-black text-white tracking-[0.05em] uppercase">
                            {competitions.length} <span className="text-violet-100/60 font-medium text-[10px] lowercase italic ml-0.5 tracking-normal">active</span>
                        </span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search competitions..."
                        className="w-full sm:max-w-sm h-11 px-6 bg-slate-100 border border-slate-200 rounded-2xl text-[10px] lg:text-xs font-bold focus:ring-2 ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 shrink-0"
                    >
                        <Plus className="w-4 h-4" /> HOST COMPETITION
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                {competitions.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(comp => (
                    <div key={comp._id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm group overflow-hidden flex flex-col xl:flex-row">
                        <div className="w-full xl:w-48 h-40 md:h-64 xl:h-auto bg-slate-100 relative shrink-0 cursor-pointer" onClick={() => handleEditCompetition(comp)}>
                            {comp.bannerImage ? (
                                <img src={getImageUrl(comp.bannerImage)} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-400">
                                    <Globe className="w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[8px] lg:text-[9px] font-black text-indigo-600 tracking-widest uppercase shadow-sm">
                                {comp.category}
                            </div>
                        </div>

                        <div className="p-6 lg:p-8 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-3 gap-2">
                                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handleEditCompetition(comp)}>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-slate-900 text-sm lg:text-xl tracking-tight leading-tight group-hover:text-indigo-600 transition-colors uppercase truncate">{comp.title}</h4>
                                        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase shrink-0 ${
                                            comp.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                                            comp.status === 'PENDING' ? 'bg-amber-50 text-amber-600 animate-pulse' : 
                                            'bg-slate-50 text-slate-600'
                                        }`}>
                                            {comp.status || 'PENDING'}
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-[9px] lg:text-[10px] font-black uppercase tracking-widest mt-1 truncate">{comp.organizer}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {comp.status === 'PENDING' && (
                                        <button onClick={(e) => { e.stopPropagation(); handleApproveCompetition(comp._id); }} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl transition-all hover:bg-emerald-100" title="Approve Competition">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); handleEditCompetition(comp); }} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl transition-all hover:bg-indigo-100">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCompetition(comp._id); }} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl transition-all hover:bg-rose-100">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-slate-500 text-[10px] lg:text-xs font-semibold leading-relaxed line-clamp-2 mb-6 group-hover:text-slate-600 transition-colors">
                                {comp.description || 'No description provided.'}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    <Calendar className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-indigo-500" />
                                    <span>Starts: {new Date(comp.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    <Layers className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-indigo-500" />
                                    <span>{comp.rounds?.length || 0} Rounds</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    <Users className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-emerald-500" />
                                    <span>{comp.participants?.length || 0} Learners</span>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-4 lg:pt-6 border-t border-slate-50 gap-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className={clsx(
                                        "px-2 lg:px-3 py-1 rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest",
                                        new Date(comp.endDate) > new Date() ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                    )}>
                                        {new Date(comp.endDate) > new Date() ? 'LIVE' : 'CLOSED'}
                                    </span>
                                    <span className="px-2 lg:px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest">
                                        {comp.mode}
                                    </span>
                                    {comp.rewards && (
                                        <span className="px-2 lg:px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <Award className="w-3 h-3" /> Prize
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleShowAnalytics(comp._id)}
                                    className="text-[9px] lg:text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest underline decoration-2 underline-offset-4 shrink-0"
                                >
                                    INSIGHTS
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Creation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-5xl shadow-2xl relative animate-in slide-in-from-bottom-5 duration-500 overflow-hidden border border-white/20 flex flex-col h-[85vh] lg:h-[90vh] mx-4">

                        {/* Modal Header Overlay */}
                        <div className="z-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 lg:px-12 py-6 lg:py-8 shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 group">
                                    <Globe className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
                                </div>
                                <div>
                                    <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                                        {editingId ? 'Edit Competition' : 'Create New Competition'}
                                    </h3>
                                    <p className="text-slate-400 text-[10px] lg:text-[11px] font-bold tracking-widest uppercase mt-1.5 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        {editingId ? 'Update event details & schedule' : 'Setup event details & timeline'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => { setShowModal(false); setEditingId(null); }} className="p-3 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 rounded-2xl">
                                <XCircle className="w-7 h-7 lg:w-8 lg:h-8" />
                            </button>
                        </div>

                        <div className="overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar scroll-smooth">
                            <div className="p-8 lg:p-12">
                                <form onSubmit={handleSubmit} className="space-y-12">
                                    {/* Basic Info Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between px-1">
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Competition Title</label>
                                                    <span className="text-[9px] font-bold text-indigo-500 uppercase">Required</span>
                                                </div>
                                                <input required className="w-full h-14 px-6 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-indigo-500/5 focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                                                    placeholder="e.g. Cyber Security Hackathon 2024" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Host Organizer</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input required className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-indigo-500/5 focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                                                        placeholder="e.g. Microsoft Student Ambassadors" value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Category</label>
                                                    <select className="w-full h-14 px-6 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-indigo-500/5 rounded-2xl outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                                                        value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                                        <option>Hackathon</option>
                                                        <option>Quiz</option>
                                                        <option>Coding Challenge</option>
                                                        <option>Case Study</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Delivery Mode</label>
                                                    <select className="w-full h-14 px-6 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-indigo-500/5 rounded-2xl outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                                                        value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
                                                        <option>Online</option>
                                                        <option>Offline</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {form.mode === 'Offline' && (
                                                <div className="space-y-3 animate-in slide-in-from-top-2">
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Venue Location</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                                                        <input required className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-indigo-500/5 rounded-2xl outline-none transition-all font-bold text-slate-800"
                                                            placeholder="Innovation Lab, Tech Hub..." value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-8">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Start Date</label>
                                                    <input required type="date" className="w-full h-14 px-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                                                        value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">End Date</label>
                                                    <input required type="date" className="w-full h-14 px-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                                                        value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Registration Deadline</label>
                                                <input required type="date" className="w-full h-14 px-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800"
                                                    value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Competition Banner</label>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group">
                                                        {form.preview ? (
                                                            <img src={form.preview} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                        ) : (
                                                            <Layers className="w-8 h-8 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <label className="flex-1 h-14 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all font-black text-indigo-600 text-[11px] tracking-widest uppercase gap-2 group">
                                                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                                        Upload Poster
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-2 space-y-3">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Description & Rules</label>
                                            <textarea required rows={4} className="w-full p-6 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-indigo-500/5 focus:border-indigo-500 rounded-3xl outline-none transition-all font-bold text-slate-800 text-sm leading-relaxed"
                                                placeholder="Provide clear instructions and competition details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                        </div>
                                    </div>

                                    {/* Incentives & Requirements */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 rounded-[32px] p-8 border border-slate-100">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Award className="w-5 h-5 text-amber-500" />
                                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Incentives & Rewards</h4>
                                            </div>
                                            <input className="w-full h-14 px-6 bg-white border border-slate-200 focus:ring-4 ring-amber-500/10 rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                                                placeholder="e.g. Prize Pool of $5,000 + Internship" value={form.rewards} onChange={e => setForm({ ...form, rewards: e.target.value })} />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-5 h-5 text-indigo-500" />
                                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Eligibility Criteria</h4>
                                            </div>
                                            <input className="w-full h-14 px-6 bg-white border border-slate-200 focus:ring-4 ring-indigo-500/10 rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                                                placeholder="e.g. Final Year Students, Any Domain" value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} />
                                        </div>
                                    </div>

                                    {/* Timeline Section */}
                                    <div className="space-y-8">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <Calendar className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Timeline & Rounds</h4>
                                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Define the competitive progression</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={handleAddRound} className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm">
                                                <Plus className="w-4 h-4" strokeWidth={3} /> Add Round
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            {form.rounds.map((round, idx) => (
                                                <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6 animate-in slide-in-from-bottom-4 duration-500 relative group">
                                                    <div className="flex flex-col md:flex-row gap-6">
                                                        <div className="w-full md:w-16 h-16 bg-slate-50 flex items-center justify-center rounded-2xl text-xl font-black text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 space-y-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Round Identifier</label>
                                                                    <input required className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 text-sm focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all"
                                                                        placeholder="e.g. Preliminary Screening" value={round.title} onChange={e => handleRoundChange(idx, 'title', e.target.value)} />
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Execution Date</label>
                                                                    <input type="date" className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 text-sm focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all"
                                                                        value={round.date} onChange={e => handleRoundChange(idx, 'date', e.target.value)} />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Round Details & Parameters</label>
                                                                <textarea rows={2} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 text-sm focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all"
                                                                    placeholder="Detail requirements, format and scoring criteria..." value={round.description} onChange={e => handleRoundChange(idx, 'description', e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {form.rounds.length > 1 && (
                                                        <button type="button" onClick={() => handleRemoveRound(idx)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 mb-2">
                                        <button type="submit" className="relative w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[12px] lg:text-[13px] uppercase tracking-[0.15em] shadow-xl shadow-slate-200 transition-all hover:bg-indigo-600 hover:-translate-y-0.5 active:scale-[0.98] group overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="relative z-10 flex items-center justify-center gap-4">
                                                <span>{editingId ? 'Update Competition' : 'Publish Competition'}</span>
                                                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md group-hover:rotate-90 transition-transform duration-500">
                                                    {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Modal */}
            {showAnalytics && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300 p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 lg:p-12 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100">
                                    <BarChart3 className="w-8 h-8 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase italic line-clamp-1">{selectedStats?.title || 'Competition Analytics'}</h3>
                                    <p className="text-slate-400 text-[10px] lg:text-[11px] font-bold tracking-widest uppercase flex items-center gap-2">
                                        Detailed breakdown & participant registry
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowAnalytics(false)} className="p-4 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 rounded-2xl">
                                <XCircle className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
                            {analyticsLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase italic">Compiling data registry...</span>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Total Enrollment', value: selectedStats?.participants?.length || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                            { label: 'Active Rounds', value: selectedStats?.rounds?.length || 0, icon: Layers, color: 'text-violet-600', bg: 'bg-violet-50' },
                                            { label: 'Days Remaining', value: Math.max(0, Math.ceil((new Date(selectedStats?.endDate) - new Date()) / (1000 * 60 * 60 * 24))), icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-slate-50/50 border border-slate-100 p-6 rounded-[32px] space-y-4">
                                                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", stat.bg)}>
                                                    <stat.icon className={clsx("w-6 h-6", stat.color)} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{stat.label}</p>
                                                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Participants Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className="text-sm font-black text-slate-900 tracking-widest uppercase italic">Participant Registry</h4>
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">{selectedStats?.participants?.length || 0} Registered</span>
                                        </div>

                                        {selectedStats?.participants?.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                {selectedStats.participants.map((user, idx) => (
                                                    <div key={idx} className="bg-white border border-slate-100 p-5 rounded-[24px] flex items-center justify-between hover:shadow-xl hover:shadow-slate-100 transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center font-black text-slate-400">
                                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{user.name}</h5>
                                                                <p className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <button className="p-3 text-slate-300 group-hover:text-indigo-600 transition-colors">
                                                            <ExternalLink className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50/50 rounded-[32px] p-12 text-center border-2 border-dashed border-slate-100">
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                                    <Users className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase italic">No participants registered yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompetitions;
