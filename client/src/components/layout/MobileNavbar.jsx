import { useLocation, Link } from 'react-router-dom';
import { Home, Bookmark, User, HelpCircle, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';
const MobileNavbar = () => {
    const location = useLocation();
    const { user } = useAuth();
    if (location.pathname.startsWith('/app/job/') || location.pathname === '/app/interview') {
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
            className="fixed bottom-0 left-0 right-0 h-[80px] bg-white z-[100] flex items-center justify-around px-2 pb-safe shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.05)] border-t border-slate-100"
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
