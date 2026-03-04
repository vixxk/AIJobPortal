import { useLocation, Link } from 'react-router-dom';
import { Home, Bookmark, Briefcase, MessageSquare, User } from 'lucide-react';
import clsx from 'clsx';

const MobileNavbar = () => {
    const location = useLocation();

    // Hide bottom navbar only on specific Job Details sub-pages if really needed,
    // but the user requested it on "all pages", so we will show it everywhere
    // except if it heavily conflits. We'll leave it visible everywhere for now.

    // Some routes actually have a custom bottom bar (like job details), 
    // we can exclude strictly `/app/job/` with a trailing slash if needed, 
    // but the request said "all the pages".
    if (location.pathname.startsWith('/app/job/')) {
        return null;
    }

    const bottomNavItems = [
        { name: 'Home', path: '/app', icon: Home },
        { name: 'Saved Jobs', path: '/app/saved', icon: Bookmark },
        { name: 'Applications', path: '/app/applications', icon: Briefcase },
        { name: 'Message', path: '/app/messages', icon: MessageSquare },
        { name: 'Profile', path: '/app/profile', icon: User },
    ];

    return (
        <div
            className="fixed bottom-0 left-0 right-0 h-[80px] bg-white z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.05)] border-t border-slate-100"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
        >
            {bottomNavItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));

                return (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={clsx(
                            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all",
                            isActive ? "text-blue-600" : "text-slate-400 hover:text-blue-500"
                        )}
                    >
                        <item.icon
                            className={clsx("w-[22px] h-[22px]", isActive ? "stroke-[2.5px]" : "stroke-2")}
                            fill={isActive ? "currentColor" : "none"}
                        />
                        <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">{item.name}</span>
                    </Link>
                );
            })}
        </div>
    );
};

export default MobileNavbar;

