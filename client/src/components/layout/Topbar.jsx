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

    // Hide Topbar on mobile Dashboard and Job Details since they have custom headers
    if (isMobile && (location.pathname === '/app' || location.pathname.startsWith('/app/job/'))) {
        return null;
    }

    let pageTitle = "Student Dashboard";
    if (customTitle) pageTitle = customTitle;
    else if (location.pathname === '/app/jobs') pageTitle = "Job Search";
    else if (location.pathname === '/app/resume') pageTitle = "AI Resume Builder";
    else if (location.pathname === '/app/saved') pageTitle = "Saved Jobs";
    else if (location.pathname === '/app/profile') pageTitle = "Profile";
    else if (location.pathname !== '/app') pageTitle = "Feature Details";

    const showBackButton = customBack || (!['/app', '/app/jobs', '/app/resume', '/app/saved', '/app/profile'].includes(location.pathname));

    return (
        <div className={`h-16 md:h-20 px-4 md:px-8 flex items-center justify-between z-10 sticky top-0 transition-all duration-300 ${customTitle && isMobile ? 'bg-white' : 'bg-white/80 md:bg-background/80 backdrop-blur-md border-b border-slate-100 md:border-none shadow-sm md:shadow-none'}`}>
            {/* Mobile Left: Back Button or Menu */}
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

            {/* Desktop Left */}
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

            {/* Right Side Options */}
            {(!customTitle || !isMobile) && (
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search for jobs..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
                        />
                    </div>

                    {!customTitle && <NotificationsDropdown />}

                    {(!customTitle && location.pathname === '/app/profile') ? (
                        <SettingsIcon
                            className="w-6 h-6 text-slate-700 cursor-pointer hover:text-blue-500 active:text-blue-500"
                            onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
                        />
                    ) : !customTitle ? (
                        <img
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Student")}&background=f1f5f9&color=0f172a&bold=true`}
                            alt="Profile"
                            className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-slate-200 cursor-pointer hover:border-blue-500 transition-colors"
                        />
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default Topbar;
