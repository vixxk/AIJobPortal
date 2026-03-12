import React, { useState, useEffect } from 'react';
import { getTutorDashboard } from '../services/englishTutorApi';

import SpeakingTest from '../components/english-tutor/SpeakingTest';
import LessonFlow from '../components/english-tutor/LessonFlow';
import TutorStats from '../components/english-tutor/TutorStats';

const ROADMAP_LEVELS = [
    { level: 1, name: 'Beginner', desc: 'Basic greetings & common objects' },
    { level: 2, name: 'Elementary', desc: 'Daily activities & simple descriptions' },
    { level: 3, name: 'Pre-Intermediate', desc: 'Travel, work & future plans' },
    { level: 4, name: 'Intermediate', desc: 'Complex opinions & abstract topics' },
    { level: 5, name: 'Upper-Intermediate', desc: 'Detailed professional discussions' },
    { level: 6, name: 'Advanced', desc: 'Fluent academic discourse' },
    { level: 7, name: 'Proficient', desc: 'Native-like mastery' },
    { level: 8, name: 'Mastery', desc: 'Deep nuances & complex idioms' },
    { level: 9, name: 'Expert', desc: 'Culturally intuitive communication' },
    { level: 10, name: 'Professional', desc: 'Complete executive fluency' },
];

const EnglishTutor = () => {
    const [loading, setLoading] = useState(true);
    const [tutorData, setTutorData] = useState(null);
    const [view, setView] = useState('dashboard');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await getTutorDashboard();
            setTutorData(res.data.data);
        } catch (err) {
            console.error('Failed to fetch tutor data', err);
        } finally {
            setLoading(false);
        }
    };

    const TutorSkeleton = () => (
        <div className="min-h-screen bg-[#FCFDFF] animate-pulse">
            <div className="max-w-6xl mx-auto px-8 pt-8 space-y-6">
                <div className="bg-white rounded-2xl h-[280px] border border-slate-200" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-[400px] bg-white rounded-2xl border border-slate-200" />
                    <div className="h-[400px] bg-white rounded-2xl border border-slate-200" />
                </div>
                <div className="bg-white rounded-xl h-[120px] border border-slate-200" />
            </div>
        </div>
    );

    if (loading) return <TutorSkeleton />;

    if (view === 'test') {
        return <SpeakingTest onComplete={(data) => { setTutorData(data); setView('dashboard'); }} onCancel={() => setView('dashboard')} />;
    }

    if (view === 'lesson') {
        return <LessonFlow level={tutorData.currentLevel} onComplete={() => { fetchDashboard(); setView('dashboard'); }} onCancel={() => setView('dashboard')} />;
    }

    const currentLevelInfo = ROADMAP_LEVELS.find(l => l.level === tutorData?.currentLevel) || ROADMAP_LEVELS[0];

    const GoalItem = ({ label, target, value, isCompleted }) => (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-200'}`} />
                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
            </div>
            <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
                {isCompleted ? 'Done' : target}
            </span>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FCFDFF] pb-12">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 md:pt-8 space-y-4 md:space-y-6">
                <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <div className="shrink-0">
                            <div className="w-16 h-16 md:w-28 md:h-28 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200">
                                {tutorData?.xp > 1000 ? <span className="text-2xl md:text-4xl">👑</span> : <span className="text-2xl md:text-4xl text-slate-400">👤</span>}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-50 rounded-lg text-indigo-600 mb-2 md:mb-3 border border-indigo-100">
                                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Session Active • {tutorData?.xp || 0} XP</span>
                            </div>
                            <h1 className="text-xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2 leading-tight">
                                {tutorData?.isInitialTestCompleted
                                    ? `Continue your Level ${tutorData.currentLevel} journey`
                                    : "Assess Your Speaking Proficiency"}
                            </h1>
                            <p className="text-slate-500 text-xs md:text-base font-medium max-w-2xl mb-4 md:mb-6 leading-relaxed">
                                {tutorData?.isInitialTestCompleted
                                    ? `Focusing on: ${tutorData.focusAreas?.join(', ') || 'General Fluency'}.`
                                    : "Refine your pronunciation and build professional confidence with AI-driven assessments."}
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {!tutorData?.isInitialTestCompleted ? (
                                    <button
                                        onClick={() => setView('test')}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 md:px-8 md:py-3.5 bg-indigo-600 hover:bg-slate-900 text-white text-xs md:text-sm font-semibold rounded-lg md:rounded-xl transition-all shadow-sm active:scale-95"
                                    >
                                        <span>Start Assessment</span>
                                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setView('lesson')}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 md:px-8 md:py-3.5 bg-indigo-600 hover:bg-slate-900 text-white text-xs md:text-sm font-semibold rounded-lg md:rounded-xl transition-all shadow-sm active:scale-95"
                                    >
                                        <span>Start Practice</span>
                                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" /></svg>
                                    </button>
                                )}
                                <div className="flex items-center gap-1.5 px-3.5 py-2.5 md:px-5 md:py-3.5 bg-slate-50 rounded-lg md:rounded-xl border border-slate-200">
                                    <span className="text-sm">🔥</span>
                                    <span className="text-xs md:text-sm font-bold text-slate-700">{tutorData?.streak || 0} Streak</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        <TutorStats stats={tutorData?.stats} errorTracking={tutorData?.errorTracking} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6 lg:space-y-6">
                        <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-[10px] md:text-sm font-bold text-slate-900 mb-4 md:mb-6 uppercase tracking-wider">Daily Goals</h2>

                            <div className="space-y-4 md:space-y-6">
                                <div className="space-y-2 md:space-y-3">
                                    <GoalItem
                                        label="Complete Lesson"
                                        target="0/1"
                                        isCompleted={tutorData?.dailyGoals?.lessonCompleted}
                                    />
                                    <GoalItem
                                        label="Speak 15 mins"
                                        target={`${tutorData?.dailyGoals?.speakingMinutes || 0}/15`}
                                        isCompleted={tutorData?.dailyGoals?.speakingMinutes >= 15}
                                    />
                                    <GoalItem
                                        label="Learn 5 words"
                                        target={`${tutorData?.dailyGoals?.newWordsLearned || 0}/5`}
                                        isCompleted={tutorData?.dailyGoals?.newWordsLearned >= 5}
                                    />
                                </div>

                                <div className="pt-4 md:pt-6 border-t border-slate-100">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity</span>
                                        <span className="text-[9px] md:text-[10px] font-bold text-indigo-500 uppercase">Steady</span>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                            <div key={i} className="flex flex-col items-center gap-1 md:gap-1.5">
                                                <div className={`w-full aspect-square rounded-sm md:rounded-md border ${i === new Date().getDay() - 1 ? 'bg-indigo-600 border-indigo-600' : 'border-slate-100 bg-slate-50'}`} />
                                                <span className="text-[7px] md:text-[8px] font-bold text-slate-400">{day}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h2 className="text-[10px] md:text-sm font-bold text-slate-900 uppercase tracking-wider">Achievements</h2>
                                <span className="text-[9px] md:text-[10px] font-bold text-indigo-500 tracking-tighter">View All</span>
                            </div>

                            <div className="space-y-4 md:space-y-5">
                                {tutorData.lessonsProgress?.slice().reverse().slice(0, 3).map((lesson, idx) => (
                                    <div key={idx} className="flex items-start gap-2 md:gap-3">
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 text-[10px] md:text-xs truncate leading-none mb-0.5 md:mb-1">{lesson.title}</p>
                                            <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                {new Date(lesson.dateCompleted).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • +{lesson.xpEarned || 100} XP
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {(!tutorData.lessonsProgress || tutorData.lessonsProgress.length === 0) && (
                                    <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">No Sessions</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h2 className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wider">Curriculum</h2>
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Mastery Roadmap</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] md:text-xs font-black text-indigo-600 uppercase">LVL {tutorData.currentLevel}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                        {ROADMAP_LEVELS.map((item) => {
                            const isCompleted = item.level < tutorData.currentLevel;
                            const isCurrent = item.level === tutorData.currentLevel;
                            const isLocked = item.level > tutorData.currentLevel;

                            return (
                                <div key={item.level} className={`relative p-3 md:p-5 border-b border-r border-slate-100 last:border-r-0 transition-all ${isCurrent ? 'bg-indigo-600 text-white z-10 shadow-inner' : isCompleted ? 'bg-emerald-50/20' : 'bg-white opacity-60'}`}>
                                    <div className="flex flex-col h-full justify-between gap-1.5 md:gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-indigo-100' : 'text-slate-400'}`}>Lvl {item.level}</span>
                                            {isCompleted && <span className="text-emerald-500 font-bold text-[9px] md:text-[10px]">✓</span>}
                                        </div>
                                        <div className="space-y-0.5 md:space-y-1">
                                            <h3 className={`font-bold text-[10px] md:text-xs uppercase tracking-wide truncate ${isCurrent ? 'text-white' : 'text-slate-700'}`}>{item.name}</h3>
                                            <p className={`text-[8px] md:text-[10px] font-medium leading-tight line-clamp-1 md:line-clamp-2 ${isCurrent ? 'text-indigo-100/80' : 'text-slate-400'}`}>{item.desc}</p>
                                        </div>
                                    </div>
                                    {isLocked && <div className="absolute inset-0 bg-slate-50/5 pointer-events-none" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnglishTutor;
