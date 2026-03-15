import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavbar from './MobileNavbar';
import Topbar from './Topbar';
const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const location = useLocation();
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    useEffect(() => {
        const closeSidebar = async () => {
            if (isMobile) {
                setIsSidebarOpen(false);
            }
        };
        closeSidebar();
    }, [location.pathname, isMobile]);
    useEffect(() => {
        const mainContainer = document.getElementById('main-scroll-container');
        if (mainContainer) {
            mainContainer.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [location.pathname]);
    return (
        <div className="flex h-screen overflow-hidden bg-background print:h-auto print:bg-white print:overflow-visible">
            { }
            {!isMobile && !['/app/admin', '/app/teacher', '/app/college'].some(path => location.pathname.startsWith(path)) && (
                <div className="print:hidden h-full">
                    <Sidebar
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                    />
                </div>
            )}
            { }
            <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden print:overflow-visible">
                { }
                {!['/app/learning', '/app/admin', '/app/teacher', '/app/college'].some(path => location.pathname.startsWith(path)) && (
                    <>
                        {isMobile && !isSidebarOpen && <MobileNavbar toggleSidebar={() => setIsSidebarOpen(true)} />}
                        <div className="print:hidden z-10 sticky top-0 bg-background">
                            <Topbar toggleSidebar={() => setIsSidebarOpen(true)} isMobile={isMobile} />
                        </div>
                    </>
                )}
                { }
                <main id="main-scroll-container" className={`flex-1 overflow-y-auto relative scroll-smooth print:p-0 print:overflow-visible print:bg-white ${['/app/learning', '/app/admin', '/app/teacher', '/app/college'].some(path => location.pathname.startsWith(path)) ? 'p-0' : 'px-4 py-4 md:p-6 pb-24 md:pb-6'}`}>
                    <Outlet context={{ toggleSidebar: () => setIsSidebarOpen(true) }} />
                </main>
            </div>
            { }
            {isMobile && isSidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-40"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-[280px] bg-[#0F172A] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl">
                        <Sidebar isOpen={true} setIsOpen={setIsSidebarOpen} isMobile={true} />
                    </div>
                </>
            )}
        </div>
    );
};
export default MainLayout;
