import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { 
    Users, Briefcase, BookOpen, Shield, ChevronRight, 
    TrendingUp, ArrowUpRight, Activity,
    Zap, Star, Bell, Download
} from 'lucide-react';
import clsx from 'clsx';
import Skeleton from '../../components/ui/Skeleton';
import { motion } from 'framer-motion';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const StatCard = ({ label, value, icon: Icon, color, desc, delay }) => {
    const colors = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', light: 'bg-blue-400/10', accent: 'group-hover:bg-blue-600', glow: 'shadow-blue-200' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', light: 'bg-emerald-400/10', accent: 'group-hover:bg-emerald-600', glow: 'shadow-emerald-200' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', light: 'bg-amber-400/10', accent: 'group-hover:bg-amber-600', glow: 'shadow-amber-200' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', light: 'bg-rose-400/10', accent: 'group-hover:bg-rose-600', glow: 'shadow-rose-200' }
    };

    const c = colors[color] || colors.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="group relative bg-white p-4 lg:p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
            <div className="relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className={clsx(
                    "w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-3 lg:mb-4 transition-all duration-300",
                    c.bg, c.light, c.accent, "group-hover:scale-110"
                )}>
                    <Icon className={clsx("w-5 h-5 lg:w-6 lg:h-6 transition-colors duration-300", c.text, "group-hover:text-white")} />
                </div>
                
                <div className="flex items-baseline gap-2 mb-0.5">
                    <h3 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tighter italic whitespace-nowrap">
                        {value || 0}
                    </h3>
                </div>

                <p className="text-slate-900 font-black text-[9px] lg:text-[10px] uppercase tracking-widest truncate w-full">{label}</p>
                <p className="hidden lg:block text-slate-400 text-[9px] font-bold mt-0.5 uppercase tracking-wider opacity-60 line-clamp-1">{desc}</p>
            </div>
        </motion.div>
    );
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
        <div className="space-y-6 lg:space-y-8 pb-20">
            <Skeleton className="h-[150px] lg:h-[220px] w-full rounded-[32px]" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 h-[120px] lg:h-[150px] space-y-4">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="h-6 w-2/3" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 rounded-[32px] h-[300px] lg:h-[400px]" />
                <Skeleton className="rounded-[32px] h-[300px] lg:h-[400px]" />
            </div>
        </div>
    );

    if (loading) return <DashboardSkeleton />;

    const totalBacklog = (stats?.pendingApprovals || 0) + (stats?.pendingJobs || 0) + (stats?.pendingCompetitions || 0) + (stats?.pendingIssues || 0);
    const maxBacklog = Math.max(stats?.pendingApprovals || 0, stats?.pendingJobs || 0, stats?.pendingCompetitions || 0, stats?.pendingIssues || 0, 1);

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20">
            
            {/* Fully Responsive Welcome Banner */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-slate-950 rounded-[28px] lg:rounded-[32px] p-6 lg:p-12 text-white overflow-hidden shadow-xl group border border-white/5"
            >
                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full text-[8px] lg:text-[9px] font-black tracking-widest uppercase mb-4 lg:mb-6 border border-white/10">
                        <Zap className="w-3 h-3 text-amber-400" /> Operational Overview
                    </div>
                    <h1 className="text-2xl lg:text-5xl font-[1000] tracking-tighter mb-2 lg:mb-3 uppercase italic leading-none">
                        System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Authority</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] lg:text-sm font-bold uppercase tracking-widest opacity-80 max-w-sm">
                        Managing platform intelligence and node operations.
                    </p>
                </div>

                <div className="absolute top-0 right-0 w-64 h-64 lg:w-80 lg:h-80 bg-indigo-600/10 rounded-full -mr-20 -mt-20 blur-[100px]" />
                <Shield className="absolute right-6 bottom-0 w-32 h-32 lg:w-48 lg:h-48 text-white/[0.03] -rotate-12 pointer-events-none" />
            </motion.div>

            {/* Stats Grid - 2 cols on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="blue" desc="Evolving ecosystem" delay={0.1} />
                <StatCard label="Live Jobs" value={stats?.totalJobs} icon={Briefcase} color="emerald" desc="Market opportunities" delay={0.2} />
                <StatCard label="Courses" value={stats?.totalCourses} icon={BookOpen} color="amber" desc="Knowledge assets" delay={0.3} />
                <StatCard label="Backlog" value={totalBacklog} icon={Activity} color="rose" desc="Pending tasks" delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Responsive Analytics Section */}
                <div className="lg:col-span-2 bg-slate-900 rounded-[28px] lg:rounded-[32px] p-6 lg:p-10 text-white relative overflow-hidden h-auto shadow-xl border border-slate-800">
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6 lg:mb-8">
                            <div>
                                <h2 className="text-lg lg:text-2xl font-black tracking-tight uppercase italic">Platform Growth</h2>
                                <p className="text-[8px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Impact: <span className="text-indigo-400">{(stats?.totalUsers || 0) + (stats?.totalJobs || 0)}</span></p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => window.print()} className="h-8 lg:h-9 px-3 lg:px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all">
                                    Export
                                </button>
                                <Activity className="w-5 h-5 text-indigo-400" />
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="flex gap-3 lg:gap-4 flex-1 h-[140px] lg:h-[200px] w-full mb-4 lg:mb-6">
                            {[
                                { label: 'Users', val: stats?.totalUsers || 0, color: 'bg-indigo-500' },
                                { label: 'Jobs', val: stats?.totalJobs || 0, color: 'bg-emerald-500' },
                                { label: 'Applications', val: stats?.totalApplications || 0, color: 'bg-violet-500' },
                                { label: 'Courses', val: stats?.totalCourses || 0, color: 'bg-amber-500' },
                                { label: 'Events', val: stats?.totalCompetitions || 0, color: 'bg-rose-500' }
                            ].map((item, i, arr) => {
                                const maxVal = Math.max(...arr.map(a => Number(a.val)), 1);
                                const heightPct = (Number(item.val) / maxVal) * 100;
                                return (
                                    <div key={item.label} className="flex flex-col items-center flex-1 h-full group">
                                        <div className="w-full relative flex items-end justify-center flex-1 bg-white/[0.03] rounded-lg lg:rounded-xl overflow-hidden group-hover:bg-white/[0.08] transition-all border border-white/5 mb-1.5 lg:mb-2">
                                            <motion.div 
                                                initial={{ height: 0 }} 
                                                animate={{ height: `${Math.max(6, heightPct)}%` }} 
                                                transition={{ duration: 1, delay: i * 0.1 }} 
                                                className={clsx("w-full rounded-t-sm lg:rounded-t-lg shadow-lg relative", item.color)} 
                                            >
                                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] lg:text-[10px] font-black pointer-events-none">
                                                    {item.val}
                                                </div>
                                            </motion.div>
                                        </div>
                                        <p className="text-[7px] lg:text-[9px] font-black text-slate-500 uppercase tracking-tighter sm:tracking-widest truncate w-full text-center">{item.label}</p>
                                        <p className="text-[9px] lg:text-[10px] font-bold text-white mt-0.5">{item.val}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 lg:gap-8">
                    {/* Compact Backlog */}
                    <div className="bg-white rounded-[28px] lg:rounded-[32px] p-6 lg:p-8 border border-slate-100 shadow-sm">
                        <h3 className="font-black text-slate-900 tracking-tighter uppercase text-xs lg:text-sm italic mb-6">Task Backlog</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Approvals', count: stats?.pendingApprovals || 0, color: 'bg-indigo-500' },
                                { label: 'Job Review', count: stats?.pendingJobs || 0, color: 'bg-emerald-500' },
                                { label: 'Events', count: stats?.pendingCompetitions || 0, color: 'bg-amber-500' },
                                { label: 'Issues', count: stats?.pendingIssues || 0, color: 'bg-rose-500' }
                            ].map((task) => {
                                const countVal = Number(task.count) || 0;
                                const totalCount = Number(maxBacklog) || 1;
                                const pct = (countVal / totalCount) * 100;
                                return (
                                    <div key={task.label} className="space-y-1.5">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[8px] lg:text-[9px] font-black text-slate-900 uppercase tracking-widest">{task.label}</span>
                                            <span className="text-[10px] font-black text-slate-400">{countVal}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className={clsx("h-full", task.color)} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Compact Activity */}
                    <div className="bg-white rounded-[28px] lg:rounded-[32px] p-6 lg:p-8 border border-slate-100 shadow-sm flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-slate-900 tracking-tighter uppercase text-xs lg:text-sm italic">Recent Nodes</h3>
                            <Activity className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="space-y-4">
                            {recentUsers.slice(0, 4).map((u, i) => (
                                <div key={u._id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-indigo-600 border border-slate-50 text-[10px] overflow-hidden shrink-0">
                                        {u.avatar ? <img src={getImageUrl(u.avatar)} alt={u.name} className="w-full h-full object-cover" /> : u.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">{u.name}</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{u.role}</p>
                                    </div>
                                    <div className={clsx("w-1 h-1 rounded-full", u.isActive ? "bg-emerald-500" : "bg-slate-300")} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
