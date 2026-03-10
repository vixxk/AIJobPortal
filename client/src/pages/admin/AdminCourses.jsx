import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { Plus, Trash2, Users, XCircle, UploadCloud } from 'lucide-react';

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
    const [courseForm, setCourseForm] = useState({ show: false, title: '', description: '', category: '', coverImageFile: null, coverImagePreview: '', teacherId: '' });

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
            const formData = new FormData();
            formData.append('title', courseForm.title);
            formData.append('description', courseForm.description);
            formData.append('category', courseForm.category);

            // Only append teacher if explicitly selected by the admin.
            // When an admin selects a teacher from the dropdown, it populates `teacherId`.
            if (courseForm.teacherId) {
                formData.append('teacher', courseForm.teacherId);
            }

            if (courseForm.coverImageFile) {
                formData.append('image', courseForm.coverImageFile);
            }

            await axios.post('/courses', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setCourseForm({ show: false, title: '', description: '', category: '', coverImageFile: null, coverImagePreview: '', teacherId: '' });
            fetchData();
            alert('Course created!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create course');
        }
    };

    if (loading) return null;

    return (
        <>
            <div className="space-y-4 lg:space-y-8 animate-in fade-in duration-500">
                <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-3 mr-4">
                            <span className="w-3 h-3 bg-indigo-600 rounded-full" />
                            <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm whitespace-nowrap">Course Registry</h3>
                            <div className="flex items-center gap-2.5 px-3 py-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full shadow-lg shadow-amber-100 animate-in zoom-in-95 duration-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                                <span className="text-[12px] font-black text-white tracking-[0.05em] uppercase">
                                    {courses.length} <span className="text-amber-100/60 font-medium text-[10px] lowercase italic ml-0.5 tracking-normal">active</span>
                                </span>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title..."
                            className="w-full sm:w-72 h-11 px-6 bg-slate-100 border border-slate-200 rounded-2xl text-[10px] lg:text-xs font-bold focus:ring-2 ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 text-slate-700"
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
                                <img src={getImageUrl(course.coverImage)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
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
                                    onClick={() => navigate(`/app/admin/courses/${course._id}`)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                                >
                                    VIEW MANAGEMENT
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
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
                                    className="w-full h-14 px-6 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                                    placeholder="Course title..."
                                    value={courseForm.title}
                                    onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                                    required
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
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <input
                                        className="w-full h-14 px-6 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/30 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                                        placeholder="Skill, AI, etc."
                                        value={courseForm.category}
                                        onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lead Instructor</label>
                                    <select
                                        className="w-full h-14 px-6 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/30 outline-none transition-all text-slate-700"
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
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Asset (Image)</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
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
                            <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">INSTANTIATE COURSE</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminCourses;
