import { useAuth } from '../../context/AuthContext';
import { Bell, Search, Menu, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Topbar = ({ toggleSidebar, isMobile }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Hide Topbar on mobile Dashboard and Job Details since they have custom headers
    // Note: Use /app/job/ (with trailing slash) to avoid matching /app/jobs
    if (isMobile && (location.pathname === '/app' || location.pathname.startsWith('/app/job/'))) {
        return null;
    }

    let pageTitle = "Student Dashboard";
    if (location.pathname === '/app/jobs') pageTitle = "AI Job Search";
    else if (location.pathname === '/app/resume') pageTitle = "AI Resume Builder";
    else if (location.pathname !== '/app') pageTitle = "Feature Details";

    return (
        <div className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white/80 md:bg-background/80 backdrop-blur-md z-10 sticky top-0 border-b border-slate-100 md:border-none shadow-sm md:shadow-none transition-all duration-300">
            {/* Mobile Left: Back Button or Menu */}
            {isMobile && (
                <div className="flex items-center gap-1.5 min-w-0 h-10">
                    <button
                        onClick={toggleSidebar}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-90 transition-all shrink-0"
                    >
                        <Menu className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                    {(location.pathname !== '/app' && location.pathname !== '/app/jobs' && location.pathname !== '/app/resume') && (
                        <button
                            onClick={() => navigate(-1)}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    )}
                    <h1 className="text-[16px] font-bold text-slate-900 tracking-tight leading-none pt-0.5 truncate">{pageTitle}</h1>
                </div>
            )}

            {/* Desktop Left */}
            {!isMobile && (
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">Student Dashboard</h1>
                </div>
            )}

            <div className="flex items-center gap-4 md:gap-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search for jobs..."
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
                    />
                </div>

                <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors hidden md:block">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Student")}&background=f1f5f9&color=0f172a&bold=true`}
                    alt="Profile"
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-slate-200 cursor-pointer hover:border-blue-500 transition-colors"
                />
            </div>
        </div>
    );
};

export default Topbar;
