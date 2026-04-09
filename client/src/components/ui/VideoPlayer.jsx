import { useState, useEffect, useRef, useCallback } from 'react';
import { MonitorPlay, Video, Loader2 } from 'lucide-react';
import axios from '../../utils/axios';
import clsx from 'clsx';

const BUNNY_LIBRARY_ID = import.meta.env.VITE_BUNNY_LIBRARY_ID || '';

/**
 * Build the Bunny Stream embed URL for a lecture
 * Uses bunnyVideoId → iframe.mediadelivery.net embed
 */
const getBunnyEmbedUrl = (videoId) => {
    if (!videoId || !BUNNY_LIBRARY_ID) return '';
    return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
};

const VideoPlayer = ({ lecture }) => {
    const playerContainerRef = useRef(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [liveStatus, setLiveStatus] = useState(lecture?.videoStatus || null);
    const [encodeProgress, setEncodeProgress] = useState(0);
    const pollRef = useRef(null);

    // Sync liveStatus when lecture prop changes
    useEffect(() => {
        setLiveStatus(lecture?.videoStatus || null);
    }, [lecture?.videoStatus, lecture?._id]);

    // Poll video status when PROCESSING or PENDING
    const pollStatus = useCallback(async () => {
        if (!lecture?._id || !lecture?.bunnyVideoId) return;
        try {
            const res = await axios.get(`/courses/lectures/${lecture._id}/video-status`);
            const data = res.data.data;
            setEncodeProgress(data.encodeProgress || 0);
            if (data.videoStatus === 'READY' || data.videoStatus === 'FAILED') {
                setLiveStatus(data.videoStatus);
                // Stop polling
                if (pollRef.current) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                }
            }
        } catch {
            // ignore errors
        }
    }, [lecture?._id, lecture?.bunnyVideoId]);

    useEffect(() => {
        if (liveStatus === 'PROCESSING' || (lecture?.bunnyVideoId && liveStatus === 'PENDING')) {
            // Poll immediately, then every 5 seconds
            pollStatus();
            pollRef.current = setInterval(pollStatus, 5000);
            return () => {
                if (pollRef.current) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                }
            };
        }
    }, [liveStatus, lecture?.bunnyVideoId, pollStatus]);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    if (!lecture) return (
        <div className="aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white p-8">
            <MonitorPlay className="w-16 h-16 text-slate-700 mb-4" />
            <p className="text-slate-400 font-bold">Select a lecture to start watching</p>
        </div>
    );

    const videoId = lecture.bunnyVideoId || '';
    const currentStatus = liveStatus || lecture.videoStatus;
    const embedUrl = getBunnyEmbedUrl(videoId);

    // Video is still processing
    if (videoId && (currentStatus === 'PROCESSING' || currentStatus === 'PENDING')) {
        return (
            <div className="aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white p-8 overflow-hidden">
                <Loader2 className="w-12 h-12 text-indigo-400 mb-4 animate-spin" />
                <p className="text-slate-300 font-bold text-sm">Video is being processed...</p>
                {encodeProgress > 0 && (
                    <div className="w-48 mt-3">
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${encodeProgress}%` }}
                            />
                        </div>
                        <p className="text-slate-500 text-[10px] mt-1.5 text-center font-bold">{encodeProgress}% encoded</p>
                    </div>
                )}
                <p className="text-slate-500 text-[11px] mt-2 max-w-xs text-center">
                    Checking status automatically...
                </p>
            </div>
        );
    }

    // Video upload failed
    if (videoId && currentStatus === 'FAILED') {
        return (
            <div className="aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white p-8 overflow-hidden">
                <Video className="w-16 h-16 text-rose-500/50 mb-4" />
                <p className="text-rose-400 font-bold text-sm">Video processing failed</p>
                <p className="text-slate-500 text-[11px] mt-1 max-w-xs text-center">
                    Please re-upload the video or contact support.
                </p>
            </div>
        );
    }

    // No video set yet
    if (!videoId || !embedUrl) return (
        <div className="aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white p-8 overflow-hidden">
            <Video className="w-16 h-16 text-slate-700 mb-4" />
            <p className="text-slate-400 font-bold">No Video Available</p>
            <p className="text-slate-500 text-[11px] mt-1 max-w-xs text-center">The instructor hasn't uploaded a video for "{lecture.title}"</p>
        </div>
    );

    return (
        <div
            ref={playerContainerRef}
            className={clsx(
                "relative group overflow-hidden shadow-2xl bg-black border border-white/5 transition-all duration-300",
                isFullScreen ? "rounded-0 w-screen h-screen" : "rounded-3xl"
            )}
        >
            <div className={clsx(
                "relative overflow-hidden",
                isFullScreen ? "h-screen w-screen" : "aspect-video"
            )}>
                <iframe
                    src={embedUrl}
                    loading="lazy"
                    title={lecture.title}
                    style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>

            {/* Security Watermark */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-20 select-none">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] bg-black/20 px-3 py-1 rounded-lg backdrop-blur-md">
                    Secure Environment • {lecture?._id?.slice(-6)}
                </p>
            </div>
        </div>
    );
};

export default VideoPlayer;
