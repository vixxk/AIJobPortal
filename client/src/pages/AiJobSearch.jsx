import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2, Bookmark, ArrowLeft, SlidersHorizontal, ArrowDownUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JobDetailsModal from '../components/JobDetailsModal';
import notFoundImg from '../assets/404.png';

const PAGE_SIZE = 10;


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
        <div onClick={() => onClick(job)} className="bg-white rounded-[16px] md:rounded-[24px] p-3.5 md:p-5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-lg hover:border-blue-100 transition-all relative">
            {/* Top Header */}
            <div className="flex justify-between items-start">
                <div className="flex gap-3 md:gap-4">
                    {/* Image Box */}
                    <div className="w-[42px] h-[42px] md:w-[52px] md:h-[52px] rounded-xl md:rounded-2xl border border-slate-100 flex items-center justify-center bg-white shadow-sm shrink-0 overflow-hidden relative">
                        {job.logo && (
                            <img
                                src={job.logo}
                                alt={job.company}
                                className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] object-contain rounded-md"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'block';
                                }}
                            />
                        )}
                        <span
                            className="font-extrabold text-lg md:text-xl text-blue-600"
                            style={{ display: job.logo ? 'none' : 'block' }}
                        >
                            {(job.company || '?').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    {/* Text Next to Image */}
                    <div className="max-w-[200px] md:max-w-xs pt-0 md:pt-0.5">
                        <h4 className="font-bold text-slate-900 tracking-tight text-[15px] md:text-[16px] leading-tight mb-1 truncate">{job.title}</h4>
                        <p className="text-[12px] md:text-[13px] font-semibold text-slate-500 leading-none truncate">{job.company}</p>
                    </div>
                </div>
                <button onClick={handleSave} className={`${saved ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-blue-500 hover:bg-blue-50'} p-1 md:p-1.5 rounded-lg -mt-1 md:mt-0 transition-colors`}>
                    <Bookmark className="w-[16px] h-[16px] md:w-[18px] md:h-[18px]" strokeWidth={2.5} fill={saved ? 'currentColor' : 'none'} />
                </button>
            </div>

            {/* Bottom Details - Clean and compact without separator */}
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [allJobs, setAllJobs] = useState([]);
    const [savedJobsIds, setSavedJobsIds] = useState(new Set());

    // Sort & Mobile Search state
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [sortBy, setSortBy] = useState('');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const sortAllJobs = (jobsArray, sortType) => {
        let sorted = [...jobsArray];
        if (sortType === 'name-asc') {
            sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else if (sortType === 'name-desc') {
            sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        } else if (sortType === 'loc-asc') {
            sorted.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
        } else if (sortType === 'loc-desc') {
            sorted.sort((a, b) => (b.location || '').localeCompare(a.location || ''));
        }
        return sorted;
    };

    const resultsRef = useRef(null);

    const scrollToResults = () => {
        setTimeout(() => {
            if (resultsRef.current && hasSearched) {
                const y = resultsRef.current.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 80);
    };

    const handleSearch = async (e, isInitial = false) => {
        if (e) e.preventDefault();

        // Don't alert if both are empty on explicit search? Actually we want it to just fetch all!
        // We will remove the restriction so clicking search without parameters just returns all jobs.

        setLoading(true);
        setError(null);
        setCurrentPage(1);
        if (!isInitial) setHasSearched(true);

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/jobs/search`, {
                params: { role, location, type }
            });

            const fetched = res.data.jobs || [];
            if (isInitial && fetched.length > 0) {
                setHasSearched(true); // Treat initial successful fetch as a search to show jobs
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
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = localStorage.getItem('token');
                const savedRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/jobs/saved`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const savedIds = new Set(
                    (savedRes.data.jobs || []).map(sj =>
                        sj.link || `${sj.title}-${sj.company}`.replace(/\s+/g, '-').toLowerCase()
                    )
                );
                setSavedJobsIds(savedIds);
            } catch (err) {
                // Ignore if unauthed
            }
            // Fetch initially without scrolling
            handleSearch(null, true);
        };
        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        <div className="h-full bg-slate-50 md:bg-white flex flex-col font-sans relative md:py-6 md:px-4">

            {/* ── MOBILE HEADER w/ Pills ── */}
            <div className="md:hidden bg-white px-5 pt-6 pb-2 sticky top-0 z-20 border-b border-slate-100 shadow-sm">
                <div className="flex items-start gap-3 w-full mb-2">
                    <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-700 mt-1.5 shrink-0">
                        <ArrowLeft className="w-6 h-6" strokeWidth={2} />
                    </button>
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


            </div>

            <div className="flex-1 overflow-auto bg-slate-50 px-5 pt-4 pb-20 md:max-w-5xl md:mx-auto md:w-full md:bg-white md:px-8">

                {/* ── DESKTOP HEADER (Hero Search Banner) ── */}
                <div className="hidden md:flex bg-[linear-gradient(135deg,#2563eb,#4f46e5)] rounded-3xl p-10 text-white relative flex-col items-center text-center overflow-hidden mb-12 shadow-xl shadow-blue-900/10">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                        <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                        </svg>
                    </div>

                    <h2 className="text-4xl font-extrabold mb-4 tracking-tight relative z-10">AI-Powered Job Search</h2>
                    <p className="text-blue-100 max-w-xl mx-auto mb-10 text-base relative z-10 font-medium">
                        Connect with top employers. Our intelligent scanner finds the best roles matching your profile across the web.
                    </p>

                    <form onSubmit={handleSearch} className="w-full max-w-4xl bg-white p-2.5 rounded-2xl flex gap-2 shadow-2xl relative z-10 mx-auto">
                        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                            <input
                                type="text"
                                placeholder="Job Role (e.g. Frontend Developer)"
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
                            className="w-[160px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-base"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Find Jobs'}
                        </button>
                    </form>

                    <div className="flex gap-4 mt-8 flex-wrap justify-center text-sm font-semibold z-10 relative w-full">
                        {['any', 'fulltime', 'contract', 'internship'].map((v) => (
                            <label
                                key={v}
                                className={`flex items-center justify-center cursor-pointer transition-all px-5 py-2 rounded-full border ${type === v
                                    ? 'bg-white text-blue-700 border-white shadow-md scale-105'
                                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                    }`}
                            >
                                <input type="radio" name="jobType" value={v} checked={type === v} onChange={() => setType(v)} className="sr-only" />
                                <span className="capitalize">{v === 'any' ? 'Any Type' : v === 'fulltime' ? 'Full Time' : v}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* ── RESULTS AREA ── */}
                <div ref={resultsRef}>
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 text-blue-500">
                            <div className="relative flex justify-center items-center">
                                <div className="absolute animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500"></div>
                                <div className="w-10 h-10 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
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
                            {/* Stats header */}
                            <div className="hidden md:flex justify-between items-center mb-6 mt-4 relative">
                                <span className="text-lg font-bold text-slate-900 tracking-tight">{totalCount.toLocaleString()} <span className="text-slate-500 font-semibold text-base">found</span></span>
                                <div>
                                    <button onClick={() => setShowSortMenu(!showSortMenu)} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors border border-slate-200 px-4 py-2 rounded-xl">
                                        <ArrowDownUp className="w-[16px] h-[16px]" strokeWidth={2} />
                                        Sort
                                    </button>
                                    {showSortMenu && (
                                        <div className="absolute right-0 top-12 bg-white shadow-xl border border-slate-100 rounded-xl py-2 w-48 z-10 flex flex-col overflow-hidden">
                                            <button onClick={() => handleSort('name-asc')} className={`text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${sortBy === 'name-asc' ? 'text-blue-600' : 'text-slate-600'}`}>Name (A-Z)</button>
                                            <button onClick={() => handleSort('name-desc')} className={`text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${sortBy === 'name-desc' ? 'text-blue-600' : 'text-slate-600'}`}>Name (Z-A)</button>
                                            <button onClick={() => handleSort('loc-asc')} className={`text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${sortBy === 'loc-asc' ? 'text-blue-600' : 'text-slate-600'}`}>Location (A-Z)</button>
                                            <button onClick={() => handleSort('loc-desc')} className={`text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${sortBy === 'loc-desc' ? 'text-blue-600' : 'text-slate-600'}`}>Location (Z-A)</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:hidden flex justify-between items-center mb-4 mt-2 relative">
                                <span className="text-[15px] font-bold text-slate-800 tracking-tight">{totalCount.toLocaleString()} <span className="text-slate-500 font-semibold text-[13px]">found</span></span>
                                <div>
                                    <button onClick={() => setShowSortMenu(!showSortMenu)} className="text-blue-500 p-1 -mr-1">
                                        <ArrowDownUp className="w-[18px] h-[18px] font-bold" strokeWidth={2.5} />
                                    </button>
                                    {showSortMenu && (
                                        <div className="absolute right-0 top-8 bg-white shadow-xl border border-slate-100 rounded-xl py-2 w-48 z-10 flex flex-col overflow-hidden">
                                            <button onClick={() => handleSort('name-asc')} className={`text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${sortBy === 'name-asc' ? 'text-blue-600' : 'text-slate-600'}`}>Name (A-Z)</button>
                                            <button onClick={() => handleSort('name-desc')} className={`text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${sortBy === 'name-desc' ? 'text-blue-600' : 'text-slate-600'}`}>Name (Z-A)</button>
                                            <button onClick={() => handleSort('loc-asc')} className={`text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${sortBy === 'loc-asc' ? 'text-blue-600' : 'text-slate-600'}`}>Location (A-Z)</button>
                                            <button onClick={() => handleSort('loc-desc')} className={`text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${sortBy === 'loc-desc' ? 'text-blue-600' : 'text-slate-600'}`}>Location (Z-A)</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-2 md:gap-6">
                                {jobs.map((job, idx) => {
                                    const jobId = job.link || `${job.title}-${job.company}`.replace(/\s+/g, '-').toLowerCase();
                                    return (
                                        <JobCard
                                            key={idx}
                                            job={job}
                                            onClick={setSelectedJob}
                                            initiallySaved={savedJobsIds.has(jobId)}
                                        />
                                    )
                                })}
                            </div>

                            {/* Pagination */}
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
                initiallySaved={selectedJob ? savedJobsIds.has(selectedJob.link || `${selectedJob.title}-${selectedJob.company}`.replace(/\s+/g, '-').toLowerCase()) : false}
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
