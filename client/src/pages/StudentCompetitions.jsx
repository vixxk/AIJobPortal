import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import axios from '../utils/axios';
import {
    Trophy, Calendar, Search, Filter,
    Clock, Tag, ArrowRight, Sparkles, CheckCircle2, Circle, Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
    UPCOMING: { label: 'Upcoming', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-400' },
    ONGOING: { label: 'Live', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', dot: 'bg-green-400 animate-pulse' },
    ENDED: { label: 'Ended', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-300' },
};

const TYPE_ICONS = {
    HACKATHON: '⚙️',
    QUIZ: '🧠',
    DESIGN: '🎨',
    CODING: '💻',
};

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

// ─── Competition Card ─────────────────────────────────────────────────────────
const CompCard = ({ comp, registered, onRegister, onUnregister, onClick, isProcessing }) => {
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        if (isConfirming) {
            const timer = setTimeout(() => setIsConfirming(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isConfirming]);

    const handleUnregisterClick = (e) => {
        e.stopPropagation();
        if (!isConfirming) {
            setIsConfirming(true);
        } else {
            onUnregister(e, comp._id);
            setIsConfirming(false);
        }
    };
    const getStatus = () => {
        const now = new Date();
        const start = new Date(comp.startDate);
        const end = new Date(comp.endDate);
        if (now < start) return 'UPCOMING';
        if (now >= start && now <= end) return 'ONGOING';
        return 'ENDED';
    };

    const temporalStatus = getStatus();
    const status = STATUS[temporalStatus] || STATUS.UPCOMING;
    const typeIcon = TYPE_ICONS[comp.type?.toUpperCase()] || '🏆';
    const isEnded = temporalStatus === 'ENDED';

    return (
        <div 
            onClick={onClick}
            className="group relative bg-white rounded-3xl border border-slate-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_-6px_rgba(59,130,246,0.15)] hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex flex-col lg:flex-col overflow-hidden cursor-pointer"
        >
            {/* Banner Section */}
            <div className="h-40 md:h-48 lg:h-32 bg-slate-100 relative overflow-hidden shrink-0">
                {comp.bannerImage ? (
                    <img 
                        src={getImageUrl(comp.bannerImage)} 
                        alt={comp.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center opacity-80" />
                )}
                
                {/* Overlay Icon */}
                <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-lg shadow-black/5">
                    {typeIcon}
                </div>

                <div className="absolute top-4 right-4 md:top-auto md:bottom-4 md:left-4 md:right-auto lg:top-4 lg:right-4 lg:bottom-auto lg:left-auto">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border backdrop-blur-md uppercase tracking-wider ${status.bg.replace('bg-', 'bg-')}/40 ${status.border} ${status.color.replace('text-', 'text-white')} border-white/20`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 relative bg-white flex flex-col lg:flex-col lg:gap-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 transition-all duration-300 pointer-events-none" />
                
                <div className="flex-1 min-w-0 relative">
                    <h3 className="font-extrabold text-slate-900 text-[16px] md:text-lg lg:text-[16px] leading-tight mb-2 line-clamp-1">
                        {comp.title}
                    </h3>
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-4 md:mb-2 lg:mb-4">
                        {comp.description || 'No description provided.'}
                    </p>

                    {/* Meta chips */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {comp.startDate
                                ? new Date(comp.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                : 'Date TBD'}
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

                {/* Footer Action */}
                <div className="relative pt-4 border-t border-slate-50 lg:border-t lg:pt-4 lg:w-full shrink-0">
                    {isEnded ? (
                        <span className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-400">
                            Ended
                        </span>
                    ) : registered ? (
                        <button
                            disabled={isProcessing}
                            onClick={handleUnregisterClick}
                            className={clsx(
                                "relative w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 disabled:opacity-50",
                                isConfirming 
                                    ? "bg-rose-600 text-white shadow-lg shadow-rose-200" 
                                    : "bg-green-50 border border-green-200 text-green-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600"
                            )}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isProcessing ? (
                                    <>
                                        <div className={clsx("w-3.5 h-3.5 border-2 rounded-full animate-spin", isConfirming ? "border-white/30 border-t-white" : "border-green-600/30 border-t-green-600")} /> 
                                        {isConfirming ? 'Unregistering...' : 'Processing...'}
                                    </>
                                ) : isConfirming ? (
                                    'Confirm Unregister?'
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" /> Registered
                                    </>
                                )}
                            </span>
                        </button>
                    ) : (
                        <button
                            disabled={isProcessing}
                            onClick={(e) => onRegister(e, comp._id)}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                                text-white rounded-xl text-xs font-bold tracking-wide transition-all
                                shadow-md shadow-blue-200/50 flex items-center justify-center gap-2
                                active:scale-95 disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registering...
                                </>
                            ) : (
                                <>
                                    Register <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Filter pill ──────────────────────────────────────────────────────────────
const Pill = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${active
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
            : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
            }`}
    >
        {children}
    </button>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Upcoming', 'Live', 'Ended'];

const StudentCompetitions = () => {
    const navigate = useNavigate();
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [user, setUser] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [compRes, userRes] = await Promise.all([
                axios.get('/competitions'),
                axios.get('/auth/me')
            ]);
            setCompetitions(compRes.data.data.competitions || []);
            setUser(userRes.data.data.user);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleRegister = async (e, id) => {
        e.stopPropagation();
        setProcessingId(id);
        try {
            const res = await axios.post(`/competitions/${id}/register`);
            const updatedComp = res.data.data.competition;
            setCompetitions(prev => prev.map(c => c._id === id ? { ...c, participants: updatedComp.participants } : c));
            toast.success('Registered successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setProcessingId(null);
        }
    };

    const handleUnregister = async (e, id) => {
        e.stopPropagation();
        setProcessingId(id);
        try {
            const res = await axios.post(`/competitions/${id}/unregister`);
            const updatedComp = res.data.data.competition;
            setCompetitions(prev => prev.map(c => c._id === id ? { ...c, participants: updatedComp.participants } : c));
            toast.success('Unregistered successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Unregistration failed');
        } finally {
            setProcessingId(null);
        }
    };

    // Filter & search
    const filtered = competitions.filter(c => {
        const matchSearch =
            c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.type?.toLowerCase().includes(searchTerm.toLowerCase());

        const getStatus = (comp) => {
            const now = new Date();
            const start = new Date(comp.startDate);
            const end = new Date(comp.endDate);
            if (now < start) return 'UPCOMING';
            if (now >= start && now <= end) return 'ONGOING';
            return 'ENDED';
        };

        const temporalStatus = getStatus(c);
        const statusMap = { 'Upcoming': 'UPCOMING', 'Live': 'ONGOING', 'Ended': 'ENDED' };
        const matchFilter = activeFilter === 'All' || temporalStatus === statusMap[activeFilter];

        return matchSearch && matchFilter;
    });

    const getTemporalCounts = () => {
        const counts = { All: competitions.length, Upcoming: 0, Live: 0, Ended: 0 };
        const now = new Date();
        competitions.forEach(c => {
            const start = new Date(c.startDate);
            const end = new Date(c.endDate);
            if (now < start) counts.Upcoming++;
            else if (now >= start && now <= end) counts.Live++;
            else counts.Ended++;
        });
        return counts;
    };

    const counts = getTemporalCounts();

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-16 px-4 md:px-0">

            {/* ── Hero Banner ──────────────────────────────────────────────── */}
            <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-4 md:p-10 shadow-xl shadow-blue-200/60 transition-all duration-300">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5" />
                    <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-white/5" />
                    <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-white/5" />
                </div>

                {/* Large decorative trophy icon */}
                <Trophy className="absolute bottom-2 right-8 w-36 h-36 text-white/20 -rotate-6 pointer-events-none select-none" fill="currentColor" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                                <Trophy className="w-3 h-3 fill-white" />
                                COMPETE &amp; WIN
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight mb-1 md:mb-2">
                            Competitions
                        </h1>
                        <p className="hidden md:block text-blue-100 font-medium text-sm md:text-base max-w-md">
                            Hackathons, quizzes, and coding challenges from top recruiters. Stand out and get noticed.
                        </p>
                    </div>

                    {!loading && (
                        <div className="hidden md:flex shrink-0 items-center gap-3">
                            {[
                                { label: 'Total', value: competitions.length },
                                { label: 'Live Now', value: counts.Live },
                                { label: 'Upcoming', value: counts.Upcoming },
                            ].map(s => (
                                <div key={s.label} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[64px]">
                                    <p className="text-2xl font-black text-white">{s.value}</p>
                                    <p className="text-blue-100 text-[10px] font-semibold mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Search + Filters ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-7">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search competitions..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
                        >×</button>
                    )}
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {FILTERS.map(f => (
                        <Pill key={f} active={activeFilter === f} onClick={() => setActiveFilter(f)}>
                            {f} {counts[f] > 0 && <span className="ml-1 opacity-70">({counts[f]})</span>}
                        </Pill>
                    ))}
                </div>
            </div>

            {/* ── Content ──────────────────────────────────────────────────── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 h-72 animate-pulse">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
                            <div className="h-4 bg-slate-100 rounded-lg w-3/4 mb-2" />
                            <div className="h-3 bg-slate-100 rounded-lg w-full mb-1" />
                            <div className="h-3 bg-slate-100 rounded-lg w-2/3" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Trophy className="w-9 h-9 text-blue-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">
                        {searchTerm ? 'No competitions found' : 'No competitions yet'}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium max-w-xs mb-5">
                        {searchTerm
                            ? `No results for "${searchTerm}". Try a different keyword.`
                            : 'Recruiters will post competitions soon. Check back later!'}
                    </p>
                    {(searchTerm || activeFilter !== 'All') && (
                        <button
                            onClick={() => { setSearchTerm(''); setActiveFilter('All'); }}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-200"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {(searchTerm || activeFilter !== 'All') && (
                        <p className="text-sm text-slate-500 font-medium mb-4">
                            Showing <span className="font-bold text-slate-800">{filtered.length}</span> competition{filtered.length !== 1 ? 's' : ''}
                            {activeFilter !== 'All' && <> · <span className="text-blue-500">{activeFilter}</span></>}
                            {searchTerm && <> matching "<span className="text-blue-500">{searchTerm}</span>"</>}
                        </p>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filtered.map(comp => (
                            <CompCard
                                key={comp._id}
                                comp={comp}
                                registered={comp.participants?.includes(user?.id)}
                                onRegister={handleRegister}
                                onUnregister={handleUnregister}
                                onClick={() => navigate(`/app/competitions/${comp._id}`)}
                                isProcessing={processingId === comp._id}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentCompetitions;
