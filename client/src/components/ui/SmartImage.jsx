import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

const SmartImage = ({ src, alt, className, containerClassName = "", fallbackIcon: Icon = ImageIcon }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`relative overflow-hidden bg-slate-50 ${containerClassName}`}>
            {/* Skeleton / Placeholder */}
            <AnimatePresence>
                {!loaded && !error && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse z-10"
                        style={{
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s infinite linear',
                        }}
                    />
                )}
            </AnimatePresence>
            
            {/* Error or No Src fallback */}
            {(error || !src) ? (
                <div className={`w-full h-full flex items-center justify-center bg-slate-50 ${className}`}>
                    <Icon className="w-1/3 h-1/3 text-slate-200" />
                </div>
            ) : (
                <motion.img
                    src={src}
                    alt={alt}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ 
                        opacity: loaded ? 1 : 0,
                        scale: loaded ? 1 : 1.05
                    }}
                    transition={{ 
                        opacity: { duration: 0.4, ease: "easeOut" },
                        scale: { duration: 0.6, ease: "easeOut" }
                    }}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className={`w-full h-full object-cover ${className}`}
                />
            )}

            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
};

export default SmartImage;
