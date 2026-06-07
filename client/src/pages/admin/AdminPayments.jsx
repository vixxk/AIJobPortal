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
        const payload = editingPlans[planKey];
        const previousPlans = [...plans];
        setPlans(prev => prev.map(p => p.planKey === planKey ? { 
            ...p, 
            price: Number(payload.price),
            spokenEnglishLimit: Number(payload.spokenEnglishLimit),
            resumesLimit: Number(payload.resumesLimit),
            interviewsLimit: Number(payload.interviewsLimit)
        } : p));
        toast.success(`Successfully updated ${planKey} plan configuration!`);
        try {
            await axios.patch('/payment/plans', {
                planKey,
                price: Number(payload.price),
                spokenEnglishLimit: Number(payload.spokenEnglishLimit),
                resumesLimit: Number(payload.resumesLimit),
                interviewsLimit: Number(payload.interviewsLimit)
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
        .reduce((sum, o) => sum + (o.amount || 0), 0);

    return (
        <div className="space-y-8">
            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit border border-slate-200/50">
                {[
                    { id: 'transactions', label: 'Transaction History', icon: '📊' },
                    { id: 'subscriptions', label: 'Subscription Plans', icon: '💎' },
                    { id: 'payperuse', label: 'Pay-Per-Use Config', icon: '⚡' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50 scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'payperuse' && (
                <div className="bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm animate-in fade-in duration-200">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-900">Customize Pay-Per-Use Costings</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">Adjust transactional prices for single-use premium features instantly across the platform.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { key: 'INTERVIEW', label: 'AI Mock Interview', desc: 'Charged per custom interview start session.' },
                            { key: 'RESUME', label: 'Resume AI Rewrite/Download', desc: 'Charged per optimization download.' },
                            { key: 'ENGLISH_TUTOR', label: 'Spoken English Tutor', desc: 'Charged per speech evaluation session.' }
                        ].map(feat => (
                            <div key={feat.key} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">{feat.key}</span>
                                    <h4 className="text-sm font-black text-slate-800 mt-3">{feat.label}</h4>
                                    <p className="text-[11px] font-bold text-slate-400 mt-1 mb-4 leading-normal">{feat.desc}</p>
                                </div>
                                <div className="flex gap-2 items-center mt-auto">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={editingPrices[feat.key] || ''}
                                            onChange={e => setEditingPrices({ ...editingPrices, [feat.key]: e.target.value })}
                                            className="w-full h-11 pl-8 pr-3 bg-white border border-slate-200 focus:border-indigo-400 rounded-xl text-sm font-black outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleUpdatePrice(feat.key)}
                                        disabled={updatingConfig}
                                        className="h-11 px-4 text-xs font-black uppercase tracking-wider rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-50"
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
                <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900">Manage Subscription Tiers</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">Configure pricing packages, interview session limits, resume downloads, and speech evaluation quotas per tier.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {plans.map(plan => {
                            const edits = editingPlans[plan.planKey] || {};
                            return (
                                <div key={plan.planKey} className="bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full" />
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-2xl">
                                                {plan.planKey === 'FREE' && '🌱'}
                                                {plan.planKey === 'PRO' && '💎'}
                                                {plan.planKey === 'PRO_PLUS' && '🔥'}
                                            </span>
                                            <div>
                                                <h4 className="text-base font-black text-slate-900">{plan.name}</h4>
                                                <span className="text-[10px] font-black tracking-wider text-indigo-500 uppercase">{plan.planKey} TIER</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">Monthly Price (₹)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
                                                    <input
                                                        type="number"
                                                        value={edits.price || 0}
                                                        disabled={plan.planKey === 'FREE'}
                                                        onChange={e => setEditingPlans({
                                                            ...editingPlans,
                                                            [plan.planKey]: { ...edits, price: e.target.value }
                                                        })}
                                                        className="w-full h-11 pl-8 pr-3 bg-slate-50/50 border border-slate-200 focus:border-indigo-400 rounded-xl text-sm font-black outline-none transition-all disabled:opacity-60"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                                                    Mock Interviews Quota ({plan.planKey === 'FREE' ? 'Weekly' : 'Monthly'})
                                                </label>
                                                <input
                                                    type="number"
                                                    value={edits.interviewsLimit || 0}
                                                    onChange={e => setEditingPlans({
                                                        ...editingPlans,
                                                        [plan.planKey]: { ...edits, interviewsLimit: e.target.value }
                                                    })}
                                                    className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 focus:border-indigo-400 rounded-xl text-sm font-black outline-none transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">Resume AI Optimization Quota</label>
                                                <input
                                                    type="number"
                                                    value={edits.resumesLimit || 0}
                                                    onChange={e => setEditingPlans({
                                                        ...editingPlans,
                                                        [plan.planKey]: { ...edits, resumesLimit: e.target.value }
                                                    })}
                                                    className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 focus:border-indigo-400 rounded-xl text-sm font-black outline-none transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">Spoken English Evaluation Quota (Monthly)</label>
                                                <input
                                                    type="number"
                                                    value={edits.spokenEnglishLimit || 0}
                                                    onChange={e => setEditingPlans({
                                                        ...editingPlans,
                                                        [plan.planKey]: { ...edits, spokenEnglishLimit: e.target.value }
                                                    })}
                                                    className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 focus:border-indigo-400 rounded-xl text-sm font-black outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleUpdatePlan(plan.planKey)}
                                        className="w-full h-12 mt-8 text-xs font-black uppercase tracking-wider rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <CreditCard className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
                        <h3 className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <CheckCircle className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Successful</p>
                        <h3 className="text-2xl font-black text-slate-900">{orders.filter(o => o.status === 'PAID').length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <Clock className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
                        <h3 className="text-2xl font-black text-slate-900">{orders.filter(o => o.status === 'PENDING').length}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by Order ID, Student, or Course..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-transparent focus:border-indigo-400 rounded-xl text-sm font-medium outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'PAID', 'PENDING', 'FAILED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={clsx(
                                "px-5 h-12 rounded-xl text-xs font-black tracking-widest transition-all",
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
                        className="p-3.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        title="Refresh Data"
                    >
                        <RefreshCcw className={clsx("w-5 h-5", loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
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
