import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { Plus, Trash2, Users, XCircle } from 'lucide-react';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const AdminCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [courseForm, setCourseForm] = useState({ show: false, title: '', description: '', category: '', coverImage: '', teacherId: '' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const courseRes = await axios.get('/admin/courses');
            setCourses(courseRes.data.data.courses || []);

            const teacherRes = await axios.get('/admin/users?role=TEACHER');
            setTeachers(teacherRes.data.data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteCourse = async (id) => {
        if (!confirm('Delete this course?')) return;
        try {
            await axios.delete(`/admin/courses/${id}`);
            fetchData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/courses', {
                title: courseForm.title,
                description: courseForm.description,
                category: courseForm.category,
                coverImage: courseForm.coverImage,
                teacher: courseForm.teacherId
            });
            setCourseForm({ show: false, title: '', description: '', category: '', coverImage: '', teacherId: '' });
            fetchData();
            alert('Course created!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create course');
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-4 lg:space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        className="w-full sm:w-72 h-11 px-4 bg-slate-50 border-none rounded-xl text-[10px] lg:text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setCourseForm({ ...courseForm, show: true })}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                    <Plus className="w-4 h-4" /> CREATE NEW COURSE
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(course => (
                    <div key={course._id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group">
                        <div className="h-44 bg-slate-100 relative overflow-hidden">
                            <img src={course.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-80" />
                            <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-indigo-600 tracking-widest uppercase">
                                {course.category || 'Skill'}
                            </div>
                            <div className="absolute top-6 right-6 flex gap-2">
                                <button onClick={() => handleDeleteCourse(course._id)} className="p-2.5 bg-rose-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 lg:p-8">
                            <h4 className="font-black text-slate-900 text-lg mb-4 line-clamp-1">{course.title}</h4>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-[10px] overflow-hidden shrink-0">
                                        {course.teacher?.avatar ? (
                                            <img src={getImageUrl(course.teacher.avatar)} alt={course.teacher.name} className="w-full h-full object-cover" />
                                        ) : (
                                            course.teacher?.name?.[0] || 'T'
                                        )}
                                    </div>
                                    <span className="text-[11px] font-black text-slate-400 tracking-tight uppercase line-clamp-1">{course.teacher?.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-indigo-600">
                                    <Users className="w-4 h-4" />
                                    <span className="text-[11px] font-black">{course.enrolledStudents?.length || 0}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/app/learning/manage/${course._id}`)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                            >
                                VIEW MANAGEMENT
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {courseForm.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] lg:rounded-[40px] p-8 lg:p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setCourseForm({ ...courseForm, show: false })} className="absolute top-6 right-6 lg:top-8 lg:right-8 text-slate-400 hover:text-slate-900 transition-colors">
                            <XCircle className="w-6 h-6 lg:w-8 lg:h-8" />
                        </button>
                        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter mb-1 lg:mb-2 uppercase">DEPLOY COURSE</h3>
                        <p className="text-slate-400 text-[10px] font-bold mb-6 lg:mb-10 tracking-widest uppercase italic">Initialize Academy Content Node</p>

                        <form onSubmit={handleCreateCourse} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Course title..."
                                    value={courseForm.title}
                                    onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    className="w-full p-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Course description..."
                                    rows={3}
                                    value={courseForm.description}
                                    onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <input
                                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="Skill, AI, etc."
                                        value={courseForm.category}
                                        onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lead Instructor</label>
                                    <select
                                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all"
                                        value={courseForm.teacherId}
                                        onChange={e => setCourseForm({ ...courseForm, teacherId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Teacher</option>
                                        {teachers.map(t => (
                                            <option key={t._id} value={t._id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Asset (Image URL)</label>
                                <input
                                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all"
                                    placeholder="https://images.unsplash.com/..."
                                    value={courseForm.coverImage}
                                    onChange={e => setCourseForm({ ...courseForm, coverImage: e.target.value })}
                                />
                            </div>
                            <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 ring-4 ring-white hover:bg-indigo-700 transition-all active:scale-95">INSTANTIATE COURSE</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourses;
