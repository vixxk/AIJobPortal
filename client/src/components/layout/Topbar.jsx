import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Menu, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationsDropdown from '../NotificationsDropdown';
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
        <div className={`h-16 md:h-20 px-4 md:px-8 flex items-center justify-between z-10 sticky top-0 transition-all duration-300 ${customTitle && isMobile ? 'bg-white' : 'bg-white/80 md:bg-background/80 backdrop-blur-md border-b border-slate-100 md:border-none shadow-sm md:shadow-none'}`}>
            { }
            {isMobile && (
                <div className="flex items-center gap-1 min-w-0 flex-1 h-10">
                    {showBackButton ? (
                        <button
                            onClick={() => customBack ? window.dispatchEvent(new CustomEvent(customBack)) : navigate(-1)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-90 transition-all shrink-0 -ml-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={toggleSidebar}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-90 transition-all shrink-0 -ml-2"
                        >
                            <Menu className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                    )}
                    <h1 className={`font-bold text-slate-900 tracking-tight leading-none pt-0.5 truncate pl-1 ${customTitle ? 'text-xl' : 'text-[18px]'}`}>{pageTitle}</h1>
                </div>
            )}
            { }
            {!isMobile && (
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        {customBack && (
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent(customBack))}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-90 transition-all shrink-0 -ml-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">{pageTitle}</h1>
                    </div>
                </div>
            )}
            { }
            {(!customTitle || !isMobile) && (
                <div className="flex items-center gap-4 md:gap-6">
                    {!customTitle && user?.role !== 'RECRUITER' && <NotificationsDropdown />}
                    {(!customTitle && location.pathname === '/app/profile') ? (
                        <SettingsIcon
                            className="w-6 h-6 text-slate-700 cursor-pointer hover:text-blue-500 active:text-blue-500"
                            onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
                        />
                    ) : !customTitle ? (
                        user?.role === 'RECRUITER' && !user?.avatar ? (
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-indigo-600 transition-colors shadow-sm"
                                 onClick={() => navigate('/app/profile')}
                            >
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
                            </div>
                        ) : (
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Student")}&background=f1f5f9&color=0f172a&bold=true`}
                                alt="Profile"
                                className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-slate-200 cursor-pointer hover:border-blue-500 transition-colors"
                            />
                        )
                    ) : null}
                </div>
            )}
        </div>
    );
};
export default Topbar;
