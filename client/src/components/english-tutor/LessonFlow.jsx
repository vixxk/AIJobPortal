import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getLesson, submitLessonTask, completeLesson, speakText } from '../../services/englishTutorApi';
import LiveAnswerBox from '../interview/LiveAnswerBox';

const ELENA_MESSAGES = {
    warmup: "Let's start with a relaxed warm-up. Don't worry about mistakes, just let the words flow!",
    vocabulary: "Excellent! Now, let's look at some key vocabulary for today's topic. Listen to how I say them.",
    reading: "Great job on the words. Now, try reading this passage aloud. I'm listening for your pace and clarity.",
    listening: "You're doing wonderful. Now, close your eyes and listen carefully to what I have to say next.",
    speaking: "This is it! The floor is yours. Use what we've learned and speak from the heart.",
    summary: "Look at that progress! You've successfully finished our session. How do you feel?"
};

const LessonFlow = ({ level, onComplete, onCancel }) => {
    const [loading, setLoading] = useState(true);
    const [lesson, setLesson] = useState(null);
    const [phase, setPhase] = useState('warmup');
    const [currentVocabIdx, setCurrentVocabIdx] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [taskScores, setTaskScores] = useState([]);
    const [showIntro, setShowIntro] = useState(true);
    const [isElenaSpeaking, setIsElenaSpeaking] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(45);
    const audioRef = useRef(null);
    const lastSpokenRef = useRef("");

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
    const handleSpeak = async (text) => {
        setIsElenaSpeaking(true);
        try {
            const blob = await speakText(text);
            const url = URL.createObjectURL(blob.data);
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
            }
        } catch (err) {
            console.error('TTS failed', err);
            setIsElenaSpeaking(false);
        }
    };
    useEffect(() => {
        fetchLesson();
    }, [fetchLesson]);
    useEffect(() => {
        let interval;
        const isTimerRunning = !isElenaSpeaking && !showIntro && !isEvaluating && !loading;
        if (isTimerRunning && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isElenaSpeaking, showIntro, isEvaluating, loading, timeRemaining]);
    useEffect(() => {
        if (!lesson || loading) return;
        if (showIntro) {
            const introText = ELENA_MESSAGES[phase];
            if (introText && lastSpokenRef.current !== `intro-${phase}`) {
                lastSpokenRef.current = `intro-${phase}`;
                handleSpeak(introText);
            }
        } else {
            let contentText = "";
            if (phase === 'warmup') contentText = lesson.warmup?.prompt;
            else if (phase === 'vocabulary') contentText = `${lesson.vocabulary[currentVocabIdx]?.word}. ${lesson.vocabulary[currentVocabIdx]?.task}`;
            else if (phase === 'reading') contentText = lesson.reading?.text;
            else if (phase === 'speaking') contentText = lesson.speaking_exercise?.topic;
            if (contentText && lastSpokenRef.current !== `content-${phase}-${currentVocabIdx}`) {
                lastSpokenRef.current = `content-${phase}-${currentVocabIdx}`;
                handleSpeak(contentText);
            }
        }
    }, [showIntro, phase, currentVocabIdx, lesson, loading]);
    useEffect(() => {
        let t = 45;
        if (phase === 'reading' || phase === 'listening') t = 60;
        if (phase === 'speaking') t = 90;
        setTimeRemaining(t);
    }, [phase, currentVocabIdx]);

    const handleTaskSubmit = async (transcript, blob) => {
        setIsEvaluating(true);
        try {
            let context = {};
            if (phase === 'vocabulary') context = { word: lesson?.vocabulary?.[currentVocabIdx]?.word || 'unknown' };
            if (phase === 'reading') context = { reference_text: lesson?.reading?.text || '' };
            if (phase === 'speaking') context = { topic: lesson?.speaking_exercise?.topic || 'general' };

            const fd = new FormData();
            fd.append('task_type', phase);
            fd.append('transcript', transcript);
            fd.append('context_json', JSON.stringify(context));
            if (blob) fd.append('audio', blob, 'task.webm');

            const res = await submitLessonTask(fd);
            const evalResult = res.data.data.evaluation;

            setFeedback(evalResult);
            setTaskScores([...taskScores, evalResult.scores]);
        } catch (err) {
            console.error('Task evaluation failed', err);
        } finally {
            setIsEvaluating(false);
        }
    };

    const nextPhase = () => {
        setFeedback(null);
        setShowIntro(true);
        if (phase === 'warmup') setPhase('vocabulary');
        else if (phase === 'vocabulary') {
            if (currentVocabIdx < lesson.vocabulary.length - 1) {
                setCurrentVocabIdx(currentVocabIdx + 1);
            } else {
                setPhase('reading');
            }
        }
        else if (phase === 'reading') setPhase('listening');
        else if (phase === 'listening') setPhase('speaking');
        else if (phase === 'speaking') finishLesson();
    };

    const finishLesson = async () => {
        const avgScores = taskScores.reduce((acc, curr) => {
            acc.fluency += curr.fluency;
            acc.grammar += curr.grammar;
            acc.vocabulary += curr.vocabulary;
            acc.pronunciation += curr.pronunciation;
            return acc;
        }, { fluency: 0, grammar: 0, vocabulary: 0, pronunciation: 0 });

        const count = taskScores.length || 1;
        const finalScores = {
            fluency: Math.round(avgScores.fluency / count),
            grammar: Math.round(avgScores.grammar / count),
            vocabulary: Math.round(avgScores.vocabulary / count),
            pronunciation: Math.round(avgScores.pronunciation / count),
        };

        try {
            await completeLesson({
                lessonId: lesson.lesson_id,
                title: lesson.title,
                level: level,
                scores: finalScores
            });
            onComplete();
        } catch (err) {
            console.error('Failed to complete lesson', err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
            <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest">Initialising Session...</h2>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FCFDFF] pb-20">
            <audio
                ref={audioRef}
                className="hidden"
                onEnded={() => setIsElenaSpeaking(false)}
            />

            <div className="max-w-3xl mx-auto px-4 pt-6 md:pt-12">
                <div className="flex items-center justify-between mb-6 md:mb-10">
                    <div>
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                            <span className="text-[8px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest">Level {level}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{phase} Phase</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-none">{lesson?.title || 'English Lesson'}</h1>
                    </div>
                    <button onClick={onCancel} className="p-2 md:p-2.5 bg-white hover:bg-slate-50 text-slate-400 rounded-lg md:rounded-xl shadow-sm border border-slate-200 transition-all">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="h-1 md:h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-8 md:mb-12">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(['warmup', 'vocabulary', 'reading', 'listening', 'speaking'].indexOf(phase) + 1) * 20}%` }}
                        className="h-full bg-indigo-600"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {showIntro ? (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white rounded-xl md:rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm text-center flex flex-col items-center"
                        >
                            <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-6 md:mb-8 leading-relaxed max-w-lg">
                                "{ELENA_MESSAGES[phase]}"
                            </h3>
                            <button
                                onClick={() => setShowIntro(false)}
                                className="px-8 py-3.5 md:px-10 md:py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm md:text-base font-semibold rounded-lg md:rounded-xl transition-all shadow-sm active:scale-95"
                            >
                                Continue Session
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4 md:space-y-6"
                        >
                            <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-10 border border-slate-200 shadow-sm min-h-[350px] md:min-h-[400px] flex flex-col justify-center">
                                {!feedback ? (
                                    <div className="text-center w-full">
                                        {phase === 'warmup' && (
                                            <div className="space-y-8 md:space-y-10">
                                                <h3 className="text-lg md:text-2xl font-bold text-slate-800 italic leading-relaxed px-2">
                                                    "{lesson?.warmup?.prompt || 'Ready to start our warm-up?'}"
                                                </h3>
                                                <LiveAnswerBox
                                                    isTimerRunning={!isElenaSpeaking && !showIntro && !isEvaluating && timeRemaining > 0}
                                                    timer={timeRemaining}
                                                    maxTimer={45}
                                                    onSubmitAnswer={handleTaskSubmit}
                                                />
                                            </div>
                                        )}

                                        {phase === 'vocabulary' && (
                                            <div className="space-y-6 md:space-y-10">
                                                <div className="inline-block px-2 py-1 bg-slate-50 rounded-lg text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                                    Vocabulary {(currentVocabIdx || 0) + 1} of {lesson?.vocabulary?.length || 0}
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mb-1 leading-none">{lesson?.vocabulary?.[currentVocabIdx]?.word || 'Loading word...'}</h3>
                                                    <p className="text-sm md:text-lg text-slate-400 italic mb-6 md:mb-10 leading-tight">"{lesson?.vocabulary?.[currentVocabIdx]?.meaning || ''}"</p>
                                                    <div className="p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-100 text-left max-w-lg mx-auto">
                                                        <span className="text-[8px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Usage Example</span>
                                                        <p className="text-slate-700 text-xs md:text-base font-medium leading-normal italic">"{lesson?.vocabulary?.[currentVocabIdx]?.example || ''}"</p>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 p-5 md:p-8 rounded-xl md:rounded-2xl border-2 border-dashed border-slate-200 mt-6">
                                                    <p className="text-slate-800 text-xs md:text-base font-bold mb-6">Roleplay: {lesson?.vocabulary?.[currentVocabIdx]?.task || 'Try using this word in a sentence.'}</p>
                                                    <LiveAnswerBox
                                                        isTimerRunning={!isElenaSpeaking && !showIntro && !isEvaluating && timeRemaining > 0}
                                                        timer={timeRemaining}
                                                        maxTimer={45}
                                                        onSubmitAnswer={handleTaskSubmit}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {phase === 'reading' && (
                                            <div className="space-y-8 md:space-y-10">
                                                <h3 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Oral Reading Assessment</h3>
                                                <div className="p-6 md:p-10 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 text-base md:text-xl text-slate-800 leading-relaxed font-semibold italic">
                                                    "{lesson?.reading?.text || 'Please read the text displayed on the screen.'}"
                                                </div>
                                                <LiveAnswerBox
                                                    isTimerRunning={!isElenaSpeaking && !showIntro && !isEvaluating && timeRemaining > 0}
                                                    timer={timeRemaining}
                                                    maxTimer={60}
                                                    onSubmitAnswer={handleTaskSubmit}
                                                />
                                            </div>
                                        )}

                                        {phase === 'listening' && (
                                            <div className="space-y-8 md:space-y-10 flex flex-col items-center">
                                                <button
                                                    onClick={() => handleSpeak(lesson?.listening?.text || lesson?.listening?.passage || 'Listen carefully to the instructions.')}
                                                    className="w-14 h-14 md:w-16 md:h-16 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95"
                                                >
                                                    <svg className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                                                </button>
                                                <div className="text-center">
                                                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">Listen and Respond</h3>
                                                    <p className="text-slate-400 font-medium text-xs">Play the prompt, then record your thoughts below.</p>
                                                </div>
                                                <LiveAnswerBox
                                                    isTimerRunning={!isElenaSpeaking && !showIntro && !isEvaluating && timeRemaining > 0}
                                                    timer={timeRemaining}
                                                    maxTimer={60}
                                                    onSubmitAnswer={handleTaskSubmit}
                                                />
                                            </div>
                                        )}

                                        {phase === 'speaking' && (
                                            <div className="space-y-8 md:space-y-10">
                                                <div className="p-6 md:p-8 bg-slate-900 rounded-xl md:rounded-2xl text-white">
                                                    <h3 className="text-lg md:text-xl font-bold mb-2">{lesson?.speaking_exercise?.topic || 'Final Speaking Task'}</h3>
                                                    <p className="text-slate-400 text-xs md:text-base leading-relaxed">{lesson?.speaking_exercise?.instructions || 'Share your thoughts on the topic.'}</p>
                                                </div>
                                                <LiveAnswerBox
                                                    isTimerRunning={!isElenaSpeaking && !showIntro && !isEvaluating && timeRemaining > 0}
                                                    timer={timeRemaining}
                                                    maxTimer={90}
                                                    onSubmitAnswer={handleTaskSubmit}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6 md:space-y-8"
                                    >
                                        <div className="text-center">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-4 md:mb-6 border border-emerald-100 shadow-sm">
                                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3 tracking-tight">Insight</h3>
                                            <p className="text-sm md:text-lg text-slate-600 leading-relaxed font-semibold italic max-w-xl mx-auto px-4">"{feedback.feedback}"</p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                                            {Object.entries(feedback.scores).map(([k, v]) => (
                                                <div key={k} className="p-3 md:p-4 bg-slate-50 rounded-xl text-center border border-slate-200">
                                                    <span className="block text-xl md:text-2xl font-bold text-indigo-600 leading-none">{v}</span>
                                                    <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">{k}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {feedback.corrections?.length > 0 && (
                                            <div className="p-4 md:p-6 bg-amber-50 rounded-xl border border-amber-100">
                                                <h4 className="text-[8px] md:text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">Refinements</h4>
                                                <div className="grid md:grid-cols-2 gap-2 md:gap-3">
                                                    {feedback.corrections.map((c, i) => (
                                                        <div key={i} className="flex gap-2.5 bg-white p-3 rounded-lg border border-amber-100">
                                                            <span className="text-amber-500 text-xs shrink-0">💡</span>
                                                            <p className="text-slate-700 text-[10px] md:text-xs font-semibold leading-relaxed">{c}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={nextPhase}
                                            className="w-full py-3.5 md:py-4 bg-indigo-600 hover:bg-slate-900 text-white text-sm md:text-base font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
                                        >
                                            {phase === 'speaking' ? "Complete Session" : "Next Phase"}
                                        </button>
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
                                                : 'bg-indigo-50/80 border-indigo-200/30 shadow-[0_0_25px_rgba(79,70,229,0.08)]'
                                                }`}
                                        >
                                            <div className="relative flex items-center justify-center w-1.5 h-1.5">
                                                <div className={`w-full h-full rounded-full transition-colors duration-500 ${isElenaSpeaking ? 'bg-slate-400' : 'bg-indigo-600'}`} />
                                                {!isElenaSpeaking && (
                                                    <div className="absolute inset-0 w-full h-full rounded-full bg-indigo-600 animate-ping opacity-60" />
                                                )}
                                            </div>
                                            <p className={`text-[9px] font-black uppercase tracking-[0.2em] leading-none transition-colors duration-500 ${isElenaSpeaking ? 'text-slate-400' : 'text-indigo-600'}`}>
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
                    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl flex flex-col items-center border border-slate-200 border-t-4 border-t-indigo-500 max-w-xs md:max-w-none text-center">
                            <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Evaluating Proficiency</h3>
                            <p className="text-slate-400 text-xs font-medium">Elena is analyzing your speech patterns...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonFlow;
