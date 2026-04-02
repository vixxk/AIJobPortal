import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
    FileText, Sparkles, Download, Loader2, Briefcase, Code,
    User, BookOpen, Layers, Award, ChevronDown, ChevronUp, ChevronRight,
    Trash2, Plus, ZoomIn, ZoomOut, Eye, Check, Palette,
    Type, ExternalLink
} from 'lucide-react';
import axios from '../utils/axios';
import Skeleton from '../components/ui/Skeleton';

const SAMPLE_ATS_URL = 'https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs.pdf';

const ATS_FONTS = [
    { label: 'Template Default', value: 'default' },
    { label: 'Arial', value: "Arial, Helvetica, sans-serif" },
    { label: 'Calibri', value: "Calibri, 'Segoe UI', sans-serif" },
    { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { label: 'Georgia', value: "Georgia, serif" },
    { label: 'Garamond', value: "Garamond, serif" },
    { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" }
];

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPLATE DEFINITIONS — each template is a style-config object.
   The resume renderer reads these values and applies them as inline styles
   so that the print output is 100% reliable (no Tailwind dependency).
   ═══════════════════════════════════════════════════════════════════════════ */
const TEMPLATES = {
    classic: {
        id: 'classic',
        name: 'Classic',
        desc: 'Traditional ATS format',
        font: "'Times New Roman', Times, serif",
        nameSize: '18pt', nameWeight: 700, nameTransform: 'uppercase', nameSpacing: '0',
        headingSize: '11.5pt',
        heading: { fontWeight: 700, textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '1px', color: '#000', letterSpacing: '0' },
        bodySize: '10.5pt', lineHeight: '1.18',
        pagePadding: '10mm 14mm 10mm 14mm',
        linkColor: '#0563C1',
        sectionGap: '4px', itemGap: '3px',
        bullet: '•', subBullet: '◦',
        contactSep: ' | ',
    },
    modern: {
        id: 'modern',
        name: 'Modern',
        desc: 'Clean blue accents',
        font: "'Calibri', 'Segoe UI', 'Helvetica Neue', sans-serif",
        nameSize: '20pt', nameWeight: 700, nameTransform: 'none', nameSpacing: '0.5px',
        headingSize: '11pt',
        heading: { fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid #2563EB', paddingBottom: '2px', color: '#1e40af', letterSpacing: '1px' },
        bodySize: '10pt', lineHeight: '1.22',
        pagePadding: '12mm 15mm 12mm 15mm',
        linkColor: '#2563EB',
        sectionGap: '6px', itemGap: '4px',
        bullet: '▪', subBullet: '–',
        contactSep: '  •  ',
    },
    crisp: {
        id: 'crisp',
        name: 'Crisp',
        desc: 'Compact & clean',
        font: "'Arial', Helvetica, sans-serif",
        nameSize: '17pt', nameWeight: 700, nameTransform: 'uppercase', nameSpacing: '2px',
        headingSize: '10.5pt',
        heading: { fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #444', paddingBottom: '1px', color: '#222', letterSpacing: '1px' },
        bodySize: '9.5pt', lineHeight: '1.18',
        pagePadding: '9mm 12mm 9mm 12mm',
        linkColor: '#0066cc',
        sectionGap: '4px', itemGap: '3px',
        bullet: '•', subBullet: '–',
        contactSep: ' | ',
    },
    elegant: {
        id: 'elegant',
        name: 'Elegant',
        desc: 'Refined serif styling',
        font: "'Georgia', Cambria, 'Times New Roman', serif",
        nameSize: '20pt', nameWeight: 700, nameTransform: 'uppercase', nameSpacing: '2px',
        headingSize: '11pt',
        heading: { fontWeight: 700, textTransform: 'uppercase', borderBottom: '1.5px solid #1a1a2e', paddingBottom: '2px', color: '#1a1a2e', letterSpacing: '1.5px' },
        bodySize: '10pt', lineHeight: '1.2',
        pagePadding: '12mm 15mm 12mm 15mm',
        linkColor: '#2c3e6b',
        sectionGap: '5px', itemGap: '4px',
        bullet: '■', subBullet: '•',
        contactSep: '  |  ',
    },
};

/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE FORM UI COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[16px] md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-300";
const labelCls = "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1";

const Section = ({ icon: Icon, title, number, color, children, accent }) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="mb-5">
            <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2.5 py-2.5 px-1 group">
                <span className={`w-6 h-6 rounded-lg ${accent} flex items-center justify-center text-xs font-bold text-white shrink-0`}>{number}</span>
                <Icon className={`w-4 h-4 ${color} shrink-0`} />
                <span className="font-bold text-slate-700 text-sm flex-1 text-left">{title}</span>
                {open ? <ChevronUp className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" /> : <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />}
            </button>
            <div className={`border-t border-slate-100 ${open ? 'pt-4' : 'hidden'}`}>{children}</div>
        </div>
    );
};

const ItemCard = ({ onDelete, children }) => (
    <div className="relative p-5 bg-slate-50/50 border border-slate-200 rounded-2xl mb-4 group hover:border-blue-200 hover:bg-white transition-all">
        {children}
        <button onClick={onDelete} className="absolute -top-2.5 -right-2.5 p-2 rounded-xl bg-white shadow-md border border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 text-slate-400 transition-all z-20 flex items-center justify-center" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
    </div>
);

const AiBtn = ({ onClick, loading, label = 'AI Enhance', colorCls = 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' }) => (
    <button onClick={onClick} disabled={loading} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 ${colorCls}`}>
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}{label}
    </button>
);

const AddBtn = ({ onClick, label, color = 'blue' }) => (
    <button onClick={onClick} className={`flex items-center gap-1.5 text-sm font-semibold text-${color}-600 hover:text-${color}-700 mt-1 group`}>
        <span className={`w-5 h-5 rounded-full border-2 border-${color}-300 group-hover:border-${color}-500 flex items-center justify-center transition-colors`}><Plus className="w-3 h-3" /></span>{label}
    </button>
);

/* ═══════════════════════════════════════════════════════════════════════════
   RESUME RENDERER — All inline styles, zero Tailwind inside.
   Produces clean, ATS-parseable HTML that prints perfectly.
   ═══════════════════════════════════════════════════════════════════════════ */
const ResumeContent = ({ data, templateId, fontSizeOffset = 0, fontFamily = 'default' }) => {
    const t = TEMPLATES[templateId] || TEMPLATES.classic;
    const d = data;

    const activeFont = fontFamily !== 'default' ? fontFamily : t.font;

    // Parse pt values and apply user's font size offset
    const adjustSize = (sizeStr) => {
        const val = parseFloat(sizeStr);
        return `${(val + fontSizeOffset).toFixed(1)}pt`;
    };
    const bodySize = adjustSize(t.bodySize);
    const headingSize = adjustSize(t.headingSize);
    const nameSize = adjustSize(t.nameSize);

    // Filter to only non-empty items
    const education = d.education.filter(e => e.institution || e.degree);
    const experience = d.experience.filter(e => e.company || e.title);
    const projects = d.projects.filter(p => p.name);
    const certifications = d.certifications.filter(c => c.name);
    const skills = d.skills.filter(s => s.category || s.items);
    const hasSummary = d.summary && d.summary.trim();

    // Dynamic section gap: more sections → tighter spacing
    const activeSections = [hasSummary, education.length, experience.length, projects.length, certifications.length, skills.length].filter(Boolean).length;
    const sGap = activeSections <= 3 ? '8px' : activeSections <= 5 ? t.sectionGap : '3px';

    // Contact info builder
    const contactParts = [d.personal.phone, d.personal.email, d.personal.location].filter(Boolean);
    const mkHref = (url) => url.startsWith('http') ? url : `https://${url}`;

    // Inline icon helpers — small logos for the resume
    const ico = (src, alt, size = '11px') => (
        <img src={src} alt={alt} style={{ width: size, height: size, display: 'inline', verticalAlign: '-1px', marginRight: '3px' }} />
    );
    const linkedInIco = (size = '11px') => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: '-1px', marginRight: '3px' }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
    );
    const extLinkIco = (size = '12px') => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: '-1px', marginRight: '2px' }}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
    );

    // Build link parts with icons
    const linkParts = [
        d.personal.linkedin && { label: 'LinkedIn', href: mkHref(d.personal.linkedin), icon: linkedInIco() },
        d.personal.github && { label: 'GitHub', href: mkHref(d.personal.github), icon: ico('/icons/github.svg', 'GitHub') },
        d.personal.leetcode && { label: 'LeetCode', href: mkHref(d.personal.leetcode), icon: ico('/icons/leetcode.svg', 'LeetCode') },
        d.personal.gfg && { label: 'GFG', href: mkHref(d.personal.gfg), icon: ico('/icons/geeksforgeeks.svg', 'GFG') },
    ].filter(Boolean);

    const headingStyle = {
        fontSize: headingSize, fontWeight: t.heading.fontWeight, textTransform: t.heading.textTransform,
        borderBottom: t.heading.borderBottom, paddingBottom: t.heading.paddingBottom, color: t.heading.color,
        letterSpacing: t.heading.letterSpacing, marginTop: '0', marginBottom: '3px', lineHeight: '1.4',
    };

    const parseBullets = (text) => {
        if (!text) return [];
        return text.split('\n').filter(l => l.trim()).map(l => l.replace(/^[\s]*[-•◦▪▸●–■]\s*/, '').trim()).filter(Boolean);
    };

    return (
        <div style={{ fontFamily: activeFont, fontSize: bodySize, lineHeight: t.lineHeight, color: '#000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            {/* ── HEADER ── */}
            <header style={{ textAlign: 'center', marginBottom: sGap }}>
                <h1 style={{ fontSize: nameSize, fontWeight: t.nameWeight, textTransform: t.nameTransform, letterSpacing: t.nameSpacing, margin: '0 0 2px 0', lineHeight: '1.15', color: '#000' }}>
                    {d.personal.name || 'YOUR NAME'}
                </h1>
                <div style={{ fontSize: bodySize, lineHeight: '1.4' }}>
                    {contactParts.length > 0 && <div>{contactParts.join(t.contactSep)}</div>}
                    {linkParts.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {linkParts.map((lnk, i) => (
                                <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {i > 0 && <span style={{ margin: '0 3px', color: '#666' }}>|</span>}
                                    <a href={lnk.href} style={{ color: t.linkColor, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }} target="_blank" rel="noreferrer">
                                        {lnk.icon}{lnk.label}
                                    </a>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {/* ── CAREER OBJECTIVE ── */}
            {hasSummary && (
                <div style={{ marginBottom: sGap }}>
                    <h2 style={headingStyle}>Career Objective</h2>
                    <p style={{ margin: 0, textAlign: 'justify', fontSize: bodySize, lineHeight: t.lineHeight }}>{d.summary}</p>
                </div>
            )}

            {/* ── EDUCATION ── */}
            {education.length > 0 && (
                <div style={{ marginBottom: sGap }}>
                    <h2 style={headingStyle}>Education</h2>
                    {education.map((edu, i) => (
                        <div key={i} style={{ marginBottom: i < education.length - 1 ? t.itemGap : '0', fontSize: bodySize, lineHeight: t.lineHeight }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 700 }}>
                                <span>{t.bullet} {edu.institution}</span>
                                <span style={{ fontWeight: 400, flexShrink: 0, marginLeft: '8px' }}>{edu.duration}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontStyle: 'italic', paddingLeft: '12px' }}>
                                <span>{edu.degree}</span>
                                <span style={{ fontStyle: 'normal', fontWeight: 400, flexShrink: 0, marginLeft: '8px' }}>{edu.location}</span>
                            </div>
                            {edu.cgpa && <div style={{ paddingLeft: '12px', marginTop: '1px' }}>{t.subBullet} CGPA: {edu.cgpa}</div>}
                        </div>
                    ))}
                </div>
            )}

            {/* ── EXPERIENCE ── */}
            {experience.length > 0 && (
                <div style={{ marginBottom: sGap }}>
                    <h2 style={headingStyle}>Experience</h2>
                    {experience.map((exp, i) => {
                        const bullets = parseBullets(exp.description);
                        return (
                            <div key={i} style={{ marginBottom: i < experience.length - 1 ? t.itemGap : '0', fontSize: bodySize }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 700 }}>
                                    <span>{t.bullet} {exp.company}</span>
                                    <span style={{ fontWeight: 400, flexShrink: 0, marginLeft: '8px' }}>{exp.duration}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontStyle: 'italic', paddingLeft: '12px' }}>
                                    <span>{exp.title}{exp.techStack ? ` | ${exp.techStack}` : ''}</span>
                                    <span style={{ fontStyle: 'normal', fontWeight: 400, flexShrink: 0, marginLeft: '8px' }}>{exp.location}</span>
                                </div>
                                {bullets.length > 0 && (
                                    <ul style={{ paddingLeft: '12px', margin: '2px 0 0 0', listStyle: 'none', lineHeight: t.lineHeight }}>
                                        {bullets.map((line, j) => (
                                            <li key={j} style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', textAlign: 'justify', marginBottom: '1px' }}>
                                                <span style={{ flexShrink: 0 }}>{t.subBullet}</span><span>{line}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── PROJECTS ── */}
            {projects.length > 0 && (
                <div style={{ marginBottom: sGap }}>
                    <h2 style={headingStyle}>Projects</h2>
                    {projects.map((proj, i) => {
                        const bullets = parseBullets(proj.description);
                        return (
                            <div key={i} style={{ marginBottom: i < projects.length - 1 ? t.itemGap : '0', fontSize: bodySize }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                        <span>{t.bullet} {proj.name}</span>
                                        {(proj.github || proj.liveLink) && <span style={{ color: '#666' }}>|</span>}
                                        {proj.github && (
                                            <a href={mkHref(proj.github)} style={{ color: t.linkColor, fontWeight: 400, display: 'inline-flex', alignItems: 'center' }} target="_blank" rel="noreferrer" title="GitHub">
                                                {ico('/icons/github.svg', 'GitHub', '12px')}
                                            </a>
                                        )}
                                        {proj.liveLink && (
                                            <a href={mkHref(proj.liveLink)} style={{ color: t.linkColor, fontWeight: 400, display: 'inline-flex', alignItems: 'center' }} target="_blank" rel="noreferrer" title="Live Demo">
                                                {extLinkIco('12px')}
                                            </a>
                                        )}
                                    </div>
                                    <span style={{ fontWeight: 400, flexShrink: 0, marginLeft: '8px' }}>{proj.duration}</span>
                                </div>
                                {proj.techStack && <div style={{ fontStyle: 'italic', paddingLeft: '12px', marginBottom: '1px' }}>Tools: {proj.techStack}</div>}
                                {bullets.length > 0 && (
                                    <ul style={{ paddingLeft: '12px', margin: '2px 0 0 0', listStyle: 'none', lineHeight: t.lineHeight }}>
                                        {bullets.map((line, j) => (
                                            <li key={j} style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', textAlign: 'justify', marginBottom: '1px' }}>
                                                <span style={{ flexShrink: 0 }}>{t.subBullet}</span><span>{line}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── CERTIFICATIONS ── */}
            {certifications.length > 0 && (
                <div style={{ marginBottom: sGap }}>
                    <h2 style={headingStyle}>Certifications</h2>
                    <ul style={{ paddingLeft: '12px', margin: 0, listStyle: 'none', fontSize: bodySize, lineHeight: t.lineHeight }}>
                        {certifications.map((cert, i) => (
                            <li key={i} style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', marginBottom: '1px' }}>
                                <span style={{ flexShrink: 0 }}>{t.bullet}</span>
                                <span>{cert.link ? <a href={cert.link.startsWith('http') ? cert.link : `https://${cert.link}`} style={{ color: t.linkColor, textDecoration: 'underline' }} target="_blank" rel="noreferrer">{cert.name}</a> : cert.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── SKILLS ── */}
            {skills.length > 0 && (
                <div style={{ marginBottom: '0' }}>
                    <h2 style={headingStyle}>Skills</h2>
                    <div style={{ paddingLeft: '12px', fontSize: bodySize, lineHeight: t.lineHeight }}>
                        {skills.map((skill, i) => (
                            <div key={i} style={{ marginBottom: '1px' }}>
                                <span style={{ fontWeight: 700, marginRight: '4px' }}>{t.bullet} {skill.category}{skill.category ? ':' : ''}</span>{skill.items}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const AiResumeBuilder = () => {
    const [loading, setLoading] = useState(true);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingExp, setLoadingExp] = useState(null);
    const [zoom, setZoom] = useState(75);
    const [mobileTab, setMobileTab] = useState('edit');
    const [selectedTemplate, setSelectedTemplate] = useState('classic');
    const [fontSizeOffset, setFontSizeOffset] = useState(0);
    const [fontFamily, setFontFamily] = useState('default');

    const [resumeData, setResumeData] = useState({
        personal: { name: '', email: '', phone: '', linkedin: '', github: '', leetcode: '', gfg: '', location: '' },
        summary: '',
        education: [{ institution: '', degree: '', duration: '', location: '', cgpa: '' }],
        experience: [{ title: '', company: '', techStack: '', duration: '', location: '', description: '' }],
        projects: [{ name: '', github: '', liveLink: '', techStack: '', duration: '', description: '' }],
        certifications: [{ name: '', link: '' }],
        skills: [{ category: '', items: '' }]
    });

    useEffect(() => { fetchInitialData(); }, []);

    const fetchInitialData = async () => {
        try {
            const res = await axios.get('/student/me');
            if (res.data.status === 'success' && res.data.data.profile) {
                const p = res.data.data.profile;
                setResumeData(prev => ({
                    ...prev,
                    personal: { name: `${p.firstName || ''} ${p.lastName || ''}`.trim(), email: p.email || '', phone: p.phoneNumber || '', location: p.address || '', linkedin: '', github: '', leetcode: '', gfg: '' },
                    summary: p.summary || '',
                    education: p.education?.length > 0 ? p.education : prev.education,
                    experience: p.experience?.length > 0 ? p.experience : prev.experience,
                    projects: p.projects?.length > 0 ? p.projects : prev.projects,
                    skills: p.skills?.length > 0 ? [{ category: 'Skills', items: p.skills.join(', ') }] : prev.skills
                }));
            }
        } catch (err) { console.error("Failed to fetch profile for resume", err); }
        finally { setLoading(false); }
    };

    const handleMobileTabChange = (tab) => {
        setMobileTab(tab);
        if (tab === 'preview' && window.innerWidth < 1280) {
            const screenZoom = Math.floor(((window.innerWidth - 24) / 794) * 100);
            setZoom(Math.max(30, Math.min(screenZoom, 100)));
            const container = document.getElementById('main-scroll-container');
            if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const printRef = useRef(null);
    const handlePersonalChange = useCallback((e) => {
        setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [e.target.name]: e.target.value } }));
    }, []);
    const handleArrayChange = useCallback((group, index, field, value) => {
        setResumeData(prev => { const a = [...prev[group]]; a[index] = { ...a[index], [field]: value }; return { ...prev, [group]: a }; });
    }, []);
    const removeArrayItem = useCallback((group, index) => {
        setResumeData(prev => ({ ...prev, [group]: prev[group].filter((_, i) => i !== index) }));
    }, []);
    const addArrayItem = useCallback((group, template) => {
        setResumeData(prev => ({ ...prev, [group]: [...prev[group], template] }));
    }, []);

    const handleOptimizeSummary = async () => {
        if (!resumeData.summary || resumeData.summary.trim().length < 10) { alert('Please write a rough career objective first.'); return; }
        setLoadingSummary(true);
        try { const res = await axios.post('/resume/optimize-summary', { text: resumeData.summary }); if (res.data.success) setResumeData(prev => ({ ...prev, summary: res.data.optimizedText })); }
        catch { alert('Failed to connect to AI for summary optimization.'); }
        finally { setLoadingSummary(false); }
    };

    const handleOptimizeExp = async (index, type = 'experience') => {
        const item = resumeData[type][index];
        if (!item.description || item.description.trim().length < 10) { alert(`Please write a rough ${type} description first.`); return; }
        setLoadingExp(`${type}-${index}`);
        try { const res = await axios.post('/resume/optimize-experience', { text: item.description, type }); if (res.data.success) handleArrayChange(type, index, 'description', res.data.optimizedText); }
        catch { alert(`Failed to connect to AI for ${type} optimization.`); }
        finally { setLoadingExp(null); }
    };

    const handleDownload = () => {
        const t = document.title;
        document.title = `${resumeData.personal.name || 'Resume'}_Resume`;
        window.print();
        document.title = t;
    };

    // Progress
    const filled = [resumeData.personal.name, resumeData.personal.email, resumeData.personal.phone, resumeData.summary,
        resumeData.education.some(e => e.institution), resumeData.experience.some(e => e.company),
        resumeData.projects.some(p => p.name), resumeData.skills.some(s => s.items)].filter(Boolean).length;
    const progress = Math.round((filled / 8) * 100);

    const currentTpl = TEMPLATES[selectedTemplate] || TEMPLATES.classic;

    if (loading) {
        return (
            <div className="max-w-[1500px] mx-auto xl:h-[calc(100vh-140px)] flex flex-col xl:flex-row gap-5 pb-16 md:pb-0 p-4">
                <div className="w-full xl:w-[44%] bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                    <Skeleton className="h-20 w-full" /><Skeleton className="h-6 w-32" />
                    <div className="grid grid-cols-2 gap-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
                    {[1, 2, 3].map(i => (<div key={i} className="space-y-3 pt-4"><Skeleton className="h-6 w-40" /><Skeleton className="h-32 w-full" /></div>))}
                </div>
                <div className="hidden xl:flex w-full xl:w-[56%] flex-col bg-slate-50 rounded-3xl p-8 items-center"><Skeleton className="h-[1056px] w-[794px] shadow-xl" /></div>
            </div>
        );
    }

    const zoomStyle = { transform: `scale(${zoom / 100})`, transformOrigin: 'top center' };

    return (
        <div className="max-w-[1500px] mx-auto animate-in fade-in duration-500 xl:h-[calc(100vh-140px)] flex flex-col xl:flex-row gap-5 print:h-auto print:block print:pb-0 print:w-full pb-16 md:pb-0">
            {/* ── PRINT CSS ── */}
            <style>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body * { visibility: hidden !important; }
                    #resume-print, #resume-print * { visibility: visible !important; }
                    #preview-zoom-container {
                        transform: none !important;
                    }
                    #resume-print {
                        position: absolute !important;
                        left: 0 !important; top: 0 !important;
                        width: 210mm !important;
                        transform: none !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
                @media print {
                    .resume-item { break-inside: avoid; }
                }
            `}</style>

            {/* ═══ LEFT: Form Panel ═══ */}
            <div className={`w-full xl:w-[42%] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-y-auto scrollbar-hide max-h-full print:hidden flex flex-col ${mobileTab === 'edit' ? 'flex' : 'hidden xl:flex'}`}>

                {/* Header */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base md:text-xl font-extrabold text-slate-800 tracking-tight leading-tight whitespace-nowrap">Resume Builder</h2>
                                <span className="text-[10px] md:text-xs font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">ATS-Ready</span>
                            </div>
                            <div className="hidden md:flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-medium">
                                <span>Fill details</span>
                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                <span>Pick template</span>
                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                <span>Download PDF</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 shrink-0">{progress}%</span>
                    </div>
                </div>

                <div className="px-4 md:px-6 pt-4 pb-8">

                    {/* ── TEMPLATE SELECTOR ── */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2.5">
                            <Palette className="w-4 h-4 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Choose Template</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.values(TEMPLATES).map(tpl => (
                                <button key={tpl.id} onClick={() => { setSelectedTemplate(tpl.id); setFontSizeOffset(0); }}
                                    className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all ${selectedTemplate === tpl.id ? 'border-blue-500 bg-blue-50/60 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                                    {selectedTemplate === tpl.id && (
                                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                            <Check className="w-3 h-3 text-white" />
                                        </span>
                                    )}
                                    {/* Mini resume preview */}
                                    <div className="w-full aspect-[1/1.35] mb-1.5 rounded-lg border border-slate-200 bg-white p-1.5 flex flex-col gap-[2px] overflow-hidden" style={{ fontFamily: tpl.font }}>
                                        <div className="h-[3px] w-8 mx-auto rounded-full bg-slate-700" />
                                        <div className="h-[1px] w-10 mx-auto bg-slate-300" />
                                        <div className="flex-1 flex flex-col gap-[2px] mt-0.5">
                                            <div className="h-[2px] w-full rounded-full" style={{ backgroundColor: tpl.heading.color, opacity: .5 }} />
                                            <div className="h-[1px] w-3/4 bg-slate-200 rounded-full" />
                                            <div className="h-[1px] w-5/6 bg-slate-200 rounded-full" />
                                            <div className="h-[2px] w-full rounded-full mt-[2px]" style={{ backgroundColor: tpl.heading.color, opacity: .5 }} />
                                            <div className="h-[1px] w-2/3 bg-slate-200 rounded-full" />
                                            <div className="h-[1px] w-4/5 bg-slate-200 rounded-full" />
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-700 leading-tight">{tpl.name}</span>
                                    <span className="text-[9px] text-slate-400 leading-tight">{tpl.desc}</span>
                                </button>
                            ))}
                        </div>
                        {/* Sample PDF link */}
                        <a
                            href={SAMPLE_ATS_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                            View sample ATS resume
                        </a>
                    </div>

                    {/* ── TYPOGRAPHY ── */}
                    <div className="mb-5 p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Type className="w-4 h-4 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Typography & Scaling</span>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Font Family Selector */}
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Font Style</label>
                                <select 
                                    className="w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-semibold px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                                    value={fontFamily}
                                    onChange={e => setFontFamily(e.target.value)}
                                >
                                    {ATS_FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>
                            
                            {/* Font Size Slider */}
                            <div>
                                <div className="flex justify-between items-end mb-1.5">
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Font Size Boost</label>
                                    <span className="text-[11px] font-mono font-bold text-blue-600">
                                        {(parseFloat(currentTpl.bodySize) + fontSizeOffset).toFixed(1)}pt
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">-2pt</span>
                                    <input
                                        type="range"
                                        min="-2"
                                        max="3"
                                        step="0.5"
                                        value={fontSizeOffset}
                                        onChange={(e) => setFontSizeOffset(parseFloat(e.target.value))}
                                        className="flex-1 h-1.5 accent-blue-500 cursor-pointer"
                                    />
                                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">+3pt</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">Adjust to perfectly fill the page. ATS parsers prefer standard fonts like Arial or Times New Roman.</p>
                            </div>
                        </div>
                    </div>

                    {/* 1. Personal */}
                    <Section icon={User} title="Header & Contact" number="1" color="text-blue-500" accent="bg-blue-500">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2"><label className={labelCls}>Full Name</label><input name="name" value={resumeData.personal.name} onChange={handlePersonalChange} className={inputCls} placeholder="e.g. Alex Johnson" /></div>
                            <div><label className={labelCls}>Email</label><input name="email" value={resumeData.personal.email} onChange={handlePersonalChange} className={inputCls} placeholder="alex@email.com" /></div>
                            <div><label className={labelCls}>Phone</label><input name="phone" value={resumeData.personal.phone} onChange={handlePersonalChange} className={inputCls} placeholder="+1 234 567" /></div>
                            <div><label className={labelCls}>LinkedIn</label><input name="linkedin" value={resumeData.personal.linkedin} onChange={handlePersonalChange} className={inputCls} placeholder="linkedin.com/in/..." /></div>
                            <div><label className={labelCls}>GitHub</label><input name="github" value={resumeData.personal.github} onChange={handlePersonalChange} className={inputCls} placeholder="github.com/..." /></div>
                            <div><label className={labelCls}>LeetCode</label><input name="leetcode" value={resumeData.personal.leetcode} onChange={handlePersonalChange} className={inputCls} placeholder="leetcode.com/u/..." /></div>
                            <div><label className={labelCls}>GFG Practice</label><input name="gfg" value={resumeData.personal.gfg} onChange={handlePersonalChange} className={inputCls} placeholder="geeksforgeeks.org/..." /></div>
                            <div className="col-span-2"><label className={labelCls}>Location</label><input name="location" value={resumeData.personal.location} onChange={handlePersonalChange} className={inputCls} placeholder="City, State" /></div>
                        </div>
                    </Section>

                    {/* 2. Summary */}
                    <Section icon={Sparkles} title="Career Objective" number="2" color="text-indigo-500" accent="bg-indigo-500">
                        <textarea value={resumeData.summary} onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))} className={`${inputCls} h-24 resize-none pb-2`} placeholder="Write a rough summary — AI will polish it..." />
                        <div className="flex justify-end mt-2"><AiBtn onClick={handleOptimizeSummary} loading={loadingSummary} /></div>
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
                                <textarea placeholder="Describe what you did — use rough notes, AI will rewrite..." value={exp.description} onChange={e => handleArrayChange('experience', i, 'description', e.target.value)} className={`${inputCls} h-24 resize-none mb-2`} />
                                <div className="flex justify-end">
                                    <AiBtn onClick={() => handleOptimizeExp(i, 'experience')} loading={loadingExp === `experience-${i}`} label="AI Rewrite" colorCls="bg-purple-50 text-purple-600 hover:bg-purple-100" />
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
                                <textarea placeholder="Key highlights & accomplishments..." value={proj.description} onChange={e => handleArrayChange('projects', i, 'description', e.target.value)} className={`${inputCls} h-24 resize-none mb-2`} />
                                <div className="flex justify-end">
                                    <AiBtn onClick={() => handleOptimizeExp(i, 'projects')} loading={loadingExp === `projects-${i}`} label="AI Rewrite" colorCls="bg-orange-50 text-orange-600 hover:bg-orange-100" />
                                </div>
                            </ItemCard>
                        ))}
                        <AddBtn onClick={() => addArrayItem('projects', { name: '', github: '', liveLink: '', techStack: '', duration: '', description: '' })} label="Add Project" color="orange" />
                    </Section>

                    {/* 6. Certifications */}
                    <Section icon={Award} title="Certifications" number="6" color="text-yellow-500" accent="bg-yellow-500">
                        <div className="space-y-3 mb-3">
                            {resumeData.certifications.map((cert, i) => (
                                <div key={i} className="flex gap-2 items-start group">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <input value={cert.name} onChange={e => handleArrayChange('certifications', i, 'name', e.target.value)} className={inputCls} placeholder="Certification Name" />
                                        <input value={cert.link} onChange={e => handleArrayChange('certifications', i, 'link', e.target.value)} className={inputCls} placeholder="Credential URL (Optional)" />
                                    </div>
                                    <button onClick={() => removeArrayItem('certifications', i)} className="shrink-0 p-2.5 rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-300 transition-all bg-white shadow-sm border border-slate-100 hover:border-red-100 flex items-center justify-center h-[42px] w-[42px]" title="Remove"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <AddBtn onClick={() => addArrayItem('certifications', { name: '', link: '' })} label="Add Certification" color="yellow" />
                    </Section>

                    {/* 7. Skills */}
                    <Section icon={Code} title="Technical Skills" number="7" color="text-pink-500" accent="bg-pink-500">
                        <div className="space-y-3 mb-3">
                            {resumeData.skills.map((skill, i) => (
                                <div key={i} className="flex gap-2 items-center group">
                                    <div className="flex-1 grid grid-cols-[110px_1fr] gap-2">
                                        <input value={skill.category} onChange={e => handleArrayChange('skills', i, 'category', e.target.value)} className={`${inputCls} font-semibold !px-2`} placeholder="Category" />
                                        <input value={skill.items} onChange={e => handleArrayChange('skills', i, 'items', e.target.value)} className={inputCls} placeholder="Python, React, Node.js..." />
                                    </div>
                                    <button onClick={() => removeArrayItem('skills', i)} className="shrink-0 p-2.5 rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-300 transition-all bg-white shadow-sm border border-slate-100 hover:border-red-100 flex items-center justify-center h-[42px] w-[42px]" title="Remove"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <AddBtn onClick={() => addArrayItem('skills', { category: '', items: '' })} label="Add Skill Category" color="pink" />
                    </Section>
                </div>
            </div>

            {/* ═══ RIGHT: Preview Panel ═══ */}
            <div className={`w-full xl:w-[56%] flex flex-col bg-slate-100 md:rounded-3xl overflow-hidden max-h-full print:w-full print:bg-white print:block ${mobileTab === 'preview' ? 'flex' : 'hidden xl:flex'}`}>

                {/* Toolbar */}
                <div className="flex items-center justify-between bg-slate-800 px-3 md:px-5 py-2.5 md:py-3 print:hidden shrink-0 gap-2 md:gap-3">
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-white text-sm font-semibold">Live Preview</span>
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Live" />
                    </div>
                    <span className="sm:hidden w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                    <div className="flex items-center gap-1 bg-slate-700 rounded-xl px-2 py-1">
                        <button onClick={() => setZoom(z => Math.max(30, z - 10))} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"><ZoomOut className="w-3.5 h-3.5" /></button>
                        <span className="text-xs text-slate-300 font-mono w-8 text-center">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.min(120, z + 10))} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"><ZoomIn className="w-3.5 h-3.5" /></button>
                    </div>
                    <button onClick={handleDownload} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-900/40 shrink-0">
                        <Download className="w-4 h-4" />
                        <span className="hidden md:inline">Download PDF</span>
                    </button>
                </div>

                {/* Preview area */}
                <div className="flex-1 overflow-auto w-full bg-slate-100 print:bg-white flex justify-center p-3 md:p-6 print:p-0">
                    <div id="preview-zoom-container" className="transition-transform duration-200" style={{ ...zoomStyle, width: '794px', minHeight: '1123px' }}>
                        {/* ── THE ACTUAL RESUME PAGE ── */}
                        <div
                            id="resume-print"
                            ref={printRef}
                            style={{
                                background: '#fff',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)',
                                minHeight: '1123px',
                                width: '794px',
                                padding: currentTpl.pagePadding,
                                boxSizing: 'border-box',
                            }}
                        >
                            <ResumeContent data={resumeData} templateId={selectedTemplate} fontSizeOffset={fontSizeOffset} fontFamily={fontFamily} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MOBILE: Sticky bottom tab bar ── */}
            <div className="xl:hidden fixed bottom-0 left-0 right-0 z-[100] print:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
                <button onClick={() => handleMobileTabChange('edit')} className={`relative flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${mobileTab === 'edit' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <FileText className="w-5 h-5" /><span className="text-[11px] font-semibold">Edit</span>
                    {mobileTab === 'edit' && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-600 rounded-full" />}
                </button>
                <button onClick={handleDownload} className="mx-4 -mt-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/40 active:scale-95 transition-transform shrink-0" title="Download PDF">
                    <Download className="w-6 h-6 text-white" />
                </button>
                <button onClick={() => handleMobileTabChange('preview')} className={`relative flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${mobileTab === 'preview' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <Eye className="w-5 h-5" /><span className="text-[11px] font-semibold">Preview</span>
                    {mobileTab === 'preview' && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-600 rounded-full" />}
                </button>
            </div>
        </div>
    );
};

export default AiResumeBuilder;
