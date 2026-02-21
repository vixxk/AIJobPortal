import { X, MapPin, Briefcase, Building, DollarSign, ExternalLink, Calendar, Users, Globe } from 'lucide-react';
import { useEffect } from 'react';

const JobDetailsModal = ({ job, onClose }) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (job) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [job]);

    if (!job) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header / Cover */}
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Logo Overlay */}
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

                {/* Content */}
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

                    {/* Stats/Tags */}
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

                    {/* Description */}
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

                {/* Compact Footer / CTA */}
                <div className="p-4 md:p-5 border-t border-slate-100 bg-white flex gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl text-sm whitespace-nowrap hover:bg-slate-100 transition-all"
                    >
                        Save for later
                    </button>
                    <a
                        href={job.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-[1.2] bg-[#1a56f0] text-white font-bold py-3 px-4 rounded-xl text-sm whitespace-nowrap hover:bg-[#1546c7] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                    >
                        Apply Now <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default JobDetailsModal;
