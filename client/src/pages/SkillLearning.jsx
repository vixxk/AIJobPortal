import { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import {
    BookOpen, Play, Video, Plus, Edit, Trash2,
    ChevronRight, BadgeInfo, Clock, Users,
    Globe, Radio, CheckCircle, ExternalLink,
    ArrowLeft, MonitorPlay, Settings, Key
} from 'lucide-react';
import { useCallback } from 'react';
import clsx from 'clsx';

const CourseCard = ({ course }) => (
    <Link
        to={`/app/learning/course/${course._id}`}
        className="bg-white rounded-[24px] overflow-hidden border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group"
    >
        <div className="relative h-48 overflow-hidden">
            <img
                src={course.coverImage}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[12px] font-bold text-blue-600 shadow-sm">
                    {course.category}
                </span>
            </div>
        </div>
        <div className="p-6">
            <h3 className="text-[17px] font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {course.title}
            </h3>
            <div className="flex items-center gap-4 text-slate-500 text-[13px] font-medium">
                <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.enrolledStudents?.length || 0} Students</span>
                </div>
                <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lectures?.length || 0} Lects</span>
                </div>
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
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
    const { user } = useAuth();

    const fetchCourses = useCallback(async () => {
        try {
            const res = await axios.get('/courses');
            setCourses(res.data.data.courses);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    if (loading) return <div className="p-8 text-center font-bold text-slate-400">Loading courses...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Expand Your Skills</h2>
                    <p className="text-slate-500 font-medium text-[15px]">Join live classes and watch expert-led lectures.</p>
                </div>
                {(user?.role === 'TEACHER' || user?.role === 'COLLEGE_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <Link
                        to="/app/teacher"
                        className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:scale-105 transition-all text-sm"
                    >
                        <Settings className="w-4 h-4" />
                        Management Console
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => <CourseCard key={course._id} course={course} />)}
                {courses.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                        <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold">No courses available yet.</p>
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
            if (res.data.data.course.lectures?.length > 0) {
                setActiveLecture(res.data.data.course.lectures[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    const handleEnroll = async () => {
        try {
            await axios.post(`/courses/${id}/enroll`);
            setIsEnrolled(true);
        } catch (err) {
            alert("Failed to enroll");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400 font-bold">Loading course details...</div>;
    if (!course) return <div className="p-8 text-center">Course not found</div>;

    if (!isEnrolled) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-6 hover:text-blue-600">
                    <ArrowLeft className="w-4 h-4" /> Back to Courses
                </button>
                <div className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-2xl">
                    <div className="h-64 md:h-96 relative">
                        <img src={course.coverImage} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        <div className="absolute bottom-10 left-10 text-white">
                            <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold mb-4 inline-block">{course.category}</span>
                            <h1 className="text-4xl font-black mb-2">{course.title}</h1>
                            <p className="text-white/80 font-medium">Taught by {course.teacher?.name}</p>
                        </div>
                    </div>
                    <div className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-bold mb-4">About this course</h3>
                                <p className="text-slate-600 leading-relaxed mb-8">{course.description}</p>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                <p className="text-3xl font-black text-slate-900 mb-6">{course.price === 0 ? "Free" : `$${course.price}`}</p>
                                <button
                                    onClick={handleEnroll}
                                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Unlock Course Now
                                </button>
                                <p className="text-[11px] text-slate-400 text-center mt-4 font-medium uppercase tracking-wider">Lifetime Access Included</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-[1400px] mx-auto p-4 md:p-8 h-full">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-blue-600">
                        <ArrowLeft className="w-4 h-4" /> Course Overview
                    </button>
                    <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                        <span className="text-slate-400 text-xs font-bold uppercase">You are watching:</span>
                        <span className="text-blue-600 text-sm font-black">{course.title}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        <VideoPlayer lecture={activeLecture} />
                    </div>
                    <div className="lg:col-span-4 bg-white rounded-[32px] p-6 border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[800px]">
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Course Content</h3>
                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[11px] font-bold">
                                {course.lectures?.length || 0} Lectures
                            </span>
                        </div>
                        <div className="overflow-y-auto pr-2 custom-scrollbar">
                            <LectureList
                                lectures={course.lectures || []}
                                onSelect={setActiveLecture}
                                currentId={activeLecture?._id}
                            />
                        </div>
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
