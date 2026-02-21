import { useState, useEffect, useRef } from 'react';
import { Home, Bookmark, Briefcase, MessageSquare, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const MobileNavbar = () => {
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    // Hide bottom navbar on Job Details page
    if (location.pathname.startsWith('/app/job')) {
        return null;
    }

    useEffect(() => {
        const scrollContainer = document.getElementById('main-scroll-container');
        if (!scrollContainer) return;

        const handleScroll = () => {
            const currentScrollY = scrollContainer.scrollTop;

            // Hide if scrolled down more than 50px
            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsVisible(false);
            }
            // Show if scrolling up
            else if (currentScrollY < lastScrollY.current) {
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    const bottomNavItems = [
        { name: 'Home', path: '/app', icon: Home },
        { name: 'Saved Jobs', path: '/app/saved', icon: Bookmark },
        { name: 'Applications', path: '/app/applications', icon: Briefcase },
        { name: 'Message', path: '/app/messages', icon: MessageSquare },
        { name: 'Profile', path: '/app/settings', icon: User },
    ];

    return (
        <div
            className={clsx(
                "fixed bottom-0 left-0 right-0 h-[80px] bg-white z-50 flex items-center justify-around px-2 pb-safe transition-transform duration-300 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.05)]",
                isVisible ? "translate-y-0" : "translate-y-full"
            )}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
        >
            {bottomNavItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
                const Component = item.name === 'Home' ? Link : 'div';
                const props = item.name === 'Home' ? { to: item.path } : {};

                return (
                    <Component
                        key={item.name}
                        {...props}
                        className={clsx(
                            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all",
                            isActive ? "text-blue-600" : "text-slate-400"
                        )}
                    >
                        <item.icon
                            className={clsx("w-[22px] h-[22px]", isActive ? "stroke-[2.5px]" : "stroke-2")}
                            fill={isActive ? "currentColor" : "none"}
                        />
                        <span className="text-[10px] font-semibold mt-0.5 whitespace-nowrap">{item.name}</span>
                    </Component>
                );
            })}
        </div>
    );
};

export default MobileNavbar;
