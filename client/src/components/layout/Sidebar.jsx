import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Home, Briefcase, BookOpen, Trophy,
    Users, Settings, LogOut, Bell,
    MessageSquare, FileText, CheckCircle, Orbit, Sparkles,
    PanelLeftClose, PanelLeft, PlusCircle, ClipboardList, Shield, User, HelpCircle, Bookmark,
    Rocket, Headphones, Bot
} from 'lucide-react';
import clsx from 'clsx';
import Logo from '../Logo';
import SmartImage from '../ui/SmartImage';
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const Sidebar = ({ isOpen, setIsOpen, isMobile = false }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const isCollapsed = !isMobile && !isOpen;
    const role = user?.role || 'STUDENT';
    let mainLinks = [];
    let toolLinks = [];
    if (role === 'STUDENT') {
        mainLinks = [
            { name: 'Dashboard', path: '/app/dashboard', icon: Home, exact: true },
            { name: 'Global Job Search', path: '/app/jobs', icon: Briefcase },
            { name: 'Gradnex Jobs', path: '/app/gradnex-jobs', icon: Rocket },
            { name: 'Saved Jobs', path: '/app/saved', icon: Bookmark },
            { name: 'Competitions', path: '/app/competitions', icon: Trophy },
            { name: 'Skill Learning', path: '/app/learning', icon: BookOpen },
            { name: 'AI English Tutor', path: '/app/english-tutor', icon: Headphones },
        ];
        toolLinks = [
            { name: 'Resume Builder', path: '/app/resume', icon: FileText, highlight: true },
            { name: 'AI Mock Interview', path: '/app/interview', icon: Bot },
        ];
    } else if (role === 'RECRUITER') {
        mainLinks = [
            { name: 'Dashboard', path: '/app/recruiter', icon: Home, exact: true },
            { name: 'Post a Job', path: '/app/recruiter/post-job', icon: PlusCircle },
        ];
        toolLinks = [];
    } else if (role === 'COLLEGE_ADMIN') {
        mainLinks = [
            { name: 'College Dashboard', path: '/app/college', icon: Home },
        ];
        toolLinks = [];
    } else if (role === 'TEACHER') {
        mainLinks = [
            { name: 'Dashboard', path: '/app', icon: Home, exact: true },
            { name: 'Skill Learning', path: '/app/learning', icon: BookOpen },
            { name: 'AI English Tutor', path: '/app/english-tutor', icon: Headphones },
        ];
        toolLinks = [
            { name: 'My Profile', path: '/app/profile', icon: User },
        ];
    } else if (role === 'SUPER_ADMIN') {
        mainLinks = [
            { name: 'Analytics', path: '/app', icon: Home, exact: true },
            { name: 'System Approvals', path: '/app/admin', icon: Shield },
            { name: 'Skill Learning', path: '/app/learning', icon: BookOpen },
        ];
        toolLinks = [];
    } else {
        mainLinks = [{ name: 'Dashboard', path: '/app', icon: Home, exact: true }];
    }
    const bottomLinks = [
        { name: 'My Account', path: role === 'COLLEGE_ADMIN' ? '/app/college/profile' : '/app/profile', icon: User },
        { name: 'Help Center', path: role === 'COLLEGE_ADMIN' ? '/app/college/help' : '/app/help', icon: HelpCircle },
    ];
    return (
        <div className={clsx(
            "h-full flex flex-col bg-[#0F172A] text-slate-300 transition-all duration-300 ease-in-out border-r border-[#1E293B]",
            isCollapsed ? "w-[80px]" : "w-[280px]"
        )}>
            <div className={clsx("flex items-center h-20 border-b border-[#1E293B]", isCollapsed ? "justify-center px-0" : "justify-between px-6")}>
                {!isCollapsed && (
                    <Logo withText={true} textClassName="text-xl text-white" iconSize="w-8 h-8" to="/app" />
                )}
                {isMobile ? (
                    <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-md hover:bg-[#1E293B] text-slate-400">
                        <PanelLeftClose className="w-5 h-5" />
                    </button>
                ) : (
                    <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 rounded-md hover:bg-[#1E293B] text-slate-400">
                        {isOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-8 py-6 px-4 hide-scrollbar">
                <div>
                    {!isCollapsed && <p className="text-xs font-semibold text-slate-500 mb-3 px-3 uppercase">Main</p>}
                    <ul className="space-y-1">
                        {mainLinks.map((link) => {
                            const currentPath = location.pathname.replace(/\/$/, "");
                            const linkPath = link.path.replace(/\/$/, "");
                            const isActive = link.exact
                                ? currentPath === linkPath
                                : currentPath.startsWith(linkPath);

                            return (
                                <li key={link.name}>
                                    <Link to={link.path} className={clsx("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative", isActive ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-900/20" : "hover:bg-[#1E293B] hover:text-white")}>
                                        {isActive && !isCollapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-400 rounded-r-md"></div>}
                                        <link.icon className={clsx("w-5 h-5 shrink-0 transition-transform duration-300", isActive ? "text-blue-200 scale-110" : "text-slate-400 group-hover:scale-110")} />
                                        {!isCollapsed && <span className="font-bold whitespace-nowrap">{link.name}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                {toolLinks.length > 0 && (
                    <div>
                        {!isCollapsed && <p className="text-xs font-semibold text-slate-500 mb-3 px-3 uppercase">Tools & Config</p>}
                        <ul className="space-y-1">
                            {toolLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <li key={link.name}>
                                        <Link to={link.path} className={clsx("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group", isActive ? "bg-[#1E293B] text-blue-400 font-medium" : "hover:bg-[#1E293B] hover:text-white")}>
                                            <link.icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-blue-400" : "text-slate-400")} />
                                            {!isCollapsed && <span className="font-medium whitespace-nowrap">{link.name}</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
                <div>
                    {!isCollapsed && <p className="text-xs font-semibold text-slate-500 mb-3 px-3 uppercase">Others</p>}
                    <ul className="space-y-1">
                        {bottomLinks.map((link) => (
                            <li key={link.name}>
                                <Link to={link.path} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1E293B] hover:text-white transition-all group">
                                    <link.icon className="w-5 h-5 shrink-0 text-slate-400 transition-transform group-hover:scale-110" />
                                    {!isCollapsed && (
                                        <div className="flex flex-1 justify-between">
                                            <span className="font-medium">{link.name}</span>
                                            {link.badge && <span className="bg-red-500/20 text-red-500 px-2 rounded-md text-xs">{link.badge}</span>}
                                        </div>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className={clsx("p-4 border-t border-[#1E293B]", isCollapsed ? "flex justify-center" : "")}>
                <Link
                    to={role === 'COLLEGE_ADMIN' ? '/app/college/profile' : '/app/profile'}
                    className={clsx("flex items-center gap-3 rounded-2xl border border-[#334155]/50 bg-[#1E293B]/30 hover:bg-[#1E293B]/50 transition-colors group", isCollapsed ? "p-2" : "p-3")}
                >
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative z-10">
                        <SmartImage
                            src={getImageUrl(user?.avatar)}
                            alt={user?.name || "User"}
                            containerClassName="w-full h-full"
                            fallbackIcon={() => (
                                <div className={clsx(
                                    "w-full h-full flex items-center justify-center text-white font-black",
                                    user?.role === 'SUPER_ADMIN' ? "bg-rose-500 text-[10px]" :
                                        user?.role === 'RECRUITER' ? "bg-indigo-500 text-lg" :
                                            user?.role === 'COLLEGE_ADMIN' ? "bg-emerald-500 text-lg" :
                                                "bg-blue-600 text-lg"
                                )}>
                                    {user?.role === 'SUPER_ADMIN' ? 'SA' : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
                                </div>
                            )}
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                        </div>
                    )}
                </Link>
                {!isCollapsed && (
                    <button onClick={logout} className="w-full mt-3 flex justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 hover:text-white font-medium">
                        <LogOut className="w-4 h-4 mt-0.5" /> Sign Out
                    </button>
                )}
            </div>
        </div>
    );
};
export default Sidebar;
