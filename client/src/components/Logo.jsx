import React from 'react';
import { Layers, Sparkle } from 'lucide-react';
import { Link } from 'react-router-dom';
export const LogoIcon = ({ className = 'w-10 h-10' }) => (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-lg shadow-blue-500/30 shrink-0 ${className}`}>
        <Layers className="w-[55%] h-[55%] text-white" strokeWidth={2.5} />
        <Sparkle className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-md animate-pulse" />
    </div>
);
const Logo = ({ className = '', iconSize = 'w-10 h-10', textClassName = 'text-2xl text-slate-800', withText = true, to = "/" }) => {
    return (
        <Link to={to} className={`flex items-center gap-3 hover:opacity-90 transition-opacity ${className}`}>
            <LogoIcon className={iconSize} />
            {withText && (
                <span className={`font-extrabold tracking-tight ${textClassName}`}>
                    Job<span className="text-blue-600">Portal</span>
                </span>
            )}
        </Link>
    );
};
export default Logo;
