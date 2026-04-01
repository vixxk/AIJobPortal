import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, X, RotateCcw, Loader2 } from 'lucide-react';
import { getLesson, submitLessonTask, completeLesson } from '../../services/englishTutorApi';
import { speakText } from '../../services/interviewApi';
import LiveAnswerBox from '../interview/LiveAnswerBox';

const ELENA_MESSAGES = {
    start: "Welcome to today's session! Let's dive into our topic and practice your spoken English.",
    task_repeat: "First, let's practice your pronunciation. Listen to me and repeat the sentence exactly as I say it.",
    task_question: "Excellent. Now, I have a question for you about what we just covered. Take your time to answer clearly.",
    task_free_speech: "This is the final challenge! Express your thoughts on this topic. Don't worry about being perfect, just keep speaking.",
    task_describe_image: "Take a look at the image on your screen. Describe what you see in as much detail as possible.",
    task_roleplay: "Let's do a roleplay! I'll set the scene and you act out the response. Be creative and stay in character.",
    task_idiom_usage: "Let's challenge your vocabulary. Try to use this specific idiom or phrase naturally in your response.",
    task_debate: "Time for a debate. I'll give you a stance and a topic. Construct a strong, logical argument to support it.",
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
    const [micBlocked, setMicBlocked] = useState(false);
    const [isElenaSpeaking, setIsElenaSpeaking] = useState(false);
    const [isPreparingAudio, setIsPreparingAudio] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const audioRef = useRef(null);
    const lastSpokenRef = useRef(null);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [ttsCompleted, setTtsCompleted] = useState(false);
    const speechSequenceRef = useRef(0);

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
        if (!text) return;

        // Cancel any ongoing speech sequences
        const currentSeq = ++speechSequenceRef.current;

        // Stop current audio if any
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeAttribute('src');
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current.onplay = null;
        }

        setIsPreparingAudio(true);
        setIsElenaSpeaking(false);

        // Split text into segments: dialogue or normal sentences
        const isDialogue = /[A-Z][a-z]+:\s/.test(text);
        let segments = [];
        if (isDialogue) {
            segments = text.split(/(?=[A-Z][a-z]+:\s)/).filter(s => s.trim());
        } else {
            // Split by sentence (ending in . ! ? with optional spaces) to reduce time-to-first-audio latency
            segments = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g)?.map(s => s.trim()).filter(s => s) || [text];
        }

        try {
            const voices = {
                female: ['en-US-AriaNeural', 'en-GB-SoniaNeural', 'en-AU-NatashaNeural'],
                male: ['en-US-GuyNeural', 'en-GB-RyanNeural', 'en-AU-WilliamNeural']
            };

            const speakerMap = {};
            let femaleIdx = 0;
            let maleIdx = 0;

            const getChunkAudio = async (idx) => {
                if (idx >= segments.length) return null;
                const segment = segments[idx];
                let voice = 'en-US-AriaNeural';

                if (isDialogue) {
                    const match = segment.match(/^([A-Z][a-z]+):\s/) || segment.match(/My name is\s([A-Z][a-z]+)/);
                    if (match) {
                        const name = match[1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
                        if (!speakerMap[name]) {
                            const isMale = ['Sam', 'Bob', 'Guy', 'Ryan', 'William', 'Alex'].includes(name);
                            if (isMale) {
                                speakerMap[name] = voices.male[maleIdx % voices.male.length];
                                maleIdx++;
                            } else {
                                speakerMap[name] = voices.female[femaleIdx % voices.female.length];
                                femaleIdx++;
                            }
                        }
                        voice = speakerMap[name];
                    }
                }

                // Strip speaker name prefix (e.g. "Alice: ") so TTS only speaks the dialogue
                const cleanedSegment = isDialogue ? segment.replace(/^[A-Z][a-z]+:\s*/, '').trim() : segment.trim();

                // Skip empty segments (can happen after name stripping)
                if (!cleanedSegment) return null;

                try {
                    return await speakText(cleanedSegment, voice);
                } catch (err) {
                    console.error('getChunkAudio error:', err);
                    return null;
                }
            };

            let nextPrms = getChunkAudio(0); // Prefetch first chunk

            for (let i = 0; i < segments.length; i++) {
                if (currentSeq !== speechSequenceRef.current) break;

                const url = await nextPrms;
                if (!url) continue;
                if (currentSeq !== speechSequenceRef.current) break;

                // Fire off prefetch for the NEXT chunk immediately
                nextPrms = getChunkAudio(i + 1);

                await new Promise((resolve, reject) => {
                    const audio = audioRef.current;
                    if (!audio) return resolve();

                    audio.src = url;
                    
                    audio.onplay = () => {
                        setIsPreparingAudio(false);
                        setIsElenaSpeaking(true);
                    };
                    
                    audio.onended = () => resolve();
                    audio.onerror = (e) => reject(e);
                    audio.play().catch(reject);
                });
            }
        } catch (err) {
            console.error('Playback sequence failed', err);
        } finally {
            if (currentSeq === speechSequenceRef.current) {
                setIsElenaSpeaking(false);
                setIsPreparingAudio(false);
                setTtsCompleted(true);
            }
        }
    };

    useEffect(() => {
        fetchLesson();
    }, [level]);

    useEffect(() => {
        let interval;
        const isTimerRunning = !isElenaSpeaking && !isPreparingAudio && !showIntro && !isEvaluating && !loading && currentTaskIdx >= 0 && !micBlocked;
        if (isTimerRunning && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isElenaSpeaking, showIntro, isEvaluating, loading, timeRemaining, currentTaskIdx, micBlocked]);

    useEffect(() => {
        if (!lesson || loading || !hasInteracted) return;

        if (showIntro) {
            setTtsCompleted(false);
            let msg = "";
            if (currentTaskIdx === -1) msg = ELENA_MESSAGES.start;
            else {
                const task = lesson.tasks[currentTaskIdx];
                msg = ELENA_MESSAGES[`task_${task.type}`] || "Let's try the next task.";
            }

            if (msg && lastSpokenRef.current !== `intro-${currentTaskIdx}`) {
                lastSpokenRef.current = `intro-${currentTaskIdx}`;
                handleSpeak(msg);
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
                handleSpeak(textToSpeak);
            }
        }
    }, [showIntro, currentTaskIdx, lesson, loading, hasInteracted]);

    useEffect(() => {
        let t = 60;
        if (currentTaskIdx >= 0) {
            const task = lesson?.tasks[currentTaskIdx];
            if (task?.type === 'free_speech') t = 90;
            else if (task?.type === 'describe_image') t = 60;
            else if (task?.type === 'roleplay') t = 90;
            else if (task?.type === 'debate') t = 120; // 2 minutes for debate
            else if (task?.type === 'idiom_usage') t = 60;
            else if (task?.type === 'repeat') t = 30;
            else t = 60;
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
                correct_answer_hint: task.correct_answer_hint,
                image_url: task.image_url,
                roleplay_scenario: task.roleplay_scenario,
                target_idiom: task.target_idiom,
                debate_stance: task.debate_stance,
            };

            const fd = new FormData();
            fd.append('task_type', task.type);
            fd.append('transcript', transcript || '');
            fd.append('context_json', JSON.stringify(context));
            if (blob && blob.size > 0) fd.append('audio', blob, 'task.webm');

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
        <div className="min-h-[calc(100vh-4rem)] bg-white flex flex-col items-center justify-center p-6 md:p-8">
            <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest text-center">Preparing Level {level} Lesson...</h2>
        </div>
    );

    const currentTask = currentTaskIdx === -1 ? null : lesson.tasks[currentTaskIdx];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[#FCFDFF] pb-12 md:pb-20 px-0 md:px-1">
            <audio
                ref={audioRef}
                className="hidden"
            />


            {!hasInteracted ? (
                <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-3 md:p-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-slate-100 max-w-sm w-full"
                    >
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                            <span className="text-2xl md:text-4xl text-indigo-600">🎧</span>
                        </div>
                        <h2 className="text-lg md:text-2xl font-black text-slate-900 mb-1.5 md:mb-2">Ready to Speak?</h2>
                        <p className="text-xs md:text-base text-slate-500 font-medium mb-5 md:mb-8 leading-relaxed">Elena is ready to start your level {level} lesson. Turn up your volume!</p>
                        <button
                            onClick={() => setHasInteracted(true)}
                            className="w-full py-3.5 md:py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl md:rounded-2xl font-black transition-all shadow-lg shadow-indigo-200 active:scale-95"
                        >
                            Start Lesson
                        </button>
                    </motion.div>
                </div>
            ) : (
                <>
            <div className="max-w-3xl mx-auto px-3 md:px-4 pt-2 md:pt-12">
                <div className="flex items-center justify-between mb-3 md:mb-10">
                    <div className="flex-1 mr-3 md:mr-4">
                        <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
                            <span className="text-[8px] md:text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 md:px-2 py-0.5 rounded-md">Level {level}</span>
                            <span className="text-[8px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">• {currentTaskIdx === -1 ? 'Warm-up' : `Task ${currentTaskIdx + 1} of ${lesson.tasks.length}`}</span>
                        </div>
                        <h1 className="text-base md:text-2xl font-black text-slate-900 tracking-tight">{lesson?.title || 'English Lesson'}</h1>
                    </div>
                    <button
                        onClick={() => window.confirm('Exit lesson?') && onCancel()}
                        className="p-1.5 md:p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-all shrink-0"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="h-1 md:h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3 md:mb-12">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentTaskIdx + 2) / (lesson.tasks.length + 1)) * 100}%` }}
                        className="h-full bg-indigo-600"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {showIntro ? (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl md:rounded-2xl p-5 md:p-12 border border-slate-200 shadow-sm text-center flex flex-col items-center"
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 border border-indigo-100">
                                <span className="text-xl md:text-2xl">👩‍🏫</span>
                            </div>
                            <h3 className="text-sm md:text-2xl font-bold text-slate-900 mb-5 md:mb-10 leading-relaxed max-w-lg">
                                "{currentTaskIdx === -1 ? ELENA_MESSAGES.start : (ELENA_MESSAGES[`task_${currentTask.type}`] || "Let's continue.")}"
                            </h3>
                            {isElenaSpeaking || isPreparingAudio ? (
                                <div className="px-6 md:px-10 py-3 md:py-4 bg-slate-50 rounded-xl flex items-center justify-center gap-2 md:gap-3 border border-slate-100 shadow-sm transition-all">
                                    <div className="flex space-x-1.5">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-slate-500">
                                        {isPreparingAudio ? "Preparing..." : "Speaking..."}
                                    </span>
                                </div>
                            ) : !ttsCompleted ? (
                                <div className="px-6 md:px-10 py-3 md:py-4 bg-slate-50 rounded-xl flex items-center justify-center gap-2 md:gap-3 border border-slate-100 shadow-sm transition-all">
                                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-slate-500">
                                        Waiting...
                                    </span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowIntro(false)}
                                    className="px-8 md:px-10 py-3 md:py-4 text-white text-xs md:text-base font-bold rounded-xl transition-all shadow-lg active:scale-95 bg-indigo-600 hover:bg-slate-900 shadow-indigo-100"
                                >
                                    {currentTaskIdx === -1 ? "Let's Begin" : "Start Task"}
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 md:space-y-6"
                        >
                            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-10 border border-slate-200 shadow-sm min-h-[300px] md:min-h-[400px] flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full -translate-y-1/2 translate-x-1/2" />

                                {!feedback ? (
                                    <div className="text-center w-full space-y-5 md:space-y-8">
                                        {currentTaskIdx === -1 ? (
                                            <div className="space-y-4 md:space-y-8">
                                                <div className="px-2.5 md:px-3 py-0.5 md:py-1 bg-indigo-50 rounded-full inline-block text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100">Reading Passage</div>

                                                <div className="p-3 md:p-8 bg-[#F8FAFF] rounded-xl md:rounded-[2rem] border border-blue-50 relative">
                                                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                                                        <button
                                                            onClick={() => handleSpeak(lesson.content)}
                                                            disabled={isPreparingAudio || isElenaSpeaking}
                                                            className={`p-2 rounded-lg transition-all shadow-sm ${
                                                                isPreparingAudio || isElenaSpeaking
                                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                                            }`}
                                                            title="Listen to paragraph"
                                                        >
                                                            {isPreparingAudio
                                                                ? <Loader2 size={16} className="animate-spin" />
                                                                : <Volume2 size={16} />
                                                            }
                                                        </button>
                                                    </div>
                                                    {(() => {
                                                        const content = lesson?.content || '';
                                                        const dialoguePattern = /[A-Z][a-z]+:\s/;
                                                        const isDialogueContent = dialoguePattern.test(content);

                                                        if (isDialogueContent) {
                                                            const parts = content.split(/(?=[A-Z][a-z]+:\s)/).filter(s => s.trim());
                                                            const speakers = [];
                                                            parts.forEach(part => {
                                                                const match = part.match(/^([A-Z][a-z]+):\s(.+)/);
                                                                if (match) {
                                                                    speakers.push({ name: match[1], text: match[2].trim() });
                                                                }
                                                            });
                                                            const uniqueSpeakers = [...new Set(speakers.map(s => s.name))];
                                                            const colors = [
                                                                { bg: 'bg-indigo-50', border: 'border-indigo-100', name: 'text-indigo-600', text: 'text-slate-800' },
                                                                { bg: 'bg-amber-50', border: 'border-amber-100', name: 'text-amber-600', text: 'text-slate-800' },
                                                                { bg: 'bg-emerald-50', border: 'border-emerald-100', name: 'text-emerald-600', text: 'text-slate-800' },
                                                                { bg: 'bg-rose-50', border: 'border-rose-100', name: 'text-rose-600', text: 'text-slate-800' },
                                                            ];
                                                            const speakerColors = {};
                                                            uniqueSpeakers.forEach((name, i) => {
                                                                speakerColors[name] = colors[i % colors.length];
                                                            });

                                                            return (
                                                                <div className="space-y-2 md:space-y-3 pt-1 md:pt-2 pr-6 md:pr-8">
                                                                    {speakers.map((s, i) => {
                                                                        const c = speakerColors[s.name];
                                                                        const isEven = uniqueSpeakers.indexOf(s.name) % 2 === 0;
                                                                        return (
                                                                            <div key={i} className={`flex ${isEven ? 'justify-start' : 'justify-end'}`}>
                                                                                <div className={`max-w-[88%] md:max-w-[85%] p-2.5 md:p-4 rounded-xl md:rounded-2xl ${c.bg} border ${c.border} ${isEven ? 'rounded-tl-sm md:rounded-tl-md' : 'rounded-tr-sm md:rounded-tr-md'}`}>
                                                                                    <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${c.name} block mb-0.5 md:mb-1`}>{s.name}</span>
                                                                                    <p className={`text-xs md:text-base ${c.text} font-semibold leading-relaxed`}>"{s.text}"</p>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <p className="text-sm md:text-xl text-slate-800 leading-relaxed font-semibold pt-1 md:pt-2 pr-8 md:pr-10">
                                                                "{content}"
                                                            </p>
                                                        );
                                                    })()}
                                                    {lesson?.vocabulary && lesson.vocabulary.length > 0 && (
                                                        <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t border-blue-100">
                                                            <h4 className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-widest mb-2 md:mb-4">Vocabulary Focus</h4>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 md:gap-4">
                                                                {lesson.vocabulary.map((vocab, i) => (
                                                                    <div key={i} className="bg-white p-2 md:p-4 rounded-lg md:rounded-xl shadow-sm border border-blue-50">
                                                                        <div className="font-bold text-xs md:text-base text-slate-900">{vocab.word}</div>
                                                                        <div className="text-[9px] md:text-sm text-slate-500 mt-0.5">{vocab.definition}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pt-3 md:pt-4 flex flex-col items-center gap-3 md:gap-4">
                                                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
                                                        <button
                                                            onClick={() => nextTask()}
                                                            className="px-5 md:px-8 py-2 md:py-3 bg-indigo-600 text-white rounded-lg md:rounded-xl font-bold text-[11px] md:text-sm shadow-md hover:bg-slate-900 transition-all text-center"
                                                        >
                                                            Continue to Tasks
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 md:space-y-8">
                                                <div className="px-2.5 md:px-3 py-0.5 md:py-1 bg-slate-50 rounded-full inline-block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200">
                                                    Task {currentTaskIdx + 1}: {currentTask.type.replace('_', ' ')}
                                                </div>
                                                <div className="flex flex-col items-center gap-3 md:gap-4 mb-2 md:mb-4">
                                                    <h3 className="text-sm md:text-2xl font-black text-slate-900 leading-tight tracking-tight text-center max-w-lg">
                                                        {currentTask.prompt}
                                                    </h3>
                                                </div>

                                                {/* ---- NEW DYNAMIC TASK VISUALS ---- */}
                                                {currentTask.type === 'describe_image' && currentTask.image_url && (
                                                    <div className="relative w-full max-w-md mx-auto aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                                                        <img 
                                                            src={currentTask.image_url} 
                                                            alt="Describe this" 
                                                            className="w-full h-full object-cover shadow-inner"
                                                        />
                                                    </div>
                                                )}

                                                {currentTask.type === 'roleplay' && currentTask.roleplay_scenario && (
                                                    <div className="relative p-3 md:p-6 bg-purple-50 rounded-lg md:rounded-2xl border border-purple-100 text-center">
                                                        <span className="text-[10px] md:text-xs font-black text-purple-600 uppercase tracking-widest block mb-2">Scenario</span>
                                                        <p className="italic font-bold text-purple-900 text-xs md:text-lg">"{currentTask.roleplay_scenario}"</p>
                                                    </div>
                                                )}

                                                {currentTask.type === 'idiom_usage' && currentTask.target_idiom && (
                                                    <div className="relative p-3 md:p-6 bg-amber-50 rounded-lg md:rounded-2xl border border-amber-100 text-center">
                                                        <span className="text-[10px] md:text-xs font-black text-amber-600 uppercase tracking-widest block mb-2">Target Phrase / Idiom</span>
                                                        <p className="font-black text-amber-900 text-lg md:text-3xl">"{currentTask.target_idiom}"</p>
                                                    </div>
                                                )}

                                                {currentTask.type === 'debate' && currentTask.debate_stance && (
                                                    <div className="relative p-3 md:p-6 bg-rose-50 rounded-lg md:rounded-2xl border border-rose-100 text-center">
                                                        <span className="text-[10px] md:text-xs font-black text-rose-600 uppercase tracking-widest block mb-2">Your Stance</span>
                                                        <p className="font-bold text-rose-900 text-xs md:text-lg">"{currentTask.debate_stance}"</p>
                                                    </div>
                                                )}

                                                {/* ---- ORIGINAL REPEAT FIELD ---- */}
                                                {currentTask.text_to_repeat && (
                                                    <div className="relative p-3 md:p-6 bg-indigo-50/50 rounded-lg md:rounded-2xl border border-indigo-100">
                                                        <div className="absolute top-2 right-2 flex gap-2">
                                                            <button
                                                                onClick={() => handleSpeak(currentTask.prompt + ". " + currentTask.text_to_repeat)}
                                                                disabled={isPreparingAudio || isElenaSpeaking}
                                                                className={`p-1.5 md:p-2 rounded-lg transition-all shadow-sm ${
                                                                    isPreparingAudio || isElenaSpeaking
                                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                        : 'bg-white text-indigo-600 hover:bg-indigo-100'
                                                                }`}
                                                                title="Listen"
                                                            >
                                                                {isPreparingAudio
                                                                    ? <Loader2 size={14} className="animate-spin md:w-4 md:h-4" />
                                                                    : <Volume2 size={14} className="md:w-4 md:h-4" />
                                                                }
                                                            </button>
                                                        </div>
                                                        <p className="italic font-bold text-indigo-900 text-xs md:text-lg pt-1 pr-8">
                                                            "{currentTask.text_to_repeat}"
                                                        </p>
                                                    </div>
                                                )}

                                                <LiveAnswerBox
                                                    isTimerRunning={!isElenaSpeaking && !isPreparingAudio && !showIntro && !isEvaluating && timeRemaining > 0}
                                                    timer={timeRemaining}
                                                    maxTimer={
                                                        currentTask.type === 'debate' ? 120 :
                                                        (currentTask.type === 'free_speech' || currentTask.type === 'roleplay') ? 90 : 
                                                        60
                                                    }
                                                    onSubmitAnswer={handleTaskSubmit}
                                                    onPermissionChange={setMicBlocked}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-4 md:space-y-8"
                                    >
                                        <div className="text-center">
                                            <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-6 border border-emerald-100 shadow-sm">
                                                <span className="text-2xl md:text-3xl font-black">{feedback.scores?.overall || feedback.score || 0}</span>
                                            </div>
                                            <h3 className="text-base md:text-xl font-bold text-slate-900 mb-1 md:mb-2">AI Feedback</h3>
                                            <p className="text-xs md:text-xl text-slate-600 leading-relaxed font-semibold italic max-w-xl mx-auto px-2 md:px-4">
                                                "{feedback.feedback}"
                                            </p>

                                            {feedback.scores && (
                                                <div className="mt-3 md:mt-6 flex flex-wrap justify-center gap-2 md:gap-4 max-w-2xl mx-auto">
                                                    {['fluency', 'grammar', 'vocabulary', 'pronunciation'].map(metric => (
                                                        <div key={metric} className="px-2.5 md:px-4 py-1.5 md:py-2 bg-slate-50 rounded-lg md:rounded-xl border border-slate-200">
                                                            <div className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{metric}</div>
                                                            <div className="text-sm md:text-lg font-black text-slate-900">{feedback.scores[metric]}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                                            {feedback.corrections && (
                                                <div className="p-3 md:p-5 bg-amber-50 rounded-xl md:rounded-2xl border border-amber-100">
                                                    <h4 className="text-[9px] md:text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5 md:mb-3">Refinements</h4>
                                                    <p className="text-slate-700 text-xs md:text-sm font-semibold leading-relaxed">
                                                        {feedback.corrections}
                                                    </p>
                                                </div>
                                            )}
                                            {feedback.pronunciation_tip && (
                                                <div className="p-3 md:p-5 bg-indigo-50 rounded-xl md:rounded-2xl border border-indigo-100">
                                                    <h4 className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 md:mb-3">Pronunciation Tip</h4>
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

                                        {(feedback.scores?.overall || feedback.score || 0) < 40 ? (
                                            <div className="space-y-3">
                                                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm shrink-0 font-black">
                                                        {Math.round(feedback.scores?.overall || feedback.score || 0)}
                                                    </div>
                                                    <p className="text-xs font-bold text-rose-800 leading-tight">
                                                        Your score is low. Elena suggests retrying this task, or you can skip to continue checking more content.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setFeedback(null);
                                                        setShowIntro(true);
                                                        setTimeRemaining(currentTask.type === 'free_speech' ? 90 : 60);
                                                    }}
                                                    className="w-full py-3.5 md:py-5 bg-indigo-600 hover:bg-slate-900 text-white text-sm md:text-base font-bold rounded-xl md:rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 md:gap-3"
                                                >
                                                    <RotateCcw size={20} />
                                                    Retry Task
                                                </button>
                                                <button
                                                    onClick={nextTask}
                                                    className="w-full py-3.5 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                                                >
                                                    Skip Task & Continue <span>→</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={nextTask}
                                                className="w-full py-3.5 md:py-5 bg-slate-900 hover:bg-black text-white text-sm md:text-base font-bold rounded-xl md:rounded-2xl shadow-xl transition-all active:scale-[0.98]"
                                            >
                                                {currentTaskIdx === lesson.tasks.length - 1 ? "Finish Lesson" : "Next Task"}
                                            </button>
                                        )}
                                    </motion.div>
                                )}

                                {isElenaSpeaking && (
                                    <div className="flex justify-center mt-4 md:mt-10">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key="speaking"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl border backdrop-blur-md transition-all duration-500 bg-slate-50/80 border-slate-200/50 shadow-sm"
                                            >
                                                <div className="relative flex items-center justify-center w-1.5 h-1.5">
                                                    <div className="w-full h-full rounded-full bg-slate-400" />
                                                </div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-none text-slate-400">
                                                    Elena is Speaking
                                                </p>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                )}
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
                </>
            )}
        </div>
    );
};

export default LessonFlow;
