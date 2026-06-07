import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { 
    CreditCard, CheckCircle, XCircle, Clock, Search, Filter, 
    ArrowRight, User, BookOpen, ExternalLink, Calendar, RefreshCcw
} from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
    PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    FAILED: 'bg-rose-100 text-rose-700 border-rose-200',
    CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200'
};

const PLAN_ORDER = {
    FREE: 0,
    PRO: 1,
    PRO_PLUS: 2
};

const AdminPayments = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [configs, setConfigs] = useState([]);
    const [editingPrices, setEditingPrices] = useState({ INTERVIEW: 7, RESUME: 10, ENGLISH_TUTOR: 7 });
    const [updatingConfig, setUpdatingConfig] = useState(false);
    const [activeTab, setActiveTab] = useState('transactions');
    const [plans, setPlans] = useState([]);
    const [editingPlans, setEditingPlans] = useState({});

    const fetchOrders = useCallback(async () => {
        try {
            const res = await axios.get('/payment/orders');
            setOrders(res.data.data.orders || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchConfigs = useCallback(async () => {
        try {
            const res = await axios.get('/payment/pay-per-use-config');
            const data = res.data.data.configs || [];
            setConfigs(data);
            const prices = {};
            data.forEach(c => {
                prices[c.featureType] = c.price;
            });
            setEditingPrices(prev => ({ ...prev, ...prices }));
        } catch (err) {
            console.error('Failed to fetch pay-per-use config:', err);
        }
    }, []);

    const fetchPlans = useCallback(async () => {
        try {
            const res = await axios.get('/payment/plans');
            const plansData = res.data.data.plans || [];
            setPlans(plansData);
            const planEdits = {};
            plansData.forEach(p => {
                planEdits[p.planKey] = {
                    price: p.price,
                    spokenEnglishLimit: p.spokenEnglishLimit,
                    resumesLimit: p.resumesLimit,
                    interviewsLimit: p.interviewsLimit
                };
            });
            setEditingPlans(planEdits);
        } catch (err) {
            console.error('Failed to fetch subscription plans:', err);
        }
    }, []);

    const handleUpdatePrice = async (featureType) => {
        setUpdatingConfig(true);
        const price = Number(editingPrices[featureType]);
        if (isNaN(price) || price < 0) {
            toast.error('Please enter a valid price.');
            setUpdatingConfig(false);
            return;
        }
        const previousConfigs = [...configs];
        setConfigs(prev => prev.map(c => c.featureType === featureType ? { ...c, price } : c));
        toast.success(`Successfully updated ${featureType} price to ₹${price}!`);
        try {
            await axios.patch('/payment/pay-per-use-config', { featureType, price });
            await fetchConfigs();
        } catch (err) {
            setConfigs(previousConfigs);
            toast.error(err.response?.data?.message || 'Failed to update pricing.');
        } finally {
            setUpdatingConfig(false);
        }
    };

    const handleUpdatePlan = async (planKey) => {
        const payload = editingPlans[planKey] || {};
        
        const price = Number(payload.price);
        const spokenEnglishLimit = Number(payload.spokenEnglishLimit);
        const resumesLimit = Number(payload.resumesLimit);
        const interviewsLimit = Number(payload.interviewsLimit);

        if (isNaN(price) || price < 0) {
            toast.error('Monthly price cannot be negative.');
            return;
        }
        if (isNaN(interviewsLimit) || interviewsLimit < 0 || !Number.isInteger(interviewsLimit)) {
            toast.error('Mock Interviews quota must be a non-negative integer.');
            return;
        }
        if (isNaN(resumesLimit) || resumesLimit < 0 || !Number.isInteger(resumesLimit)) {
            toast.error('Resume quota must be a non-negative integer.');
            return;
        }
        if (isNaN(spokenEnglishLimit) || spokenEnglishLimit < 0 || !Number.isInteger(spokenEnglishLimit)) {
            toast.error('Spoken English quota must be a non-negative integer.');
            return;
        }

        const previousPlans = [...plans];
        setPlans(prev => prev.map(p => p.planKey === planKey ? { 
            ...p, 
            price,
            spokenEnglishLimit,
            resumesLimit,
            interviewsLimit
        } : p));
        toast.success(`Successfully updated ${planKey} plan configuration!`);
        try {
            await axios.patch('/payment/plans', {
                planKey,
                price,
                spokenEnglishLimit,
                resumesLimit,
                interviewsLimit
            });
            await fetchPlans();
        } catch (err) {
            setPlans(previousPlans);
            toast.error(err.response?.data?.message || 'Failed to update plan config.');
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchConfigs();
        fetchPlans();
    }, [fetchOrders, fetchConfigs, fetchPlans]);

    const filteredOrders = orders.filter(o => {
        const matchesSearch = 
            o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
            o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
            o.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
            o.orderType?.toLowerCase().includes(search.toLowerCase()) ||
            o.subscriptionPlanKey?.toLowerCase().includes(search.toLowerCase()) ||
            o.payPerUseType?.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalRevenue = orders
        .filter(o => o.status === 'PAID')
        .reduce((sum, o) => sum + (o.amount || 0), 0);    return (
        <div className="space-y-4 sm:space-y-8">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-full sm:w-fit border border-slate-200/50">
                {[
                    { id: 'transactions', label: 'Transaction History', icon: '📊' },
                    { id: 'subscriptions', label: 'Subscription Plans', icon: '💎' },
                    { id: 'payperuse', label: 'Pay-Per-Use Config', icon: '⚡' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50 scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        <span className="whitespace-nowrap">{tab.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'payperuse' && (
                <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[28px] border border-slate-100 shadow-sm animate-in fade-in duration-200">
                    <div className="mb-6">
                        <h3 className="text-base sm:text-lg font-black text-slate-900">Customize Pay-Per-Use Costings</h3>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1">Adjust transactional prices for single-use premium features instantly across the platform.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        {[
                            { key: 'INTERVIEW', label: 'AI Mock Interview', desc: 'Charged per custom interview start session.' },
                            { key: 'RESUME', label: 'Resume AI Rewrite/Download', desc: 'Charged per optimization download.' },
                            { key: 'ENGLISH_TUTOR', label: 'Spoken English Tutor', desc: 'Charged per speech evaluation session.' }
                        ].map(feat => (
                            <div key={feat.key} className="bg-slate-50/50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 flex flex-col justify-between">
                                <div>
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">{feat.key}</span>
                                    <h4 className="text-xs sm:text-sm font-black text-slate-800 mt-2.5 sm:mt-3">{feat.label}</h4>
                                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-1 mb-3 sm:mb-4 leading-normal">{feat.desc}</p>
                                </div>
                                <div className="flex gap-2 items-center mt-auto">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-black text-slate-400">₹</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={editingPrices[feat.key] || ''}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val !== '' && Number(val) < 0) return;
                                                setEditingPrices({ ...editingPrices, [feat.key]: val });
                                            }}
                                            className="w-full h-9 sm:h-11 pl-6 sm:pl-8 pr-2 sm:pr-3 bg-white border border-slate-200 focus:border-indigo-400 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleUpdatePrice(feat.key)}
                                        disabled={updatingConfig}
                                        className="h-9 sm:h-11 px-3 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg sm:rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'subscriptions' && (
                <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
                    <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[28px] border border-slate-100 shadow-sm">
                        <h3 className="text-base sm:text-lg font-black text-slate-900">Manage Subscription Tiers</h3>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1">Configure pricing packages, interview session limits, resume downloads, and speech evaluation quotas per tier.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                        {[...plans]
                            .sort((a, b) => (PLAN_ORDER[a.planKey] ?? 99) - (PLAN_ORDER[b.planKey] ?? 99))
                            .map(plan => {
                                const edits = editingPlans[plan.planKey] || {};
                                return (
                                    <div key={plan.planKey} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full" />
                                        <div>
                                            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                                                <span className="text-xl sm:text-2xl">
                                                    {plan.planKey === 'FREE' && '🌱'}
                                                    {plan.planKey === 'PRO' && '💎'}
                                                    {plan.planKey === 'PRO_PLUS' && '🔥'}
                                                </span>
                                                <div>
                                                    <h4 className="text-sm sm:text-base font-black text-slate-900">{plan.name}</h4>
                                                    <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-indigo-500 uppercase">{plan.planKey} TIER</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3 sm:space-y-4">
                                                <div>
                                                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1 sm:mb-1.5 font-bold">Monthly Price (₹)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-black text-slate-400">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={edits.price ?? 0}
                                                            disabled={plan.planKey === 'FREE'}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                if (val !== '' && Number(val) < 0) return;
                                                                setEditingPlans({
                                                                    ...editingPlans,
                                                                    [plan.planKey]: { ...edits, price: val }
                                                                });
                                                            }}
                                                            className="w-full h-9 sm:h-11 pl-7 sm:pl-8 pr-2 sm:pr-3 bg-slate-50/50 border border-slate-200 focus:border-indigo-400 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black outline-none transition-all disabled:opacity-60"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1 sm:mb-1.5 font-bold">
                                                        Mock Interviews Quota ({plan.planKey === 'FREE' ? 'Weekly' : 'Monthly'})
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={edits.interviewsLimit ?? 0}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            if (val !== '' && Number(val) < 0) return;
                                                            setEditingPlans({
                                                                ...editingPlans,
                                                                [plan.planKey]: { ...edits, interviewsLimit: val }
                                                            });
                                                        }}
                                                        className="w-full h-9 sm:h-11 px-3 sm:px-4 bg-slate-50/50 border border-slate-200 focus:border-indigo-400 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black outline-none transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1 sm:mb-1.5 font-bold">Resume AI Optimization Quota</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={edits.resumesLimit ?? 0}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            if (val !== '' && Number(val) < 0) return;
                                                            setEditingPlans({
                                                                ...editingPlans,
                                                                [plan.planKey]: { ...edits, resumesLimit: val }
                                                            });
                                                        }}
                                                        className="w-full h-9 sm:h-11 px-3 sm:px-4 bg-slate-50/50 border border-slate-200 focus:border-indigo-400 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black outline-none transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1 sm:mb-1.5 font-bold">Spoken English Evaluation Quota (Monthly)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={edits.spokenEnglishLimit ?? 0}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            if (val !== '' && Number(val) < 0) return;
                                                            setEditingPlans({
                                                                ...editingPlans,
                                                                [plan.planKey]: { ...edits, spokenEnglishLimit: val }
                                                            });
                                                        }}
                                                        className="w-full h-9 sm:h-11 px-3 sm:px-4 bg-slate-50/50 border border-slate-200 focus:border-indigo-400 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleUpdatePlan(plan.planKey)}
                                            className="w-full h-10 sm:h-12 mt-6 sm:mt-8 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg sm:rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white shadow-md hover:shadow-lg transition-all"
                                        >
                                            Save Plan Configuration
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <>
                    {/* Header Stats */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-6">
                        <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-[28px] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-5">
                            <div className="w-8 h-8 sm:w-14 sm:h-14 bg-indigo-50 rounded-lg sm:rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                                <CreditCard className="w-4 h-4 sm:w-7 sm:h-7" />
                            </div>
                            <div className="overflow-hidden w-full">
                                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider sm:tracking-widest truncate">Revenue</p>
                                <h3 className="text-xs sm:text-2xl font-black text-slate-900 mt-0.5 truncate">₹{totalRevenue.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-[28px] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-5">
                            <div className="w-8 h-8 sm:w-14 sm:h-14 bg-emerald-50 rounded-lg sm:rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                                <CheckCircle className="w-4 h-4 sm:w-7 sm:h-7" />
                            </div>
                            <div className="overflow-hidden w-full">
                                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider sm:tracking-widest truncate">Paid</p>
                                <h3 className="text-xs sm:text-2xl font-black text-slate-900 mt-0.5 truncate">{orders.filter(o => o.status === 'PAID').length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-[28px] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-5">
                            <div className="w-8 h-8 sm:w-14 sm:h-14 bg-amber-50 rounded-lg sm:rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                                <Clock className="w-4 h-4 sm:w-7 sm:h-7" />
                            </div>
                            <div className="overflow-hidden w-full">
                                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider sm:tracking-widest truncate">Pending</p>
                                <h3 className="text-xs sm:text-2xl font-black text-slate-900 mt-0.5 truncate">{orders.filter(o => o.status === 'PENDING').length}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search by Order ID, Student, or Course..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full h-10 sm:h-12 pl-10 sm:pl-11 pr-3 sm:pr-4 bg-slate-50 border border-transparent focus:border-indigo-400 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-1.5 sm:gap-2 w-full md:w-auto">
                            {['ALL', 'PAID', 'PENDING', 'FAILED'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={clsx(
                                        "flex-1 md:flex-initial px-3 sm:px-5 h-10 sm:h-12 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black tracking-wider sm:tracking-widest transition-all",
                                        statusFilter === s 
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                            <button 
                                onClick={() => { setLoading(true); fetchOrders(); }}
                                className="p-2.5 sm:p-3.5 bg-slate-100 text-slate-500 rounded-lg sm:rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shrink-0"
                                title="Refresh Data"
                            >
                                <RefreshCcw className={clsx("w-4 h-4 sm:w-5 sm:h-5", loading && "animate-spin")} />
                            </button>
                        </div>
                    </div>

                    {/* Orders List / Table */}
                    <div className="bg-white rounded-2xl sm:rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                        {/* Mobile List View */}
                        <div className="block sm:hidden divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="p-4 space-y-3">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                        <Skeleton className="h-8 w-full rounded-lg" />
                                        <div className="flex justify-between">
                                            <Skeleton className="h-3.5 w-20" />
                                            <Skeleton className="h-5.5 w-16 rounded-full" />
                                        </div>
                                    </div>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                                        <Search className="w-6 h-6 text-slate-200" />
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold">No orders found.</p>
                                </div>
                            ) : (
                                filteredOrders.map(order => (
                                    <div key={order._id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-black text-[9px] text-indigo-600">
                                                    {order.user?.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-900 leading-none">{order.user?.name}</p>
                                                    <p className="text-[9px] text-slate-400 mt-0.5 leading-none">{order.user?.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-black text-slate-900 font-mono">
                                                #{order.orderId}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center bg-slate-50/60 px-3 py-2 rounded-xl border border-slate-100/50">
                                            <span className="text-[10px] font-bold text-slate-600 truncate max-w-[200px]">
                                                {order.orderType === 'COURSE' && `Course: ${order.course?.title || 'Unknown'}`}
                                                {order.orderType === 'SUBSCRIPTION' && `${order.subscriptionPlanKey} Subscription`}
                                                {order.orderType === 'PAY_PER_USE' && (
                                                    order.payPerUseType === 'INTERVIEW' ? 'AI Mock Interview' :
                                                    order.payPerUseType === 'RESUME' ? 'Resume AI Rewrite' :
                                                    order.payPerUseType === 'ENGLISH_TUTOR' ? 'Spoken English Evaluation' :
                                                    'Single Use Credit'
                                                )}
                                            </span>
                                            <span className="text-[11px] font-black text-slate-900 shrink-0">₹{(order.amount || 0).toLocaleString()}</span>
                                        </div>

                                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3" />
                                                <span className="text-[9.5px] font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <span className={clsx(
                                                "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                                STATUS_COLORS[order.status] || STATUS_COLORS.PENDING
                                            )}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">Order ID</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">Student</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">Product / Item</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">Amount</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        [1, 2, 3, 4, 5].map(i => (
                                            <tr key={i}>
                                                <td className="px-8 py-5"><Skeleton className="h-4 w-32" /></td>
                                                <td className="px-8 py-5"><Skeleton className="h-4 w-40" /></td>
                                                <td className="px-8 py-5"><Skeleton className="h-4 w-48" /></td>
                                                <td className="px-8 py-5"><Skeleton className="h-4 w-20" /></td>
                                                <td className="px-8 py-5"><Skeleton className="h-6 w-24 rounded-full" /></td>
                                                <td className="px-8 py-5"><Skeleton className="h-4 w-24" /></td>
                                            </tr>
                                        ))
                                    ) : filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                                        <Search className="w-8 h-8 text-slate-200" />
                                                    </div>
                                                    <p className="text-slate-400 font-bold">No orders found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredOrders.map(order => (
                                        <tr key={order._id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <span className="text-[13px] font-black text-slate-900 font-mono tracking-tighter">
                                                    #{order.orderId}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] text-indigo-600 group-hover:bg-indigo-100">
                                                        {order.user?.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-black text-slate-900 leading-none">{order.user?.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1">{order.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="max-w-[240px] truncate">
                                                    {order.orderType === 'COURSE' && (
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-black text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded-md self-start text-[9px] uppercase tracking-wider mb-1">Course</span>
                                                            <span className="text-[13px] font-bold text-slate-700">{order.course?.title || 'Unknown Course'}</span>
                                                        </div>
                                                    )}
                                                    {order.orderType === 'SUBSCRIPTION' && (
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-black text-emerald-600 bg-emerald-50/60 px-2 py-0.5 rounded-md self-start text-[9px] uppercase tracking-wider mb-1">Subscription</span>
                                                            <span className="text-[13px] font-bold text-slate-700">{order.subscriptionPlanKey} Plan Upgrade</span>
                                                        </div>
                                                    )}
                                                    {order.orderType === 'PAY_PER_USE' && (
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-black text-amber-600 bg-amber-50/60 px-2 py-0.5 rounded-md self-start text-[9px] uppercase tracking-wider mb-1">Pay-Per-Use</span>
                                                            <span className="text-[13px] font-bold text-slate-700">
                                                                {order.payPerUseType === 'INTERVIEW' && 'AI Mock Interview'}
                                                                {order.payPerUseType === 'RESUME' && 'Resume AI Rewrite'}
                                                                {order.payPerUseType === 'ENGLISH_TUTOR' && 'Spoken English Evaluation'}
                                                                {!order.payPerUseType && 'Single Use Credit'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {!order.orderType && (
                                                        <span className="text-[13px] font-bold text-slate-700">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[13px] font-black text-slate-900">₹{(order.amount || 0).toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                    STATUS_COLORS[order.status] || STATUS_COLORS.PENDING
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="text-[11px] font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminPayments;
