import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import {
    Shield, Users, Briefcase, Building2, CheckCircle, XCircle,
    AlertTriangle, Activity, Clock, RefreshCw, GraduationCap, UserX,
    BarChart3, TrendingUp, Search, Filter, MoreVertical, Edit2, Trash2,
    BookOpen, Video, FileText, LayoutDashboard, Settings, Globe, Mail,
    MapPin, IndianRupee, Calendar, ChevronRight, ArrowUpRight, Ban, Plus
} from 'lucide-react';
import clsx from 'clsx';
import AdminPayments from './admin/AdminPayments';

const ROLE_CONFIG = {
    STUDENT: { label: 'Student', color: 'blue', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    RECRUITER: { label: 'Recruiter', icon: Briefcase, color: 'violet', gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600' },
    COLLEGE_ADMIN: { label: 'College', icon: Building2, color: 'emerald', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    TEACHER: { label: 'Teacher', icon: GraduationCap, color: 'amber', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-600' },
    SUPER_ADMIN: { label: 'Admin', icon: Shield, color: 'rose', gradient: 'from-rose-500 to-red-600', bg: 'bg-red-50', text: 'text-red-600' }
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

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        users: [],
        students: [],
        recruiters: [],
        teachers: [],
        jobs: [],
        courses: [],
        applications: [],
        competitions: []
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [teacherForm, setTeacherForm] = useState({ show: false, name: '', email: '', password: '' });
    const [courseForm, setCourseForm] = useState({ show: false, title: '', description: '', category: '', coverImage: '', teacherId: '' });

    const fetchTabData = useCallback(async (tab) => {
        try {
            let endpoint = '';
            if (tab === 'users') endpoint = '/admin/users';
            else if (tab === 'students') endpoint = '/admin/users?role=STUDENT';
            else if (tab === 'recruiters') endpoint = '/admin/users?role=RECRUITER';
            else if (tab === 'teachers') endpoint = '/admin/users?role=TEACHER';
            else if (tab === 'jobs') endpoint = '/admin/jobs';
            else if (tab === 'courses') endpoint = '/admin/courses';
            else if (tab === 'applications') endpoint = '/admin/applications';
            else if (tab === 'competitions') endpoint = '/admin/competitions';

            if (!endpoint) return;
            const res = await axios.get(endpoint);
            // Handle specific user roles which use the 'users' key in res.data.data
            const dataKey = ['students', 'recruiters', 'teachers'].includes(tab) ? 'users' : tab;
            setData(prev => ({ ...prev, [tab]: res.data.data[dataKey] || [] }));
        } catch (err) {
            console.error(err);
        }
    }, [setData]);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/admin/analytics');
            setStats(res.data.data.analytics);
            fetchTabData('users');
            fetchTabData('teachers');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [fetchTabData]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab !== 'overview') fetchTabData(tab);
    };

    const handleUserAction = async (userId, action) => {
        try {
            if (action === 'approve') await axios.patch(`/admin/users/${userId}/approval`, { action: 'approve' });
            else if (action === 'reject') await axios.patch(`/admin/users/${userId}/approval`, { action: 'reject' });
            else if (action === 'ban') await axios.patch(`/admin/users/${userId}/ban`);
            else if (action === 'delete') await axios.delete(`/admin/users/${userId}`);

            if (['students', 'recruiters', 'teachers'].includes(activeTab)) {
                fetchTabData(activeTab);
            } else {
                fetchTabData('users');
            }
            const res = await axios.get('/admin/analytics');
            setStats(res.data.data.analytics);
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDeleteEntity = async (type, id) => {
        if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
        try {
            let endpoint = '';
            if (type === 'job') endpoint = `/admin/jobs/${id}`;
            else if (type === 'course') endpoint = `/admin/courses/${id}`;
            else if (type === 'competition') endpoint = `/admin/competitions/${id}`;

            await axios.delete(endpoint);
            const tabKey = type === 'job' ? 'jobs' : type === 'course' ? 'courses' : 'competitions';
            fetchTabData(tabKey);
        } catch {
            alert('Delete failed');
        }
    };

    const handleApproveCourse = async (id) => {
        if (!confirm('Approve this course to be published?')) return;
        try {
            await axios.patch(`/admin/courses/${id}`, { approvalStatus: 'APPROVED' });
            fetchTabData('courses');
        } catch (err) {
            alert('Failed to approve course');
        }
    };

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/admin/teachers', {
                name: teacherForm.name,
                email: teacherForm.email,
                password: teacherForm.password
            });
            setTeacherForm({ show: false, name: '', email: '', password: '' });
            fetchTabData('users');
            alert('Teacher account created successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create teacher');
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
            fetchTabData('courses');
            alert('Course created successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create course');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse">Initializing Command Center...</p>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <div className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col gap-2 shrink-0 h-screen sticky top-0 overflow-y-auto hidden lg:flex">
                <div className="flex items-center gap-4 px-2 mb-12">
                    <div className="w-11 h-11 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3 group-hover:rotate-0 transition-transform">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="font-black text-xl tracking-tighter text-slate-900 block leading-none">Hyrego</span>
                        <span className="text-[10px] font-black tracking-[0.2em] text-indigo-500 uppercase mt-1 block">Authority</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <SidebarItem id="overview" label="DASHBOARD" icon={LayoutDashboard} activeTab={activeTab} onClick={handleTabChange} />
                    <div className="h-px bg-slate-100 my-4 mx-2" />
                    <div className="px-5 mb-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Management</span></div>
                    <SidebarItem id="students" label="STUDENTS" icon={Users} activeTab={activeTab} onClick={handleTabChange} />
                    <SidebarItem id="recruiters" label="RECRUITERS" icon={Building2} activeTab={activeTab} onClick={handleTabChange} />
                    <SidebarItem id="teachers" label="TEACHERS" icon={GraduationCap} activeTab={activeTab} onClick={handleTabChange} />

                    <div className="h-px bg-slate-100 my-4 mx-2" />
                    <div className="px-5 mb-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resources</span></div>
                    <SidebarItem id="jobs" label="JOB LISTINGS" icon={Briefcase} activeTab={activeTab} onClick={handleTabChange} />
                    <SidebarItem id="courses" label="ACADEMY CONTENT" icon={BookOpen} activeTab={activeTab} onClick={handleTabChange} />
                    <SidebarItem id="applications" label="APPLICATIONS" icon={FileText} activeTab={activeTab} onClick={handleTabChange} />
                    <SidebarItem id="competitions" label="COMPETITIONS" icon={Globe} activeTab={activeTab} onClick={handleTabChange} />

                    <div className="h-px bg-slate-100 my-4 mx-2" />
                    <div className="px-5 mb-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finance</span></div>
                    <SidebarItem id="payments" label="PAYMENTS & ORDERS" icon={IndianRupee} activeTab={activeTab} onClick={handleTabChange} />
                </div>

                <div className="mt-auto pt-10">
                    <div className="bg-slate-900 rounded-[24px] p-6 text-white relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="font-black text-sm mb-1 relative z-10">Platform Status</h4>
                        <div className="flex items-center gap-2 mb-4 relative z-10">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[11px] font-bold text-slate-400 mt-0.5">Systems Online</span>
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

            <div className="flex-1 min-w-0 flex flex-col">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="font-black text-slate-900 text-lg tracking-tight uppercase">
                            {activeTab === 'overview' ? 'Administration Overview' : `${activeTab} Control`}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block group">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-500" />
                            <input
                                className="h-11 pl-11 pr-4 bg-slate-100 border-none rounded-[16px] text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none w-72 transition-all placeholder:text-slate-400 text-slate-600"
                                placeholder={`Global search for ${activeTab}...`}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-indigo-600 border-2 border-white shadow-sm">
                            SA
                        </div>
                    </div>
                </header>

                <main className="p-10 flex-1">
                    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {activeTab === 'overview' && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {[
                                        { label: 'Platform Users', value: stats?.totalUsers, icon: Users, color: 'blue', desc: 'Registered accounts' },
                                        { label: 'Active Jobs', value: stats?.totalJobs, icon: Briefcase, color: 'emerald', desc: 'Live opportunities' },
                                        { label: 'Course Catalog', value: stats?.totalCourses, icon: BookOpen, color: 'amber', desc: 'Available modules' },
                                        { label: 'Pending Safety', value: stats?.pendingApprovals, icon: Shield, color: 'rose', desc: 'Required actions' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                                            <div className={`w-14 h-14 rounded-2xl bg-${s.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                                <s.icon className={`w-7 h-7 text-${s.color}-600`} />
                                            </div>
                                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{s.value || 0}</h3>
                                            <p className="text-slate-900 font-black text-xs uppercase tracking-tight">{s.label}</p>
                                            <p className="text-slate-400 text-[10px] font-bold mt-1">{s.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden h-[400px]">
                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="bg-white/10 self-start px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase mb-6">Growth Analytics</div>
                                            <h2 className="text-4xl font-black tracking-tight leading-none mb-4">Platform utilization<br />is at an all-time high.</h2>
                                            <p className="text-slate-400 font-medium max-w-sm">Detailed performance metrics across all sectors show consistent student engagement growth.</p>
                                            <div className="mt-auto flex items-end justify-between">
                                                <div className="flex gap-4">
                                                    {[40, 70, 50, 90, 60, 100].map((h, i) => (
                                                        <div key={i} className="w-8 bg-indigo-500 rounded-t-lg transition-all hover:bg-white" style={{ height: `${h}px` }} />
                                                    ))}
                                                </div>
                                                <button className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all">VIEW REPORT <ChevronRight className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/30 rounded-full blur-[100px]" />
                                    </div>

                                    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="font-black text-slate-900 tracking-tight">RECENT REGISTRATIONS</h3>
                                            <Users className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div className="space-y-6">
                                            {(data.users || []).slice(0, 5).map((u, i) => (
                                                <div key={u._id} className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-indigo-600 border border-white shadow-sm text-xs">
                                                        {u.name[0]}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{u.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold">{u.role} • {new Date(u.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className={clsx(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        u.isActive ? "bg-emerald-500" : "bg-rose-500"
                                                    )} />
                                                </div>
                                            ))}
                                            {(data.users || []).length === 0 && (
                                                <p className="text-center text-slate-400 text-xs font-bold py-10 uppercase tracking-widest">No recent data</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {['students', 'recruiters', 'teachers', 'users'].includes(activeTab) && (
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-indigo-600 rounded-full" />
                                        <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm">
                                            {activeTab === 'students' ? 'Student Registry' :
                                                activeTab === 'recruiters' ? 'Recruiter Manifest' :
                                                    activeTab === 'teachers' ? 'Academic Staff' : 'Authoritative User Manifest'}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {(activeTab === 'teachers' || activeTab === 'users') && (
                                            <button
                                                onClick={() => setTeacherForm({ ...teacherForm, show: true })}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-indigo-700 transition-all flex items-center gap-2"
                                            >
                                                <GraduationCap className="w-4 h-4" /> CREATE TEACHER ACCOUNT
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <tr>
                                                <th className="p-8">IDENTITY</th>
                                                <th className="p-8 text-center">{['recruiters', 'students'].includes(activeTab) ? 'VERIFICATION' : 'PRIVILEGE'}</th>
                                                <th className="p-8 text-center">STATUS</th>
                                                <th className="p-8 text-right">OPERATIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {(data[activeTab] || []).filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                                                <tr key={u._id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-[18px] bg-slate-100 flex items-center justify-center font-black text-indigo-600 border border-white shadow-sm text-lg">
                                                                {u.name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900 mb-0.5">{u.name}</p>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><Mail className="w-3 h-3" /> {u.email}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-8 text-center">
                                                        {['recruiters', 'students'].includes(activeTab) ? (
                                                            <span className={clsx(
                                                                "px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase border",
                                                                u.approvalStatus === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                    u.approvalStatus === 'REJECTED' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                                        "bg-amber-50 text-amber-600 border-amber-100"
                                                            )}>
                                                                {u.approvalStatus || 'PENDING'}
                                                            </span>
                                                        ) : (
                                                            <span className={clsx(
                                                                "px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase border",
                                                                ROLE_CONFIG[u.role]?.text || "text-slate-400 border-slate-100 bg-slate-50",
                                                                ROLE_CONFIG[u.role]?.bg || "bg-slate-50"
                                                            )}>
                                                                {u.role || 'GUEST'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-8">
                                                        <div className="flex justify-center">
                                                            <span className={clsx(
                                                                "flex items-center gap-2 px-3 py-1 bg-white rounded-full border text-[10px] font-black tracking-wider uppercase",
                                                                u.isActive ? "text-emerald-500 border-emerald-100" : "text-rose-500 border-rose-100"
                                                            )}>
                                                                <div className={clsx("w-1.5 h-1.5 rounded-full", u.isActive ? "bg-emerald-500" : "bg-rose-500")} />
                                                                {u.isActive ? 'Active' : 'Locked'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-8">
                                                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                            {u.approvalStatus === 'PENDING' && (
                                                                <button
                                                                    onClick={() => handleUserAction(u._id, 'approve')}
                                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:scale-105 transition-all shadow-lg shadow-indigo-200"
                                                                >
                                                                    APPROVE
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleUserAction(u._id, 'ban')}
                                                                className={clsx(
                                                                    "p-2.5 rounded-xl transition-all",
                                                                    u.isActive ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                                )}
                                                                title={u.isActive ? 'Suspend' : 'Unsuspend'}
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUserAction(u._id, 'delete')}
                                                                className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'jobs' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {data.jobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase())).map(job => (
                                    <div key={job._id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-start justify-between group relative overflow-hidden">
                                        <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rotate-45 translate-x-12 -translate-y-12" />
                                        <div className="relative z-10 flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600">
                                                    {job.companyName[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-xl leading-tight">{job.title}</h4>
                                                    <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.1em]">{job.companyName}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-6">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 tracking-wider">
                                                    <MapPin className="w-3 h-3" /> {job.location}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 tracking-wider">
                                                    <Clock className="w-3 h-3" /> {job.jobType}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl text-[10px] font-black text-emerald-600 tracking-wider">
                                                    <IndianRupee className="w-3 h-3" /> {job.salary?.min ? `₹${job.salary.min}L - ₹${job.salary.max}L` : 'Not specified'}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-400 tracking-wider">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                                <div className="flex gap-2">
                                                    <button className="p-3 bg-slate-50 text-slate-900 rounded-2xl hover:bg-slate-100 transition-all">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteEntity('job', job._id)} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="space-y-8">
                                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-indigo-600 rounded-full" />
                                        <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm">Educational Assets</h3>
                                    </div>
                                    <button
                                        onClick={() => setCourseForm({ ...courseForm, show: true })}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-indigo-700 transition-all flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> CREATE NEW COURSE
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {data.courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(course => (
                                        <div key={course._id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group">
                                            <div className="h-44 bg-slate-100 relative overflow-hidden">
                                                <img src={course.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-80" />
                                                <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-indigo-600 tracking-widest uppercase">
                                                    {course.category || 'Skill'}
                                                </div>
                                                <div className="absolute top-6 right-6 flex gap-2">
                                                    {course.approvalStatus === 'PENDING' && (
                                                        <button onClick={() => handleApproveCourse(course._id)} className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-emerald-700 transition-all">
                                                            Approve
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteEntity('course', course._id)} className="p-2.5 bg-rose-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-8">
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <h4 className="font-black text-slate-900 text-lg line-clamp-1">{course.title}</h4>
                                                    <span className="shrink-0 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-[11px] font-black tracking-widest">
                                                        {course.price > 0 ? `₹${course.price}` : 'FREE'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-[10px]">
                                                            {course.teacher?.name[0]}
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
                            </div>
                        )}

                        {activeTab === 'applications' && (
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                                    <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm">Global Application Ledger</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <tr>
                                                <th className="p-8">STUDENT</th>
                                                <th className="p-8">JOB POSITION</th>
                                                <th className="p-8">DATE</th>
                                                <th className="p-8 text-right">STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.applications.map(app => (
                                                <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{app.studentId?.name[0]}</div>
                                                            <div>
                                                                <p className="font-black text-slate-900 text-sm">{app.studentId?.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold">{app.studentId?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-8 font-black text-slate-900 text-sm">{app.jobId?.title}</td>
                                                    <td className="p-8 text-[11px] font-bold text-slate-400">
                                                        {new Date(app.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-8 text-right">
                                                        <span className={clsx(
                                                            "px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase",
                                                            app.status === 'ACCEPTED' ? "bg-emerald-50 text-emerald-600" :
                                                                app.status === 'REJECTED' ? "bg-rose-50 text-rose-600" :
                                                                    "bg-amber-50 text-amber-600"
                                                        )}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'competitions' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {data.competitions.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(comp => (
                                    <div key={comp._id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm group">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                                                    <Globe className="w-6 h-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-xl leading-tight">{comp.title}</h4>
                                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{comp.organizer || 'Platform'}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteEntity('competition', comp._id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-6 mb-8 text-[11px] font-black tracking-tight text-slate-500">
                                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(comp.startDate).toLocaleDateString()}</div>
                                            <div className="flex items-center gap-2 text-indigo-600"><Users className="w-4 h-4" /> {comp.participants?.length || 0} Registered</div>
                                        </div>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                new Date(comp.endDate) > new Date() ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                            )}>
                                                {new Date(comp.endDate) > new Date() ? 'LIVE' : 'CONCLUDED'}
                                            </span>
                                            <button className="text-[11px] font-black text-indigo-600 hover:underline">MANAGE LEADERBOARD</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <AdminPayments />
                        )}
                    </div>
                </main>
            </div>
            {teacherForm.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setTeacherForm({ ...teacherForm, show: false })} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                            <XCircle className="w-8 h-8" />
                        </button>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 italic">CREATE ACCOUNT</h3>
                        <p className="text-slate-400 text-xs font-bold mb-10 tracking-wide uppercase">Initialize New Instructor Node</p>

                        <form onSubmit={handleCreateTeacher} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
                                <input
                                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Enter full name..."
                                    value={teacherForm.name}
                                    onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comm Endpoint (Email)</label>
                                <input
                                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Enter institutional email..."
                                    value={teacherForm.email}
                                    onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Protocol (Password)</label>
                                <input
                                    type="password"
                                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Initialize access key..."
                                    value={teacherForm.password}
                                    onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })}
                                />
                            </div>
                            <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 ring-4 ring-white hover:bg-indigo-700 transition-all active:scale-95">AUTHORIZE NODE</button>
                        </form>
                    </div>
                </div>
            )}

            {courseForm.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setCourseForm({ ...courseForm, show: false })} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                            <XCircle className="w-8 h-8" />
                        </button>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 italic">DEPLOY COURSE</h3>
                        <p className="text-slate-400 text-xs font-bold mb-10 tracking-wide uppercase">Initialize Academy Content Node</p>

                        <form onSubmit={handleCreateCourse} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Course title..."
                                    value={courseForm.title}
                                    onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
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
                                        {data.teachers.map(t => (
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

export default AdminDashboard;
