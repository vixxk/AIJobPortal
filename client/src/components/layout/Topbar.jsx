import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Menu, ArrowLeft, Settings as SettingsIcon, Sparkles, Crown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationsDropdown from '../NotificationsDropdown';
import SmartImage from '../ui/SmartImage';
import clsx from 'clsx';
const Topbar = ({ toggleSidebar, isMobile }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [customTitle, setCustomTitle] = useState(null);
    const [customBack, setCustomBack] = useState(null);
    useEffect(() => {
        const handleCustomHeader = (e) => {
            setCustomTitle(e.detail?.title || null);
            setCustomBack(e.detail?.backEvent || null);
        };
        window.addEventListener('set-custom-header', handleCustomHeader);
        return () => window.removeEventListener('set-custom-header', handleCustomHeader);
    }, []);

    // Check if on subscription status endpoint
    const isStudent = user?.role === 'STUDENT';
    if (location.pathname === '/app/interview') {
        return null;
    }

    if (isMobile && (location.pathname === '/app' || location.pathname === '/app/dashboard' || location.pathname.startsWith('/app/job/') || location.pathname === '/app/contact')) {
        return null;
    }
    const getPageTitle = () => {
        if (customTitle) return customTitle;
        const path = location.pathname;

        // Base Dashboard titles based on role
        if (path === '/app') {
            if (user?.role === 'RECRUITER') return 'Recruiter Hub';
            if (user?.role === 'COLLEGE_ADMIN') return 'College Portal';
            return 'Student Dashboard';
        }

        // Student & Shared Paths
        if (path === '/app/jobs') return 'Global Job Search';
        if (path === '/app/resume') return 'Resume Builder';
        if (path === '/app/saved') return 'Saved Jobs';
        if (path === '/app/profile') return 'Profile';
        if (path.startsWith('/app/profile/')) return 'Profile';
        if (path === '/app/help') return 'Help Center';
        if (path === '/app/contact') return 'Customer Service';
        if (path === '/app/competitions') return 'Competitions';
        if (path.startsWith('/app/competitions/')) return 'Competition Details';

        // Recruiter Specific Paths
        if (path === '/app/recruiter') return 'Recruiter Hub';
        if (path === '/app/recruiter/post-job') return 'Post New Job';
        if (path === '/app/recruiter/drafts') return 'My Drafts';
        if (path === '/app/recruiter/competitions') return 'Competitions Control';
        if (path === '/app/recruiter/colleges') return 'College Connect';
        if (path.startsWith('/app/recruiter/manage/')) return 'Applicant Management';

        if (path === '/app/hyrego-jobs') return 'Hyrego Job Postings';
        if (path === '/app/english-tutor') return 'AI English Tutor';

        return '';
    };

    const pageTitle = getPageTitle();
    const showBackButton = customBack || (!(['/app', '/app/jobs', '/app/resume', '/app/saved', '/app/competitions', '/app/help', '/app/recruiter', '/app/hyrego-jobs', '/app/english-tutor'].includes(location.pathname) || location.pathname.startsWith('/app/profile') || location.pathname.startsWith('/app/recruiter/manage/')));
    return (
        <div className={`h-16 md:h-24 px-4 md:px-10 flex items-center justify-between z-40 sticky top-0 transition-all duration-500 ${customTitle && isMobile ? 'bg-white' : 'bg-white/70 md:bg-background/60 backdrop-blur-xl border-b border-slate-200/50 md:border-none'}`}>
            {}
            {isMobile && (
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {showBackButton ? (
                        <button
                            onClick={() => customBack ? window.dispatchEvent(new CustomEvent(customBack)) : navigate(-1)}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-90 transition-all shrink-0 bg-slate-50 border border-slate-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={toggleSidebar}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-90 transition-all shrink-0 bg-slate-50 border border-slate-100"
                        >
                            <Menu className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                    )}
                    <h1 className={clsx(
                        "font-black text-slate-900 tracking-tight leading-none pt-0.5 truncate pl-1",
                        customTitle ? "text-xl" : "text-lg"
                    )}>{pageTitle}</h1>
                </div>
            )}
            {}
            {!isMobile && (
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        {customBack && (
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent(customBack))}
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 active:scale-90 transition-all shrink-0 bg-white border border-slate-100"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        )}
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm">{pageTitle}</h1>
                    </div>
                </div>
            )}
            {}
            {(!customTitle || !isMobile) && (
                <div className="flex items-center gap-4 md:gap-6">
                    {isStudent && (
                        <div className="hover:scale-[1.03] transition-transform">
                            {user?.subscription?.plan === 'FREE' || !user?.subscription?.plan ? (
                                <button 
                                    onClick={() => navigate('/app/subscriptions')}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-xs shadow-md shadow-amber-400/20 hover:shadow-lg active:scale-95 transition-all border border-amber-300/40"
                                >
                                    <Sparkles className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                                    <span>Premium</span>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => navigate('/app/subscriptions')}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 hover:shadow-lg active:scale-95 transition-all border border-emerald-400/35"
                                >
                                    <Crown className="w-3.5 h-3.5 fill-emerald-100 text-emerald-100" />
                                    <span>{user.subscription.plan === 'PRO_PLUS' ? 'PRO PLUS' : 'PRO'}</span>
                                </button>
                            )}
                        </div>
                    )}
                    {!customTitle && user && user.role !== 'RECRUITER' && (
                        <div className="hover:scale-110 transition-transform">
                            <NotificationsDropdown />
                        </div>
                    )}
                    {user ? (
                        (!customTitle && location.pathname === '/app/profile') ? (
                            <div 
                                className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all text-slate-700 hover:text-blue-600 active:scale-95"
                                onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
                            >
                                <SettingsIcon className="w-6 h-6" />
                            </div>
                        ) : !customTitle ? (
                            <div 
                                className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 border-white bg-white shadow-md flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-blue-500/20 transition-all relative z-10 active:scale-95"
                                onClick={() => navigate('/app/profile')}
                            >
                                <SmartImage 
                                    src={user?.avatar} 
                                    alt={user?.name || "User"}
                                    containerClassName="w-full h-full"
                                    fallbackIcon={() => (
                                        <div className={clsx(
                                            "w-full h-full flex items-center justify-center text-white font-black text-lg uppercase",
                                            user?.role === 'RECRUITER' ? "bg-indigo-500" : "bg-blue-600"
                                        )}>
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                />
                            </div>
                        ) : null
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white font-extrabold text-xs shadow-md shadow-blue-500/15 hover:shadow-lg active:scale-95 transition-all"
                        >
                            Log In
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
export default Topbar;
