import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import Skeleton from '../../components/ui/Skeleton';
import { Video, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Users = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

const TeacherOverview = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);

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

    if (loading) return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-5 w-48" />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-44 w-full rounded-[32px]" />
                ))}
            </div>

            {/* Welcome banner skeleton */}
            <Skeleton className="h-64 w-full rounded-[40px]" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div>
                <h2 className="font-black text-slate-900 text-2xl tracking-tight uppercase mb-1">Faculty Command Center</h2>
                <p className="text-slate-400 text-sm font-semibold">Your teacher dashboard overview</p>
            </div>

            {/* Stats Grid */}
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

            {/* Welcome Banner */}
            <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-4">Welcome back, {user?.name || 'Professor'}!</h2>
                    <p className="text-slate-400 max-w-lg mb-8">Manage your curriculum and track student progress from your personalized academy portal.</p>
                    <button
                        onClick={() => navigate('/app/teacher/courses')}
                        className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase hover:bg-slate-100 transition-all"
                    >
                        Manage My Courses
                    </button>
                </div>
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px]" />
            </div>
        </div>
    );
};

export default TeacherOverview;
