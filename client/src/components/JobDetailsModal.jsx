import { X, MapPin, Briefcase, Building, DollarSign, ExternalLink, Calendar, Users, Globe } from 'lucide-react';
import { useEffect } from 'react';

const JobDetailsModal = ({ job, onClose }) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

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
                <div className="pt-12 px-8 pb-8 overflow-y-auto no-scrollbar flex-1">
                    <div className="mb-6">
                        <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">{job.title}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-slate-500 font-medium text-sm">
                            <div className="flex items-center gap-1.5">
                                <Building className="w-4 h-4 text-blue-500" />
                                <span>{job.company}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <span>{job.location || 'Remote Options'}</span>
                            </div>
                            {job.salary && (
                                <div className="flex items-center gap-1.5">
                                    <DollarSign className="w-4 h-4 text-emerald-500" />
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

                {/* Footer / CTA */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white border border-slate-200 text-slate-600 font-extrabold py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Save for later
                    </button>
                    <a
                        href={job.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 text-white font-extrabold py-4 px-6 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                    >
                        Apply Now <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default JobDetailsModal;
