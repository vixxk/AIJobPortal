import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TutorStats from '../../components/english-tutor/TutorStats';
import { useTutor } from './TutorLayout';
import { resetProgression } from '../../services/englishTutorApi';
import { Trophy, Flame, Play, ChevronRight, History, Target, Map, Trash2, RotateCcw } from 'lucide-react';

const ROADMAP_LEVELS = [
    { level: 1, name: 'Beginner', desc: 'Basic greetings & common objects', icon: '🌱' },
    { level: 2, name: 'Elementary', desc: 'Daily activities & simple descriptions', icon: '📗' },
    { level: 3, name: 'Pre-Intermediate', desc: 'Travel, work & future plans', icon: '🗺️' },
    { level: 4, name: 'Intermediate', desc: 'Complex opinions & abstract topics', icon: '💡' },
    { level: 5, name: 'Upper-Intermediate', desc: 'Detailed professional discussions', icon: '🎯' },
    { level: 6, name: 'Advanced', desc: 'Fluent academic discourse', icon: '🎓' },
    { level: 7, name: 'Proficient', desc: 'Native-like mastery', icon: '🌟' },
    { level: 8, name: 'Mastery', desc: 'Deep nuances & complex idioms', icon: '👑' },
    { level: 9, name: 'Expert', desc: 'Culturally intuitive communication', icon: '🏆' },
    { level: 10, name: 'Professional', desc: 'Complete executive fluency', icon: '💎' },
];

const GoalItem = ({ label, target, isCompleted }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 border border-slate-200'}`}>
                {isCompleted && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                )}
            </div>
            <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
        </div>
        <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
            {isCompleted ? '✓ Done' : target}
        </span>
    </div>
);

const TutorDashboard = () => {
    const { tutorData } = useTutor();
    const navigate = useNavigate();

    useEffect(() => {
        if (tutorData && !tutorData.isInitialTestCompleted) {
            navigate('/app/english-tutor/welcome', { replace: true });
        }
    }, [tutorData, navigate]);

    const handleReset = async () => {
        const confirmed = window.confirm(
            "⚠️ DANGER ZONE: ARE YOU SURE?\n\nThis will permanently DELETE your:\n- English Level and XP\n- All Lesson History\n- Your Streak and Stats\n\nYou will have to take the Speaking Assessment again from zero.\n\nProceed with full reset?"
        );
        if (confirmed) {
            try {
                await resetProgression();
                window.location.reload();
            } catch (err) {
                console.error('Reset failed', err);
                alert('Reset failed. Please check your connection.');
            }
        }
    };

    if (!tutorData || !tutorData.isInitialTestCompleted) return null;

    const currentLevelInfo = ROADMAP_LEVELS.find(l => l.level === tutorData?.currentLevel) || ROADMAP_LEVELS[0];
    const lessonsInLevel = tutorData?.lessonsInCurrentLevel || 0;
    const lessonsNeeded = tutorData?.lessonsNeededForUpgrade || 5;

    return (
        <div className="min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 md:pt-10 space-y-4 md:space-y-10">
                {/* Hero / Header Section */}
                <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
                        <div className="shrink-0">
                            <div className="w-16 h-16 md:w-40 md:h-40 bg-slate-50 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center border border-slate-200 shadow-inner group">
                                <span className="text-2xl md:text-6xl group-hover:scale-110 transition-transform">{currentLevelInfo.icon}</span>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 rounded-full text-white mb-4 shadow-lg shadow-indigo-100 border border-indigo-500/30">
                                <Trophy size={11} className="text-white opacity-80" />
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{tutorData?.xp || 0} Total XP Earned</span>
                            </div>
                            <h1 className="text-xl md:text-5xl font-black text-slate-900 mb-2 md:mb-4 tracking-tight leading-none group">
                                {currentLevelInfo.name} Journey
                            </h1>
                            <p className="text-slate-500 text-[10px] md:text-sm font-medium max-w-2xl mb-4 md:mb-6 leading-relaxed">
                                {tutorData?.focusAreas?.length > 0 
                                    ? `Focusing on: ${tutorData.focusAreas.join(', ')}`
                                    : 'Practice daily to build your English proficiency step by step.'
                                }
                            </p>

                            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                                <button
                                    onClick={() => navigate('/app/english-tutor/lesson')}
                                    className="inline-flex items-center gap-3 px-6 py-3.5 md:px-8 md:py-4 bg-indigo-600 hover:bg-slate-900 text-white text-[10px] md:text-sm font-bold rounded-2xl transition-all shadow-xl shadow-indigo-100 hover:shadow-slate-200 active:scale-95 group"
                                >
                                    <span>Start Practice Session</span>
                                    <Play size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="flex items-center gap-3 px-5 py-3.5 md:py-4 bg-slate-50 rounded-2xl border border-slate-200">
                                    <Flame size={20} className="text-orange-500" />
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Streak</p>
                                        <p className="text-sm font-black text-slate-900 leading-none mt-1">{tutorData?.streak || 0} Days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                    <div className="lg:col-span-8 space-y-6 md:space-y-10">
                        {/* Stats Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Performance Deep-dive</h2>
                                <button onClick={() => navigate('/app/english-tutor/assessment')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors">Retake Assessment</button>
                            </div>
                            <TutorStats stats={tutorData?.stats} errorTracking={tutorData?.errorTracking} />
                        </section>

                        {/* Recent Activity */}
                        <section className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900 mb-8 tracking-tight">Recent Sessions</h2>
                            <div className="space-y-4">
                                {tutorData.lessonsProgress?.slice().reverse().slice(0, 5).map((lesson, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-500 shadow-sm">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-xs md:text-sm font-bold text-slate-800 leading-none mb-1">{lesson.title}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                    Level {lesson.level} • {new Date(lesson.dateCompleted).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs md:text-sm font-black text-indigo-600 leading-none">+{lesson.xpEarned || 100} XP</p>
                                        </div>
                                    </div>
                                ))}
                                {(!tutorData.lessonsProgress || tutorData.lessonsProgress.length === 0) && (
                                    <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No previous sessions found</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-4 space-y-6 md:space-y-10">
                        {/* Daily Progress Card */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Daily Targets</h2>
                                <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
                                    Reset in {tutorData?.hoursUntilReset || 24}h
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <GoalItem
                                        label="Session Completed"
                                        isCompleted={tutorData?.dailyGoals?.lessonCompleted}
                                    />
                                    <GoalItem
                                        label="5m Active Speaking"
                                        target={`${Math.round((tutorData?.dailyGoals?.speakingMinutes || 0) * 10) / 10}/5`}
                                        isCompleted={tutorData?.dailyGoals?.speakingMinutes >= 5}
                                    />
                                    <GoalItem
                                        label="Learn 5 New Words"
                                        target={`${tutorData?.dailyGoals?.newWordsLearned || 0}/5`}
                                        isCompleted={tutorData?.dailyGoals?.newWordsLearned >= 5}
                                    />
                                </div>

                                <div className="pt-8 border-t border-slate-100">
                                    <div className="flex items-baseline justify-between mb-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentLevelInfo.name} Progress</span>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase">{lessonsInLevel}/{lessonsNeeded}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(lessonsInLevel / lessonsNeeded) * 100}%` }}
                                            className="h-full bg-indigo-600 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.3)]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Curriculum Sidebar */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm overflow-hidden">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-8">Level Roadmap</h2>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {ROADMAP_LEVELS.map((item) => {
                                    const isCurrent = item.level === tutorData.currentLevel;

                                    return (
                                        <button 
                                            key={item.level}
                                            onClick={() => navigate(`/app/english-tutor/lesson?level=${item.level}`)}
                                            className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
                                                isCurrent 
                                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-100'
                                                    : 'bg-white hover:border-indigo-200 border-slate-100'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-[9px] font-black uppercase tracking-tighter ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}>Level {item.level}</span>
                                            </div>
                                            <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-white' : 'text-slate-800'}`}>{item.name}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleReset}
                                className="w-full mt-6 py-3 px-4 rounded-xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest transition-all group flex items-center justify-center gap-2"
                            >
                                <svg className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Reset Entire Progression
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorDashboard;
