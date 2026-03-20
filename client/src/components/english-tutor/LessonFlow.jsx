import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, X, RotateCcw } from 'lucide-react';
import { getLesson, submitLessonTask, completeLesson, speakText } from '../../services/englishTutorApi';
import LiveAnswerBox from '../interview/LiveAnswerBox';

const ELENA_MESSAGES = {
    start: "Welcome to today's session! Let's dive into our topic and practice your spoken English.",
    task_repeat: "First, let's practice your pronunciation. Listen to me and repeat the sentence exactly as I say it.",
    task_question: "Excellent. Now, I have a question for you about what we just covered. Take your time to answer clearly.",
    task_free_speech: "This is the final challenge! Express your thoughts on this topic. Don't worry about being perfect, just keep speaking.",
    summary: "Wonderful progress! You've completed all tasks for this lesson. Let's see how you did!"
};

const LessonFlow = ({ level, onComplete, onCancel }) => {
    const [loading, setLoading] = useState(true);
    const [lesson, setLesson] = useState(null);
    const [currentTaskIdx, setCurrentTaskIdx] = useState(-1); // -1 for Intro/Story
    const [feedback, setFeedback] = useState(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [taskScores, setTaskScores] = useState([]);
    const [showIntro, setShowIntro] = useState(true);
    const [isElenaSpeaking, setIsElenaSpeaking] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const audioRef = useRef(null);
    const lastSpokenRef = useRef("");
    const [isAudioFetching, setIsAudioFetching] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const fetchLesson = async () => {
        try {
            const res = await getLesson(level);
            setLesson(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch lesson', err);
            onCancel();
        }
    };

    const handleSpeak = async (text, isAuto = false) => {
        if (!text) return;
        if (isAuto) {
            setIsAudioFetching(true);
            setIsAudioLoading(true);
            // Safety timeout to prevent getting stuck
            setTimeout(() => setIsAudioLoading(false), 5000);
        } else {
            setIsElenaSpeaking(true);
        }

        try {
            const blob = await speakText(text);
            const url = URL.createObjectURL(blob.data);
            if (isAuto) setIsAudioFetching(false);
            
            if (audioRef.current) {
                audioRef.current.src = url;
                setIsElenaSpeaking(true);
                audioRef.current.play().catch(err => {
                    console.warn("Autoplay blocked or play failed:", err);
                    setIsAudioLoading(false);
                    setIsElenaSpeaking(false);
                });
            }
        } catch (err) {
            console.error('TTS failed', err);
            setIsAudioFetching(false);
            setIsAudioLoading(false);
            setIsElenaSpeaking(false);
        }
    };

    useEffect(() => {
        fetchLesson();
    }, [level]);

    useEffect(() => {
        let interval;
        const isTimerRunning = !isElenaSpeaking && !showIntro && !isEvaluating && !loading && currentTaskIdx >= 0;
        if (isTimerRunning && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isElenaSpeaking, showIntro, isEvaluating, loading, timeRemaining, currentTaskIdx]);

    useEffect(() => {
        if (!lesson || loading || !hasInteracted) return;

        if (showIntro) {
            let msg = "";
            if (currentTaskIdx === -1) msg = ELENA_MESSAGES.start;
            else {
                const task = lesson.tasks[currentTaskIdx];
                msg = ELENA_MESSAGES[`task_${task.type}`] || "Let's try the next task.";
            }

            if (msg && lastSpokenRef.current !== `intro-${currentTaskIdx}`) {
                lastSpokenRef.current = `intro-${currentTaskIdx}`;
                handleSpeak(msg, true);
            }
        } else {
            let textToSpeak = "";
            let autoSpeak = false;

            if (currentTaskIdx !== -1) {
                const task = lesson.tasks[currentTaskIdx];
                textToSpeak = task.text_to_repeat || task.prompt;
                
                // Only automatic for repeat tasks, so they can hear what they must repeat
                if (task.type === 'repeat') {
                    autoSpeak = true;
                }
            }

            if (autoSpeak && textToSpeak && lastSpokenRef.current !== `content-${currentTaskIdx}`) {
                lastSpokenRef.current = `content-${currentTaskIdx}`;
                handleSpeak(textToSpeak, true);
            }
        }
    }, [showIntro, currentTaskIdx, lesson, loading]);

    useEffect(() => {
        let t = 60;
        if (currentTaskIdx >= 0) {
            const task = lesson?.tasks[currentTaskIdx];
            if (task?.type === 'free_speech') t = 90;
            if (task?.type === 'repeat') t = 30;
        }
        setTimeRemaining(t);
    }, [currentTaskIdx, lesson]);

    const handleTaskSubmit = async (transcript, blob) => {
        if (currentTaskIdx === -1) {
            // If it was just the story reading, move to first task
            nextTask();
            return;
        }

        setIsEvaluating(true);
        try {
            const task = lesson.tasks[currentTaskIdx];
            const context = {
                prompt: task.prompt,
                text_to_repeat: task.text_to_repeat,
                correct_answer_hint: task.correct_answer_hint
            };

            const fd = new FormData();
            fd.append('task_type', task.type);
            fd.append('transcript', transcript);
            fd.append('context_json', JSON.stringify(context));
            if (blob) fd.append('audio', blob, 'task.webm');

            const res = await submitLessonTask(fd);
            const evalResult = res.data.data.evaluation;

            setFeedback(evalResult);
            const taskFullScores = evalResult.scores || {
                overall: evalResult.score || 0,
                fluency: evalResult.score || 0,
                grammar: evalResult.score || 0,
                vocabulary: evalResult.score || 0,
                pronunciation: evalResult.score || 0
            };
            setTaskScores([...taskScores, taskFullScores]);
        } catch (err) {
            console.error('Task evaluation failed', err);
        } finally {
            setIsEvaluating(false);
        }
    };

    const nextTask = () => {
        setFeedback(null);
        if (currentTaskIdx < (lesson?.tasks?.length || 0) - 1) {
            setCurrentTaskIdx(currentTaskIdx + 1);
            setShowIntro(true);
        } else {
            finishLesson();
        }
    };

    const finishLesson = async () => {
        const avgScores = taskScores.length > 0 ? {
            overall: Math.round(taskScores.reduce((acc, curr) => acc + curr.overall, 0) / taskScores.length),
            fluency: Math.round(taskScores.reduce((acc, curr) => acc + curr.fluency, 0) / taskScores.length),
            grammar: Math.round(taskScores.reduce((acc, curr) => acc + curr.grammar, 0) / taskScores.length),
            vocabulary: Math.round(taskScores.reduce((acc, curr) => acc + curr.vocabulary, 0) / taskScores.length),
            pronunciation: Math.round(taskScores.reduce((acc, curr) => acc + curr.pronunciation, 0) / taskScores.length),
        } : { overall: 0, fluency: 0, grammar: 0, vocabulary: 0, pronunciation: 0 };

        try {
            await completeLesson({
                lessonId: lesson.title,
                title: lesson.title,
                level: level,
                scores: avgScores
            });
            onComplete();
        } catch (err) {
            console.error('Failed to complete lesson', err);
        }
    };

    if (loading || !lesson) return (
        <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center p-6 md:p-8">
            <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest text-center">Preparing Level {level} Lesson...</h2>
        </div>
    );

    const currentTask = currentTaskIdx === -1 ? null : lesson.tasks[currentTaskIdx];

    return (
        <div className="min-h-[100dvh] bg-[#FCFDFF] pb-20 px-1">
            <audio
                ref={audioRef}
                className="hidden"
                onEnded={() => setIsElenaSpeaking(false)}
                onPlay={() => {
                    setIsAudioLoading(false);
                    setIsElenaSpeaking(true);
                }}
                onError={() => {
                    setIsAudioLoading(false);
                    setIsElenaSpeaking(false);
                }}
            />

            {isAudioLoading ? (
                <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-sm w-full flex flex-col items-center text-center"
                    >
                        <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8" />
                        <h2 className="text-xl font-black text-slate-900 mb-2">Elena is Preparing</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Syncing your personalized session audio...</p>
                    </motion.div>
                </div>
            ) : null}

            {!hasInteracted ? (
                <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 text-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-xl border border-slate-100 max-w-sm w-full"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl md:text-4xl text-indigo-600">🎧</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Ready to Speak?</h2>
                        <p className="text-sm md:text-base text-slate-500 font-medium mb-6 md:mb-8 leading-relaxed">Elena is ready to start your level {level} lesson. Please turn up your volume!</p>
                        <button 
                            onClick={() => {
                                setHasInteracted(true);
                                setIsAudioLoading(true);
                            }}
                            className="w-full py-3.5 md:py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl md:rounded-2xl font-black transition-all shadow-lg shadow-indigo-200 active:scale-95"
                        >
                            Start Lesson
                        </button>
                    </motion.div>
                </div>
            ) : null}

            <div className="max-w-3xl mx-auto px-4 pt-3 md:pt-12">
                <div className="flex items-center justify-between mb-4 md:mb-10">
                    <div className="flex-1 mr-4">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                            <span className="text-[9px] md:text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">Level {level}</span>
                            <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">• {currentTaskIdx === -1 ? 'Warm-up' : `Task ${currentTaskIdx + 1} of ${lesson.tasks.length}`}</span>
                        </div>
                        <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">{lesson?.title || 'English Lesson'}</h1>
                    </div>
                    <button 
                        onClick={() => window.confirm('Exit lesson?') && onCancel()}
                        className="p-1.5 md:p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-all shrink-0"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="h-1 md:h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4 md:mb-12">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentTaskIdx + 2) / (lesson.tasks.length + 1)) * 100}%` }}
                        className="h-full bg-indigo-600"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {isAudioFetching ? (
                        <motion.div
                            key="fetching-audio"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl md:rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]"
                        >
                            <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-relaxed max-w-lg">Elena is Preparing</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Generating audio instructions...</p>
                        </motion.div>
                    ) : showIntro ? (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl md:rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm text-center flex flex-col items-center"
                        >
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
                                <span className="text-2xl">👩‍🏫</span>
                            </div>
                            <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-8 md:mb-10 leading-relaxed max-w-lg">
                                "{currentTaskIdx === -1 ? ELENA_MESSAGES.start : (ELENA_MESSAGES[`task_${currentTask.type}`] || "Let's continue.")}"
                            </h3>
                            <button
                                onClick={() => setShowIntro(false)}
                                className="px-10 py-4 bg-indigo-600 hover:bg-slate-900 text-white text-sm md:text-base font-bold rounded-xl transition-all shadow-lg active:scale-95"
                            >
                                {currentTaskIdx === -1 ? "Let's Begin" : "Start Task"}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 md:space-y-6"
                        >
                            <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-10 border border-slate-200 shadow-sm min-h-[400px] flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full -translate-y-1/2 translate-x-1/2" />

                                {!feedback ? (
                                    <div className="text-center w-full space-y-8">
                                        {currentTaskIdx === -1 ? (
                                            <div className="space-y-8">
                                                <div className="px-3 py-1 bg-indigo-50 rounded-full inline-block text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100">Reading Passage</div>
                                                <div className="p-6 md:p-10 bg-[#F8FAFF] rounded-[2rem] border border-blue-50 relative">
                                                    <p className="text-lg md:text-2xl text-slate-800 leading-relaxed font-bold italic">
                                                        "{lesson?.content || 'Loading content...'}"
                                                    </p>
                                                    {lesson?.vocabulary && lesson.vocabulary.length > 0 && (
                                                        <div className="mt-8 pt-8 border-t border-blue-100">
                                                            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Vocabulary Focus</h4>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                                                                {lesson.vocabulary.map((vocab, i) => (
                                                                    <div key={i} className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-blue-50">
                                                                        <div className="font-bold text-sm md:text-base text-slate-900">{vocab.word}</div>
                                                                        <div className="text-[11px] md:text-sm text-slate-500 mt-0.5 md:mt-1">{vocab.definition}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pt-4 flex flex-col items-center gap-4">
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Listen or Read Aloud</p>
                                                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
                                                         <button
                                                             onClick={() => handleSpeak(lesson.content, false)}
                                                             disabled={isElenaSpeaking}
                                                             className="px-4 md:px-6 py-2.5 md:py-3 bg-white text-indigo-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl font-bold text-xs md:text-sm shadow-sm transition-all flex items-center justify-center gap-2 md:gap-2.5 disabled:opacity-50"
                                                         >
                                                             <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zm.5-6.71v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                                                             {isElenaSpeaking ? 'Speaking...' : 'Listen Aloud'}
                                                         </button>
                                                         <button
                                                             onClick={() => nextTask()}
                                                             className="px-6 md:px-8 py-2.5 md:py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs md:text-sm shadow-md hover:bg-slate-900 transition-all text-center"
                                                         >
                                                             Continue to Tasks
                                                         </button>
                                                     </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-8">
                                                <div className="px-3 py-1 bg-slate-50 rounded-full inline-block text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200">
                                                    Task {currentTaskIdx + 1}: {currentTask.type.replace('_', ' ')}
                                                </div>
                                                 <div className="flex flex-col items-center gap-4 mb-3 md:mb-4">
                                                     <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-tight tracking-tight text-center max-w-lg">
                                                         {currentTask.prompt}
                                                     </h3>
                                                     <button
                                                         onClick={() => {
                                                             const txt = currentTask.prompt + (currentTask.text_to_repeat ? `. ${currentTask.text_to_repeat}` : "");
                                                             handleSpeak(txt, false);
                                                         }}
                                                         disabled={isElenaSpeaking}
                                                         className={`p-3 md:p-4 rounded-2xl transition-all duration-300 flex items-center justify-center relative overflow-hidden group shadow-sm
                                                            ${isElenaSpeaking 
                                                                ? 'bg-indigo-600 text-white shadow-indigo-200' 
                                                                : 'bg-white text-indigo-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                                                            } shrink-0 disabled:opacity-50`}
                                                         title="Listen to prompt"
                                                     >
                                                        {isElenaSpeaking && (
                                                            <motion.span 
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1.5, opacity: 1 }}
                                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                                className="absolute inset-0 bg-indigo-400/20 rounded-full" 
                                                            />
                                                        )}
                                                         <Volume2 size={24} className={isElenaSpeaking ? 'animate-pulse relative z-10' : 'group-hover:scale-110 transition-transform relative z-10'} />
                                                     </button>
                                                 </div>

                                                 {currentTask.text_to_repeat && (
                                                     <div className="p-4 md:p-6 bg-indigo-50/50 rounded-xl md:rounded-2xl border border-indigo-100 italic font-bold text-indigo-900 text-base md:text-lg">
                                                         "{currentTask.text_to_repeat}"
                                                     </div>
                                                 )}

                                                <LiveAnswerBox
                                                    isTimerRunning={!isElenaSpeaking && !showIntro && !isEvaluating && timeRemaining > 0}
                                                    timer={timeRemaining}
                                                    maxTimer={currentTask.type === 'free_speech' ? 90 : 60}
                                                    onSubmitAnswer={handleTaskSubmit}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-8"
                                    >
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
                                                <span className="text-3xl font-black">{feedback.scores?.overall || feedback.score || 0}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">AI Feedback</h3>
                                            <p className="text-base md:text-xl text-slate-600 leading-relaxed font-semibold italic max-w-xl mx-auto px-4">
                                                "{feedback.feedback}"
                                            </p>

                                            {feedback.scores && (
                                                <div className="mt-6 flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                                                    {['fluency', 'grammar', 'vocabulary', 'pronunciation'].map(metric => (
                                                        <div key={metric} className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{metric}</div>
                                                            <div className="text-lg font-black text-slate-900">{feedback.scores[metric]}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {feedback.corrections && (
                                                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                                                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">Refinements</h4>
                                                    <p className="text-slate-700 text-xs md:text-sm font-semibold leading-relaxed">
                                                        {feedback.corrections}
                                                    </p>
                                                </div>
                                            )}
                                            {feedback.pronunciation_tip && (
                                                <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Pronunciation Tip</h4>
                                                    <p className="text-slate-700 text-xs md:text-sm font-semibold leading-relaxed">
                                                        {feedback.pronunciation_tip}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {feedback.missing_words?.length > 0 && (
                                            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                                                <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Skipped Words</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {feedback.missing_words.map((w, i) => (
                                                        <span key={i} className="px-2 py-1 bg-white rounded-lg text-[10px] font-bold text-rose-400 border border-rose-100">{w}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                { (feedback.scores?.overall || feedback.score || 0) < 40 ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm shrink-0 font-black">
                                {Math.round(feedback.scores?.overall || feedback.score || 0)}
                            </div>
                            <p className="text-xs font-bold text-rose-800 leading-tight">
                                Your score is below 40. Please retry this task to improve your fluency and accuracy!
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setFeedback(null);
                                setShowIntro(true);
                                setTimeRemaining(currentTask.type === 'free_speech' ? 90 : 60);
                            }}
                            className="w-full py-5 bg-indigo-600 hover:bg-slate-900 text-white text-base font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <RotateCcw size={20} />
                            Retry Task
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={nextTask}
                        className="w-full py-5 bg-slate-900 hover:bg-black text-white text-base font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98]"
                    >
                        {currentTaskIdx === lesson.tasks.length - 1 ? "Finish Lesson" : "Next Task"}
                    </button>
                )}
            </motion.div>
        )}

                                <div className="flex justify-center mt-10">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={isElenaSpeaking ? 'speaking' : 'ready'}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl border backdrop-blur-md transition-all duration-500 ${isElenaSpeaking
                                                ? 'bg-slate-50/80 border-slate-200/50 shadow-sm'
                                                : 'bg-indigo-50/80 border-indigo-200/30'
                                                }`}
                                        >
                                            <div className="relative flex items-center justify-center w-1.5 h-1.5">
                                                <div className={`w-full h-full rounded-full ${isElenaSpeaking ? 'bg-slate-400' : 'bg-indigo-600'}`} />
                                                {!isElenaSpeaking && (
                                                    <div className="absolute inset-0 w-full h-full rounded-full bg-indigo-600 animate-ping opacity-60" />
                                                )}
                                            </div>
                                            <p className={`text-[9px] font-black uppercase tracking-[0.2em] leading-none ${isElenaSpeaking ? 'text-slate-400' : 'text-indigo-600'}`}>
                                                {isElenaSpeaking ? 'Elena is Speaking' : 'Elena is Listening'}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isEvaluating && (
                    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Evaluating Speech...</h3>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonFlow;
