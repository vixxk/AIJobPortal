import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

const ComingSoon = ({ feature }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-slate-200 relative overflow-hidden">
                <Clock className="w-10 h-10 text-slate-400" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent animate-shimmer"></div>
            </div>

            <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
                {feature}
            </h2>
            <p className="text-slate-500 max-w-md mb-8">
                We're working hard to bring this feature to life. It will be available in the next major update. Stay tuned!
            </p>

            <Link
                to="/app"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-md"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>
        </div>
    );
};

export default ComingSoon;
