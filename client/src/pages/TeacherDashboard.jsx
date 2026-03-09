import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import {
    BookOpen, Video, FileText, LayoutDashboard, Settings, Globe, Mail,
    MapPin, DollarSign, Calendar, ChevronRight, ArrowUpRight, Edit2,
    Trash2, MoreVertical, Plus, CheckCircle, Clock, Shield, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const SidebarItem = ({ id, label, icon: Icon, activeTab, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={clsx(
            "w-full flex items-center gap-4 px-5 py-4 rounded-[20px] font-black transition-all text-[13px] tracking-wide",
            activeTab === id
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[1.02]"
                : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
        )}
    >
        <Icon className={clsx("w-5 h-5", activeTab === id ? "text-white" : "text-slate-400")} />
        {label}
    </button>
);

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editForm, setEditForm] = useState({ show: false, courseId: '', title: '', description: '', category: '', coverImage: '' });

    const fetchCourses = useCallback(async () => {
        try {
            const res = await axios.get('/courses/my-courses');
            setCourses(res.data.data.courses);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchCourses().finally(() => setLoading(false));
    }, [fetchCourses]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`/courses/${editForm.courseId}`, {
                title: editForm.title,
                description: editForm.description,
                category: editForm.category,
                coverImage: editForm.coverImage
            });
            setEditForm({ show: false, courseId: '', title: '', description: '', category: '', coverImage: '' });
            fetchCourses();
            alert('Course updated successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse">Loading Academy Portal...</p>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Sidebar */}
            <div className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col gap-2 shrink-0 h-screen sticky top-0 overflow-y-auto hidden lg:flex">
                <div className="flex items-center gap-4 px-2 mb-12">
                    <div className="w-11 h-11 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="font-black text-xl tracking-tighter text-slate-900 block leading-none">JobPortal</span>
                        <span className="text-[10px] font-black tracking-[0.2em] text-indigo-500 uppercase mt-1 block">Teacher Academy</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <SidebarItem id="overview" label="DASHBOARD" icon={LayoutDashboard} activeTab={activeTab} onClick={handleTabChange} />
                    <SidebarItem id="courses" label="MY COURSES" icon={Video} activeTab={activeTab} onClick={handleTabChange} />
                </div>

                <div className="mt-auto pt-10">
                    <div className="bg-slate-900 rounded-[24px] p-6 text-white relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="font-black text-sm mb-1 relative z-10">Faculty Status</h4>
                        <div className="flex items-center gap-2 mb-4 relative z-10">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[11px] font-bold text-slate-400 mt-0.5">Online • Teaching</span>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-black transition-all relative z-10"
                        >
                            LOG OUT
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="font-black text-slate-900 text-lg tracking-tight uppercase">
                            {activeTab === 'overview' ? 'Faculty Command Center' : 'Curriculum Management'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block group">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-500" />
                            <input
                                className="h-11 pl-11 pr-4 bg-slate-100 border-none rounded-[16px] text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none w-72 transition-all placeholder:text-slate-400 text-slate-600"
                                placeholder={`Search courses...`}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 uppercase leading-none">{user?.name}</p>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Instructor</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-indigo-600 border-2 border-white shadow-sm overflow-hidden shrink-0">
                                {user?.avatar ? (
                                    <img src={getImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.[0] || 'T'
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-10 flex-1">
                    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {activeTab === 'overview' && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                                            <Video className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{courses.length}</h3>
                                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Active Courses</p>
                                    </div>
                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
                                            <Users className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">
                                            {courses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0)}
                                        </h3>
                                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Total Students</p>
                                    </div>
                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
                                            <Shield className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">Instructor</h3>
                                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Account Type</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h2 className="text-3xl font-black mb-4">Welcome back, Professor!</h2>
                                        <p className="text-slate-400 max-w-lg mb-8">Manage your curriculum and track student progress from your personalized academy portal.</p>
                                        <button
                                            onClick={() => setActiveTab('courses')}
                                            className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase hover:bg-slate-100 transition-all"
                                        >
                                            Manage My Courses
                                        </button>
                                    </div>
                                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px]" />
                                </div>
                            </div>
                        )}

                        {(activeTab === 'courses' || activeTab === 'overview') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(course => (
                                    <div key={course._id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm flex flex-col group">
                                        <div className="h-44 bg-slate-100 relative overflow-hidden shrink-0">
                                            <img src={course.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />
                                            <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-indigo-600 tracking-widest uppercase">
                                                {course.category}
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-1">
                                            <h4 className="font-black text-slate-900 text-lg mb-2 line-clamp-1">{course.title}</h4>
                                            <p className="text-slate-500 text-xs line-clamp-2 mb-6 flex-1">{course.description}</p>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex -space-x-3">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                                                    ))}
                                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                                                        +{course.enrolledStudents?.length || 0}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setEditForm({
                                                        show: true,
                                                        courseId: course._id,
                                                        title: course.title,
                                                        description: course.description,
                                                        category: course.category,
                                                        coverImage: course.coverImage
                                                    })}
                                                    className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Edit Course Modal */}
            {editForm.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setEditForm({ ...editForm, show: false })} />
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Edit Course Content</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Updates live across platform</p>
                            </div>
                            <button onClick={() => setEditForm({ ...editForm, show: false })} className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-2xl border border-slate-100 transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateCourse} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Course Title</label>
                                <input
                                    required
                                    className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[20px] outline-none transition-all font-bold text-slate-600"
                                    value={editForm.title}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[20px] outline-none transition-all font-bold text-slate-600"
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                                    <input
                                        className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[20px] outline-none transition-all font-bold text-slate-600"
                                        value={editForm.category}
                                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cover Image URL</label>
                                    <input
                                        className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[20px] outline-none transition-all font-bold text-slate-600"
                                        value={editForm.coverImage}
                                        onChange={e => setEditForm({ ...editForm, coverImage: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 mt-4">
                                SAVE CURRICULUM UPDATES
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;

const XCircle = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
);

const Users = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
