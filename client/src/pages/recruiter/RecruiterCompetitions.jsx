import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { Calendar, Plus, Trophy, Trash2, MapPin } from 'lucide-react';

const RecruiterCompetitions = () => {
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // We fetch all competitions but it's fine since there's no recruiter filter yet, or we assume it's global
    const fetchCompetitions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/competitions');
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

    const handleCreate = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const payload = new FormData();
        payload.append('title', fd.get('title'));
        payload.append('description', fd.get('description'));
        payload.append('startDate', fd.get('date'));
        payload.append('type', 'HACKATHON');
        payload.append('status', 'UPCOMING');

        try {
            await axios.post('/competitions', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
            setShowModal(false);
            fetchCompetitions();
        } catch (err) {
            alert('Failed to create competition');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Competition Hosting</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Organize hiring challenges and hire top performers directly.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)} 
                    className="h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" /> Host Competition
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden flex items-center">
                    <div className="relative z-10 max-w-xl">
                        <Trophy className="w-12 h-12 text-yellow-400 mb-4" />
                        <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">Hire Top Performers</h2>
                        <p className="text-indigo-200 font-medium">Create hackathons and coding challenges natively. Top leaderboard candidates receive direct interview calls skipping round 1.</p>
                    </div>
                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                </div>

                {competitions.map(comp => (
                    <div key={comp._id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between group overflow-hidden relative">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <Trophy className="w-6 h-6 text-indigo-600" />
                                </div>
                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                                    comp.status === 'UPCOMING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                    {comp.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2 line-clamp-1">{comp.title}</h3>
                            <p className="text-xs font-medium text-slate-500 mb-4 line-clamp-2">{comp.description}</p>
                            
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-6">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {comp.startDate ? new Date(comp.startDate).toLocaleDateString() : 'TBD'}</span>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100">
                            <button className="w-full py-3 bg-slate-50 group-hover:bg-indigo-600 text-slate-600 group-hover:text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all">
                                View Leaderboard
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">Host New Competition</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Competition Title</label>
                                <input required name="title" type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" placeholder="e.g. Winter CodeSprint 2026" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                                <input required name="date" type="date" className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold text-slate-600" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea required name="description" className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm resize-none" placeholder="Provide details about the hackathon challenge..." />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full h-12 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 transition">
                                    Publish Competition
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterCompetitions;
