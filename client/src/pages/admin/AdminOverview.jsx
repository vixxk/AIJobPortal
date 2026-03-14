import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { Users, Briefcase, BookOpen, Shield, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import Skeleton from '../../components/ui/Skeleton';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const AdminOverview = () => {
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get('/admin/analytics');
            setStats(res.data.data.analytics);

            const usersRes = await axios.get('/admin/users');
            setRecentUsers(usersRes.data.data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const DashboardSkeleton = () => (
        <div className="space-y-4 lg:space-y-10 pb-20">
            {/* Banner Skeleton */}
            <Skeleton className="h-[200px] lg:h-[280px] w-full rounded-[32px]" />
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-5 lg:p-8 rounded-[24px] lg:rounded-[32px] border border-slate-100 h-[140px] lg:h-[180px] space-y-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <Skeleton className="h-8 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="lg:col-span-2 rounded-[32px] lg:rounded-[40px] h-[300px] lg:h-[400px]" />
                <div className="bg-white rounded-[32px] lg:rounded-[40px] p-6 lg:p-10 border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center mb-8">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-4 items-center">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-3 w-3/4" />
                                <Skeleton className="h-2 w-1/2" />
                            </div>
                            <Skeleton className="w-2 h-2 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="space-y-4 lg:space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
            {/* Welcome Banner */}
            <div className="bg-indigo-600 rounded-[32px] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                <div className="relative z-10">
                    <h1 className="text-2xl lg:text-5xl font-black tracking-tighter mb-2 uppercase italic">Control Center</h1>
                    <p className="text-indigo-100 text-[10px] lg:text-sm font-bold uppercase tracking-[0.2em] opacity-80">Authority Operations Active • Node 01</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />
                <Shield className="absolute right-8 bottom-8 w-24 h-24 text-white/5 -rotate-12" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                {[
                    { label: 'Platform Users', value: stats?.totalUsers, icon: Users, color: 'blue', desc: 'Registered accounts' },
                    { label: 'Active Jobs', value: stats?.totalJobs, icon: Briefcase, color: 'emerald', desc: 'Live opportunities' },
                    { label: 'Course Catalog', value: stats?.totalCourses, icon: BookOpen, color: 'amber', desc: 'Available modules' },
                    { label: 'Pending Safety', value: stats?.pendingApprovals, icon: Shield, color: 'rose', desc: 'Required actions' },
                ].map(s => (
                    <div key={s.label} className="bg-white p-5 lg:p-8 rounded-[24px] lg:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative">
                        <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform ${s.color === 'blue' ? 'bg-blue-50' :
                            s.color === 'emerald' ? 'bg-emerald-50' :
                                s.color === 'amber' ? 'bg-amber-50' : 'bg-rose-50'
                            }`}>
                            <s.icon className={`w-5 h-5 lg:w-7 lg:h-7 ${s.color === 'blue' ? 'text-blue-600' :
                                s.color === 'emerald' ? 'text-emerald-600' :
                                    s.color === 'amber' ? 'text-amber-600' : 'text-rose-600'
                                }`} />
                        </div>
                        {loading ? (
                            <div className="h-10 w-16 bg-slate-100 animate-pulse rounded-md" />
                        ) : (
                            <h3 className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter mb-1 lg:mb-2 italic">{s.value || 0}</h3>
                        )}
                        <p className="text-slate-900 font-black text-[9px] lg:text-xs uppercase tracking-widest">{s.label}</p>
                        <p className="text-slate-400 text-[10px] font-bold mt-1 line-clamp-1">{s.desc}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 rounded-[32px] lg:rounded-[40px] p-8 lg:p-10 text-white relative overflow-hidden h-[300px] lg:h-[400px]">
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="bg-white/10 self-start px-4 py-1.5 rounded-full text-[9px] lg:text-[10px] font-black tracking-widest uppercase mb-4 lg:mb-6">Growth Analytics</div>
                        <h2 className="text-xl lg:text-4xl font-black tracking-tighter leading-tight mb-2 lg:mb-4 uppercase">Platform utilization<br className="hidden sm:block" /> is accelerating.</h2>
                        <p className="text-slate-400 font-bold text-[10px] lg:text-sm max-w-sm uppercase tracking-wide opacity-80">Engagement growth: +140% this quarter.</p>
                        <div className="mt-auto flex items-end justify-between gap-4">
                            <div className="flex gap-2 lg:gap-4 flex-1">
                                {[30, 60, 45, 80, 50, 95].map((h, i) => (
                                    <div key={i} className="flex-1 max-w-[24px] lg:max-w-[32px] bg-indigo-500 rounded-t-lg transition-all hover:bg-white animate-in slide-in-from-bottom" style={{ height: `${h}px`, transitionDelay: `${i * 100}ms` }} />
                                ))}
                            </div>
                            <button className="flex items-center gap-2 bg-white text-slate-900 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-xs hover:bg-slate-100 transition-all shrink-0 uppercase tracking-widest">REPORT <ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />
                </div>

                <div className="bg-white rounded-[32px] lg:rounded-[40px] p-6 lg:p-10 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6 lg:mb-8">
                        <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm">Recent Activity</h3>
                        <Users className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-500" />
                    </div>
                    <div className="space-y-4 lg:space-y-6">
                        {recentUsers.slice(0, 5).map((u, i) => (
                            <div key={u._id} className="flex items-center gap-3 lg:gap-4 group">
                                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-indigo-600 border border-white shadow-sm text-[10px] lg:text-xs overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                    {u.avatar ? (
                                        <img src={getImageUrl(u.avatar)} alt={u.name} className="w-full h-full object-cover" />
                                    ) : (
                                        u.name[0]
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] lg:text-xs font-black text-slate-900 uppercase tracking-tight truncate">{u.name}</p>
                                    <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest">{u.role}</p>
                                </div>
                                <div className={clsx(
                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                    u.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                                )} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
