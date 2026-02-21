import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, ChevronDown, Filter, Loader2, Building, ArrowUpRight } from 'lucide-react';
import axios from 'axios';
import JobDetailsModal from '../components/JobDetailsModal';

const AiJobSearch = () => {
    const [role, setRole] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('any'); // fulltime, parttime, contract, internship
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const resultsRef = useRef(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!role) return;

        setLoading(true);
        setError(null);

        try {
            // Direct integration with Job APIs to be built on backend
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/jobs/search`, {
                params: { role, location, type }
            });
            setJobs(res.data.jobs || []);

            // Scroll to results
            setTimeout(() => {
                if (resultsRef.current) {
                    const yOffset = -80; // offset for sticky headers/padding
                    const element = resultsRef.current;
                    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch jobs. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">

            {/* Search Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative flex flex-col items-center text-center overflow-hidden">
                {/* Subtle decorative elements */}
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                </div>

                <h2 className="text-3xl font-extrabold mb-3 tracking-tight relative z-10">AI-Powered Job Search</h2>
                <p className="text-blue-100 max-w-xl mx-auto mb-8 text-sm md:text-base relative z-10">
                    Connect with top employers. Our intelligent scanner finds the best roles matching your profile across the web.
                </p>

                {/* Search Bar Container */}
                <form onSubmit={handleSearch} className="w-full max-w-4xl bg-white p-2 md:p-3 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl relative z-10 mx-auto">

                    <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 md:py-1 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all">
                        <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                        <input
                            type="text"
                            placeholder="Job Role (e.g. Frontend Developer)"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="bg-transparent border-none w-full text-slate-800 placeholder-slate-400 focus:outline-none text-sm font-medium"
                            required
                        />
                    </div>

                    <div className="md:w-[250px] flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 md:py-1 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all">
                        <MapPin className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                        <input
                            type="text"
                            placeholder="City, state, or remote"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="bg-transparent border-none w-full text-slate-800 placeholder-slate-400 focus:outline-none text-sm font-medium"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="md:w-[140px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 md:py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Find Jobs'}
                    </button>
                </form>

                {/* Filters inline */}
                <div className="flex gap-2 md:gap-4 mt-6 flex-wrap justify-center text-xs md:text-sm font-semibold z-10 relative w-full px-2">
                    {['any', 'fulltime', 'contract', 'internship'].map((v) => (
                        <label
                            key={v}
                            className={`flex items-center justify-center cursor-pointer transition-all px-4 py-2 md:py-1.5 rounded-full border ${type === v
                                ? 'bg-white text-blue-700 border-white shadow-md shadow-black/10 scale-105'
                                : 'bg-blue-800/40 text-blue-100 border-blue-500/30 hover:bg-blue-800/60'
                                }`}
                        >
                            <input
                                type="radio"
                                name="jobType"
                                value={v}
                                checked={type === v}
                                onChange={() => setType(v)}
                                className="sr-only"
                            />
                            <span className="capitalize">{v === 'any' ? 'Any Type' : v === 'fulltime' ? 'Full Time' : v}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="py-4" ref={resultsRef}>
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                        <p className="font-medium animate-pulse hidden md:block">Scraping the web for best matches...</p>
                        <p className="font-medium animate-pulse md:hidden mt-2 text-sm text-center px-4">Loading...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center font-medium max-w-md mx-auto">
                        {error}
                    </div>
                )}

                {!loading && !error && jobs.length === 0 && (
                    <div className="text-center py-10 md:py-16 px-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 text-3xl md:text-4xl">
                            🔍
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">No jobs searched yet</h3>
                        <p className="text-sm md:text-base text-slate-500">Enter a role above to find active openings.</p>
                    </div>
                )}

                {/* Job Cards */}
                {!loading && jobs.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {jobs.map((job, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedJob(job)}
                                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all group flex flex-col justify-between cursor-pointer"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4 flex-1">
                                            {(() => {
                                                const colors = ['bg-red-100 text-red-600 border-red-200', 'bg-blue-100 text-blue-600 border-blue-200', 'bg-green-100 text-green-600 border-green-200', 'bg-purple-100 text-purple-600 border-purple-200', 'bg-orange-100 text-orange-600 border-orange-200'];
                                                const fbColor = colors[job.company.length % colors.length];
                                                return (
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${job.logo ? 'bg-white border-slate-200' : fbColor}`}>
                                                        {job.logo ? <img src={job.logo} alt={job.company} className="w-full h-full object-contain p-1 rounded-xl" /> : <span className="font-bold text-lg">{job.company.charAt(0).toUpperCase()}</span>}
                                                    </div>
                                                );
                                            })()}
                                            <div className="flex-1 min-w-0 pr-2">
                                                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">{job.title}</h4>
                                                <p className="text-sm text-slate-500 font-medium mt-1">{job.company}</p>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                                            <MapPin className="w-3 h-3 mr-1" /> {job.location || 'Remote Options'}
                                        </span>
                                        {job.salary && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700">
                                                {job.salary}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 capitalize">
                                            {job.type || 'Full Time'}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                                        {job.snippet || "Explore the complete description by visiting the job listing page..."}
                                    </p>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Job Details Modal */}
            <JobDetailsModal
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
            />
        </div>
    );
};

export default AiJobSearch;
