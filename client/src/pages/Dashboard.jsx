import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import {
    Home, Briefcase, BookOpen, Trophy,
    Users, Settings, LogOut, Bell,
    MessageSquare, FileText, CheckCircle, Orbit,
    Search, MapPin, Bookmark, ChevronRight,
    Sparkles, ArrowRight, SlidersHorizontal, Menu,
    MonitorPlay, Rocket, Headphones, Crown
} from 'lucide-react';
import JobDetailsModal from '../components/JobDetailsModal';
import SkeletonJobCard from '../components/SkeletonJobCard';
import NotificationsDropdown from '../components/NotificationsDropdown';
import TutorialOverlay from '../components/TutorialOverlay';
const JobCard = ({ job, onClick, initiallySaved, onToggleSave, className }) => {
    const [saved, setSaved] = useState(initiallySaved);

    useEffect(() => {
        setSaved(initiallySaved);
    }, [initiallySaved]);
    const handleSave = async (e) => {
        e.stopPropagation();
        try {
            const title = job.title || 'Untitled Position';
            const company = job.company || job.companyName || 'Organization';
            const jobId = job._id || job.id || job.link || `${title}-${company}`.replace(/\s+/g, '-').toLowerCase();
            if (saved) {
                await axios.delete('/jobs/unsave', {
                    data: { jobId }
                });
                setSaved(false);
                if (onToggleSave) onToggleSave(jobId, false);
            } else {
                await axios.post('/jobs/save', { job });
                setSaved(true);
                if (onToggleSave) onToggleSave(jobId, true);
            }
        } catch (err) {
            console.error('Failed to toggle save job', err);
        }
    };
    return (
        <div onClick={() => onClick(job)} className={clsx("bg-white rounded-[16px] md:rounded-[24px] p-4 md:p-5 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] cursor-pointer hover:shadow-[0_8px_30px_-10px_rgba(37,99,235,0.15)] hover:border-blue-100 transition-all mb-4 relative", className)}>
            <div className="flex justify-between items-start mb-2 md:mb-3">
                <div className="flex gap-3 md:gap-4">
                    <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center bg-white shadow-sm overflow-hidden shrink-0 relative">
                        {job.logo && (
                            <img
                                src={job.logo}
                                alt={job.company}
                                className="w-8 h-8 object-contain"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'block';
                                }}
                            />
                        )}
                        <span
                            className="font-bold text-slate-700"
                            style={{ display: job.logo ? 'none' : 'block' }}
                        >
                            {(job.company || '?').charAt(0)}
                        </span>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-slate-900 tracking-tight text-[16px] leading-tight mb-1">{job.title}</h4>
                        <p className="text-[13px] font-medium text-slate-500 leading-none">{job.company}</p>
                    </div>
                </div>
                <button onClick={handleSave} className={`${saved ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-blue-600 hover:bg-blue-50'} p-1 md:p-1.5 rounded-lg -mt-1 -mr-1 md:mt-0 md:mr-0 z-10 transition-colors`}>
                    <Bookmark className="w-5 h-5" strokeWidth={2.5} fill={saved ? 'currentColor' : 'none'} />
                </button>
            </div>
            <div className="mt-3 flex flex-col justify-end">
                {job.salary && job.salary !== 'Not specified' && job.salary !== 'Salary Undisclosed' && (
                    <p className="text-[13px] font-bold text-blue-600 tracking-tight self-end mb-2">{job.salary}</p>
                )}
                <div className="flex justify-between items-center w-full gap-2 mt-auto">
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-600 flex items-center justify-center whitespace-nowrap shrink-0">
                            {job.type === 'contract' ? 'Contract' : job.type === 'internship' ? 'Intern' : 'Full Time'}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-600 flex items-center justify-center whitespace-nowrap shrink-0">
                            {job.location?.toLowerCase().includes('remote') ? 'Remote' : 'Onsite'}
                        </span>
                    </div>
                    <span className="text-[11px] md:text-[12px] font-medium text-slate-500 truncate text-right">
                        {job.location || 'Remote Options'}
                    </span>
                </div>
            </div>
        </div>
    )
};

const AutoCarousel = ({ items, renderItem, autoSlideInterval = 3000 }) => {
    const [index, setIndex] = useState(0);
    const [autoSlide, setAutoSlide] = useState(true);
    const containerRef = useRef(null);
    const interactionTimerRef = useRef(null);
    const isProgrammaticScroll = useRef(false);

    const handleScroll = (e) => {
        if (isProgrammaticScroll.current) return;
        const scrollLeft = e.target.scrollLeft;
        const itemWidth = 280 + 16;
        const newIndex = Math.round(scrollLeft / itemWidth);
        if (newIndex !== index && newIndex >= 0 && newIndex < items.length) {
            setIndex(newIndex);
        }
    };

    const handleInteraction = () => {
        setAutoSlide(false);
        if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
        interactionTimerRef.current = setTimeout(() => setAutoSlide(true), 8000);
    };

    // Auto sliding effect
    useEffect(() => {
        if (!autoSlide || items.length <= 1) return;
        const timer = setInterval(() => {
            setIndex(prev => (prev + 1) % items.length);
        }, autoSlideInterval);
        return () => clearInterval(timer);
    }, [autoSlide, items.length, autoSlideInterval]);

    // Programmatic scroll to index
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !autoSlide) return;

        const itemWidth = 280 + 16;
        const target = index * itemWidth;
        
        if (Math.abs(container.scrollLeft - target) > 5) {
            isProgrammaticScroll.current = true;
            // Temporarily disable snapping to allow smooth programmatic scroll
            container.style.scrollSnapType = 'none';
            container.scrollTo({ left: target, behavior: 'smooth' });
            
            // Re-enable snapping and allow manual scroll tracking after animation
            const timeout = setTimeout(() => {
                if (containerRef.current) containerRef.current.style.scrollSnapType = 'x mandatory';
                isProgrammaticScroll.current = false;
            }, 600);
            return () => {
                clearTimeout(timeout);
                isProgrammaticScroll.current = false;
            };
        }
    }, [index, autoSlide]);

    return (
        <div className="relative group/carousel">
            <div
                ref={containerRef}
                onScroll={handleScroll}
                onTouchStart={handleInteraction}
                onMouseDown={handleInteraction}
                className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 pb-4 px-5"
            >
                {items.map((item, i) => (
                    <div key={i} className="shrink-0 first:pl-0 last:pr-0">
                        {renderItem(item)}
                    </div>
                ))}
            </div>            
            {items?.length > 1 && (
                <div className="flex justify-center gap-2 mt-[-10px] mb-4">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setIndex(idx);
                                handleInteraction();
                            }}
                            className={clsx(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                index === idx 
                                    ? "bg-blue-600 w-6" 
                                    : "bg-slate-200"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toggleSidebar } = useOutletContext() || {};
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };
    const greeting = getGreeting();
    const [selectedJob, setSelectedJob] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [savedJobsIds, setSavedJobsIds] = useState(new Set());
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [profile, setProfile] = useState(null);
    const [specialJobs, setSpecialJobs] = useState([]);
    const [loadingSpecial, setLoadingSpecial] = useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    const tutorialSteps = [
        { 
            target: '[data-tutorial-id="feature-3"]', 
            title: 'Skill Learning', 
            content: 'Master new technologies and industry-standard tools with curated courses from industry experts.' 
        },
        { 
            target: '[data-tutorial-id="feature-4"]', 
            title: 'AI English Tutor', 
            content: 'Improve your communication skills with personalized spoken practice and grammar guidance from our AI tutor.' 
        },
        { 
            target: '[data-tutorial-id="feature-1"]', 
            title: 'Resume Builder', 
            content: 'Create a professional, ATS-optimized resume in minutes. Choose from premium templates designed to get you hired.' 
        },
        { 
            target: '[data-tutorial-id="feature-2"]', 
            title: 'AI Mock Interviews', 
            content: 'Practice your interview skills with our advanced AI interviewer. Get real-time feedback on your performance.' 
        },
        { 
            target: '[data-tutorial-id="feature-5"]', 
            title: 'Hyrego Job Postings', 
            content: 'Access exclusive job postings from top companies directly on Hyrego. These are high-priority roles just for you.' 
        },
        { 
            target: '[data-tutorial-id="feature-0"]', 
            title: 'Global Job Search', 
            content: 'Explore thousands of job opportunities from around the world. Filter by role, location, and salary to find your perfect match.' 
        },
    ];


    const fetchStudentProfile = useCallback(async () => {
        if (user?.role === 'STUDENT') {
            try {
                const res = await axios.get('/student/me');
                if (res.data.status === 'success') {
                    setProfile(res.data.data.profile);
                }
            } catch (err) {
                console.error("Failed to fetch student profile", err);
            }
        }
    }, [user]);

    useEffect(() => {
        // Consolidated in the mount effect below
    }, []);
    const fetchSavedData = useCallback(async () => {
        try {
            const savedRes = await axios.get('/jobs/saved')
                .catch(() => ({ data: { jobs: [] } }));
            const savedIds = new Set(
                (savedRes.data.jobs || []).map(sj => {
                    const title = sj.title || 'Untitled Position';
                    const company = sj.company || sj.companyName || 'Organization';
                    return sj._id || sj.id || sj.link || `${title}-${company}`.replace(/\s+/g, '-').toLowerCase();
                })
            );
            setSavedJobsIds(savedIds);
        } catch (err) {}
    }, []);

    useEffect(() => {
        // Consolidated in the mount effect below
    }, []);
    const [error, setError] = useState(null);
    const fetchRecentData = useCallback(async () => {
        setLoadingJobs(true);
        setError(null);
        try {
            const cacheKey = `dashboard_recent_jobs_${activeCategory}`;
            const cachedJobs = sessionStorage.getItem(cacheKey);
            if (cachedJobs) {
                setRecentJobs(JSON.parse(cachedJobs).slice(0, 3));
            } else {
                const roleQuery = activeCategory === 'All' ? '' : activeCategory;
                try {
                    const jobsRes = await axios.get('/jobs/search', {
                        params: { role: roleQuery }
                    });
                    const fetchedJobs = (jobsRes.data.jobs || []).filter(job => !job.isInternal).slice(0, 3);
                    setRecentJobs(fetchedJobs);
                    if (fetchedJobs.length > 0) {
                        sessionStorage.setItem(cacheKey, JSON.stringify(fetchedJobs));
                    }
                } catch (apiErr) {
                    if (apiErr.response && apiErr.response.status === 429) {
                        setError("Too many requests to the job board. Please try again in a few moments.");
                    } else {
                        setError("Could not load jobs at this time.");
                    }
                    setRecentJobs([]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch recent jobs', err);
            setError("An unexpected error occurred.");
        } finally {
            setLoadingJobs(false);
        }
    }, [activeCategory]);

    const fetchSpecialJobs = useCallback(async () => {
        if (user?.role === 'STUDENT') {
            setLoadingSpecial(true);
            try {
                const res = await axios.get('/jobs', { params: { limit: 3 } });
                if (res.data.status === 'success') {
                    setSpecialJobs(res.data.data.jobs);
                }
            } catch (err) {
                console.error("Failed to fetch special jobs", err);
            } finally {
                setLoadingSpecial(false);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchStudentProfile();
        fetchSavedData();
        fetchSpecialJobs();
    }, []); // Run once on mount

    useEffect(() => {
        fetchRecentData();
    }, [fetchRecentData]); // Run when activeCategory changes (since fetchRecentData depends on it)
    const features = [
        { title: 'Global Job Search', desc: 'Find Best Matches', icon: Search, color: 'text-blue-600', bg: 'bg-blue-50', link: '/app/jobs' },
        { title: 'Resume\nBuilder', desc: 'Optimized for ATS', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', link: '/app/resume' },
        { title: 'AI Mock Interviews', desc: 'Practice with AI', icon: MonitorPlay, color: 'text-orange-600', bg: 'bg-orange-50', link: '/app/interview' },
        { title: 'Skill\nLearning', desc: 'Online Classes', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/app/learning' },
        { title: 'AI English Tutor', desc: 'Spoken Practice', icon: Headphones, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/app/english-tutor' },
        { title: 'Hyrego Job Postings', desc: 'Top Companies', icon: Rocket, color: 'text-rose-600', bg: 'bg-rose-50', link: '/app/hyrego-jobs' },
    ];
    const name = user?.name || "Andrew Ainsley";
    const firstName = name.split(' ')[0];
    return (
        <>
            <div className="hidden md:block max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="hidden md:block relative w-full h-[320px] bg-gradient-to-r from-[#3872FA] to-[#1e40af] rounded-[48px] mb-12 overflow-hidden shadow-2xl shadow-blue-500/20 group">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[70%] bg-white opacity-[0.08] rounded-full blur-3xl transform rotate-12"></div>
                        <div className="absolute bottom-[-20%] right-[10%] w-[50%] h-[80%] bg-blue-400 opacity-[0.15] rounded-full blur-3xl transform -rotate-12"></div>
                    </div>
                    <div className="relative h-full flex flex-col justify-center px-16 z-10">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full mb-6 w-fit">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="text-xs font-bold text-white/90">AI Personalized Dashboard</span>
                            </div>
                            <h2 className="text-[44px] font-black text-white leading-[1.15] mb-6 tracking-tight">
                                See how you can <br />
                                <span className="text-blue-100 italic">find a job quickly!</span>
                            </h2>
                            <button 
                                onClick={() => setIsTutorialOpen(true)}
                                className="bg-white text-blue-600 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
                            >
                                Explore Now
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="absolute bottom-0 right-0 w-[45%] h-[115%] pointer-events-none flex items-end justify-end z-10 overflow-hidden">
                            <img
                                src="/db2.png"
                                alt="Character"
                                className="h-full w-auto object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
                <div className="mb-10">
                    <div className="flex items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">AI-Powered Career Tools</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
                        {features.map((feature, i) => (
                             <Link
                                key={i}
                                to={feature.link}
                                data-tutorial-id={`feature-${i}`}
                                className="group bg-white p-6 rounded-[28px] border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col items-center text-center"
                            >
                                <div className={`w-13 h-13 rounded-[20px] ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-105 transition-all duration-300 shadow-sm`}>
                                    <feature.icon className={`w-6.5 h-6.5 ${feature.color}`} strokeWidth={2.5} />
                                </div>
                                <h4 className="text-[15px] font-bold text-slate-800 mb-1.5 tracking-tight transition-colors whitespace-pre-line">{feature.title}</h4>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Hyrego Job Postings</h3>
                        <Link to="/app/hyrego-jobs" className="text-sm font-bold text-rose-600 hover:text-rose-700">See All</Link>
                    </div>
                    {loadingSpecial ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (
                                <SkeletonJobCard key={i} />
                            ))}
                        </div>
                    ) : specialJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {specialJobs.map((job) => {
                                const internalJob = {
                                    ...job,
                                    jobId: job._id,
                                    company: job.companyName || job.recruiterId?.companyName || 'Organization',
                                    logo: job.companyLogo || job.recruiterId?.logo,
                                    salary: job.salaryRange,
                                    type: 'full-time',
                                    isInternal: true
                                };
                                return (
                                    <JobCard
                                        key={job._id}
                                        job={internalJob}
                                        onClick={() => navigate(`/hyrego/${job._id}`)}
                                        initiallySaved={savedJobsIds.has(job._id)}
                                        onToggleSave={(id, isSaved) => {
                                            const newIds = new Set(savedJobsIds);
                                            if (isSaved) newIds.add(id);
                                            else newIds.delete(id);
                                            setSavedJobsIds(newIds);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center">
                            <Sparkles className="w-10 h-10 text-rose-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No special postings at the moment. Check back soon!</p>
                        </div>
                    )}
                </div>

                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Jobs (Global Board)</h3>
                        <Link to="/app/jobs" className="text-sm font-bold text-blue-600 hover:text-blue-700">See All</Link>
                    </div>
                    {loadingJobs ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (
                                <SkeletonJobCard key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-red-500 bg-red-50 p-4 rounded-2xl font-semibold text-center mt-2 border border-red-100 text-sm">
                            {error}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {recentJobs.map((job) => {
                                const jobId = job.link || `${job.title}-${job.company}`.replace(/\s+/g, '-').toLowerCase();
                                return (
                                    <JobCard
                                        key={jobId}
                                        job={job}
                                        onClick={setSelectedJob}
                                        initiallySaved={savedJobsIds.has(jobId)}
                                        onToggleSave={(id, isSaved) => {
                                            const newIds = new Set(savedJobsIds);
                                            if (isSaved) newIds.add(id);
                                            else newIds.delete(id);
                                            setSavedJobsIds(newIds);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <div className="md:hidden w-full min-h-screen bg-slate-50/50 pb-24 pt-2 animate-in fade-in duration-500 font-sans">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 px-4 mt-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/app/profile')}
                            className="w-11 h-11 rounded-[16px] overflow-hidden border border-slate-100 shadow-md active:scale-90 transition-all bg-white shrink-0"
                        >
                            <img
                                src={profile?.profileImage || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=0f172a&bold=true`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </button>
                        <div className="flex flex-col">
                            <p className="text-[10px] text-slate-400 font-extrabold mb-0.5 uppercase tracking-wider">{greeting} 👋</p>
                            <h2 className="text-[17px] font-black text-slate-800 leading-none tracking-tight">{firstName}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hover:scale-[1.03] transition-transform">
                            {user?.subscription?.plan === 'FREE' || !user?.subscription?.plan ? (
                                <button 
                                    onClick={() => navigate('/app/subscriptions')}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-[11px] shadow-sm shadow-amber-400/20 active:scale-95 transition-all border border-amber-300/40"
                                >
                                    <Sparkles className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                                    <span>Premium</span>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => navigate('/app/subscriptions')}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-600 hover:via-teal-600 hover:to-blue-700 text-white font-black text-[11px] shadow-sm shadow-emerald-500/20 active:scale-95 transition-all border border-emerald-400/35"
                                >
                                    <Crown className="w-3.5 h-3.5 fill-white/80 text-white" />
                                    <span>{user.subscription.plan === 'PRO_PLUS' ? 'PRO PLUS' : 'PRO'}</span>
                                </button>
                            )}
                        </div>
                        <NotificationsDropdown 
                            className="w-10 h-10 rounded-[14px] border border-slate-100 bg-white shadow-sm active:scale-90"
                            iconClassName="w-5 h-5 text-slate-700"
                        />
                    </div>
                </div>

                {/* Banner / Explore tutorial card */}
                <div className="px-4 mb-6">
                    <div className="w-full bg-gradient-to-br from-[#2D68FE] via-[#1E40AF] to-[#172554] rounded-[24px] p-5 text-white relative overflow-hidden flex flex-col justify-center min-h-[140px] shadow-lg shadow-blue-500/10">
                        <div className="absolute inset-0 pointer-events-none opacity-30">
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rotate-45 transform rounded-xl blur-lg"></div>
                            <div className="absolute top-10 right-0 w-40 h-40 bg-blue-300/20 transform rounded-full blur-xl"></div>
                        </div>
                        <div className="relative z-10 w-[60%] pl-0.5">
                            <h3 className="text-[17px] font-black leading-[1.25] mb-3.5 tracking-tight text-white drop-shadow-sm">
                                See how you can<br />find a job <span className="text-blue-200">quickly!</span>
                            </h3>
                             <button 
                                onClick={() => setIsTutorialOpen(true)}
                                className="bg-white text-blue-600 text-[11.5px] font-extrabold py-2 px-4 rounded-[12px] shadow-md shadow-blue-900/10 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                                Explore Now
                            </button>
                        </div>
                        <div className="absolute bottom-0 right-0 w-[50%] h-[110%] pointer-events-none flex items-end justify-end z-10">
                            <img
                                src="/db2.png"
                                alt="Character"
                                className="h-full w-auto object-contain object-bottom drop-shadow-2xl translate-y-[5%]"
                            />
                        </div>
                    </div>
                </div>

                {/* AI Tools Grid */}
                <div className="mb-6 px-4">
                    <div className="flex items-center mb-3">
                        <h3 className="text-[15px] font-extrabold text-slate-800 tracking-tight">AI-Powered Career Tools</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                        {features.map((feature, i) => (
                             <Link
                                key={i}
                                to={feature.link}
                                data-tutorial-id={`feature-${i}`}
                                className="group bg-white p-3.5 rounded-[18px] border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] active:scale-95 transition-all duration-300 flex flex-col items-center text-center"
                            >
                                <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-2.5 shadow-sm`}>
                                    <feature.icon className={`w-5 h-5 ${feature.color}`} strokeWidth={2.5} />
                                </div>
                                <h4 className="font-extrabold text-slate-800 text-[11.5px] leading-tight mb-0.5 whitespace-pre-line">{feature.title}</h4>
                                <p className="text-[9px] text-slate-400 font-semibold leading-normal">{feature.desc}</p>
                             </Link>
                        ))}
                    </div>
                </div>

                {/* Hyrego Job Postings */}
                <div className="mb-6 px-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[15px] font-extrabold text-slate-800 tracking-tight">Hyrego Job Postings</h3>
                        <Link to="/app/hyrego-jobs" className="text-[11.5px] font-bold text-rose-500 hover:text-rose-600">See All</Link>
                    </div>
                    {loadingSpecial ? (
                        <div className="flex overflow-x-auto gap-3 snap-x no-scrollbar pb-6 px-4 -mx-4">
                            {[1, 2, 3].map((i) => (
                                <SkeletonJobCard key={i} className="mb-0 w-[260px] shrink-0 snap-center" />
                            ))}
                        </div>
                    ) : specialJobs.length > 0 ? (
                        <AutoCarousel 
                            items={specialJobs}
                            renderItem={(job) => {
                                const internalJob = {
                                    ...job,
                                    jobId: job._id,
                                    company: job.companyName || job.recruiterId?.companyName || 'Organization',
                                    logo: job.companyLogo || job.recruiterId?.logo,
                                    salary: job.salaryRange,
                                    type: 'full-time',
                                    isInternal: true
                                };
                                return (
                                    <JobCard
                                        key={job._id}
                                        job={internalJob}
                                        onClick={() => navigate(`/hyrego/${job._id}`)}
                                        className="mb-0 w-[260px] shrink-0 snap-center p-3.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_15px_-8px_rgba(0,0,0,0.05)] hover:border-blue-100/50"
                                        initiallySaved={savedJobsIds.has(job._id)}
                                        onToggleSave={(id, isSaved) => {
                                            const newIds = new Set(savedJobsIds);
                                            if (isSaved) newIds.add(id);
                                            else newIds.delete(id);
                                            setSavedJobsIds(newIds);
                                        }}
                                    />
                                );
                            }}
                        />
                    ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
                            <Sparkles className="w-6 h-6 text-rose-355 mx-auto mb-1.5" />
                            <p className="text-slate-400 text-[11px] font-medium">No special postings at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Recent Jobs */}
                <div className="pl-4 pb-4">
                    <div className="flex items-center justify-between mb-3 pr-4">
                        <h3 className="text-[15px] font-extrabold text-slate-800 tracking-tight">Recent Jobs</h3>
                        <Link to="/app/jobs" className="text-[11.5px] font-bold text-blue-500 hover:text-blue-600">See All</Link>
                    </div>
                    <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2 snap-x pr-4">
                        {['All', 'Design', 'Technology', 'Finance'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                disabled={loadingJobs}
                                className={`px-4 py-1.5 rounded-full text-[11px] font-bold flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeCategory === cat ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10' : 'bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100/50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-2 pb-6 overflow-hidden">
                    {loadingJobs ? (
                        <div className="flex overflow-x-auto gap-3 snap-x no-scrollbar pb-6 px-4 -mx-4">
                            {[1, 2, 3].map((i) => (
                                <SkeletonJobCard key={i} className="mb-0 w-[260px] shrink-0 snap-center" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="px-4">
                            <div className="text-red-500 bg-red-50 p-3.5 rounded-2xl font-semibold text-center mt-1 border border-red-100 text-[12px]">
                                {error}
                            </div>
                        </div>
                    ) : (
                        <AutoCarousel 
                            items={recentJobs}
                            autoSlideInterval={3000}
                            renderItem={(job) => {
                                const jobId = job.link || `${job.title}-${job.company}`.replace(/\s+/g, '-').toLowerCase();
                                return (
                                    <JobCard
                                        key={jobId}
                                        job={job}
                                        onClick={setSelectedJob}
                                        className="mb-0 w-[260px] shrink-0 snap-center p-3.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_15px_-8px_rgba(0,0,0,0.05)] hover:border-blue-100/50"
                                        initiallySaved={savedJobsIds.has(jobId)}
                                        onToggleSave={(id, isSaved) => {
                                            const newIds = new Set(savedJobsIds);
                                            if (isSaved) newIds.add(id);
                                            else newIds.delete(id);
                                            setSavedJobsIds(newIds);
                                        }}
                                    />
                                );
                            }}
                        />
                    )}
                </div>
            </div>
            <JobDetailsModal
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
                initiallySaved={selectedJob ? savedJobsIds.has(selectedJob._id || selectedJob.id || selectedJob.link || `${selectedJob.title || 'Untitled Position'}-${selectedJob.company || selectedJob.companyName || selectedJob.recruiterId?.companyName || 'Organization'}`.replace(/\s+/g, '-').toLowerCase()) : false}
                onToggleSave={(jobId, isSaved) => {
                    const newIds = new Set(savedJobsIds);
                    if (isSaved) newIds.add(jobId);
                    else newIds.delete(jobId);
                    setSavedJobsIds(newIds);
                 }}
            />
            <TutorialOverlay
                isOpen={isTutorialOpen}
                steps={tutorialSteps}
                onClose={() => setIsTutorialOpen(false)}
            />
        </>
    );
};
export default Dashboard;
