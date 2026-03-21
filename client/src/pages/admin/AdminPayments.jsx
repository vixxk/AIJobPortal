import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { 
    CreditCard, CheckCircle, XCircle, Clock, Search, Filter, 
    ArrowRight, User, BookOpen, ExternalLink, Calendar, RefreshCcw
} from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

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

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const filteredOrders = orders.filter(o => {
        const matchesSearch = 
            o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
            o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
            o.course?.title?.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalRevenue = orders
        .filter(o => o.status === 'PAID')
        .reduce((sum, o) => sum + (o.amount || 0), 0);

    return (
        <div className="space-y-8">
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
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 bg-slate-50/50 uppercase tracking-widest border-b border-slate-100">Course</th>
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
                                        <div className="max-w-[200px] truncate">
                                            <span className="text-[13px] font-bold text-slate-700">{order.course?.title}</span>
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
        </div>
    );
};

export default AdminPayments;
