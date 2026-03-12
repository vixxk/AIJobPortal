import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Menu, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
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
    if (location.pathname === '/app/interview') {
        return null;
    }

    if (isMobile && (location.pathname === '/app' || location.pathname.startsWith('/app/job/') || location.pathname === '/app/help' || location.pathname === '/app/contact')) {
        return null;
    }
    let pageTitle = "Student Dashboard";
    if (customTitle) pageTitle = customTitle;
    else if (location.pathname === '/app/jobs') pageTitle = "Job Search";
    else if (location.pathname === '/app/resume') pageTitle = "AI Resume Builder";
    else if (location.pathname === '/app/saved') pageTitle = "Saved Jobs";
    else if (location.pathname === '/app/profile') pageTitle = "Profile";
    else if (location.pathname === '/app/help') pageTitle = "Help Center";
    else if (location.pathname === '/app/contact') pageTitle = "Customer Service";
    else if (location.pathname === '/app/competitions') pageTitle = "Competitions";
    else if (location.pathname !== '/app') pageTitle = "Feature Details";
    const showBackButton = customBack || (!(['/app', '/app/jobs', '/app/resume', '/app/saved', '/app/competitions'].includes(location.pathname) || location.pathname.startsWith('/app/profile')));
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
                <div className="flex items-center gap-4 md:gap-8">
                    {!customTitle && user?.role !== 'RECRUITER' && (
                        <div className="hover:scale-110 transition-transform">
                            <NotificationsDropdown />
                        </div>
                    )}
                    {(!customTitle && location.pathname === '/app/profile') ? (
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
                    ) : null}
                </div>
            )}
        </div>
    );
};
export default Topbar;
