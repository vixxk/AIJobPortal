import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { User, Mail, Link as LinkIcon, CheckCircle, XCircle, ArrowLeft, Download, Users, Briefcase, Building, Award, FileText, Globe, Calendar, MapPin, Phone, ShieldCheck, Layers, Sparkles, Filter, ArrowUpDown, SlidersHorizontal, Zap, HelpCircle } from 'lucide-react';
import AIInterviewSetupModal from '../components/interview/AIInterviewSetupModal';

const ManageApplicants = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(null);
    const [notifyAppId, setNotifyAppId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState('SCORE_DESC'); // SCORE_DESC, DATE_DESC
    const [bulkUpdating, setBulkUpdating] = useState(false);
    const [shortlistKeywords, setShortlistKeywords] = useState("");
    const [isSmartMatching, setIsSmartMatching] = useState(false);
    const [skillPopover, setSkillPopover] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [showMatchInfo, setShowMatchInfo] = useState(false);
    const [setupModalApp, setSetupModalApp] = useState(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const addKeyword = (kw) => {
        const trimmed = kw.trim();
        if (!trimmed) return;
        
        let newKeywords = "";
        setShortlistKeywords(prev => {
            const current = (prev || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
            if (current.includes(trimmed.toLowerCase())) {
                newKeywords = prev;
                return prev;
            }
            newKeywords = prev ? `${prev}, ${trimmed}` : trimmed;
            return newKeywords;
        });
        
        // Trigger matching with a small delay to ensure state update
        setTimeout(() => handleSmartMatch(newKeywords), 100);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobRes = await axios.get(`/jobs/${jobId}`);
                if (jobRes.data.status === 'success') {
                    const jobData = jobRes.data.data.job;
                    setJob(jobData);
                    window.dispatchEvent(new CustomEvent('set-custom-header', {
                        detail: { title: jobData.title.length > 20 ? `${jobData.title.substring(0, 18)}...` : jobData.title }
                    }));
                }
                const appRes = await axios.get(`/applications/job/${jobId}`);
                if (appRes.data.status === 'success') {
                    setApplications(appRes.data.data.applications);
                }
            } catch (error) {
                console.error("Failed to fetch application data", error);
                setError("Failed to fetch application data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        return () => window.dispatchEvent(new CustomEvent('set-custom-header', { detail: null }));
    }, [jobId]);

    const updateStatus = async (appId, newStatus) => {
        setStatusUpdating(appId);
        try {
            const res = await axios.patch(`/applications/${appId}`, { status: newStatus });
            if (res.data.status === 'success') {
                setApplications(apps => apps.map(app =>
                    app._id === appId ? { ...app, status: newStatus } : app
                ));
            }
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Error updating application status");
        } finally {
            setStatusUpdating(null);
        }
    };

    const autoShortlist = async (targetCount = 5) => {
        let topCandidates = applications
            .filter(app => app.status === 'APPLIED')
            .map(app => {
                let bonus = 0;
                if (shortlistKeywords) {
                    const keywords = shortlistKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
                    const studentData = (
                        (app.studentId?.name || '') + ' ' +
                        (app.studentId?.expertise || []).join(' ') + ' ' +
                        (app.studentProfile?.skills || []).join(' ') + ' ' +
                        (app.studentProfile?.summary || '')
                    ).toLowerCase();
                    
                    keywords.forEach(k => {
                        if (studentData.includes(k)) bonus += 10;
                    });
                }
                return { ...app, currentScore: (app.matchingScore || 40) + bonus };
            })
            .sort((a, b) => b.currentScore - a.currentScore);

        const aboveThreshold = topCandidates.filter(c => c.currentScore >= 60).slice(0, targetCount);
        
        let toShortlist = aboveThreshold;

        if (aboveThreshold.length === 0 && topCandidates.length > 0) {
            const bestCandidate = topCandidates[0];
            const confirmBest = window.confirm(`No eligible candidates found above 60% match. Would you like to shortlist the best matching candidate: ${bestCandidate.studentId?.name} (${bestCandidate.currentScore}%)?`);
            
            if (confirmBest) {
                toShortlist = [bestCandidate];
            } else {
                return;
            }
        } else if (toShortlist.length === 0) {
            alert("No candidates available for shortlisting.");
            return;
        }

        if (!window.confirm(`Auto-shortlist ${toShortlist.length} candidate(s)?`)) return;

        setBulkUpdating(true);
        try {
            await Promise.all(toShortlist.map(app => 
                axios.patch(`/applications/${app._id}`, { status: 'SHORTLISTED' })
            ));
            
            setApplications(apps => apps.map(app => {
                const isSelected = toShortlist.some(tc => tc._id === app._id);
                return isSelected ? { ...app, status: 'SHORTLISTED' } : app;
            }));
            
            alert(`Successfully shortlisted ${toShortlist.length} candidate(s)!`);
        } catch (error) {
            console.error("Bulk update failed", error);
            alert("Failed to shortlist some candidates.");
        } finally {
            setBulkUpdating(false);
        }
    };
    
    const handleSmartMatch = async (forceKeywords = null) => {
        // Defensive check: if called as an event handler (onBlur), forceKeywords will be an event object
        const keywordsToUse = (forceKeywords && typeof forceKeywords === 'string') 
            ? forceKeywords 
            : shortlistKeywords;

        if (!keywordsToUse && (forceKeywords === null || typeof forceKeywords !== 'string')) return;
        
        setIsSmartMatching(true);
        try {
            const res = await axios.post(`/applications/job/${jobId}/smart-match`, { keywords: keywordsToUse });
            if (res.data.status === 'success') {
                setApplications(res.data.data.applications);
                setSortBy('SCORE_DESC');
            }
        } catch (error) {
            console.error("Smart match failed", error);
            alert("Failed to perform smart matching.");
        } finally {
            setIsSmartMatching(false);
        }
    };

    const filteredApplications = applications
        .filter(app => filterStatus === 'ALL' || app.status === filterStatus)
        .sort((a, b) => {
            if (sortBy === 'SCORE_DESC') return (b.matchingScore || 0) - (a.matchingScore || 0);
            if (sortBy === 'DATE_DESC') return new Date(b.createdAt) - new Date(a.createdAt);
            return 0;
        });
    const ManageSkeleton = () => (
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse p-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100" />
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-slate-200 rounded" />
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100" />
                ))}
            </div>
        </div>
    );

    if (loading) return <ManageSkeleton />;
    if (error) {
        return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
    }
    if (!job) {
        return <div className="p-8 text-center text-red-500 font-medium">Job not found</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Control Bar */}
            <div className="bg-white p-3 md:p-4 rounded-[24px] md:rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    <div className="flex bg-slate-100 p-1 rounded-xl md:rounded-2xl shrink-0">
                        {['ALL', 'APPLIED', 'SHORTLISTED', 'HIRED', 'REJECTED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 md:px-4 py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all ${filterStatus === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex-1 md:flex-none flex items-center md:min-w-[320px] px-3 md:px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl transition-all h-10 md:h-11">
                        <Filter className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                        <input 
                            type="text" 
                            placeholder={isMobile ? "Search..." : "AI Search Keywords..."}
                            className="bg-transparent text-[11px] md:text-sm font-bold text-slate-700 outline-none w-full"
                            value={shortlistKeywords}
                            onChange={(e) => setShortlistKeywords(e.target.value)}
                            onBlur={() => handleSmartMatch()}
                            onKeyDown={(e) => e.key === 'Enter' && handleSmartMatch()}
                        />
                        <div className="relative flex items-center shrink-0 ml-1">
                            <button 
                                onClick={() => setShowMatchInfo(!showMatchInfo)}
                                className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                <HelpCircle className="w-3.5 h-3.5" />
                            </button>
                            
                            {showMatchInfo && (
                                <>
                                    <div className="fixed inset-0 z-[100]" onClick={() => setShowMatchInfo(false)} />
                                    <div className="absolute top-full right-0 mt-3 w-64 md:w-80 bg-slate-900 text-white rounded-2xl shadow-2xl p-4 z-[110] animate-in zoom-in-95 fade-in duration-200 origin-top-right border border-slate-800">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap className="w-4 h-4 text-amber-400" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-200">How AI Matching Works</h4>
                                        </div>
                                        <div className="space-y-3 text-[11px] leading-relaxed text-slate-300 font-medium">
                                            <p><span className="text-indigo-400 font-bold">1. Title Relevancy (40%):</span> Compares the student's background against the job title.</p>
                                            <p><span className="text-emerald-400 font-bold">2. Keyword Accuracy (60%):</span> Strongly weights candidates who possess the exact labels or skills you search for.</p>
                                            <p><span className="text-amber-400 font-bold">3. Top Picks:</span> Experts with an 80%+ match are identified as high-priority talent for your requirements.</p>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 italic">
                                            Pro Tip: Click candidate skills to instantly update your global AI filter.
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <button 
                            onClick={() => handleSmartMatch()}
                            className="p-1 md:p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all ml-1 shrink-0"
                            title="AI Match"
                        >
                            <Zap className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
                    <div className="relative">
                        <button 
                            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl md:rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="hidden md:inline text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Sort</span>
                            <span className="text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-tight">
                                {sortBy === 'SCORE_DESC' ? 'Match' : 'Recent'}
                            </span>
                        </button>

                        {sortDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-[80]" onClick={() => setSortDropdownOpen(false)} />
                                <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[90] p-2 animate-in slide-in-from-top-2 fade-in duration-200 origin-top-left md:origin-top-right">
                                    <button 
                                        onClick={() => { setSortBy('SCORE_DESC'); setSortDropdownOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${sortBy === 'SCORE_DESC' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <Zap className="w-4 h-4" />
                                        <span className="text-[11px] font-black uppercase tracking-wider">Highest Match</span>
                                    </button>
                                    <button 
                                        onClick={() => { setSortBy('DATE_DESC'); setSortDropdownOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${sortBy === 'DATE_DESC' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[11px] font-black uppercase tracking-wider">Newest First</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => autoShortlist(5)}
                        disabled={bulkUpdating || applications.filter(a => a.status === 'APPLIED').length === 0}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-2 bg-indigo-600 text-white text-[11px] md:text-xs font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 uppercase tracking-wider overflow-hidden group"
                    >
                        <Sparkles className={`w-3.5 h-3.5 ${isSmartMatching ? 'animate-pulse' : ''} text-amber-300`} /> 
                        <span className="relative z-10">{bulkUpdating ? '...' : 'AI Shortlist'}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApplications.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">No applicants yet.</h3>
                        <p className="text-slate-500 mt-1 text-sm">Applications for this role will appear here.</p>
                    </div>
                ) : (
                    filteredApplications.map((app) => (
                        <div 
                            key={app._id} 
                            className={`bg-white rounded-3xl border shadow-sm flex flex-col hover:shadow-md transition-all relative ${app.matchingScore >= 80 ? 'border-indigo-200 ring-1 ring-indigo-50' : 'border-slate-200'} ${skillPopover === app._id ? 'z-50 shadow-xl' : 'z-0'}`}
                        >
                            {app.matchingScore >= 80 && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-[10px] font-black text-white rounded-b-2xl uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-xl shadow-indigo-500/20 z-10 border-x border-b border-indigo-400/30">
                                    <Sparkles className="w-3 h-3 text-amber-300" />
                                    <span>AI Top Pick</span>
                                </div>
                            )}
                            <div className="p-4 md:p-5 flex-1">
                                <div className="flex items-start justify-between mb-4 md:mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 shadow-inner">
                                            {app.studentProfile?.profileImage || app.studentId?.avatar ? (
                                                <img src={app.studentProfile?.profileImage || app.studentId?.avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                                    <User className="w-6 h-6 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-900 line-clamp-1 text-[15px] md:text-[17px] tracking-tight">{app.studentId?.name}</h4>
                                            <p className="text-[11px] font-semibold text-slate-400 tracking-tight truncate max-w-[120px] md:max-w-none">{app.studentId?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm ${app.status === 'APPLIED' ? 'bg-blue-600 text-white' :
                                            app.status === 'SHORTLISTED' ? 'bg-amber-500 text-white' :
                                                app.status === 'HIRED' ? 'bg-emerald-500 text-white' :
                                                    'bg-rose-500 text-white'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 md:space-y-5">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Match Score</p>
                                                <span className={`text-[13px] font-black ${app.matchingScore > 75 ? 'text-emerald-600' : app.matchingScore > 50 ? 'text-indigo-600' : 'text-slate-500'}`}>
                                                    {app.matchingScore || 40}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 md:h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${app.matchingScore > 75 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : app.matchingScore > 50 ? 'bg-gradient-to-r from-indigo-400 to-indigo-600' : 'bg-slate-300'}`}
                                                    style={{ width: `${app.matchingScore || 40}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="pl-4">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-lg border border-indigo-100 shadow-sm active:scale-95 transition-transform cursor-pointer">
                                                <Sparkles className="w-3 h-3" /> AI Analysis
                                            </div>
                                        </div>
                                    </div>

                                    {app.aiSummary && (
                                        <div className="relative">
                                            <p className="text-[11px] md:text-[12px] text-slate-600 font-medium leading-[1.6] bg-slate-50/70 p-3 md:p-3.5 rounded-2xl border border-slate-100 italic relative z-10">
                                            "{app.aiSummary}"
                                            </p>
                                            <div className="absolute top-2 right-2 opacity-5">
                                                <Zap className="w-8 h-8 text-indigo-600" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative">
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {(app.studentProfile?.skills || []).slice(0, 3).map((skill, i) => (
                                                <button 
                                                    key={i} 
                                                    onClick={() => addKeyword(skill)}
                                                    className="text-[9px] md:text-[10px] bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm font-bold uppercase tracking-tight hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95 whitespace-nowrap"
                                                >
                                                    {skill}
                                                </button>
                                            ))}
                                            {(app.studentProfile?.skills?.length > 3) && (
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setSkillPopover(skillPopover === app._id ? null : app._id)}
                                                        className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all active:scale-95 flex items-center gap-1 shrink-0 ${skillPopover === app._id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}
                                                    >
                                                        +{app.studentProfile.skills.length - 3}
                                                    </button>
                                                    
                                                    {skillPopover === app._id && (
                                                        <>
                                                            {/* Desktop Popover */}
                                                            <div className="hidden md:block absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-[80] animate-in slide-in-from-top-2 fade-in duration-200 origin-top">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Deep Tech Stack</p>
                                                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                                                    {(app.studentProfile?.skills || []).slice(3).map((skill, i) => (
                                                                        <button 
                                                                            key={i} 
                                                                            onClick={() => {
                                                                                addKeyword(skill);
                                                                                setSkillPopover(null);
                                                                            }}
                                                                            className="text-[9px] bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-100 font-black uppercase hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                                                                        >
                                                                            {skill}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Mobile Bottom Sheet Overlay */}
                                                            <div className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100] animate-in fade-in duration-300" onClick={() => setSkillPopover(null)}>
                                                                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                                                                    <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Candidate Tech Stack</h3>
                                                                        <button onClick={() => setSkillPopover(null)} className="text-xs font-bold text-slate-400">Close</button>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto pb-8">
                                                                        {(app.studentProfile?.skills || []).map((skill, i) => (
                                                                            <button 
                                                                                key={i} 
                                                                                onClick={() => {
                                                                                    addKeyword(skill);
                                                                                    setSkillPopover(null);
                                                                                }}
                                                                                className="text-[10px] bg-slate-50 text-slate-600 px-3 py-2 rounded-xl border border-slate-100 font-black uppercase hover:bg-indigo-600 hover:text-white"
                                                                            >
                                                                                {skill}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 md:gap-3 pt-1">
                                        <button 
                                            onClick={() => setSelectedStudent({ ...app.studentId, profile: app.studentProfile })}
                                            className="py-2.5 bg-white text-slate-700 text-[11px] md:text-[12px] font-black rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm uppercase tracking-wider"
                                        >
                                            <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-500" /> Profile
                                        </button>
                                        <button 
                                            onClick={() => setNotifyAppId(app._id)}
                                            className="py-2.5 bg-indigo-600 text-white text-[11px] md:text-[12px] font-black rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100 uppercase tracking-wider"
                                        >
                                            <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" /> Message
                                        </button>
                                        
                                        <div className="col-span-2 space-y-2 mt-1">
                                            {app.resume && (
                                                <a 
                                                    href={app.resume.startsWith('http') ? app.resume : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${app.resume}`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="w-full h-[42px] flex items-center justify-center gap-2 px-4 text-[11px] md:text-[12px] font-bold text-blue-700 bg-blue-50/50 hover:bg-blue-50 rounded-xl border border-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    <Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> {app.resume === app.studentProfile?.resumeUrl ? 'Profile Resume' : 'Specific Job Resume'}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                                {app.status === 'APPLIED' && (
                                    <>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => updateStatus(app._id, 'SHORTLISTED')}
                                            className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                        >
                                            Shortlist
                                        </button>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => updateStatus(app._id, 'REJECTED')}
                                            className="flex-1 py-2 bg-white border border-red-200 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {app.status === 'SHORTLISTED' && (
                                    <>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => setSetupModalApp(app)}
                                            className="flex-1 py-2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider hover:bg-indigo-100 hover:border-indigo-300 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" /> AI Interview
                                        </button>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => updateStatus(app._id, 'HIRED')}
                                            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> finalize Hire
                                        </button>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => updateStatus(app._id, 'REJECTED')}
                                            className="px-3 py-2 bg-white border border-red-200 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                {(app.status === 'HIRED' || app.status === 'REJECTED') && (
                                    <div className="w-full text-center py-1.5 text-sm font-medium text-slate-400 font-bold uppercase tracking-wider">
                                        Decision: {app.status}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <StudentProfileModal 
                student={selectedStudent} 
                onClose={() => setSelectedStudent(null)} 
            />

            <NotificationModal 
                applicationId={notifyAppId}
                onClose={() => setNotifyAppId(null)}
            />

            <AIInterviewSetupModal 
                isOpen={!!setupModalApp}
                onClose={() => setSetupModalApp(null)}
                application={setupModalApp}
                job={job}
            />
        </div>
    );
};

const StudentProfileModal = ({ student, onClose }) => {
    if (!student) return null;
    const profile = student.profile || {};

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-2 mb-3 mt-6">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
        </div>
    );

    const DataRow = ({ label, value }) => (
        <div className="flex flex-col py-2 border-b border-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            <span className="text-[13px] font-semibold text-slate-700">{value || 'N/A'}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <div className="relative h-32 bg-gradient-to-r from-slate-800 to-slate-900 shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-20">
                        <XCircle className="w-6 h-6" />
                    </button>
                    <div className="absolute -bottom-12 left-8 w-28 h-28 rounded-[32px] bg-white p-1.5 shadow-xl border border-slate-100 flex items-center justify-center overflow-hidden">
                        {profile.profileImage || student.avatar ? (
                            <img src={profile.profileImage || student.avatar} alt="Profile" className="w-full h-full object-cover rounded-[24px]" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-[24px]">
                                <User className="w-10 h-10 text-slate-300" />
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="px-8 pb-10 overflow-y-auto no-scrollbar flex-1 pt-14">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                {student.name}
                                {student.nickname && <span className="text-lg font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-xl">"{student.nickname}"</span>}
                            </h2>
                            <p className="text-slate-500 font-bold mt-1 uppercase tracking-wider text-xs">
                                {profile.currentPosition || 'N/A'}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                             {profile.jobSeekingStatus && (
                                <span className={`px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border shadow-sm ${
                                    profile.jobSeekingStatus === 'Actively looking for jobs' ? 'bg-green-50 text-green-600 border-green-100' :
                                    profile.jobSeekingStatus === 'Passively looking for jobs' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                    {profile.jobSeekingStatus}
                                </span>
                             )}
                             {profile.expectedSalary?.minimum && (
                                <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm flex items-center gap-1.5">
                                    <IndianRupee className="w-3 h-3" /> 
                                    {profile.expectedSalary.minimum} - {profile.expectedSalary.maximum} {profile.expectedSalary.currency || 'INR'} / {profile.expectedSalary.frequency?.split(' ')[1] || 'yr'}
                                </span>
                             )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <DataRow label="Email" value={student.email} />
                        <DataRow label="Phone" value={student.phoneNumber} />
                        <DataRow label="Gender" value={student.gender} />
                        <DataRow label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'} />
                        <DataRow label="Country" value={student.country} />
                        <DataRow label="Address" value={profile.address} />
                        <DataRow label="Last Updated" value={new Date(profile.updatedAt || Date.now()).toLocaleDateString()} />
                        <div className="flex flex-col py-2 border-b border-slate-50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Major expertise</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {(student.expertise || []).map((exp, i) => (
                                    <span key={i} className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">{exp}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div>
                                <SectionHeader icon={FileText} title="Professional Summary" />
                                <div className="text-slate-600 text-sm leading-relaxed bg-white p-5 rounded-2xl border border-slate-100 ring-4 ring-slate-50/50">
                                    {profile.summary || "No professional summary provided."}
                                </div>
                            </div>

                            <div>
                                <SectionHeader icon={ShieldCheck} title="Core Skills & Expertise" />
                                <div className="flex flex-wrap gap-2">
                                    {(profile.skills || []).map((skill, i) => (
                                        <span key={i} className="px-3.5 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[11px] font-black border border-indigo-100/50 shadow-sm uppercase tracking-wider">{skill}</span>
                                    ))}
                                    {(!profile.skills || profile.skills.length === 0) && <p className="text-slate-400 text-xs italic ml-1">No skills listed</p>}
                                </div>
                            </div>

                            {profile.experience?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Briefcase} title="Work Experience" />
                                    <div className="space-y-6 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100">
                                        {profile.experience.map((exp, i) => (
                                            <div key={i} className="flex gap-4 relative pl-1">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm z-10 ring-4 ring-white">
                                                    <Briefcase className="w-5 h-5 text-indigo-500" />
                                                </div>
                                                <div className="pt-0.5">
                                                    <h4 className="font-bold text-slate-900 text-[15px] leading-tight">{exp.position}</h4>
                                                    <p className="text-[13px] text-slate-500 font-semibold">{exp.company}</p>
                                                    <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest bg-slate-50 inline-block px-2 py-0.5 rounded">
                                                        {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                    </p>
                                                    {exp.description && <p className="text-[12px] text-slate-600 mt-2.5 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">{exp.description}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.certifications?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Award} title="Certifications & Licenses" />
                                    <div className="grid grid-cols-1 gap-3">
                                        {profile.certifications.map((cert, i) => (
                                            <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50/50 transition-colors shadow-sm flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/20">
                                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{cert.title}</h4>
                                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">{cert.publishingOrganization}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        {cert.dateOfIssue && <span className="text-[10px] text-slate-400 font-medium">Issued: {new Date(cert.dateOfIssue).toLocaleDateString()}</span>}
                                                        {cert.credentialUrl && (
                                                            <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-black flex items-center gap-1 hover:underline">
                                                                VERIFY <LinkIcon className="w-2.5 h-2.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.references?.length > 0 && (
                                <div>
                                    <SectionHeader icon={User} title="References" />
                                    <div className="space-y-3">
                                        {profile.references.map((ref, i) => (
                                            <div key={i} className="p-4 rounded-3xl border border-slate-100 bg-slate-50 shadow-sm">
                                                <h4 className="text-sm font-bold text-slate-900">{ref.name}</h4>
                                                <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">{ref.occupation} at {ref.company}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <p className="text-[11px] font-bold text-blue-600 flex items-center gap-1"><Mail className="w-3 h-3" /> {ref.email}</p>
                                                    <p className="text-[11px] font-bold text-blue-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {ref.phoneNumber}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                             {profile.education?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Building} title="Education History" />
                                    <div className="space-y-4">
                                        {profile.education.map((edu, i) => (
                                            <div key={i} className="flex gap-4 p-5 rounded-[28px] border border-slate-100 bg-white shadow-sm ring-4 ring-slate-50/50">
                                                <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100/50 shadow-inner">
                                                    <Building className="w-5 h-5 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-sm leading-tight pr-4">{edu.degree}</h4>
                                                    <p className="text-xs text-slate-500 font-bold mt-0.5 uppercase tracking-tighter">{edu.institution}</p>
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                            Class of {new Date(edu.endDate).getFullYear()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.projects?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Layers} title="Portfolio Projects" />
                                    <div className="space-y-4">
                                        {profile.projects.map((proj, i) => (
                                            <div key={i} className="p-5 rounded-3xl border border-slate-100 bg-white hover:border-indigo-200 transition-all shadow-sm">
                                                <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                                                    {proj.title}
                                                    {proj.url && (
                                                        <a href={proj.url} target="_blank" rel="noreferrer" className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors">
                                                            <LinkIcon className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </h4>
                                                <p className="text-[12px] text-slate-600 mt-2 leading-relaxed">{proj.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.professionalExams?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Globe} title="Professional Exams" />
                                    <div className="grid grid-cols-2 gap-3">
                                        {profile.professionalExams.map((exam, i) => (
                                            <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-center">
                                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{exam.title}</h4>
                                                <p className="text-xl font-black text-slate-900 mt-1">{exam.score}</p>
                                                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase leading-none">Taken {new Date(exam.dateTaken).getFullYear()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.seminars?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Calendar} title="Seminars & Training" />
                                    <div className="space-y-3">
                                        {profile.seminars.map((sem, i) => (
                                            <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                                                <h4 className="text-sm font-bold text-slate-900">{sem.topic}</h4>
                                                <p className="text-[11px] text-slate-500 font-bold mt-0.5">{sem.organizer}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {new Date(sem.startDate).getFullYear()} - {sem.current ? 'Present' : new Date(sem.endDate).getFullYear()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.languages?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Globe} title="Languages" />
                                    <div className="flex flex-wrap gap-2.5">
                                        {profile.languages.map((lang, i) => (
                                            <div key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl text-xs font-bold flex flex-col">
                                                <span className="text-[13px]">{lang.language}</span>
                                                <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter opacity-80">{lang.proficiency}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.awards?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Award} title="Awards & Honors" />
                                    <div className="space-y-3">
                                        {profile.awards.map((award, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 shadow-sm shadow-amber-500/5">
                                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                                                    <Award className="w-5 h-5 text-amber-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-black text-amber-900 leading-tight">{award.title}</h4>
                                                    <p className="text-[10px] text-amber-700 font-bold uppercase mt-1">{award.issuer} • {new Date(award.dateAwarded).getFullYear()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.affiliations?.length > 0 && (
                                <div>
                                    <SectionHeader icon={LinkIcon} title="Affiliations" />
                                    <div className="space-y-3">
                                        {profile.affiliations.map((aff, i) => (
                                            <div key={i} className="p-4 rounded-3xl border border-slate-100 bg-white">
                                                <h4 className="text-sm font-bold text-slate-900">{aff.role}</h4>
                                                <p className="text-[11px] font-bold text-slate-500">{aff.organization}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotificationModal = ({ applicationId, onClose }) => {
    const [type, setType] = useState('MESSAGE'); // MESSAGE or MEETING
    const [message, setMessage] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [sending, setSending] = useState(false);

    if (!applicationId) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await axios.post('/applications/notify', {
                applicationId,
                type,
                message,
                meetingLink,
                scheduledDate,
                scheduledTime
            });
            if (res.data.status === 'success') {
                alert('Notification sent successfully!');
                onClose();
            }
        } catch (error) {
            console.error("Failed to send notification", error);
            alert(error.response?.data?.message || "Failed to send notification");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl flex flex-col p-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Send Notification</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex p-1 bg-slate-100 rounded-2xl mb-4">
                        <button
                            type="button"
                            onClick={() => setType('MESSAGE')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${type === 'MESSAGE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Custom Message
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('MEETING')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${type === 'MEETING' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Schedule Interview
                        </button>
                    </div>

                    {type === 'MEETING' && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Meeting Link</label>
                                <input
                                    required
                                    type="url"
                                    placeholder="https://zoom.us/j/..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={meetingLink}
                                    onChange={(e) => setMeetingLink(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Time</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                            {type === 'MESSAGE' ? 'Your Message' : 'Additional Message (Optional)'}
                        </label>
                        <textarea
                            required={type === 'MESSAGE'}
                            rows="4"
                            placeholder={type === 'MESSAGE' ? "Enter your custom message here..." : "Any additional details for the student..."}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <p className="text-[11px] text-slate-500 text-center px-4 font-medium italic">
                        The student will receive this as both a platform notification and an email.
                    </p>

                    <button
                        disabled={sending}
                        type="submit"
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                    >
                        {sending ? 'Sending...' : 'Send Notification'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ManageApplicants;
