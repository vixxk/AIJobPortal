import React, { useState, useRef } from 'react';
const AudioRecorder = ({ onRecordingComplete, onStartRecording }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (onRecordingComplete) {
                    onRecordingComplete(audioBlob);
                }
            };
            mediaRecorder.start();
            setIsRecording(true);
            if (onStartRecording) onStartRecording();
        } catch (error) {
            console.error('Error accessing microphone', error);
            alert('Microphone access is required to record audio.');
        }
    };
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };
    return (
        <div className="flex flex-col items-center gap-4 mt-6">
            {!isRecording ? (
                <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg transition-all"
                >
                    🎤 Start Recording Answer
                </button>
            ) : (
                <button
                    onClick={stopRecording}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-full font-bold shadow-lg animate-pulse"
                >
                    ⏹️ Stop Recording
                </button>
            )}
            {isRecording && <p className="text-sm text-red-500 font-semibold animate-pulse">Recording...</p>}
        </div>
    );
};
export default AudioRecorder;
