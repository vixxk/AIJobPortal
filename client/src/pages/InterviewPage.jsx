import React, { useState, useEffect } from 'react';
import InterviewRoom from '../components/interview/InterviewRoom';
import { startInterview } from '../services/interviewApi';
import Skeleton from '../components/ui/Skeleton';
const ScoreRing = ({ score, label, color }) => {
    const r = 36;
    const circ = 2 * Math.PI * r;
    const fill = circ - (circ * Math.min(100, Math.max(0, score))) / 100;
    return (
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            <div className="relative w-16 h-16 sm:w-24 sm:h-24">
                <svg className="w-16 h-16 sm:w-24 sm:h-24 -rotate-90" viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                        cx="44" cy="44" r={r} fill="none"
                        stroke={color} strokeWidth="8"
                        strokeDasharray={circ}
                        strokeDashoffset={fill}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl font-black" style={{ color }}>{score}</span>
                </div>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-500 text-center">{label}</span>
        </div>
    );
};
const FinalReport = ({ report, jobRole, onRestart }) => {
    const { overall_score = 0, confidence_score = 0, fluency_score = 0, technical_accuracy = 0, suggestions = [] } = report;
    const grade = overall_score >= 85 ? { label: 'Excellent', emoji: '🌟', color: 'text-green-600', bg: 'from-green-50 to-emerald-50', border: 'border-green-200' }
        : overall_score >= 70 ? { label: 'Good', emoji: '👍', color: 'text-blue-600', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200' }
            : overall_score >= 55 ? { label: 'Fair', emoji: '📈', color: 'text-yellow-600', bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200' }
                : { label: 'Needs Work', emoji: '💪', color: 'text-red-600', bg: 'from-red-50 to-rose-50', border: 'border-red-200' };
    return (
        <div className="w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-start p-3 sm:p-8">
            <div className="w-full max-w-3xl space-y-4 sm:space-y-6 pb-20 sm:pb-0">

                <div className={`bg-gradient-to-br ${grade.bg} border ${grade.border} rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center shadow-lg relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <span className="text-8xl">{grade.emoji}</span>
                    </div>
                    <div className="relative z-10">
                        <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">{grade.emoji}</div>
                        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-1 leading-tight">Interview Complete!</h1>
                        <p className="text-gray-500 text-xs sm:text-sm mb-4">
                            {jobRole ? `Performance report for ${jobRole}` : 'Overall performance report'}
                        </p>
                        <div className={`inline-block px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-bold text-sm sm:text-lg ${grade.color} border ${grade.border} bg-white/80 backdrop-blur-sm shadow-sm`}>
                            {grade.label} <span className="opacity-50 mx-1">•</span> {overall_score}/100
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <h2 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 sm:mb-5 text-center">Score Breakdown</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
                        <ScoreRing score={overall_score} label="Overall" color="#4f46e5" />
                        <ScoreRing score={confidence_score} label="Confidence" color="#059669" />
                        <ScoreRing score={fluency_score} label="Fluency" color="#7c3aed" />
                        <ScoreRing score={technical_accuracy} label="Technical" color="#d97706" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-3 sm:space-y-4 flex-1">
                        <h2 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Detailed Metrics</h2>
                        {[
                            { label: 'Overall Score', value: overall_score, color: 'bg-indigo-500' },
                            { label: 'Confidence', value: confidence_score, color: 'bg-emerald-500' },
                            { label: 'Fluency', value: fluency_score, color: 'bg-purple-500' },
                            { label: 'Technical Accuracy', value: technical_accuracy, color: 'bg-amber-500' },
                        ].map(({ label, value, color }) => (
                            <div key={label}>
                                <div className="flex justify-between text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                                    <span>{label}</span>
                                    <span>{value}/100</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${color}`}
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex-1">
                        <h2 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 sm:mb-4">🎤 Vocal Performance Analysis</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-8">

                            <div className="flex justify-between items-center">
                                <span className="text-[11px] sm:text-xs font-semibold text-gray-500">Filler Words</span>
                                <span className={`text-xs sm:text-sm font-black tabular-nums ${(report.audio_metrics?.total_filler_words || 0) > 5 ? 'text-rose-500' : 'text-blue-500'}`}>
                                    {report.audio_metrics?.total_filler_words || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] sm:text-xs font-semibold text-gray-500">Modulation</span>
                                <span className="text-xs sm:text-sm font-black text-slate-800 tabular-nums">
                                    {Math.round((report.audio_metrics?.avg_modulation || 0) * 1000)} MDL
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] sm:text-xs font-semibold text-gray-500">Silence Presence</span>
                                <span className="text-xs sm:text-sm font-black text-amber-600 tabular-nums">
                                    {Math.round((report.audio_metrics?.avg_pause_ratio || 0) * 100)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] sm:text-xs font-semibold text-gray-500">Long Silences</span>
                                <span className="text-xs sm:text-sm font-black text-rose-400 tabular-nums">
                                    {report.audio_metrics?.total_long_pauses || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] sm:text-xs font-semibold text-gray-500">Avg. Pace</span>
                                <span className="text-xs sm:text-sm font-black text-blue-500 tabular-nums">
                                    {report.audio_metrics?.avg_speech_rate || 0} WPM
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-50 text-center">
                            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Comprehensive Local Audio Audit</p>
                        </div>
                    </div>
                </div>

                {suggestions.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                        <h2 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 sm:mb-4">💡 Overall Suggestions</h2>
                        <ul className="space-y-2.5 sm:space-y-3">
                            {suggestions.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2.5 sm:gap-3 text-gray-700 text-xs sm:text-sm leading-relaxed">
                                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
                                        {i + 1}
                                    </span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {report.answers && report.answers.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                        <h2 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest mb-5 sm:mb-6">📝 Interview Transcript</h2>
                        <div className="space-y-6 sm:space-y-8">
                            {report.answers.map((ans, idx) => (
                                <div key={idx} className="group transition-all">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] sm:rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-black shadow-lg shadow-slate-200 shrink-0">
                                            Q{idx + 1}
                                        </span>
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                                            {ans.question}
                                        </h3>
                                    </div>
                                    <div className="relative pl-9 sm:pl-11">
                                        <div className="absolute left-[13px] sm:left-[15px] top-0 bottom-0 w-[2px] bg-slate-50 group-last:bg-transparent" />
                                        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${ans.skipped ? 'bg-amber-50 border-amber-100 italic text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-700'} text-xs sm:text-sm leading-relaxed shadow-sm`}>
                                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-slate-400">
                                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                                {ans.skipped ? 'Skipped Question' : 'Your Response'}
                                            </div>
                                            {ans.skipped ? 'You didn\'t provide an answer for this question.' : ans.transcript || 'No transcript available.'}
                                        </div>
                                        {!ans.skipped && ans.evaluation && (
                                            <div className="mt-2.5 sm:mt-3 space-y-2">
                                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                                                    <div className="flex items-center justify-center xs:justify-start gap-2 text-indigo-600 bg-indigo-50/50 px-2.5 sm:px-3 py-1.5 rounded-lg border border-indigo-100/50">
                                                        <span>Content: <span className="text-indigo-700">{ans.evaluation.answer_score}</span>/100</span>
                                                    </div>
                                                    <div className="flex items-center justify-center xs:justify-start gap-2 text-emerald-600 bg-emerald-50/50 px-2.5 sm:px-3 py-1.5 rounded-lg border border-emerald-100/50">
                                                        <span>Delivery: <span className="text-emerald-700">{ans.evaluation.communication_score}</span>/100</span>
                                                    </div>
                                                </div>

                                                {ans.evaluation.answer_score < 70 && ans.evaluation.suggestions && ans.evaluation.suggestions.length > 0 && (
                                                    <div className="p-3 sm:p-4 bg-amber-50/40 rounded-xl border border-amber-100/50">
                                                        <div className="flex items-center gap-1.5 mb-2 text-[9px] font-black uppercase tracking-widest text-amber-600">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            Suggestion for Improvement
                                                        </div>
                                                        <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed italic">
                                                            "{Array.isArray(ans.evaluation.suggestions) ? ans.evaluation.suggestions[0] : ans.evaluation.suggestions}"
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pb-8 print:hidden">
                    <button
                        onClick={onRestart}
                        className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                    >
                        🔄 Start New Interview
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 py-3 sm:py-4 bg-white border-2 border-gray-200 hover:border-indigo-300 text-gray-700 font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all hover:-translate-y-0.5"
                    >
                        🖨️ Print Report
                    </button>
                </div>
            </div>
        </div>
    );
};
const SuggestionModal = ({ isOpen, onClose, roleSuggestions, onSelect }) => {
    if (!isOpen) return null;
    const recommendations = (roleSuggestions && roleSuggestions.length > 0)
        ? roleSuggestions.map(r => ({ role: r, icon: '🎯', color: 'from-blue-500 to-indigo-600' }))
        : [
            { role: 'Full Stack Engineer', icon: '⚡', color: 'from-blue-500 to-indigo-600' },
            { role: 'Backend Developer', icon: '⚙️', color: 'from-slate-700 to-slate-900' },
            { role: 'Frontend React Developer', icon: '⚛️', color: 'from-cyan-400 to-blue-500' },
            { role: 'Data Scientist', icon: '📊', color: 'from-purple-500 to-pink-500' },
        ];
    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in duration-300">

                <div className="shrink-0 p-6 sm:p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-indigo-100 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 text-indigo-400 hover:bg-white hover:text-indigo-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg sm:shadow-xl shadow-indigo-100/50">
                        <span className="text-3xl sm:text-4xl">🤖</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Role check!</h2>
                    <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed px-2">The AI needs a clear job role to generate relevant questions. Try one of these or refine yours:</p>
                </div>

                <div className="p-4 sm:p-6 space-y-3 overflow-y-auto min-h-0 flex-1 overscroll-contain">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 mb-1">AI Suggested Roles</p>
                    <div className="grid grid-cols-1 gap-2">
                        {recommendations.map((rec) => (
                            <button
                                key={rec.role}
                                onClick={() => onSelect(rec.role)}
                                className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all text-left"
                            >
                                <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${rec.color} flex items-center justify-center text-white text-lg sm:text-xl shadow-md sm:shadow-lg group-hover:scale-110 transition-transform`}>
                                    {rec.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-black text-gray-800 truncate leading-tight">{rec.role}</div>
                                    <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">AI Optimized Path</div>
                                </div>
                                <svg className="shrink-0 w-5 h-5 text-indigo-200 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="shrink-0 px-6 sm:px-8 py-5 sm:py-6 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 sm:py-4 text-sm font-black text-indigo-600 bg-white hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-slate-200 hover:border-indigo-200"
                    >
                        I'll type mine correctly
                    </button>
                </div>
            </div>
        </div>
    );
};
const InterviewPage = () => {
    const [loading, setLoading] = useState(true);
    const [jobRole, setJobRole] = useState('');
    const [interviewType, setInterviewType] = useState('behavioral');
    const [resume, setResume] = useState(null);
    const [isStarting, setIsStarting] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [finalReport, setFinalReport] = useState(null);
    const [suggestionData, setSuggestionData] = useState({ open: false, roles: [] });

    useEffect(() => {
        // Simulate initial check
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);
    const handleStart = async (e) => {
        if (e) e.preventDefault();
        if (!jobRole.trim() || jobRole.trim().length < 3) {
            setSuggestionData({ open: true, roles: [] });
            return;
        }
        setIsStarting(true);
        try {
            const formData = new FormData();
            formData.append('job_role', jobRole.trim());
            formData.append('interview_type', interviewType);
            if (resume) formData.append('resume', resume);
            const response = await startInterview(formData);
            // Destructure from response.data as the backend wraps everything in a 'data' object
            const { role_clear, questions, suggestions } = response.data || {};
            if (role_clear === false) {
                setSuggestionData({ open: true, roles: suggestions || [] });
                return;
            }
            setQuestions(questions || []);
        } catch (error) {
            console.error('Failed to start interview:', error);
            alert('Interview service error. Please ensure the Python backend is active.');
        } finally {
            setIsStarting(false);
        }
    };
    const handleSelectSuggestion = (role) => {
        setJobRole(role);
        setSuggestionData({ open: false, roles: [] });
    };
    if (loading || (isStarting && questions.length === 0)) {
        return (
            <div className="min-h-full w-full bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-lg w-full space-y-8">
                    <div className="flex flex-col items-center space-y-4">
                        <Skeleton className="w-20 h-20 rounded-2xl" />
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <div className="grid grid-cols-3 gap-2">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </div>
                        <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (finalReport) {
        return (
            <FinalReport
                report={finalReport}
                jobRole={jobRole}
                onRestart={() => { setFinalReport(null); setQuestions([]); setJobRole(''); }}
            />
        );
    }
    if (questions.length > 0) {
        return (
            <div className="min-h-full w-full bg-gray-50 flex flex-col py-2">
                <InterviewRoom
                    questions={questions}
                    jobRole={jobRole}
                    onComplete={(report) => setFinalReport(report)}
                />
            </div>
        );
    }
    return (
        <div className="min-h-full min-h-[500px] w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-white/60">
                { }
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-1">
                        AI Mock Interview
                    </h1>
                    <p className="text-gray-500 text-sm">Practice with an intelligent AI recruiter.
                        <br></br> Get real-time feedback on your answers.</p>
                </div>
                <form onSubmit={handleStart} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Target Job Role <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Senior React Developer, Data Scientist..."
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium text-gray-800 placeholder:text-gray-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Interview Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'behavioral', label: 'Behavioral', icon: '🧠' },
                                { value: 'technical', label: 'Technical', icon: '💻' },
                                { value: 'hr', label: 'HR / Culture', icon: '🤝' },
                            ].map(({ value, label, icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setInterviewType(value)}
                                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 font-semibold text-xs transition-all ${interviewType === value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-xl">{icon}</span>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Resume (Optional PDF)</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setResume(e.target.files[0] || null)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all text-sm text-gray-500 cursor-pointer focus:outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">Helps tailor questions to your experience.</p>
                    </div>
                    <button
                        type="submit"
                        disabled={isStarting}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-base shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5 disabled:opacity-70 flex justify-center items-center gap-3"
                    >
                        {isStarting ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Preparing Interview...
                            </>
                        ) : (
                            '🚀 Start Interview'
                        )}
                    </button>
                </form>
                <p className="text-center text-xs text-gray-400 mt-5">
                    Tip: Allow microphone access when prompted. Answers are analyzed locally.
                </p>
            </div>
            <SuggestionModal
                isOpen={suggestionData.open}
                onClose={() => setSuggestionData({ ...suggestionData, open: false })}
                roleSuggestions={suggestionData.roles}
                onSelect={handleSelectSuggestion}
            />
        </div>
    );
};
export default InterviewPage;
