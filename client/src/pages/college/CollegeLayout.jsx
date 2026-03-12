import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Search, Mail, Calendar, Settings, FileText } from 'lucide-react';

const CollegeLayout = () => {
    const location = useLocation();

    const navItems = [
        { path: '/app/college', label: 'Overview', icon: Home },
        { path: '/app/college/profile', label: 'College Profile', icon: Settings },
        { path: '/app/college/drives', label: 'Placement Drives', icon: Calendar },
        { path: '/app/college/companies', label: 'Search Companies', icon: Search },
        { path: '/app/college/emails', label: 'Send Emails', icon: Mail },
        { path: '/app/college/placement', label: 'Conduct Placement', icon: FileText }
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900">College Cell</h2>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-500 mt-1">Placement Portal</div>
                    </div>
                </div>
                
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navItems.map((item) => {
                        const active = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                    active 
                                    ? 'bg-indigo-50 text-indigo-600' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 relative p-4 md:p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default CollegeLayout;
