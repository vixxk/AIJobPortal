import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, Bookmark, ArrowLeft, SlidersHorizontal, ArrowDownUp, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import JobDetailsModal from '../components/JobDetailsModal';
import notFoundImg from '../assets/404.png';
import SkeletonJobCard from '../components/SkeletonJobCard';
import SmartImage from '../components/ui/SmartImage';
const PAGE_SIZE = 10;
const JobCard = ({ job, onClick, initiallySaved, onToggleSave }) => {
    const [saved, setSaved] = useState(initiallySaved);

    useEffect(() => {
        setSaved(initiallySaved);
    }, [initiallySaved]);
    const handleSave = async (e) => {
        e.stopPropagation();
        try {
            const title = job.title || 'Untitled Position';
            const company = job.company || job.companyName || (job.recruiterId?.companyName) || 'Organization';
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
        <div onClick={() => onClick(job)} className="bg-white rounded-[16px] md:rounded-[24px] p-3.5 md:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-lg hover:border-blue-100 transition-all relative">
            <div className="flex justify-between items-start">
                <div className="flex gap-3 md:gap-4">
                    <div className="w-[42px] h-[42px] md:w-[52px] md:h-[52px] rounded-xl md:rounded-2xl border border-slate-100 flex items-center justify-center bg-white shadow-sm shrink-0 overflow-hidden relative">
                        <SmartImage
                            src={job.logo}
                            alt={job.company}
                            className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] object-contain rounded-md"
                            containerClassName="w-full h-full flex items-center justify-center"
                            fallbackIcon={() => <span className="font-extrabold text-lg md:text-xl text-blue-600">{(job.company || '?').charAt(0).toUpperCase()}</span>}
                        />
                    </div>
                    <div className="max-w-[200px] md:max-w-xs pt-0 md:pt-0.5">
                        <h4 className="font-bold text-slate-900 tracking-tight text-[15px] md:text-[16px] leading-tight mb-1 truncate">{job.title}</h4>
                        <p className="text-[12px] md:text-[13px] font-semibold text-slate-500 leading-none truncate">{job.company}</p>
                    </div>
                </div>
                <button onClick={handleSave} className={`${saved ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-blue-500 hover:bg-blue-50'} p-1 md:p-1.5 rounded-lg -mt-1 md:mt-0 z-10 transition-colors`}>
                    <Bookmark className="w-[16px] h-[16px] md:w-[18px] md:h-[18px]" strokeWidth={2.5} fill={saved ? 'currentColor' : 'none'} />
                </button>
            </div>
            <div className="mt-3 flex flex-col justify-end">
                {job.salary && job.salary !== 'Not specified' && job.salary !== 'Salary Undisclosed' && (
                    <p className="text-[12px] md:text-[13px] font-bold text-blue-600 tracking-tight self-end mb-2">{job.salary}</p>
                )}
                <div className="flex justify-between items-center w-full gap-2 mt-auto">
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                        <span className="px-[10px] md:px-[12px] py-[3px] md:py-[3.5px] bg-slate-50 border border-slate-200 rounded-md text-[9px] md:text-[10px] font-medium text-slate-600 flex items-center justify-center whitespace-nowrap">
                            {job.type === 'contract' ? 'Contract' : job.type === 'internship' ? 'Intern' : 'Full Time'}
                        </span>
                        <span className="px-[10px] md:px-[12px] py-[3px] md:py-[3.5px] bg-slate-50 border border-slate-200 rounded-md text-[9px] md:text-[10px] font-medium text-slate-600 flex items-center justify-center min-w-[55px] md:min-w-[65px] truncate">
                            {job.location?.toLowerCase().includes('remote') ? 'Remote' : 'Onsite'}
                        </span>
                    </div>
                    <span className="text-[11px] md:text-[12px] font-medium text-slate-500 truncate text-right">
                        {job.location || 'Remote Options'}
                    </span>
                </div>
            </div>
        </div>
    );
};
const AiJobSearch = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('any');
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [allJobs, setAllJobs] = useState([]);
    const [savedJobsIds, setSavedJobsIds] = useState(new Set());
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [sortBy, setSortBy] = useState('');
    const [showSortMenu, setShowSortMenu] = useState(false);

    // Filter states
    const [salaryRange, setSalaryRange] = useState('any');
    const [experience, setExperience] = useState('any');
    const [openDropdown, setOpenDropdown] = useState(null); // 'type', 'salary', 'experience'
    const sortAllJobs = (jobsArray, sortType) => {
        let sorted = [...jobsArray];
        if (sortType === 'name-asc') {
            sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else if (sortType === 'name-desc') {
            sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        }
        return sorted;
    };
    const resultsRef = useRef(null);
    const scrollToResults = useCallback(() => {
        setTimeout(() => {
            if (resultsRef.current) {
                const y = resultsRef.current.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 80);
    }, []);
    const handleSearch = useCallback(async (e, isInitial = false) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setCurrentPage(1);
        if (!isInitial) setHasSearched(true);
        try {
            const res = await axios.get('/jobs/search', {
                params: {
                    role,
                    location,
                    type,
                    salaryRange,
                    experience
                }
            });
            const fetched = res.data.jobs || [];
            if (isInitial && fetched.length > 0) {
                setHasSearched(true);
            }
            setAllJobs(fetched);
            setJobs(fetched.slice(0, PAGE_SIZE));
            setTotalCount(res.data.totalCount || fetched.length);
            setTotalPages(Math.ceil((res.data.totalCount || fetched.length) / PAGE_SIZE));
            if (!isInitial && fetched.length > 0) {
                scrollToResults();
            }
        } catch (err) {
            console.error(err);
            if (!isInitial) setError('Failed to fetch jobs. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [role, location, type, salaryRange, experience, scrollToResults]);
    const fetchInitialData = useCallback(async () => {
        try {
            const savedRes = await axios.get('/jobs/saved');
            const savedIds = new Set(
                (savedRes.data.jobs || []).map(sj => {
                    const title = sj.title || 'Untitled Position';
                    const company = sj.company || sj.companyName || (sj.recruiterId?.companyName) || 'Organization';
                    return sj._id || sj.id || sj.link || `${title}-${company}`.replace(/\s+/g, '-').toLowerCase();
                })
            );
            setSavedJobsIds(savedIds);
        } catch {
        }
        handleSearch(null, true);
    }, [handleSearch]);

    useEffect(() => {
        fetchInitialData();
    }, []); // Run only once on mount

    useEffect(() => {
        if (hasSearched) {
            handleSearch();
        }
    }, [type, salaryRange, experience, handleSearch]);
    const goToPage = (page) => {
        const p = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(p);
        const sorted = sortAllJobs(allJobs, sortBy);
        setJobs(sorted.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE));
        scrollToResults();
    };
    const handleSort = (type) => {
        setSortBy(type);
        setCurrentPage(1);
        const sorted = sortAllJobs(allJobs, type);
        setAllJobs(sorted);
        setJobs(sorted.slice(0, PAGE_SIZE));
        setShowSortMenu(false);
    };
    const pageNumbers = () => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
        return [...pages].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    };
    return (
        <div className="bg-slate-50 md:bg-white flex flex-col font-sans relative">
            <div className="md:hidden bg-white px-5 pt-6 pb-2 sticky top-0 z-20 border-b border-slate-100 shadow-sm">
                <div className="flex items-start gap-3 w-full mb-2">
                    <form onSubmit={(e) => { handleSearch(e); setShowMobileSearch(false); }} className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                                <input
                                    type="text"
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    placeholder="Search jobs..."
                                    className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-800 font-medium"
                                />
                            </div>
                            <button type="button" onClick={() => setShowMobileSearch(!showMobileSearch)} className={`p-2.5 rounded-xl shrink-0 transition-colors ${showMobileSearch || location ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'}`}>
                                <MapPin className="w-5 h-5" strokeWidth={2} />
                            </button>
                        </div>
                        {showMobileSearch && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex-1 flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                                    <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        placeholder="Enter location..."
                                        className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-800 font-medium"
                                    />
                                </div>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-sm shrink-0 transition-colors shadow-sm">
                                    Search
                                </button>
                            </div>
                        )}
                        <button type="submit" className="hidden">Search</button>
                    </form>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mt-1">
                    <button
                        onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shrink-0 transition-all text-[12px] font-bold ${type !== 'any' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                        {type === 'any' ? 'Job Type' : <span className="capitalize">{type === 'fulltime' ? 'Full Time' : type}</span>}
                        <ArrowDownUp className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setOpenDropdown(openDropdown === 'salary' ? null : 'salary')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shrink-0 transition-all text-[12px] font-bold ${salaryRange !== 'any' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                        {salaryRange === 'any' ? 'Salary' : salaryRange}
                        <ArrowDownUp className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setOpenDropdown(openDropdown === 'experience' ? null : 'experience')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shrink-0 transition-all text-[12px] font-bold ${experience !== 'any' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                    >
                        {experience === 'any' ? 'Experience' : experience}
                        <ArrowDownUp className="w-3 h-3" />
                    </button>
                </div>

                {/* Mobile Dropdowns */}
                <div className="relative">
                    {openDropdown === 'type' && (
                        <div className="absolute top-0 left-0 bg-white rounded-xl shadow-xl border border-slate-100 py-2 w-44 z-30 animate-in fade-in slide-in-from-top-2 duration-200 mt-1">
                            {['any', 'fulltime', 'contract', 'internship', 'parttime'].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => { setType(v); setOpenDropdown(null); }}
                                    className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 capitalize ${type === v ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                                >
                                    {v === 'any' ? 'Any Type' : v === 'fulltime' ? 'Full Time' : v}
                                </button>
                            ))}
                        </div>
                    )}
                    {openDropdown === 'salary' && (
                        <div className="absolute top-0 left-0 bg-white rounded-xl shadow-xl border border-slate-100 py-2 w-52 z-30 animate-in fade-in slide-in-from-top-2 duration-200 mt-1">
                            {['any', '< ₹ 5L', '₹ 5L - 10L', '₹ 10L - 20L', '₹ 20L - 40L', '> ₹ 40L'].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => { setSalaryRange(v); setOpenDropdown(null); }}
                                    className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${salaryRange === v ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                                >
                                    {v === 'any' ? 'Any Salary' : v}
                                </button>
                            ))}
                        </div>
                    )}
                    {openDropdown === 'experience' && (
                        <div className="absolute top-0 left-0 bg-white rounded-xl shadow-xl border border-slate-100 py-2 w-44 z-30 animate-in fade-in slide-in-from-top-2 duration-200 mt-1">
                            {['any', 'Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead'].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => { setExperience(v); setOpenDropdown(null); }}
                                    className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${experience === v ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                                >
                                    {v === 'any' ? 'Any Experience' : v}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 bg-slate-50 px-5 pt-6 pb-12 md:max-w-5xl md:mx-auto md:w-full md:bg-white md:px-8">
                <div className="hidden md:flex min-h-[300px] p-10 text-white relative flex-col items-center text-center mb-12">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#2563eb,#4f46e5)] rounded-[32px] overflow-hidden shadow-xl shadow-blue-900/10">
                        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                            <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-4xl font-extrabold mb-4 tracking-tight relative z-10">Global Job Search</h2>
                    <p className="text-blue-100 max-w-xl mx-auto mb-10 text-base relative z-10 font-medium">
                        Connect with top employers. Our intelligent scanner finds the best roles matching your profile across the web.
                    </p>
                    <form onSubmit={handleSearch} className="w-full max-w-4xl bg-white p-2.5 rounded-2xl flex gap-2 shadow-2xl relative z-10 mx-auto">
                        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                            <input
                                type="text"
                                placeholder="Job titles, companies, or keywords"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="bg-transparent border-none w-full text-slate-800 placeholder-slate-400 focus:outline-none text-[15px] font-semibold"
                                required
                            />
                        </div>
                        <div className="w-[300px] flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                            <MapPin className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                            <input
                                type="text"
                                placeholder="City, state, or remote"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="bg-transparent border-none w-full text-slate-800 placeholder-slate-400 focus:outline-none text-[15px] font-semibold"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-[160px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-500/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Find Jobs'}
                        </button>
                    </form>

                    <div className="flex gap-3 mt-8 flex-wrap justify-center z-20 relative w-full">
                        {/* Job Type Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all text-sm font-semibold ${type !== 'any' ? 'bg-white text-blue-700 border-white shadow-md' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                            >
                                {type === 'any' ? 'Job Type' : <span className="capitalize">{type === 'fulltime' ? 'Full Time' : type}</span>}
                                <ArrowDownUp className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'type' ? 'rotate-180' : ''}`} />
                            </button>
                            {openDropdown === 'type' && (
                                <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-slate-100 py-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-100">
                                    {['any', 'fulltime', 'contract', 'internship', 'parttime'].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => { setType(v); setOpenDropdown(null); }}
                                            className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 capitalize ${type === v ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                                        >
                                            {v === 'any' ? 'Any Type' : v === 'fulltime' ? 'Full Time' : v}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Salary Range Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === 'salary' ? null : 'salary')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all text-sm font-semibold ${salaryRange !== 'any' ? 'bg-white text-blue-700 border-white shadow-md' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                            >
                                {salaryRange === 'any' ? 'Salary Range' : salaryRange}
                                <ArrowDownUp className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'salary' ? 'rotate-180' : ''}`} />
                            </button>
                            {openDropdown === 'salary' && (
                                <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-slate-100 py-2 w-56 z-50 animate-in fade-in zoom-in-95 duration-100">
                                    {['any', '< ₹ 5L', '₹ 5L - 10L', '₹ 10L - 20L', '₹ 20L - 40L', '> ₹ 40L'].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => { setSalaryRange(v); setOpenDropdown(null); }}
                                            className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${salaryRange === v ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                                        >
                                            {v === 'any' ? 'Any Salary' : v}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Experience Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === 'experience' ? null : 'experience')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all text-sm font-semibold ${experience !== 'any' ? 'bg-white text-blue-700 border-white shadow-md' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                            >
                                {experience === 'any' ? 'Experience' : experience}
                                <ArrowDownUp className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'experience' ? 'rotate-180' : ''}`} />
                            </button>
                            {openDropdown === 'experience' && (
                                <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-slate-100 py-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-100">
                                    {['any', 'Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead'].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => { setExperience(v); setOpenDropdown(null); }}
                                            className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${experience === v ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                                        >
                                            {v === 'any' ? 'Any Experience' : v}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filter Chips */}
                    {(type !== 'any' || salaryRange !== 'any' || experience !== 'any') && (
                        <div className="flex gap-2 mt-6 flex-wrap justify-center z-10 relative w-full">
                            {type !== 'any' && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100/20 border border-white/30 rounded-lg text-xs font-bold text-white transition-all hover:bg-white/20">
                                    <span className="capitalize">{type === 'fulltime' ? 'Full Time' : type}</span>
                                    <button onClick={() => setType('any')} className="hover:text-blue-200"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            {salaryRange !== 'any' && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100/20 border border-white/30 rounded-lg text-xs font-bold text-white transition-all hover:bg-white/20">
                                    <span>{salaryRange}</span>
                                    <button onClick={() => setSalaryRange('any')} className="hover:text-blue-200"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            {experience !== 'any' && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100/20 border border-white/30 rounded-lg text-xs font-bold text-white transition-all hover:bg-white/20">
                                    <span>{experience}</span>
                                    <button onClick={() => setExperience('any')} className="hover:text-blue-200"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div ref={resultsRef}>
                    {loading && (
                        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-2 md:gap-6 animate-in fade-in duration-500">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <SkeletonJobCard key={i} />
                            ))}
                        </div>
                    )}
                    {!loading && error && (
                        <div className="text-red-500 p-4 font-semibold text-center mt-10">{error}</div>
                    )}
                    {!loading && hasSearched && allJobs.length === 0 && !error && (
                        <div className="flex flex-col items-center justify-center py-12 md:py-20 animate-in fade-in duration-500">
                            <img src={notFoundImg} alt="Not Found" className="w-[280px] md:w-[350px] h-auto object-contain mix-blend-multiply" />
                            <h3 className="text-[22px] font-bold text-slate-900 mt-[-20px] mb-2">Not Found</h3>
                            <p className="text-sm text-slate-500 text-center max-w-[300px] leading-relaxed">
                                Sorry, the keyword you entered cannot be found. Please try to change location or try writing state/country.
                            </p>
                        </div>
                    )}
                    {!loading && allJobs.length > 0 && (
                        <>
                            {((role || location) && totalCount > 0) && (
                                <div className="hidden md:flex flex-col mb-8 mt-4 relative">
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                                            {totalCount.toLocaleString()} <span className="text-slate-500 font-bold text-lg ml-1">Results Found</span>
                                        </span>
                                    </div>
                                </div>
                            )}
                            {((role || location) && totalCount > 0) && (
                                <div className="md:hidden flex flex-col mb-6 mt-2 relative">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[17px] font-black text-slate-900 tracking-tight">
                                            {totalCount.toLocaleString()} <span className="text-slate-500 font-bold text-[13px] ml-0.5">Results</span>
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-2 md:gap-6">
                                {jobs.map((job) => {
                                    const title = job.title || 'Untitled Position';
                                    const company = job.company || job.companyName || (job.recruiterId?.companyName) || 'Organization';
                                    const jobId = job._id || job.id || job.link || `${title}-${company}`.replace(/\s+/g, '-').toLowerCase();
                                    return (
                                        <JobCard
                                            key={jobId}
                                            job={job}
                                            onClick={setSelectedJob}
                                            initiallySaved={savedJobsIds.has(jobId)}
                                        />
                                    )
                                })}
                            </div>
                            {!loading && totalPages > 1 && (
                                <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 mt-8 mb-8 pb-4">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 md:p-2.5 rounded-lg md:rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm bg-white"
                                    >
                                        <ChevronLeft className="w-5 h-5 md:w-5 md:h-5" />
                                    </button>
                                    {pageNumbers().map((p, i, arr) => (
                                        <div key={p} className="flex items-center gap-1.5 md:gap-2">
                                            {i > 0 && arr[i - 1] !== p - 1 && (
                                                <span className="text-slate-400 text-sm px-1">…</span>
                                            )}
                                            <button
                                                onClick={() => goToPage(p)}
                                                className={`w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl text-[13px] md:text-[15px] font-bold transition-all shadow-sm ${p === currentPage
                                                    ? 'bg-blue-600 text-white shadow-blue-500/30 shadow-md'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 md:p-2.5 rounded-lg md:rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm bg-white"
                                    >
                                        <ChevronRight className="w-5 h-5 md:w-5 md:h-5" />
                                    </button>
                                </div>
                            )}
                        </>
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
        </div>
    );
};
export default AiJobSearch;
