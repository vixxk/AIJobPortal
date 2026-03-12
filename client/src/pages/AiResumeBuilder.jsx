import { useState, useRef, useCallback, useEffect } from 'react';
import {
    FileText, Sparkles, Download, Loader2, Briefcase, Code,
    User, BookOpen, Layers, Award, ChevronDown, ChevronUp,
    Trash2, Plus, ZoomIn, ZoomOut, Eye
} from 'lucide-react';
import axios from '../utils/axios';
import Skeleton from '../components/ui/Skeleton';

// ─── Reusable input styles ─────────────────────────────────────────────────
// font-size ≥16px prevents iOS auto-zoom on input focus
const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[16px] md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-300";
const labelCls = "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1";

// ─── Section wrapper with collapse toggle ─────────────────────────────────
const Section = ({ icon: Icon, title, number, color, children, accent }) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="mb-5">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-2.5 py-2.5 px-1 group"
            >
                <span className={`w-6 h-6 rounded-lg ${accent} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                    {number}
                </span>
                <Icon className={`w-4 h-4 ${color} shrink-0`} />
                <span className="font-bold text-slate-700 text-sm flex-1 text-left">{title}</span>
                {open
                    ? <ChevronUp className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    : <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                }
            </button>
            <div className={`border-t border-slate-100 ${open ? 'pt-4' : 'hidden'}`}>
                {children}
            </div>
        </div>
    );
};

// ─── Card wrapper for array items ─────────────────────────────────────────
const ItemCard = ({ onDelete, children, accentColor = 'blue' }) => (
    <div className={`relative p-4 bg-slate-50/80 border border-slate-200 rounded-2xl mb-3 group hover:border-${accentColor}-200 hover:bg-white transition-all`}>
        {children}
        <button
            onClick={onDelete}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-300 transition-all"
            title="Remove"
        >
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    </div>
);

// ─── AI button ─────────────────────────────────────────────────────────────
const AiBtn = ({ onClick, loading, label = 'AI Enhance', colorCls = 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 ${colorCls}`}
    >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        {label}
    </button>
);

// ─── Add button ─────────────────────────────────────────────────────────────
const AddBtn = ({ onClick, label, color = 'blue' }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-1.5 text-sm font-semibold text-${color}-600 hover:text-${color}-700 mt-1 group`}
    >
        <span className={`w-5 h-5 rounded-full border-2 border-${color}-300 group-hover:border-${color}-500 flex items-center justify-center transition-colors`}>
            <Plus className="w-3 h-3" />
        </span>
        {label}
    </button>
);

// ══════════════════════════════════════════════════════════════════════════════
const AiResumeBuilder = () => {
    const [loading, setLoading] = useState(true);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingExp, setLoadingExp] = useState(null);
    const [zoom, setZoom] = useState(75);
    const [mobileTab, setMobileTab] = useState('edit');

    const [resumeData, setResumeData] = useState({
        personal: { name: '', email: '', phone: '', linkedin: '', github: '', leetcode: '', gfg: '', location: '' },
        summary: '',
        education: [{ institution: '', degree: '', duration: '', location: '', cgpa: '' }],
        experience: [{ title: '', company: '', techStack: '', duration: '', location: '', description: '' }],
        projects: [{ name: '', github: '', liveLink: '', techStack: '', duration: '', description: '' }],
        certifications: [{ name: '', link: '' }],
        skills: [{ category: '', items: '' }]
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const res = await axios.get('/student/me');
            if (res.data.status === 'success' && res.data.data.profile) {
                const p = res.data.data.profile;
                setResumeData(prev => ({
                    ...prev,
                    personal: {
                        name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
                        email: p.email || '',
                        phone: p.phoneNumber || '',
                        location: p.address || '',
                        linkedin: '', github: '', leetcode: '', gfg: ''
                    },
                    summary: p.summary || '',
                    education: p.education?.length > 0 ? p.education : prev.education,
                    experience: p.experience?.length > 0 ? p.experience : prev.experience,
                    projects: p.projects?.length > 0 ? p.projects : prev.projects,
                    skills: p.skills?.length > 0 ? [{ category: 'Skills', items: p.skills.join(', ') }] : prev.skills
                }));
            }
        } catch (err) {
            console.error("Failed to fetch profile for resume", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMobileTabChange = (tab) => {
        setMobileTab(tab);
        if (tab === 'preview' && window.innerWidth < 1280) {
            const screenZoom = Math.floor(((window.innerWidth - 24) / 794) * 100);
            setZoom(Math.max(30, Math.min(screenZoom, 100)));
        }
    };
    const printRef = useRef(null);

    const handlePersonalChange = useCallback((e) => {
        setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [e.target.name]: e.target.value } }));
    }, []);

    const handleArrayChange = useCallback((group, index, field, value) => {
        setResumeData(prev => {
            const newArr = [...prev[group]];
            newArr[index] = { ...newArr[index], [field]: value };
            return { ...prev, [group]: newArr };
        });
    }, []);

    const removeArrayItem = useCallback((group, index) => {
        setResumeData(prev => ({ ...prev, [group]: prev[group].filter((_, i) => i !== index) }));
    }, []);

    const addArrayItem = useCallback((group, template) => {
        setResumeData(prev => ({ ...prev, [group]: [...prev[group], template] }));
    }, []);

    const handleOptimizeSummary = async () => {
        if (!resumeData.summary || resumeData.summary.trim().length < 10) {
            alert('Please write a rough career objective first.');
            return;
        }
        setLoadingSummary(true);
        try {
            const res = await axios.post('/resume/optimize-summary', { text: resumeData.summary });
            if (res.data.success) setResumeData(prev => ({ ...prev, summary: res.data.optimizedText }));
        } catch { alert('Failed to connect to AI for summary optimization.'); }
        finally { setLoadingSummary(false); }
    };

    const handleOptimizeExp = async (index, type = 'experience') => {
        const item = resumeData[type][index];
        if (!item.description || item.description.trim().length < 10) {
            alert(`Please write a rough ${type} description first.`);
            return;
        }
        setLoadingExp(`${type}-${index}`);
        try {
            const res = await axios.post('/resume/optimize-experience', { text: item.description, type });
            if (res.data.success) handleArrayChange(type, index, 'description', res.data.optimizedText);
        } catch { alert(`Failed to connect to AI for ${type} optimization.`); }
        finally { setLoadingExp(null); }
    };

    const handleDownload = () => {
        const t = document.title;
        document.title = `${resumeData.personal.name || 'Resume'}_Resume`;
        window.print();
        document.title = t;
    };

    // Progress calculation
    const filled = [
        resumeData.personal.name, resumeData.personal.email, resumeData.personal.phone,
        resumeData.summary,
        resumeData.education.some(e => e.institution),
        resumeData.experience.some(e => e.company),
        resumeData.projects.some(p => p.name),
        resumeData.skills.some(s => s.items),
    ].filter(Boolean).length;
    const progress = Math.round((filled / 8) * 100);

    if (loading) {
        return (
            <div className="max-w-[1500px] mx-auto xl:h-[calc(100vh-140px)] flex flex-col xl:flex-row gap-5 pb-16 md:pb-0 p-4">
                <div className="w-full xl:w-[44%] bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-6 w-32" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-3 pt-4">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ))}
                </div>
                <div className="hidden xl:flex w-full xl:w-[56%] flex-col bg-slate-50 rounded-3xl p-8 items-center">
                    <Skeleton className="h-[1056px] w-[794px] shadow-xl" />
                </div>
            </div>
        );
    }

    const zoomStyle = { transform: `scale(${zoom / 100})`, transformOrigin: 'top center' };

    return (
        <div className="max-w-[1500px] mx-auto animate-in fade-in duration-500
            xl:h-[calc(100vh-140px)] flex flex-col xl:flex-row gap-5
            print:h-auto print:block print:pb-0 print:w-full
            pb-16 md:pb-0">
            {/* pb-16 on mobile reserves space for the sticky tab bar */}
            <style>{`
                @media print {
                    @page { margin: 0; }
                    body * { visibility: hidden; }
                    #resume-print, #resume-print * { visibility: visible; }
                    #resume-print { position: fixed; left: 0; top: 0; width: 100%; }
                }
            `}</style>

            {/* ── LEFT: Form Panel ───────────────────────────────────────── */}
            {/* On mobile: hidden when preview tab active */}
            <div className={`w-full xl:w-[44%] bg-white rounded-3xl shadow-sm border border-slate-100
                overflow-y-auto scrollbar-hide max-h-full print:hidden flex flex-col
                ${mobileTab === 'edit' ? 'flex' : 'hidden xl:flex'}`}>

                {/* Header */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4">
                    {/* Single compact row on mobile */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base md:text-xl font-extrabold text-slate-800 tracking-tight leading-tight whitespace-nowrap">
                                    Resume Builder
                                </h2>
                                <span className="text-[10px] md:text-xs font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                    ATS-Ready
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 hidden md:block mt-0.5">Fill details to auto-generate your PDF</p>
                        </div>
                        <button
                            onClick={() => window.open('/RESUME_NEW.pdf', '_blank')}
                            className="shrink-0 px-2.5 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all flex items-center gap-1.5 whitespace-nowrap"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Template
                        </button>
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-slate-400 shrink-0">{progress}%</span>
                    </div>
                </div>

                {/* Form sections */}
                <div className="px-6 pt-4 pb-8">

                    {/* 1. Personal Info */}
                    <Section icon={User} title="Header & Contact" number="1" color="text-blue-500" accent="bg-blue-500">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className={labelCls}>Full Name</label>
                                <input name="name" value={resumeData.personal.name} onChange={handlePersonalChange} className={inputCls} placeholder="e.g. Alex Johnson" />
                            </div>
                            <div>
                                <label className={labelCls}>Email</label>
                                <input name="email" value={resumeData.personal.email} onChange={handlePersonalChange} className={inputCls} placeholder="alex@email.com" />
                            </div>
                            <div>
                                <label className={labelCls}>Phone</label>
                                <input name="phone" value={resumeData.personal.phone} onChange={handlePersonalChange} className={inputCls} placeholder="+1 234 567" />
                            </div>
                            <div>
                                <label className={labelCls}>LinkedIn</label>
                                <input name="linkedin" value={resumeData.personal.linkedin} onChange={handlePersonalChange} className={inputCls} placeholder="linkedin.com/in/..." />
                            </div>
                            <div>
                                <label className={labelCls}>GitHub</label>
                                <input name="github" value={resumeData.personal.github} onChange={handlePersonalChange} className={inputCls} placeholder="github.com/..." />
                            </div>
                            <div>
                                <label className={labelCls}>LeetCode</label>
                                <input name="leetcode" value={resumeData.personal.leetcode} onChange={handlePersonalChange} className={inputCls} placeholder="leetcode.com/u/..." />
                            </div>
                            <div>
                                <label className={labelCls}>GFG Practice</label>
                                <input name="gfg" value={resumeData.personal.gfg} onChange={handlePersonalChange} className={inputCls} placeholder="geeksforgeeks.org/..." />
                            </div>
                            <div className="col-span-2">
                                <label className={labelCls}>Location</label>
                                <input name="location" value={resumeData.personal.location} onChange={handlePersonalChange} className={inputCls} placeholder="City, State" />
                            </div>
                        </div>
                    </Section>

                    {/* 2. Career Objective */}
                    <Section icon={Sparkles} title="Career Objective" number="2" color="text-indigo-500" accent="bg-indigo-500">
                        <textarea
                            value={resumeData.summary}
                            onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                            className={`${inputCls} h-24 resize-none pb-2`}
                            placeholder="Write a rough summary of your career goals — AI will polish it for you..."
                        />
                        <div className="flex justify-end mt-2">
                            <AiBtn
                                onClick={handleOptimizeSummary}
                                loading={loadingSummary}
                                label="AI Enhance"
                                colorCls="bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                            />
                        </div>
                    </Section>

                    {/* 3. Education */}
                    <Section icon={BookOpen} title="Education" number="3" color="text-emerald-500" accent="bg-emerald-500">
                        {resumeData.education.map((edu, i) => (
                            <ItemCard key={i} onDelete={() => removeArrayItem('education', i)}>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <input placeholder="Institution" value={edu.institution} onChange={e => handleArrayChange('education', i, 'institution', e.target.value)} className={`${inputCls} col-span-2`} />
                                    <input placeholder="Degree / Program" value={edu.degree} onChange={e => handleArrayChange('education', i, 'degree', e.target.value)} className={inputCls} />
                                    <input placeholder="Duration (e.g. 2023–2027)" value={edu.duration} onChange={e => handleArrayChange('education', i, 'duration', e.target.value)} className={inputCls} />
                                    <input placeholder="Location" value={edu.location} onChange={e => handleArrayChange('education', i, 'location', e.target.value)} className={inputCls} />
                                    <input placeholder="CGPA / Grade" value={edu.cgpa} onChange={e => handleArrayChange('education', i, 'cgpa', e.target.value)} className={inputCls} />
                                </div>
                            </ItemCard>
                        ))}
                        <AddBtn onClick={() => addArrayItem('education', { institution: '', degree: '', duration: '', location: '', cgpa: '' })} label="Add Education" color="emerald" />
                    </Section>

                    {/* 4. Experience */}
                    <Section icon={Briefcase} title="Experience" number="4" color="text-purple-500" accent="bg-purple-500">
                        {resumeData.experience.map((exp, i) => (
                            <ItemCard key={i} onDelete={() => removeArrayItem('experience', i)}>
                                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                                    <input placeholder="Job Title" value={exp.title} onChange={e => handleArrayChange('experience', i, 'title', e.target.value)} className={inputCls} />
                                    <input placeholder="Company" value={exp.company} onChange={e => handleArrayChange('experience', i, 'company', e.target.value)} className={inputCls} />
                                    <input placeholder="Tech Stack" value={exp.techStack} onChange={e => handleArrayChange('experience', i, 'techStack', e.target.value)} className={inputCls} />
                                    <input placeholder="Duration" value={exp.duration} onChange={e => handleArrayChange('experience', i, 'duration', e.target.value)} className={inputCls} />
                                    <input placeholder="Location" value={exp.location} onChange={e => handleArrayChange('experience', i, 'location', e.target.value)} className={`${inputCls} col-span-2`} />
                                </div>
                                <textarea
                                    placeholder="Describe what you did — use rough notes, AI will rewrite in STAR format..."
                                    value={exp.description}
                                    onChange={e => handleArrayChange('experience', i, 'description', e.target.value)}
                                    className={`${inputCls} h-24 resize-none mb-2`}
                                />
                                <div className="flex justify-end">
                                    <AiBtn
                                        onClick={() => handleOptimizeExp(i, 'experience')}
                                        loading={loadingExp === `experience-${i}`}
                                        label="AI Rewrite"
                                        colorCls="bg-purple-50 text-purple-600 hover:bg-purple-100"
                                    />
                                </div>
                            </ItemCard>
                        ))}
                        <AddBtn onClick={() => addArrayItem('experience', { title: '', company: '', techStack: '', duration: '', location: '', description: '' })} label="Add Experience" color="purple" />
                    </Section>

                    {/* 5. Projects */}
                    <Section icon={Layers} title="Projects" number="5" color="text-orange-500" accent="bg-orange-500">
                        {resumeData.projects.map((proj, i) => (
                            <ItemCard key={i} onDelete={() => removeArrayItem('projects', i)}>
                                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                                    <input placeholder="Project Name" value={proj.name} onChange={e => handleArrayChange('projects', i, 'name', e.target.value)} className={`${inputCls} col-span-2`} />
                                    <input placeholder="GitHub URL" value={proj.github} onChange={e => handleArrayChange('projects', i, 'github', e.target.value)} className={inputCls} />
                                    <input placeholder="Live URL" value={proj.liveLink} onChange={e => handleArrayChange('projects', i, 'liveLink', e.target.value)} className={inputCls} />
                                    <input placeholder="Tech Stack" value={proj.techStack} onChange={e => handleArrayChange('projects', i, 'techStack', e.target.value)} className={inputCls} />
                                    <input placeholder="Date / Duration" value={proj.duration} onChange={e => handleArrayChange('projects', i, 'duration', e.target.value)} className={inputCls} />
                                </div>
                                <textarea
                                    placeholder="Key highlights & accomplishments..."
                                    value={proj.description}
                                    onChange={e => handleArrayChange('projects', i, 'description', e.target.value)}
                                    className={`${inputCls} h-24 resize-none mb-2`}
                                />
                                <div className="flex justify-end">
                                    <AiBtn
                                        onClick={() => handleOptimizeExp(i, 'projects')}
                                        loading={loadingExp === `projects-${i}`}
                                        label="AI Rewrite"
                                        colorCls="bg-orange-50 text-orange-600 hover:bg-orange-100"
                                    />
                                </div>
                            </ItemCard>
                        ))}
                        <AddBtn onClick={() => addArrayItem('projects', { name: '', github: '', liveLink: '', techStack: '', duration: '', description: '' })} label="Add Project" color="orange" />
                    </Section>

                    {/* 6. Certifications */}
                    <Section icon={Award} title="Certifications" number="6" color="text-yellow-500" accent="bg-yellow-500">
                        <div className="space-y-2.5 mb-3">
                            {resumeData.certifications.map((cert, i) => (
                                <div key={i} className="flex gap-2 items-center group">
                                    <input
                                        value={cert.name}
                                        onChange={e => handleArrayChange('certifications', i, 'name', e.target.value)}
                                        className={`${inputCls} flex-1`}
                                        placeholder="Certification name (e.g. AWS Certified)"
                                    />
                                    <button
                                        onClick={() => removeArrayItem('certifications', i)}
                                        className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <AddBtn onClick={() => addArrayItem('certifications', { name: '', link: '' })} label="Add Certification" color="yellow" />
                    </Section>

                    {/* 7. Skills */}
                    <Section icon={Code} title="Technical Skills" number="7" color="text-pink-500" accent="bg-pink-500">
                        <div className="space-y-2.5 mb-3">
                            {resumeData.skills.map((skill, i) => (
                                <div key={i} className="flex gap-2 items-center group">
                                    <input
                                        value={skill.category}
                                        onChange={e => handleArrayChange('skills', i, 'category', e.target.value)}
                                        className={`${inputCls} w-[35%] shrink-0 font-semibold`}
                                        placeholder="Category"
                                    />
                                    <input
                                        value={skill.items}
                                        onChange={e => handleArrayChange('skills', i, 'items', e.target.value)}
                                        className={`${inputCls} flex-1`}
                                        placeholder="Skill 1, Skill 2, Skill 3..."
                                    />
                                    <button
                                        onClick={() => removeArrayItem('skills', i)}
                                        className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <AddBtn onClick={() => addArrayItem('skills', { category: '', items: '' })} label="Add Skill Category" color="pink" />
                    </Section>

                </div>
            </div>

            {/* ── RIGHT: Preview Panel ───────────────────────────────────── */}
            {/* On mobile: hidden when edit tab active */}
            <div className={`w-full xl:w-[56%] flex flex-col bg-slate-100 md:rounded-3xl
                overflow-hidden max-h-full print:w-full print:bg-white print:block
                ${mobileTab === 'preview' ? 'flex' : 'hidden xl:flex'}`}>

                {/* Preview toolbar */}
                <div className="flex items-center justify-between bg-slate-800 px-3 md:px-5 py-2.5 md:py-3 print:hidden shrink-0 gap-2 md:gap-3">
                    {/* Label — hidden on small mobile to save space */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-white text-sm font-semibold">Live Preview</span>
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Live" />
                    </div>
                    {/* On tiny screens just show the pulse dot */}
                    <span className="sm:hidden w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />

                    {/* Zoom controls */}
                    <div className="flex items-center gap-1 bg-slate-700 rounded-xl px-2 py-1">
                        <button
                            onClick={() => setZoom(z => Math.max(30, z - 10))}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                        >
                            <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-slate-300 font-mono w-8 text-center">{zoom}%</span>
                        <button
                            onClick={() => setZoom(z => Math.min(120, z + 10))}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                        >
                            <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Download button — icon only on mobile, full label on md+ */}
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-900/40 shrink-0"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden md:inline">Download PDF</span>
                    </button>
                </div>

                {/* Preview area */}
                <div className="flex-1 overflow-auto w-full bg-slate-100 print:bg-white flex justify-center
                    p-3 md:p-6 print:p-0">
                    {/* Auto-scale on mobile so the A4 page fits the screen */}
                    <div
                        className="transition-transform duration-200"
                        style={{
                            ...zoomStyle,
                            width: '794px',
                            minHeight: '1056px',
                        }}
                    >
                        {/* ── RESUME PAGE ───────────────────────────── */}
                        <div
                            id="resume-print"
                            ref={printRef}
                            className="bg-white shadow-2xl print:shadow-none min-h-[1056px] w-[794px] pt-[12mm] pb-[25.4mm] px-[25.4mm] text-black"
                            style={{ fontFamily: "'Times New Roman', serif", lineHeight: '1.15', fontSize: '10.5px' }}
                        >
                            {/* Header */}
                            <header className="text-center mb-3">
                                <h1 className="font-bold uppercase mb-0.5" style={{ fontSize: '18px' }}>
                                    {resumeData.personal.name || 'YOUR NAME'}
                                </h1>
                                <div className="flex flex-col items-center justify-center" style={{ fontSize: '10.5px', lineHeight: '1.15' }}>
                                    <div className="mb-0.5">
                                        {resumeData.personal.phone && <span>{resumeData.personal.phone}</span>}
                                        {resumeData.personal.email && <><span className="mx-1">|</span><span>{resumeData.personal.email}</span></>}
                                    </div>
                                    <div className="flex items-center justify-center gap-3 mb-0.5" style={{ lineHeight: '1.15' }}>
                                        {resumeData.personal.linkedin && (
                                            <a href={resumeData.personal.linkedin} className="text-blue-600 underline whitespace-nowrap" target="_blank" rel="noreferrer">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5 mr-[3px]"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                                                LinkedIn
                                            </a>
                                        )}
                                        {resumeData.personal.github && (
                                            <a href={resumeData.personal.github} className="text-blue-600 underline whitespace-nowrap" target="_blank" rel="noreferrer">
                                                <img src="/icons/github.svg" alt="" className="w-[11px] h-[11px] mr-[3px] inline -mt-0.5" />GitHub
                                            </a>
                                        )}
                                        {resumeData.personal.gfg && (
                                            <a href={resumeData.personal.gfg} className="text-blue-600 underline whitespace-nowrap" target="_blank" rel="noreferrer">
                                                <img src="/icons/geeksforgeeks.svg" alt="" className="w-[11px] h-[11px] mr-[3px] inline -mt-0.5" />GFG Practice
                                            </a>
                                        )}
                                        {resumeData.personal.leetcode && (
                                            <a href={resumeData.personal.leetcode} className="text-blue-600 underline whitespace-nowrap" target="_blank" rel="noreferrer">
                                                <img src="/icons/leetcode.svg" alt="" className="w-[11px] h-[11px] mr-[3px] inline -mt-0.5" />LeetCode
                                            </a>
                                        )}
                                    </div>
                                    {resumeData.personal.location && <div>{resumeData.personal.location}</div>}
                                </div>
                            </header>

                            {/* Career Objective */}
                            {resumeData.summary && (
                                <div className="mb-2.5">
                                    <h2 className="font-bold uppercase border-b border-black mb-1 pb-[1px]" style={{ fontSize: '12px' }}>Career Objective</h2>
                                    <p className="text-justify" style={{ fontSize: '10.5px', lineHeight: '1.15' }}>{resumeData.summary}</p>
                                </div>
                            )}

                            {/* Education */}
                            {resumeData.education.some(e => e.institution || e.degree) && (
                                <div className="mb-2.5">
                                    <h2 className="font-bold uppercase border-b border-black mb-1 pb-[1px]" style={{ fontSize: '12px' }}>Education</h2>
                                    {resumeData.education.filter(e => e.institution || e.degree).map((edu, i) => (
                                        <div key={i} className="mb-1.5" style={{ fontSize: '10.5px' }}>
                                            <div className="flex justify-between items-start font-bold">
                                                <div><span className="mr-1.5">•</span>{edu.institution}</div>
                                                <div className="text-right font-normal">{edu.duration}</div>
                                            </div>
                                            <div className="flex justify-between items-start italic pl-[9px]">
                                                <div>{edu.degree}</div>
                                                <div className="text-right not-italic font-normal">{edu.location}</div>
                                            </div>
                                            {edu.cgpa && <div className="pl-[9px] mt-0.5">◦ CGPA: {edu.cgpa}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Experience */}
                            {resumeData.experience.some(e => e.company || e.title) && (
                                <div className="mb-2.5">
                                    <h2 className="font-bold uppercase border-b border-black mb-1 pb-[1px]" style={{ fontSize: '12px' }}>Experience</h2>
                                    {resumeData.experience.filter(e => e.company || e.title).map((exp, i) => (
                                        <div key={i} className="mb-2" style={{ fontSize: '10.5px' }}>
                                            <div className="flex justify-between items-center font-bold">
                                                <div><span className="mr-1.5">•</span>{exp.company}</div>
                                                <div className="font-normal">{exp.duration}</div>
                                            </div>
                                            <div className="flex justify-between items-center italic pl-3">
                                                <div>{exp.title}{exp.techStack ? ` | ${exp.techStack}` : ''}</div>
                                                <div className="not-italic font-normal">{exp.location}</div>
                                            </div>
                                            <ul className="pl-3 mt-0.5 list-none" style={{ lineHeight: '1.1' }}>
                                                {exp.description.split('\n').filter(l => l.trim()).map((line, j) => (
                                                    <li key={j} className="text-justify mb-[1px] flex gap-1.5 items-start">
                                                        <span className="shrink-0">◦</span>
                                                        <span>{line.replace(/^[-•◦]\s*/, '')}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Projects */}
                            {resumeData.projects.some(p => p.name) && (
                                <div className="mb-2.5">
                                    <h2 className="font-bold uppercase border-b border-black mb-1 pb-[1px]" style={{ fontSize: '12px' }}>Projects</h2>
                                    {resumeData.projects.filter(p => p.name).map((proj, i) => (
                                        <div key={i} className="mb-2" style={{ fontSize: '10.5px' }}>
                                            <div className="flex justify-between items-center font-bold">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span><span className="mr-1.5">•</span>{proj.name}</span>
                                                    {(proj.github || proj.liveLink) && <span>|</span>}
                                                    {proj.github && (
                                                        <a href={proj.github} className="text-blue-600 font-normal" target="_blank" rel="noreferrer" title="GitHub">
                                                            <img src="/icons/github.svg" alt="GitHub" className="w-[12px] h-[12px] inline -mt-0.5" />
                                                        </a>
                                                    )}
                                                    {proj.liveLink && (
                                                        <a href={proj.liveLink} className="text-blue-600 font-normal" target="_blank" rel="noreferrer" title="Live Link">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="font-normal">{proj.duration}</div>
                                            </div>
                                            {proj.techStack && <div className="italic pl-3 mb-0.5">Tools: {proj.techStack}</div>}
                                            <ul className="pl-3 mt-0.5 list-none" style={{ lineHeight: '1.1' }}>
                                                {proj.description.split('\n').filter(l => l.trim()).map((line, j) => (
                                                    <li key={j} className="text-justify mb-[1px] flex gap-1.5 items-start">
                                                        <span className="shrink-0">◦</span>
                                                        <span>{line.replace(/^[-•◦]\s*/, '')}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Certifications */}
                            {resumeData.certifications.some(c => c.name) && (
                                <div className="mb-2.5">
                                    <h2 className="font-bold uppercase border-b border-black mb-1 pb-[1px]" style={{ fontSize: '12px' }}>Certifications</h2>
                                    <ul className="pl-3 m-0 list-none" style={{ fontSize: '10.5px', lineHeight: '1.1' }}>
                                        {resumeData.certifications.filter(c => c.name).map((cert, i) => (
                                            <li key={i} className="text-justify mb-[1px] font-bold flex gap-1.5 items-start">
                                                <span className="shrink-0">•</span>
                                                <span>
                                                    {cert.link
                                                        ? <a href={cert.link} className="text-blue-600 font-normal underline" target="_blank" rel="noreferrer">{cert.name}</a>
                                                        : cert.name
                                                    }
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Skills */}
                            {resumeData.skills.some(s => s.category || s.items) && (
                                <div className="mb-0">
                                    <h2 className="font-bold uppercase border-b border-black mb-1 pb-[1px]" style={{ fontSize: '12px' }}>Skills</h2>
                                    <div className="space-y-[1px] pl-3" style={{ fontSize: '10.5px', lineHeight: '1.1' }}>
                                        {resumeData.skills.filter(s => s.category || s.items).map((skill, i) => (
                                            <div key={i}>
                                                <span className="font-bold mr-1.5">•</span>
                                                <span className="font-bold">{skill.category}{skill.category ? ':' : ''}</span> {skill.items}
                                            </div>
                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MOBILE: Sticky bottom tab bar ─────────────────────────── */}
            <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 print:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center">

                {/* Edit tab */}
                <button
                    onClick={() => handleMobileTabChange('edit')}    
                    className={`relative flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                        mobileTab === 'edit' ? 'text-blue-600' : 'text-slate-400'
                    }`}
                >
                    <FileText className="w-5 h-5" />
                    <span className="text-[11px] font-semibold">Edit</span>
                    {mobileTab === 'edit' && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-600 rounded-full" />}
                </button>

                {/* Centre: Download FAB */}
                <button
                    onClick={handleDownload}
                    className="mx-4 -mt-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/40 active:scale-95 transition-transform shrink-0"
                    title="Download PDF"
                >
                    <Download className="w-6 h-6 text-white" />
                </button>

                {/* Preview tab */}
                <button
                    onClick={() => handleMobileTabChange('preview')}  
                    className={`relative flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                        mobileTab === 'preview' ? 'text-blue-600' : 'text-slate-400'
                    }`}
                >
                    <Eye className="w-5 h-5" />
                    <span className="text-[11px] font-semibold">Preview</span>
                    {mobileTab === 'preview' && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-600 rounded-full" />}
                </button>
            </div>
        </div>
    );
};

export default AiResumeBuilder;
