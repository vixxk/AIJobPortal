import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, Video, LayoutDashboard } from 'lucide-react';
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

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Sidebar */}
            <div className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col gap-2 shrink-0 h-screen sticky top-0 overflow-y-auto hidden lg:flex">
                <div className="flex items-center gap-4 px-2 mb-12">
                    <div className="w-11 h-11 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="font-black text-xl tracking-tighter text-slate-900 block leading-none">Gradnex</span>
                        <span className="text-[10px] font-black tracking-[0.2em] text-indigo-500 uppercase mt-1 block">Teacher Academy</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <SidebarLink to="/app/teacher" label="DASHBOARD" icon={LayoutDashboard} />
                    <SidebarLink to="/app/teacher/courses" label="MY COURSES" icon={Video} />
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
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 uppercase leading-none">{user?.name}</p>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Instructor</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-indigo-600 border-2 border-white shadow-sm overflow-hidden shrink-0">
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
