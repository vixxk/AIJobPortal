import { useState, useRef } from 'react';
import { FileText, Sparkles, Download, Loader2, Briefcase, Code, User, BookOpen, Layers, Award } from 'lucide-react';
import axios from 'axios';

const AiResumeBuilder = () => {
    const [loading, setLoading] = useState(false);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingExp, setLoadingExp] = useState(null); // stores index of currently loading experience
    const [resumeData, setResumeData] = useState({
        personal: { name: '', email: '', phone: '', linkedin: '', github: '', leetcode: '', gfg: '', location: '' },
        summary: '',
        education: [{ institution: '', degree: '', duration: '', location: '', cgpa: '' }],
        experience: [{ title: '', company: '', techStack: '', duration: '', location: '', description: '' }],
        projects: [{ name: '', github: '', liveLink: '', techStack: '', duration: '', description: '' }],
        certifications: [{ name: '', link: '' }],
        skills: [{ category: '', items: '' }]
    });

    const printRef = useRef(null);

    // --- State Handlers ---
    const handlePersonalChange = (e) => {
        setResumeData({
            ...resumeData,
            personal: { ...resumeData.personal, [e.target.name]: e.target.value }
        });
    };

    const handleArrayChange = (group, index, field, value) => {
        const newArr = [...resumeData[group]];
        newArr[index][field] = value;
        setResumeData({ ...resumeData, [group]: newArr });
    };

    const removeArrayItem = (group, index) => {
        const newArr = resumeData[group].filter((_, i) => i !== index);
        setResumeData({ ...resumeData, [group]: newArr });
    };

    const addArrayItem = (group, template) => {
        setResumeData({
            ...resumeData,
            [group]: [...resumeData[group], template]
        });
    };

    // --- AI Optimization ---
    const handleAiOptimize = async () => {
        const hasExp = resumeData.experience.some(e => e.description.trim().length > 10);
        const hasProj = resumeData.projects.some(p => p.description.trim().length > 10);

        if (!hasExp && !hasProj) {
            alert("Please write some rough experience or project notes first before using AI formatting.");
            return;
        }

        setLoading(true);
        try {
            const payload = {};
            if (hasExp) payload.experiences = resumeData.experience;
            if (hasProj) payload.projects = resumeData.projects;

            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/resume/optimize`, payload);

            if (res.data.success) {
                const updates = {};
                if (res.data.optimizedExperiences) updates.experience = res.data.optimizedExperiences;
                if (res.data.optimizedProjects) updates.projects = res.data.optimizedProjects;
                setResumeData(prev => ({ ...prev, ...updates }));
            }
        } catch (error) {
            console.error("AI Error", error);
            alert("Failed to connect to AI. Using manual input.");
        } finally {
            setLoading(false);
        }
    };

    const handleOptimizeSummary = async () => {
        if (!resumeData.summary || resumeData.summary.trim().length < 10) {
            alert("Please write a rough career objective first.");
            return;
        }
        setLoadingSummary(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/resume/optimize-summary`, { text: resumeData.summary });
            if (res.data.success) {
                setResumeData(prev => ({ ...prev, summary: res.data.optimizedText }));
            }
        } catch (error) {
            console.error("AI Error", error);
            alert("Failed to connect to AI for summary optimization.");
        } finally {
            setLoadingSummary(true);
            setLoadingSummary(false); // Quick fix to clear loading state
        }
    };

    const handleOptimizeExperience = async (index, type = 'experience') => {
        const item = resumeData[type][index];
        if (!item.description || item.description.trim().length < 10) {
            alert(`Please write a rough ${type} description first.`);
            return;
        }
        setLoadingExp(index);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/resume/optimize-experience`, { text: item.description, type });
            if (res.data.success) {
                handleArrayChange(type, index, 'description', res.data.optimizedText);
            }
        } catch (error) {
            console.error("AI Error", error);
            alert(`Failed to connect to AI for ${type} optimization.`);
        } finally {
            setLoadingExp(null);
        }
    };

    const handleDownload = () => {
        const originalTitle = document.title;
        document.title = "Vivek_Anand_Resume"; // Sets default filename for PDF save
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 xl:h-[calc(100vh-100px)] flex flex-col xl:flex-row gap-6 pb-6 print:h-auto print:block print:pb-0 print:w-full">
            <style>
                {`
                    @media print {
                        @page { margin: 0; }
                    }
                `}
            </style>
            {/* Scrollable Form Section */}
            <div className="w-full xl:w-[45%] bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 overflow-y-auto scrollbar-hide print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex-1 flex flex-col items-center text-center">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2 mb-1">
                            Resume Data <span className="text-slate-400 font-medium text-[15px] sm:text-lg hidden xs:inline min-[380px]:inline">(ATS Strict)</span>
                        </h2>
                        <p className="text-sm text-slate-500">Fill details to auto-generate PDF</p>
                    </div>
                    <button
                        onClick={() => window.open('/RESUME_NEW.pdf', '_blank')}
                        className="shrink-0 w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all border border-indigo-100 shadow-sm flex justify-center items-center gap-2 group"
                        title="View ATS Template Format"
                    >
                        <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                        Preview PDF Template
                    </button>
                </div>

                {/* 1. Personal details */}
                <section className="mb-8">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 border-b pb-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">1</span>
                        <User className="w-4 h-4 text-blue-600" /> Header & Contact
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Full Name</label>
                            <input name="name" value={resumeData.personal.name} onChange={handlePersonalChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. Alex Johnson" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Email</label>
                            <input name="email" value={resumeData.personal.email} onChange={handlePersonalChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="alex@email.com" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Phone</label>
                            <input name="phone" value={resumeData.personal.phone} onChange={handlePersonalChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="+1 234 567" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">LinkedIn</label>
                            <input name="linkedin" value={resumeData.personal.linkedin} onChange={handlePersonalChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="URL..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">GitHub</label>
                            <input name="github" value={resumeData.personal.github} onChange={handlePersonalChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="URL..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">GFG Practice</label>
                            <input name="gfg" value={resumeData.personal.gfg} onChange={handlePersonalChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="URL..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">LeetCode</label>
                            <input name="leetcode" value={resumeData.personal.leetcode} onChange={handlePersonalChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="URL..." />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Location</label>
                            <input name="location" value={resumeData.personal.location} onChange={handlePersonalChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="City, State" />
                        </div>
                    </div>
                </section>

                {/* 2. Objective */}
                <section className="mb-8">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">2</span>
                            Career Objective
                        </h3>
                    </div>
                    <div className="relative">
                        <textarea
                            value={resumeData.summary}
                            onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pb-10 text-sm h-24 resize-none"
                            placeholder="Brief summary of your career goals..."
                        />
                        <button
                            onClick={handleOptimizeSummary}
                            disabled={loadingSummary}
                            className="absolute bottom-2 right-2 text-xs flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                        >
                            {loadingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            AI Enhance
                        </button>
                    </div>
                </section>

                {/* 3. Education */}
                <section className="mb-8">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 border-b pb-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">3</span>
                        <BookOpen className="w-4 h-4 text-emerald-600" /> Education
                    </h3>
                    {resumeData.education.map((edu, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="Institution" value={edu.institution} onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)} className="col-span-2 w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                                <input placeholder="Degree" value={edu.degree} onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                                <input placeholder="Duration (e.g. 2023 - 2027)" value={edu.duration} onChange={(e) => handleArrayChange('education', index, 'duration', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                                <input placeholder="Location" value={edu.location} onChange={(e) => handleArrayChange('education', index, 'location', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                                <input placeholder="CGPA / Grade" value={edu.cgpa} onChange={(e) => handleArrayChange('education', index, 'cgpa', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                            </div>
                        </div>
                    ))}
                    <button onClick={() => addArrayItem('education', { institution: '', degree: '', duration: '', location: '', cgpa: '' })} className="text-sm text-emerald-600 font-semibold hover:underline">+ Add Education</button>
                </section>

                {/* 4. Experience */}
                <section className="mb-8">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs">4</span>
                            <Briefcase className="w-4 h-4 text-purple-600" /> Experience
                        </h3>
                    </div>
                    {resumeData.experience.map((exp, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="Job Title" value={exp.title} onChange={(e) => handleArrayChange('experience', index, 'title', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                                <input placeholder="Company" value={exp.company} onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                                <input placeholder="Tech Stack" value={exp.techStack} onChange={(e) => handleArrayChange('experience', index, 'techStack', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                                <input placeholder="Duration" value={exp.duration} onChange={(e) => handleArrayChange('experience', index, 'duration', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                                <input placeholder="Location" value={exp.location} onChange={(e) => handleArrayChange('experience', index, 'location', e.target.value)} className="col-span-2 w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                            </div>
                            <div className="relative">
                                <textarea
                                    placeholder="What did you do? (Be messy! AI will fix the grammar and make it ATS friendly later)"
                                    value={exp.description}
                                    onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 pb-10 text-sm h-28 resize-none"
                                />
                                <button
                                    onClick={() => handleOptimizeExperience(index, 'experience')}
                                    disabled={loadingExp === index}
                                    className="absolute bottom-2 right-2 text-xs flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-md font-semibold hover:bg-purple-100 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {loadingExp === index ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    AI Rewrite
                                </button>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => addArrayItem('experience', { title: '', company: '', techStack: '', duration: '', location: '', description: '' })} className="text-sm text-purple-600 font-semibold hover:underline">+ Add Experience</button>
                </section>

                {/* 5. Projects */}
                <section className="mb-8">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs">5</span>
                            <Layers className="w-4 h-4 text-orange-600" /> Projects
                        </h3>
                    </div>
                    {resumeData.projects.map((proj, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="Project Name" value={proj.name} onChange={(e) => handleArrayChange('projects', index, 'name', e.target.value)} className="col-span-2 w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                                <input placeholder="GitHub URL" value={proj.github} onChange={(e) => handleArrayChange('projects', index, 'github', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                                <input placeholder="Live URL" value={proj.liveLink} onChange={(e) => handleArrayChange('projects', index, 'liveLink', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                                <input placeholder="Tools / Tech" value={proj.techStack} onChange={(e) => handleArrayChange('projects', index, 'techStack', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                                <input placeholder="Date" value={proj.duration} onChange={(e) => handleArrayChange('projects', index, 'duration', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm" />
                            </div>
                            <div className="relative">
                                <textarea
                                    placeholder="Bullet points for project..."
                                    value={proj.description}
                                    onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 pb-10 text-sm h-28 resize-none"
                                />
                                <button
                                    onClick={() => handleOptimizeExperience(index, 'projects')}
                                    disabled={loadingExp === index}
                                    className="absolute bottom-2 right-2 text-xs flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-md font-semibold hover:bg-orange-100 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {loadingExp === index ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    AI Rewrite
                                </button>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => addArrayItem('projects', { name: '', github: '', liveLink: '', techStack: '', duration: '', description: '' })} className="text-sm text-orange-600 font-semibold hover:underline">+ Add Project</button>


                </section>

                {/* 6. Certifications */}
                <section className="mb-8">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 border-b pb-2">
                        <span className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-xs">6</span>
                        <Award className="w-4 h-4 text-yellow-600" /> Certifications
                    </h3>
                    <div className="space-y-4 mb-4">
                        {resumeData.certifications.map((cert, index) => (
                            <div key={index} className="flex gap-3 items-start relative">
                                <div className="space-y-1 w-full relative">
                                    <input
                                        value={cert.name}
                                        onChange={(e) => handleArrayChange('certifications', index, 'name', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-10 focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Certification Name (e.g. AWS Certified)"
                                    />
                                    <button
                                        onClick={() => removeArrayItem('certifications', index)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 text-lg leading-none pb-0.5"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => addArrayItem('certifications', { name: '', link: '' })} className="text-sm text-yellow-600 font-semibold hover:underline">+ Add Certification</button>
                </section>

                {/* 7. Skills */}
                <section className="mb-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 border-b pb-2">
                        <span className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xs">7</span>
                        <Code className="w-4 h-4 text-pink-600" /> Skills
                    </h3>
                    <div className="space-y-4 mb-4">
                        {resumeData.skills.map((skill, index) => (
                            <div key={index} className="flex gap-3 items-start">
                                <div className="space-y-1 w-1/3 shrink-0">
                                    <input
                                        value={skill.category}
                                        onChange={(e) => handleArrayChange('skills', index, 'category', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                                        placeholder="Category"
                                    />
                                </div>
                                <div className="space-y-1 flex-1 relative">
                                    <input
                                        value={skill.items}
                                        onChange={(e) => handleArrayChange('skills', index, 'items', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Skill 1, Skill 2, Skill 3"
                                    />
                                    <button
                                        onClick={() => removeArrayItem('skills', index)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 text-lg leading-none pb-0.5"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => addArrayItem('skills', { category: '', items: '' })} className="text-sm text-pink-600 font-semibold hover:underline">+ Add Skill Category</button>
                </section>

            </div>

            {/* Live Preview & PDF Output Section */}
            <div className="w-full xl:w-[55%] flex flex-col bg-slate-200 md:rounded-3xl overflow-hidden print:w-full print:bg-white print:block">
                <div className="flex items-center justify-between bg-slate-800 p-4 print:hidden shrink-0">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-300" /> Print Preview
                    </h3>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                </div>

                {/* Live ATS Document Wrapper */}
                <div className="flex-1 overflow-x-auto overflow-y-auto w-full bg-slate-200 print:bg-white flex justify-center p-4 md:p-8 print:p-0">

                    {/* Scaling container for mobile */}
                    <div className="origin-top transform scale-[0.4] sm:scale-50 md:scale-75 xl:scale-100 transition-transform h-[450px] sm:h-[550px] md:h-[800px] xl:h-auto print:scale-100 print:h-auto mx-auto print:mx-0">

                        {/* Strict ATS Resume Template (Exact layout requirements from prompt) */}
                        <div
                            ref={printRef}
                            className="bg-white shadow-2xl print:shadow-none min-h-[1056px] w-[794px] pt-[12mm] pb-[25.4mm] px-[25.4mm] text-black"
                            style={{ fontFamily: "'Times New Roman', serif", lineHeight: "1.15", fontSize: "10.5px" }}
                        >
                            {/* Header */}
                            <header className="text-center mb-3">
                                <h1 className="font-bold uppercase mb-0.5" style={{ fontSize: "18px" }}>{resumeData.personal.name || 'YOUR NAME'}</h1>
                                <div className="flex flex-col items-center justify-center" style={{ fontSize: "10.5px", lineHeight: "1.15" }}>
                                    <div className="mb-0.5">
                                        {resumeData.personal.phone && <span>{resumeData.personal.phone}</span>}
                                        {resumeData.personal.email && <><span className="mx-1">|</span><span>{resumeData.personal.email}</span></>}
                                    </div>
                                    <div className="flex items-center justify-center gap-3 mb-0.5" style={{ lineHeight: "1.15" }}>
                                        {resumeData.personal.linkedin && <a href={resumeData.personal.linkedin} className="text-blue-600 underline whitespace-nowrap" target="_blank" rel="noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5 mr-[3px]"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>LinkedIn</a>}
                                        {resumeData.personal.github && <a href={resumeData.personal.github} className="text-blue-600 underline whitespace-nowrap" target="_blank" rel="noreferrer"><img src="/icons/github.svg" alt="" className="w-[11px] h-[11px] mr-[3px] inline -mt-0.5" />GitHub</a>}
                                        {resumeData.personal.gfg && <a href={resumeData.personal.gfg} className="text-blue-600 underline whitespace-nowrap" target="_blank" rel="noreferrer"><img src="/icons/geeksforgeeks.svg" alt="" className="w-[11px] h-[11px] mr-[3px] inline -mt-0.5" />GFG Practice</a>}
                                        {resumeData.personal.leetcode && <a href={resumeData.personal.leetcode} className="text-blue-600 underline whitespace-nowrap" target="_blank" rel="noreferrer"><img src="/icons/leetcode.svg" alt="" className="w-[11px] h-[11px] mr-[3px] inline -mt-0.5" />LeetCode</a>}
                                    </div>
                                    {resumeData.personal.location && (
                                        <div>{resumeData.personal.location}</div>
                                    )}
                                </div>
                            </header>

                            {/* Objective */}
                            {resumeData.summary && (
                                <div className="mb-2.5">
                                    <h2 className="font-bold uppercase border-b border-black mb-1 pb-[1px]" style={{ fontSize: "12px" }}>Career Objective</h2>
                                    <p className="text-justify" style={{ fontSize: "10.5px", lineHeight: "1.15" }}>{resumeData.summary}</p>
                                </div>
                            )}

                            {/* Education */}
                            {resumeData.education.some(e => e.institution || e.degree) && (
                                <div className="mb-2.5">
                                    <h2 className="font-bold uppercase border-b border-black mb-1 pb-[1px]" style={{ fontSize: "12px" }}>Education</h2>
                                    {resumeData.education.filter(e => e.institution || e.degree).map((edu, i) => (
                                        <div key={i} className="mb-1.5" style={{ fontSize: "10.5px" }}>
                                            <div className="flex justify-between items-start font-bold">
                                                <div>
                                                    <span className="mr-1.5">•</span>{edu.institution}
                                                </div>
                                                <div className="text-right font-normal">
                                                    {edu.duration}
                                                </div>
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
                                    <h2 className="font-bold uppercase border-b border-black mb-1 pb-[1px]" style={{ fontSize: "12px" }}>Experience</h2>
                                    {resumeData.experience.filter(e => e.company || e.title).map((exp, i) => (
                                        <div key={i} className="mb-2" style={{ fontSize: "10.5px" }}>
                                            <div className="flex justify-between items-center font-bold">
                                                <div><span className="mr-1.5">•</span>{exp.company}</div>
                                                <div className="font-normal">{exp.duration}</div>
                                            </div>
                                            <div className="flex justify-between items-center italic pl-3">
                                                <div>{exp.title}{exp.techStack ? ` | ${exp.techStack}` : ''}</div>
                                                <div className="not-italic font-normal">{exp.location}</div>
                                            </div>
                                            <ul className="pl-3 mt-0.5 list-none" style={{ lineHeight: "1.1" }}>
                                                {exp.description.split('\n').filter(line => line.trim().length > 0).map((line, j) => (
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
                                    <h2 className="font-bold uppercase border-b border-black mb-1 pb-[1px]" style={{ fontSize: "12px" }}>Projects</h2>
                                    {resumeData.projects.filter(p => p.name).map((proj, i) => (
                                        <div key={i} className="mb-2" style={{ fontSize: "10.5px" }}>
                                            <div className="flex justify-between items-center font-bold">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span><span className="mr-1.5">•</span>{proj.name}</span>
                                                    {Math.max(proj.github?.length || 0, proj.liveLink?.length || 0) > 0 && <span>|</span>}
                                                    {proj.github && (
                                                        <a href={proj.github} className="text-blue-600 font-normal hover:scale-110 transition-transform" target="_blank" rel="noreferrer" title="GitHub">
                                                            <img src="/icons/github.svg" alt="GitHub" className="w-[12px] h-[12px] inline -mt-0.5" />
                                                        </a>
                                                    )}
                                                    {proj.liveLink && (
                                                        <a href={proj.liveLink} className="text-blue-600 font-normal hover:scale-110 transition-transform" target="_blank" rel="noreferrer" title="Live Link">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5">
                                                                <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                            </svg>
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="font-normal">{proj.duration}</div>
                                            </div>
                                            {proj.techStack && (
                                                <div className="italic pl-3 mb-0.5">
                                                    Tools: {proj.techStack}
                                                </div>
                                            )}
                                            <ul className="pl-3 mt-0.5 list-none" style={{ lineHeight: "1.1" }}>
                                                {proj.description.split('\n').filter(line => line.trim().length > 0).map((line, j) => (
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
                                    <h2 className="font-bold uppercase border-b border-black mb-1 pb-[1px]" style={{ fontSize: "12px" }}>Certifications</h2>
                                    <ul className="pl-3 m-0 list-none" style={{ fontSize: "10.5px", lineHeight: "1.1" }}>
                                        {resumeData.certifications.filter(c => c.name).map((cert, index) => (
                                            <li key={index} className="text-justify mb-[1px] font-bold flex gap-1.5 items-start">
                                                <span className="shrink-0">•</span>
                                                <span>
                                                    {cert.link ? (
                                                        <a href={cert.link} className="text-blue-600 font-normal underline" target="_blank" rel="noreferrer">{cert.name}</a>
                                                    ) : (
                                                        cert.name
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Skills */}
                            {resumeData.skills.some(s => s.category || s.items) && (
                                <div className="mb-0">
                                    <h2 className="font-bold uppercase border-b border-black mb-1 pb-[1px]" style={{ fontSize: "12px" }}>Skills</h2>
                                    <div className="space-y-[1px] pl-3" style={{ fontSize: "10.5px", lineHeight: "1.1" }}>
                                        {resumeData.skills.filter(s => s.category || s.items).map((skill, index) => (
                                            <div key={index}>
                                                <span className="font-bold mr-1.5">•</span><span className="font-bold">{skill.category}{skill.category ? ':' : ''}</span> {skill.items}
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

export default AiResumeBuilder;
