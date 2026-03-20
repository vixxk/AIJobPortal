import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { skipAssessment } from '../../services/englishTutorApi';
import { useTutor } from './TutorLayout';

const TutorWelcome = () => {
    const navigate = useNavigate();
    const { fetchDashboard } = useTutor();

    const handleSkip = async () => {
        try {
            await skipAssessment();
            await fetchDashboard();
            navigate('/app/english-tutor');
        } catch (err) {
            console.error('Failed to skip assessment', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl w-full bg-white rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-2xl shadow-slate-200 text-center relative overflow-hidden"
            >
                {/* Visual accents */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl opacity-60" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl opacity-50" />

                <div className="relative z-10">
                    <div className="w-20 h-20 md:w-28 md:h-28 bg-indigo-600 rounded-3xl md:rounded-[2rem] mx-auto flex items-center justify-center shadow-xl shadow-indigo-100 rotate-3 mb-8 md:mb-12">
                        <span className="text-3xl md:text-5xl">👋</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                        Experience your AI-Powered <br className="hidden md:block" /><span className="text-indigo-600">English Tutor</span>
                    </h1>
                    
                    <p className="text-slate-500 text-base md:text-xl font-medium max-w-xl mx-auto mb-10 md:mb-16 leading-relaxed">
                        To tailor your learning experience, we'll start with a quick assessment or you can begin your journey from Level 1.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
                        <button
                            onClick={() => navigate('/app/english-tutor/assessment')}
                            className="w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-slate-900 text-white text-sm md:text-base font-black rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95 group"
                        >
                            <span>Start Placement Test</span>
                        </button>
                        
                        <button
                            onClick={handleSkip}
                            className="w-full sm:w-auto px-10 py-5 bg-white hover:bg-slate-50 text-slate-900 text-sm md:text-base font-bold rounded-2xl border border-slate-200 transition-all active:scale-95"
                        >
                            Start from Level 1
                        </button>
                    </div>

                    <div className="mt-12 md:mt-16 flex items-center justify-center gap-8 md:gap-12 opacity-40 grayscale pointer-events-none">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🎙️</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Voice-first</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">⚡</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Real-time</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🤖</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">AI-Guided</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TutorWelcome;
