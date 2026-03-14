import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../utils/axios';
import { User, Mail, Link as LinkIcon, CheckCircle, XCircle, ArrowLeft, Download, Users, Briefcase, Building, Award, FileText, Globe, Calendar, MapPin, Phone, ShieldCheck, Layers } from 'lucide-react';
const ManageApplicants = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobRes = await axios.get(`/jobs/${jobId}`);
                if (jobRes.data.status === 'success') {
                    const jobData = jobRes.data.data.job;
                    setJob(jobData);
                    window.dispatchEvent(new CustomEvent('set-custom-header', {
                        detail: { title: `Candidates for ${jobData.title}` }
                    }));
                }
                const appRes = await axios.get(`/applications/job/${jobId}`);
                if (appRes.data.status === 'success') {
                    setApplications(appRes.data.data.applications);
                }
            } catch (error) {
                console.error("Failed to fetch application data", error);
                setError("Failed to fetch application data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        return () => window.dispatchEvent(new CustomEvent('set-custom-header', { detail: null }));
    }, [jobId]);

    const updateStatus = async (appId, newStatus) => {
        setStatusUpdating(appId);
        try {
            const res = await axios.patch(`/applications/${appId}`, { status: newStatus });
            if (res.data.status === 'success') {
                setApplications(apps => apps.map(app =>
                    app._id === appId ? { ...app, status: newStatus } : app
                ));
            }
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Error updating application status");
        } finally {
            setStatusUpdating(null);
        }
    };
    const ManageSkeleton = () => (
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse p-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100" />
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-slate-200 rounded" />
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100" />
                ))}
            </div>
        </div>
    );

    if (loading) return <ManageSkeleton />;
    if (error) {
        return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
    }
    if (!job) {
        return <div className="p-8 text-center text-red-500 font-medium">Job not found</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">No applicants yet.</h3>
                        <p className="text-slate-500 mt-1 text-sm">Applications for this role will appear here.</p>
                    </div>
                ) : (
                    applications.map((app) => (
                        <div key={app._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="p-5 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                                            {app.studentProfile?.profileImage || app.studentId?.avatar ? (
                                                <img src={app.studentProfile?.profileImage || app.studentId?.avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 line-clamp-1">{app.studentId?.name}</h4>
                                            <p className="text-xs font-medium text-slate-500">{app.studentId?.email}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${app.status === 'APPLIED' ? 'bg-blue-50 text-blue-600' :
                                        app.status === 'SHORTLISTED' ? 'bg-orange-50 text-orange-600' :
                                            app.status === 'HIRED' ? 'bg-green-50 text-green-600' :
                                                'bg-red-50 text-red-600'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>
                                <div className="space-y-3 mb-4">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Top Skills</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(app.studentProfile?.skills || []).slice(0, 4).map((skill, i) => (
                                                <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{skill}</span>
                                            ))}
                                            {(!app.studentProfile?.skills || app.studentProfile?.skills.length === 0) && (
                                                <span className="text-[11px] text-slate-400 italic">No skills listed</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-1">
                                        <button 
                                            onClick={() => setSelectedStudent({ ...app.studentId, profile: app.studentProfile })}
                                            className="w-full py-2 bg-slate-50 text-slate-600 text-[13px] font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border border-slate-200"
                                        >
                                            <User className="w-4 h-4" /> View Full Profile
                                        </button>
                                        {app.studentProfile?.resumeUrl && (
                                            <a href={app.studentProfile.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2 text-[13px] font-bold text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-100 transition-colors">
                                                <Download className="w-4 h-4" /> View Resume
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                                {app.status === 'APPLIED' && (
                                    <>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => updateStatus(app._id, 'SHORTLISTED')}
                                            className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                        >
                                            Shortlist
                                        </button>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => updateStatus(app._id, 'REJECTED')}
                                            className="flex-1 py-2 bg-white border border-red-200 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {app.status === 'SHORTLISTED' && (
                                    <>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => updateStatus(app._id, 'HIRED')}
                                            className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> finalize Hire
                                        </button>
                                        <button
                                            disabled={statusUpdating === app._id}
                                            onClick={() => updateStatus(app._id, 'REJECTED')}
                                            className="px-3 py-2 bg-white border border-red-200 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                {(app.status === 'HIRED' || app.status === 'REJECTED') && (
                                    <div className="w-full text-center py-1.5 text-sm font-medium text-slate-400 font-bold uppercase tracking-wider">
                                        Decision: {app.status}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <StudentProfileModal 
                student={selectedStudent} 
                onClose={() => setSelectedStudent(null)} 
            />
        </div>
    );
};

const StudentProfileModal = ({ student, onClose }) => {
    if (!student) return null;
    const profile = student.profile || {};

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-2 mb-3 mt-6">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="relative h-32 bg-gradient-to-r from-slate-800 to-slate-900 shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-20">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="px-8 pb-10 overflow-y-auto no-scrollbar flex-1 -mt-16 relative z-10">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-32 h-32 rounded-[40px] bg-white p-1.5 shadow-2xl border border-slate-100 flex items-center justify-center overflow-hidden mb-4">
                            {profile.profileImage || student.avatar ? (
                                <img src={profile.profileImage || student.avatar} alt="Profile" className="w-full h-full object-cover rounded-[32px]" />
                            ) : (
                                <User className="w-16 h-16 text-slate-200" />
                            )}
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{student.name}</h2>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="flex items-center gap-1.5 text-slate-500 font-semibold text-sm">
                                <Mail className="w-4 h-4" /> {student.email}
                            </p>
                            {student.phoneNumber && (
                                <p className="flex items-center gap-1.5 text-slate-500 font-semibold text-sm">
                                    <Phone className="w-4 h-4" /> {student.phoneNumber}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {student.country && (
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> {student.country}
                                </span>
                            )}
                            {student.gender && (
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                    {student.gender}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        {/* Left Column */}
                        <div className="space-y-2">
                            <div>
                                <SectionHeader icon={FileText} title="Professional Summary" />
                                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100/50">
                                    {profile.summary || "No professional summary provided."}
                                </p>
                            </div>

                            <div>
                                <SectionHeader icon={Layers} title="Core Skills" />
                                <div className="flex flex-wrap gap-2">
                                    {(profile.skills || []).map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100/50">{skill}</span>
                                    ))}
                                    {(!profile.skills || profile.skills.length === 0) && <p className="text-slate-400 text-xs italic ml-1">No skills listed</p>}
                                </div>
                            </div>

                            {profile.languages?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Globe} title="Languages" />
                                    <div className="flex flex-wrap gap-2">
                                        {profile.languages.map((lang, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100/50">
                                                {lang.language} • <span className="opacity-70 font-medium">{lang.proficiency}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.certifications?.length > 0 && (
                                <div>
                                    <SectionHeader icon={ShieldCheck} title="Certifications" />
                                    <div className="space-y-3">
                                        {profile.certifications.map((cert, i) => (
                                            <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                                    <Award className="w-4 h-4 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{cert.title}</h4>
                                                    <p className="text-[10px] text-slate-500 font-medium">{cert.publishingOrganization}</p>
                                                    {cert.credentialUrl && (
                                                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-[9px] text-indigo-500 font-bold mt-1 flex items-center gap-1 hover:underline">
                                                            View Credential <LinkIcon className="w-2.5 h-2.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-2">
                            {profile.experience?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Briefcase} title="Work Experience" />
                                    <div className="space-y-4 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100">
                                        {profile.experience.map((exp, i) => (
                                            <div key={i} className="flex gap-4 relative">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm z-10">
                                                    <Briefcase className="w-5 h-5 text-indigo-500" />
                                                </div>
                                                <div className="pt-0.5">
                                                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{exp.position}</h4>
                                                    <p className="text-xs text-slate-500 font-medium">{exp.company}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                                                        {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                    </p>
                                                    {exp.description && <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{exp.description}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.projects?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Layers} title="Projects" />
                                    <div className="space-y-3">
                                        {profile.projects.map((proj, i) => (
                                            <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-indigo-50/30">
                                                <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                                                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                                                {proj.url && (
                                                    <a href={proj.url} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 font-bold mt-2 flex items-center gap-1 hover:underline">
                                                        Live Project <LinkIcon className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.education?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Building} title="Education" />
                                    <div className="space-y-4">
                                        {profile.education.map((edu, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                                    <Building className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{edu.degree}</h4>
                                                    <p className="text-xs text-slate-600 font-medium">{edu.institution}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                                        Graduated {new Date(edu.endDate).getFullYear()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.awards?.length > 0 && (
                                <div>
                                    <SectionHeader icon={Award} title="Awards & Honors" />
                                    <div className="space-y-3">
                                        {profile.awards.map((award, i) => (
                                            <div key={i} className="flex gap-3 p-3 rounded-2xl bg-amber-50/50 border border-amber-100/50 text-amber-900">
                                                <Award className="w-5 h-5 shrink-0" />
                                                <div>
                                                    <h4 className="text-xs font-bold leading-tight">{award.title}</h4>
                                                    <p className="text-[10px] opacity-80">{award.issuer} • {new Date(award.dateAwarded).getFullYear()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ManageApplicants;
