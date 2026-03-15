import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import {
    Trophy, Calendar, Clock, Tag, ArrowLeft,
    CheckCircle2, AlertCircle, Building2, MapPin,
    Users, Share2, Globe, FileText, ChevronRight,
    Sparkles, Award, ShieldAlert, ListChecks
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_MAP = {
    UPCOMING: { label: 'Upcoming', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    ONGOING: { label: 'Live Now', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    ENDED: { label: 'Competition Ended', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
};

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const StudentCompetitionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [comp, setComp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        if (isConfirming) {
            const timer = setTimeout(() => setIsConfirming(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isConfirming]);

    const fetchDetail = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/competitions/${id}`);
            setComp(res.data.data.competition);
        } catch (err) {
            console.error('Failed to fetch competition detail', err);
            toast.error('Failed to load competition details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    const getTemporalStatus = () => {
        if (!comp) return 'UPCOMING';
        const now = new Date();
        const start = new Date(comp.startDate);
        const end = new Date(comp.endDate);
        if (now < start) return 'UPCOMING';
        if (now >= start && now <= end) return 'ONGOING';
        return 'ENDED';
    };

    const isRegistered = comp?.participants?.includes(user?.id);
    const temporalStatus = getTemporalStatus();
    const status = STATUS_MAP[temporalStatus] || STATUS_MAP.UPCOMING;

    const handleRegisterAction = async () => {
        if (!user) {
            toast.error('Please login to register');
            return;
        }

        if (isRegistered && !isConfirming) {
            setIsConfirming(true);
            return;
        }

        try {
            setIsRegistering(true);
            const endpoint = isRegistered 
                ? `/competitions/${id}/unregister` 
                : `/competitions/${id}/register`;
            
            const res = await axios.post(endpoint);
            setComp(res.data.data.competition);
            toast.success(isRegistered ? 'Unregistered successfully' : 'Registered successfully!');
            setIsConfirming(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!', {
            icon: '🔗',
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!comp) return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShieldAlert className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Competition not found</h2>
            <button onClick={() => navigate('/app/competitions')} className="mt-4 text-blue-600 font-semibold">
                Back to all competitions
            </button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
                {/* Left Column: Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Banner & Title */}
                    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                        <div className="h-48 md:h-64 bg-slate-900 relative">
                            {comp.bannerImage ? (
                                <img src={getImageUrl(comp.bannerImage)} alt={comp.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center opacity-90">
                                    <Trophy className="w-24 h-24 text-white/20" />
                                </div>
                            )}
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {comp.category && (
                                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
                                            {comp.category}
                                        </span>
                                    )}
                                    <span className={`px-3 py-1 rounded-full backdrop-blur-md border ${status.bg.replace('bg-', 'bg-')}/40 ${status.border} ${status.color.replace('text-', 'text-white')} text-[10px] font-bold uppercase tracking-widest bg-white/10`}>
                                        {status.label}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                                    {comp.title}
                                </h1>
                            </div>

                            {/* Share Button on Cover */}
                            <div className="absolute top-6 right-6">
                                <button 
                                    onClick={handleShare}
                                    className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all shadow-lg shadow-black/10 group"
                                >
                                    <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500" />
                                About Competition
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                                {comp.description}
                            </p>

                            {/* Eligibility */}
                            {comp.eligibility && (
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo-500" />
                                        Who can participate?
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        {comp.eligibility}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline / Rounds */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <ListChecks className="w-5 h-5 text-green-500" />
                            Competition Rounds
                        </h2>
                        
                        <div className="space-y-6">
                            {comp.rounds && comp.rounds.length > 0 ? (
                                comp.rounds.map((round, idx) => (
                                    <div key={idx} className="relative pl-8 pb-2">
                                        {idx !== comp.rounds.length - 1 && (
                                            <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-slate-100" />
                                        )}
                                        <div className="absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center z-10">
                                            <span className="text-[10px] font-black text-blue-600">{idx + 1}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{round.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(round.date).toLocaleDateString()}
                                            </div>
                                            <p className="text-sm text-slate-600 font-medium">
                                                {round.description}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-sm font-bold">Rounds haven't been announced yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rules & Rewards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                Rewards
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                {comp.rewards || 'Exciting rewards await the winners!'}
                            </p>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-rose-500" />
                                Rules
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                {comp.rules || 'Standard competition rules apply.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar Stats & Actions */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md sticky top-6">
                        <div className="mb-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Organizer</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-bold text-slate-800">{comp.organizer}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                    <Calendar className="w-4 h-4" /> Start Date
                                </div>
                                <span className="text-xs font-black text-slate-800">
                                    {new Date(comp.startDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                    <Clock className="w-4 h-4" /> Deadline
                                </div>
                                <span className="text-xs font-black text-rose-600">
                                    {new Date(comp.deadline).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                    <Users className="w-4 h-4" /> Registered
                                </div>
                                <span className="text-xs font-black text-slate-800 font-mono">
                                    {comp.participants?.length || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                    <MapPin className="w-4 h-4" /> Mode
                                </div>
                                <span className="text-xs font-black text-blue-600">
                                    {comp.mode || 'Online'}
                                </span>
                            </div>
                        </div>

                        {temporalStatus === 'ENDED' ? (
                            <button className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl text-sm font-black uppercase tracking-widest cursor-not-allowed">
                                Competition Ended
                            </button>
                        ) : isRegistered ? (
                            <div className="space-y-4">
                                <div className="w-full py-4 bg-green-50 border border-green-200 text-green-600 rounded-2xl text-center text-sm font-black flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> Registered
                                </div>
                                <button 
                                    onClick={handleRegisterAction}
                                    disabled={isRegistering}
                                    className={clsx(
                                        "w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50",
                                        isConfirming 
                                            ? "bg-rose-600 text-white shadow-lg shadow-rose-200" 
                                            : "bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                                    )}
                                >
                                    {isRegistering ? (
                                        <div className="flex items-center gap-2">
                                            <div className={clsx("w-4 h-4 border-2 rounded-full animate-spin", isConfirming ? "border-white/30 border-t-white" : "border-rose-500/30 border-t-rose-500")} /> 
                                            {isRegistered ? 'Unregistering...' : 'Registering...'}
                                        </div>
                                    ) : isConfirming ? (
                                        'Confirm Unregister?'
                                    ) : (
                                        <>Unregister from Competition</>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleRegisterAction}
                                disabled={isRegistering}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isRegistering ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registering...
                                    </div>
                                ) : (
                                    <>Register Now <ChevronRight className="w-4 h-4" /></>
                                )}
                            </button>
                        )}

                        <p className="mt-4 text-[10px] text-slate-400 font-bold text-center leading-tight">
                            By registering, you agree to the competition rules and terms of service.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentCompetitionDetail;
