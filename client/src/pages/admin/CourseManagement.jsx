import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import {
    ArrowLeft, Edit3, Save, X, Plus, Trash2, BookOpen, Users, Settings,
    Clock, Tag, Globe, BarChart2, Video, ChevronDown, ChevronRight,
    GripVertical, Calendar, Eye, EyeOff, Star, Award, Target, CheckCircle,
    UploadCloud, AlertCircle, Check, Play, FileQuestion, Loader2, Image as ImageIcon
} from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import VideoPlayer from '../../components/ui/VideoPlayer';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const CATEGORY_OPTIONS = ['Skill', 'AI', 'Technology', 'Business', 'Design', 'Marketing', 'Data Science', 'Web Development', 'Mobile Dev', 'Other'];


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

    // Tests state
    const [tests, setTests] = useState([]);
    const DEFAULT_TEST_FORM = { show: false, chapterId: null, title: '', questions: [{ question: '', options: ['', '', '', ''], correctOptionIndex: 0 }] };
    const [testForm, setTestForm] = useState(DEFAULT_TEST_FORM);
    const [editTest, setEditTest] = useState(null);
    const [testResults, setTestResults] = useState([]);

    // Chapter / Lecture state
    const [expandedChapters, setExpandedChapters] = useState({});
    const [chapterForm, setChapterForm] = useState({ show: false, title: '', description: '', order: 0 });
    const [editChapter, setEditChapter] = useState(null);
    const [editLecture, setEditLecture] = useState(null);
    const [previewLecture, setPreviewLecture] = useState(null);

    // Lecture form state
    const DEFAULT_LECTURE_FORM = { show: false, chapterId: null, title: '', description: '', type: 'RECORDED', duration: 0, scheduledAt: '', isPreview: false, order: 0, notesUrl: '' };
    const [lectureForm, setLectureForm] = useState(DEFAULT_LECTURE_FORM);

    // Video upload state
    const [videoFile, setVideoFile] = useState(null);
    const [videoUploading, setVideoUploading] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);
    const [videoUploadMessage, setVideoUploadMessage] = useState('');

    // Settings
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [savingImage, setSavingImage] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), type === 'error' ? 10000 : 3000);
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

    const fetchTests = useCallback(async () => {
        try {
            const res = await axios.get(`/courses/${id}/tests`);
            setTests(res.data.data.tests);
            if (res.data.data.testResults) {
                setTestResults(res.data.data.testResults);
            }
        } catch (err) {
            console.error(err);
        }
    }, [id]);

    useEffect(() => {
        fetchCourse();
        fetchTests();
    }, [fetchCourse, fetchTests]);


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
            const payload = {
                title: lectureForm.title,
                description: lectureForm.description,
                type: 'RECORDED',
                duration: Number(lectureForm.duration),
                order: Number(lectureForm.order),
                isPreview: lectureForm.isPreview,
                ...(lectureForm.chapterId && { chapter: lectureForm.chapterId }),
                notesUrl: lectureForm.notesUrl,
                status: 'READY'
            };
            const res = await axios.post(`/courses/${id}/lectures`, payload);
            const newLecture = res.data.data.lecture;

            // Upload video file if selected
            if (videoFile && newLecture._id) {
                await handleVideoUpload(newLecture._id, videoFile);
            }

            setLectureForm(DEFAULT_LECTURE_FORM);
            setVideoFile(null);
            fetchCourse();
            showToast('Lecture added');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleUpdateLecture = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`/courses/lectures/${editLecture._id}`, {
                title: editLecture.title,
                description: editLecture.description,
                type: 'RECORDED',
                duration: Number(editLecture.duration),
                order: Number(editLecture.order),
                isPreview: editLecture.isPreview,
                notesUrl: editLecture.notesUrl,
            });

            // Upload new video file if selected
            if (videoFile) {
                await handleVideoUpload(editLecture._id, videoFile);
            }

            setEditLecture(null);
            setVideoFile(null);
            fetchCourse();
            showToast('Lecture updated');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleVideoUpload = async (lectureId, fileToUpload) => {
        if (!fileToUpload) return;
        setVideoUploading(true);
        setVideoUploadProgress(0);
        setVideoUploadMessage('Sending file to server...');

        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const token = localStorage.getItem('token');

        try {
            // ── Phase 1: Upload file from browser to server (0-10%) ──
            const fd = new FormData();
            fd.append('video', fileToUpload);

            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${baseURL}/courses/lectures/${lectureId}/upload-video`);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                // responseType must be empty or 'text' to allow streaming
                xhr.responseType = '';

                // Track browser → server progress (0-10%)
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const pct = Math.round((e.loaded * 100) / e.total);
                        const scaled = Math.round(pct * 0.10); // Scale to 0-10%
                        setVideoUploadProgress(scaled);
                        setVideoUploadMessage('Sending file to server...');
                    }
                };

                xhr.upload.onload = () => {
                    setVideoUploadProgress(10);
                    setVideoUploadMessage('Uploading to CDN...');
                };

                // ── Phase 2: Read SSE stream for server → Bunny CDN progress ──
                let lastProcessedIndex = 0;
                xhr.onprogress = () => {
                    const text = xhr.responseText;
                    // Parse new SSE events from the stream
                    const newText = text.substring(lastProcessedIndex);
                    lastProcessedIndex = text.length;

                    const lines = newText.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                setVideoUploadProgress(data.percent);
                                setVideoUploadMessage(data.message);

                                if (data.phase === 'error') {
                                    reject(new Error(data.message));
                                    return;
                                }
                            } catch (e) { /* ignore parse errors */ }
                        }
                    }
                };

                xhr.onload = () => {
                    // Process any remaining SSE events
                    const text = xhr.responseText;
                    const remaining = text.substring(lastProcessedIndex);
                    const lines = remaining.split('\n');
                    let hasError = false;
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                if (data.phase === 'error') {
                                    hasError = true;
                                    reject(new Error(data.message));
                                    return;
                                }
                            } catch (e) { /* ignore */ }
                        }
                    }
                    if (!hasError) resolve();
                };

                xhr.onerror = () => reject(new Error('Network error during upload'));
                xhr.ontimeout = () => reject(new Error('Upload timed out'));
                xhr.timeout = 0; // No timeout for large files
                xhr.send(fd);
            });

            showToast('Video uploaded successfully!');
            fetchCourse();
        } catch (err) {
            const errorMsg = err.message || 'Video upload failed';
            showToast(errorMsg, 'error');
        } finally {
            setVideoUploading(false);
            setVideoUploadProgress(0);
            setVideoUploadMessage('');
        }
    };

    const handleThumbnailUpload = async (lectureId, file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file (JPG, PNG).', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('Thumbnail must be under 5 MB.', 'error');
            return;
        }
        try {
            const fd = new FormData();
            fd.append('image', file);
            await axios.post(`/courses/lectures/${lectureId}/upload-thumbnail`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast('Thumbnail updated!');
            fetchCourse();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to upload thumbnail', 'error');
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

    // ── Test Actions ───────────────────────────────────────────────────────────
    const handleAddTest = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/courses/${id}/tests`, {
                title: testForm.title,
                chapter: testForm.chapterId,
                questions: testForm.questions
            });
            setTestForm(DEFAULT_TEST_FORM);
            fetchTests();
            showToast('Test added');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleUpdateTest = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`/courses/tests/${editTest._id}`, {
                title: editTest.title,
                questions: editTest.questions
            });
            setEditTest(null);
            fetchTests();
            showToast('Test updated');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleDeleteTest = async (testId) => {
        if (!confirm('Delete this test?')) return;
        try {
            await axios.delete(`/courses/tests/${testId}`);
            fetchTests();
            showToast('Test deleted');
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
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Hero Skeleton */}
            <div className="relative h-80 lg:h-80 bg-slate-200 overflow-hidden">
                <div className="absolute inset-0 p-5 lg:p-10 flex flex-col justify-between">
                    <div className="flex justify-between">
                        <Skeleton className="w-20 h-9 rounded-2xl" />
                        <Skeleton className="w-20 h-9 rounded-2xl" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Skeleton className="w-16 h-5 rounded-full" />
                            <Skeleton className="w-16 h-5 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-3/4 lg:w-1/3" />
                        <div className="flex flex-wrap gap-4">
                            <Skeleton className="w-24 h-4" />
                            <Skeleton className="w-24 h-4" />
                            <Skeleton className="w-24 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="bg-white border-b border-slate-200 overflow-hidden">
                <div className="max-w-6xl mx-auto px-5 lg:px-10 flex gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="py-4">
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="max-w-6xl mx-auto px-4 lg:px-10 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {[1, 2].map(i => (
                            <Skeleton key={i} className="h-48 w-full rounded-[28px]" />
                        ))}
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-64 lg:h-96 w-full rounded-[28px]" />
                    </div>
                </div>
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
            <div className="relative h-[340px] lg:h-80 overflow-hidden">
                <img
                    src={getImageUrl(course.coverImage)}
                    className="w-full h-full object-cover scale-105"
                    alt={course.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                <div className="absolute inset-0 p-5 lg:p-10 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-3.5 py-2 lg:px-4 lg:py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black tracking-wide hover:bg-white/20 transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Back
                        </button>
                        {canEdit && (
                            <button
                                onClick={handleTogglePublish}
                                className={`flex items-center gap-2 px-3.5 py-2 lg:px-4 lg:py-2.5 backdrop-blur-md border rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black tracking-wide transition-all ${course.isPublished ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                            >
                                {course.isPublished ? <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> : <EyeOff className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
                                {course.isPublished ? 'Published' : 'Draft'}
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-1.5 lg:gap-2">
                            <span className="px-2.5 py-1 bg-indigo-600/90 backdrop-blur-md rounded-full text-[9px] lg:text-[10px] font-black text-white tracking-widest uppercase">
                                {course.category}
                            </span>
                            <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] lg:text-[10px] font-black text-white/80 tracking-widest uppercase">
                                {course.level}
                            </span>
                            {course.language && (
                                <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] lg:text-[10px] font-black text-white/80 tracking-widest uppercase">
                                    {course.language}
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl lg:text-4xl font-black text-white tracking-tight leading-tight max-w-3xl uppercase">
                            {course.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/60">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-indigo-500/20 border border-white/10 overflow-hidden ring-2 ring-white/10">
                                    {course.teacher?.avatar
                                        ? <img src={getImageUrl(course.teacher.avatar)} className="w-full h-full object-cover" />
                                        : <span className="w-full h-full flex items-center justify-center text-[9px] font-black text-white">{course.teacher?.name?.[0]}</span>
                                    }
                                </div>
                                <span className="text-[11px] lg:text-xs font-bold text-white line-clamp-1">{course.teacher?.name}</span>
                            </div>
                            <div className="hidden lg:block w-px h-3 bg-white/20" />
                            <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
                                <span className="text-[11px] lg:text-xs font-bold flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-indigo-400" /> {course.enrolledStudents?.length || 0} <span className="hidden sm:inline">enrolled</span>
                                </span>
                                <span className="text-[11px] lg:text-xs font-bold flex items-center gap-1.5">
                                    <Video className="w-3.5 h-3.5 text-indigo-400" /> {course.lectures?.length || 0} <span className="hidden sm:inline">lectures</span>
                                </span>
                                {course.duration > 0 && (
                                    <span className="text-[11px] lg:text-xs font-bold flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> {course.duration}h <span className="hidden sm:inline">total</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Bar */}
            {/* Tab Bar Container */}
            <div className="bg-white border-b border-slate-200 sticky top-16 lg:top-20 z-20">
                <div className="max-w-6xl mx-auto px-2 lg:px-10">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 lg:px-5 py-4 lg:py-5 text-[10px] lg:text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                            >
                                <tab.icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-6xl mx-auto px-3.5 lg:px-10 py-6 lg:py-12">

                {/* ─── OVERVIEW TAB ──────────────────────────────────────────────── */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Description */}
                            <div className="bg-white rounded-[24px] lg:rounded-[28px] p-6 lg:p-8 border border-slate-100">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] lg:text-xs mb-6 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-500" /> Course Description
                                </h3>
                                {canEdit ? (
                                    <EditableField label="Description" value={course.description} multiline onSave={v => saveField('description', v)} />
                                ) : (
                                    <p className="text-slate-600 leading-relaxed text-sm">{course.description}</p>
                                )}
                            </div>

                            {/* Objectives */}
                            <div className="bg-white rounded-[24px] lg:rounded-[28px] p-6 lg:p-8 border border-slate-100">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] lg:text-xs mb-6 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-emerald-500" /> Learning Objectives
                                </h3>
                                {canEdit ? (
                                    <TagInput label="Objectives" values={course.objectives || []} onSave={v => saveField('objectives', v)} />
                                ) : (
                                    <ul className="space-y-3">
                                        {(course.objectives || []).map((o, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                </div>
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
                            <div className="bg-white rounded-[24px] lg:rounded-[28px] p-6 lg:p-8 border border-slate-100">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] lg:text-xs mb-6 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-500" /> Prerequisites
                                </h3>
                                {canEdit ? (
                                    <TagInput label="Prerequisites" values={course.prerequisites || []} onSave={v => saveField('prerequisites', v)} />
                                ) : (
                                    <ul className="space-y-3">
                                        {(course.prerequisites || []).map((p, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                                <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Star className="w-3 h-3 text-amber-400" />
                                                </div>
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
                            <div className="bg-white rounded-[24px] lg:rounded-[28px] p-6 lg:p-8 border border-slate-100 space-y-6">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] lg:text-xs flex items-center gap-2">
                                    <BarChart2 className="w-4 h-4 text-indigo-500" /> Course Details
                                </h3>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                    {[
                                        { label: 'Students', value: course.enrolledStudents?.length || 0, icon: Users, color: 'indigo' },
                                        { label: 'Lectures', value: course.lectures?.length || 0, icon: Video, color: 'violet' },
                                        { label: 'Chapters', value: course.chapters?.length || 0, icon: BookOpen, color: 'emerald' },
                                        { label: 'Duration', value: `${course.duration || 0}h`, icon: Clock, color: 'amber' },
                                    ].map(({ label, value, icon: Icon, color }) => (
                                        <div key={label} className={`bg-${color}-50/50 border border-${color}-100 rounded-2xl p-3 lg:p-4 flex flex-col gap-1`}>
                                            <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 text-${color}-500`} />
                                            <span className="text-lg lg:text-xl font-black text-slate-900 leading-none">{value}</span>
                                            <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
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
                            <div className="bg-white rounded-[24px] lg:rounded-[28px] p-6 lg:p-8 border border-slate-100 space-y-4">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] lg:text-xs flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-violet-500" /> Tags
                                </h3>
                                {canEdit ? (
                                    <TagInput label="Tags" values={course.tags || []} onSave={v => saveField('tags', v)} />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {(course.tags || []).map((t, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider">#{t}</span>
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="font-black text-slate-900 text-lg lg:text-xl tracking-tight">Chapters & Lectures</h2>
                                <p className="text-slate-400 text-[10px] lg:text-xs font-bold mt-1 uppercase tracking-widest">{course.chapters?.length || 0} chapters · {course.lectures?.length || 0} lectures</p>
                            </div>
                            {canEdit && (
                                <div className="flex gap-2 lg:gap-3">
                                    <button
                                        onClick={() => {
                                            if (!course.chapters || course.chapters.length === 0) {
                                                showToast('Create at least one chapter before adding lectures.', 'error');
                                                return;
                                            }
                                            setLectureForm({ show: true, chapterId: null, title: '', description: '', type: 'RECORDED', duration: 0, scheduledAt: '', isPreview: false, order: 0, notesUrl: '' }); setVideoFile(null);
                                        }}
                                        className="flex-1 sm:flex-none px-3 py-2 lg:px-4 lg:py-2.5 bg-slate-100 text-slate-700 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                                    >
                                        <Video className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Add Lecture
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!course.chapters || course.chapters.length === 0) {
                                                showToast('Create at least one chapter before adding tests.', 'error');
                                                return;
                                            }
                                            setTestForm({ ...DEFAULT_TEST_FORM, show: true, chapterId: course.chapters[0]._id });
                                        }}
                                        className="flex-1 sm:flex-none px-3 py-2 lg:px-4 lg:py-2.5 bg-slate-100 text-slate-700 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                                    >
                                        <FileQuestion className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Add Test
                                    </button>
                                    <button
                                        onClick={() => setChapterForm({ show: true, title: '', description: '', order: course.chapters?.length || 0 })}
                                        className="flex-1 sm:flex-none px-3 py-2 lg:px-4 lg:py-2.5 bg-indigo-600 text-white rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Add Chapter
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
                                                className="flex items-center gap-3 lg:gap-4 p-4 lg:p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                                                onClick={() => setExpandedChapters(prev => ({ ...prev, [chapter._id]: !isExpanded }))}
                                            >
                                                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-indigo-600 rounded-lg lg:rounded-xl flex items-center justify-center text-white font-black text-[10px] lg:text-xs shrink-0">
                                                    {ci + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-slate-900 text-sm lg:text-base tracking-tight truncate">{chapter.title}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{chLectures.length} {chLectures.length === 1 ? 'lecture' : 'lectures'}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none"> · {tests.filter(t => t.chapter?.toString() === chapter._id?.toString()).length} tests</span>
                                                        {chapter.description && <span className="w-1 h-1 bg-slate-200 rounded-full shrink-0" />}
                                                        {chapter.description && <p className="text-[10px] text-slate-400 font-medium truncate leading-none">{chapter.description}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-0.5 lg:gap-2 shrink-0">
                                                    {canEdit && (
                                                        <>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); if (!course.chapters || course.chapters.length === 0) { showToast('Create at least one chapter first.', 'error'); return; } setLectureForm({ show: true, chapterId: chapter._id, title: '', description: '', type: 'RECORDED', duration: 0, scheduledAt: '', isPreview: false, order: chLectures.length, notesUrl: '' }); setVideoFile(null); }}
                                                                className="p-1.5 lg:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg lg:rounded-xl transition-all"
                                                                title="Add Lecture to Chapter"
                                                            >
                                                                <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                                            </button>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); setEditChapter({ ...chapter }); }}
                                                                className="p-1.5 lg:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:rounded-xl transition-all"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                                            </button>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); handleDeleteChapter(chapter._id); }}
                                                                className="p-1.5 lg:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg lg:rounded-xl transition-all"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {isExpanded ? <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" /> : <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />}
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="border-t border-slate-100">
                                                    {chLectures.length === 0 && tests.filter(t => t.chapter?.toString() === chapter._id?.toString()).length === 0 ? (
                                                        <div className="px-6 py-4 text-slate-300 text-xs font-bold italic text-center">
                                                            No content in this chapter yet.
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {chLectures.sort((a, b) => a.order - b.order).map((lecture, li) => (
                                                                <LectureRow key={lecture._id} lecture={lecture} index={li} canEdit={canEdit}
                                                                    onEdit={() => { setEditLecture({ ...lecture }); setVideoFile(null); }}
                                                                    onDelete={() => handleDeleteLecture(lecture._id)}
                                                                    onPreview={() => setPreviewLecture(lecture)}
                                                                    onUploadThumbnail={(file) => handleThumbnailUpload(lecture._id, file)}
                                                                />
                                                            ))}
                                                            {tests.filter(t => t.chapter?.toString() === chapter._id?.toString()).map((test, ti) => (
                                                                <TestRow key={test._id} test={test} index={chLectures.length + ti} canEdit={canEdit}
                                                                    onEdit={() => setEditTest(test)}
                                                                    onDelete={() => handleDeleteTest(test._id)}
                                                                />
                                                            ))}
                                                        </>
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
                                                onEdit={() => { setEditLecture({ ...lecture }); setVideoFile(null); }}
                                                onDelete={() => handleDeleteLecture(lecture._id)}
                                                onPreview={() => setPreviewLecture(lecture)}
                                                onUploadThumbnail={(file) => handleThumbnailUpload(lecture._id, file)}
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
                                <h2 className="font-black text-slate-900 text-lg lg:text-xl tracking-tight">Enrolled Students</h2>
                                <p className="text-slate-400 text-[10px] lg:text-xs font-bold mt-1 uppercase tracking-widest">{course.enrolledStudents?.length || 0} students enrolled</p>
                            </div>
                        </div>

                        {(!course.enrolledStudents || course.enrolledStudents.length === 0) ? (
                            <div className="bg-white rounded-[24px] lg:rounded-[28px] p-10 lg:p-16 border border-slate-100 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                    <Users className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="font-black text-slate-900 text-lg mb-2">No Students Yet</h3>
                                <p className="text-slate-400 text-sm max-w-xs px-4">Students will appear here once they enroll in your course.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[24px] lg:rounded-[28px] border border-slate-100 overflow-hidden">
                                <div className="overflow-x-auto scrollbar-hide">
                                    <table className="w-full min-w-[500px] md:min-w-0">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="text-left px-5 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                                <th className="text-left px-5 lg:px-8 py-4 lg:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Email</th>
                                                {canEdit && <th className="px-5 lg:px-8 py-4 lg:py-5" />}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {course.enrolledStudents.map((student, i) => (
                                                <tr key={student._id || i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-5 lg:px-8 py-4 lg:py-5">
                                                        <div className="flex items-center gap-3 lg:gap-4">
                                                            <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-indigo-600 overflow-hidden shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                                {student.avatar
                                                                    ? <img src={getImageUrl(student.avatar)} className="w-full h-full object-cover" />
                                                                    : <span className="w-full h-full flex items-center justify-center text-[10px] lg:text-xs font-black text-white">{(student.name?.[0] || 'S')}</span>
                                                                }
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-black text-slate-900 truncate tracking-tight">{student.name || 'Unknown student'}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 md:hidden truncate">{student.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 lg:px-8 py-4 lg:py-5 hidden md:table-cell">
                                                        <span className="text-sm text-slate-400 font-medium">{student.email || '—'}</span>
                                                    </td>
                                                    {canEdit && (
                                                        <td className="px-5 lg:px-8 py-4 lg:py-5 text-right">
                                                            <button
                                                                onClick={() => handleRemoveStudent(student._id)}
                                                                className="px-3 py-1.5 lg:px-4 lg:py-2 text-[10px] lg:text-xs font-black text-rose-500 hover:bg-rose-50 rounded-lg lg:rounded-xl transition-all uppercase tracking-widest border border-slate-100 hover:border-rose-100"
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
                            </div>
                        )}
                    </div>
                )}

                {/* ─── SETTINGS TAB ───────────────────────────────────────────────── */}
                {activeTab === 'settings' && canEdit && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        {/* Basic Info */}
                        <div className="bg-white rounded-[24px] lg:rounded-[28px] p-6 lg:p-8 border border-slate-100 space-y-6">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] lg:text-xs flex items-center gap-2">
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
                            <div className="bg-white rounded-[24px] lg:rounded-[28px] p-6 lg:p-8 border border-slate-100 space-y-6">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] lg:text-xs flex items-center gap-2">
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
                            <div className="bg-white rounded-[24px] lg:rounded-[28px] p-6 lg:p-8 border border-slate-100 space-y-4">
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] lg:text-xs flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-indigo-500" /> Visibility
                                </h3>
                                <div className="flex items-center justify-between p-4 lg:p-5 bg-slate-50 rounded-2xl">
                                    <div className="min-w-0 pr-4">
                                        <p className="font-black text-slate-900 text-sm">{course.isPublished ? 'Published' : 'Draft'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{course.isPublished ? 'Visible to students' : 'Private to you'}</p>
                                    </div>
                                    <button
                                        onClick={handleTogglePublish}
                                        className={`relative w-12 h-6 lg:w-14 lg:h-7 rounded-full transition-all shrink-0 ${course.isPublished ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 lg:w-5 lg:h-5 bg-white rounded-full shadow transition-all ${course.isPublished ? 'left-7 lg:left-8' : 'left-1'}`} />
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
                <Modal title={editLecture ? 'Edit Lecture' : 'New Lecture'} disableClose={videoUploading} onClose={() => { setLectureForm({ ...DEFAULT_LECTURE_FORM, show: false }); setEditLecture(null); setVideoFile(null); }}>
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

                        {/* Video Upload */}
                        <FormField label="Upload Video">
                            <div className="space-y-3">
                                {/* Show existing video info for edit mode */}
                                {editLecture?.bunnyVideoId && !videoFile && (
                                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-emerald-700">Video uploaded</p>
                                            <p className="text-[10px] text-emerald-600 font-medium truncate">
                                                Status: {editLecture.videoStatus || 'READY'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <label className="flex flex-col items-center gap-3 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                                    <UploadCloud className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                    <div className="text-center">
                                        <p className="text-xs font-black text-slate-600 group-hover:text-indigo-600 transition-colors">
                                            {videoFile ? videoFile.name : (editLecture?.bunnyVideoId ? 'Replace Video' : 'Choose Video File')}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">MP4, WebM, MOV, AVI, MKV • Max 2GB</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv"
                                        className="hidden"
                                        onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const maxSize = 2000 * 1024 * 1024; // 2GB
                                                if (file.size > maxSize) {
                                                    showToast(`File is too large (${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB). Maximum allowed size is 2 GB.`, 'error');
                                                    e.target.value = '';
                                                    return;
                                                }
                                                const ext = file.name.split('.').pop()?.toLowerCase();
                                                const allowedExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
                                                if (!allowedExts.includes(ext)) {
                                                    showToast(`Unsupported file format (.${ext}). Allowed: MP4, WebM, MOV, AVI, MKV.`, 'error');
                                                    e.target.value = '';
                                                    return;
                                                }
                                                setVideoFile(file);
                                            }
                                        }}
                                    />
                                </label>

                                {videoFile && (
                                    <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
                                        <Video className="w-5 h-5 text-indigo-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-indigo-700 truncate">{videoFile.name}</p>
                                            <p className="text-[10px] text-indigo-500 font-medium">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                        </div>
                                        <button type="button" onClick={() => setVideoFile(null)} className="p-1 text-indigo-400 hover:text-rose-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                {videoUploading && (
                                    <div className="space-y-2.5 mt-4 p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
                                            <span className="text-xs font-black text-indigo-600">
                                                {videoUploadMessage || 'Uploading...'}
                                            </span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${videoUploadProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-indigo-400 font-medium">Do not close this window.</p>
                                    </div>
                                )}
                            </div>
                        </FormField>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Duration (minutes)">
                                <input type="number" min={0} className={inputCls}
                                    value={editLecture ? editLecture.duration : lectureForm.duration}
                                    onChange={e => editLecture ? setEditLecture({ ...editLecture, duration: e.target.value }) : setLectureForm({ ...lectureForm, duration: e.target.value })}
                                />
                            </FormField>
                            <FormField label="Order">
                                <input type="number" min={0} className={inputCls}
                                    value={editLecture ? editLecture.order : lectureForm.order}
                                    onChange={e => editLecture ? setEditLecture({ ...editLecture, order: e.target.value }) : setLectureForm({ ...lectureForm, order: e.target.value })}
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
                        <button type="submit" disabled={videoUploading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {videoUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : (editLecture ? 'Update Lecture' : 'Add Lecture')}
                        </button>
                    </form>
                </Modal>
            )}

            {/* Add/Edit Test Modal */}
            {(testForm.show || editTest) && (
                <Modal title={editTest ? 'Edit Test' : 'New Test'} onClose={() => { setTestForm(DEFAULT_TEST_FORM); setEditTest(null); }}>
                    <form onSubmit={editTest ? handleUpdateTest : handleAddTest} className="space-y-6">
                        <FormField label="Test Title">
                            <input required className={inputCls} placeholder="e.g. Chapter 1 Quiz"
                                value={editTest ? editTest.title : testForm.title}
                                onChange={e => editTest ? setEditTest({ ...editTest, title: e.target.value }) : setTestForm({ ...testForm, title: e.target.value })}
                            />
                        </FormField>
                        {!editTest && course.chapters?.length > 0 && (
                            <FormField label="Chapter">
                                <select className={inputCls} required
                                    value={testForm.chapterId || ''}
                                    onChange={e => setTestForm({ ...testForm, chapterId: e.target.value })}
                                >
                                    <option value="" disabled>Select a Chapter</option>
                                    {course.chapters.map(c => (
                                        <option key={c._id} value={c._id}>{c.title}</option>
                                    ))}
                                </select>
                            </FormField>
                        )}

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</h4>
                                <button type="button" onClick={() => {
                                    const newQ = { question: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '' };
                                    if (editTest) setEditTest({ ...editTest, questions: [...editTest.questions, newQ] });
                                    else setTestForm({ ...testForm, questions: [...testForm.questions, newQ] });
                                }} className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 tracking-widest">
                                    + Add Question
                                </button>
                            </div>

                            {(editTest ? editTest.questions : testForm.questions).map((q, qi) => (
                                <div key={qi} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative">
                                    {((editTest ? editTest.questions.length : testForm.questions.length) > 1) && (
                                        <button type="button" onClick={() => {
                                            if (editTest) {
                                                const rq = editTest.questions.filter((_, idx) => idx !== qi);
                                                setEditTest({ ...editTest, questions: rq });
                                            } else {
                                                const rq = testForm.questions.filter((_, idx) => idx !== qi);
                                                setTestForm({ ...testForm, questions: rq });
                                            }
                                        }} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 bg-white rounded-full p-1 shadow-sm">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}

                                    <div className="space-y-3">
                                        <FormField label={`Question ${qi + 1}`}>
                                            <input required className={inputCls} placeholder="Question text"
                                                value={q.question}
                                                onChange={e => {
                                                    const v = e.target.value;
                                                    if (editTest) {
                                                        const qs = [...editTest.questions]; qs[qi].question = v; setEditTest({ ...editTest, questions: qs });
                                                    } else {
                                                        const qs = [...testForm.questions]; qs[qi].question = v; setTestForm({ ...testForm, questions: qs });
                                                    }
                                                }}
                                            />
                                        </FormField>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options.map((opt, oi) => (
                                                <div key={oi} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2">
                                                    <input type="radio" required name={`correct-${qi}`}
                                                        className="w-4 h-4 accent-emerald-500 mt-1 cursor-pointer shrink-0"
                                                        checked={q.correctOptionIndex === oi}
                                                        onChange={() => {
                                                            if (editTest) {
                                                                const qs = [...editTest.questions]; qs[qi].correctOptionIndex = oi; setEditTest({ ...editTest, questions: qs });
                                                            } else {
                                                                const qs = [...testForm.questions]; qs[qi].correctOptionIndex = oi; setTestForm({ ...testForm, questions: qs });
                                                            }
                                                        }}
                                                    />
                                                    <input required className="w-full h-10 px-2 py-1 text-sm font-medium text-slate-700 outline-none" placeholder={`Option ${oi + 1}`}
                                                        value={opt}
                                                        onChange={e => {
                                                            const v = e.target.value;
                                                            if (editTest) {
                                                                const qs = [...editTest.questions]; qs[qi].options[oi] = v; setEditTest({ ...editTest, questions: qs });
                                                            } else {
                                                                const qs = [...testForm.questions]; qs[qi].options[oi] = v; setTestForm({ ...testForm, questions: qs });
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <FormField label="Explanation for correct answer (Optional)">
                                            <input className={inputCls} placeholder="Why is this the correct answer?"
                                                value={q.explanation || ''}
                                                onChange={e => {
                                                    const v = e.target.value;
                                                    if (editTest) {
                                                        const qs = [...editTest.questions]; qs[qi].explanation = v; setEditTest({ ...editTest, questions: qs });
                                                    } else {
                                                        const qs = [...testForm.questions]; qs[qi].explanation = v; setTestForm({ ...testForm, questions: qs });
                                                    }
                                                }}
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
                            {editTest ? 'Update Test' : 'Add Test'}
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
                            {previewLecture.bunnyVideoId ? (
                                <div className="mb-4">
                                    <VideoPlayer lecture={previewLecture} />
                                    <div className="mt-4 flex items-center justify-center">
                                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded uppercase tracking-[0.2em]">Preview Mode</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video bg-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-xl mb-4">
                                    <Video className="w-10 h-10 lg:w-12 lg:h-12 text-slate-600 mb-3" />
                                    <p className="text-slate-400 font-bold text-xs lg:text-sm">No video uploaded for this lecture</p>
                                    <p className="text-slate-500 text-[10px] lg:text-xs mt-1">Upload a video in the lecture settings to preview</p>
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

const Modal = ({ title, children, onClose, disableClose }) => (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-xl tracking-tight">{title}</h3>
                <button onClick={onClose} disabled={disableClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="p-8">{children}</div>
        </div>
    </div>
);

const LectureRow = ({ lecture, index, canEdit, onEdit, onDelete, onPreview, onUploadThumbnail }) => (
    <div className="px-4 lg:px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none group">
        <div className="flex items-start gap-4">
            <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-lg lg:rounded-xl bg-slate-100 flex items-center justify-center text-[10px] lg:text-xs font-black text-slate-400 shrink-0 mt-0.5">
                {index + 1}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <button
                        onClick={onPreview}
                        className="text-[13px] lg:text-sm font-bold text-slate-800 hover:text-indigo-600 block text-left transition-colors max-w-[200px] sm:max-w-[300px] md:max-w-md lg:max-w-lg xl:max-w-xl"
                        title="Click to preview as student"
                    >
                        <span className="truncate block">{lecture.title}</span>
                    </button>
                    <div className="flex items-center gap-1 shrink-0 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        {lecture.bunnyVideoId && (
                            <button onClick={onPreview} title="Preview video" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                <Play className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                            </button>
                        )}
                        {canEdit && (
                            <>
                                <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all" title="Edit lecture">
                                    <Edit3 className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                </button>
                                {lecture.bunnyVideoId && (
                                    <label title="Upload thumbnail" className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer">
                                        <ImageIcon className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                        <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files[0]) onUploadThumbnail(e.target.files[0]); e.target.value = ''; }} />
                                    </label>
                                )}
                                <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete lecture">
                                    <Trash2 className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Video className="w-3 h-3 text-indigo-400" />
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest text-indigo-600 bg-indigo-50">
                            {lecture.bunnyVideoId ? (lecture.videoStatus === 'READY' ? 'READY' : lecture.videoStatus || 'RECORDED') : 'NO VIDEO'}
                        </span>
                    </div>
                    {lecture.duration > 0 && (
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {lecture.duration}m
                        </span>
                    )}
                    {lecture.isPreview && (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase tracking-widest">Free</span>
                    )}
                    {lecture.notesUrl && (
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Notes
                        </span>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const TestRow = ({ test, index, canEdit, onEdit, onDelete }) => (
    <div className="px-4 lg:px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none group">
        <div className="flex items-start gap-4">
            <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-lg lg:rounded-xl bg-orange-100 flex items-center justify-center text-[10px] lg:text-xs font-black text-orange-400 shrink-0 mt-0.5">
                <FileQuestion className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <span
                        className="text-[13px] lg:text-sm font-bold text-slate-800 truncate block text-left pt-1"
                    >
                        {test.title}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        {canEdit && (
                            <>
                                <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
                                    <Edit3 className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                </button>
                                <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                    <Trash2 className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest text-orange-600 bg-orange-50">
                            TEST
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        {test.questions.length} Questions
                    </span>
                </div>
            </div>
        </div>
    </div>
);

export default CourseManagement;
