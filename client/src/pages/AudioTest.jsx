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
        setTtsLog(`Requesting audio from Python service (${voiceId})...`);
        try {
            const url = await speakText(text, voiceId);
            const audio = new Audio(url);
            audioRef.current = audio;
            setTtsLog('Playing...');
            audio.onended = () => { stopAny(); setTtsLog(`✅ Done — ${voiceId}`); URL.revokeObjectURL(url); };
            audio.onerror = () => { stopAny(); setTtsLog('❌ Playback error.'); };
            await audio.play();
        } catch (err) {
            stopAny();
            setTtsLog(`❌ ${err.message}`);
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
        } catch (err) { setSttError('Mic denied: ' + err.message); }
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
            } else {
                setSttError('Unexpected API response.');
            }
        } catch (err) {
            setSttError('Transcription failed: ' + (err.response?.data?.detail || err.message));
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
        <div className="h-full w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col p-4 sm:p-8 items-center overflow-y-auto">
            <div className="w-full max-w-5xl space-y-6">
                {}
                <div className="text-center">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-1">
                        Audio API Diagnostics
                    </h1>
                    <p className="text-gray-500 text-sm">Preview all available AI voices, then pick the one for your interview.</p>
                </div>
                {}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-white font-bold text-lg">🗣️ Voice Lab</h2>
                            <p className="text-blue-100 text-xs mt-0.5">
                                {filteredVoices.length} voices · Click a voice card to preview · Check ✅ to select for interview
                            </p>
                        </div>
                        {selectedVoiceObj && (
                            <div className="flex items-center gap-2 bg-white/20 border border-white/30 text-white rounded-xl px-4 py-2 text-sm font-semibold">
                                <span className="text-base">{selectedVoiceObj.gender === '♀' ? '👩' : '👨'}</span>
                                Selected: <strong>{selectedVoiceObj.name}</strong> {selectedVoiceObj.locale}
                            </div>
                        )}
                    </div>
                    <div className="p-4 sm:p-5 space-y-4">
                        {}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Preview Text</label>
                            <div className="flex gap-2">
                                <textarea
                                    value={ttsInput}
                                    onChange={(e) => setTtsInput(e.target.value)}
                                    rows={2}
                                    className="flex-1 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                    placeholder="Type text to preview with any voice..."
                                />
                            </div>
                        </div>
                        {}
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Filter:</span>
                            <div className="flex gap-1.5">
                                {['all', '♀', '♂'].map(g => (
                                    <button key={g} onClick={() => setFilterGender(g)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${filterGender === g ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                                        {g === 'all' ? 'All' : g === '♀' ? '♀ Female' : '♂ Male'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                {locales.map(loc => (
                                    <button key={loc} onClick={() => setFilterLocale(loc)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${filterLocale === loc ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                                        {loc === 'all' ? '🌐 All' : loc}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {}
                        {ttsLog && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-600">
                                {ttsLog}
                                {isSpeaking && (
                                    <button onClick={stopAny} className="ml-3 text-red-500 font-bold hover:underline">⏹ Stop</button>
                                )}
                            </div>
                        )}
                        {}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                            {filteredVoices.map((voice) => {
                                const isSelected = selectedVoice === voice.id;
                                const isPlaying = playingVoiceId === voice.id;
                                return (
                                    <div key={voice.id}
                                        className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-blue-50/40'
                                            }`}
                                        onClick={() => setSelectedVoice(voice.id)}
                                    >
                                        {}
                                        <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all ${isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'bg-white border-gray-200 text-gray-500'
                                            }`}>
                                            {voice.gender === '♀' ? '👩' : '👨'}
                                        </div>
                                        {}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-sm text-gray-800">{voice.name}</span>
                                                <span className="text-xs text-gray-400">{voice.locale}</span>
                                                {voice.tag && (
                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${TAG_STYLES[voice.tag]}`}>
                                                        {voice.tag}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{voice.desc}</p>
                                        </div>
                                        {}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); isPlaying ? stopAny() : playVoice(voice.id, ttsInput || PREVIEW_TEXT); }}
                                            disabled={isSpeaking && !isPlaying}
                                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all font-bold text-sm ${isPlaying
                                                ? 'bg-red-500 text-white animate-pulse'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40'
                                                }`}
                                            title={isPlaying ? 'Stop' : `Preview ${voice.name}`}
                                        >
                                            {isPlaying ? '⏹' : '▶'}
                                        </button>
                                        {}
                                        {isSelected && (
                                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-black">✓</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {filteredVoices.length === 0 && (
                            <div className="text-center text-gray-400 py-8 text-sm">No voices match your filters.</div>
                        )}
                    </div>
                </div>
                {}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-4">
                        <h2 className="text-white font-bold text-lg">🎤 Speech-to-Text Test</h2>
                        <p className="text-green-100 text-xs mt-0.5">Python Whisper (base) · Records audio → sends to Python → returns transcript + filler analysis</p>
                    </div>
                    <div className="p-5 space-y-4">
                        {sttError && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{sttError}</div>
                        )}
                        <div className="min-h-28 max-h-48 p-3 border border-gray-200 bg-gray-50 rounded-xl overflow-y-auto text-sm text-gray-700 leading-relaxed">
                            {isProcessing ? (
                                <div className="flex items-center gap-2 h-20 justify-center text-indigo-600">
                                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <span>Whisper is transcribing...</span>
                                </div>
                            ) : transcript ? (
                                <span className="whitespace-pre-wrap">{transcript}</span>
                            ) : (
                                <span className="text-gray-400 italic">Record something — transcript will appear here...</span>
                            )}
                        </div>
                        {analysisData && (
                            <div className="flex flex-wrap gap-2 text-xs">
                                <div className="bg-orange-50 border border-orange-100 text-orange-700 px-3 py-1.5 rounded-lg font-semibold">
                                    Filler words: {analysisData.filler_count ?? 0}
                                    {Object.keys(analysisData.filler_breakdown || {}).length > 0 && (
                                        <span className="ml-1 font-normal text-orange-500">
                                            ({Object.entries(analysisData.filler_breakdown).map(([k, v]) => `${k}×${v}`).join(', ')})
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isProcessing}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {isRecording ? '⏹ Stop Recording' : '⏺ Start Recording'}
                            </button>
                            <button
                                onClick={() => { setTranscript(''); setAnalysisData(null); setSttError(''); }}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
                {}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Running Services</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {[
                            { label: 'Python FastAPI · localhost:8000', color: 'blue' },
                            { label: 'TTS · edge-tts (Azure Neural)', color: 'indigo' },
                            { label: 'STT · Whisper base', color: 'purple' },
                        ].map(({ label, color }) => (
                            <div key={label} className={`flex items-center gap-1.5 bg-${color}-50 border border-${color}-100 text-${color}-700 px-3 py-1.5 rounded-full font-medium`}>
                                <span className={`w-2 h-2 bg-${color}-500 rounded-full`} />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AudioTest;