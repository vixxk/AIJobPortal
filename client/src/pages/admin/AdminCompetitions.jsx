import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { Globe, Trash2, Calendar, Users, Plus, XCircle, MapPin, Award, BookOpen, Layers } from 'lucide-react';
import clsx from 'clsx';

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

            await axios.post('/admin/competitions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowModal(false);
            setForm({
                title: '', organizer: '', description: '', category: 'Hackathon',
                mode: 'Online', location: '', startDate: '', endDate: '',
                deadline: '', rewards: '', rules: '', eligibility: '',
                avatar: null, preview: null, rounds: [{ title: '', description: '', date: '' }]
            });
            fetchCompetitions();
            alert('Competition created successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create competition');
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

    if (loading) return null;

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                {competitions.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(comp => (
                    <div key={comp._id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm group overflow-hidden flex flex-col md:flex-row">
                        <div className="w-full md:w-48 h-32 md:h-auto bg-slate-100 relative shrink-0">
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
                            <div className="flex items-start justify-between mb-4 gap-2">
                                <div className="min-w-0">
                                    <h4 className="font-black text-slate-900 text-sm lg:text-xl tracking-tight leading-tight group-hover:text-indigo-600 transition-colors uppercase truncate">{comp.title}</h4>
                                    <p className="text-slate-400 text-[9px] lg:text-[10px] font-black uppercase tracking-widest mt-1 truncate">{comp.organizer}</p>
                                </div>
                                <button onClick={() => handleDeleteCompetition(comp._id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-100 shrink-0">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 lg:mb-6">
                                <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    <Calendar className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-indigo-500" />
                                    <span className="truncate">Starts: {new Date(comp.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    <Layers className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-indigo-500" />
                                    <span className="truncate">{comp.rounds?.length || 0} Rounds</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    <Users className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-emerald-500" />
                                    <span className="truncate">{comp.participants?.length || 0} Learners</span>
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
                                <button className="text-[9px] lg:text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest underline decoration-2 underline-offset-4 shrink-0">ANALYTICS</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Creation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-8 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                    <div className="bg-white rounded-[32px] lg:rounded-[48px] p-6 lg:p-14 w-full max-w-5xl shadow-2xl relative animate-in zoom-in-95 duration-500 my-auto max-h-[92vh] overflow-y-auto border border-white/20 custom-scrollbar">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 lg:top-10 lg:right-10 text-slate-400 hover:text-slate-900 transition-all hover:rotate-90">
                            <XCircle className="w-8 h-8 lg:w-10 lg:h-10" />
                        </button>

                        <div className="flex items-center gap-5 mb-10 lg:mb-14">
                            <div className="w-14 h-14 lg:w-20 lg:h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[22px] lg:rounded-[28px] flex items-center justify-center shadow-2xl shadow-indigo-200">
                                <Plus className="w-7 h-7 lg:w-9 lg:h-9 text-white" />
                            </div>
                            <div>
                                <h3 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">HOST COMPETITION</h3>
                                <p className="text-slate-400 text-[10px] lg:text-sm font-black tracking-[0.3em] uppercase mt-2">Initialize Global Competency Node</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Universal Title</label>
                                    <input required className="w-full h-14 px-6 bg-slate-100 border border-slate-200 focus:ring-2 ring-indigo-500/30 rounded-[20px] outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400"
                                        placeholder="Elite Coding Hackathon..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Host Entity (Organizer)</label>
                                    <input required className="w-full h-14 px-6 bg-slate-100 border border-slate-200 focus:ring-2 ring-indigo-500/30 rounded-[20px] outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400"
                                        placeholder="Google Developer Student Clubs..." value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                        <select className="w-full h-14 px-6 bg-slate-100 border border-slate-200 focus:ring-2 ring-indigo-500/30 rounded-[20px] outline-none transition-all font-bold text-slate-700 appearance-none"
                                            value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            <option>Hackathon</option>
                                            <option>Quiz</option>
                                            <option>Coding Challenge</option>
                                            <option>Case Study</option>
                                            <option>Design-a-thon</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mode</label>
                                        <select className="w-full h-14 px-6 bg-slate-100 border border-slate-200 focus:ring-2 ring-indigo-500/30 rounded-[20px] outline-none transition-all font-bold text-slate-700 appearance-none"
                                            value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
                                            <option>Online</option>
                                            <option>Offline</option>
                                        </select>
                                    </div>
                                </div>
                                {form.mode === 'Offline' && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input className="w-full h-14 pl-14 pr-6 bg-slate-100 border border-slate-200 focus:ring-2 ring-indigo-500/30 rounded-[20px] outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400"
                                                placeholder="Campus Auditorium..." value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Markdown Supported)</label>
                                    <textarea required rows={4} className="w-full p-6 bg-slate-100 border border-slate-200 focus:ring-2 ring-indigo-500/30 rounded-[24px] outline-none transition-all font-bold text-slate-700 text-sm placeholder:text-slate-400"
                                        placeholder="Elaborate on the challenge objectives..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                        <input required type="date" className="w-full h-14 px-6 bg-slate-100 border border-slate-200 focus:ring-2 ring-indigo-500/30 rounded-[20px] outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400"
                                            value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                        <input required type="date" className="w-full h-14 px-6 bg-slate-100 border border-slate-200 focus:ring-2 ring-indigo-500/30 rounded-[20px] outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400"
                                            value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration Cut-off (Deadline)</label>
                                    <input required type="date" className="w-full h-14 px-6 bg-slate-100 border border-slate-200 focus:ring-2 ring-indigo-500/30 rounded-[20px] outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400"
                                        value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Excellence Banner (Image)</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                            {form.preview ? (
                                                <img src={form.preview} className="w-full h-full object-cover" />
                                            ) : (
                                                <Layers className="w-8 h-8 text-slate-200" />
                                            )}
                                        </div>
                                        <label className="flex-1 h-14 bg-indigo-50 border-2 border-dashed border-indigo-100 rounded-[20px] flex items-center justify-center cursor-pointer hover:bg-indigo-100 transition-all font-black text-indigo-600 text-[10px] tracking-widest uppercase">
                                            UPLOAD POSTER
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-amber-500" /> Rewards
                                        </label>
                                        <input className="w-full h-14 px-6 bg-slate-50 border border-slate-200 focus:ring-4 ring-indigo-500/10 rounded-2xl outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400/60"
                                            placeholder="INR 50,000 + Goodies..." value={form.rewards} onChange={e => setForm({ ...form, rewards: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-indigo-500" /> Eligibility
                                        </label>
                                        <input className="w-full h-14 px-6 bg-slate-50 border border-slate-200 focus:ring-4 ring-indigo-500/10 rounded-2xl outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400/60"
                                            placeholder="All Undergrads..." value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} />
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-8 bg-slate-50/80 p-6 lg:p-10 rounded-[32px] border border-slate-200/50 mt-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                                <Layers className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Timeline & Rounds</h4>
                                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Architect the challenge progression</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={handleAddRound} className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95">
                                            <Plus className="w-4 h-4" strokeWidth={3} /> NEW ROUND
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 relative">
                                        <div className="absolute left-6 top-0 bottom-0 w-px bg-indigo-100 hidden md:block" />
                                        {form.rounds.map((round, idx) => (
                                            <div key={idx} className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6 animate-in slide-in-from-bottom-4 duration-500 relative md:ml-12 group">
                                                <div className="absolute -left-[53px] top-8 w-11 h-11 bg-indigo-600 rounded-full hidden md:flex items-center justify-center text-white text-[10px] font-black border-4 border-white shadow-lg">
                                                    {idx + 1}
                                                </div>
                                                {form.rounds.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveRound(idx)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Round Identifier</label>
                                                        <input required className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 placeholder:text-slate-400/50 text-[13px] focus:ring-4 ring-indigo-500/5 transition-all"
                                                            placeholder="Preliminary Elimination..." value={round.title} onChange={e => handleRoundChange(idx, 'title', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proposed Execution Date</label>
                                                        <input type="date" className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 text-[13px] focus:ring-4 ring-indigo-500/5 transition-all"
                                                            value={round.date} onChange={e => handleRoundChange(idx, 'date', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Execution Parameters & Details</label>
                                                    <textarea rows={3} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 text-[13px] placeholder:text-slate-400/50 focus:ring-4 ring-indigo-500/5 transition-all"
                                                        placeholder="Detail the mandatory requirements, format, and evaluation criteria for this phase..." value={round.description} onChange={e => handleRoundChange(idx, 'description', e.target.value)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button className="col-span-1 md:col-span-2 w-full py-8 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white rounded-[32px] font-black text-sm lg:text-base uppercase tracking-[0.3em] shadow-[0_20px_50px_-10px_rgba(79,70,229,0.3)] hover:scale-[1.01] transition-all active:scale-95 mt-8 border border-white/10 group">
                                    INSTANTIATE GLOBAL COMPETITION
                                    <Plus className="inline-block ml-3 w-5 h-5 group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompetitions;
