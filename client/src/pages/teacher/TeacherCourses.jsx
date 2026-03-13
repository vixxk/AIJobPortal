import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { Search, BookOpen, Video, Users, Settings, Globe, EyeOff, Eye, Clock } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const TeacherCourses = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCourses = useCallback(async () => {
        try {
            const res = await axios.get('/courses/my-courses');
            setCourses(res.data.data.courses || []);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchCourses().finally(() => setLoading(false));
    }, [fetchCourses]);

    const filteredCourses = courses.filter(c =>
        c.title?.toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h2 className="font-black text-slate-900 text-xl sm:text-2xl tracking-tight uppercase mb-0.5 sm:mb-1">My Courses</h2>
                    <div className="text-slate-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
                        {loading ? (
                            <Skeleton className="h-4 w-16" />
                        ) : (
                            <>{courses.length} course{courses.length !== 1 ? 's' : ''}</>
                        )} — tap any card to manage
                    </div>
                </div>

                {/* Search */}
                <div className="relative group w-full sm:w-auto">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-500" />
                    <input
                        className="h-11 pl-11 pr-4 bg-slate-100 border-none rounded-[16px] text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none w-full sm:w-64 transition-all placeholder:text-slate-400 text-slate-600"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        disabled={loading}
                    />
                </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-[28px] overflow-hidden border border-slate-100 shadow-sm space-y-4">
                            <Skeleton className="h-44 w-full" />
                            <div className="p-6 space-y-4">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-6 w-12 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-black text-slate-900 text-lg mb-2">No courses found</p>
                    <p className="text-slate-400 text-sm">
                        {searchQuery ? 'Try a different search term.' : 'You have not been assigned any courses yet.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredCourses.map(course => (
                        <div
                            key={course._id}
                            onClick={() => navigate(`/app/teacher/courses/${course._id}`)}
                            className="bg-white rounded-[24px] sm:rounded-[28px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group"
                        >
                            {/* Cover */}
                            <div className="h-44 bg-slate-100 relative overflow-hidden shrink-0">
                                {getImageUrl(course.coverImage)
                                    ? <img src={getImageUrl(course.coverImage)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                                    : <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center"><BookOpen className="w-12 h-12 text-indigo-300" /></div>
                                }
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />

                                {/* Category + Publish Status */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur-sm rounded-full text-[10px] font-black text-white tracking-widest uppercase">
                                        {course.category}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                    {course.isPublished
                                        ? <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-[10px] font-black text-white flex items-center gap-1"><Eye className="w-3 h-3" />Published</span>
                                        : <span className="px-3 py-1 bg-slate-700/80 backdrop-blur-sm rounded-full text-[10px] font-black text-white/70 flex items-center gap-1"><EyeOff className="w-3 h-3" />Draft</span>
                                    }
                                </div>

                                {/* Manage hint on hover */}
                                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="px-5 py-2.5 bg-white rounded-2xl font-black text-indigo-600 text-sm shadow-lg flex items-center gap-2">
                                        <Settings className="w-4 h-4" /> Manage Course
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 flex flex-col flex-1">
                                <h4 className="font-black text-slate-900 text-base mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                                <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{course.description}</p>

                                {/* Stats */}
                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-slate-400 text-[11px] font-bold">
                                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.enrolledStudents?.length || 0}</span>
                                        <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" />{course.lectures?.length || 0} lects</span>
                                        <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.chapters?.length || 0} ch</span>
                                    </div>
                                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        {course.price > 0 ? `₹${course.price}` : 'Free'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherCourses;
