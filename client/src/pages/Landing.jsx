import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import splashImg from '../assets/splash.png';
import landing1Img from '../assets/landing_1.png';
import landing2Img from '../assets/landing_2.png';
import landing3Img from '../assets/landing_3.png';
import { useAuth } from '../context/AuthContext';
const Landing = () => {
    const [step, setStep] = useState(0);
    const navigate = useNavigate();
    const { user } = useAuth();
    useEffect(() => {
        if (user && step === 3) {
            navigate('/app');
        }
    }, [user, step, navigate]);
    useEffect(() => {
        if (step === 0) {
            const timer = setTimeout(() => {
                setStep(1);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                setStep(prev => (prev === 3 ? 1 : prev + 1));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [step]);
    const handleGetStarted = () => {
        navigate(user ? '/app' : '/login');
    };
    const onboardingData = [
        {
            title: "We are the best job\nportal platform",
            subtitle: "Discover opportunities that match your skills. Your next big career move is just a tap away.",
            image: landing1Img
        },
        {
            title: "The place where\nwork finds you",
            subtitle: "Create a standout profile and let top employers come to you. We do the heavy lifting for you.",
            image: landing2Img
        },
        {
            title: "Let's start your\ncareer with us now!",
            subtitle: "Join a community of professionals and take the first step towards a brighter future today.",
            image: landing3Img
        }
    ];
    const activeIndex = step === 0 ? 0 : step - 1;
    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col font-sans">
            <div className="md:hidden w-full h-[100dvh]">
                {step === 0 ? (
                    <div
                        className="w-full h-full relative cursor-pointer overflow-hidden shadow-2xl bg-[#030712] mx-auto max-w-md"
                        onClick={() => setStep(1)}
                    >
                        <img
                            src={splashImg}
                            alt="Splash Background"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60" />
                        <div className="relative z-10 w-full h-full flex flex-col justify-end pb-24 px-8 animate-fade-in">
                            <h1 className="text-white text-[42px] font-[800] mb-3 leading-[1.1] tracking-tight">
                                Welcome to<br />Jobee! <span className="inline-block text-[38px] ml-1">👋</span>
                            </h1>
                            <p className="text-[#F1F5F9] text-[15px] max-w-[280px] leading-[1.6] font-medium tracking-wide">
                                The best job finder & job portal app where the best jobs will find you.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full bg-white flex flex-col relative overflow-hidden shadow-xl mx-auto max-w-md">
                        <div className="flex-1 relative flex items-center justify-center bg-white overflow-hidden pb-4">
                            <div
                                className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                            >
                                {onboardingData.map((data, index) => (
                                    <div key={index} className="w-full h-full flex items-center justify-center flex-shrink-0">
                                        <img
                                            src={data.image}
                                            alt={`Onboarding ${index + 1}`}
                                            className="w-[90%] max-w-[340px] h-full object-contain relative z-10 translate-y-6 mx-auto scale-110"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-t-[40px] pt-12 pb-12 flex flex-col items-center text-center z-20 shadow-[0_-15px_40px_-5px_rgba(0,0,0,0.06)] flex-none relative w-full overflow-hidden">
                            <div
                                className="flex w-full transition-transform duration-500 ease-in-out mb-10 items-start"
                                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                            >
                                {onboardingData.map((data, index) => (
                                    <div key={index} className="w-full flex-shrink-0 px-8 flex flex-col items-center">
                                        <h2 className="text-[30px] font-[800] text-[#3B82F6] mb-5 leading-[1.25] whitespace-pre-line px-2 tracking-tight">
                                            {data.title}
                                        </h2>
                                        <p className="text-[#64748B] text-[15px] leading-[1.65] whitespace-pre-line px-3 font-medium max-w-[310px]">
                                            {data.subtitle}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2.5 mb-10 items-center justify-center">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className={`rounded-full transition-all duration-300 ${activeIndex === i ? 'w-8 h-[8px] bg-[#3B82F6]' : 'w-[8px] h-[8px] bg-[#E2E8F0]'
                                            }`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handleGetStarted}
                                className="w-full max-w-[340px] bg-[#3B82F6] text-white font-[700] py-[18px] rounded-full text-[17px] hover:bg-[#2563EB] transition-colors active:scale-95 shadow-[0_8px_20px_rgba(59,130,246,0.3)] tracking-wide"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="hidden md:flex flex-row w-full min-h-screen bg-white">
                <div className="w-[55%] lg:w-3/5 bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-[10%] left-[10%] w-6 h-6 rounded-full bg-[#3B82F6] opacity-10" />
                    <div className="absolute bottom-[20%] left-[20%] w-12 h-12 rounded-full bg-[#3B82F6] opacity-10" />
                    <div className="absolute top-[30%] right-[15%] w-8 h-8 rounded-full bg-[#3B82F6] opacity-10" />
                    <div
                        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                    >
                        {onboardingData.map((data, index) => (
                            <div key={index} className="w-full h-full flex flex-col items-center justify-center flex-shrink-0 p-12">
                                <img
                                    src={data.image}
                                    alt={`Onboarding ${index + 1}`}
                                    className="w-[85%] max-w-[700px] object-contain drop-shadow-2xl"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-16 flex gap-3 z-20">
                        {onboardingData.map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-full transition-all duration-300 ${activeIndex === i ? 'w-12 h-2.5 bg-[#3B82F6]' : 'w-2.5 h-2.5 bg-[#CBD5E1] hover:bg-[#94A3B8] cursor-pointer'
                                    }`}
                                onClick={() => setStep(i + 1)}
                            />
                        ))}
                    </div>
                </div>
                { }
                <div className="w-[45%] lg:w-2/5 flex flex-col items-start justify-center p-16 lg:p-24 bg-white z-10 shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.03)] border-l border-slate-100">
                    <div className="mb-16 w-full max-w-[340px] text-center">
                        <h1 className="text-[#3B82F6] font-[900] text-5xl lg:text-6xl tracking-tight flex items-center justify-center">
                            Jobee <span className="text-[40px] ml-3 mt-1">👋</span>
                        </h1>
                        <p className="text-slate-400 font-medium mt-3 text-lg">The ultimate job finder platform.</p>
                    </div>
                    <div className="relative w-full overflow-hidden h-[240px]">
                        <div
                            className="absolute top-0 left-0 flex w-full transition-transform duration-700 ease-in-out"
                            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                        >
                            {onboardingData.map((data, index) => (
                                <div key={index} className="w-full flex-shrink-0 flex flex-col items-start">
                                    <h2 className="text-[38px] lg:text-[46px] font-[800] text-gray-900 mb-6 leading-[1.15] tracking-tight whitespace-pre-line">
                                        {data.title.replace('\n', ' ')}
                                    </h2>
                                    <p className="text-[#64748B] text-lg lg:text-xl leading-[1.6] max-w-md font-medium">
                                        {data.subtitle}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleGetStarted}
                        className="mt-6 bg-[#3B82F6] text-white font-[700] py-4 px-12 rounded-full text-[19px] hover:bg-[#2563EB] transition-colors active:scale-95 shadow-[0_8px_25px_rgba(59,130,246,0.35)] tracking-wide w-full max-w-[340px]"
                    >
                        Get Started Now
                    </button>
                    <p className="mt-5 text-slate-400 text-sm font-medium w-full max-w-[340px] text-center">
                        Already have an account?{' '}
                        <span onClick={handleGetStarted} className="text-[#3B82F6] font-bold cursor-pointer hover:underline">Sign In</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Landing;
