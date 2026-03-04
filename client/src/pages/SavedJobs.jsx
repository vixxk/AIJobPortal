import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Bookmark, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JobDetailsModal from '../components/JobDetailsModal';
import notFoundImg from '../assets/404.png';

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
            <div className="flex justify-between items-start">
                <div className="flex gap-3 md:gap-4">
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
                    <div className="max-w-[200px] md:max-w-xs pt-0 md:pt-0.5">
                        <h4 className="font-bold text-slate-900 tracking-tight text-[15px] md:text-[16px] leading-tight mb-1 truncate">{job.title}</h4>
                        <p className="text-[12px] md:text-[13px] font-semibold text-slate-500 leading-none truncate">{job.company}</p>
                    </div>
                </div>
                <button onClick={handleSave} className={`${saved ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-blue-500 hover:bg-blue-50'} p-1 md:p-1.5 rounded-lg -mt-1 md:mt-0 transition-colors`}>
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

const SavedJobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);

    const fetchSavedJobs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/jobs/saved`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data.jobs || []);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch saved jobs. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const handleToggleSave = (jobId, isSaved) => {
        if (!isSaved) {
            setJobs(jobs.filter(job => {
                const jId = job.link || `${job.title}-${job.company}`.replace(/\s+/g, '-').toLowerCase();
                return jId !== jobId;
            }));
        }
    };

    return (
        <div className="h-full bg-slate-50 md:bg-white flex flex-col font-sans relative md:py-6 md:px-4">
            <div className="flex-1 overflow-auto bg-slate-50 px-5 pt-6 pb-24 md:max-w-5xl md:mx-auto md:w-full md:bg-white md:px-8">
                {/* Desktop Header */}
                <div className="hidden md:block mb-8 mt-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Saved Jobs</h1>
                    <p className="text-slate-500 font-medium">Manage and keep track of your bookmarked job opportunities.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-blue-500">
                        <div className="relative flex justify-center items-center">
                            <div className="absolute animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500"></div>
                            <div className="w-10 h-10 bg-blue-500 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 p-4 font-semibold text-center mt-10">{error}</div>
                ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                        <img src={notFoundImg} alt="Not Found" className="w-[280px] md:w-[350px] h-auto object-contain mix-blend-multiply mb-4" />
                        <h3 className="text-[22px] font-bold text-slate-900 mb-2">No saved jobs yet</h3>
                        <p className="text-sm text-slate-500 text-center max-w-[300px] leading-relaxed">
                            Jobs you bookmark will appear here so you can easily review them later.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-2 md:gap-6">
                        {jobs.map((job, idx) => (
                            <JobCard
                                key={idx}
                                job={job}
                                onClick={setSelectedJob}
                                initiallySaved={true}
                                onToggleSave={handleToggleSave}
                            />
                        ))}
                    </div>
                )}
            </div>

            <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} initiallySaved={true} onToggleSave={handleToggleSave} />
        </div>
    );
};

export default SavedJobs;
