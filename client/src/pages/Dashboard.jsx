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

    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                // Fetch real jobs, defaulting to intern/entry level roles to fit the "Student" dash context
                const rawUrl = import.meta.env.VITE_API_BASE_URL;
                const apiBaseUrl = (rawUrl && rawUrl !== 'undefined' && rawUrl.length > 5)
                    ? rawUrl.trim()
                    : 'http://localhost:5000';

                const res = await axios.get(`${apiBaseUrl}/api/jobs/search?role=Intern&location=Remote&type=Internship`);
                if (res.data.success && res.data.jobs) {
                    setRecommendedJobs(res.data.jobs.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to load recommended jobs", error);
            } finally {
                setLoadingJobs(false);
            }
        };
        fetchRecommended();
    }, []);

    const features = [
        { title: 'AI Job Search', desc: 'Find Best Matches', icon: Search, color: 'text-blue-600', bg: 'bg-blue-50', link: '/app/jobs' },
        { title: 'AI Resume Builder', desc: 'Optimized for ATS', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', link: '/app/resume' },
        { title: 'Mock Interviews', desc: 'Practice with AI', icon: MonitorPlay, color: 'text-orange-600', bg: 'bg-orange-50', link: '/app/interview' },
        { title: 'Skill Learning', desc: 'Browse Courses', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/app/learning' },
    ];

    const name = user?.name || "Andrew Ainsley";
    const firstName = name.split(' ')[0];

    return (
        <>
            {/* --- DESKTOP VIEW (Restored Original) --- */}
            <div className="hidden md:block max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Desktop Banner - Minimal Design */}
                <div className="hidden md:block relative w-full h-[320px] bg-gradient-to-r from-[#3872FA] to-[#1e40af] rounded-[48px] mb-12 overflow-hidden shadow-2xl shadow-blue-500/20 group">
                    {/* Abstract Background Elements */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[70%] bg-white opacity-[0.08] rounded-full blur-3xl transform rotate-12"></div>
                        <div className="absolute bottom-[-20%] right-[10%] w-[50%] h-[80%] bg-blue-400 opacity-[0.15] rounded-full blur-3xl transform -rotate-12"></div>
                    </div>

                    <div className="relative h-full flex flex-col justify-center px-16 z-10">
                        <div className="max-w-xl">
                            {/* Status Label */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full mb-6 w-fit">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="text-xs font-bold text-white/90">AI Personalized Dashboard</span>
                            </div>

                            {/* Main Text */}
                            <h2 className="text-[44px] font-black text-white leading-[1.15] mb-6 tracking-tight">
                                See how you can <br />
                                <span className="text-blue-100 italic">find a job quickly!</span>
                            </h2>

                            {/* Button */}
                            <button className="bg-white text-blue-600 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2">
                                Explore Opportunities
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Character Image */}
                        <div className="absolute bottom-0 right-0 w-[45%] h-[115%] pointer-events-none flex items-end justify-end z-10 overflow-hidden">
                            <img
                                src="/db2.png"
                                alt="Character"
                                className="h-full w-auto object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
                {/* AI Career Tools */}
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

                {/* Recommended Internships/Jobs */}
                <div>
                    <div className="flex items-center justify-between mb-4 gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            {/* <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 rounded-sm bg-purple-500 rotate-45"></span> */}
                            <h3 className="text-lg font-bold text-slate-900 truncate">Recommended Internships</h3>
                        </div>
                        <Link to="/app/jobs" className="text-[11px] min-[360px]:text-xs sm:text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors shrink-0 whitespace-nowrap">
                            Explore More
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Mock data for Recommendation */}
                        {[
                            {
                                id: 1,
                                title: 'Software Engineer Intern',
                                company: 'Amazon',
                                location: 'Seattle, WA',
                                type: 'Internship',
                                initial: 'A',
                                bgColor: 'bg-yellow-100',
                                textColor: 'text-amber-600',
                                logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg'
                            },
                            {
                                id: 2,
                                title: 'UI/UX Designer',
                                company: 'Google LLC',
                                location: 'California, US',
                                type: 'Internship',
                                initial: 'G',
                                bgColor: 'bg-blue-100',
                                textColor: 'text-blue-600',
                                logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg'
                            },
                            {
                                id: 4,
                                title: 'Data Scientist Intern',
                                company: 'Microsoft',
                                location: 'Remote',
                                type: 'Internship',
                                initial: 'M',
                                bgColor: 'bg-blue-100',
                                textColor: 'text-blue-600',
                                logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'
                            }
                        ].map((job) => (
                            <div key={job.id} onClick={() => setSelectedJob(job)} className="cursor-pointer bg-white p-4 rounded-2xl border border-slate-200 flex items-start sm:items-center justify-between hover:border-blue-300 hover:shadow-md transition-all group gap-4">
                                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden shrink-0 bg-white p-2 text-xl font-bold">
                                        {job.logo ? (
                                            <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className={`w - full h - full rounded - md ${job.bgColor} ${job.textColor} flex items - center justify - center`}>{job.initial}</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">{job.title}</h4>
                                        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mt-1.5">
                                            <span className="font-medium">{job.company}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>{job.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{job.type}</span>
                                    <div className="p-1.5 text-slate-400 group-hover:text-blue-500 transition-colors">
                                        <Bookmark className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* --- MOBILE VIEW (New Screenshot Layout) --- */}
            <div className="md:hidden w-full min-h-screen bg-white pb-24 pt-2 animate-in fade-in duration-500 font-sans">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 px-5 mt-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="w-11 h-11 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm active:scale-90 transition-all"
                        >
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=0f172a&bold=true`}
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

                {/* Search Bar */}
                <div className="relative mb-6 px-5">
                    <div className="absolute inset-y-0 left-0 pl-9 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" strokeWidth={2} />
                    </div>
                    <input
                        type="text"
                        className="w-full bg-[#f8fafc] border border-slate-100 rounded-2xl py-3 pl-12 pr-12 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-[13px] font-medium transition-all"
                        placeholder="Search for a job or company"
                    />
                    <button className="absolute inset-y-0 right-0 pr-9 flex items-center">
                        <SlidersHorizontal className="h-[18px] w-[18px] text-blue-500" strokeWidth={2} />
                    </button>
                </div>

                {/* Featured Hero Card */}
                <div className="px-5 mb-7">
                    <div className="w-full bg-gradient-to-br from-[#3872FA] to-[#1e40af] rounded-[32px] p-6 text-white relative overflow-hidden flex flex-col justify-center min-h-[180px] shadow-xl shadow-blue-500/20">
                        {/* Abstract Background */}
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

                        {/* Character floating from the right */}
                        <div className="absolute bottom-0 right-0 w-[55%] h-full pointer-events-none flex items-end justify-end z-10">
                            <img
                                src="/db2.png"
                                alt="Character"
                                className="h-full w-auto object-contain object-bottom drop-shadow-2xl translate-y-[0%]"
                            />
                        </div>
                    </div>
                </div>

                {/* Recommendation Section */}
                <div className="mb-7 pl-5">
                    <div className="flex items-center justify-between mb-4 pr-5">
                        <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">Recommendation</h3>
                        <Link to="/app/jobs" className="text-[13px] font-bold text-blue-600">See All</Link>
                    </div>

                    <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2 snap-x pr-5">
                        {[
                            {
                                id: 1,
                                title: 'Software Engineer Intern',
                                company: 'Amazon',
                                location: 'Seattle, WA',
                                salary: '$4k - $6k',
                                types: ['Full-time and internship', 'Remote'],
                                initial: 'A',
                                bgColor: 'bg-yellow-100',
                                textColor: 'text-amber-600',
                                logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg'
                            },
                            {
                                id: 2,
                                title: 'UI/UX Designer',
                                company: 'Google LLC',
                                location: 'California, US',
                                salary: '$4k - $6k',
                                types: ['Internship', 'Remote'],
                                initial: 'G',
                                bgColor: 'bg-blue-100',
                                textColor: 'text-blue-600',
                                logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg'
                            },
                        ].map((job) => (
                            <div key={job.id} onClick={() => setSelectedJob(job)} className="min-w-[270px] bg-white rounded-[24px] p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] border border-slate-100 flex-shrink-0 snap-center overflow-hidden block cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-[48px] h-[48px] rounded-xl bg-white border border-slate-100 shadow-sm shadow-slate-200/50 flex items-center justify-center p-2.5 shrink-0 overflow-hidden text-[18px] font-bold">
                                            {job.logo ? (
                                                <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className={`w - full h - full rounded - md ${job.bgColor} ${job.textColor} flex items - center justify - center`}>{job.initial}</div>
                                            )}
                                        </div>
                                        <div className="pt-0.5">
                                            <h4 className="font-bold text-slate-800 text-[15px] leading-tight mb-0.5 truncate max-w-[130px]">{job.title}</h4>
                                            <p className="text-[12px] text-slate-500 font-medium truncate max-w-[130px]">{job.company}</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-300 hover:text-blue-500 transition-colors">
                                        <Bookmark className="w-5 h-5" strokeWidth={1.5} />
                                    </button>
                                </div>

                                <div className="h-px bg-slate-100 w-full mb-3.5 mt-2"></div>

                                <div className="flex flex-col gap-2 mb-4">
                                    <p className="text-[13px] font-medium text-slate-600 truncate">{job.location}</p>
                                    <p className="text-[14px] font-semibold text-blue-600">{job.salary} <span className="text-blue-500 text-[12px] font-medium">/month</span></p>
                                </div>

                                <div className="flex gap-2">
                                    {job.types.map((type, i) => (
                                        <span key={i} className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 text-[10px] font-semibold">{type}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Career Tools */}
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

                {/* Recent Jobs Section */}
                <div className="pl-5 pb-8">
                    <div className="flex items-center justify-between mb-4 pr-5">
                        <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">Recent Jobs</h3>
                        <Link to="/app/jobs" className="text-[13px] font-bold text-blue-600">See All</Link>
                    </div>

                    <div className="flex overflow-x-auto gap-2.5 no-scrollbar pb-2 snap-x pr-5">
                        <button className="px-5 py-2 rounded-full bg-[#1855f4] text-white text-[12px] font-medium flex-shrink-0 shadow-sm shadow-blue-500/20">All</button>
                        <button className="px-5 py-2 rounded-full border border-blue-500/30 text-[#1855f4] hover:bg-blue-50 text-[12px] font-medium flex-shrink-0 transition-colors">Design</button>
                        <button className="px-5 py-2 rounded-full border border-blue-500/30 text-[#1855f4] hover:bg-blue-50 text-[12px] font-medium flex-shrink-0 transition-colors">Technology</button>
                        <button className="px-5 py-2 rounded-full border border-blue-500/30 text-[#1855f4] hover:bg-blue-50 text-[12px] font-medium flex-shrink-0 transition-colors">Finance</button>
                    </div>
                </div>

            </div>
            {/* Job Details Modal */}
            <JobDetailsModal
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
            />
        </>
    );
};

export default Dashboard;
