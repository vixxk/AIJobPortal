import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Settings, Calendar, Search, Mail, Video,
    GraduationCap, LogOut, User, HelpCircle, PanelLeftClose, PanelLeft, Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const navItems = [
    { path: '/app/college', label: 'Overview', icon: LayoutDashboard, exact: true },
    { path: '/app/college/drives', label: 'Placement Drives', icon: Calendar },
    { path: '/app/college/companies', label: 'Search Companies', icon: Search },
    { path: '/app/college/emails', label: 'Send Emails', icon: Mail },
    { path: '/app/college/placement', label: 'Conduct Placement', icon: Video },
];

const bottomLinks = [
    { path: '/app/college/profile', label: 'My Account', icon: User },
    { path: '/app/college/help', label: 'Help Center', icon: HelpCircle },
];

const CollegeLayout = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [pendingInvites, setPendingInvites] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        axios.get('/college/stats')
            .then(res => {
                if (res.data.status === 'success') setPendingInvites(res.data.data.invites || 0);
            })
            .catch(() => {});
    }, []);

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* ── Sidebar ─────────────────────────────────────────── */}
            <div className={clsx(
                'hidden md:flex flex-col h-full bg-[#0F172A] text-slate-300 transition-all duration-300 ease-in-out border-r border-[#1E293B]',
                isCollapsed ? 'w-[76px]' : 'w-[260px]'
            )}>
                {/* Brand Header */}
                <div className={clsx(
                    'flex items-center h-20 border-b border-[#1E293B]',
                    isCollapsed ? 'justify-center px-0' : 'justify-between px-5'
                )}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50 shrink-0">
                                <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white tracking-tight leading-none">College Cell</p>
                                <p className="text-[9px] uppercase tracking-widest font-bold text-indigo-400 mt-0.5">Placement Portal</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-md hover:bg-[#1E293B] text-slate-400 transition-colors"
                    >
                        {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                    </button>
                </div>

                {/* Nav */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-5 px-3 space-y-1 hide-scrollbar">
                    {!isCollapsed && (
                        <p className="text-[10px] font-semibold text-slate-500 mb-3 px-2 uppercase tracking-widest">Main</p>
                    )}
                    {navItems.map((item) => {
                        const active = isActive(item);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={isCollapsed ? item.label : undefined}
                                className={clsx(
                                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                                    isCollapsed ? 'justify-center' : '',
                                    active
                                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-900/30'
                                        : 'hover:bg-[#1E293B] hover:text-white text-slate-400'
                                )}
                            >
                                {active && !isCollapsed && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-indigo-300 rounded-r-md" />
                                )}
                                <Icon className={clsx(
                                    'w-5 h-5 shrink-0 transition-transform duration-200',
                                    active ? 'text-indigo-200 scale-105' : 'text-slate-400 group-hover:scale-110'
                                )} />
                                {!isCollapsed && (
                                    <span className="font-bold text-sm whitespace-nowrap flex-1">{item.label}</span>
                                )}
                                {/* Pending invite badge */}
                                {item.path === '/app/college/placement' && pendingInvites > 0 && !isCollapsed && (
                                    <span className="w-5 h-5 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm shrink-0">
                                        {pendingInvites > 9 ? '9+' : pendingInvites}
                                    </span>
                                )}
                                {item.path === '/app/college/placement' && pendingInvites > 0 && isCollapsed && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                        {pendingInvites}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Bottom links */}
                    <div className="pt-6">
                        {!isCollapsed && (
                            <p className="text-[10px] font-semibold text-slate-500 mb-3 px-2 uppercase tracking-widest">Account</p>
                        )}
                        {bottomLinks.map(link => {
                            const active = location.pathname === link.path;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    title={isCollapsed ? link.label : undefined}
                                    className={clsx(
                                        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                                        isCollapsed ? 'justify-center' : '',
                                        active
                                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-900/30'
                                            : 'hover:bg-[#1E293B] hover:text-white text-slate-400'
                                    )}
                                >
                                    {active && !isCollapsed && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-indigo-300 rounded-r-md" />
                                    )}
                                    <Icon className={clsx(
                                        'w-5 h-5 shrink-0 transition-transform duration-200',
                                        active ? 'text-indigo-200 scale-105' : 'text-slate-400 group-hover:scale-110'
                                    )} />
                                    {!isCollapsed && (
                                        <span className="font-bold text-sm whitespace-nowrap">{link.label}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* User Footer */}
                <div className="p-4 border-t border-slate-800/50 mt-auto bg-[#0F172A]">
                    <Link
                        to="/app/college/profile"
                        className={clsx(
                            'flex items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition-all duration-300 group shadow-lg shadow-black/20',
                            isCollapsed ? 'p-2' : 'p-3',
                            location.pathname === '/app/college/profile' ? 'ring-2 ring-indigo-500/50 bg-indigo-500/10' : ''
                        )}
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-white text-base shrink-0 shadow-lg group-hover:scale-110 transition-transform border-2 border-slate-700/50">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate leading-tight group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                                    {user?.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">College Admin</p>
                                </div>
                            </div>
                        )}
                    </Link>
                    
                    {!isCollapsed && (
                        <button
                            onClick={logout}
                            className="w-full mt-4 flex justify-between items-center px-4 py-3 rounded-xl bg-gradient-to-r from-red-500/10 to-transparent hover:from-red-500/20 hover:to-red-500/5 text-red-400 hover:text-red-300 border border-red-500/20 transition-all duration-300 group"
                        >
                            <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
                            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Main Content ─────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto bg-slate-50/80">
                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default CollegeLayout;
