import { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import {
    BookOpen, Play, Video, Plus, Edit, Trash2,
    ChevronRight, BadgeInfo, Clock, Users,
    Globe, CheckCircle, ExternalLink,
    ArrowLeft, MonitorPlay, Settings, Key, Lock, User,
    Pause, Volume2, VolumeX, RotateCcw, RotateCw, X,
    Maximize, FileQuestion
} from 'lucide-react';
import { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import SmartImage from '../components/ui/SmartImage';
import Skeleton from '../components/ui/Skeleton';
import PaymentVerify from './course/PaymentVerify';
import VideoPlayer from '../components/ui/VideoPlayer';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const getImgUrl = (p) => {
    if (!p) return null;
    if (p.startsWith('http')) return p;
    return `${API_BASE}/${p.replace(/^\//, '')}`;
};

const PreviewModal = ({ lecture, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" 
        />
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            className="relative w-full max-w-5xl bg-black rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
        >
            <div className="p-4 md:p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-indigo-500 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">Free Preview</div>
                    <h3 className="text-white font-bold text-sm md:text-lg truncate">{lecture.title}</h3>
                </div>
                <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <VideoPlayer lecture={lecture} />
            <div className="p-6 bg-slate-900/50 flex items-center justify-between">
                <p className="text-slate-400 text-xs font-medium">To access all lessons, please enroll in the course.</p>
                <div className="flex gap-4">
                     <span className="text-indigo-400 font-black text-xs uppercase tracking-widest">Enrolling...</span>
                </div>
            </div>
        </motion.div>
    </div>
);

const LEVEL_COLORS = {
    Beginner: 'bg-emerald-100 text-emerald-700',
    Intermediate: 'bg-amber-100   text-amber-700',
    Advanced: 'bg-rose-100    text-rose-700',
    Expert: 'bg-purple-100  text-purple-700',
};

const CourseCard = ({ course, isEnrolled }) => (
    <Link
        to={`/app/learning/course/${course._id}`}
        className="group bg-white rounded-[28px] overflow-hidden border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
        {/* Cover */}
        <div className="relative h-48 overflow-hidden shrink-0">
            <SmartImage
                src={getImgUrl(course.coverImage)}
                alt={course.title}
                className="group-hover:scale-105 transition-transform duration-500"
                containerClassName="w-full h-full"
                fallbackIcon={BookOpen}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* top badges */}
            <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 bg-indigo-600/90 backdrop-blur-sm rounded-full text-[10px] font-black text-white tracking-widest uppercase">{course.category}</span>
                {isEnrolled && (
                    <span className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-[10px] font-black text-white tracking-widest uppercase flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Enrolled
                    </span>
                )}
            </div>

            {/* level */}
            {course.level && (
                <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-sm ${LEVEL_COLORS[course.level] || 'bg-white/80 text-slate-600'}`}>
                        {course.level}
                    </span>
                </div>
            )}

            {/* teacher */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <SmartImage
                    src={getImgUrl(course.teacher?.avatar)}
                    alt={course.teacher?.name}
                    containerClassName="w-6 h-6 rounded-full bg-white/20 border border-white/40 overflow-hidden shrink-0"
                    fallbackIcon={User}
                />
                <span className="text-white/90 text-[11px] font-bold line-clamp-1">{course.teacher?.name || 'Unknown Teacher'}</span>
            </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
            <h3 className="text-[16px] font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                {course.title}
            </h3>
            {course.description && (
                <p className="text-slate-400 text-xs font-medium line-clamp-2 mb-4 leading-relaxed">{course.description}</p>
            )}

            {/* Tags */}
            {course.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {course.tags.slice(0, 3).map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold">#{t}</span>
                    ))}
                </div>
            )}

            {/* Stats row */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-400 text-[11px] font-bold">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.enrolledStudents?.length || 0}</span>
                    <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" />{course.lectures?.length || 0} lects</span>
                    {course.duration > 0 && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}h</span>}
                </div>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {isEnrolled ? 'Continue →' : course.price > 0 ? `₹${course.price}` : 'Free'}
                </span>
            </div>
        </div>
    </Link>
);


const LectureList = ({ lectures, onSelect, currentId, completedIds = [], dark = false }) => (
    <div className="space-y-2">
        {lectures.map((lecture, index) => {
            const isActive = currentId === lecture._id;
            const isCompleted = completedIds.includes(lecture._id);
            return (
                <button
                    key={lecture._id}
                    onClick={() => onSelect(lecture)}
                    className={clsx(
                        "w-full flex items-center gap-4 p-4 rounded-[20px] transition-all border group",
                        dark
                            ? isActive
                                ? "bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                : "hover:bg-white/5 border-transparent"
                            : isActive
                                ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                : "hover:bg-slate-50 border-transparent"
                    )}
                >
                    <div className={clsx(
                        "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                        dark
                            ? isActive ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 text-slate-400"
                            : "bg-indigo-50 text-indigo-500"
                    )}>
                        <Play className="w-5 h-5 ml-0.5" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className={clsx(
                            "text-[14px] font-bold leading-tight mb-1 truncate",
                            dark
                                ? isActive ? "text-white" : "text-white/60 group-hover:text-white"
                                : isActive ? "text-indigo-600" : "text-slate-800"
                        )}>
                            {index + 1}. {lecture.title}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className={clsx(
                                "text-[9px] font-black tracking-[0.15em] uppercase",
                                dark ? "text-white/30" : "text-slate-400"
                            )}>
                                Recorded
                            </span>
                        </div>
                    </div>
                    {isCompleted && (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                    )}
                </button>
            );
        })}
    </div>
);

const TestTakingView = ({ test, existingResult, onSubmit, fetchingSubmit }) => {
    const [answers, setAnswers] = useState([]);

    const handleOptionSelect = (qId, optionIdx) => {
        if (existingResult) return;
        setAnswers(prev => {
            const cur = prev.filter(a => a.questionId !== qId);
            return [...cur, { questionId: qId, selectedOptionIndex: optionIdx }];
        });
    };

    if (existingResult) {
        return (
            <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl md:rounded-[32px] p-6 md:p-8 text-center text-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 md:p-8 opacity-20 pointer-events-none">
                        <CheckCircle className="w-20 h-20 md:w-32 md:h-32" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black mb-1 md:mb-2">Test Completed</h2>
                    <p className="text-xs md:text-base text-indigo-200/80 mb-4 md:mb-6 font-medium">You have already submitted this test.</p>
                    <div className="inline-block bg-indigo-500/20 px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl border border-indigo-500/30">
                        <p className="text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] mb-1">Your Score</p>
                        <p className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                            {existingResult.score} <span className="text-xl md:text-2xl text-indigo-300">/ {existingResult.totalQuestions}</span>
                        </p>
                    </div>
                </div>

                <div className="space-y-6 mt-8">
                    <h3 className="text-white font-black text-xl mb-4">Review Answers</h3>
                    {test.questions.map((q, i) => {
                        const ans = existingResult.answers.find(a => a.questionId.toString() === q._id.toString());
                        return (
                            <div key={q._id} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/5">
                                <p className="text-white font-bold mb-4">
                                    <span className="text-indigo-400 font-black mr-2">{i + 1}.</span> {q.question}
                                </p>
                                <div className="space-y-3">
                                    {q.options.map((opt, oi) => {
                                        let bg = "bg-white/5 border border-white/5 text-slate-300";
                                        let icon = null;
                                        if (ans?.selectedOptionIndex === oi && ans.isCorrect) {
                                            bg = "bg-emerald-500/20 border-emerald-500/30 text-emerald-100";
                                            icon = <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
                                        } else if (ans?.selectedOptionIndex === oi && !ans.isCorrect) {
                                            bg = "bg-rose-500/20 border-rose-500/30 text-rose-100";
                                            icon = <X className="w-4 h-4 text-rose-400 shrink-0" />;
                                        } else if (q.correctOptionIndex === oi) {
                                            // Show the correct answer
                                            bg = "bg-emerald-500/10 border-emerald-500/20 text-emerald-200 opacity-80";
                                            icon = <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
                                        }
                                        
                                        return (
                                            <div key={oi} className={`flex items-center justify-between p-3 rounded-2xl ${bg}`}>
                                                <span className="text-sm font-medium">{opt}</span>
                                                {icon}
                                            </div>
                                        );
                                    })}
                                </div>
                                {q.explanation && (
                                    <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Explanation</p>
                                        <p className="text-sm font-medium text-slate-300 leading-relaxed">{q.explanation}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="mb-8 border-b border-white/10 pb-6">
                <h2 className="text-white font-black text-3xl mb-2">{test.title}</h2>
                <div className="flex items-center gap-3 text-slate-400 font-medium text-sm">
                    <span className="flex items-center gap-1"><FileQuestion className="w-4 h-4" /> {test.questions.length} Questions</span>
                </div>
            </div>

            <div className="space-y-8">
                {test.questions.map((q, i) => {
                    const selected = answers.find(a => a.questionId === q._id)?.selectedOptionIndex;
                    return (
                        <div key={q._id} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/5">
                            <p className="text-white font-bold mb-4 text-lg">
                                <span className="text-indigo-400 font-black mr-2">{i + 1}.</span> {q.question}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt, oi) => (
                                    <button
                                        key={oi}
                                        onClick={() => handleOptionSelect(q._id, oi)}
                                        className={clsx(
                                            "flex items-center gap-3 p-4 rounded-2xl border text-left transition-all group",
                                            selected === oi
                                                ? "bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-600/10"
                                                : "bg-[#111] border-white/10 hover:border-indigo-500/30 hover:bg-[#1a1a2e]"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                            selected === oi ? "border-indigo-400" : "border-slate-500 group-hover:border-indigo-400"
                                        )}>
                                            {selected === oi && <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full" />}
                                        </div>
                                        <span className={clsx(
                                            "text-sm font-medium transition-colors",
                                            selected === oi ? "text-indigo-100" : "text-slate-300 group-hover:text-indigo-100"
                                        )}>
                                            {opt}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col items-end gap-3 pb-12">
                <button
                    onClick={() => onSubmit(answers)}
                    disabled={answers.length !== test.questions.length || fetchingSubmit}
                    className={clsx(
                        "px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all",
                        answers.length === test.questions.length && !fetchingSubmit
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-105"
                            : "bg-white/5 text-slate-500 cursor-not-allowed"
                    )}
                >
                    {fetchingSubmit ? 'Submitting...' : 'Submit Answers'}
                </button>
                {answers.length !== test.questions.length && (
                    <p className="text-right text-rose-400/80 text-xs font-medium uppercase tracking-widest mt-3">
                        Answer all questions to submit
                    </p>
                )}
            </div>
        </div>
    );
};

const CourseListingPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [filterType, setFilterType] = useState('all'); // 'all' or 'enrolled'
    const { user } = useAuth();

    const fetchCourses = useCallback(async () => {
        try {
            const res = await axios.get('/courses');
            setCourses(res.data.data.courses || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCourses(); }, [fetchCourses]);

    // Derive categories from courses
    const categories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))];

    // Enrolled IDs from user
    const userId = user?._id || user?.id;
    const isEnrolled = useCallback((course) =>
        Array.isArray(course.enrolledStudents) && userId &&
        course.enrolledStudents.some(s => (s._id || s).toString() === userId.toString()), [userId]);

    // Filtering
    const filtered = courses.filter(c => {
        const q = search.toLowerCase();
        const matchSearch = !q || c.title?.toLowerCase().includes(q)
            || c.description?.toLowerCase().includes(q)
            || c.teacher?.name?.toLowerCase().includes(q)
            || c.tags?.some(t => t.toLowerCase().includes(q));
        const matchCat = activeCategory === 'All' || c.category === activeCategory;
        const matchFilter = filterType === 'all' || isEnrolled(c);
        return matchSearch && matchCat && matchFilter;
    });

    const enrolledCount = courses.filter(isEnrolled).length;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* ── Hero / Search Strip */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-4 pt-10 pb-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
                        Expand Your Skills
                    </h1>
                    <p className="text-indigo-200 font-medium text-base md:text-lg mb-8">
                        Watch expert-led lectures at your own pace.
                    </p>

                    {/* Search bar */}
                    <div className="relative max-w-xl mx-auto">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search courses, teachers, topics…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-14 pl-14 pr-5 bg-white/95 backdrop-blur-sm rounded-2xl text-slate-800 font-medium text-[15px] outline-none shadow-xl shadow-indigo-900/20 placeholder:text-slate-400 focus:ring-2 ring-white/60 transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-300 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-6">

                {/* ── Stats strip */}
                <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8">
                    {[
                        { id: 'all', label: 'Total Courses', value: courses.length, icon: BookOpen, activeColor: 'border-indigo-500 shadow-indigo-500/10', bgColor: 'bg-indigo-50', textColor: 'text-indigo-500', valueColor: 'text-indigo-600' },
                        { id: 'enrolled', label: 'Enrolled', value: enrolledCount, icon: CheckCircle, activeColor: 'border-emerald-500 shadow-emerald-500/10', bgColor: 'bg-emerald-50', textColor: 'text-emerald-500', valueColor: 'text-emerald-600' },
                    ].map(({ id, label, value, icon: Icon, activeColor, bgColor, textColor, valueColor }) => (
                        <div 
                            key={id} 
                            onClick={() => setFilterType(id)}
                            className={clsx(
                                "bg-white rounded-[24px] p-4 sm:p-6 border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-center sm:gap-5 gap-2 text-center sm:text-left group",
                                filterType === id 
                                    ? `${activeColor} shadow-lg` 
                                    : "border-slate-100 hover:border-slate-200 hover:shadow-md"
                            )}
                        >
                            <div className={clsx(
                                "w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                bgColor, textColor
                            )}>
                                <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                            </div>
                            <div>
                                <div className={clsx(
                                    "text-xl sm:text-3xl font-black leading-none mb-1",
                                    valueColor
                                )}>
                                    {loading ? <Skeleton className="h-8 w-10" /> : value}
                                </div>
                                <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Category pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-8">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wide whitespace-nowrap transition-all ${activeCategory === cat
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                        >
                            {cat}
                            {cat !== 'All' && <span className="ml-1.5 opacity-60">{courses.filter(c => c.category === cat).length}</span>}
                        </button>
                    ))}
                </div>

                {/* ── Teacher/management link for teachers */}
                {(user?.role === 'TEACHER' || user?.role === 'COLLEGE_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <div className="mb-8 p-4 sm:p-5 bg-slate-900 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-white font-black text-sm">Management Console</p>
                                <p className="text-slate-400 text-xs font-medium hidden sm:block">Manage your courses, chapters and lectures</p>
                            </div>
                        </div>
                        <Link to="/app/learning/teacher" className="px-4 py-2 sm:px-5 sm:py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-500 transition-all shrink-0">
                            Open
                        </Link>
                    </div>
                )}

                {/* ── Results header */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-slate-500 text-sm font-bold">
                        {search || activeCategory !== 'All'
                            ? <>{filtered.length} result{filtered.length !== 1 ? 's' : ''} {search && <span className="text-indigo-600">for "{search}"</span>}</>
                            : `Showing all ${courses.length} courses`
                        }
                    </p>
                    {(search || activeCategory !== 'All' || filterType !== 'all') && (
                        <button
                            onClick={() => { setSearch(''); setActiveCategory('All'); setFilterType('all'); }}
                            className="text-xs font-black text-indigo-600 hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                {/* ── Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-[28px] overflow-hidden border border-slate-100 animate-pulse">
                                <div className="h-48 bg-slate-100" />
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-slate-100 rounded-xl w-3/4" />
                                    <div className="h-3 bg-slate-100 rounded-xl w-full" />
                                    <div className="h-3 bg-slate-100 rounded-xl w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 bg-white rounded-[28px] border border-slate-100 flex flex-col items-center text-center mb-12">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-5">
                            <BookOpen className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="font-black text-slate-900 text-lg mb-2">No courses found</h3>
                        <p className="text-slate-400 text-sm max-w-xs">
                            {search ? `No results for "${search}". Try a different keyword.` : 'No courses in this category yet.'}
                        </p>
                        <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all">
                            View All Courses
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filtered.map(course => (
                            <CourseCard key={course._id} course={course} isEnrolled={isEnrolled(course)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CourseDetailPage = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLecture, setActiveLecture] = useState(null);
    const [previewLecture, setPreviewLecture] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [completedLectures, setCompletedLectures] = useState([]);
    
    // Tests State
    const [tests, setTests] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const [activeTest, setActiveTest] = useState(null);

    const [showSidebar, setShowSidebar] = useState(true);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            // Default: closed on mobile, open on desktop
            setShowSidebar(!mobile);
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchCourse = useCallback(async () => {
        try {
            const res = await axios.get(`/courses/${id}`);
            setCourse(res.data.data.course);
            setIsEnrolled(res.data.data.isEnrolled);
            if (res.data.data.isEnrolled) {
                localStorage.setItem(`course_enrolled_${id}`, 'true');
            }
            const completed = res.data.data.completedLectures || [];
            setCompletedLectures(completed);

            let fetchedTests = [];
            if (res.data.data.isEnrolled) {
                try {
                    const testsRes = await axios.get(`/courses/${id}/tests`);
                    fetchedTests = testsRes.data.data.tests || [];
                    setTests(fetchedTests);
                    setTestResults(testsRes.data.data.testResults || []);
                } catch (e) {
                    console.error('Failed to load tests:', e);
                }
            }

            const allLectures = res.data.data.course.lectures || [];
            const allChapters = res.data.data.course.chapters || [];

            if (allLectures.length > 0) {
                // To find the TRULY first incomplete lesson, we must respect the visual order:
                // 1. Sort chapters by order
                // 2. For each chapter, find its lectures and sort them (assuming they have an 'order' or by title)
                // 3. Flatten this list and find the first incomplete one.

                const sortedChapters = [...allChapters].sort((a, b) => (a.order || 0) - (b.order || 0));

                const curriculumOrderedLectures = [];

                // Add lectures belonging to chapters in order
                sortedChapters.forEach(ch => {
                    const chLects = allLectures
                        .filter(l => l.chapter?.toString() === ch._id?.toString())
                        .sort((a, b) => (a.order || 0) - (b.order || 0));
                    curriculumOrderedLectures.push(...chLects);
                });

                // Add lectures that have no chapter (Supplementary)
                const uncategorized = allLectures
                    .filter(l => !l.chapter)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                curriculumOrderedLectures.push(...uncategorized);

                const firstIncomplete = curriculumOrderedLectures.find(l => !completed.includes(l._id)) || curriculumOrderedLectures[0];
                setActiveLecture(firstIncomplete);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [id]);

    useEffect(() => { fetchCourse(); }, [fetchCourse]);

    const handleEnroll = async () => {
        try {
            const res = await axios.post('/payment/create-order', { courseId: id });
            
            if (res.data.isFree) {
                setIsEnrolled(true);
                fetchCourse();
                return;
            }

            // Cashfree logic
            const cashfree = window.Cashfree({
                mode: res.data.environment || (import.meta.env.MODE === 'production' ? 'production' : 'sandbox')
            });

            const checkoutOptions = {
                paymentSessionId: res.data.data.payment_session_id,
                redirectTarget: "_self", // Or "_blank" or "_modal" (for _modal, we need to handle callbacks)
            };

            cashfree.checkout(checkoutOptions);

        } catch (err) {
            console.error('Enroll Error:', err);
            alert(err.response?.data?.message || 'Failed to enroll');
        }
    };

    const handleMarkComplete = async () => {
        if (!activeLecture) return;
        const isCurrentlyCompleted = completedLectures.includes(activeLecture._id);

        try {
            if (isCurrentlyCompleted) {
                await axios.delete(`/courses/lectures/${activeLecture._id}/complete`);
                setCompletedLectures(prev => prev.filter(id => id !== activeLecture._id));
            } else {
                await axios.post(`/courses/lectures/${activeLecture._id}/complete`);
                setCompletedLectures(prev => [...prev, activeLecture._id]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleTestSubmit = async (answers) => {
        try {
            const res = await axios.post(`/courses/tests/${activeTest._id}/submit`, { answers });
            setTestResults(prev => [...prev, res.data.data.testResult]);
            fetchCourse(); // refresh stats
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit test');
        }
    };

    const totalItems = (course?.lectures?.length || 0) + (tests.length || 0);
    const completedItems = completedLectures.length + testResults.length;
    const progress = totalItems > 0
        ? Math.round((completedItems / totalItems) * 100)
        : 0;

    const CourseDetailSkeleton = () => (
        <div className="min-h-screen bg-[#F8FAFC] animate-pulse">
            <div className="h-72 md:h-[420px] bg-slate-200" />
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-24 bg-white rounded-[24px] border border-slate-100" />
                        <div className="h-40 bg-white rounded-[24px] border border-slate-100" />
                        <div className="h-60 bg-white rounded-[24px] border border-slate-100" />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="h-[500px] bg-white rounded-[28px] border border-slate-100" />
                    </div>
                </div>
            </div>
        </div>
    );

    const MasterclassSkeleton = () => (
        <div className="flex bg-slate-950 h-screen overflow-hidden">
            <div className="flex-1 flex flex-col h-full min-w-0">
                <div className="h-14 bg-slate-900/40 border-b border-white/5 flex items-center px-6 gap-4 shrink-0">
                    <div className="w-8 h-8 bg-white/5 rounded-xl animate-pulse" />
                    <div className="w-48 h-3.5 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="flex-1 overflow-y-auto p-4 lg:p-12 space-y-6 lg:space-y-10 animate-pulse">
                    <div className="max-w-6xl mx-auto space-y-4 lg:space-y-10">
                        <div className="aspect-video bg-white/5 rounded-[24px] lg:rounded-[40px] shadow-2xl" />
                        <div className="bg-white/5 backdrop-blur-md border border-white/5 p-4 lg:p-10 rounded-3xl lg:rounded-[48px] space-y-3 lg:space-y-8">
                            <div className="flex flex-col gap-4 pb-4 lg:pb-8 border-b border-white/5">
                                <div className="w-32 h-5 bg-white/5 rounded-lg" />
                                <div className="w-3/4 h-8 bg-white/10 rounded-xl" />
                            </div>
                            <div className="space-y-3">
                                <div className="w-full h-3 bg-white/5 rounded-full" />
                                <div className="w-full h-3 bg-white/5 rounded-full" />
                                <div className="w-2/3 h-3 bg-white/5 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hidden lg:flex w-[400px] border-l border-white/5 flex-col p-8 space-y-8 animate-pulse">
                <div className="space-y-4">
                    <div className="w-32 h-3 bg-white/5 rounded" />
                    <div className="w-48 h-5 bg-white/5 rounded" />
                    <div className="w-full h-2 bg-white/5 rounded-full" />
                </div>
                <div className="space-y-6 pt-8">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl" />
                            <div className="space-y-2 flex-1">
                                <div className="w-3/4 h-3 bg-white/5 rounded" />
                                <div className="w-1/2 h-2 bg-white/5 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (loading) {
        // Simple heuristic: if we previously saw they were enrolled, or if we want to be dark-first
        const prefDark = localStorage.getItem(`course_enrolled_${id}`);
        return prefDark ? <MasterclassSkeleton /> : <CourseDetailSkeleton />;
    }
    if (!course) return <div className="p-8 text-center text-slate-400 font-bold">Course not found</div>;

    /* ─── PRE-ENROLLMENT ────────────────────────────────── */
    if (!isEnrolled) {
        const lectures = course.lectures || [];
        const chapters = course.chapters || [];
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                {/* Full-bleed hero */}
                <div className="relative h-72 md:h-[420px] overflow-hidden">
                    <SmartImage
                        src={getImgUrl(course.coverImage)}
                        alt={course.title}
                        containerClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/10" />
                    <button onClick={() => navigate(-1)} className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl text-xs font-black hover:bg-white/20 transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur-sm rounded-full text-[10px] font-black text-white tracking-widest uppercase">{course.category}</span>
                            {course.level && <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white/80 uppercase">{course.level}</span>}
                            {course.language && <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white/80 uppercase">{course.language}</span>}
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2 max-w-3xl">{course.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-white/70 text-xs font-bold">
                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{course.enrolledStudents?.length || 0} enrolled</span>
                            <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" />{lectures.length} lectures</span>
                            {course.duration > 0 && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{course.duration}h total</span>}
                            {chapters.length > 0 && <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{chapters.length} chapters</span>}
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Info column */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Instructor */}
                            <div className="bg-white rounded-[24px] p-5 border border-slate-100 flex items-center gap-4">
                                <SmartImage
                                    src={getImgUrl(course.teacher?.avatar)}
                                    alt={course.teacher?.name}
                                    containerClassName="w-14 h-14 rounded-2xl bg-indigo-50 overflow-hidden shrink-0"
                                    fallbackIcon={User}
                                />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                                    <p className="font-black text-slate-900 text-lg leading-tight">{course.teacher?.name || 'Unknown'}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white rounded-[24px] p-6 border border-slate-100">
                                <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-500" />About This Course</h2>
                                <p className="text-slate-600 leading-relaxed">{course.description || 'No description provided.'}</p>
                            </div>

                            {/* Objectives */}
                            {course.objectives?.length > 0 && (
                                <div className="bg-white rounded-[24px] p-6 border border-slate-100">
                                    <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" />What You'll Learn</h2>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {course.objectives.map((o, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle className="w-3 h-3 text-emerald-600" /></div>{o}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Prerequisites */}
                            {course.prerequisites?.length > 0 && (
                                <div className="bg-white rounded-[24px] p-6 border border-slate-100">
                                    <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-amber-500" />Prerequisites</h2>
                                    <ul className="space-y-2">
                                        {course.prerequisites.map((p, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />{p}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Content preview — chapter + lecture list with lock icons */}
                            {(chapters.length > 0 || lectures.length > 0) && (
                                <div className="bg-white rounded-[24px] p-6 border border-slate-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                            <Video className="w-4 h-4 text-indigo-500" />Full Program Curriculum
                                        </h2>
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                                            <Lock className="w-3 h-3" /> Enroll to unlock all
                                        </span>
                                    </div>
                                    <div className="space-y-6">
                                        {chapters.sort((a, b) => (a.order || 0) - (b.order || 0)).map((ch, ci) => {
                                            const chLects = lectures.filter(l => l.chapter?.toString() === ch._id?.toString())
                                                .sort((a, b) => (a.order || 0) - (b.order || 0));
                                            if (chLects.length === 0) return null;
                                            return (
                                                <div key={ch._id} className="space-y-3">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 w-6 h-6 rounded flex items-center justify-center">{ci + 1}</span>
                                                        <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">{ch.title}</h3>
                                                    </div>
                                                    <div className="space-y-1 pl-9">
                                                        {chLects.map((l, li) => (
                                                            <div key={l._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all group border border-transparent hover:border-slate-100">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors" />
                                                                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{l.title}</span>
                                                                </div>
                                                                {l.isPreview ? (
                                                                    <button 
                                                                        onClick={() => setPreviewLecture(l)}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                                                    >
                                                                        <Play className="w-3 h-3" /> Preview
                                                                    </button>
                                                                ) : (
                                                                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* Supplementary Modules */}
                                        {lectures.filter(l => !l.chapter).length > 0 && (
                                            <div className="space-y-3 pt-2">
                                                <div className="flex items-center gap-3 mb-2">
                                                     <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest pl-9">Supplementary Content</h3>
                                                </div>
                                                <div className="space-y-1 pl-9">
                                                    {lectures.filter(l => !l.chapter).sort((a, b) => (a.order || 0) - (b.order || 0)).map((l) => (
                                                        <div key={l._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all group border border-transparent hover:border-slate-100">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors" />
                                                                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{l.title}</span>
                                                            </div>
                                                            {l.isPreview ? (
                                                                <button 
                                                                    onClick={() => setPreviewLecture(l)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                                                >
                                                                    <Play className="w-3 h-3" /> Preview
                                                                </button>
                                                            ) : (
                                                                <Lock className="w-3.5 h-3.5 text-slate-300" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {course.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {course.tags.map((t, i) => <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold">#{t}</span>)}
                                </div>
                            )}
                        </div>

                        {/* Sticky enroll card */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 bg-white rounded-[28px] border border-slate-100 shadow-xl overflow-hidden">
                                <div className="h-44 relative overflow-hidden">
                                    {getImgUrl(course.coverImage)
                                        ? <img src={getImgUrl(course.coverImage)} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center"><BookOpen className="w-12 h-12 text-indigo-300" /></div>}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/50 flex items-center justify-center">
                                            <Play className="w-6 h-6 text-white ml-1" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-slate-900">{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
                                        {course.price === 0 && <span className="text-xs text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-xl">No cost</span>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { icon: Video, label: `${lectures.length} Lectures` },
                                            { icon: Users, label: `${course.enrolledStudents?.length || 0} Students` },
                                            { icon: Clock, label: course.duration > 0 ? `${course.duration}h Total` : 'Self-paced' },
                                            { icon: Globe, label: course.language || 'English' },
                                        ].map(({ icon: Icon, label }) => (
                                            <div key={label} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                                <Icon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                <span className="text-xs font-bold text-slate-600">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleEnroll} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                                        <Play className="w-4 h-4" /> Enroll Now — {course.price > 0 ? `₹${course.price}` : "It's Free"}
                                    </button>
                                    <p className="text-center text-[11px] text-slate-400 font-medium">Lifetime access · All devices</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Preview Modal for un-enrolled students */}
                <AnimatePresence>
                    {previewLecture && (
                        <PreviewModal 
                            lecture={previewLecture} 
                            onClose={() => setPreviewLecture(null)} 
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    /* ─── ENROLLED VIEW (MASTERCLASS WORKSPACE) ────────────────── */
    return (
        <div className="flex flex-col lg:flex-row h-screen lg:h-screen bg-slate-950 overflow-hidden relative">
            {/* Cinematic Main Workspace */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
                {/* Header Bar */}
                <div className="h-16 px-4 sm:px-6 bg-slate-950/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between shrink-0 relative z-20">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <button
                            onClick={() => navigate('/app/learning')}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="h-4 w-px bg-white/10 mx-1 sm:mx-2 hidden sm:block" />
                        <h2 className="text-[11px] sm:text-sm font-black text-white/90 uppercase tracking-[0.1em] sm:tracking-[0.15em] truncate max-w-[150px] sm:max-w-[300px] lg:max-w-none">{course.title}</h2>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className={clsx(
                                "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all",
                                !showSidebar ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                            )}
                        >
                            <MonitorPlay className="w-3.5 h-3.5 sm:w-4 h-4" />
                            <span className="hidden sm:inline">{showSidebar ? 'Hide Curriculum' : 'Show Curriculum'}</span>
                            <span className="sm:hidden">{showSidebar ? 'Hide' : 'Curriculum'}</span>
                        </button>
                    </div>
                </div>

                {/* Video Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar-dark bg-black relative overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {/* Glowing highlight behind player */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 lg:py-12 space-y-4 lg:space-y-10 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={clsx(
                                "z-20 shadow-2xl shadow-black/50 lg:rounded-[40px] overflow-hidden bg-black -mx-4 lg:mx-0",
                                !activeTest ? "sticky top-0 lg:relative" : "relative"
                            )}
                        >
                            {activeTest ? (
                                <TestTakingView 
                                    test={activeTest} 
                                    existingResult={testResults.find(tr => tr.test === activeTest._id)} 
                                    onSubmit={handleTestSubmit} 
                                />
                            ) : (
                                <VideoPlayer lecture={activeLecture} />
                            )}
                        </motion.div>

                        {/* Session Details */}
                        {!activeTest && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 lg:p-10 rounded-3xl lg:rounded-[48px] space-y-4 lg:space-y-8"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 lg:pb-8 border-b border-white/5">
                                <div className="space-y-2 lg:space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">Module Overview</span>
                                        {(() => {
                                            // No live sessions anymore
                                            return null;
                                        })()}
                                    </div>
                                    <h3 className="text-xl lg:text-4xl font-black text-white tracking-tight leading-tight">{activeLecture?.title}</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    {activeLecture?.notesUrl && (
                                        <a
                                            href={activeLecture.notesUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 lg:px-6 py-2.5 lg:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl lg:rounded-2xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-white/5"
                                        >
                                            <BookOpen className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-indigo-400" /> Notes
                                        </a>
                                    )}
                                    <button
                                        onClick={handleMarkComplete}
                                        className={clsx(
                                            "px-5 lg:px-8 py-2.5 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all grow lg:grow-0",
                                            completedLectures.includes(activeLecture?._id)
                                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                : "bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-500"
                                        )}
                                    >
                                        {completedLectures.includes(activeLecture?._id) ? 'Completed ✓' : 'Finish Lesson'}
                                    </button>
                                </div>
                            </div>

                            <div className="text-slate-400 font-medium text-sm lg:text-lg leading-relaxed max-w-4xl">
                                {activeLecture?.description || "In this intensive module, we explore high-level industry patterns and implementation details that will sharpen your professional skills."}
                            </div>
                            <div className="h-10 lg:hidden" />
                        </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Premium Right Sidebar (Curriculum) */}
            <AnimatePresence mode="wait">
                {showSidebar && (
                    <motion.div
                        initial={isMobile ? { y: '100%' } : { width: 0, opacity: 0, x: 20 }}
                        animate={isMobile ? { y: 0 } : { width: 400, opacity: 1, x: 0 }}
                        exit={isMobile ? { y: '100%' } : { width: 0, opacity: 0, x: 20 }}
                        transition={{ 
                            type: isMobile ? "spring" : "tween",
                            damping: 25,
                            stiffness: 200,
                            duration: 0.3 
                        }}
                        className={clsx(
                            "bg-slate-900 border-l border-white/5 flex flex-col shrink-0 overflow-hidden shadow-2xl",
                            isMobile ? "fixed inset-0 z-[100] h-full" : "h-full z-30 relative"
                        )}
                    >
                        {/* Sidebar Header */}
                        <div className="p-6 lg:p-8 pb-4 lg:pb-6 border-b border-white/5 shrink-0 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Course Curriculum</h3>
                                <div className="flex items-center gap-3">
                                    <h4 className="text-lg font-black text-white leading-tight">Masters Program</h4>
                                    <div className={clsx(
                                        "px-3 py-1.5 rounded-xl border-2 transition-all duration-700 flex items-center justify-center min-w-[50px]",
                                        progress === 0
                                            ? "bg-slate-900 text-slate-600 border-slate-800/50"
                                            : progress === 100
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
                                                : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.15)]"
                                    )}>
                                        <span className="text-[11px] font-black tracking-tighter tabular-nums leading-none">
                                            {progress}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {isMobile && (
                                <button
                                    onClick={() => setShowSidebar(false)}
                                    className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="px-6 lg:px-8 py-4 shrink-0">
                            {/* Simple Progress Bar */}
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-50 shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                        </div>

                        {/* Chapters Scrollable */}
                        <div
                            className="flex-1 overflow-y-auto p-4 custom-scrollbar-dark space-y-6 lg:space-y-10 overscroll-contain"
                            style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                            {(course.chapters?.length > 0) ? (
                                course.chapters.sort((a, b) => a.order - b.order).map((ch, ci) => {
                                    const chLects = course.lectures?.filter(l => l.chapter?.toString() === ch._id?.toString()) || [];
                                    const chTests = tests.filter(t => t.chapter?.toString() === ch._id?.toString()) || [];
                                    
                                    if (chLects.length === 0 && chTests.length === 0) return null;
                                    return (
                                        <div key={ch._id} className="space-y-4">
                                            <div className="flex items-center gap-3 px-4">
                                                <span className="text-[10px] font-black text-indigo-500 tabular-nums">{String(ci + 1).padStart(2, '0')}</span>
                                                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{ch.title}</h5>
                                            </div>
                                            <div className="space-y-1">
                                                <LectureList
                                                    lectures={chLects}
                                                    onSelect={(l) => { setActiveTest(null); setActiveLecture(l); }}
                                                    currentId={activeLecture?._id}
                                                    completedIds={completedLectures}
                                                    dark={true}
                                                />
                                                {chTests.map(test => (
                                                    <button
                                                        key={test._id}
                                                        onClick={() => { setActiveLecture(null); setActiveTest(test); }}
                                                        className={clsx(
                                                            "w-full flex items-center gap-4 p-4 rounded-[20px] transition-all border group mt-2",
                                                            activeTest?._id === test._id
                                                                ? "bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                                                : "hover:bg-white/5 border-transparent"
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                                                            activeTest?._id === test._id ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white/5 text-slate-400"
                                                        )}>
                                                            <FileQuestion className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 text-left min-w-0">
                                                            <p className={clsx(
                                                                "text-[14px] font-bold leading-tight mb-1 truncate",
                                                                activeTest?._id === test._id ? "text-white" : "text-white/60 group-hover:text-white"
                                                            )}>
                                                                {test.title}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-black tracking-[0.15em] uppercase text-white/30">
                                                                    MCQ Test
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {testResults.some(tr => tr.test === test._id) && (
                                                            <CheckCircle className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="space-y-1">
                                    <LectureList
                                        lectures={course.lectures || []}
                                        onSelect={(l) => { setActiveTest(null); setActiveLecture(l); }}
                                        currentId={activeLecture?._id}
                                        completedIds={completedLectures}
                                        dark={true}
                                    />
                                    {tests.map((test) => (
                                        <button
                                            key={test._id}
                                            onClick={() => { setActiveLecture(null); setActiveTest(test); }}
                                            className={clsx(
                                                "w-full flex items-center gap-4 p-4 rounded-[20px] transition-all border group mt-2",
                                                activeTest?._id === test._id
                                                    ? "bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                                    : "hover:bg-white/5 border-transparent"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                                                activeTest?._id === test._id ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white/5 text-slate-400"
                                            )}>
                                                <FileQuestion className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <p className={clsx(
                                                    "text-[14px] font-bold leading-tight mb-1 truncate",
                                                    activeTest?._id === test._id ? "text-white" : "text-white/60 group-hover:text-white"
                                                )}>
                                                    {test.title}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black tracking-[0.15em] uppercase text-white/30">
                                                        MCQ Test
                                                    </span>
                                                </div>
                                            </div>
                                            {testResults.some(tr => tr.test === test._id) && (
                                                <CheckCircle className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Uncategorized if any */}
                            {course.lectures?.some(l => !l.chapter) && course.chapters?.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3 px-4">
                                        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Supplementary Modules</h5>
                                    </div>
                                    <div className="space-y-1">
                                        <LectureList
                                            lectures={course.lectures.filter(l => !l.chapter)}
                                            onSelect={(l) => { setActiveTest(null); setActiveLecture(l); }}
                                            currentId={activeLecture?._id}
                                            completedIds={completedLectures}
                                            dark={true}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="h-32 lg:hidden" /> {/* Mobile Spacer */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};




const TeacherDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [newCourse, setNewCourse] = useState({ title: '', description: '', category: 'Technology', price: 0 });
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchTeacherCourses = useCallback(async () => {
        try {
            const res = await axios.get('/courses');
            const allCourses = res.data.data.courses || [];
            const filteredCourses = (user?.role === 'SUPER_ADMIN')
                ? allCourses
                : allCourses.filter(c => (c.teacher?._id || c.teacher) === user?._id);
            setCourses(filteredCourses);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchTeacherCourses();
    }, [fetchTeacherCourses]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/courses', newCourse);
            setShowCreateModal(false);
            setNewCourse({ title: '', description: '', category: 'Technology' });
            fetchTeacherCourses();
        } catch (err) {
            alert("Failed to create course");
        }
    };
    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`/courses/${selectedCourse._id}`, selectedCourse);
            setShowEditModal(false);
            fetchTeacherCourses();
        } catch (err) {
            alert("Failed to update course");
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course and all its lectures?")) return;
        try {
            await axios.delete(`/courses/${id}`);
            fetchTeacherCourses();
        } catch (err) {
            alert("Failed to delete course");
        }
    };

    const TeacherDashboardSkeleton = () => (
        <div className="max-w-6xl mx-auto p-8 animate-pulse space-y-10">
            <div className="flex justify-between items-center">
                <div className="space-y-3">
                    <div className="h-8 w-64 bg-slate-200 rounded" />
                    <div className="h-4 w-48 bg-slate-100 rounded" />
                </div>
                <div className="h-12 w-40 bg-slate-200 rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-80 bg-white rounded-[28px] border border-slate-100" />
                ))}
            </div>
        </div>
    );

    if (loading) return <TeacherDashboardSkeleton />;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-6 md:mb-12 gap-3">
                <div className="min-w-0">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 md:mb-2 tracking-tight">Academy Console</h2>
                    <p className="text-slate-500 font-medium text-sm hidden sm:block">Manage your courses and lectures.</p>
                </div>
                {(user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER' || user?.role === 'COLLEGE_ADMIN') && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-4 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all text-sm shrink-0"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">New Course</span>
                        <span className="sm:hidden">New</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => (
                    <div key={course._id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                        <div className="relative h-40">
                            <img src={course.coverImage} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/20"></div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={(e) => { e.preventDefault(); setSelectedCourse(course); setShowEditModal(true); }}
                                    className="p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); handleDeleteCourse(course._id); }}
                                    className="p-2 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-lg font-black text-slate-900 mb-4">{course.title}</h3>
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center justify-between text-[13px] font-medium text-slate-500">
                                    <span>Students Enrolled</span>
                                    <span className="text-slate-900 font-bold">{course.enrolledStudents?.length || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-[13px] font-medium text-slate-500">
                                    <span>Total Lectures</span>
                                    <span className="text-slate-900 font-bold">{course.lectures?.length || 0}</span>
                                </div>
                            </div>
                            <Link
                                to={`/app/learning/manage/${course._id}`}
                                className="w-full bg-slate-100 text-slate-800 py-3 rounded-2xl font-bold text-sm text-center hover:bg-slate-200 transition-all mt-auto"
                            >
                                Manage Content
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
                        <h2 className="text-2xl font-black mb-6">Launch New Course</h2>
                        <form onSubmit={handleCreateCourse} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Course Title</label>
                                <input
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-medium focus:ring-2 ring-blue-500 transition-all"
                                    placeholder="e.g. Advanced UI/UX Design"
                                    value={newCourse.title}
                                    onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Description</label>
                                <textarea
                                    className="w-full h-32 bg-slate-50 border-none rounded-2xl p-5 font-medium focus:ring-2 ring-blue-500 transition-all resize-none"
                                    placeholder="What will students learn?"
                                    value={newCourse.description}
                                    onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">Create Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && selectedCourse && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
                        <h2 className="text-2xl font-black mb-6">Edit Course</h2>
                        <form onSubmit={handleUpdateCourse} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Course Title</label>
                                <input
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-medium focus:ring-2 ring-blue-500 transition-all"
                                    value={selectedCourse.title}
                                    onChange={e => setSelectedCourse({ ...selectedCourse, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Description</label>
                                <textarea
                                    className="w-full h-32 bg-slate-50 border-none rounded-2xl p-5 font-medium focus:ring-2 ring-blue-500 transition-all resize-none"
                                    value={selectedCourse.description}
                                    onChange={e => setSelectedCourse({ ...selectedCourse, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Category</label>
                                    <input
                                        className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-medium focus:ring-2 ring-blue-500 transition-all"
                                        value={selectedCourse.category}
                                        onChange={e => setSelectedCourse({ ...selectedCourse, category: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Price ($)</label>
                                    <input
                                        type="number"
                                        className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-medium focus:ring-2 ring-blue-500 transition-all"
                                        value={selectedCourse.price}
                                        onChange={e => setSelectedCourse({ ...selectedCourse, price: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ManageLectures = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [newLecture, setNewLecture] = useState({ title: '', description: '', notesUrl: '' });
    const navigate = useNavigate();

    const fetchCourseData = useCallback(async () => {
        try {
            const res = await axios.get(`/courses/${courseId}`);
            setCourse(res.data.data.course);
            setLectures(res.data.data.course.lectures || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourseData();
    }, [fetchCourseData]);

    const handleAddLecture = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/courses/${courseId}/lectures`, newLecture);
            setShowAddModal(false);
            setNewLecture({ title: '', description: '', notesUrl: '' });
            fetchCourseData();
        } catch (err) {
            alert("Failed to add lecture");
        }
    };

    const handleDeleteLecture = async (id) => {
        if (!window.confirm("Delete this lecture?")) return;
        try {
            await axios.delete(`/courses/lectures/${id}`);
            fetchCourseData();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    const handleUpdateLecture = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`/courses/lectures/${selectedLecture._id}`, selectedLecture);
            setShowEditModal(false);
            fetchCourseData();
        } catch (err) {
            alert("Failed to update lecture");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading course management...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <button onClick={() => navigate(user?.role === 'SUPER_ADMIN' ? '/app/admin' : '/app/teacher')} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-5 md:mb-8 hover:text-blue-600">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-12">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-[20px] md:rounded-[28px] overflow-hidden border-4 border-white shadow-xl shrink-0">
                        <img src={course?.coverImage} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-lg md:text-2xl font-black text-slate-900 mb-0.5 md:mb-1 truncate">{course?.title}</h2>
                        <p className="text-slate-500 text-xs md:text-sm font-medium">Lecture Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex-1 md:flex-none bg-blue-600 text-white px-3 sm:px-6 py-3 sm:py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all text-xs sm:text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Lecture
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[24px] sm:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Available Lectures</h3>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{lectures.length} total</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {lectures.map((lecture, idx) => (
                        <div key={lecture._id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors gap-3">
                            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                                <div className="text-slate-300 font-black text-base sm:text-xl w-5 sm:w-6 shrink-0">{idx + 1}</div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 mb-0.5 sm:mb-1 text-sm sm:text-base truncate">{lecture.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600">
                                            {lecture.bunnyVideoId ? (lecture.videoStatus === 'READY' ? 'READY' : lecture.videoStatus || 'RECORDED') : 'NO VIDEO'}
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                                            Added {new Date(lecture.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                <button
                                    onClick={() => { setSelectedLecture(lecture); setShowEditModal(true); }}
                                    className="p-2 sm:p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteLecture(lecture._id)}
                                    className="p-2 sm:p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {lectures.length === 0 && (
                        <div className="p-20 text-center text-slate-400 font-bold">No lectures added yet.</div>
                    )}
                </div>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Video className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Upload videos via Course Management</h4>
                        <p className="text-slate-400 text-sm">Use the admin Course Management page to upload video files to Bunny Stream.</p>
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
                        <h2 className="text-2xl font-black mb-6">Add Lecture</h2>
                        <form onSubmit={handleAddLecture} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Lecture Title</label>
                                <input
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-medium focus:ring-2 ring-blue-500 transition-all"
                                    placeholder="e.g. 1. Introduction to Hooks"
                                    value={newLecture.title}
                                    onChange={e => setNewLecture({ ...newLecture, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Description (Optional)</label>
                                <textarea
                                    className="w-full h-24 bg-slate-50 border-none rounded-2xl p-5 font-medium focus:ring-2 ring-blue-500 transition-all resize-none"
                                    placeholder="Content summary..."
                                    value={newLecture.description}
                                    onChange={e => setNewLecture({ ...newLecture, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Notes URL / PDF Link (Optional)</label>
                                <input
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-medium focus:ring-2 ring-blue-500 transition-all"
                                    placeholder="e.g. https://drive.google.com/..."
                                    value={newLecture.notesUrl}
                                    onChange={e => setNewLecture({ ...newLecture, notesUrl: e.target.value })}
                                />
                                <p className="text-[10px] text-slate-400 mt-2 px-1">Links to PDF or supplementary materials.</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                                <BadgeInfo className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                                    After creating the lecture, upload the video via the Course Management page.
                                </p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">Add Lecture</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && selectedLecture && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
                        <h2 className="text-2xl font-black mb-6">Edit Lecture</h2>
                        <form onSubmit={handleUpdateLecture} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Lecture Title</label>
                                <input
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-medium focus:ring-2 ring-blue-500 transition-all"
                                    value={selectedLecture.title}
                                    onChange={e => setSelectedLecture({ ...selectedLecture, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Description</label>
                                <textarea
                                    className="w-full h-24 bg-slate-50 border-none rounded-2xl p-5 font-medium focus:ring-2 ring-blue-500 transition-all resize-none"
                                    value={selectedLecture.description}
                                    onChange={e => setSelectedLecture({ ...selectedLecture, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Notes URL / PDF Link</label>
                                <input
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-medium focus:ring-2 ring-blue-500 transition-all"
                                    value={selectedLecture.notesUrl || ''}
                                    onChange={e => setSelectedLecture({ ...selectedLecture, notesUrl: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">Update Lecture</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SkillLearning = () => {
    return (
        <Routes>
            <Route index element={<CourseListingPage />} />
            <Route path="course/:id" element={<CourseDetailPage />} />
            { }
            <Route path="teacher" element={<TeacherDashboard />} />
            <Route path="manage/:courseId" element={<ManageLectures />} />
            <Route path="course/:id/payment-verify" element={<PaymentVerify />} />
        </Routes>
    );
};

export default SkillLearning;
