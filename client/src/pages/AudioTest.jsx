import React, { useState, useRef } from 'react';
import { transcribeAudio, speakText } from '../services/interviewApi';
const VOICES = [
    { id: 'en-US-AriaNeural', name: 'Aria', locale: '🇺🇸 US', gender: '♀', desc: 'Warm & professional', tag: 'recommended' },
    { id: 'en-US-JennyNeural', name: 'Jenny', locale: '🇺🇸 US', gender: '♀', desc: 'Friendly & clear' },
    { id: 'en-US-MichelleNeural', name: 'Michelle', locale: '🇺🇸 US', gender: '♀', desc: 'Natural & expressive' },
    { id: 'en-US-EmmaNeural', name: 'Emma', locale: '🇺🇸 US', gender: '♀', desc: 'Calm & articulate' },
    { id: 'en-US-AvaNeural', name: 'Ava', locale: '🇺🇸 US', gender: '♀', desc: 'Confident & bright' },
    { id: 'en-US-AndrewNeural', name: 'Andrew', locale: '🇺🇸 US', gender: '♂', desc: 'Deep & authoritative' },
    { id: 'en-US-BrianNeural', name: 'Brian', locale: '🇺🇸 US', gender: '♂', desc: 'Smooth & steady' },
    { id: 'en-US-ChristopherNeural', name: 'Christopher', locale: '🇺🇸 US', gender: '♂', desc: 'Clear & formal' },
    { id: 'en-US-EricNeural', name: 'Eric', locale: '🇺🇸 US', gender: '♂', desc: 'Neutral & balanced' },
    { id: 'en-US-GuyNeural', name: 'Guy', locale: '🇺🇸 US', gender: '♂', desc: 'Energetic & engaging' },
    { id: 'en-US-SteffanNeural', name: 'Steffan', locale: '🇺🇸 US', gender: '♂', desc: 'Friendly & upbeat' },
    { id: 'en-US-RogerNeural', name: 'Roger', locale: '🇺🇸 US', gender: '♂', desc: 'Mature & measured' },
    { id: 'en-GB-SoniaNeural', name: 'Sonia', locale: '🇬🇧 UK', gender: '♀', desc: 'Polished British accent', tag: 'popular' },
    { id: 'en-GB-LibbyNeural', name: 'Libby', locale: '🇬🇧 UK', gender: '♀', desc: 'Crisp & professional' },
    { id: 'en-GB-MaisieNeural', name: 'Maisie', locale: '🇬🇧 UK', gender: '♀', desc: 'Warm British tone' },
    { id: 'en-GB-RyanNeural', name: 'Ryan', locale: '🇬🇧 UK', gender: '♂', desc: 'Authoritative & clear', tag: 'popular' },
    { id: 'en-GB-ThomasNeural', name: 'Thomas', locale: '🇬🇧 UK', gender: '♂', desc: 'BBC-style delivery' },
    { id: 'en-AU-NatashaNeural', name: 'Natasha', locale: '🇦🇺 AU', gender: '♀', desc: 'Bright & approachable' },
    { id: 'en-AU-WilliamMultilingualNeural', name: 'William', locale: '🇦🇺 AU', gender: '♂', desc: 'Multilingual — very natural' },
    { id: 'en-CA-ClaraNeural', name: 'Clara', locale: '🇨🇦 CA', gender: '♀', desc: 'Neutral & pleasant' },
    { id: 'en-CA-LiamNeural', name: 'Liam', locale: '🇨🇦 CA', gender: '♂', desc: 'Clear & natural' },
    { id: 'en-IN-NeerjaExpressiveNeural', name: 'Neerja', locale: '🇮🇳 IN', gender: '♀', desc: 'Expressive Indian accent' },
    { id: 'en-IN-PrabhatNeural', name: 'Prabhat', locale: '🇮🇳 IN', gender: '♂', desc: 'Natural Indian English' },
    { id: 'en-IE-EmilyNeural', name: 'Emily', locale: '🇮🇪 IE', gender: '♀', desc: 'Soft Irish lilt' },
    { id: 'en-IE-ConnorNeural', name: 'Connor', locale: '🇮🇪 IE', gender: '♂', desc: 'Warm Irish tone' },
    { id: 'en-SG-LunaNeural', name: 'Luna', locale: '🇸🇬 SG', gender: '♀', desc: 'Clear Singapore English' },
    { id: 'en-NZ-MollyNeural', name: 'Molly', locale: '🇳🇿 NZ', gender: '♀', desc: 'Friendly NZ accent' },
];
const PREVIEW_TEXT = "Welcome to the AI mock interview. I will be your interviewer today. Please speak clearly and take your time with each answer. What is JavaScript? Example for DSA";
const TAG_STYLES = {
    recommended: 'bg-blue-100 text-blue-700 border-blue-200',
    popular: 'bg-purple-100 text-purple-700 border-purple-200',
};
const AudioTest = () => {
    const [ttsInput, setTtsInput] = useState(PREVIEW_TEXT);
    const [selectedVoice, setSelectedVoice] = useState('en-US-AriaNeural');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [playingVoiceId, setPlayingVoiceId] = useState(null);
    const [ttsLog, setTtsLog] = useState('');
    const [filterGender, setFilterGender] = useState('all');
    const [filterLocale, setFilterLocale] = useState('all');
    const audioRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [sttError, setSttError] = useState('');
    const [analysisData, setAnalysisData] = useState(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const chunksRef = useRef([]);

    const stopAny = () => {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        setIsSpeaking(false);
        setPlayingVoiceId(null);
    };

    const playVoice = async (voiceId, text) => {
        stopAny();
        setIsSpeaking(true);
        setPlayingVoiceId(voiceId);
        setTtsLog(`Requesting audio...`);
        try {
            const url = await speakText(text, voiceId);
            const audio = new Audio(url);
            audioRef.current = audio;
            setTtsLog('Playing...');
            audio.onended = () => { stopAny(); setTtsLog(`Done.`); URL.revokeObjectURL(url); };
            audio.onerror = () => { stopAny(); setTtsLog('Playback error.'); };
            await audio.play();
        } catch (err) {
            stopAny();
            setTtsLog(`Error: ${err.message}`);
        }
    };

    const startRecording = async () => {
        setSttError(''); chunksRef.current = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mr.onstop = processAudio;
            mr.start(250);
            mediaRecorderRef.current = mr;
            setIsRecording(true);
        } catch (err) { setSttError('Mic access denied'); }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach(t => t.stop());
        setIsRecording(false);
    };

    const processAudio = async () => {
        setIsProcessing(true); setAnalysisData(null);
        try {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const fd = new FormData();
            fd.append('audio', blob, 'recording.webm');
            const res = await transcribeAudio(fd);
            if (res.status === 'success' && res.data?.analysis) {
                const a = res.data.analysis;
                setTranscript(prev => (prev ? prev + ' ' : '') + (a.transcript || ''));
                setAnalysisData(a);
            }
        } catch (err) {
            setSttError('Transcription failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const locales = ['all', ...Array.from(new Set(VOICES.map(v => v.locale)))];
    const filteredVoices = VOICES.filter(v =>
        (filterGender === 'all' || v.gender === filterGender) &&
        (filterLocale === 'all' || v.locale === filterLocale)
    );

    const selectedVoiceObj = VOICES.find(v => v.id === selectedVoice);

    return (
        <div className="min-h-screen w-full bg-[#FCFDFF] flex flex-col p-6 sm:p-12 items-center overflow-y-auto">
            <div className="w-full max-w-4xl space-y-10">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Audio Diagnostics</h1>
                    <p className="text-slate-500 font-medium">Internal tools to verify voice output and speech-to-text accuracy.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Voice Selection</h3>
                                {selectedVoiceObj && (
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                        ACTIVE: {selectedVoiceObj.name}
                                    </span>
                                )}
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {['all', '♀', '♂'].map(g => (
                                            <button key={g} onClick={() => setFilterGender(g)}
                                                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${filterGender === g ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                                                {g === 'all' ? 'All' : g === '♀' ? 'Female' : 'Male'}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredVoices.map((voice) => {
                                            const isSelected = selectedVoice === voice.id;
                                            const isPlaying = playingVoiceId === voice.id;
                                            return (
                                                <div key={voice.id}
                                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                                                    onClick={() => setSelectedVoice(voice.id)}
                                                >
                                                    <div className="min-w-0 pr-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-xs text-slate-900 truncate">{voice.name}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{voice.locale}</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 font-medium truncate">{voice.desc}</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); isPlaying ? stopAny() : playVoice(voice.id, PREVIEW_TEXT); }}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-indigo-600 border border-slate-200 shadow-sm'}`}
                                                    >
                                                        {isPlaying ? <span className="text-[10px]">⏹</span> : <span className="text-[10px]">▶</span>}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Transcription</h3>

                            <div className="min-h-[160px] bg-slate-50 rounded-xl p-4 text-xs text-slate-600 font-medium leading-relaxed border border-slate-100">
                                {isProcessing ? (
                                    <div className="flex flex-col items-center justify-center gap-3 h-full">
                                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">Processing...</span>
                                    </div>
                                ) : transcript ? (
                                    <span className="whitespace-pre-wrap">"{transcript}"</span>
                                ) : (
                                    <span className="text-slate-400 italic">No audio captured yet.</span>
                                )}
                            </div>

                            {analysisData && (
                                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-[10px] font-bold text-indigo-600">
                                    Fillers detected: {analysisData.filler_count ?? 0}
                                </div>
                            )}

                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isProcessing}
                                className={`w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-indigo-600 hover:bg-slate-900'}`}
                            >
                                {isRecording ? 'Stop Recording' : 'Start Recording'}
                            </button>

                            <button
                                onClick={() => { setTranscript(''); setAnalysisData(null); setSttError(''); }}
                                className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                            >
                                Reset Terminal
                            </button>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Service Health</p>
                            <div className="space-y-2">
                                {[
                                    { label: 'Python Backend', status: 'online' },
                                    { label: 'Azure TTS Engine', status: 'online' },
                                    { label: 'Whisper STT', status: 'ready' },
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center justify-between text-[10px] font-bold">
                                        <span className="text-slate-600">{s.label}</span>
                                        <span className="text-emerald-500 uppercase tracking-tighter">{s.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AudioTest;
