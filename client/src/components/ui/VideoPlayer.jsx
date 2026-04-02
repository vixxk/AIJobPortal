import { useState, useEffect, useRef } from 'react';
import {
    Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw, Maximize,
    MonitorPlay, Video
} from 'lucide-react';
import clsx from 'clsx';

export const extractYouTubeId = (url) => {
    if (!url) return '';
    if (/^[\w-]{11}$/.test(url.trim())) return url.trim(); // bare 11-char ID
    try {
        const u = new URL(url);
        if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
        if (u.pathname.startsWith('/live/')) return u.pathname.split('/live/')[1].split('?')[0];
        if (u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1].split('?')[0];
        if (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') {
            return u.searchParams.get('v') || '';
        }
        return '';
    } catch { return ''; }
};

const VideoPlayer = ({ lecture }) => {
    const iframeRef = useRef(null);
    const playerContainerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const timeoutRef = useRef(null);

    const rates = [1, 1.25, 1.5, 2];

    const currentTimeRef = useRef(0);
    const playbackRateRef = useRef(1);
    const isMutedRef = useRef(false);
    const isPlayingRef = useRef(false);
    const lastSeekManualRef = useRef(0);

    useEffect(() => {
        if (showControls && isPlaying) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setShowControls(false), 3000);
        }
    }, [showControls, isPlaying]);

    useEffect(() => {
        currentTimeRef.current = currentTime;
        playbackRateRef.current = playbackRate;
        isMutedRef.current = isMuted;
        isPlayingRef.current = isPlaying;
    }, [currentTime, playbackRate, isMuted, isPlaying]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (!event.origin.includes("youtube.com") && !event.origin.includes("youtube-nocookie.com")) return;
            try {
                const data = JSON.parse(event.data);

                if (data.event === 'onReady' || data.event === 'initialDelivery' || (data.event === 'infoDelivery' && data.info)) {
                    if (!isPlayerReady) setIsPlayerReady(true);
                }

                if (data.event === 'infoDelivery' && data.info) {
                    const info = data.info;
                    const isRecentlySought = Date.now() - lastSeekManualRef.current < 2000;

                    if (info.currentTime !== undefined && !isRecentlySought) {
                        if (Math.abs(info.currentTime - currentTimeRef.current) > 1) {
                            setCurrentTime(info.currentTime);
                        }
                    }
                    if (info.playerState !== undefined) {
                        const newPlaying = info.playerState === 1;
                        if (newPlaying !== isPlayingRef.current) setIsPlaying(newPlaying);
                    }
                    if (info.playbackRate !== undefined && info.playbackRate !== playbackRateRef.current) {
                        setPlaybackRate(info.playbackRate);
                    }
                    if (info.muted !== undefined && info.muted !== isMutedRef.current) {
                        setIsMuted(info.muted);
                    }
                }
            } catch (e) { }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isPlayerReady]);

    const sendCommand = (func, args = []) => {
        if (iframeRef.current) {
            const formattedArgs = Array.isArray(args) ? args : [args];
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: func,
                args: formattedArgs
            }), '*');
        }
    };

    useEffect(() => {
        if (isPlayerReady) {
            sendCommand('addEventListener', ['onStateChange']);
            sendCommand('addEventListener', ['onPlaybackRateChange']);
            if (playbackRateRef.current !== 1) {
                sendCommand('setPlaybackRate', [playbackRateRef.current]);
            }
        }
    }, [isPlayerReady]);

    useEffect(() => {
        setIsPlayerReady(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setPlaybackRate(1);
    }, [lecture?._id]);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const togglePlay = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const newState = !isPlayingRef.current;
        setIsPlaying(newState);
        if (isPlayingRef.current) {
            sendCommand('pauseVideo');
        } else {
            sendCommand('unMute');
            sendCommand('playVideo');
        }
    };

    const toggleMute = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const nextMuted = !isMutedRef.current;
        setIsMuted(nextMuted);
        if (isMutedRef.current) sendCommand('unMute');
        else sendCommand('mute');
    };

    const seek = (e, delta) => {
        const actualDelta = typeof e === 'number' ? e : delta;
        const event = typeof e === 'number' ? null : e;
        if (event && event.stopPropagation) event.stopPropagation();

        lastSeekManualRef.current = Date.now();
        const targetTime = Math.max(0, currentTimeRef.current + actualDelta);
        setCurrentTime(targetTime);

        if (!isPlayingRef.current) {
            sendCommand('playVideo');
        }
        sendCommand('seekTo', [targetTime, true]);
    };

    const togglePlaybackRate = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const nextIndex = (rates.indexOf(playbackRateRef.current) + 1) % rates.length;
        const nextRate = rates[nextIndex];
        setPlaybackRate(nextRate);
        sendCommand('setPlaybackRate', [nextRate]);
    };

    const toggleFullScreen = (e) => {
        if (e) e.stopPropagation();
        if (!document.fullscreenElement) {
            playerContainerRef.current?.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            const key = e.key.toLowerCase();
            if (key === ' ' || key === 'k') {
                e.preventDefault();
                togglePlay();
            } else if (key === 'j' || key === 'arrowleft') {
                e.preventDefault();
                seek(-10);
            } else if (key === 'l' || key === 'arrowright') {
                e.preventDefault();
                seek(10);
            } else if (key === 'm') {
                e.preventDefault();
                toggleMute();
            } else if (key === 'f') {
                e.preventDefault();
                toggleFullScreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!lecture) return (
        <div className="aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white p-8">
            <MonitorPlay className="w-16 h-16 text-slate-700 mb-4" />
            <p className="text-slate-400 font-bold">Select a lecture to start watching</p>
        </div>
    );

    const videoId = lecture.videoIdentifier || "";
    const cleanVideoId = extractYouTubeId(videoId);

    if (!cleanVideoId) return (
        <div className="aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white p-8 overflow-hidden">
            <Video className="w-16 h-16 text-slate-700 mb-4" />
            <p className="text-slate-400 font-bold">No Video Available</p>
            <p className="text-slate-500 text-[11px] mt-1 max-w-xs text-center">The instructor hasn't provided a valid video URL for "{lecture.title}"</p>
        </div>
    );

    const embedUrl = `https://www.youtube-nocookie.com/embed/${cleanVideoId}?rel=0&modestbranding=1&enablejsapi=1&controls=0&iv_load_policy=3&fs=0&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`;

    return (
        <div
            ref={playerContainerRef}
            className={clsx(
                "relative group overflow-hidden shadow-2xl bg-black border border-white/5 transition-all duration-300",
                isFullScreen ? "rounded-0 w-screen h-screen" : "rounded-3xl"
            )}
            onClick={() => setShowControls(prev => !prev)}
        >
            <div className={clsx(
                "relative overflow-hidden",
                isFullScreen ? "h-screen w-screen" : "aspect-video"
            )}>
                <iframe
                    ref={iframeRef}
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    loading="lazy"
                    title={lecture.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="w-full h-full relative z-0"
                ></iframe>

                {/* Security Watermark */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-20 select-none">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] bg-black/20 px-3 py-1 rounded-lg backdrop-blur-md">
                        Secure Environment • {lecture?._id?.slice(-6)}
                    </p>
                </div>

                {/* Custom Control Bar */}
                <div className={clsx(
                    "absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-300 transform",
                    showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0"
                )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={(e) => seek(e, -10)}
                        className="p-2.5 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white rounded-xl transition-all active:scale-90"
                        title="Backward 10s"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={(e) => togglePlay(e)}
                        className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all active:scale-95"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>

                    <button
                        onClick={(e) => seek(e, 10)}
                        className="p-2.5 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white rounded-xl transition-all active:scale-90"
                        title="Forward 10s"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <button
                        onClick={(e) => togglePlaybackRate(e)}
                        className="px-3 py-2 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white rounded-xl transition-all text-[11px] font-black tracking-tighter min-w-[44px]"
                        title="Playback Speed"
                    >
                        {playbackRate}x
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <button
                        onClick={(e) => toggleMute(e)}
                        className="p-2.5 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white rounded-xl transition-all"
                    >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={(e) => toggleFullScreen(e)}
                        className="p-2.5 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white rounded-xl transition-all active:scale-90"
                        title="Fullscreen"
                    >
                        <Maximize className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Total Interaction Shield */}
            <div
                className="absolute inset-0 z-10 cursor-default select-none bg-transparent"
                onContextMenu={(e) => e.preventDefault()}
            />
        </div>
    );
};

export default VideoPlayer;
