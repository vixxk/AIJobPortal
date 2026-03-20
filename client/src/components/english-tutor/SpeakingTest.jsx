import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, Mic, X } from 'lucide-react';
import { submitSpeakingTest, speakText } from '../../services/englishTutorApi';
import { transcribeAudio } from '../../services/interviewApi';
import LiveAnswerBox from '../interview/LiveAnswerBox';

const TASKS = [
    {
        id: 1,
        name: 'Reading Passage',
        prompt: 'Please read the following paragraph aloud. Focus on your pronunciation and pace.',
        content: 'English is the most widely spoken language in the world. It is the official language of many countries and is used extensively as a second language and as an official language in many international organizations.',
        timer: 60
    },
    {
        id: 2,
        name: 'Visual Description',
        prompt: 'Imagine a busy city park on a sunny Sunday afternoon. Describe what you see for 30 seconds.',
        content: null,
        timer: 30
    },
    {
        id: 3,
        name: 'Personal Narrative',
        prompt: 'Tell me about a hobby that brings you joy. Why is it important to you?',
        content: null,
        timer: 60
    },
    {
        id: 4,
        name: 'Spontaneous Grammar',
        prompt: 'Describe your last vacation in detail. Pay close attention to your use of past tenses.',
        content: null,
        timer: 60
    },
    {
        id: 5,
        name: 'Listen & Respond',
        prompt: 'Listen to this proverb: "The early bird catches the worm, but the second mouse gets the cheese." What do you think this means?',
        content: null,
        timer: 60
    }
];

const ROADMAP_LEVELS = [
    { level: 1, name: 'Beginner' },
    { level: 2, name: 'Elementary' },
    { level: 3, name: 'Pre-Intermediate' },
    { level: 4, name: 'Intermediate' },
    { level: 5, name: 'Upper-Intermediate' },
    { level: 6, name: 'Advanced' },
    { level: 7, name: 'Proficient' },
    { level: 8, name: 'Mastery' },
    { level: 9, name: 'Expert' },
    { level: 10, name: 'Professional' },
];

const SpeakingTest = ({ onComplete, onCancel }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [audioRef] = useState(useRef(null));
    const [showIntro, setShowIntro] = useState(true);
    const [isElenaSpeaking, setIsElenaSpeaking] = useState(false);
    const [isAudioFetching, setIsAudioFetching] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [isProcessingTask, setIsProcessingTask] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const lastSpokenTaskRef = useRef(null);

    const currentTask = TASKS[currentStep];

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
                    console.warn("Autoplay blocked:", err);
                    setIsAudioLoading(false);
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
        setTimeRemaining(currentTask.timer || 60);
    }, [currentStep, currentTask.timer]);
    useEffect(() => {
        let interval;
        const isTimerRunning = !isElenaSpeaking && !showIntro && !isSubmitting;
        if (isTimerRunning && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isElenaSpeaking, showIntro, isSubmitting, timeRemaining]);
    useEffect(() => {
        if (!showIntro && !isSubmitting && hasInteracted && lastSpokenTaskRef.current !== currentTask.id) {
            lastSpokenTaskRef.current = currentTask.id;
            // Always speak the prompt/instruction for assessment tasks
            handleSpeak(currentTask.prompt, true);
        }
    }, [currentStep, showIntro, isSubmitting, hasInteracted, currentTask.id, currentTask.prompt, handleSpeak]);

    const handleAnswerSubmit = async (transcript, blob) => {
        setIsProcessingTask(true);
        let finalTranscript = transcript;

        if (!finalTranscript.trim() && blob) {
            setIsTranscribing(true);
            try {
                const fd = new FormData();
                fd.append('audio', blob, 'assessment.webm');
                const sttRes = await transcribeAudio(fd);
                if (sttRes.status === 'success') {
                    finalTranscript = sttRes.data.analysis.transcript;
                }
            } catch (err) {
                console.error('Backend STT failed', err);
            } finally {
                setIsTranscribing(false);
            }
        }

        const newResponse = {
            task_name: currentTask.name,
            prompt: currentTask.prompt + (currentTask.content || ''),
            transcript: finalTranscript,
            metrics: {}
        };

        const updated = [...responses, newResponse];
        setResponses(updated);

        await new Promise(resolve => setTimeout(resolve, 800));
        setIsProcessingTask(false);

        if (currentStep < TASKS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            submitFullTest(updated);
        }
    };

    const submitFullTest = async (allResponses) => {
        setIsSubmitting(true);
        try {
            const res = await submitSpeakingTest(allResponses);
            if (res.data.status === 'success') {
                const tutorData = res.data.data;
                const latestResult = tutorData.testResults[tutorData.testResults.length - 1];

                setTestResults({
                    evaluation: {
                        currentLevel: tutorData.currentLevel,
                        xpEarned: tutorData.xp,
                        metrics: latestResult.scores,
                        feedback: latestResult.feedback
                    },
                    responses: allResponses,
                    fullTutorData: tutorData
                });
            }
        } catch (err) {
            console.error('Failed to submit test', err);
            alert('Failed to analyze test. Please check your connection or try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#FCFDFF] flex flex-col items-center justify-center relative overflow-x-hidden pt-4 pb-20 md:py-0 px-4 md:px-0">
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

            {!hasInteracted ? (
                <div className="fixed inset-0 z-50 bg-[#FCFDFF] flex flex-col items-center justify-center p-4">
                    <motion.div
                        key="ready-gate"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-sm"
                    >
                        <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 shadow-sm">
                                <Mic size={24} className="text-indigo-600" />
                            </div>
                            <h2 className="text-xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">Speaking Assessment</h2>
                            <p className="text-sm md:text-lg text-slate-600 font-medium leading-relaxed mb-8">
                                I'll guide you through 5 short tasks to find the perfect starting level for your journey.
                            </p>
                            <button
                                onClick={() => {
                                    setHasInteracted(true);
                                    setIsAudioLoading(true);
                                }}
                                className="px-8 md:px-12 py-3.5 md:py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl md:rounded-2xl font-black transition-all shadow-lg shadow-indigo-100 active:scale-95"
                            >
                                Let's Begin
                            </button>
                        </div>
                    </motion.div>
                </div>
            ) : null}

            {isAudioLoading ? (
                <div className="fixed inset-0 z-50 bg-[#FCFDFF] flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                        key="preparing-audio"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-sm w-full flex flex-col items-center text-center"
                    >
                        <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8" />
                        <h2 className="text-xl font-black text-slate-900 mb-2">Elena is Preparing</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed text-center">Syncing your personalized assessment audio...</p>
                    </motion.div>
                </div>
            ) : null}

            {!isAudioLoading && hasInteracted && (
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-40">
                    <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] md:text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">Assessment</span>
                            <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">• Task {currentStep + 1 || 1}/5</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => window.confirm('Exit assessment?') && onCancel()}
                        className="p-1.5 md:p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-all shrink-0"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <AnimatePresence mode="wait">
                {showIntro ? (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="max-w-lg w-full px-4"
                    >
                        <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-12 border border-slate-200 shadow-xl text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                <span className="text-2xl md:text-3xl">📊</span>
                            </div>

                            <h1 className="text-xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">Speaking Assessment</h1>
                            <p className="text-slate-400 text-[9px] md:text-xs font-bold leading-relaxed mb-6 md:mb-8 uppercase tracking-[0.2em] px-4">Evaluate fluency & pace • 5 mins</p>

                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {[
                                    { label: 'Read', icon: '📖' },
                                    { label: 'Describe', icon: '🖼️' },
                                    { label: 'Respond', icon: '💬' },
                                ].map((step, i) => (
                                    <div key={i} className="p-4 md:p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center">
                                        <span className="text-xl md:text-2xl mb-1">{step.icon}</span>
                                        <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-tight">{step.label}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowIntro(false)}
                                className="w-full py-4 md:py-5 bg-indigo-600 hover:bg-slate-900 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg active:scale-95"
                            >
                                Begin Test
                            </button>
                        </div>
                    </motion.div>
                ) : testResults ? (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-4xl px-3 md:px-6 py-4 md:py-12"
                    >
                        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-12 border border-slate-200 shadow-xl mb-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-12">
                                <div className="text-center md:text-left">
                                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 md:mb-2">Assessment Results</h1>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">AI Evaluation Summary</p>
                                </div>
                                <div className={`px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl text-center ${testResults.evaluation.currentLevel === 0 ? 'bg-rose-500' : 'bg-indigo-600'}`}>
                                    <span className="block text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-0.5 md:mb-1 opacity-80">
                                        {testResults.evaluation.currentLevel === 0 ? 'Assessment' : `Level ${testResults.evaluation.currentLevel}`}
                                    </span>
                                    <span className="text-white text-xl md:text-2xl font-black">
                                        {testResults.evaluation.currentLevel === 0 ? 'Incomplete' : (ROADMAP_LEVELS.find(l => l.level === testResults.evaluation.currentLevel)?.name || 'Processing')}
                                    </span>
                                </div>
                            </div>

                            {testResults.evaluation.currentLevel > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                    {[
                                        { label: 'Fluency', value: `${testResults.evaluation.metrics?.fluency || 0}%` },
                                        { label: 'Pronunciation', value: `${testResults.evaluation.metrics?.pronunciation || 0}%` },
                                        { label: 'Grammar', value: `${testResults.evaluation.metrics?.grammar || 0}%` },
                                        { label: 'Vocab', value: `${testResults.evaluation.metrics?.vocabulary || 0}%` },
                                    ].map((stat, i) => (
                                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
                                            <span className="text-slate-900 font-bold">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-6">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">Task Breakdown</h2>
                                {testResults.responses.map((resp, i) => (
                                    <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Task {i + 1}: {resp.task_name}</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prompt</p>
                                            <p className="text-xs text-slate-600 font-medium italic">"{resp.prompt}"</p>
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Transcription</p>
                                            <p className="text-sm text-slate-900 font-bold leading-relaxed">
                                                {resp.transcript || <span className="text-rose-400 italic font-medium">[No speech detected]</span>}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {testResults.evaluation.currentLevel === 0 ? (
                                <button
                                    onClick={() => onCancel()}
                                    className="w-full mt-8 md:mt-12 py-4 md:py-6 bg-rose-500 hover:bg-rose-600 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] rounded-xl md:rounded-2xl transition-all shadow-xl active:scale-95"
                                >
                                    Start Again
                                </button>
                            ) : (
                                <button
                                    onClick={() => onComplete(testResults.fullTutorData)}
                                    className="w-full mt-8 md:mt-12 py-4 md:py-6 bg-slate-900 hover:bg-black text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] rounded-xl md:rounded-2xl transition-all shadow-xl active:scale-95"
                                >
                                    Finish Assessment
                                </button>
                            )}
                        </div>
                    </motion.div>
                ) : isSubmitting ? (
                    <motion.div
                        key="submitting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
                    >
                        <div className="mb-6 md:mb-8">
                            <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Analyzing Responses</h2>
                        <p className="text-xs md:text-sm text-slate-400 font-medium tracking-tight">Processing your proficiency metrics...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="tasks"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="w-full max-w-4xl px-3 md:px-6 flex flex-col items-center justify-center min-h-0 md:min-h-[600px] py-4 md:py-12"
                    >
                        <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-12 border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden w-full transition-all duration-500">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-50">
                                <motion.div
                                    className="h-full bg-indigo-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStep + 1) / TASKS.length) * 100}%` }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                {isAudioFetching ? (
                                    <motion.div
                                        key="fetching-audio"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="py-12 md:py-20 flex flex-col items-center justify-center text-center min-h-[400px]"
                                    >
                                        <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6" />
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-relaxed max-w-lg">Elena is Preparing</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Generating audio instructions...</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="task-content"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="contents"
                                    >
                                        <div className="flex justify-between items-center mb-10">
                                            <div className="px-3 py-1 bg-indigo-50/50 rounded-full text-indigo-600 border border-indigo-100/30">
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{currentTask.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Step</span>
                                                <div className="flex items-baseline font-black">
                                                    <span className="text-sm text-slate-900 leading-none">{currentStep + 1}</span>
                                                    <span className="text-[10px] text-slate-300 mx-0.5">/</span>
                                                    <span className="text-[10px] text-slate-300">{TASKS.length}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <AnimatePresence mode="wait">
                                {isProcessingTask ? (
                                    <motion.div
                                        key="processing"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="py-12 md:py-20 flex flex-col items-center justify-center text-center"
                                    >
                                        <div className="w-10 h-10 md:w-12 md:h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4 md:mb-6" />
                                        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 md:mb-2 uppercase tracking-tight">
                                            {isTranscribing ? 'Transcribing Speech' : 'Syncing Result'}
                                        </h3>
                                        <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">
                                            {isTranscribing ? 'Elena is processing your audio...' : 'Optimizing proficiency data...'}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="task-content"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="contents"
                                    >
                                        <div className="max-w-2xl mx-auto text-center mb-6 md:mb-10">
                                            <div className="flex flex-col items-center text-center max-w-xl mx-auto px-4">
                                                <div className="px-3 py-1 bg-slate-50 rounded-full inline-block text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 mb-6">
                                                    Task {currentStep + 1} of 5
                                                </div>
                                                <h3 className="text-lg md:text-2xl font-black text-slate-900 mb-6 md:mb-8 leading-tight">
                                                    {currentTask.prompt}
                                                </h3>
                                                <button
                                                    onClick={() => { handleSpeak(currentTask.prompt, false); }}
                                                    disabled={isElenaSpeaking}
                                                    className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 flex items-center justify-center relative overflow-hidden group shadow-sm
                                                        ${isElenaSpeaking 
                                                            ? 'bg-indigo-600 text-white shadow-indigo-200' 
                                                            : 'bg-white text-indigo-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                                                        } shrink-0 disabled:opacity-50 mb-4`}
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

                                            {currentTask.content && (
                                                <div className="relative p-5 md:p-10 bg-[#F8FAFF] rounded-2xl md:rounded-[2rem] border border-blue-50/50">
                                                    <div className="absolute top-0 right-0 p-3 md:p-4 opacity-10">
                                                        <svg className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.01699 16H8.01699C9.12156 16 10.017 16.8954 10.017 18V21C10.017 22.1046 9.12156 23 8.01699 23H5.01699C3.91243 23 3.017 22.1046 3.017 21ZM16.017 16L19.017 10H21.017V13C21.017 14.1046 20.1216 15 19.017 15H16.017V16ZM5.01699 16L8.01699 10H10.017V13C10.017 14.1046 9.12156 15 8.01699 15H5.01699V16Z" /></svg>
                                                    </div>
                                                    <p className="text-base md:text-2xl text-slate-800 leading-relaxed font-bold italic tracking-tight">
                                                        "{currentTask.content}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-slate-50">
                                            <LiveAnswerBox
                                                key={currentStep}
                                                timer={timeRemaining}
                                                maxTimer={currentTask.timer || 60}
                                                isTimerRunning={!isElenaSpeaking && !showIntro && !isSubmitting && !isProcessingTask && timeRemaining > 0}
                                                onSubmitAnswer={handleAnswerSubmit}
                                                onEndInterview={() => submitFullTest(responses)}
                                            />
                                        </div>

                                        <div className="flex justify-center mt-10">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={isElenaSpeaking ? 'speaking' : 'response'}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-md transition-all duration-500 ${isElenaSpeaking
                                                        ? 'bg-slate-50/80 border-slate-200/50 shadow-sm'
                                                        : 'bg-indigo-50/80 border-indigo-200/30 shadow-[0_0_25px_rgba(79,70,229,0.12)]'
                                                        }`}
                                                >
                                                    <div className="relative flex items-center justify-center w-2 h-2">
                                                        <div className={`w-full h-full rounded-full transition-colors duration-500 ${isElenaSpeaking ? 'bg-slate-400' : 'bg-indigo-600'}`} />
                                                        {!isElenaSpeaking && (
                                                            <div className="absolute inset-0 w-full h-full rounded-full bg-indigo-600 animate-ping opacity-60" />
                                                        )}
                                                        {!isElenaSpeaking && (
                                                            <div className="absolute inset-0 w-full h-full rounded-full bg-indigo-400 blur-[2px] opacity-40" />
                                                        )}
                                                    </div>
                                                    <p className={`text-[10px] font-black uppercase tracking-[0.25em] leading-none transition-colors duration-500 ${isElenaSpeaking ? 'text-slate-400' : 'text-indigo-600'}`}>
                                                        {isElenaSpeaking ? 'Elena is Speaking' : 'System Ready • Speak Now'}
                                                    </p>
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpeakingTest;
