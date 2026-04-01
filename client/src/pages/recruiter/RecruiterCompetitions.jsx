import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { Globe, Trash2, Calendar, Users, Plus, XCircle, MapPin, Award, Layers, Building2, BarChart3, ExternalLink, Loader2, Pencil, Download, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import Skeleton from '../../components/ui/Skeleton';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const RecruiterCompetitions = () => {
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

    // New states for participant details
    const [viewingParticipant, setViewingParticipant] = useState(null);
    const [downloadingCsv, setDownloadingCsv] = useState(false);

    const fetchMyCompetitions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/competitions/me');
            setCompetitions(res.data.data.competitions || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyCompetitions();
    }, [fetchMyCompetitions]);

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
                await axios.patch(`/competitions/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('/competitions', formData, {
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
            fetchMyCompetitions();
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

    const handleDownloadParticipants = async (id, title) => {
        setDownloadingCsv(true);
        try {
            const response = await axios.get(`/competitions/${id}/download-participants`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title.replace(/\s+/g, '_')}_Participants.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to download participant data.');
        } finally {
            setDownloadingCsv(false);
        }
    };

    const handleShowAnalytics = async (id) => {
        setAnalyticsLoading(true);
        setShowAnalytics(true);
        try {
            const res = await axios.get(`/competitions/${id}`);
            setSelectedStats(res.data.data.competition);
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleDeleteCompetition = async (id) => {
        if (!confirm('Delete this competition?')) return;
        try {
            await axios.delete(`/competitions/${id}`);
            fetchMyCompetitions();
        } catch (err) {
            alert('Delete failed');
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-4 lg:space-y-8 pb-20">
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
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-3 w-1/4" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                    <Skeleton className="h-6 w-12 rounded-lg" />
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
        <div className="max-w-7xl mx-auto space-y-4 lg:space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 lg:p-8 rounded-[32px] border border-slate-100 shadow-sm gap-4">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-indigo-600 rounded-full" />
                    <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm whitespace-nowrap">Your Competitions</h3>
                    <div className="flex items-center gap-2.5 px-3 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-lg shadow-violet-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                        <span className="text-[12px] font-black text-white tracking-[0.05em] uppercase">
                            {competitions.length} <span className="text-violet-100/60 font-medium text-[10px] lowercase italic ml-0.5 tracking-normal">hosted</span>
                        </span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search your competitions..."
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

                        <div className="p-6 lg:p-8 flex-1 flex flex-col font-jakarta">
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
                                    <span>{comp.participants?.length || 0} Registered</span>
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
                                </div>
                                <button
                                    onClick={() => handleShowAnalytics(comp._id)}
                                    className="text-[9px] lg:text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest underline decoration-2 underline-offset-4 shrink-0"
                                >
                                    MANAGEMENT
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Creation Modal */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-t-[40px] md:rounded-[40px] w-full max-w-5xl shadow-2xl relative animate-in slide-in-from-bottom-5 duration-500 overflow-hidden border border-white/20 flex flex-col h-[92vh] md:h-[90vh]">
                        <div className="z-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 py-5 lg:py-8 shrink-0">
                            <div className="flex items-center gap-3 lg:gap-5">
                                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 group">
                                    <Globe className="w-5 h-5 lg:w-7 lg:h-7 text-white group-hover:rotate-12 transition-transform" />
                                </div>
                                <div>
                                    <h3 className="text-lg lg:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                                        {editingId ? 'Edit Event' : 'Launch Event'}
                                    </h3>
                                    <p className="text-slate-400 text-[8px] lg:text-[11px] font-bold tracking-widest uppercase mt-1 lg:mt-1.5 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        {editingId ? 'Refine details' : 'Configure timeline'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => { setShowModal(false); setEditingId(null); }} className="p-2 lg:p-3 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 rounded-xl lg:rounded-2xl">
                                <XCircle className="w-6 h-6 lg:w-8 lg:h-8" />
                            </button>
                        </div>

                        <div className="overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar scroll-smooth">
                            <div className="p-4 md:p-8 lg:p-12">
                                <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12 pb-8 md:pb-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                                        <div className="space-y-4 lg:space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Event Domain</label>
                                                <input required className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl lg:rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                                                    placeholder="e.g. AI Hackathon 2026" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Organizer Identity</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input required className="w-full h-12 lg:h-14 pl-12 lg:pl-14 pr-5 lg:pr-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl lg:rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                                                        placeholder="e.g. Acme Corp" value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Classification</label>
                                                    <div className="relative">
                                                        <select className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-200 rounded-xl lg:rounded-2xl outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer text-sm"
                                                            value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                                            <option>Hackathon</option>
                                                            <option>Quiz</option>
                                                            <option>Challenge</option>
                                                            <option>Case Study</option>
                                                        </select>
                                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                            <ChevronRight className="w-4 h-4 rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Protocol</label>
                                                    <div className="relative">
                                                        <select className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-200 rounded-xl lg:rounded-2xl outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer text-sm"
                                                            value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
                                                            <option>Online</option>
                                                            <option>Offline</option>
                                                        </select>
                                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                            <ChevronRight className="w-4 h-4 rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 lg:space-y-8">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Start Date</label>
                                                    <input required type="date" className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl lg:rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                                                        value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">End Date</label>
                                                    <input required type="date" className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl lg:rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                                                        value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Application Deadline</label>
                                                <input required type="date" className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl lg:rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                                                    value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                                            </div>

                                            <div className="space-y-3 lg:space-y-4">
                                                <label className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Event Poster</label>
                                                <div className="flex items-center gap-4 lg:gap-6">
                                                    <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group">
                                                        {form.preview ? (
                                                            <img src={form.preview} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                        ) : (
                                                            <Layers className="w-6 h-6 lg:w-8 lg:h-8 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <label className="flex-1 h-12 lg:h-14 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-xl lg:rounded-2xl flex items-center justify-center cursor-pointer hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all font-black text-indigo-600 text-[10px] lg:text-[11px] tracking-widest uppercase gap-2 group">
                                                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                                        Upload Media
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-2 space-y-3">
                                            <label className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Brief & Guidelines</label>
                                            <textarea required rows={4} className="w-full p-5 lg:p-6 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 ring-indigo-500/5 focus:border-indigo-500 rounded-2xl lg:rounded-3xl outline-none transition-all font-bold text-slate-800 text-xs lg:text-sm leading-relaxed"
                                                placeholder="Provide the core objective and rules..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-6 md:space-y-8">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 md:px-2 gap-4 lg:gap-0">
                                            <div className="flex items-center gap-3 lg:gap-4">
                                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-900 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                                                    <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                                </div>
                                                <h4 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-tight">Timeline Architecture</h4>
                                            </div>
                                            <button type="button" onClick={handleAddRound} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl lg:rounded-2xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all">
                                                <Plus className="w-4 h-4" strokeWidth={3} /> Add Stage
                                            </button>
                                        </div>

                                        <div className="space-y-4 lg:space-y-6">
                                            {form.rounds.map((round, idx) => (
                                                <div key={idx} className="bg-white p-5 md:p-6 lg:p-8 rounded-3xl lg:rounded-[32px] border border-slate-100 shadow-sm space-y-5 md:space-y-6 relative group">
                                                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                                                        <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-slate-50 flex items-center justify-center rounded-xl lg:rounded-2xl text-base lg:text-xl font-black text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 space-y-4 lg:space-y-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                                                <div className="space-y-2 lg:space-y-3">
                                                                    <label className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stage Title</label>
                                                                    <input required className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl outline-none font-bold text-slate-800 text-xs lg:text-sm focus:bg-white transition-all placeholder:text-slate-300"
                                                                        placeholder="e.g. Qualification Round" value={round.title} onChange={e => handleRoundChange(idx, 'title', e.target.value)} />
                                                                </div>
                                                                <div className="space-y-2 lg:space-y-3">
                                                                    <label className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
                                                                    <input type="date" className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl outline-none font-bold text-slate-800 text-xs lg:text-sm focus:bg-white transition-all"
                                                                        value={round.date} onChange={e => handleRoundChange(idx, 'date', e.target.value)} />
                                                                </div>
                                                            </div>
                                                            <textarea rows={2} className="w-full p-5 lg:p-6 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl outline-none font-bold text-slate-800 text-xs lg:text-sm focus:bg-white transition-all placeholder:text-slate-300"
                                                                placeholder="Stage requirements and selection criteria..." value={round.description} onChange={e => handleRoundChange(idx, 'description', e.target.value)} />
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

                                    <div className="pt-4 md:pt-6">
                                        <button type="submit" className="w-full py-4 md:py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs md:text-[13px] uppercase tracking-[0.1em] shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 hover:-translate-y-1">
                                            {editingId ? 'Save Modifications' : 'Launch Competition'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Management/Analytics Modal */}
            {showAnalytics && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 lg:p-12 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white">
                                    <BarChart3 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase line-clamp-1">{selectedStats?.title}</h3>
                                    <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">Enrollment & Registry Management</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAnalytics(false)} className="p-4 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 rounded-2xl">
                                <XCircle className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                            {analyticsLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase italic">Initializing registry...</span>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Total Learners', value: selectedStats?.participants?.length || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                            { label: 'Design Stages', value: selectedStats?.rounds?.length || 0, icon: Layers, color: 'text-violet-600', bg: 'bg-violet-50' },
                                            { label: 'Status Tracking', value: new Date(selectedStats?.endDate) > new Date() ? 'ACTIVE' : 'EXPIRED', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-slate-50/50 p-6 rounded-[32px] space-y-4 border border-slate-100">
                                                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                                                    <stat.icon className={clsx("w-6 h-6", stat.color)} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{stat.label}</p>
                                                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className="text-[11px] font-black text-slate-900 tracking-widest uppercase italic bg-slate-50 px-4 py-2 rounded-full inline-block">Registered Talent Registry</h4>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    disabled={downloadingCsv}
                                                    onClick={() => handleDownloadParticipants(selectedStats._id, selectedStats.title)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                                                >
                                                    {downloadingCsv ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                                    Export CSV
                                                </button>
                                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">{selectedStats?.participants?.length || 0} Registered</span>
                                            </div>
                                        </div>
                                        {selectedStats?.participants?.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                {selectedStats.participants.map((user, idx) => (
                                                    <div key={idx} className="bg-white border border-slate-100 p-5 rounded-[24px] flex items-center justify-between group hover:shadow-xl hover:shadow-slate-100 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center font-black text-slate-300">
                                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{user.name}</h5>
                                                                <p className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => setViewingParticipant(user)}
                                                            className="flex items-center gap-2 px-4 py-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-all"
                                                        >
                                                            Inspect
                                                            <ExternalLink className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50/50 rounded-[32px] p-12 text-center border-2 border-dashed border-slate-100">
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                                    <Users className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase italic">No talent registered yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Participant Profile Modal */}
            {viewingParticipant && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Talent Intelligence Profile</h4>
                            <button onClick={() => setViewingParticipant(null)} className="p-3 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 rounded-xl">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                            <div className="flex items-start gap-6 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                <div className="w-20 h-20 bg-white rounded-3xl overflow-hidden shadow-sm flex items-center justify-center font-black text-slate-300 text-3xl">
                                    {viewingParticipant.avatar ? <img src={viewingParticipant.avatar} className="w-full h-full object-cover" /> : viewingParticipant.name?.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <h5 className="text-2xl font-black text-slate-900 tracking-tight">{viewingParticipant.name}</h5>
                                    <p className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                                        {viewingParticipant.email}
                                    </p>
                                    {viewingParticipant.studentProfile?.phoneNumber && (
                                        <p className="text-[11px] font-black text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm w-fit mt-2">
                                            {viewingParticipant.studentProfile.phoneNumber}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {viewingParticipant.studentProfile ? (
                                <>
                                    {viewingParticipant.studentProfile.skills?.length > 0 && (
                                        <div className="space-y-3">
                                            <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Identified Skills</h6>
                                            <div className="flex flex-wrap gap-2">
                                                {viewingParticipant.studentProfile.skills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm border border-indigo-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {viewingParticipant.studentProfile.education?.length > 0 && (
                                            <div className="space-y-4">
                                                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Academic Background</h6>
                                                {viewingParticipant.studentProfile.education.map((edu, i) => (
                                                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                                        <p className="text-[11px] font-black text-slate-900 leading-tight mb-1">{edu.institution}</p>
                                                        <p className="text-[10px] font-bold text-indigo-600 italic">{edu.degree}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{edu.fieldOfStudy}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {viewingParticipant.studentProfile.experience?.length > 0 && (
                                            <div className="space-y-4">
                                                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Carrier Path</h6>
                                                {viewingParticipant.studentProfile.experience.map((exp, i) => (
                                                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                                        <p className="text-[11px] font-black text-slate-900 leading-tight mb-1">{exp.company}</p>
                                                        <p className="text-[10px] font-bold text-violet-600 italic">{exp.position}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {viewingParticipant.studentProfile.summary && (
                                        <div className="space-y-2">
                                            <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Professional Abstract</h6>
                                            <p className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-xs font-semibold text-slate-600 leading-relaxed italic">
                                                "{viewingParticipant.studentProfile.summary}"
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Full profile haven't been completed by this user yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </div>
    );
};

export default RecruiterCompetitions;
