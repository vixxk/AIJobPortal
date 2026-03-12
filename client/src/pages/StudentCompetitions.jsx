import { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import {
    Trophy, Calendar, Search, Filter,
    Clock, Tag, ArrowRight, Sparkles, CheckCircle2, Circle
} from 'lucide-react';

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

// ─── Competition Card ─────────────────────────────────────────────────────────
const CompCard = ({ comp, registered, onRegister }) => {
    const status = STATUS[comp.status] || STATUS.UPCOMING;
    const typeIcon = TYPE_ICONS[comp.type] || '🏆';
    const isEnded = comp.status === 'ENDED';

    return (
        <div className="group relative bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_-6px_rgba(59,130,246,0.15)] hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 transition-all duration-300 rounded-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between mb-4 relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-md shadow-blue-200/50">
                    {typeIcon}
                </div>
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.bg} ${status.border} ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 relative">
                <h3 className="font-extrabold text-slate-900 text-[16px] leading-tight mb-2 line-clamp-2">
                    {comp.title}
                </h3>
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-4">
                    {comp.description || 'No description provided.'}
                </p>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                    {comp.type && (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {comp.type}
                        </span>
                    )}
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {comp.startDate
                            ? new Date(comp.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Date TBD'}
                    </span>
                    {comp.endDate && (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Ends {new Date(comp.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="relative pt-4 border-t border-slate-50">
                {isEnded ? (
                    <span className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-400">
                        Competition Ended
                    </span>
                ) : registered ? (
                    <span className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-50 border border-green-200 rounded-xl text-xs font-bold text-green-600">
                        <CheckCircle2 className="w-4 h-4" /> Registered
                    </span>
                ) : (
                    <button
                        onClick={() => onRegister(comp._id)}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                            text-white rounded-xl text-xs font-bold tracking-wide transition-all
                            shadow-md shadow-blue-200/50 flex items-center justify-center gap-2
                            active:scale-95"
                    >
                        Register Now <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
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
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [registered, setRegistered] = useState(new Set());

    const fetchCompetitions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/competitions');
            setCompetitions(res.data.data.competitions || []);
        } catch (err) {
            console.error('Failed to fetch competitions', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCompetitions(); }, [fetchCompetitions]);

    const handleRegister = (id) => {
        setRegistered(prev => new Set([...prev, id]));
        // TODO: POST /competitions/:id/register when endpoint is ready
    };

    // Filter & search
    const filtered = competitions.filter(c => {
        const matchSearch =
            c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.type?.toLowerCase().includes(searchTerm.toLowerCase());

        const statusMap = { 'Upcoming': 'UPCOMING', 'Live': 'ONGOING', 'Ended': 'ENDED' };
        const matchFilter = activeFilter === 'All' || c.status === statusMap[activeFilter];

        return matchSearch && matchFilter;
    });

    const counts = {
        All: competitions.length,
        Upcoming: competitions.filter(c => c.status === 'UPCOMING').length,
        Live: competitions.filter(c => c.status === 'ONGOING').length,
        Ended: competitions.filter(c => c.status === 'ENDED').length,
    };

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(comp => (
                            <CompCard
                                key={comp._id}
                                comp={comp}
                                registered={registered.has(comp._id)}
                                onRegister={handleRegister}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentCompetitions;
