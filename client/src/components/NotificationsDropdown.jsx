import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from '../utils/axios';
import { Bell, Check, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
const NotificationsDropdown = ({ className, iconClassName }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const panelRef = useRef(null);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
                setUnreadCount(res.data.data.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };
    useEffect(() => {
        const load = async () => {
            await fetchNotifications();
        };
        load();
        const interval = setInterval(fetchNotifications, 60000);
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // If the panel is portaled, it's not a child of dropdownRef
                if (panelRef.current && panelRef.current.contains(event.target)) return;
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const markAsRead = async (id) => {
        try {
            await axios.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
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
                        />
                    </div>
                )
            )}
        </div>
    );
};

// Extracted internal content to avoid duplication
const NotificationPanelBody = ({ notifications, unreadCount, markAsRead }) => (
    <>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">Notifications</h3>
            <div className="flex items-center gap-2">
                <span className="text-[11px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">{unreadCount} New</span>
            </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                    <Bell className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm">You have no new notifications.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {notifications.map(notification => (
                        <div
                            key={notification._id}
                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${!notification.isRead ? 'font-bold text-slate-900' : 'text-slate-700 font-medium'} line-clamp-2`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                        {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {!notification.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </>
);
export default NotificationsDropdown;
