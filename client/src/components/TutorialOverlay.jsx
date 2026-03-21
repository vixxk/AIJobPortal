import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

const TutorialOverlay = ({ isOpen, steps, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightRect, setHighlightRect] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const updateHighlight = useCallback(() => {
        if (!isOpen || !steps[currentStep]) return;
        
        // Find the visible target
        const targets = document.querySelectorAll(steps[currentStep].target);
        const target = Array.from(targets).find(t => {
            const rect = t.getBoundingClientRect();
            const style = window.getComputedStyle(t);
            return style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   rect.width > 0 && 
                   rect.height > 0;
        });

        if (target) {
            const rect = target.getBoundingClientRect();
            const padding = 12;
            
            // Scroll to target if not fully visible
            const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
            if (!isVisible) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // We need to wait for scroll to finish to get accurate coordinates
                setTimeout(() => {
                    const newRect = target.getBoundingClientRect();
                    setHighlightRect({
                        top: newRect.top - padding + window.scrollY, // Relative to document
                        left: newRect.left - padding + window.scrollX,
                        width: newRect.width + padding * 2,
                        height: newRect.height + padding * 2,
                        borderRadius: 24,
                    });
                }, 300); // Quicker scroll wait
            } else {
                setHighlightRect({
                    top: rect.top - padding + window.scrollY,
                    left: rect.left - padding + window.scrollX,
                    width: rect.width + padding * 2,
                    height: rect.height + padding * 2,
                    borderRadius: 24,
                });
            }
        }
    }, [isOpen, steps, currentStep]);

    useEffect(() => {
        if (isOpen) {
            updateHighlight();
            const handleUpdate = () => {
                requestAnimationFrame(updateHighlight);
            };
            window.addEventListener('resize', handleUpdate);
            window.addEventListener('scroll', handleUpdate);
            return () => {
                window.removeEventListener('resize', handleUpdate);
                window.removeEventListener('scroll', handleUpdate);
            };
        } else {
            setCurrentStep(0);
            setHighlightRect(null);
        }
    }, [isOpen, updateHighlight]);

    useEffect(() => {
        if (isOpen) {
            setIsTransitioning(true);
            const timer = setTimeout(() => setIsTransitioning(false), 300);
            return () => clearTimeout(timer);
        }
    }, [currentStep, isOpen]);

    if (!isOpen || !steps[currentStep]) return null;

    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onClose();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto pointer-events-none perspective-1000">
            {/* The SVG and overlay need to be absolute within a relative container that covers the whole document scroll height */}
            <div className="absolute inset-0 w-full h-[1000vh] pointer-events-auto">
                <svg className="sticky top-0 w-full h-screen">
                    <defs>
                        <mask id="tutorial-mask">
                            <rect width="100%" height="100%" fill="white" />
                            {highlightRect && (
                                <rect
                                    x={highlightRect.left - window.scrollX}
                                    y={highlightRect.top - window.scrollY}
                                    width={highlightRect.width}
                                    height={highlightRect.height}
                                    rx={highlightRect.borderRadius}
                                    fill="black"
                                    className="transition-all duration-300 ease-in-out"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.75)"
                        mask="url(#tutorial-mask)"
                        className="backdrop-blur-[4px] transition-all duration-300"
                    />
                </svg>
            </div>

            {/* Skip Button */}
            <button
                onClick={onClose}
                className={clsx(
                    "fixed pointer-events-auto flex items-center gap-2 font-bold transition-all active:scale-95 z-50",
                    isMobile 
                        ? "top-4 right-4 px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs rounded-xl"
                        : "top-6 right-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full shadow-xl shadow-blue-500/25"
                )}
            >
                {isMobile ? 'Skip' : 'Skip Tutorial'}
                <X className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
            </button>

            {/* Tooltip Content */}
            {highlightRect && (
                <div
                    className={clsx(
                        "fixed pointer-events-auto transition-all duration-300 ease-out z-[10000]",
                        isTransitioning ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100",
                        // Mobile vs Desktop width
                        isMobile ? "w-[calc(100%-32px)] left-4" : "md:w-[340px] md:absolute"
                    )}
                    style={(() => {
                        if (!isMobile) {
                            return {
                                top: Math.min(window.innerHeight - 300, Math.max(20, highlightRect.top - window.scrollY + highlightRect.height + 24)),
                                left: Math.max(20, Math.min(window.innerWidth - 380, highlightRect.left - window.scrollX + highlightRect.width / 2 - 170)),
                            };
                        }
                        
                        // Mobile smart positioning
                        const viewportTop = highlightRect.top - window.scrollY;
                        const viewportBottom = viewportTop + highlightRect.height;
                        const screenHeight = window.innerHeight;
                        
                        if (viewportTop > screenHeight / 2) {
                            // Target is in bottom half, show tooltip in top half
                            return { top: '80px' };
                        } else {
                            // Target is in top half, show tooltip in bottom half
                            return { bottom: '40px' };
                        }
                    })()}
                >
                    {/* Tooltip Arrow - only on desktop */}
                    <div 
                        className="hidden md:block absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-t border-l border-slate-100"
                        style={{
                            left: (highlightRect.left - window.scrollX) + highlightRect.width / 2 - Math.max(20, Math.min(window.innerWidth - 380, highlightRect.left - window.scrollX + highlightRect.width / 2 - 170))
                        }}
                    ></div>
                    
                    <div className={clsx(
                        "relative bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-100 overflow-hidden",
                        isMobile ? "p-5" : "p-8"
                    )}>
                        {/* Decorative background element */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-50 rounded-full blur-3xl opacity-40"></div>
                        {/* Progress indicator */}
                        <div className={clsx("flex justify-between items-center", isMobile ? "mb-2.5" : "mb-4")}>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                Step {currentStep + 1} of {steps.length}
                            </span>
                            <div className="flex gap-1">
                                {steps.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={clsx(
                                            "h-1 rounded-full transition-all duration-300",
                                            idx === currentStep ? "w-4 bg-blue-600" : "w-1 bg-slate-200"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <h3 className={clsx(
                            "font-black text-slate-900 leading-tight",
                            isMobile ? "text-lg mb-1.5" : "text-xl mb-2"
                        )}>
                            {currentStepData.title}
                        </h3>
                        <p className={clsx(
                            "text-slate-600 font-medium leading-relaxed",
                            isMobile ? "text-[13px] mb-4.5" : "text-sm mb-6"
                        )}>
                            {currentStepData.content}
                        </p>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className={clsx(
                                    "flex items-center gap-1 text-sm font-bold transition-colors",
                                    currentStep === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-95"
                            >
                                {isLastStep ? 'Finish' : 'Next'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorialOverlay;
