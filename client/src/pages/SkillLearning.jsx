import { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import {
    BookOpen, Play, Video, Plus, Edit, Trash2,
    ChevronRight, BadgeInfo, Clock, Users,
    Globe, Radio, CheckCircle, ExternalLink,
    ArrowLeft, MonitorPlay, Settings, Key, Lock
} from 'lucide-react';
import { useCallback } from 'react';
import clsx from 'clsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const getImgUrl = (p) => {
    if (!p) return null;
    if (p.startsWith('http')) return p;
    return `${API_BASE}/${p.replace(/^\//, '')}`;
};

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
            {getImgUrl(course.coverImage)
                ? <img src={getImgUrl(course.coverImage)} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                : <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center"><BookOpen className="w-12 h-12 text-indigo-300" /></div>
            }
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
                <div className="w-6 h-6 rounded-full bg-white/20 border border-white/40 overflow-hidden shrink-0">
                    {course.teacher?.avatar
                        ? <img src={getImgUrl(course.teacher.avatar)} className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-[9px] font-black text-white">{course.teacher?.name?.[0] || 'T'}</span>
                    }
                </div>
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


const LectureList = ({ lectures, onSelect, currentId }) => (
    <div className="space-y-2">
        {lectures.map((lecture, index) => (
            <button
                key={lecture._id}
                onClick={() => onSelect(lecture)}
                className={clsx(
                    "w-full flex items-center gap-3 p-4 rounded-2xl transition-all border",
                    currentId === lecture._id
                        ? "bg-blue-50 border-blue-200 shadow-sm"
                        : "hover:bg-slate-50 border-transparent"
                )}
            >
                <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    lecture.type === 'LIVE' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                )}>
                    {lecture.type === 'LIVE' ? <Radio className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </div>
                <div className="flex-1 text-left">
                    <p className={clsx(
                        "text-[14px] font-bold leading-tight mb-0.5",
                        currentId === lecture._id ? "text-blue-600" : "text-slate-800"
                    )}>
                        {index + 1}. {lecture.title}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className={clsx(
                            "text-[10px] font-black tracking-wider uppercase",
                            lecture.type === 'LIVE' ? "text-red-500" : "text-slate-400"
                        )}>
                            {lecture.type === 'LIVE' ? '🔴 Live Class' : 'Recorded'}
                        </span>
                        {lecture.status === 'LIVE' && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md text-[9px] font-bold animate-pulse">
                                NOW LIVE
                            </span>
                        )}
                    </div>
                </div>
                {lecture.status === 'ENDED' && (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                )}
            </button>
        ))}
    </div>
);

const VideoPlayer = ({ lecture }) => {
    if (!lecture) return (
        <div className="aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white p-8">
            <MonitorPlay className="w-16 h-16 text-slate-700 mb-4" />
            <p className="text-slate-400 font-bold">Select a lecture to start watching</p>
        </div>
    );
    const videoId = lecture.videoIdentifier || "";
    const embedUrl = videoId.startsWith('http')
        ? videoId
        : `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;

    return (
        <div className="w-full">
            <div className="aspect-video bg-black rounded-[32px] overflow-hidden shadow-2xl relative">
                <iframe
                    src={embedUrl}
                    className="w-full h-full border-0"
                    title={lecture.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>

                {lecture.status === 'LIVE' && (
                    <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-full text-[11px] font-black tracking-widest uppercase shadow-lg shadow-red-900/40">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                    </div>
                )}
            </div>
            <div className="mt-8">
                <h1 className="text-2xl font-black text-slate-900 mb-2">{lecture.title}</h1>
                <p className="text-slate-500 leading-relaxed font-medium">{lecture.description || "No description provided for this lecture."}</p>
            </div>
        </div>
    );
};
const CourseListingPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
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

    // Filtering
    const filtered = courses.filter(c => {
        const q = search.toLowerCase();
        const matchSearch = !q || c.title?.toLowerCase().includes(q)
            || c.description?.toLowerCase().includes(q)
            || c.teacher?.name?.toLowerCase().includes(q)
            || c.tags?.some(t => t.toLowerCase().includes(q));
        const matchCat = activeCategory === 'All' || c.category === activeCategory;
        return matchSearch && matchCat;
    });

    // Enrolled IDs from user (backend sends isEnrolled per course on getCourse, but listing may not)
    // We'll mark enrolled if user._id appears in enrolledStudents
    const userId = user?._id;
    const isEnrolled = (course) =>
        Array.isArray(course.enrolledStudents) &&
        course.enrolledStudents.some(s => (s._id || s) === userId);

    const enrolledCount = courses.filter(isEnrolled).length;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* ── Hero / Search Strip */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-4 pt-10 pb-16">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs font-black tracking-widest uppercase mb-5">
                        {courses.length} courses available
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
                        Expand Your Skills
                    </h1>
                    <p className="text-indigo-200 font-medium text-base md:text-lg mb-8">
                        Join live classes and watch expert-led lectures at your own pace.
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
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'indigo' },
                        { label: 'Enrolled', value: enrolledCount, icon: CheckCircle, color: 'emerald' },
                        { label: 'Available', value: courses.length - enrolledCount, icon: Play, color: 'violet' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4`}>
                            <div className={`w-10 h-10 bg-${color}-50 rounded-xl flex items-center justify-center shrink-0`}>
                                <Icon className={`w-5 h-5 text-${color}-500`} />
                            </div>
                            <div>
                                <p className={`text-xl font-black text-${color}-600`}>{value}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
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
                    <div className="mb-8 p-5 bg-slate-900 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Settings className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-black text-sm">Management Console</p>
                                <p className="text-slate-400 text-xs font-medium">Manage your courses, chapters and lectures</p>
                            </div>
                        </div>
                        <Link to="/app/teacher" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-500 transition-all">
                            Open Console
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
                    {(search || activeCategory !== 'All') && (
                        <button
                            onClick={() => { setSearch(''); setActiveCategory('All'); }}
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
    const [isEnrolled, setIsEnrolled] = useState(false);
    const navigate = useNavigate();

    const fetchCourse = useCallback(async () => {
        try {
            const res = await axios.get(`/courses/${id}`);
            setCourse(res.data.data.course);
            setIsEnrolled(res.data.data.isEnrolled);
            if (res.data.data.course.lectures?.length > 0)
                setActiveLecture(res.data.data.course.lectures[0]);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [id]);

    useEffect(() => { fetchCourse(); }, [fetchCourse]);

    const handleEnroll = async () => {
        try { await axios.post(`/courses/${id}/enroll`); setIsEnrolled(true); }
        catch { alert('Failed to enroll'); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Loading Course</p>
            </div>
        </div>
    );
    if (!course) return <div className="p-8 text-center text-slate-400 font-bold">Course not found</div>;

    /* ─── PRE-ENROLLMENT ────────────────────────────────── */
    if (!isEnrolled) {
        const lectures = course.lectures || [];
        const chapters = course.chapters || [];
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                {/* Full-bleed hero */}
                <div className="relative h-72 md:h-[420px] overflow-hidden">
                    {getImgUrl(course.coverImage)
                        ? <img src={getImgUrl(course.coverImage)} className="w-full h-full object-cover" alt={course.title} />
                        : <div className="w-full h-full bg-gradient-to-br from-indigo-800 to-violet-900" />
                    }
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
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 overflow-hidden shrink-0 flex items-center justify-center">
                                    {getImgUrl(course.teacher?.avatar)
                                        ? <img src={getImgUrl(course.teacher.avatar)} className="w-full h-full object-cover" />
                                        : <span className="text-xl font-black text-indigo-400">{course.teacher?.name?.[0] || 'T'}</span>}
                                </div>
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

                            {/* Content preview — chapter names + counts only, individual lectures hidden */}
                            {(chapters.length > 0 || lectures.filter(l => !l.chapter).length > 0) && (
                                <div className="bg-white rounded-[24px] p-6 border border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                            <Video className="w-4 h-4 text-indigo-500" />Course Content
                                        </h2>
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                                            <Lock className="w-3 h-3" /> Enroll to unlock
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {chapters.sort((a, b) => a.order - b.order).map((ch, ci) => {
                                            const n = lectures.filter(l => l.chapter?.toString() === ch._id?.toString()).length;
                                            return (
                                                <div key={ch._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                                    <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center text-xs font-black text-indigo-600 shrink-0">{ci + 1}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-slate-900 text-sm truncate">{ch.title}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{n} lecture{n !== 1 ? 's' : ''}</p>
                                                    </div>
                                                    <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                                </div>
                                            );
                                        })}
                                        {/* Uncategorized lectures count — no titles revealed */}
                                        {(() => {
                                            const un = lectures.filter(l => !l.chapter).length;
                                            return un > 0 ? (
                                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                                    <div className="w-8 h-8 bg-slate-200 rounded-xl flex items-center justify-center shrink-0"><Video className="w-4 h-4 text-slate-400" /></div>
                                                    <div className="flex-1">
                                                        <p className="font-black text-slate-700 text-sm">Additional Content</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{un} lecture{un !== 1 ? 's' : ''}</p>
                                                    </div>
                                                    <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                                </div>
                                            ) : null;
                                        })()}
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
            </div>
        );
    }

    /* ─── ENROLLED / PLAYER VIEW ────────────────────────── */
    const chapters2 = course.chapters || [];
    const lectures2 = course.lectures || [];
    const lecturesForChapter = (chId) => lectures2.filter(l => l.chapter?.toString() === chId?.toString());
    const uncategorized = lectures2.filter(l => !l.chapter);

    return (
        <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
            {/* Top bar */}
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between shrink-0 z-40">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" /> All Courses
                </button>
                <div className="flex items-center gap-2 max-w-[280px]">
                    <span className="text-slate-500 text-xs font-bold hidden md:block shrink-0">Watching:</span>
                    <span className="text-white text-sm font-black truncate">{activeLecture?.title || course.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Enrolled</span>
                </div>
            </div>

            {/* Main flex */}
            <div className="flex flex-col lg:flex-row flex-1 min-h-0">
                {/* Player */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900">
                    <VideoPlayer lecture={activeLecture} />
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-[380px] bg-white border-l border-slate-100 flex flex-col shrink-0 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 shrink-0">
                        <h3 className="font-black text-slate-900">Course Content</h3>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">{chapters2.length} chapters · {lectures2.length} lectures</p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {chapters2.sort((a, b) => a.order - b.order).map((ch, ci) => {
                            const chLects = lecturesForChapter(ch._id);
                            return (
                                <div key={ch._id}>
                                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3 sticky top-0 z-10">
                                        <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-[10px] font-black text-indigo-600 shrink-0">{ci + 1}</div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-800 truncate">{ch.title}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">{chLects.length} lectures</p>
                                        </div>
                                    </div>
                                    <LectureList lectures={chLects} onSelect={setActiveLecture} currentId={activeLecture?._id} />
                                </div>
                            );
                        })}
                        {uncategorized.length > 0 && (
                            <div>
                                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Other Lectures</p>
                                </div>
                                <LectureList lectures={uncategorized} onSelect={setActiveLecture} currentId={activeLecture?._id} />
                            </div>
                        )}
                        {lectures2.length === 0 && (
                            <div className="p-10 text-center">
                                <Video className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm font-bold">No lectures yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
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

    if (loading) return <div className="p-8 text-center font-bold text-slate-400">Loading your courses...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Academy Console</h2>
                    <p className="text-slate-500 font-medium">Manage your courses, lectures and live streams.</p>
                </div>
                {(user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER' || user?.role === 'COLLEGE_ADMIN') && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        New Course
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
    const [newLecture, setNewLecture] = useState({ title: '', type: 'RECORDED', videoIdentifier: '', description: '' });
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
            setNewLecture({ title: '', type: 'RECORDED', videoIdentifier: '', description: '' });
            fetchCourseData();
        } catch (err) {
            alert("Failed to add lecture");
        }
    };

    const handleEndLive = async (id) => {
        try {
            await axios.patch(`/courses/lectures/${id}`, {
                status: 'ENDED',
                type: 'RECORDED'
            });
            fetchCourseData();
        } catch (err) {
            alert("Failed to end live class");
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

    const handleStartLive = async () => {
        try {
            await axios.post(`/courses/${courseId}/lectures`, {
                title: `Live Class - ${new Date().toLocaleDateString()}`,
                type: 'LIVE',
                status: 'LIVE',
                videoIdentifier: '',
                description: 'Join the live class now!'
            });
            alert("Live class entry created! Start your streaming software now.");
            fetchCourseData();
        } catch (err) {
            alert("Failed to start live class");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading course management...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <button onClick={() => navigate(user?.role === 'SUPER_ADMIN' ? '/app/admin' : '/app/teacher')} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-8 hover:text-blue-600">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[28px] overflow-hidden border-4 border-white shadow-xl">
                        <img src={course?.coverImage} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-1">{course?.title}</h2>
                        <p className="text-slate-500 text-sm font-medium">Lecture Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleStartLive}
                        className="bg-red-50 text-red-600 px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 border border-red-100 hover:bg-red-100 transition-all text-sm"
                    >
                        <Radio className="w-4 h-4" /> Start Live Class
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Recorded Lecture
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Available Lectures</h3>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{lectures.length} Total items</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {lectures.map((lecture, idx) => (
                        <div key={lecture._id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-5">
                                <div className="text-slate-300 font-black text-xl w-6">{idx + 1}</div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">{lecture.title}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className={clsx(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-md",
                                            lecture.type === 'LIVE' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                        )}>
                                            {lecture.type}
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            Added {new Date(lecture.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {lecture.status === 'LIVE' && (
                                    <button
                                        onClick={() => handleEndLive(lecture._id)}
                                        className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[10px] font-bold hover:bg-red-700 transition-all"
                                    >
                                        Stop Live
                                    </button>
                                )}
                                <button
                                    onClick={() => { setSelectedLecture(lecture); setShowEditModal(true); }}
                                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteLecture(lecture._id)}
                                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {lectures.length === 0 && (
                        <div className="p-20 text-center text-slate-400 font-bold">No lectures added yet.</div>
                    )}
                </div>
            </div>

            { }
            <div className="mt-12 p-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Key className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Streaming Setup Required?</h4>
                        <p className="text-slate-400 text-sm">Configure your streaming software for live sessions.</p>
                    </div>
                </div>
                <Link to="/app/learning/onboarding" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm">View One-Time Setup</Link>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
                        <h2 className="text-2xl font-black mb-6">Add Recorded Lecture</h2>
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
                                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">YouTube Video ID</label>
                                <input
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-medium focus:ring-2 ring-blue-500 transition-all"
                                    placeholder="e.g. dQw4w9WgXcQ"
                                    value={newLecture.videoIdentifier}
                                    onChange={e => setNewLecture({ ...newLecture, videoIdentifier: e.target.value })}
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-2 px-1">Copy the ID from your YouTube video URL.</p>
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
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">Publish Lecture</button>
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
                                <label className="block text-sm font-bold text-slate-700 mb-2 px-1">YouTube Video ID</label>
                                <input
                                    className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 font-medium focus:ring-2 ring-blue-500 transition-all"
                                    value={selectedLecture.videoIdentifier}
                                    onChange={e => setSelectedLecture({ ...selectedLecture, videoIdentifier: e.target.value })}
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

const TeacherOnboarding = () => {
    const [streamKey] = useState(() => "live_user_" + Math.random().toString(36).substring(7));
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-6 hover:text-blue-600">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-2xl">
                <h1 className="text-3xl font-black text-slate-900 mb-8">One-Time Streaming Setup</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="flex gap-5">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 font-black">1</div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-1">Install Software</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">Download and install <a href="https://obsproject.com/" target="_blank" className="text-blue-600 underline">OBS Studio</a> or any RTMP-capable streaming software.</p>
                            </div>
                        </div>
                        <div className="flex gap-5">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 font-black">2</div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-1">Configure OBS</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">Go to <strong>Settings → Stream</strong>. Select Service: <strong>Custom</strong>.</p>
                            </div>
                        </div>
                        <div className="flex gap-5">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 font-black">3</div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-1">Enter Server Details</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">Copy the Server URL and Stream Key below into your software.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Stream Server</label>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-600 font-mono text-xs flex justify-between items-center">
                                <span>rtmp://your-video-platform.com/live</span>
                                <ExternalLink className="w-4 h-4 text-slate-300" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Your Personal Stream Key</label>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-900 font-mono text-xs flex justify-between items-center">
                                <span>{streamKey}</span>
                                <button onClick={() => { navigator.clipboard.writeText(streamKey); alert("Copied!"); }} className="text-blue-600 font-bold hover:underline">Copy</button>
                            </div>
                        </div>
                        <div className="pt-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <p className="text-[12px] font-medium text-blue-700 leading-relaxed italic">
                                "After this setup, simply click 'Start Streaming' in OBS and 'Start Live Class' on our website to begin your session."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
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
            <Route path="onboarding" element={<TeacherOnboarding />} />
        </Routes>
    );
};

export default SkillLearning;
