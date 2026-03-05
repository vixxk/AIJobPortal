import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Smile, Paperclip, Camera, Mic, Send, Square } from 'lucide-react';

const emojis = ['😀', '😂', '🥰', '😎', '🤔', '🙌', '👍', '🙏', '🔥', '✨'];

const CustomerService = () => {
    const navigate = useNavigate();
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const [inputValue, setInputValue] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const [messages, setMessages] = useState([
        { id: 1, text: "Hello, good morning.", isCustomerService: true, time: "09:41" },
        { id: 2, text: "I am a Customer Service, is there anything I can help you with? 😁", isCustomerService: true, time: "09:41" },
        { id: 3, text: "Hi, I'm having problems with my applications.", isCustomerService: false, time: "09:41" },
        { id: 4, text: "Can you help me?", isCustomerService: false, time: "09:41" },
        { id: 5, text: "Of course...", isCustomerService: true, time: "09:41" },
        { id: 6, text: "Can you tell me the problem you are having? so I can help solve it 😁", isCustomerService: true, time: "09:41" }
    ]);

    const scrollToBottom = () => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (text) => {
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        setMessages(prev => [...prev, {
            id: Date.now(),
            text: text,
            isCustomerService: false,
            time: timeString
        }]);

        // Simulate auto-reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "We have received your message. Please hold on.",
                isCustomerService: true,
                time: timeString
            }]);
        }, 1500);
    }

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;
        addMessage(inputValue);
        setInputValue("");
        setShowEmojiPicker(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            addMessage(`📎 Attachment: ${file.name}`);
        }
    };

    const handleCameraChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            addMessage(`📷 Photo: ${file.name}`);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            addMessage(`🎤 Voice message (0:05)`);
        } else {
            setIsRecording(true);
        }
    };

    const handleEmojiClick = (emoji) => {
        setInputValue(prev => prev + emoji);
    };

    return (
        <div className="bg-[#F8F9FA] h-[100dvh] overflow-hidden text-slate-800 flex flex-col md:p-6 lg:p-8">
            <div className="max-w-[1000px] w-full mx-auto md:bg-white md:rounded-[36px] md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border md:border-slate-100 flex flex-col overflow-hidden relative h-full">

                {/* Header Area */}
                <div className="bg-white px-5 md:px-8 pt-safe md:pt-8 pb-0 flex flex-col z-10 md:rounded-t-[36px] relative shrink-0 shadow-sm">
                    <div className="flex items-center justify-between py-4 md:py-2 pb-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate(-1)} className="hover:bg-slate-100 p-1 rounded-full md:hidden">
                                <ArrowLeft className="w-6 h-6 text-slate-800" />
                            </button>
                            <h1 className="text-[22px] md:text-3xl font-bold tracking-tight text-slate-900">
                                Customer Service
                            </h1>
                        </div>
                        <div className="flex items-center gap-4 text-slate-600">
                            <button className="hover:bg-slate-100 p-2 rounded-full transition-colors hidden md:block">
                                <Phone className="w-5 h-5 text-slate-700" />
                            </button>
                            <button className="md:hidden">
                                <Phone className="w-[22px] h-[22px] text-slate-700" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden bg-white md:bg-slate-50/50 flex flex-col">
                    <div className="flex justify-center mb-6 mt-4 md:mt-6 shrink-0">
                        <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">Today</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 px-2 md:px-6 hide-scrollbar pb-4">
                        {messages.map((msg, idx) => {
                            const showMarginTop = idx > 0 && messages[idx - 1].isCustomerService !== msg.isCustomerService;

                            if (msg.isCustomerService) {
                                return (
                                    <div key={msg.id} className={`flex ${showMarginTop ? 'mt-4' : ''}`}>
                                        <div className="bg-slate-100 rounded-3xl rounded-tl-sm p-4 text-slate-800 text-[15px] max-w-[85%] md:max-w-[70%] relative shadow-sm pb-7">
                                            {msg.text}
                                            <span className="absolute bottom-2.5 right-4 text-[11px] text-slate-400 font-medium">{msg.time}</span>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={msg.id} className={`flex justify-end ${showMarginTop ? 'mt-4' : ''}`}>
                                        <div className="bg-[#2D68FE] rounded-3xl rounded-tr-sm p-4 text-white text-[15px] max-w-[85%] md:max-w-[70%] relative shadow-md pb-7">
                                            {msg.text}
                                            <div className="absolute bottom-2.5 right-4 flex items-center gap-1">
                                                <span className="text-[11px] text-blue-100 font-medium">{msg.time}</span>
                                                <span className="text-blue-100 text-[10px]">✓✓</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="bg-white border-t border-slate-100 px-4 md:px-8 py-3 md:py-4 pb-[100px] md:pb-6 flex items-center gap-2 md:gap-3 shrink-0">
                        <div className="flex-1 bg-slate-50/50 rounded-full flex items-center px-4 py-3 min-h-[52px] border border-slate-100 relative">
                            {/* Emoji Picker Popover */}
                            {showEmojiPicker && (
                                <div className="absolute bottom-[65px] left-0 bg-white border border-slate-100 shadow-lg rounded-2xl p-3 flex gap-2 flex-wrap w-[220px] z-50">
                                    {emojis.map((em, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleEmojiClick(em)}
                                            className="text-xl hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                                        >
                                            {em}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`transition-colors mr-3 shrink-0 ${showEmojiPicker ? 'text-[#2D68FE]' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Smile className="w-6 h-6" strokeWidth={1.5} />
                            </button>
                            <input
                                type="text"
                                placeholder={isRecording ? "Recording audio..." : "Type a message ..."}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isRecording}
                                className="bg-transparent border-none outline-none text-[15px] w-full text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
                            />
                            <div className="flex gap-4 ml-2 shrink-0 items-center">
                                {/* Hidden Inputs */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    ref={cameraInputRef}
                                    className="hidden"
                                    onChange={handleCameraChange}
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <Paperclip className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <Camera className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={inputValue.trim() ? handleSendMessage : toggleRecording}
                            className={`w-[50px] h-[50px] rounded-full flex items-center justify-center text-white shrink-0 active:scale-95 transition-all
                                ${isRecording ? 'bg-red-500 shadow-[0_8px_16px_-4px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-[#2D68FE] shadow-[0_8px_16px_-4px_rgba(45,104,254,0.4)]'}`}
                        >
                            {inputValue.trim() ? (
                                <Send className="w-[22px] h-[22px] -ml-1 mt-0.5" strokeWidth={2.5} />
                            ) : isRecording ? (
                                <Square className="w-5 h-5 fill-white" strokeWidth={2.5} />
                            ) : (
                                <Mic className="w-6 h-6" strokeWidth={2.5} />
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CustomerService;
