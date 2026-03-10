import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { Edit2, Search, BookOpen } from 'lucide-react';


const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const XCircle = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
);

const TeacherCourses = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editForm, setEditForm] = useState({
        show: false, courseId: '', title: '', description: '', category: '', coverImage: ''
    });

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

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse">Loading Courses...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="font-black text-slate-900 text-2xl tracking-tight uppercase mb-1">Curriculum Management</h2>
                    <p className="text-slate-400 text-sm font-semibold">{courses.length} course{courses.length !== 1 ? 's' : ''} in your portfolio</p>
                </div>

                {/* Search */}
                <div className="relative group">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-500" />
                    <input
                        className="h-11 pl-11 pr-4 bg-slate-100 border-none rounded-[16px] text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none w-64 transition-all placeholder:text-slate-400 text-slate-600"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-black text-slate-900 text-lg mb-2">No courses found</p>
                    <p className="text-slate-400 text-sm">{searchQuery ? 'Try a different search term.' : 'You have not published any courses yet.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map(course => (
                        <div key={course._id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm flex flex-col group">
                            <div className="h-44 bg-slate-100 relative overflow-hidden shrink-0">
                                <img src={getImageUrl(course.coverImage)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt={course.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />
                                <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-indigo-600 tracking-widest uppercase">
                                    {course.category}
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <h4 className="font-black text-slate-900 text-lg mb-2 line-clamp-1">{course.title}</h4>
                                <p className="text-slate-500 text-xs line-clamp-2 mb-6 flex-1">{course.description}</p>

                                <div className="flex items-center justify-between mt-auto gap-2">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                                        ))}
                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                                            +{course.enrolledStudents?.length || 0}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/app/teacher/courses/${course._id}`)}
                                            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-sm"
                                            title="Manage Course"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                        </button>
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
                        </div>
                    ))}
                </div>
            )}

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

export default TeacherCourses;
