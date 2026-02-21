import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Home, Briefcase, BookOpen, Trophy,
    Users, Settings, LogOut, Bell,
    MessageSquare, FileText, CheckCircle, Orbit,
    PanelLeftClose, PanelLeft
} from 'lucide-react';
import clsx from 'clsx'; // Install with: npm i clsx tailwind-merge
import Logo from '../Logo';

const Sidebar = ({ isOpen, setIsOpen, isMobile = false }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    // Collapse state for desktop
    const isCollapsed = !isMobile && !isOpen;

    const mainLinks = [
        { name: 'Dashboard', path: '/app', icon: Home },
        { name: 'Jobs & Internships', path: '/app/jobs', icon: Briefcase },
        { name: 'Skill Learning', path: '/app/learning', icon: BookOpen },
        { name: 'Competitions', path: '/app/competitions', icon: Trophy },
        { name: 'Community', path: '/app/community', icon: Users },
    ];

    const toolLinks = [
        { name: 'AI Resume Builder', path: '/app/resume', icon: FileText, highlight: true },
        { name: 'Mock Tests', path: '/app/mock-tests', icon: CheckCircle },
        { name: 'Interview Prep', path: '/app/interview', icon: Orbit },
    ];

    const bottomLinks = [
        { name: 'Notifications', path: '/app/notifications', icon: Bell, badge: 2 },
        { name: 'Messages', path: '/app/messages', icon: MessageSquare },
        { name: 'Settings', path: '/app/settings', icon: Settings },
    ];

    return (
        <div className={clsx(
            "h-full flex flex-col bg-[#0F172A] text-slate-300 transition-all duration-300 ease-in-out border-r border-[#1E293B]",
            isCollapsed ? "w-[80px]" : "w-[280px]"
        )}>

            {/* Header / Logo Area */}
            <div className={clsx("flex items-center h-20 border-b border-[#1E293B]", isCollapsed ? "justify-center px-0" : "justify-between px-6")}>
                {!isCollapsed && (
                    <Logo withText={true} textClassName="text-xl text-white" iconSize="w-8 h-8" to="/app" />
                )}

                {/* Collapse/Close Toggle */}
                {isMobile ? (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 rounded-md hover:bg-[#1E293B] text-slate-400 transition-colors"
                    >
                        <PanelLeftClose className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1.5 rounded-md hover:bg-[#1E293B] text-slate-400 transition-colors"
                    >
                        {isOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-6 px-4 space-y-8">

                {/* Main Section */}
                <div>
                    {!isCollapsed && <p className="text-xs font-semibold text-slate-500 mb-3 px-3 uppercase tracking-wider">Main</p>}
                    <ul className="space-y-1">
                        {mainLinks.map((link) => {
                            const isActive = location.pathname === link.path || (link.path !== '/app' && location.pathname.startsWith(link.path));
                            return (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className={clsx(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                                            isActive
                                                ? "bg-gradient-to-r from-[#2563EB] to-[#1E3A8A] text-white shadow-md"
                                                : "hover:bg-[#1E293B] hover:text-white"
                                        )}
                                    >
                                        {isActive && !isCollapsed && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-400 rounded-r-md"></div>
                                        )}
                                        <link.icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-blue-200" : "text-slate-400 group-hover:text-blue-400")} />
                                        {!isCollapsed && <span className="font-medium whitespace-nowrap">{link.name}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Career Tools Section */}
                <div>
                    {!isCollapsed && <p className="text-xs font-semibold text-slate-500 mb-3 px-3 uppercase tracking-wider">Career Tools</p>}
                    <ul className="space-y-1">
                        {toolLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className={clsx(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                                            isActive
                                                ? "bg-[#1E293B] text-blue-400 font-medium"
                                                : "hover:bg-[#1E293B] hover:text-white"
                                        )}
                                    >
                                        <link.icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-blue-400" : "text-slate-400")} />
                                        {!isCollapsed && <span className="font-medium whitespace-nowrap">{link.name}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Others Section */}
                <div>
                    {!isCollapsed && <p className="text-xs font-semibold text-slate-500 mb-3 px-3 uppercase tracking-wider">Others</p>}
                    <ul className="space-y-1">
                        {bottomLinks.map((link) => (
                            <li key={link.name}>
                                <Link
                                    to={link.path}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1E293B] hover:text-white transition-all group relative"
                                >
                                    <link.icon className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-slate-300" />
                                    {!isCollapsed && (
                                        <div className="flex flex-1 items-center justify-between">
                                            <span className="font-medium">{link.name}</span>
                                            {link.badge && (
                                                <span className="bg-red-500/20 text-red-500 py-0.5 px-2 rounded-md text-xs font-bold">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {isCollapsed && link.badge && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* User Profile Area */}
            <div className={clsx("p-4 border-t border-[#1E293B]", isCollapsed ? "flex justify-center" : "")}>
                <div className={clsx(
                    "flex items-center gap-3 rounded-2xl border border-[#334155]/50 bg-[#1E293B]/30",
                    isCollapsed ? "p-2" : "p-3"
                )}>
                    <img
                        src={user?.avatar || "https://i.pravatar.cc/150"}
                        alt="User"
                        className="w-10 h-10 rounded-full border-2 border-[#3882F6] object-cover shrink-0"
                    />
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                        </div>
                    )}
                </div>

                {/* Upgrade / Logout */}
                {!isCollapsed && (
                    <button
                        onClick={logout}
                        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-400 hover:from-orange-500 hover:to-pink-500 hover:text-white transition-all text-sm font-semibold border border-orange-500/30 font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                )}
            </div>

        </div >
    );
};

export default Sidebar;
