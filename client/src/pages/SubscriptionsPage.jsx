import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscriptionStatus, createSubscriptionOrder, getPlans } from '../services/paymentApi';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Check, Zap, Crown, Mail, Loader2, BarChart2 } from 'lucide-react';

const SubscriptionsSkeleton = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12 animate-pulse font-sans">
            {/* Header section skeleton */}
            <div className="text-center max-w-3xl mx-auto space-y-4 flex flex-col items-center">
                <div className="h-6 w-48 bg-slate-200/80 rounded-full" />
                <div className="h-10 w-3/4 md:w-full bg-slate-200/80 rounded-xl mt-2" />
                <div className="h-10 w-1/2 bg-slate-200/80 rounded-xl" />
                <div className="h-4 w-5/6 bg-slate-100 rounded-md mt-4" />
                <div className="h-4 w-2/3 bg-slate-100 rounded-md" />
            </div>

            {/* Quota Usage card skeleton */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-200/80 shrink-0" />
                        <div className="space-y-2">
                            <div className="h-5 w-32 bg-slate-200/80 rounded-md" />
                            <div className="h-3.5 w-44 bg-slate-200/50 rounded-md" />
                        </div>
                    </div>
                    <div className="h-10 w-48 bg-slate-100 rounded-2xl" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-4 p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                            <div className="flex justify-between items-center">
                                <div className="h-4 w-24 bg-slate-200/80 rounded-md" />
                                <div className="h-5 w-12 bg-slate-200/80 rounded-md" />
                            </div>
                            <div className="w-full bg-slate-200/20 h-2 rounded-full" />
                            <div className="flex justify-between items-center">
                                <div className="h-3 w-16 bg-slate-200/50 rounded-md" />
                                <div className="h-3 w-20 bg-slate-200/50 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pricing cards grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
                {[1, 2, 3].map((i) => (
                    <div 
                        key={i} 
                        className="flex flex-col bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-md space-y-6 min-h-[450px]"
                    >
                        <div className="space-y-3 pb-6 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="h-7 w-24 bg-slate-200/80 rounded-md" />
                                <div className="w-11 h-11 rounded-2xl bg-slate-200/80 shrink-0" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <div className="h-10 w-20 bg-slate-200/80 rounded-md" />
                                <div className="h-4 w-12 bg-slate-200/50 rounded-md" />
                            </div>
                        </div>

                        <div className="flex-1 py-4 space-y-4">
                            {[1, 2, 3, 4, 5].map((itemIdx) => (
                                <div key={itemIdx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-slate-200/50 shrink-0" />
                                    <div className="h-4 w-4/5 bg-slate-100 rounded-md" />
                                </div>
                            ))}
                        </div>

                        <div className="h-12 w-full bg-slate-200/80 rounded-2xl" />
                    </div>
                ))}
            </div>
        </div>
    );
};

const SubscriptionsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(null);
    const [statusData, setStatusData] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    useEffect(() => {
        if (user) {
            fetchStatus();
        } else {
            setLoadingStatus(false);
        }
        fetchPlansList();
    }, [user]);

    const fetchStatus = async () => {
        try {
            const res = await getSubscriptionStatus();
            if (res.status === 'success') {
                setStatusData(res.data);
            }
        } catch (err) {
            console.error('Error fetching subscription status:', err);
        } finally {
            setLoadingStatus(false);
        }
    };

    const fetchPlansList = async () => {
        try {
            const res = await getPlans();
            if (res.status === 'success') {
                setPlans(res.data.plans);
            }
        } catch (err) {
            console.error('Error fetching plans:', err);
            // Fallback default plans
            setPlans([
                {
                    planKey: 'FREE',
                    name: 'Free',
                    price: 0,
                    offerings: [
                        '30 Spoken English Sessions/month',
                        '1 Resume Download/month',
                        '1 Mock Interview/week',
                        'Job Application Tracking',
                        'Basic Profile Builder',
                        'Basic AI feedback'
                    ]
                },
                {
                    planKey: 'PRO',
                    name: 'Pro',
                    price: 99,
                    offerings: [
                        '100 Spoken English Sessions/month',
                        '10 Resume Downloads/month',
                        '30 Mock Interviews/month',
                        'Advanced Job Search Agent',
                        'Verified Profile Badge',
                        'Advanced AI feedback',
                        'Priority Support'
                    ]
                },
                {
                    planKey: 'PRO_PLUS',
                    name: 'Pro Plus',
                    price: 149,
                    offerings: [
                        '150 Spoken English Sessions/month',
                        '20 Resume Downloads/month',
                        '50 Mock Interviews/month',
                        'Premium Placement Pool',
                        'Direct Recruiter Messaging',
                        'Premium AI tutor',
                        'Dedicated support'
                    ]
                }
            ]);
        } finally {
            setLoadingPlans(false);
        }
    };

    const handleSubscribe = async (planKey) => {
        if (planKey === 'FREE') return;
        setCheckoutLoading(planKey);
        try {
            const res = await createSubscriptionOrder(planKey);
            if (res.status === 'success' && res.data.payment_session_id) {
                // Initialize Cashfree
                const isProd = res.data.payment_session_id.includes('prod') || import.meta.env.MODE === 'production';
                const cashfree = window.Cashfree({
                    mode: isProd ? 'production' : 'sandbox'
                });
                
                cashfree.checkout({
                    paymentSessionId: res.data.payment_session_id,
                    redirectTarget: '_self'
                });
            } else {
                alert('Failed to initiate subscription payment. Please try again.');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            alert(err.response?.data?.message || 'Error redirecting to checkout.');
        } finally {
            setCheckoutLoading(null);
        }
    };

    if (loadingStatus || loadingPlans) {
        return <SubscriptionsSkeleton />;
    }

    const currentPlan = statusData?.subscription?.plan || 'FREE';
    const usage = statusData?.usageLimits;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12 custom-scrollbar">
            {/* Header section */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black tracking-wider uppercase shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    Subscription Control Center
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    Power Up Your Career with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Advanced AI Tools</span>
                </h1>
                <p className="text-slate-500 text-sm md:text-base font-semibold leading-relaxed">
                    Choose the plan that fits your career preparation needs. Upgrade anytime, or use pay-per-use options.
                </p>
            </div>

            {/* Guest mode banner */}
            {!user && (
                <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight flex items-center gap-1.5 justify-center sm:justify-start">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            Guest Mode
                        </h4>
                        <p className="text-xs text-slate-500 font-bold">
                            You are browsing our subscription tiers. Log in to upgrade your limits and unlock AI tools.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/10 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
                    >
                        Log In Now
                    </button>
                </div>
            )}

            {/* User Current Quotas Meter Card */}
            {usage && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-6 md:p-8 space-y-6 transition-all hover:shadow-indigo-900/5 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <BarChart2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 leading-none">Your Quota Usage</h2>
                                    <p className="text-xs text-slate-400 font-bold mt-1">
                                        Active Plan: <span className="text-indigo-600 uppercase font-black">{currentPlan}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                            <div className="text-xs font-bold text-slate-500 pl-2">
                                Next Reset: <span className="text-slate-950 font-black">{new Date(usage.lastResetDate).toLocaleDateString()}</span>
                            </div>
                            <a 
                                href="mailto:sampletestingwork@gmail.com" 
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition-all text-xs font-bold shadow-sm"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                Support
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Spoken English */}
                        <div className="space-y-3 p-5 bg-gradient-to-br from-slate-50 to-blue-50/20 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg hover:shadow-blue-500/5 duration-300">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-600 flex items-center gap-1.5">🗣️ English Tutor</span>
                                <span className="text-slate-900 font-black bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">{usage.spokenEnglish.used} / {usage.spokenEnglish.limit}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (usage.spokenEnglish.used / usage.spokenEnglish.limit) * 100)}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                                <span>Refreshed Monthly</span>
                                <span className="text-indigo-600">₹{statusData?.payPerUsePrices?.englishTutor || 7}/session next</span>
                            </div>
                        </div>

                        {/* Resume Downloads */}
                        <div className="space-y-3 p-5 bg-gradient-to-br from-slate-50 to-indigo-50/20 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-500/5 duration-300">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-600 flex items-center gap-1.5">📄 Resume Downloads</span>
                                <span className="text-slate-900 font-black bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">{usage.resumes.used} / {usage.resumes.limit}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (usage.resumes.used / usage.resumes.limit) * 100)}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                                <span>Refreshed Monthly</span>
                                <span className="text-violet-600">₹{statusData?.payPerUsePrices?.resume || 10}/download next</span>
                            </div>
                        </div>

                        {/* Mock Interviews */}
                        <div className="space-y-3 p-5 bg-gradient-to-br from-slate-50 to-emerald-50/20 rounded-[2rem] border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-lg hover:shadow-emerald-500/5 duration-300">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-600 flex items-center gap-1.5">🤖 Mock Interviews</span>
                                <span className="text-slate-900 font-black bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">{usage.interviews.used} / {usage.interviews.limit}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (usage.interviews.used / usage.interviews.limit) * 100)}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px]">
                                    {currentPlan === 'FREE' ? `${usage.interviews.limit} Interview${usage.interviews.limit > 1 ? 's' : ''}/week` : 'No weekly limit'}
                                </span>
                                <span className="text-emerald-600">₹{statusData?.payPerUsePrices?.interview || 7}/interview next</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
                {plans.map((p) => {
                    const isFree = p.planKey === 'FREE';
                    const isProPlus = p.planKey === 'PRO_PLUS';
                    const isActive = currentPlan === p.planKey;
                    
                    return (
                        <div 
                            key={p.planKey} 
                            className={`flex flex-col bg-white rounded-[2.5rem] p-6 md:p-8 border transition-all duration-300 relative ${
                                isActive 
                                ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10 md:scale-[1.02] ring-2 ring-emerald-500/20' 
                                : isProPlus 
                                ? 'border-blue-500 shadow-2xl shadow-blue-500/10 md:scale-105 hover:border-blue-600' 
                                : 'border-slate-150 shadow-lg shadow-slate-100/60 hover:border-slate-300'
                            }`}
                        >
                            {isProPlus && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                                    Most Popular
                                </div>
                            )}

                            {isActive && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                                    Active Plan
                                </div>
                            )}

                            {/* Plan icon & header */}
                            <div className="space-y-3 pb-6 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-slate-900">{p.name}</h3>
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                                        isFree 
                                        ? 'bg-slate-100 text-slate-600' 
                                        : isProPlus 
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                    }`}>
                                        {isFree ? <Zap className="w-5 h-5" /> : isProPlus ? <Crown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-slate-900">₹{p.price}</span>
                                    <span className="text-slate-400 font-bold text-sm">/month</span>
                                </div>
                            </div>

                            {/* Features offerings */}
                            <ul className="flex-1 py-6 space-y-4">
                                {p.offerings.map((offering, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                            isActive 
                                            ? 'bg-emerald-50 text-emerald-600' 
                                            : isProPlus 
                                            ? 'bg-blue-50 text-blue-600' 
                                            : 'bg-slate-50 text-slate-600'
                                        }`}>
                                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-600">{offering}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Subscribe button */}
                            <div className="pt-6">
                                {isFree ? (
                                    <button 
                                        disabled 
                                        className="w-full py-4 text-xs font-black text-slate-400 bg-slate-100 rounded-2xl uppercase tracking-widest cursor-not-allowed"
                                    >
                                        {isActive ? 'Current Plan' : 'Free Default'}
                                    </button>
                                ) : !user ? (
                                    <div className="space-y-3">
                                        <button 
                                            disabled 
                                            className="w-full py-4 text-xs font-black text-slate-400 bg-slate-100 rounded-2xl uppercase tracking-widest cursor-not-allowed"
                                        >
                                            Buy Disabled
                                        </button>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full py-3.5 text-xs font-black rounded-2xl uppercase tracking-widest transition-all bg-indigo-600 hover:bg-indigo-750 text-white hover:shadow-lg text-center flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
                                        >
                                            Login to Buy
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleSubscribe(p.planKey)}
                                        disabled={checkoutLoading !== null || isActive}
                                        className={`w-full py-4 text-xs font-black rounded-2xl uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                                            isActive 
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed shadow-none' 
                                            : isProPlus 
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200 hover:shadow-lg hover:shadow-blue-500/10' 
                                            : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg'
                                        }`}
                                    >
                                        {checkoutLoading === p.planKey ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : isActive ? (
                                            'Active'
                                        ) : (
                                            'Upgrade Plan'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Customer support section */}
            <div className="text-center py-8 text-xs text-blue-500 font-bold">
                Have questions or need team customizations? Contact support at{' '}
                <a href="mailto:sampletestingwork@gmail.com" className="text-blue-600 hover:text-blue-800 transition-colors underline">
                    sampletestingwork@gmail.com
                </a>
            </div>
        </div>
    );
};

export default SubscriptionsPage;
