import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Home, Briefcase, BookOpen, Trophy,
    Users, Settings, LogOut, Bell,
    MessageSquare, FileText, CheckCircle, Orbit,
    Search, MapPin, Bookmark, ChevronRight,
    Sparkles, ArrowRight, SlidersHorizontal, Menu,
    MonitorPlay
} from 'lucide-react';
import JobDetailsModal from '../components/JobDetailsModal';
const JobCard = ({ job, onClick, initiallySaved, onToggleSave }) => {
    const [saved, setSaved] = useState(initiallySaved);
    const handleSave = async (e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const jobId = job.link || `${job.title}-${job.company}`.replace(/\s+/g, '-').toLowerCase();
            if (saved) {
                await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/jobs/unsave`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { jobId }
                });
                setSaved(false);
                if (onToggleSave) onToggleSave(jobId, false);
            } else {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/jobs/save`,
                    { job },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSaved(true);
                if (onToggleSave) onToggleSave(jobId, true);
            }
        } catch (err) {
            console.error('Failed to toggle save job', err);
        }
    };
    return (
        <div onClick={() => onClick(job)} className="bg-white rounded-[16px] md:rounded-[24px] p-4 md:p-5 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] cursor-pointer hover:shadow-[0_8px_30px_-10px_rgba(37,99,235,0.15)] hover:border-blue-100 transition-all mb-4 relative">
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
const Dashboard = () => {
    const { user } = useAuth();
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
    useEffect(() => {
        const fetchStudentProfile = async () => {
            if (user?.role === 'STUDENT') {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/student/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.status === 'success') {
                        setProfile(res.data.data.profile);
                    }
                } catch (err) {
                    console.error("Failed to fetch student profile", err);
                }
            }
        };
        fetchStudentProfile();
    }, [user]);
    useEffect(() => {
        const fetchSavedData = async () => {
            try {
                const token = localStorage.getItem('token');
                const savedRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/jobs/saved`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: { jobs: [] } }));
                const savedIds = new Set(
                    (savedRes.data.jobs || []).map(sj =>
                        sj.link || `${sj.title}-${sj.company}`.replace(/\s+/g, '-').toLowerCase()
                    )
                );
                setSavedJobsIds(savedIds);
            } catch (err) { }
        };
        fetchSavedData();
    }, []);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchRecentData = async () => {
            setLoadingJobs(true);
            setError(null);
            try {
                const cacheKey = `dashboard_recent_jobs_${activeCategory}`;
                const cachedJobs = sessionStorage.getItem(cacheKey);
                if (cachedJobs) {
                    setRecentJobs(JSON.parse(cachedJobs));
                } else {
                    const roleQuery = activeCategory === 'All' ? '' : activeCategory;
                    try {
                        const jobsRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/jobs/search`, {
                            params: { role: roleQuery }
                        });
                        const fetchedJobs = jobsRes.data.jobs?.slice(0, 3) || [];
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
        };
        fetchRecentData();
    }, [activeCategory]);
    const features = [
        { title: 'Job Search', desc: 'Find Best Matches', icon: Search, color: 'text-blue-600', bg: 'bg-blue-50', link: '/app/jobs' },
        { title: 'Resume Builder', desc: 'Optimized for ATS', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', link: '/app/resume' },
        { title: 'Mock Interviews', desc: 'Practice with AI', icon: MonitorPlay, color: 'text-orange-600', bg: 'bg-orange-50', link: '/app/interview' },
        { title: 'Skill Learning', desc: 'Browse Courses', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/app/learning' },
    ];
    const name = user?.name || "Andrew Ainsley";
    const firstName = name.split(' ')[0];
    return (
        <>
            {}
            <div className="hidden md:block max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                {}
                <div className="hidden md:block relative w-full h-[320px] bg-gradient-to-r from-[#3872FA] to-[#1e40af] rounded-[48px] mb-12 overflow-hidden shadow-2xl shadow-blue-500/20 group">
                    {}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[70%] bg-white opacity-[0.08] rounded-full blur-3xl transform rotate-12"></div>
                        <div className="absolute bottom-[-20%] right-[10%] w-[50%] h-[80%] bg-blue-400 opacity-[0.15] rounded-full blur-3xl transform -rotate-12"></div>
                    </div>
                    <div className="relative h-full flex flex-col justify-center px-16 z-10">
                        <div className="max-w-xl">
                            {}
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full mb-6 w-fit">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="text-xs font-bold text-white/90">AI Personalized Dashboard</span>
                            </div>
                            {}
                            <h2 className="text-[44px] font-black text-white leading-[1.15] mb-6 tracking-tight">
                                See how you can <br />
                                <span className="text-blue-100 italic">find a job quickly!</span>
                            </h2>
                            {}
                            <button className="bg-white text-blue-600 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2">
                                Explore Opportunities
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        {}
                        <div className="absolute bottom-0 right-0 w-[45%] h-[115%] pointer-events-none flex items-end justify-end z-10 overflow-hidden">
                            <img
                                src="/db2.png"
                                alt="Character"
                                className="h-full w-auto object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
                {}
                <div className="mb-10">
                    <div className="flex items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">AI-Powered Career Tools</h3>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((feature, i) => (
                            <Link
                                key={i}
                                to={feature.link}
                                className="group bg-white p-6 rounded-[28px] border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col items-center text-center"
                            >
                                <div className={`w-13 h-13 rounded-[20px] ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-105 transition-all duration-300 shadow-sm`}>
                                    <feature.icon className={`w-6.5 h-6.5 ${feature.color}`} strokeWidth={2.5} />
                                </div>
                                <h4 className="text-[15px] font-bold text-slate-800 mb-1.5 tracking-tight transition-colors">{feature.title}</h4>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
                {}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Jobs</h3>
                        <Link to="/app/jobs" className="text-sm font-bold text-blue-600 hover:text-blue-700">See All</Link>
                    </div>
                    {loadingJobs ? (
                        <div className="flex justify-center p-6"><span className="animate-pulse text-blue-500 font-semibold">Loading jobs...</span></div>
                    ) : error ? (
                        <div className="text-red-500 bg-red-50 p-4 rounded-2xl font-semibold text-center mt-2 border border-red-100 text-sm">
                            {error}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {recentJobs.map((job, idx) => (
                                <JobCard
                                    key={idx}
                                    job={job}
                                    onClick={setSelectedJob}
                                    initiallySaved={savedJobsIds.has(job.link || `${job.title}-${job.company}`.replace(/\s+/g, '-').toLowerCase())}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {}
            <div className="md:hidden w-full min-h-screen bg-white pb-24 pt-2 animate-in fade-in duration-500 font-sans">
                {}
                <div className="flex items-center justify-between mb-6 px-5 mt-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="w-11 h-11 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm active:scale-90 transition-all"
                        >
                            <img
                                src={profile?.profileImage || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=0f172a&bold=true`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </button>
                        <div className="flex flex-col">
                            <p className="text-[11px] text-slate-500 font-medium mb-0">{greeting} 👋</p>
                            <h2 className="text-[15px] font-bold text-slate-900 leading-none">{name}</h2>
                        </div>
                    </div>
                    <button className="relative w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center bg-white shadow-sm hover:bg-slate-50 transition-colors">
                        <div className="absolute top-[8px] right-[10px] w-2 h-2 bg-red-500 border border-white rounded-full z-10"></div>
                        <Bell className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
                    </button>
                </div>
                {}
                <div className="px-5 mb-7">
                    <div className="w-full bg-gradient-to-br from-[#3872FA] to-[#1e40af] rounded-[32px] p-6 text-white relative overflow-hidden flex flex-col justify-center min-h-[180px] shadow-xl shadow-blue-500/20">
                        {}
                        <div className="absolute inset-0 pointer-events-none opacity-30">
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rotate-45 transform rounded-xl blur-lg"></div>
                            <div className="absolute top-10 right-0 w-40 h-40 bg-blue-300/20 transform rounded-full blur-xl"></div>
                        </div>
                        <div className="relative z-10 w-[65%] pl-1">
                            <h3 className="text-[19px] font-extrabold leading-tight mb-4 tracking-tight text-white drop-shadow-md">
                                See how you can<br />find a job quickly!
                            </h3>
                            <button className="bg-white text-blue-600 text-[12px] font-bold py-2 px-5 rounded-xl inline-block shadow-md">
                                Explore Now
                            </button>
                        </div>
                        {}
                        <div className="absolute bottom-0 right-0 w-[55%] h-full pointer-events-none flex items-end justify-end z-10">
                            <img
                                src="/db2.png"
                                alt="Character"
                                className="h-full w-auto object-contain object-bottom drop-shadow-2xl translate-y-[0%]"
                            />
                        </div>
                    </div>
                </div>
                {}
                <div className="mb-8 px-5">
                    <div className="flex items-center mb-4">
                        <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">AI-Powered Career Tools</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {features.map((feature, i) => (
                            <Link
                                key={i}
                                to={feature.link}
                                className="group bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.05)] active:scale-95 transition-all duration-300 flex flex-col items-center text-center"
                            >
                                <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-3.5 shadow-sm`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color}`} strokeWidth={2.5} />
                                </div>
                                <h4 className="font-bold text-slate-900 text-[13px] leading-tight mb-1">{feature.title}</h4>
                                <p className="text-[10px] text-slate-500 font-medium leading-normal">{feature.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
                {}
                <div className="pl-5 pb-8">
                    <div className="flex items-center justify-between mb-4 pr-5">
                        <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">Recent Jobs</h3>
                        <Link to="/app/jobs" className="text-[13px] font-bold text-blue-600">See All</Link>
                    </div>
                    <div className="flex overflow-x-auto gap-2.5 no-scrollbar pb-2 snap-x pr-5">
                        {['All', 'Design', 'Technology', 'Finance'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                disabled={loadingJobs}
                                className={`px-5 py-2 rounded-full text-[12px] font-medium flex-shrink-0 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${activeCategory === cat ? 'bg-[#1855f4] text-white shadow-blue-500/20' : 'border border-blue-500/30 text-[#1855f4] hover:bg-blue-50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-4 pr-5 pl-5 mb-10">
                    {loadingJobs ? (
                        <div className="flex justify-center p-6"><span className="animate-pulse text-blue-500 text-sm font-semibold">Loading jobs...</span></div>
                    ) : error ? (
                        <div className="text-red-500 bg-red-50 p-4 rounded-2xl font-semibold text-center mt-2 border border-red-100 text-[13px]">
                            {error}
                        </div>
                    ) : (
                        recentJobs.map((job, idx) => (
                            <JobCard
                                key={idx}
                                job={job}
                                onClick={setSelectedJob}
                                initiallySaved={savedJobsIds.has(job.link || `${job.title}-${job.company}`.replace(/\s+/g, '-').toLowerCase())}
                            />
                        ))
                    )}
                </div>
            </div>
            {}
            <JobDetailsModal
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
                initiallySaved={selectedJob ? savedJobsIds.has(selectedJob.link || `${selectedJob.title}-${selectedJob.company}`.replace(/\s+/g, '-').toLowerCase()) : false}
                onToggleSave={(jobId, isSaved) => {
                    const newIds = new Set(savedJobsIds);
                    if (isSaved) newIds.add(jobId);
                    else newIds.delete(jobId);
                    setSavedJobsIds(newIds);
                }}
            />
        </>
    );
};
export default Dashboard;