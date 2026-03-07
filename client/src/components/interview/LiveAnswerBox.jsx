import React, { useState, useEffect, useRef } from 'react';
const LiveAnswerBox = ({ isTimerRunning, timer, maxTimer, onSubmitAnswer, onEndInterview }) => {
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(80);
    const [isRecording, setIsRecording] = useState(false);
    const [typedText, setTypedText] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const audioBlobRef = useRef(null);
    const typedTextRef = useRef('');
    const recognitionRef = useRef(null);
    useEffect(() => { typedTextRef.current = typedText; }, [typedText]);
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const r = new SR();
        r.continuous = true; r.interimResults = true; r.lang = 'en-US';
        r.onresult = (e) => {
            let final = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
            }
            if (final) setTypedText(prev => (prev + final).trimStart());
        };
        r.onerror = () => { }; r.onend = () => { };
        recognitionRef.current = r;
        return () => { try { r.stop(); } catch (_) { } };
    }, []);
    useEffect(() => {
        if (isTimerRunning) startRecording();
        else stopAll();
    }, [isTimerRunning]);
    useEffect(() => {
        if (timer === 0 && !isTimerRunning) {
            const id = setTimeout(handleSubmit, 4000);
            return () => clearTimeout(id);
        }
    }, [timer, isTimerRunning]);
    const startRecording = async () => {
        audioChunksRef.current = [];
        audioBlobRef.current = null;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mr.onstop = () => { audioBlobRef.current = new Blob(audioChunksRef.current, { type: 'audio/webm' }); };
            mr.start(250);
            mediaRecorderRef.current = mr;
            setIsRecording(true);
            try { recognitionRef.current?.start(); } catch (_) { }
        } catch { setIsRecording(false); }
    };
    const stopAll = () => {
        if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setIsRecording(false);
        try { recognitionRef.current?.stop(); } catch (_) { }
    };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        stopAll();

        // Wait for the onstop event to finish creating the blob
        // Using a short interval or checking the ref
        const checkBlob = (attempts) => {
            if (audioBlobRef.current || attempts <= 0) {
                onSubmitAnswer(typedTextRef.current.trim(), audioBlobRef.current);
                setIsSubmitting(false);
            } else {
                setTimeout(() => checkBlob(attempts - 1), 50);
            }
        };

        setTimeout(() => checkBlob(10), 100);
    };
    const timerPct = maxTimer ? (timer / maxTimer) * 100 : 100;
    return (
        <div className="flex flex-col gap-2 sm:gap-4 max-w-lg mx-auto w-full lg:max-w-none">
            { }
            <div className="relative bg-white/80 lg:bg-white/60 backdrop-blur-2xl lg:backdrop-blur-xl border border-slate-200/60 lg:border-white rounded-[2.5rem] lg:rounded-[2.5rem] p-2 sm:p-2.5 lg:p-8 flex items-center lg:flex-col lg:items-center gap-2 sm:gap-4 lg:gap-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] lg:shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 lg:ring-0 ring-black/5 overflow-hidden transition-all duration-500 group lg:hover:-translate-y-1 lg:hover:shadow-blue-500/10">
                { }
                {isTimerRunning && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-50 lg:hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${timer <= 10 ? 'bg-red-500' : 'bg-blue-600'}`}
                            style={{ width: `${timerPct}%` }}
                        />
                    </div>
                )}
                <div className="flex items-center justify-between w-full lg:flex-col lg:gap-8">
                    { }
                    <div className="flex items-center gap-2 sm:gap-4 lg:w-full lg:justify-between lg:flex-row-reverse">
                        { }
                        <button
                            onClick={() => setMuted(m => !m)}
                            className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center transition-all shadow-sm shrink-0 ${muted ? 'bg-rose-50 text-rose-500 shadow-inner' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100 lg:border-white lg:shadow-md'
                                }`}
                        >
                            {muted ? (
                                <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l-4-4m0 4l4-4" /></svg>
                            ) : (
                                <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
                            )}
                        </button>
                        <div className="flex-grow hidden sm:flex flex-col items-start">
                            <span className="text-[9px] lg:text-[10px] font-black text-slate-300 lg:text-blue-500 uppercase tracking-widest mb-1 block">Session Protocol</span>
                            <div className="flex items-center gap-2 lg:gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse lg:hidden" />
                                <span className="text-xs lg:text-base font-black text-slate-600 lg:text-slate-900 uppercase tracking-tight">Active Audio</span>
                            </div>
                        </div>
                    </div>
                    { }
                    {isTimerRunning && (
                        <div className="hidden lg:block w-full">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-400">Response Window</span>
                                <span className="text-[10px] font-black text-slate-500 tabular-nums">{String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}</span>
                            </div>
                            <div className="h-2 bg-slate-100/50 rounded-full overflow-hidden w-full">
                                <div
                                    className={`h-full transition-all duration-1000 ${timer <= 10 ? 'bg-red-500' : 'bg-blue-600'}`}
                                    style={{ width: `${timerPct}%` }}
                                />
                            </div>
                        </div>
                    )}
                    { }
                    <div className="flex items-center gap-2 pr-1 lg:pr-0 lg:w-full lg:flex-col lg:gap-3 lg:items-stretch">
                        <button
                            onClick={handleSubmit}
                            disabled={!isRecording}
                            className={`group relative flex items-center justify-center gap-3 px-6 sm:px-10 py-3 sm:py-3.5 lg:py-4 rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-[0.15em] transition-all shadow-lg active:scale-95 lg:order-1 ${isRecording
                                ? 'bg-blue-600 text-white shadow-blue-200/50 hover:bg-blue-500'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200 shadow-none'
                                }`}
                        >
                            <span className="relative z-10">{isRecording ? 'Submit' : 'Wait...'}</span>
                            {isRecording && (
                                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                            )}
                            <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-2xl" />
                        </button>
                        <button
                            onClick={() => { stopAll(); onEndInterview?.(); }}
                            className="px-5 sm:px-7 py-3 sm:py-3.5 lg:py-4 bg-white border border-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-black rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-md lg:order-2 lg:border-white lg:hover:border-rose-100 lg:hover:shadow-rose-100/50"
                        >
                            End Session
                        </button>
                    </div>
                </div>
            </div>
            { }
            {isTimerRunning && (
                <div className="flex lg:hidden items-center justify-center gap-6 mb-0.5 animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')} REMAINING</span>
                    </div>
                </div>
            )}
            <p className="flex lg:hidden text-[8px] sm:text-[10px] text-slate-400 justify-center font-medium uppercase tracking-[0.2em] opacity-60">
                {isRecording ? 'Listening for your response' : 'Preparing AI Voice'}
            </p>
        </div>
    );
};
export default LiveAnswerBox;