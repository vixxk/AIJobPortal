import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const LiveAnswerBox = ({ isTimerRunning, timer, maxTimer, onSubmitAnswer, onEndInterview, layout = 'footer' }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [interimText, setInterimText] = useState('');
    const [audioLevels, setAudioLevels] = useState(Array(15).fill(2));
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const audioBlobRef = useRef(null);
    const typedTextRef = useRef('');
    const interimTextRef = useRef('');
    const recognitionRef = useRef(null);
    const animationFrameRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isRecordingRef = useRef(false);
    useEffect(() => { typedTextRef.current = typedText; }, [typedText]);
    useEffect(() => { interimTextRef.current = interimText; }, [interimText]);
    const stopAll = () => {
        if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => {});
        }
        setAudioLevels(Array(15).fill(4));
        setIsRecording(false);
        try { recognitionRef.current?.stop(); } catch (_) { }
    };
    const startRecording = async () => {
        setTypedText('');
        setInterimText('');
        audioChunksRef.current = [];
        audioBlobRef.current = null;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 64;
            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let lastUpdateTime = 0;
            const updateLevels = (timestamp) => {
                if (timestamp - lastUpdateTime < 60) { // Update approx 16 times per second (~60ms) instead of 60
                    animationFrameRef.current = requestAnimationFrame(updateLevels);
                    return;
                }
                lastUpdateTime = timestamp;

                analyser.getByteFrequencyData(dataArray);
                const levels = Array.from({ length: 15 }, (_, i) => {
                    const val = dataArray[i * 2] || 0;
                    return Math.max(4, (val / 255) * 48);
                });

                setAudioLevels(prev => {
                    // Only update if at least one bar changed by more than 2px to avoid micro-renders
                    const changed = levels.some((v, i) => Math.abs(v - prev[i]) > 2);
                    return changed ? levels : prev;
                });
                animationFrameRef.current = requestAnimationFrame(updateLevels);
            };
            animationFrameRef.current = requestAnimationFrame(updateLevels);
            const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mr.onstop = () => { audioBlobRef.current = new Blob(audioChunksRef.current, { type: 'audio/webm' }); };
            mr.start(250);
            mediaRecorderRef.current = mr;
            setIsRecording(true);
            try { recognitionRef.current?.start(); } catch { }
        } catch (err) {
            setIsRecording(false);
        }
    };
    const handleSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try { recognitionRef.current?.stop(); } catch (_) { }
        stopAll();

        // Give MediaRecorder a moment to finalize the onstop and blob creation
        const checkBlob = (attempts) => {
            const finalTranscript = (typedTextRef.current + interimTextRef.current).trim();

            // If we have a blob OR we've exhausted wait attempts
            if (audioBlobRef.current || attempts <= 0) {
                // If neither transcript nor blob exist, we treat it as an empty answer but allow it
                // Logic is handled in the parent via handleAnswerSubmit
                onSubmitAnswer(finalTranscript, audioBlobRef.current);
                setIsSubmitting(false);
            } else {
                setTimeout(() => checkBlob(attempts - 1), 150);
            }
        };

        // Increase delay between stopping and checking to ensure blob finalized
        setTimeout(() => checkBlob(15), 250);
    };
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const r = new SR();
        r.continuous = true; r.interimResults = true; r.lang = 'en-US';
        r.onresult = (e) => {
            let final = '';
            let interim = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
                else interim += e.results[i][0].transcript;
            }
            if (final) setTypedText(prev => (prev + final).trimStart());
            setInterimText(interim);
        };
        let hasError = false;
        r.onerror = (e) => {
            // console.error('STT Error:', e.error); // Removed console.error
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
                hasError = true;
            }
            if (e.error === 'network') {
                hasError = true;
            }
        };
        r.onend = () => {
            if (isRecordingRef.current && !hasError) {
                try {
                    // Small delay to avoid rapid-fire restarts
                    setTimeout(() => {
                        if (isRecordingRef.current) recognitionRef.current?.start();
                    }, 500);
                } catch { }
            }
        };
        recognitionRef.current = r;
        return () => { try { r.stop(); } catch { } };
    }, []);
    useEffect(() => {
        const checkBrave = async () => {
            if (navigator.brave && await navigator.brave.isBrave()) {
            }
        };
        checkBrave();
    }, []);
    useEffect(() => {
        isRecordingRef.current = isRecording;
        if (!isRecording) {
            try { recognitionRef.current?.stop(); } catch { }
        }
    }, [isRecording]);
    useEffect(() => {
        const sync = () => {
            if (isTimerRunning) startRecording();
            else stopAll();
        };
        sync();
    }, [isTimerRunning]);
    useEffect(() => {
        if (timer === 0 && !isTimerRunning) {
            const id = setTimeout(handleSubmit, 1000);
            return () => clearTimeout(id);
        }
    }, [timer, isTimerRunning, handleSubmit]);

    const timerPct = maxTimer ? (timer / maxTimer) * 100 : 100;

    return (
        <div className="flex flex-col gap-3 md:gap-6 max-w-2xl mx-auto w-full px-2">
            <div className="relative bg-white rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500">

                <div className="flex flex-col items-center gap-3 md:gap-8 relative z-10">
                    <div className="w-full flex flex-col items-center gap-2 md:gap-4">
                        <div className="h-12 md:h-16 flex items-center justify-center gap-1 px-4">
                            {audioLevels.map((h, i) => (
                                <motion.div
                                    key={i}
                                    style={{ height: `${h}px` }}
                                    className="w-1 md:w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-purple-500 opacity-80"
                                    animate={{ height: isRecording ? Math.max(4, h) : 4 }}
                                />
                            ))}
                        </div>

                        <AnimatePresence>
                            {(isRecording && (typedText || interimText)) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute top-16 md:top-24 left-0 right-0 px-4 md:px-8 text-center pointer-events-none"
                                >
                                    <p className="text-xs md:text-base font-medium text-slate-500 leading-relaxed max-w-md mx-auto line-clamp-1 italic">
                                        {typedText}
                                        <span className="text-indigo-400 opacity-60">{interimText}</span>
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-col items-center">
                            <span className="text-[7px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Audio Capture</span>
                            <div className="flex items-center gap-2 md:gap-3 bg-slate-50/50 px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-slate-100/50">
                                <div className="relative flex items-center justify-center w-1.5 h-1.5">
                                    <div className={`w-full h-full rounded-full transition-all duration-300 ${isRecording ? 'bg-rose-500' : 'bg-slate-300'}`} />
                                    {isRecording && (
                                        <div className="absolute inset-0 w-full h-full rounded-full bg-rose-500 animate-ping opacity-40" />
                                    )}
                                </div>
                                <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${isRecording ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {isRecording ? 'Listening...' : 'Ready'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isTimerRunning && (
                        <div className="w-full max-w-sm px-2">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                                <span className="text-[10px] font-black text-slate-900 tabular-nums">
                                    {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
                                </span>
                            </div>
                            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                <motion.div
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${timerPct}%` }}
                                    className={`h-full rounded-full transition-colors duration-1000 ${timer <= 10 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                                />
                            </div>
                        </div>
                    )}

                    <div className={`flex items-center gap-2 md:gap-3 w-full ${layout === 'sidebar' ? 'flex-col' : 'flex-row'}`}>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!isRecording && !typedText.trim())}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 md:py-5 rounded-xl md:rounded-[2rem] font-black text-[10px] md:text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isSubmitting || (!isRecording && !typedText.trim())
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
                                : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-slate-900'
                                }`}
                        >
                            <span>{isSubmitting ? 'Syncing...' : 'Submit Answer'}</span>
                        </button>

                        {onEndInterview && (
                            <button
                                onClick={() => { stopAll(); onEndInterview?.(); }}
                                className={`flex items-center justify-center gap-2 px-4 py-3.5 md:px-6 md:py-5 bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl md:rounded-[2rem] transition-all shadow-sm shrink-0 ${layout === 'sidebar' ? 'w-full' : 'w-auto'}`}
                                title="End Session"
                                type="button"
                            >
                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                <span className={layout === 'sidebar' ? 'inline' : 'hidden md:inline'}>End Session</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LiveAnswerBox;
