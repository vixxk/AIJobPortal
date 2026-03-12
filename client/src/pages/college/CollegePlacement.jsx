import React from 'react';
import { Video, CheckSquare, Users } from 'lucide-react';

const CollegePlacement = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Conduct Placements</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Host online interviews and manage shortlisting natively.</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 max-w-lg">
                    <h2 className="text-3xl font-black mb-4">Host End-to-End Drives Online</h2>
                    <p className="text-indigo-100 mb-8 font-medium">Use our native video conferencing and shared applicant tracking system to conduct and finalize hiring seamlessly.</p>
                    <button className="px-6 h-12 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-transform shadow-lg shadow-indigo-900/50">
                        Start New Interview Room
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                    <div className="w-16 h-16 mx-auto bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                        <Video className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-2">Video Interviews</h3>
                    <p className="text-sm text-slate-500">Built-in RTC allows conducting panel interviews with multiple recruiters.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                    <div className="w-16 h-16 mx-auto bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                        <CheckSquare className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-2">Live Shortlisting</h3>
                    <p className="text-sm text-slate-500">Evaluate candidates in real-time and share scores with recruiters.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                    <div className="w-16 h-16 mx-auto bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter mb-2">Direct Hiring</h3>
                    <p className="text-sm text-slate-500">Finalize offers natively through the platform upon interview completion.</p>
                </div>
            </div>
        </div>
    );
};

export default CollegePlacement;
