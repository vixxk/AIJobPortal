import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Shield, Users, Briefcase, Building2, GraduationCap,
    LayoutDashboard, FileText, Globe, Search, Plus, BookOpen, Menu, X
} from 'lucide-react';
import clsx from 'clsx';

const SidebarItem = ({ to, label, icon: Icon }) => {
    const location = useLocation();
    const active = location.pathname === to;

    return (
        <Link
            to={to}
            className={clsx(
                "w-full flex items-center gap-4 px-5 py-4 rounded-[20px] font-black transition-all text-[13px] tracking-wide",
                active
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[1.02]"
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
            )}
        >
            <Icon className={clsx("w-5 h-5", active ? "text-white" : "text-slate-400")} />
            {label}
        </Link>
    );
};

const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/app/admin') return 'Administration Overview';
        if (path.includes('/students')) return 'Students Control';
        if (path.includes('/recruiters')) return 'Recruiters Control';
        if (path.includes('/teachers')) return 'Teachers Control';
        if (path.includes('/jobs')) return 'Jobs Control';
        if (/\/courses\/[^/]+/.test(path)) return 'Course Management';
        if (path.includes('/courses')) return 'Courses Control';
        if (path.includes('/applications')) return 'Applications Control';
        if (path.includes('/competitions')) return 'Competitions Control';
        return 'Admin Control';
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar (Desktop & Mobile) */}
            <div className={clsx(
                "fixed lg:sticky top-0 left-0 z-[101] h-screen bg-white border-r border-slate-200 p-8 flex flex-col gap-2 shrink-0 overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:w-72",
                isMobileMenuOpen ? "translate-x-0 w-80" : "-translate-x-full w-72"
            )}>
                <div className="flex items-center justify-between mb-12 lg:mb-12">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-11 h-11 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="font-black text-xl tracking-tighter text-slate-900 block leading-none">JobPortal</span>
                            <span className="text-[10px] font-black tracking-[0.2em] text-indigo-500 uppercase mt-1 block">Authority</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden p-2 text-slate-400 hover:text-slate-900"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-2">
                    <SidebarItem to="/app/admin" label="DASHBOARD" icon={LayoutDashboard} />
                    <div className="h-px bg-slate-100 my-4 mx-2" />
                    <div className="px-5 mb-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Management</span></div>
                    <SidebarItem to="/app/admin/students" label="STUDENTS" icon={Users} />
                    <SidebarItem to="/app/admin/recruiters" label="RECRUITERS" icon={Building2} />
                    <SidebarItem to="/app/admin/teachers" label="TEACHERS" icon={GraduationCap} />

                    <div className="h-px bg-slate-100 my-4 mx-2" />
                    <div className="px-5 mb-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resources</span></div>
                    <SidebarItem to="/app/admin/jobs" label="JOB LISTINGS" icon={Briefcase} />
                    <SidebarItem to="/app/admin/courses" label="ACADEMY CONTENT" icon={BookOpen} />
                    <SidebarItem to="/app/admin/applications" label="APPLICATIONS" icon={FileText} />
                    <SidebarItem to="/app/admin/competitions" label="COMPETITIONS" icon={Globe} />
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

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                        >
                            <Menu className="w-5 h-5 text-white" />
                        </button>
                        <h2 className="font-black text-slate-900 text-sm lg:text-lg tracking-tight uppercase truncate">
                            {getPageTitle()}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-indigo-600 border-2 border-white shadow-sm">
                            SA
                        </div>
                    </div>
                </header>

                <main className="p-4 lg:p-10 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
