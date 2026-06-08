import { Link } from 'react-router-dom';
export const LogoIcon = ({ className = 'w-10 h-10' }) => (
    <img 
        src="/hyrego-logo-favicon.png" 
        alt="Hyrego Logo" 
        className={`object-contain rounded-xl shrink-0 ${className}`} 
    />
);
const Logo = ({ className = '', iconSize = 'w-10 h-10', textClassName = 'text-2xl text-slate-800', withText = true, to = "/" }) => {
    return (
        <Link to={to} className={`flex items-center gap-3 hover:opacity-90 transition-opacity ${className}`}>
            <LogoIcon className={iconSize} />
            {withText && (
                <span className={`font-extrabold tracking-tight ${textClassName}`}>
                    Hyre<span className="text-blue-600">go</span>
                </span>
            )}
        </Link>
    );
};
export default Logo;
