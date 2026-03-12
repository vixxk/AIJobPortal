import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import {
    ArrowLeft, Edit3, Save, X, Plus, Trash2, BookOpen, Users, Settings,
    Clock, Tag, Globe, BarChart2, Video, Radio, ChevronDown, ChevronRight,
    GripVertical, Calendar, Eye, EyeOff, Star, Award, Target, CheckCircle,
    UploadCloud, AlertCircle, Check, Play
} from 'lucide-react';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const CATEGORY_OPTIONS = ['Skill', 'AI', 'Technology', 'Business', 'Design', 'Marketing', 'Data Science', 'Web Development', 'Mobile Dev', 'Other'];

// ─── YouTube URL Parser (defined early so all components can use it) ──────────
const extractYouTubeId = (url) => {
    if (!url) return '';
    if (/^[\w-]{11}$/.test(url.trim())) return url.trim(); // bare 11-char ID
    try {
        const u = new URL(url);
        if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
        if (u.pathname.startsWith('/live/')) return u.pathname.split('/live/')[1].split('?')[0];
        if (u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1].split('?')[0];
        return u.searchParams.get('v') || '';
    } catch { return ''; }
};

// ─── Inline Editable Field ───────────────────────────────────────────────────
const EditableField = ({ label, value, onSave, multiline = false, type = 'text' }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    useEffect(() => setDraft(value), [value]);

    const commit = () => {
        onSave(draft);
        setEditing(false);
    };

    if (editing) {
        return (
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                {multiline ? (
                    <textarea
                        autoFocus
                        rows={4}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-indigo-400 rounded-2xl text-sm font-medium text-slate-700 outline-none resize-none"
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                    />
                ) : (
                    <input
                        autoFocus
                        type={type}
                        className="w-full h-12 px-5 bg-slate-50 border-2 border-indigo-400 rounded-2xl text-sm font-medium text-slate-700 outline-none"
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                    />
                )}
                <div className="flex gap-2">
                    <button onClick={commit} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button onClick={() => setEditing(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            <div
                className="flex items-start justify-between gap-3 p-4 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
                onClick={() => setEditing(true)}
            >
                <p className="text-sm font-semibold text-slate-700 flex-1">{value || <span className="text-slate-300 italic">Click to add…</span>}</p>
                <Edit3 className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5" />
            </div>
        </div>
    );
};

// ─── Tag Input ───────────────────────────────────────────────────────────────
const TagInput = ({ label, values, onSave }) => {
    const [input, setInput] = useState('');
    const add = () => {
        const v = input.trim();
        if (v && !values.includes(v)) { onSave([...values, v]); }
        setInput('');
    };
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {values.map((v, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black">
                        {v}
                        <button onClick={() => onSave(values.filter((_, j) => j !== i))} className="text-indigo-300 hover:text-indigo-700">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                    placeholder={`Add ${label.toLowerCase()}…`}
                    className="flex-1 h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-400 text-slate-700 placeholder:text-slate-300"
                />
                <button onClick={add} className="px-4 h-10 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700">
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

// ─── Toast Notification ───────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-black animate-in slide-in-from-bottom-4 duration-300 ${type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>
        {type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
        {msg}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CourseManagement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [canEdit, setCanEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [toast, setToast] = useState(null);

    // Chapter / Lecture state
    const [expandedChapters, setExpandedChapters] = useState({});
    const [chapterForm, setChapterForm] = useState({ show: false, title: '', description: '', order: 0 });
    const [editChapter, setEditChapter] = useState(null);
    const [editLecture, setEditLecture] = useState(null);
    const [previewLecture, setPreviewLecture] = useState(null);

    // Live form state
    const DEFAULT_LECTURE_FORM = { show: false, chapterId: null, title: '', description: '', type: 'RECORDED', duration: 0, liveDuration: 60, scheduledAt: '', isPreview: false, order: 0, youtubeUrl: '', videoIdentifier: '', notesUrl: '' };
    const [lectureForm, setLectureForm] = useState(DEFAULT_LECTURE_FORM);

    // Settings
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [savingImage, setSavingImage] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchCourse = useCallback(async () => {
        try {
            const res = await axios.get(`/courses/${id}`);
            setCourse(res.data.data.course);
            setCanEdit(res.data.data.canEdit);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchCourse(); }, [fetchCourse]);

    // ── Field Saver ─────────────────────────────────────────────────────────────
    const saveField = async (field, value) => {
        try {
            const res = await axios.patch(`/courses/${id}`, { [field]: value });
            setCourse(res.data.data.course);
            showToast('Course updated');
        } catch (err) {
            showToast(err.response?.data?.message || 'Update failed', 'error');
        }
    };

    // ── Chapter Actions ─────────────────────────────────────────────────────────
    const handleAddChapter = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`/courses/${id}/chapters`, {
                title: chapterForm.title,
                description: chapterForm.description,
                order: chapterForm.order
            });
            setCourse(res.data.data.course);
            setChapterForm({ show: false, title: '', description: '', order: 0 });
            showToast('Chapter added');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleUpdateChapter = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.patch(`/courses/${id}/chapters/${editChapter._id}`, {
                title: editChapter.title,
                description: editChapter.description,
                order: editChapter.order
            });
            setCourse(res.data.data.course);
            setEditChapter(null);
            showToast('Chapter updated');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleDeleteChapter = async (chapterId) => {
        if (!confirm('Delete this chapter and all its lectures?')) return;
        try {
            const res = await axios.delete(`/courses/${id}/chapters/${chapterId}`);
            setCourse(res.data.data.course);
            showToast('Chapter deleted');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed', 'error');
        }
    };

    // ── Lecture Actions ─────────────────────────────────────────────────────────
    const handleAddLecture = async (e) => {
        e.preventDefault();
        try {
            // Re-derive videoIdentifier from youtubeUrl as a safety fallback
            // in case React state batching left videoIdentifier stale/empty
            const vidId = lectureForm.videoIdentifier || extractYouTubeId(lectureForm.youtubeUrl);
            const payload = {
                title: lectureForm.title,
                description: lectureForm.description,
                videoIdentifier: vidId,
                type: lectureForm.type,
                duration: Number(lectureForm.duration),
                liveDuration: lectureForm.type === 'LIVE' ? Number(lectureForm.liveDuration) : 0,
                order: Number(lectureForm.order),
                isPreview: lectureForm.isPreview,
                ...(lectureForm.chapterId && { chapter: lectureForm.chapterId }),
                ...(lectureForm.scheduledAt && { scheduledAt: lectureForm.scheduledAt }),
                notesUrl: lectureForm.notesUrl,
                status: lectureForm.type === 'LIVE' ? 'LIVE' : 'READY'
            };
            await axios.post(`/courses/${id}/lectures`, payload);
            setLectureForm(DEFAULT_LECTURE_FORM);
            fetchCourse();
            showToast('Lecture added');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleUpdateLecture = async (e) => {
        e.preventDefault();
        try {
            // Re-derive videoIdentifier as a safety fallback
            const vidId = editLecture.videoIdentifier || extractYouTubeId(editLecture.youtubeUrl || '');
            await axios.patch(`/courses/lectures/${editLecture._id}`, {
                title: editLecture.title,
                description: editLecture.description,
                videoIdentifier: vidId,
                type: editLecture.type,
                duration: Number(editLecture.duration),
                liveDuration: editLecture.type === 'LIVE' ? Number(editLecture.liveDuration) : 0,
                order: Number(editLecture.order),
                isPreview: editLecture.isPreview,
                notesUrl: editLecture.notesUrl,
                ...(editLecture.scheduledAt && { scheduledAt: editLecture.scheduledAt }),
            });
            setEditLecture(null);
            fetchCourse();
            showToast('Lecture updated');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleDeleteLecture = async (lectureId) => {
        if (!confirm('Delete this lecture?')) return;
        try {
            await axios.delete(`/courses/lectures/${lectureId}`);
            fetchCourse();
            showToast('Lecture deleted');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed', 'error');
        }
    };

    // ── Remove Student ──────────────────────────────────────────────────────────
    const handleRemoveStudent = async (studentId) => {
        if (!confirm('Remove this student from the course?')) return;
        try {
            const res = await axios.post(`/courses/${id}/unenroll`, { studentId });
            setCourse(prev => ({ ...prev, enrolledStudents: res.data.data.course.enrolledStudents }));
            showToast('Student removed');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed', 'error');
        }
    };

    // ── Cover Image Upload ──────────────────────────────────────────────────────
    const handleCoverUpload = async () => {
        if (!coverFile) return;
        setSavingImage(true);
        try {
            const fd = new FormData();
            fd.append('image', coverFile);
            const res = await axios.patch(`/courses/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setCourse(res.data.data.course);
            setCoverFile(null);
            setCoverPreview(null);
            showToast('Cover image updated');
        } catch (err) {
            showToast(err.response?.data?.message || 'Upload failed', 'error');
        } finally {
            setSavingImage(false);
        }
    };

    // ── Toggle publish ──────────────────────────────────────────────────────────
    const handleTogglePublish = async () => {
        await saveField('isPublished', !course.isPublished);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Course</p>
            </div>
        </div>
    );

    if (!course) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <p className="text-slate-400 font-bold">Course not found.</p>
        </div>
    );

    const lecturesForChapter = (chapterId) =>
        (course.lectures || []).filter(l => l.chapter?.toString() === chapterId?.toString());
    const uncategorizedLectures = (course.lectures || []).filter(l => !l.chapter);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'chapters', label: 'Chapters & Lectures', icon: Video },
        { id: 'students', label: `Students (${course.enrolledStudents?.length || 0})`, icon: Users },
        ...(canEdit ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {toast && <Toast msg={toast.msg} type={toast.type} />}

            {/* Hero Header */}
            <div className="relative h-72 lg:h-80 overflow-hidden">
                <img
                    src={getImageUrl(course.coverImage)}
                    className="w-full h-full object-cover"
                    alt={course.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                <div className="absolute inset-0 p-6 lg:p-10 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl text-xs font-black tracking-wide hover:bg-white/20 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        {canEdit && (
                            <button
                                onClick={handleTogglePublish}
                                className={`flex items-center gap-2 px-4 py-2.5 backdrop-blur-md border rounded-2xl text-xs font-black tracking-wide transition-all ${course.isPublished ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                            >
                                {course.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                {course.isPublished ? 'Published' : 'Draft'}
                            </button>
                        )}
                    </div>

                    <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur-md rounded-full text-[10px] font-black text-white tracking-widest uppercase">
                                {course.category}
                            </span>
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white/80 tracking-widest uppercase">
                                {course.level}
                            </span>
                            {course.language && (
                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white/80 tracking-widest uppercase">
                                    {course.language}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl lg:text-4xl font-black text-white tracking-tight mb-2 max-w-3xl">
                            {course.title}
                        </h1>
                        <div className="flex items-center gap-4 text-white/60">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-500 overflow-hidden">
                                    {course.teacher?.avatar
                                        ? <img src={getImageUrl(course.teacher.avatar)} className="w-full h-full object-cover" />
                                        : <span className="w-full h-full flex items-center justify-center text-[10px] font-black text-white">{course.teacher?.name?.[0]}</span>
                                    }
                                </div>
                                <span className="text-xs font-bold">{course.teacher?.name}</span>
                            </div>
                            <span className="text-white/30">•</span>
                            <span className="text-xs font-bold flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" /> {course.enrolledStudents?.length || 0} enrolled
                            </span>
                            <span className="text-white/30">•</span>
                            <span className="text-xs font-bold flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5" /> {course.lectures?.length || 0} lectures
                            </span>
                            {course.duration > 0 && (
                                <>
                                    <span className="text-white/30">•</span>
                                    <span className="text-xs font-bold flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> {course.duration}h total
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 lg:px-10">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-5 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 lg:px-10 py-8 lg:py-12">

                {/* ─── OVERVIEW TAB ──────────────────────────────────────────────── */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Description */}
                            <div className="bg-white rounded-[28px] p-8 border border-slate-100">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-500" /> Course Description
                                </h3>
                                {canEdit ? (
                                    <EditableField label="Description" value={course.description} multiline onSave={v => saveField('description', v)} />
                                ) : (
                                    <p className="text-slate-600 leading-relaxed text-sm">{course.description}</p>
                                )}
                            </div>

                            {/* Objectives */}
                            <div className="bg-white rounded-[28px] p-8 border border-slate-100">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-emerald-500" /> Learning Objectives
                                </h3>
                                {canEdit ? (
                                    <TagInput label="Objectives" values={course.objectives || []} onSave={v => saveField('objectives', v)} />
                                ) : (
                                    <ul className="space-y-2">
                                        {(course.objectives || []).map((o, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                {o}
                                            </li>
                                        ))}
                                        {(!course.objectives || course.objectives.length === 0) && (
                                            <p className="text-slate-300 text-sm italic">No objectives defined yet.</p>
                                        )}
                                    </ul>
                                )}
                            </div>

                            {/* Prerequisites */}
                            <div className="bg-white rounded-[28px] p-8 border border-slate-100">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-500" /> Prerequisites
                                </h3>
                                {canEdit ? (
                                    <TagInput label="Prerequisites" values={course.prerequisites || []} onSave={v => saveField('prerequisites', v)} />
                                ) : (
                                    <ul className="space-y-2">
                                        {(course.prerequisites || []).map((p, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                                <Star className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                                {p}
                                            </li>
                                        ))}
                                        {(!course.prerequisites || course.prerequisites.length === 0) && (
                                            <p className="text-slate-300 text-sm italic">No prerequisites.</p>
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Quick Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[28px] p-8 border border-slate-100 space-y-6">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                    <BarChart2 className="w-4 h-4 text-indigo-500" /> Course Details
                                </h3>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Students', value: course.enrolledStudents?.length || 0, icon: Users, color: 'indigo' },
                                        { label: 'Lectures', value: course.lectures?.length || 0, icon: Video, color: 'violet' },
                                        { label: 'Chapters', value: course.chapters?.length || 0, icon: BookOpen, color: 'emerald' },
                                        { label: 'Duration', value: `${course.duration || 0}h`, icon: Clock, color: 'amber' },
                                    ].map(({ label, value, icon: Icon, color }) => (
                                        <div key={label} className={`bg-${color}-50 rounded-2xl p-4 flex flex-col gap-1`}>
                                            <Icon className={`w-4 h-4 text-${color}-500`} />
                                            <span className="text-xl font-black text-slate-900">{value}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Editable meta */}
                                {canEdit ? (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</label>
                                            <select
                                                value={course.level}
                                                onChange={e => saveField('level', e.target.value)}
                                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                                            >
                                                {LEVEL_OPTIONS.map(l => <option key={l}>{l}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                                            <select
                                                value={course.category}
                                                onChange={e => saveField('category', e.target.value)}
                                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                                            >
                                                {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <EditableField label="Language" value={course.language} onSave={v => saveField('language', v)} />
                                        <EditableField label="Total Duration (hours)" value={String(course.duration || 0)} type="number" onSave={v => saveField('duration', Number(v))} />
                                        <EditableField label="Price (₹)" value={String(course.price || 0)} type="number" onSave={v => saveField('price', Number(v))} />
                                    </div>
                                ) : (
                                    <div className="space-y-3 text-sm">
                                        {[
                                            { label: 'Level', value: course.level },
                                            { label: 'Language', value: course.language },
                                            { label: 'Price', value: course.price ? `₹${course.price}` : 'Free' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                                                <span className="font-bold text-slate-700">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="bg-white rounded-[28px] p-8 border border-slate-100 space-y-4">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-violet-500" /> Tags
                                </h3>
                                {canEdit ? (
                                    <TagInput label="Tags" values={course.tags || []} onSave={v => saveField('tags', v)} />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {(course.tags || []).map((t, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">#{t}</span>
                                        ))}
                                        {(!course.tags || course.tags.length === 0) && <p className="text-slate-300 text-xs italic">No tags.</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── CHAPTERS & LECTURES TAB ────────────────────────────────────── */}
                {activeTab === 'chapters' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-black text-slate-900 text-xl tracking-tight">Chapters & Lectures</h2>
                                <p className="text-slate-400 text-xs font-bold mt-1">{course.chapters?.length || 0} chapters · {course.lectures?.length || 0} lectures</p>
                            </div>
                            {canEdit && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            if (!course.chapters || course.chapters.length === 0) {
                                                showToast('Create at least one chapter before adding lectures.', 'error');
                                                return;
                                            }
                                            setLectureForm({ show: true, chapterId: null, title: '', description: '', type: 'RECORDED', duration: 0, scheduledAt: '', isPreview: false, order: 0, youtubeUrl: '' });
                                        }}
                                        className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-slate-200 transition-all"
                                    >
                                        <Video className="w-4 h-4" /> Add Lecture
                                    </button>
                                    <button
                                        onClick={() => setChapterForm({ show: true, title: '', description: '', order: course.chapters?.length || 0 })}
                                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 transition-all"
                                    >
                                        <Plus className="w-4 h-4" /> Add Chapter
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* No-chapter warning */}
                        {canEdit && (!course.chapters || course.chapters.length === 0) && (
                            <div className="flex items-center gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-amber-800">Create a chapter first</p>
                                    <p className="text-xs text-amber-600 font-medium mt-0.5">Lectures must belong to a chapter. Use "Add Chapter" to get started.</p>
                                </div>
                            </div>
                        )}

                        {/* Chapters */}
                        {(course.chapters || []).length === 0 && uncategorizedLectures.length === 0 ? (
                            <div className="bg-white rounded-[28px] p-16 border border-slate-100 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-8 h-8 text-indigo-400" />
                                </div>
                                <h3 className="font-black text-slate-900 text-lg mb-2">No Content Yet</h3>
                                <p className="text-slate-400 text-sm max-w-xs">Start building your course by adding chapters and lectures.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Chapters with their lectures */}
                                {(course.chapters || []).sort((a, b) => a.order - b.order).map((chapter, ci) => {
                                    const chLectures = lecturesForChapter(chapter._id);
                                    const isExpanded = expandedChapters[chapter._id] !== false;
                                    return (
                                        <div key={chapter._id} className="bg-white rounded-[24px] border border-slate-100 overflow-hidden">
                                            <div
                                                className="flex items-center gap-4 p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                                                onClick={() => setExpandedChapters(prev => ({ ...prev, [chapter._id]: !isExpanded }))}
                                            >
                                                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0">
                                                    {ci + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-slate-900">{chapter.title}</h4>
                                                    {chapter.description && <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{chapter.description}</p>}
                                                    <p className="text-[10px] text-slate-300 font-bold mt-1 uppercase tracking-widest">{chLectures.length} lecture{chLectures.length !== 1 ? 's' : ''}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {canEdit && (
                                                        <>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); if (!course.chapters || course.chapters.length === 0) { showToast('Create at least one chapter first.', 'error'); return; } setLectureForm({ show: true, chapterId: chapter._id, title: '', description: '', type: 'RECORDED', duration: 0, scheduledAt: '', isPreview: false, order: chLectures.length, youtubeUrl: '' }); }}
                                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                                title="Add Lecture to Chapter"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); setEditChapter({ ...chapter }); }}
                                                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); handleDeleteChapter(chapter._id); }}
                                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="border-t border-slate-100">
                                                    {chLectures.length === 0 ? (
                                                        <div className="px-6 py-4 text-slate-300 text-xs font-bold italic text-center">
                                                            No lectures in this chapter yet.
                                                        </div>
                                                    ) : (
                                                        chLectures.sort((a, b) => a.order - b.order).map((lecture, li) => (
                                                            <LectureRow key={lecture._id} lecture={lecture} index={li} canEdit={canEdit}
                                                                onEdit={() => setEditLecture({ ...lecture, scheduledAt: lecture.scheduledAt ? new Date(lecture.scheduledAt).toISOString().slice(0, 16) : '' })}
                                                                onDelete={() => handleDeleteLecture(lecture._id)}
                                                                onPreview={() => setPreviewLecture(lecture)}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Uncategorized lectures */}
                                {uncategorizedLectures.length > 0 && (
                                    <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden">
                                        <div className="p-6 bg-slate-50 border-b border-slate-100">
                                            <h4 className="font-black text-slate-500 text-xs uppercase tracking-widest">Uncategorized Lectures</h4>
                                        </div>
                                        {uncategorizedLectures.sort((a, b) => a.order - b.order).map((lecture, li) => (
                                            <LectureRow key={lecture._id} lecture={lecture} index={li} canEdit={canEdit}
                                                onEdit={() => setEditLecture({ ...lecture, scheduledAt: lecture.scheduledAt ? new Date(lecture.scheduledAt).toISOString().slice(0, 16) : '' })}
                                                onDelete={() => handleDeleteLecture(lecture._id)}
                                                onPreview={() => setPreviewLecture(lecture)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── STUDENTS TAB ───────────────────────────────────────────────── */}
                {activeTab === 'students' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-black text-slate-900 text-xl tracking-tight">Enrolled Students</h2>
                                <p className="text-slate-400 text-xs font-bold mt-1">{course.enrolledStudents?.length || 0} students enrolled</p>
                            </div>
                        </div>

                        {(!course.enrolledStudents || course.enrolledStudents.length === 0) ? (
                            <div className="bg-white rounded-[28px] p-16 border border-slate-100 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                    <Users className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="font-black text-slate-900 text-lg mb-2">No Students Yet</h3>
                                <p className="text-slate-400 text-sm">Students will appear here once they enroll.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[28px] border border-slate-100 overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                            <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Email</th>
                                            {canEdit && <th className="px-8 py-5" />}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {course.enrolledStudents.map((student, i) => (
                                            <tr key={student._id || i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-sm overflow-hidden shrink-0">
                                                            {student.avatar
                                                                ? <img src={getImageUrl(student.avatar)} className="w-full h-full object-cover" />
                                                                : (student.name?.[0] || 'S')
                                                            }
                                                        </div>
                                                        <span className="font-bold text-slate-900 text-sm">{student.name || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 hidden md:table-cell">
                                                    <span className="text-sm text-slate-400 font-medium">{student.email || '—'}</span>
                                                </td>
                                                {canEdit && (
                                                    <td className="px-8 py-5 text-right">
                                                        <button
                                                            onClick={() => handleRemoveStudent(student._id)}
                                                            className="px-4 py-2 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── SETTINGS TAB ───────────────────────────────────────────────── */}
                {activeTab === 'settings' && canEdit && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Basic Info */}
                        <div className="bg-white rounded-[28px] p-8 border border-slate-100 space-y-6">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                <Settings className="w-4 h-4 text-indigo-500" /> Course Info
                            </h3>
                            <EditableField label="Title" value={course.title} onSave={v => saveField('title', v)} />
                            <EditableField label="Description" value={course.description} multiline onSave={v => saveField('description', v)} />
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</label>
                                <select
                                    value={course.level}
                                    onChange={e => saveField('level', e.target.value)}
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                                >
                                    {LEVEL_OPTIONS.map(l => <option key={l}>{l}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                                <select
                                    value={course.category}
                                    onChange={e => saveField('category', e.target.value)}
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                                >
                                    {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <EditableField label="Language" value={course.language} onSave={v => saveField('language', v)} />
                            <EditableField label="Total Duration (hours)" value={String(course.duration || 0)} type="number" onSave={v => saveField('duration', Number(v))} />
                            <EditableField label="Price (₹)" value={String(course.price || 0)} type="number" onSave={v => saveField('price', Number(v))} />
                        </div>

                        {/* Cover Image */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[28px] p-8 border border-slate-100 space-y-6">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                    <UploadCloud className="w-4 h-4 text-indigo-500" /> Cover Image
                                </h3>
                                <div className="h-48 rounded-2xl overflow-hidden bg-slate-100 relative group">
                                    <img
                                        src={coverPreview || getImageUrl(course.coverImage)}
                                        className="w-full h-full object-cover"
                                        alt="Cover"
                                    />
                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <div className="flex flex-col items-center gap-2 text-white">
                                            <UploadCloud className="w-8 h-8" />
                                            <span className="text-xs font-black">Change Cover</span>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setCoverFile(file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => setCoverPreview(reader.result);
                                                reader.readAsDataURL(file);
                                            }
                                        }} />
                                    </label>
                                </div>
                                {coverFile && (
                                    <button
                                        onClick={handleCoverUpload}
                                        disabled={savingImage}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {savingImage ? 'Uploading…' : <><Save className="w-4 h-4" /> Save Cover Image</>}
                                    </button>
                                )}
                            </div>

                            {/* Publish Toggle */}
                            <div className="bg-white rounded-[28px] p-8 border border-slate-100 space-y-4">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-indigo-500" /> Visibility
                                </h3>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div>
                                        <p className="font-black text-slate-900 text-sm">{course.isPublished ? 'Published' : 'Draft'}</p>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">{course.isPublished ? 'Visible to students' : 'Not visible to students'}</p>
                                    </div>
                                    <button
                                        onClick={handleTogglePublish}
                                        className={`relative w-14 h-7 rounded-full transition-all ${course.isPublished ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${course.isPublished ? 'left-8' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── MODALS ─────────────────────────────────────────────────────────── */}

            {/* Add/Edit Chapter Modal */}
            {(chapterForm.show || editChapter) && (
                <Modal title={editChapter ? 'Edit Chapter' : 'New Chapter'} onClose={() => { setChapterForm({ show: false, title: '', description: '', order: 0 }); setEditChapter(null); }}>
                    <form onSubmit={editChapter ? handleUpdateChapter : handleAddChapter} className="space-y-5">
                        <FormField label="Chapter Title">
                            <input required className={inputCls} placeholder="e.g. Introduction to HTML"
                                value={editChapter ? editChapter.title : chapterForm.title}
                                onChange={e => editChapter ? setEditChapter({ ...editChapter, title: e.target.value }) : setChapterForm({ ...chapterForm, title: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Description (optional)">
                            <textarea rows={3} className={textareaCls} placeholder="What does this chapter cover?"
                                value={editChapter ? editChapter.description : chapterForm.description}
                                onChange={e => editChapter ? setEditChapter({ ...editChapter, description: e.target.value }) : setChapterForm({ ...chapterForm, description: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Order">
                            <input type="number" min={0} className={inputCls}
                                value={editChapter ? editChapter.order : chapterForm.order}
                                onChange={e => editChapter ? setEditChapter({ ...editChapter, order: Number(e.target.value) }) : setChapterForm({ ...chapterForm, order: Number(e.target.value) })}
                            />
                        </FormField>
                        <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
                            {editChapter ? 'Update Chapter' : 'Add Chapter'}
                        </button>
                    </form>
                </Modal>
            )}

            {/* Add/Edit Lecture Modal */}
            {(lectureForm.show || editLecture) && (
                <Modal title={editLecture ? 'Edit Lecture' : 'New Lecture'} onClose={() => { setLectureForm({ ...DEFAULT_LECTURE_FORM, show: false }); setEditLecture(null); }}>
                    <form onSubmit={editLecture ? handleUpdateLecture : handleAddLecture} className="space-y-5">
                        <FormField label="Lecture Title">
                            <input required className={inputCls} placeholder="e.g. Variables and Data Types"
                                value={editLecture ? editLecture.title : lectureForm.title}
                                onChange={e => editLecture ? setEditLecture({ ...editLecture, title: e.target.value }) : setLectureForm({ ...lectureForm, title: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Description (optional)">
                            <textarea rows={3} className={textareaCls} placeholder="Brief description of this lecture…"
                                value={editLecture ? editLecture.description : lectureForm.description}
                                onChange={e => editLecture ? setEditLecture({ ...editLecture, description: e.target.value }) : setLectureForm({ ...lectureForm, description: e.target.value })}
                            />
                        </FormField>

                        {/* YouTube URL */}
                        <FormField label="YouTube Video URL">
                            <input
                                className={inputCls}
                                placeholder="https://www.youtube.com/watch?v=… or https://youtu.be/…"
                                value={editLecture ? (editLecture.youtubeUrl ?? (editLecture.videoIdentifier ? `https://www.youtube.com/watch?v=${editLecture.videoIdentifier}` : '')) : (lectureForm.youtubeUrl ?? '')}
                                onChange={e => {
                                    const url = e.target.value;
                                    const vid = extractYouTubeId(url);
                                    if (editLecture) {
                                        setEditLecture({ ...editLecture, youtubeUrl: url, videoIdentifier: vid });
                                    } else {
                                        setLectureForm({ ...lectureForm, youtubeUrl: url, videoIdentifier: vid });
                                    }
                                }}
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium">Paste your unlisted or public YouTube video/live URL</p>
                            {/* Thumbnail preview */}
                            {(() => {
                                const vid = extractYouTubeId(editLecture ? (editLecture.youtubeUrl ?? editLecture.videoIdentifier ?? '') : (lectureForm.youtubeUrl ?? ''));
                                if (!vid) return null;
                                return (
                                    <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 relative">
                                        <img
                                            src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                                            alt="Video thumbnail"
                                            className="w-full h-36 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                                                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded-md text-white text-[10px] font-bold">
                                            ID: {vid}
                                        </div>
                                    </div>
                                );
                            })()}
                        </FormField>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Type">
                                <select className={inputCls}
                                    value={editLecture ? editLecture.type : lectureForm.type}
                                    onChange={e => editLecture ? setEditLecture({ ...editLecture, type: e.target.value }) : setLectureForm({ ...lectureForm, type: e.target.value })}
                                >
                                    <option value="RECORDED">Recorded</option>
                                    <option value="LIVE">Live</option>
                                </select>
                            </FormField>
                            {(editLecture ? editLecture.type === 'LIVE' : lectureForm.type === 'LIVE') ? (
                                <FormField label="Live Duration (minutes)">
                                    <input type="number" min={5} required className={`${inputCls} border-red-200 focus:border-red-400`}
                                        value={editLecture ? (editLecture.liveDuration || 60) : (lectureForm.liveDuration || 60)}
                                        onChange={e => editLecture ? setEditLecture({ ...editLecture, liveDuration: e.target.value }) : setLectureForm({ ...lectureForm, liveDuration: e.target.value })}
                                    />
                                </FormField>
                            ) : (
                                <FormField label="Duration (minutes)">
                                    <input type="number" min={0} className={inputCls}
                                        value={editLecture ? editLecture.duration : lectureForm.duration}
                                        onChange={e => editLecture ? setEditLecture({ ...editLecture, duration: e.target.value }) : setLectureForm({ ...lectureForm, duration: e.target.value })}
                                    />
                                </FormField>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Order">
                                <input type="number" min={0} className={inputCls}
                                    value={editLecture ? editLecture.order : lectureForm.order}
                                    onChange={e => editLecture ? setEditLecture({ ...editLecture, order: e.target.value }) : setLectureForm({ ...lectureForm, order: e.target.value })}
                                />
                            </FormField>
                            <FormField label="Scheduled At">
                                <input type="datetime-local" className={inputCls}
                                    value={editLecture ? editLecture.scheduledAt : lectureForm.scheduledAt}
                                    onChange={e => editLecture ? setEditLecture({ ...editLecture, scheduledAt: e.target.value }) : setLectureForm({ ...lectureForm, scheduledAt: e.target.value })}
                                />
                            </FormField>
                        </div>
                        
                        <FormField label="Notes URL / PDF Link (optional)">
                            <input
                                className={inputCls}
                                placeholder="e.g. https://drive.google.com/..."
                                value={editLecture ? (editLecture.notesUrl || '') : (lectureForm.notesUrl || '')}
                                onChange={e => {
                                    if (editLecture) {
                                        setEditLecture({ ...editLecture, notesUrl: e.target.value });
                                    } else {
                                        setLectureForm({ ...lectureForm, notesUrl: e.target.value });
                                    }
                                }}
                            />
                            <p className="text-[10px] text-slate-400 mt-1 font-medium px-1">Links to PDF or supplementary materials for this lecture.</p>
                        </FormField>

                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                            <input type="checkbox" id="isPreview" className="w-4 h-4 accent-indigo-600 rounded"
                                checked={editLecture ? editLecture.isPreview : lectureForm.isPreview}
                                onChange={e => editLecture ? setEditLecture({ ...editLecture, isPreview: e.target.checked }) : setLectureForm({ ...lectureForm, isPreview: e.target.checked })}
                            />
                            <label htmlFor="isPreview" className="text-xs font-black text-slate-600 uppercase tracking-widest cursor-pointer">
                                Free Preview (visible without enrollment)
                            </label>
                        </div>
                        <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
                            {editLecture ? 'Update Lecture' : 'Add Lecture'}
                        </button>
                    </form>
                </Modal>
            )}

            {/* ─── Lecture Preview Modal ───────────────────────────────────────────── */}
            {previewLecture && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setPreviewLecture(null)}>
                    <div className="bg-slate-900 rounded-[32px] w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-slate-700">
                            <div className="min-w-0 pr-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Student Preview</p>
                                <p className="text-white font-black truncate text-sm lg:text-base">{previewLecture.title}</p>
                            </div>
                            <button onClick={() => setPreviewLecture(null)} className="p-2 shrink-0 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 lg:p-6 overflow-y-auto max-h-[70vh]">
                            {previewLecture.videoIdentifier ? (() => {
                                const cleanId = extractYouTubeId(previewLecture.videoIdentifier);
                                const origin = window.location.origin;
                                const embedUrl = `https://www.youtube.com/embed/${cleanId}?rel=0&modestbranding=1&enablejsapi=1&origin=${origin}&widget_referrer=${origin}&controls=0&iv_load_policy=3&fs=0`;
                                
                                return (
                                    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl mb-4 relative group">
                                        <iframe
                                            src={embedUrl}
                                            className="w-full h-full border-0 relative z-0"
                                            title={previewLecture.title}
                                            loading="lazy"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                        <div className="absolute inset-0 z-10 cursor-default bg-transparent" onContextMenu={e => e.preventDefault()} />
                                        
                                        <div className="absolute top-4 left-4 z-20 opacity-20 pointer-events-none">
                                            <span className="text-[8px] font-black text-white/60 bg-black/40 px-2 py-1 rounded uppercase tracking-widest">Student Preview Mode</span>
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div className="aspect-video bg-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-xl mb-4">
                                    <Video className="w-10 h-10 lg:w-12 lg:h-12 text-slate-600 mb-3" />
                                    <p className="text-slate-400 font-bold text-xs lg:text-sm">No video URL set for this lecture</p>
                                    <p className="text-slate-500 text-[10px] lg:text-xs mt-1">Add a YouTube URL in the lecture settings to preview</p>
                                </div>
                            )}
                            {previewLecture.description && (
                                <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">{previewLecture.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// extractYouTubeId is defined near the top of the file (before components)

// ─── Shared Sub-Components ───────────────────────────────────────────────────
const inputCls = "w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 transition-all placeholder:text-slate-300";
const textareaCls = "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 transition-all placeholder:text-slate-300 resize-none leading-relaxed";

const FormField = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {children}
    </div>
);

const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-xl tracking-tight">{title}</h3>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="p-8">{children}</div>
        </div>
    </div>
);

const LectureRow = ({ lecture, index, canEdit, onEdit, onDelete, onPreview }) => (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none group">
        <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 shrink-0">
            {index + 1}
        </div>
        <div className="flex items-center gap-2 shrink-0">
            {lecture.type === 'LIVE'
                ? <Radio className="w-4 h-4 text-rose-500" />
                : <Video className="w-4 h-4 text-indigo-400" />
            }
        </div>
        <div className="flex-1 min-w-0">
            <button
                onClick={onPreview}
                className="text-sm font-bold text-slate-800 hover:text-indigo-600 truncate block text-left w-full transition-colors"
                title="Click to preview as student"
            >
                {lecture.title}
            </button>
            <div className="flex items-center gap-3 mt-0.5">
                {lecture.duration > 0 && (
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {lecture.duration}m
                    </span>
                )}
                {lecture.scheduledAt && (
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(lecture.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
                {lecture.isPreview && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Preview</span>
                )}
                {(() => {
                    const isLiveType = lecture.type === 'LIVE';
                    const startTime = new Date(lecture.scheduledAt || lecture.createdAt).getTime();
                    const duration = (lecture.liveDuration || 60) * 60 * 1000;
                    const isExpired = Date.now() > (startTime + duration);
                    const isCurrentlyLive = isLiveType && lecture.status === 'LIVE' && !isExpired;

                    return (
                        <>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${isCurrentlyLive ? 'text-rose-600 bg-rose-50' : 'text-indigo-600 bg-indigo-50'}`}>
                                {isCurrentlyLive ? 'LIVE SESSION' : isLiveType ? 'Past Live' : 'RECORDED'}
                            </span>
                            {isCurrentlyLive && (
                                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                            )}
                        </>
                    );
                })()}
                {lecture.notesUrl && (
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Notes Attached
                    </span>
                )}
            </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
            {lecture.videoIdentifier && (
                <button onClick={onPreview} title="Preview video" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                    <Play className="w-3.5 h-3.5" />
                </button>
            )}
            {canEdit && (
                <>
                    <button onClick={onEdit} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all opacity-0 flex-none group-hover:opacity-100 transition-opacity">
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onDelete} className="p-2 text-slate-400 hover:text-rose-600 flex-none hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </>
            )}
        </div>
    </div>
);

export default CourseManagement;
