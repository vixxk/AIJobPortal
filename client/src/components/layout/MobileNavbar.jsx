import { useLocation, Link } from 'react-router-dom';
import { Home, Bookmark, User, HelpCircle, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const MobileNavbar = () => {
    const location = useLocation();
    const { user } = useAuth();

    if (location.pathname.startsWith('/app/job/') || location.pathname === '/app/interview' || location.pathname === '/app/resume') {
        return null;
    }

    const bottomNavItems = [
        { name: 'Home', path: '/app', icon: Home },
        { name: 'Saved', path: '/app/saved', icon: Bookmark },
        { name: 'Contest', path: '/app/competitions', icon: Trophy },
        { name: 'Help', path: '/app/help', icon: HelpCircle },
        { name: 'Profile', path: '/app/profile', icon: User },
    ].filter(item => {
        if (user?.role === 'RECRUITER') {
            return item.name !== 'Contest' && item.name !== 'Saved';
        }
        return true;
    });

    return (
        <div
            className="fixed bottom-0 left-0 right-0 h-[66px] bg-white/90 backdrop-blur-md z-[100] flex items-center justify-around px-2 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.05)] border-t border-slate-100/60"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
        >
            {bottomNavItems.map((item) => {
                const isActive = location.pathname === item.path || 
                                 (item.path === '/app' && location.pathname === '/app/dashboard') || 
                                 (item.path !== '/app' && location.pathname.startsWith(item.path));
                return (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={clsx(
                            "flex flex-col items-center justify-center w-14 h-full gap-0.5 transition-all relative active:scale-95",
                            isActive ? "text-blue-600" : "text-slate-400 hover:text-blue-500"
                        )}
                    >
                        <item.icon
                            className={clsx("w-[20px] h-[20px] transition-transform duration-200", isActive ? "stroke-[2.5px] scale-110" : "stroke-2")}
                            fill={isActive ? "currentColor" : "none"}
                        />
                        <span className="text-[9.5px] font-bold mt-0.5 tracking-tight whitespace-nowrap">{item.name}</span>
                        {isActive && (
                            <span className="absolute bottom-0 w-1 h-1 rounded-full bg-blue-600 animate-fade-in" />
                        )}
                    </Link>
                );
            })}
        </div>
    );
};

export default MobileNavbar;
