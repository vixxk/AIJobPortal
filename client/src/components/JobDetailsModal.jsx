import { X, MapPin, Briefcase, Building, DollarSign, ExternalLink, Calendar, Users, Globe, Copy, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from '../utils/axios';
const JobDetailsModal = ({ job, onClose, initiallySaved, onToggleSave }) => {
    const [didSave, setDidSave] = useState(initiallySaved || false);
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState(null);

    const handleCopyLink = () => {
        if (job?.link) {
            navigator.clipboard.writeText(job.link || window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else if (job?._id) {
            const url = `${window.location.origin}/app/special-jobs/${job._id}`;
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    useEffect(() => {
        if (job) {
            setDidSave(initiallySaved || false);
        }
    }, [job, initiallySaved]);
    useEffect(() => {
        if (job) {
            document.body.style.overflow = 'hidden';
            setApplied(false);
            setError(null);
            // Check if already applied if internal
            if (job.isInternal) {
                checkApplicationStatus();
            }
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [job]);

    const checkApplicationStatus = async () => {
        try {
            const res = await axios.get('/applications/my-applications');
            if (res.data.status === 'success') {
                const alreadyApplied = res.data.data.applications.some(app => app.jobId?._id === job._id || app.jobId === job._id);
                setApplied(alreadyApplied);
            }
        } catch (err) {
            console.error("Failed to check app status", err);
        }
    };

    const handleApply = async () => {
        if (!job.isInternal) return;
        setIsApplying(true);
        setError(null);
        try {
            const res = await axios.post('/applications', { jobId: job._id });
            if (res.data.status === 'success') {
                setApplied(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to apply. Please try again.");
        } finally {
            setIsApplying(false);
        }
    };

    if (!job) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="absolute -bottom-8 left-8 w-20 h-20 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden p-2">
                        {job.logo ? (
                            <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold rounded-lg uppercase">
                                {job.company.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
                <div className="pt-14 px-8 pb-8 overflow-y-auto no-scrollbar flex-1">
                    <div className="mb-8">
                        <h2 className="text-[22px] md:text-[26px] font-black text-slate-900 leading-tight mb-3 tracking-tight">{job.title}</h2>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-500 font-semibold text-[13px] md:text-sm">
                            <div className="flex items-center gap-2">
                                <div className="p-1 px-1.5 bg-blue-50 rounded-md">
                                    <Building className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <span>{job.company}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1 px-1.5 bg-blue-50 rounded-md">
                                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <span>{job.location || 'Remote Options'}</span>
                            </div>
                            {job.salary && (
                                <div className="flex items-center gap-2">
                                    <div className="p-1 px-1.5 bg-emerald-50 rounded-md">
                                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                    </div>
                                    <span className="text-emerald-600">{job.salary}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Job Type</p>
                            <p className="text-sm font-bold text-slate-800 capitalize">{job.type || 'Full Time'}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Experience</p>
                            <p className="text-sm font-bold text-slate-800">Entry / Junior</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 hidden sm:block">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Posted</p>
                            <p className="text-sm font-bold text-slate-800">Recently</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">Job Description</h3>
                        <div className="text-slate-600 leading-relaxed space-y-4 text-sm md:text-base">
                            <p>{job.snippet || "Join our team and help us build amazing products. We are looking for passionate individuals who are eager to learn and grow with us."}</p>
                            <p>We value creativity, collaboration, and a results-driven mindset. As a {job.title} at {job.company}, you will have the opportunity to make a real impact and work on challenging projects.</p>
                            <h4 className="font-bold text-slate-800 pt-2">Key Responsibilities:</h4>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Collaborate with cross-functional teams to deliver high-quality solutions.</li>
                                <li>Participate in design discussions and code reviews.</li>
                                <li>Troubleshoot and resolve complex technical issues.</li>
                                <li>Stay up-to-date with emerging technologies and best practices.</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="p-4 md:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3 shrink-0">
                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto sm:flex-1">
                        <button
                            onClick={handleCopyLink}
                            className="p-3.5 sm:p-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center justify-center shrink-0 w-[52px] sm:w-auto"
                            title="Copy Job Link"
                        >
                            {copied ? <Check className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-emerald-500" /> : <Copy className="w-[18px] h-[18px] sm:w-5 sm:h-5" />}
                        </button>
                        <button
                            onClick={async () => {
                                setIsSaving(true);
                                try {
                                    const jobId = job.link || `${job.title}-${job.company}`.replace(/\s+/g, '-').toLowerCase();
                                    if (didSave) {
                                        await axios.delete('/jobs/unsave', {
                                            data: { jobId }
                                        });
                                        setDidSave(false);
                                        if (onToggleSave) onToggleSave(jobId, false);
                                    } else {
                                        await axios.post('/jobs/save', { job });
                                        setDidSave(true);
                                        if (onToggleSave) onToggleSave(jobId, true);
                                    }
                                } catch (err) {
                                    console.error('Failed to toggle save job', err);
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                            disabled={isSaving}
                            className={`flex-1 font-bold py-3 px-4 rounded-xl text-sm whitespace-nowrap transition-all ${didSave ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                        >
                            {isSaving ? 'Processing...' : didSave ? 'Remove from saved' : 'Save for later'}
                        </button>
                    </div>
                    {job.isInternal ? (
                        <button
                            onClick={handleApply}
                            disabled={isApplying || applied}
                            className={`w-full sm:w-auto sm:flex-[1.2] font-bold py-3 px-4 rounded-xl text-sm whitespace-nowrap transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 ${applied ? 'bg-emerald-500 text-white cursor-default' : 'bg-[#1a56f0] text-white hover:bg-[#1546c7]'}`}
                        >
                            {isApplying ? 'Applying...' : applied ? (
                                <><Check className="w-4 h-4" /> Applied</>
                            ) : 'Apply Now'}
                        </button>
                    ) : (
                        <a
                            href={job.link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto sm:flex-[1.2] bg-[#1a56f0] text-white font-bold py-3 px-4 rounded-xl text-sm whitespace-nowrap hover:bg-[#1546c7] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                        >
                            Apply Now <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                </div>
                {error && (
                    <div className="px-8 pb-4 text-center">
                        <p className="text-rose-500 text-xs font-semibold">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default JobDetailsModal;
