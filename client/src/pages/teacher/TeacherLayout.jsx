import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Video, LayoutDashboard, Menu, X, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const SidebarLink = ({ to, label, icon: Icon }) => (
    <NavLink
        to={to}
        end
        className={({ isActive }) =>
            clsx(
                "w-full flex items-center gap-4 px-5 py-4 rounded-[20px] font-black transition-all text-[13px] tracking-wide",
                isActive
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[1.02]"
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
            )
        }
    >
        {({ isActive }) => (
            <>
                <Icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                {label}
            </>
        )}
    </NavLink>
);

const TeacherLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "fixed lg:sticky top-0 left-0 z-[101] h-screen bg-white border-r border-slate-200 p-8 flex flex-col gap-2 shrink-0 overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:flex w-72",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-11 h-11 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="font-black text-xl tracking-tighter text-slate-900 block leading-none">Hyrego</span>
                            <span className="text-[10px] font-black tracking-[0.2em] text-indigo-500 uppercase mt-1 block">Teacher Academy</span>
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
                    <SidebarLink to="/app/teacher" label="DASHBOARD" icon={LayoutDashboard} />
                    <SidebarLink to="/app/teacher/courses" label="MY COURSES" icon={Video} />
                    <SidebarLink to="/app/teacher/profile" label="MY PROFILE" icon={UserCircle} />
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
                <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-10 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                        >
                            <Menu className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/app/teacher/profile')}>
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 uppercase leading-none">{user?.name}</p>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Instructor</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-indigo-600 border-2 border-white shadow-sm overflow-hidden shrink-0 hover:ring-2 hover:ring-indigo-400 transition-all">
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
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default TeacherLayout;
