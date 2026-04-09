import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { Search, BookOpen, Video, Users, Settings, Globe, EyeOff, Eye, Clock, Plus, XCircle, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
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
    const [courseForm, setCourseForm] = useState({ show: false, title: '', description: '', category: '', coverImageFile: null, coverImagePreview: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', courseForm.title);
            formData.append('description', courseForm.description);
            formData.append('category', courseForm.category);
            if (courseForm.coverImageFile) {
                formData.append('image', courseForm.coverImageFile);
            }
            await axios.post('/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setCourseForm({ show: false, title: '', description: '', category: '', coverImageFile: null, coverImagePreview: '' });
                fetchCourses();
            }, 2500);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create course');
        } finally {
            if (!showSuccess) setIsSubmitting(false);
        }
    };

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

                <div className="flex flex-col md:flex-row md:items-center gap-4 w-full sm:w-auto">
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
                    <button
                        onClick={() => setCourseForm({ ...courseForm, show: true })}
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shrink-0"
                    >
                        <Plus className="w-4 h-4" /> CREATE COURSE
                    </button>
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
                                    {course.approvalStatus === 'PENDING' && (
                                        <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-sm rounded-full text-[10px] font-black text-white tracking-widest uppercase">
                                            Pending Approval
                                        </span>
                                    )}
                                    {course.approvalStatus === 'REJECTED' && (
                                        <span className="px-3 py-1 bg-rose-500/90 backdrop-blur-sm rounded-full text-[10px] font-black text-white tracking-widest uppercase">
                                            Rejected
                                        </span>
                                    )}
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

            {courseForm.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] lg:rounded-[40px] p-8 lg:p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        {!showSuccess && (
                            <button onClick={() => setCourseForm({ ...courseForm, show: false })} disabled={isSubmitting} className="absolute top-6 right-6 lg:top-8 lg:right-8 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50">
                                <XCircle className="w-6 h-6 lg:w-8 lg:h-8" />
                            </button>
                        )}

                        {showSuccess ? (
                            <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter mb-3 text-center uppercase">Request Sent!</h3>
                                <p className="text-slate-500 text-sm font-medium text-center leading-relaxed">
                                    Your course creation request has been submitted successfully.<br />You'll be notified upon admin approval.
                                </p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter mb-1 lg:mb-2 uppercase">CREATE COURSE</h3>
                                <p className="text-slate-400 text-[10px] font-bold mb-6 lg:mb-10 tracking-widest uppercase italic">Needs Admin Approval</p>

                                <form onSubmit={handleCreateCourse} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                        <input
                                            className="w-full h-14 px-6 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                                            placeholder="Course title..."
                                            value={courseForm.title}
                                            onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                        <textarea
                                            className="w-full p-6 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                                            placeholder="Course description..."
                                            rows={3}
                                            value={courseForm.description}
                                            onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                        <input
                                            className="w-full h-14 px-6 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                                            placeholder="Skill, AI, etc."
                                            value={courseForm.category}
                                            onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Asset (Image)</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                disabled={isSubmitting}
                                                onChange={e => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setCourseForm({ ...courseForm, coverImageFile: file, coverImagePreview: reader.result });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <div className="w-full h-32 bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:bg-slate-50 group-hover:border-indigo-300 transition-all overflow-hidden relative">
                                                {courseForm.coverImagePreview ? (
                                                    <>
                                                        <img src={courseForm.coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Change Image</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all">
                                                            <UploadCloud className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-400">Click or drag banner image</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button disabled={isSubmitting} className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                                        {isSubmitting ? (
                                            <><Loader2 className="w-4 h-4 animate-spin shrink-0" /> <span className="mt-0.5">SENDING REQUEST...</span></>
                                        ) : (
                                            <span className="mt-0.5">REQUEST COURSE CREATION</span>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherCourses;
