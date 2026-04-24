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
            rounds: comp.rounds?.length ? comp.rounds.map(r => ({
                ...r,
                date: r.date ? new Date(r.date).toISOString().split('T')[0] : ''
            })) : [{ title: '', description: '', date: '' }]
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
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                            <Skeleton className="w-full aspect-video shrink-0" />
                            <div className="p-5 flex-1 space-y-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <Skeleton className="h-6 w-12 rounded-lg" />
                                    <Skeleton className="h-4 w-16" />
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
                            {competitions.length} <span className="text-violet-100/60 font-medium text-xs lowercase italic ml-0.5 tracking-normal">hosted</span>
                        </span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search your competitions..."
                        className="w-full sm:max-w-sm h-11 px-6 bg-slate-100 border border-slate-200 rounded-2xl text-xs lg:text-xs font-bold focus:ring-2 ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black tracking-widest uppercase hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 shrink-0"
                    >
                        <Plus className="w-4 h-4" /> HOST COMPETITION
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                {competitions.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(comp => {
                    const now = new Date();
                    const start = new Date(comp.startDate);
                    const end = new Date(comp.endDate);
                    let temporalStatus = 'UPCOMING';
                    if (now >= start && now <= end) temporalStatus = 'ONGOING';
                    else if (now > end) temporalStatus = 'ENDED';

                    const TYPE_ICONS = { HACKATHON: '⚙️', QUIZ: '🧠', DESIGN: '🎨', CODING: '💻' };
                    const typeIcon = TYPE_ICONS[comp.category?.toUpperCase()] || '🏆';
                    
                    const statusObj = temporalStatus === 'UPCOMING' ? { label: 'Upcoming', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-white', dot: 'bg-amber-400' } :
                                      temporalStatus === 'ONGOING' ? { label: 'Live', bg: 'bg-green-50', border: 'border-green-100', text: 'text-white', dot: 'bg-green-400 animate-pulse' } :
                                      { label: 'Ended', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-white', dot: 'bg-slate-300' };

                    return (
                        <div key={comp._id} className="group relative bg-white rounded-3xl border border-slate-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_-6px_rgba(59,130,246,0.15)] hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
                            <div className="w-full aspect-video bg-slate-100 relative overflow-hidden shrink-0 cursor-pointer" onClick={() => handleEditCompetition(comp)}>
                                {comp.bannerImage ? (
                                    <img src={getImageUrl(comp.bannerImage)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={comp.title} />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <span className="text-5xl opacity-30 select-none">{typeIcon}</span>
                                    </div>
                                )}
                                
                                <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-lg shadow-lg shadow-black/5">
                                    {typeIcon}
                                </div>
                                
                                <div className="absolute top-3 right-3">
                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border backdrop-blur-md uppercase tracking-wider ${statusObj.bg}/40 ${statusObj.border} ${statusObj.text} border-white/20`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`} />
                                        {statusObj.label}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1 relative bg-white flex flex-col lg:flex-col lg:gap-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 transition-all duration-300 pointer-events-none" />
                                
                                <div className="flex-1 min-w-0 relative">
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                        <h3 className="font-extrabold text-slate-900 text-[16px] md:text-lg lg:text-[16px] leading-tight line-clamp-1 flex-1">
                                            {comp.title}
                                        </h3>
                                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase shrink-0 ${
                                            comp.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                                            comp.status === 'PENDING' ? 'bg-amber-50 text-amber-600 animate-pulse' : 
                                            'bg-slate-50 text-slate-600'
                                        }`}>
                                            {comp.status || 'PENDING'}
                                        </div>
                                    </div>
                                    
                                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-4 md:mb-2 lg:mb-4">
                                        {comp.description || 'No description provided.'}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-2 mt-auto">
                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {comp.startDate ? new Date(comp.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Date TBD'}
                                        </span>
                                        {comp.mode && (
                                            <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[11px] font-semibold text-blue-600">
                                                {comp.mode}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                            {comp.participants?.length || 0}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="relative pt-4 border-t border-slate-50 lg:border-t lg:pt-4 lg:w-full shrink-0 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <button onClick={(e) => { e.stopPropagation(); handleEditCompetition(comp); }} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg transition-all hover:bg-indigo-100">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCompetition(comp._id); }} className="p-2 bg-rose-50 text-rose-600 rounded-lg transition-all hover:bg-rose-100">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleShowAnalytics(comp._id)}
                                        className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest flex items-center gap-1"
                                    >
                                        MGMT <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Creation Modal */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-t-[40px] md:rounded-[40px] w-full max-w-5xl shadow-2xl relative animate-in slide-in-from-bottom-5 duration-500 overflow-hidden border border-white/20 flex flex-col h-[85dvh] md:h-[90vh]">
                        <div className="z-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 py-5 lg:py-8 shrink-0">
                            <div className="flex items-center gap-3 lg:gap-5">
                                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 group">
                                    <Globe className="w-5 h-5 lg:w-7 lg:h-7 text-white group-hover:rotate-12 transition-transform" />
                                </div>
                                <div>
                                    <h3 className="text-lg lg:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                                        {editingId ? 'Edit Event' : 'Launch Event'}
                                    </h3>
                                    <p className="text-slate-400 text-xs lg:text-sm font-bold tracking-widest uppercase mt-1 lg:mt-1.5 flex items-center gap-2">
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
                            <div className="p-5 md:p-8 lg:p-12">
                                <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12 pb-24 md:pb-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                                        <div className="space-y-4 lg:space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-xs lg:text-sm font-black text-slate-500 uppercase tracking-widest px-1">Event Domain</label>
                                                <input required className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl lg:rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                                                    placeholder="e.g. AI Hackathon 2026" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-xs lg:text-sm font-black text-slate-500 uppercase tracking-widest px-1">Organizer Identity</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input required className="w-full h-12 lg:h-14 pl-12 lg:pl-14 pr-5 lg:pr-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl lg:rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                                                        placeholder="e.g. Acme Corp" value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-xs lg:text-sm font-black text-slate-500 uppercase tracking-widest px-1">Classification</label>
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
                                                    <label className="text-xs lg:text-sm font-black text-slate-500 uppercase tracking-widest px-1">Protocol</label>
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
                                                    <label className="text-xs lg:text-sm font-black text-slate-500 uppercase tracking-widest px-1">Start Date</label>
                                                    <input required type="date" className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl lg:rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                                                        value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs lg:text-sm font-black text-slate-500 uppercase tracking-widest px-1">End Date</label>
                                                    <input required type="date" className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl lg:rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                                                        value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-xs lg:text-sm font-black text-slate-500 uppercase tracking-widest px-1">Application Deadline</label>
                                                <input required type="date" className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl lg:rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm"
                                                    value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                                            </div>

                                            <div className="space-y-3 lg:space-y-4">
                                                <div className="flex items-center justify-between px-1">
                                                    <label className="text-xs lg:text-sm font-black text-slate-500 uppercase tracking-widest">Event Poster</label>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">16:9 · 1200×675px ideal</span>
                                                </div>
                                                <div className="w-full aspect-video rounded-2xl lg:rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden relative group">
                                                    {form.preview ? (
                                                        <img src={form.preview} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" alt="Banner preview" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
                                                            <Layers className="w-8 h-8 lg:w-10 lg:h-10" />
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">No image uploaded</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-[12%] border border-dashed border-white/30 rounded-lg pointer-events-none" />
                                                </div>
                                                <label className="flex items-center justify-center gap-2 h-12 lg:h-14 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-xl lg:rounded-2xl cursor-pointer hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all font-black text-indigo-600 text-xs lg:text-sm tracking-widest uppercase group">
                                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                                    Upload Media (16:9)
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                </label>
                                                <p className="text-[10px] text-slate-400 font-semibold text-center leading-snug">
                                                    Recommended: 1200×675 px · Min: 800×450 px · Keep text &amp; CTA centred in the safe area
                                                </p>
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-2 space-y-3">
                                            <label className="text-xs lg:text-sm font-black text-slate-500 uppercase tracking-widest px-1">Brief & Guidelines</label>
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
                                            <button type="button" onClick={handleAddRound} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all">
                                                <Plus className="w-4 h-4" strokeWidth={3} /> Add Stage
                                            </button>
                                        </div>

                                        <div className="space-y-4 lg:space-y-6">
                                            {form.rounds.map((round, idx) => (
                                                <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl lg:rounded-[32px] border border-slate-100 shadow-sm space-y-5 md:space-y-6 relative group">
                                                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                                                        <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-slate-50 flex items-center justify-center rounded-xl lg:rounded-2xl text-base lg:text-xl font-black text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 space-y-4 lg:space-y-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                                                <div className="space-y-2 lg:space-y-3">
                                                                    <label className="text-sm lg:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Stage Title</label>
                                                                    <input required className="w-full h-12 lg:h-14 px-5 lg:px-6 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl outline-none font-bold text-slate-800 text-xs lg:text-sm focus:bg-white transition-all placeholder:text-slate-300"
                                                                        placeholder="e.g. Qualification Round" value={round.title} onChange={e => handleRoundChange(idx, 'title', e.target.value)} />
                                                                </div>
                                                                <div className="space-y-2 lg:space-y-3">
                                                                    <label className="text-sm lg:text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
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
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-2 sm:p-4">
                    <div className="bg-white rounded-[32px] md:rounded-[40px] w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85dvh] md:max-h-[90vh]">
                        <div className="p-5 md:p-8 lg:p-12 border-b border-slate-50 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 md:gap-6">
                                <div className="w-10 h-10 md:w-16 md:h-16 bg-indigo-600 rounded-xl md:rounded-3xl flex items-center justify-center text-white shrink-0">
                                    <BarChart3 className="w-5 h-5 md:w-8 md:h-8" />
                                </div>
                                <div className="space-y-0.5 md:space-y-1 min-w-0">
                                    <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tighter uppercase line-clamp-1 truncate">{selectedStats?.title}</h3>
                                    <p className="text-slate-400 text-xs md:text-xs font-bold tracking-widest uppercase md:mt-1">Enrollment Management</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAnalytics(false)} className="p-2 md:p-4 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 rounded-xl md:rounded-2xl shrink-0">
                                <XCircle className="w-6 h-6 md:w-8 md:h-8" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-12 flex flex-col gap-6 md:gap-12 pb-24 md:pb-12">
                            {analyticsLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                    <span className="text-xs font-black text-slate-400 tracking-widest uppercase italic">Initializing registry...</span>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                        {[
                                            { label: 'Total Learners', value: selectedStats?.participants?.length || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                            { label: 'Design Stages', value: selectedStats?.rounds?.length || 0, icon: Layers, color: 'text-violet-600', bg: 'bg-violet-50' },
                                            { label: 'Status', value: new Date(selectedStats?.endDate) > new Date() ? 'ACTIVE' : 'EXPIRED', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                                        ].map((stat, i) => (
                                            <div key={i} className={clsx("bg-slate-50/50 p-4 md:p-6 rounded-2xl md:rounded-[32px] flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 border border-slate-100", i === 2 ? "col-span-2 lg:col-span-1" : "")}>
                                                <div className={clsx("w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
                                                    <stat.icon className={clsx("w-4 h-4 md:w-6 md:h-6", stat.color)} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm md:text-xs font-black text-slate-400 tracking-tight md:tracking-widest uppercase truncate">{stat.label}</p>
                                                    <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4 md:space-y-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1 md:px-2">
                                            <h4 className="text-xs md:text-sm font-black text-slate-900 tracking-widest uppercase italic bg-slate-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full inline-block text-center md:text-left self-start">Registered Talent Registry</h4>
                                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                                <button 
                                                    disabled={downloadingCsv}
                                                    onClick={() => handleDownloadParticipants(selectedStats._id, selectedStats.title)}
                                                    className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-indigo-600 text-white rounded-lg md:rounded-xl text-sm md:text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-sm md:shadow-lg shadow-indigo-100 disabled:opacity-50"
                                                >
                                                    {downloadingCsv ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                                    Export CSV
                                                </button>
                                                <span className="text-sm md:text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 md:px-3 md:py-1 rounded-md md:rounded-full uppercase tracking-tighter shadow-sm">{selectedStats?.participants?.length || 0} Reg</span>
                                            </div>
                                        </div>
                                        {selectedStats?.participants?.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3 md:gap-4">
                                                {selectedStats.participants.map((user, idx) => (
                                                    <div key={idx} className="bg-white border border-slate-100 p-4 md:p-5 rounded-2xl md:rounded-[24px] flex flex-row items-center justify-between gap-3 md:gap-4 group hover:shadow-md hover:shadow-slate-100 transition-all">
                                                        <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl md:rounded-2xl overflow-hidden shadow-inner flex items-center justify-center font-black text-slate-300 shrink-0">
                                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h5 className="text-xs md:text-sm font-black text-slate-900 tracking-tight leading-none mb-1 truncate">{user.name}</h5>
                                                                <p className="text-sm md:text-xs font-bold text-slate-400 tracking-wide uppercase truncate">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => setViewingParticipant(user)}
                                                            className="flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 text-indigo-600 font-black text-sm md:text-xs uppercase tracking-widest hover:bg-indigo-50 bg-slate-50 md:bg-transparent rounded-lg md:rounded-xl transition-all shrink-0"
                                                        >
                                                            <span className="hidden sm:inline">Inspect</span>
                                                            <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50/50 rounded-[32px] p-12 text-center border-2 border-dashed border-slate-100">
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                                    <Users className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-xs font-black text-slate-400 tracking-widest uppercase italic">No talent registered yet</p>
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
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] md:rounded-[40px] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 md:p-8 border-b border-slate-50 flex items-center justify-between gap-3">
                            <h4 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tighter italic truncate">Talent Profile</h4>
                            <button onClick={() => setViewingParticipant(null)} className="p-2 md:p-3 text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 rounded-xl shrink-0">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar space-y-6 md:space-y-8 pb-24 md:pb-12">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[32px] border border-slate-100 relative">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm flex items-center justify-center font-black text-slate-300 text-2xl md:text-3xl shrink-0">
                                    {viewingParticipant.avatar ? <img src={viewingParticipant.avatar} className="w-full h-full object-cover" /> : viewingParticipant.name?.charAt(0)}
                                </div>
                                <div className="space-y-1.5 md:space-y-2 flex-1 min-w-0">
                                    <h5 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate">{viewingParticipant.name}</h5>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm md:text-sm font-bold text-slate-500 truncate">{viewingParticipant.email}</p>
                                        <p className="text-sm md:text-sm font-black text-indigo-600 bg-white px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-full shadow-sm">
                                            {viewingParticipant.studentProfile?.phoneNumber || 'No Phone'}
                                        </p>
                                    </div>
                                </div>
                                {viewingParticipant.studentProfile?.resumeUrl ? (
                                    <a target="_blank" rel="noreferrer" href={viewingParticipant.studentProfile.resumeUrl} className="mt-2 sm:mt-0 sm:absolute sm:top-6 sm:right-6 flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2 bg-indigo-600 text-white rounded-lg md:rounded-xl text-sm md:text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md w-full sm:w-auto justify-center">
                                        Resume <ExternalLink className="w-3 h-3" />
                                    </a>
                                ) : (
                                    <span className="mt-2 sm:mt-0 sm:absolute sm:top-6 sm:right-6 flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2 bg-slate-200 text-slate-400 rounded-lg md:rounded-xl text-sm md:text-xs font-black uppercase tracking-widest w-full sm:w-auto justify-center cursor-not-allowed">
                                        No Resume
                                    </span>
                                )}
                            </div>

                            {viewingParticipant.studentProfile ? (
                                <>
                                    {viewingParticipant.studentProfile.skills?.length > 0 && (
                                        <div className="space-y-3">
                                            <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Identified Skills</h6>
                                            <div className="flex flex-wrap gap-2">
                                                {viewingParticipant.studentProfile.skills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-tight shadow-sm border border-indigo-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {viewingParticipant.studentProfile.education?.length > 0 && (
                                            <div className="space-y-4">
                                                <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Academic Background</h6>
                                                {viewingParticipant.studentProfile.education.map((edu, i) => (
                                                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                                        <p className="text-sm font-black text-slate-900 leading-tight mb-1">{edu.institution}</p>
                                                        <p className="text-xs font-bold text-indigo-600 italic">{edu.degree}</p>
                                                        <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">{edu.fieldOfStudy}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {viewingParticipant.studentProfile.experience?.length > 0 && (
                                            <div className="space-y-4">
                                                <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Carrier Path</h6>
                                                {viewingParticipant.studentProfile.experience.map((exp, i) => (
                                                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                                        <p className="text-sm font-black text-slate-900 leading-tight mb-1">{exp.company}</p>
                                                        <p className="text-xs font-bold text-violet-600 italic">{exp.position}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {viewingParticipant.studentProfile.summary && (
                                        <div className="space-y-2">
                                            <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Professional Abstract</h6>
                                            <p className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-xs font-semibold text-slate-600 leading-relaxed italic">
                                                "{viewingParticipant.studentProfile.summary}"
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Full profile haven't been completed by this user yet</p>
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
