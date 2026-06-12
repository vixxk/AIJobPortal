import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { Bell, Check, Trash2, X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
const NotificationsDropdown = ({ className, iconClassName }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toastMessage, setToastMessage] = useState('');
    
    const showToastMsg = (msg) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage('');
        }, 4000);
    };
    const dropdownRef = useRef(null);
    const panelRef = useRef(null);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const getBaseUrl = () => {
        let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        if (url.startsWith('/')) {
            url = window.location.origin + url;
        }
        return url;
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const baseUrl = getBaseUrl();
        const eventSource = new EventSource(`${baseUrl}/notifications/stream?token=${token}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const fetchedNotifications = data.notifications || [];
                setNotifications(fetchedNotifications);
                setUnreadCount(data.unreadCount || 0);
            } catch (err) {
                console.error('Failed to parse notifications SSE message:', err);
            }
        };

        eventSource.onerror = (err) => {
            console.error('Notifications SSE Connection Error:', err);
        };

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                if (panelRef.current && panelRef.current.contains(event.target)) return;
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            eventSource.close();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const markAsRead = async (id) => {
        try {
            await axios.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };
    const markAllAsRead = async () => {
        try {
            await axios.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read', error);
        }
    };
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "relative flex items-center justify-center transition-all",
                    className || "p-2 text-slate-500 hover:bg-slate-100 rounded-full"
                )}
            >
                <Bell className={clsx("w-5 h-5", iconClassName)} />
                {unreadCount > 0 && (
                    <div className="absolute top-[2px] right-[2px] w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full z-10"></div>
                )}
            </button>
            { }
            {isOpen && (
                isMobile ? (
                    createPortal(
                        <div className="fixed inset-0 z-[1000]">
                            {/* Background Overlay */}
                            <div 
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
                                onClick={() => setIsOpen(false)}
                            />
                            {/* Panel */}
                            <div 
                                ref={panelRef}
                                className={clsx(
                                    "absolute bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 transform origin-top",
                                    "left-4 right-4 top-20 w-auto"
                                )}
                            >
                                <NotificationPanelBody 
                                    notifications={notifications} 
                                    unreadCount={unreadCount} 
                                    markAsRead={markAsRead} 
                                    markAllAsRead={markAllAsRead}
                                    navigate={navigate}
                                    showToastMsg={showToastMsg}
                                />
                            </div>
                        </div>,
                        document.body
                     )
                ) : (
                    <div 
                        ref={panelRef}
                        className={clsx(
                            "absolute bg-white rounded-[32px] shadow-2xl border border-slate-200 z-[110] overflow-hidden transition-all duration-300",
                            "right-0 w-96 top-full mt-3"
                        )}
                    >
                        <NotificationPanelBody 
                            notifications={notifications} 
                            unreadCount={unreadCount} 
                            markAsRead={markAsRead} 
                            markAllAsRead={markAllAsRead}
                            navigate={navigate}
                            showToastMsg={showToastMsg}
                        />
                    </div>
                )
            )}
            {toastMessage && (
                <div className="fixed top-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-slate-950/95 backdrop-blur-md border border-slate-800 text-white px-4 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 z-[99999] transition-all duration-300">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-200 truncate">{toastMessage}</span>
                    </div>
                    <button 
                        onClick={() => setToastMessage('')} 
                        className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors shrink-0"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};

// Extracted internal content to avoid duplication
const NotificationPanelBody = ({ notifications, unreadCount, markAsRead, markAllAsRead, navigate, showToastMsg }) => (
    <>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex flex-col">
                <h3 className="font-bold text-slate-900 text-lg tracking-tight">Recent Activity</h3>
                <span className="text-[11px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest w-fit mt-1">{unreadCount} New</span>
            </div>
            {unreadCount > 0 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm active:scale-95"
                >
                    <Check className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                </button>
            )}
        </div>
        <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">All caught up!</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {notifications.map(notification => (
                        <div
                            key={notification._id}
                            onClick={async () => {
                                if (!notification.read) {
                                    markAsRead(notification._id);
                                }
                                if (notification.link) {
                                    if (notification.link.includes('live=true')) {
                                        const match = notification.link.match(/\/course\/([a-f\d]{24})/i);
                                        if (match) {
                                            const courseId = match[1];
                                            try {
                                                const res = await axios.get(`/courses/${courseId}`);
                                                const liveLink = res.data.data.course?.liveClassLink;
                                                if (!liveLink) {
                                                    showToastMsg("This live class session has ended.");
                                                    return;
                                                }
                                            } catch (err) {
                                                console.error("Failed to verify live class status", err);
                                            }
                                        }
                                    }
                                    
                                    if (notification.link.startsWith('http://') || notification.link.startsWith('https://')) {
                                        window.open(notification.link, '_blank');
                                    } else {
                                        navigate(notification.link);
                                    }
                                }
                            }}
                            className={clsx(
                                "p-4 hover:bg-slate-50 transition-all cursor-pointer group flex gap-4",
                                !notification.read ? 'bg-indigo-50/40' : 'opacity-80'
                            )}
                        >
                            <div className={clsx(
                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
                                !notification.read ? "bg-white border-indigo-100 shadow-sm" : "bg-slate-50 border-slate-100"
                            )}>
                               <Bell className={clsx("w-5 h-5", !notification.read ? "text-indigo-600" : "text-slate-400")} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <h4 className={clsx("text-[11px] font-black uppercase tracking-wider", !notification.read ? "text-indigo-600" : "text-slate-400")}>
                                        {notification.title || "UPDATE"}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap ml-2">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className={clsx("text-[13px] leading-relaxed", !notification.read ? 'font-bold text-slate-900' : 'text-slate-500 font-medium')}>
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </>
);
export default NotificationsDropdown;
