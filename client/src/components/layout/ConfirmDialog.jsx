import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const ConfirmModal = ({ title, message, resolve }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleClose = (value) => {
        setIsOpen(false);
        setTimeout(() => {
            resolve(value);
        }, 200); // Wait for exit animation
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') handleClose(false);
            if (e.key === 'Enter') handleClose(true);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => handleClose(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ type: 'spring', duration: 0.4 }}
                        className="relative w-full max-w-sm bg-white rounded-2xl border border-slate-100 p-6 shadow-2xl z-10 text-center flex flex-col items-center"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">
                            {title}
                        </h3>
                        
                        <p className="text-slate-500 text-sm font-semibold mb-6 leading-relaxed">
                            {message}
                        </p>
                        
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => handleClose(false)}
                                className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleClose(true)}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const customConfirm = (message, title = 'Are you sure?') => {
    return new Promise((resolve) => {
        const mountNode = document.createElement('div');
        mountNode.setAttribute('id', 'custom-confirm-root');
        document.body.appendChild(mountNode);
        
        const root = createRoot(mountNode);
        
        const cleanup = (value) => {
            root.unmount();
            mountNode.remove();
            resolve(value);
        };
        
        root.render(<ConfirmModal title={title} message={message} resolve={cleanup} />);
    });
};
