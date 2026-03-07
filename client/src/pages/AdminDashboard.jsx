import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import {
    Shield, Users, Briefcase, Building2, CheckCircle, XCircle,
    AlertTriangle, Activity, Clock, RefreshCw, GraduationCap, UserX,
    BarChart3, TrendingUp
} from 'lucide-react';
const ROLE_CONFIG = {
    RECRUITER: { label: 'Recruiter', icon: Briefcase, color: 'violet', gradient: 'from-violet-500 to-purple-600' },
    COLLEGE_ADMIN: { label: 'College', icon: Building2, color: 'emerald', gradient: 'from-emerald-500 to-teal-600' }
};
const StatusBadge = ({ status }) => {
    const map = {
        PENDING: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
        APPROVED: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        REJECTED: { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-200' },
        NOT_REQUIRED: { label: 'N/A', cls: 'bg-slate-100 text-slate-500 border-slate-200' }
    };
    const s = map[status] || map.NOT_REQUIRED;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
            {s.label}
        </span>
    );
};
const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('pending'); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); 
    const [successMsg, setSuccessMsg] = useState('');
    useEffect(() => {
        fetchAdminData();
    }, []);
    const fetchAdminData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [analyticsRes, pendingRes] = await Promise.all([
                axios.get('/admin/analytics'),
                axios.get('/admin/users/pending')
            ]);
            if (analyticsRes.data.status === 'success') {
                setStats(analyticsRes.data.data.analytics);
            }
            if (pendingRes.data.status === 'success') {
                setPendingUsers(pendingRes.data.data.users);
            }
        } catch (err) {
            console.error('Admin data error', err);
            setError('Failed to load administrative data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };
    const fetchAllUsers = async () => {
        try {
            const res = await axios.get('/admin/users');
            if (res.data.status === 'success') {
                setAllUsers(res.data.data.users);
            }
        } catch (err) {
            console.error('Failed to load users', err);
        }
    };
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'all' && allUsers.length === 0) {
            fetchAllUsers();
        }
    };
    const handleApproval = async (userId, action) => {
        setActionLoading(userId);
        setSuccessMsg('');
        try {
            const res = await axios.patch(`/admin/users/${userId}/approval`, { action });
            if (res.data.status === 'success') {
                setSuccessMsg(action === 'approve' ? '✅ User approved successfully!' : '❌ User rejected.');
                fetchAdminData();
                if (activeTab === 'all') fetchAllUsers();
                setTimeout(() => setSuccessMsg(''), 4000);
            }
        } catch (err) {
            console.error('Failed to process approval', err);
            alert(err.response?.data?.message || 'Error processing approval');
        } finally {
            setActionLoading(null);
        }
    };
    const handleBan = async (userId) => {
        if (!confirm('Are you sure you want to ban this user?')) return;
        setActionLoading(userId);
        try {
            await axios.patch(`/admin/users/${userId}/ban`);
            setSuccessMsg('User banned successfully.');
            fetchAdminData();
            if (activeTab === 'all') fetchAllUsers();
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            alert('Failed to ban user');
        } finally {
            setActionLoading(null);
        }
    };
    if (loading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Loading admin data...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
                <AlertTriangle className="w-10 h-10 text-red-400" />
                <p className="text-red-500 font-medium">{error}</p>
                <button onClick={fetchAdminData} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
                    <RefreshCw className="w-4 h-4" /> Retry
                </button>
            </div>
        );
    }
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            {}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-indigo-700" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Super Admin</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Platform overview & user moderation</p>
                    </div>
                </div>
                <button onClick={fetchAdminData}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>
            {}
            {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm animate-in fade-in zoom-in duration-300">
                    {successMsg}
                </div>
            )}
            {}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'blue' },
                    { label: 'Live Jobs', value: stats?.totalJobs || 0, icon: Briefcase, color: 'emerald' },
                    { label: 'Applications', value: stats?.totalApplications || 0, icon: Activity, color: 'purple' },
                    { label: 'Mock Tests', value: stats?.totalMockTests || 0, icon: BarChart3, color: 'sky' },
                    { label: 'Pending Approvals', value: stats?.pendingApprovals || pendingUsers.length, icon: Clock, color: 'amber', highlight: true },
                ].map((card) => (
                    <div key={card.label}
                        className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col gap-3
                            ${card.highlight && (stats?.pendingApprovals || pendingUsers.length) > 0
                                ? 'border-amber-200 bg-amber-50/50'
                                : 'border-slate-200'}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${card.color}-50`}>
                            <card.icon className={`w-5 h-5 text-${card.color}-600`} />
                        </div>
                        <div>
                            <div className={`text-2xl font-bold ${card.highlight && (stats?.pendingApprovals || pendingUsers.length) > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                                {card.value}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>
            {}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => handleTabChange('pending')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                                ${activeTab === 'pending' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Pending Approvals
                            {pendingUsers.length > 0 && (
                                <span className="ml-2 bg-amber-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                                    {pendingUsers.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => handleTabChange('all')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                                ${activeTab === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            All Users
                        </button>
                    </div>
                </div>
                {}
                {activeTab === 'pending' && (
                    <>
                        {pendingUsers.length === 0 ? (
                            <div className="p-14 flex flex-col items-center gap-3">
                                <CheckCircle className="w-14 h-14 text-emerald-400" strokeWidth={1.5} />
                                <p className="text-lg font-semibold text-slate-800">Queue is Clear</p>
                                <p className="text-slate-500 text-sm">No pending approvals at this time.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
                                            <th className="p-4 pl-6 font-semibold">User</th>
                                            <th className="p-4 font-semibold">Role</th>
                                            <th className="p-4 font-semibold">Registered</th>
                                            <th className="p-4 pr-6 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingUsers.map(u => {
                                            const roleConf = ROLE_CONFIG[u.role] || {};
                                            const RoleIcon = roleConf.icon || Users;
                                            return (
                                                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 pl-6">
                                                        <div className="flex items-center gap-3">
                                                            {u.avatar ? (
                                                                <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                                                            ) : (
                                                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleConf.gradient || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white font-bold text-sm`}>
                                                                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                                                                <p className="text-xs text-slate-500">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${roleConf.gradient || 'from-slate-400 to-slate-500'} text-white text-xs font-semibold`}>
                                                            <RoleIcon className="w-3 h-3" />
                                                            {roleConf.label || u.role}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-slate-500">
                                                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="p-4 pr-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                disabled={actionLoading === u._id}
                                                                onClick={() => handleApproval(u._id, 'approve')}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                                            >
                                                                {actionLoading === u._id ? (
                                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                                )}
                                                                Approve
                                                            </button>
                                                            <button
                                                                disabled={actionLoading === u._id}
                                                                onClick={() => handleApproval(u._id, 'reject')}
                                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
                {}
                {activeTab === 'all' && (
                    <div className="overflow-x-auto">
                        {allUsers.length === 0 ? (
                            <div className="p-14 flex flex-col items-center gap-3">
                                <Users className="w-14 h-14 text-slate-300" strokeWidth={1.5} />
                                <p className="text-slate-500">Loading users...</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
                                        <th className="p-4 pl-6 font-semibold">User</th>
                                        <th className="p-4 font-semibold">Role</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Joined</th>
                                        <th className="p-4 pr-6 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {allUsers.map(u => {
                                        const roleConf = ROLE_CONFIG[u.role] || {};
                                        return (
                                            <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        {u.avatar ? (
                                                            <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                                                        ) : (
                                                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleConf.gradient || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white font-bold text-sm`}>
                                                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                                                            <p className="text-xs text-slate-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 font-medium">
                                                    {u.role ? (rC => (
                                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gradient-to-r ${rC.gradient || 'from-slate-400 to-slate-500'} text-white text-xs font-semibold`}>
                                                            {rC.label || u.role}
                                                        </div>
                                                    ))(ROLE_CONFIG[u.role] || {}) : (
                                                        <span className="text-xs text-slate-400 italic">No role</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <StatusBadge status={u.approvalStatus} />
                                                </td>
                                                <td className="p-4 text-sm text-slate-500">
                                                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="p-4 pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {u.approvalStatus === 'PENDING' && (
                                                            <button
                                                                disabled={actionLoading === u._id}
                                                                onClick={() => handleApproval(u._id, 'approve')}
                                                                className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        {u.isActive !== false && (
                                                            <button
                                                                disabled={actionLoading === u._id}
                                                                onClick={() => handleBan(u._id)}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Ban User"
                                                            >
                                                                <UserX className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {u.isActive === false && (
                                                            <span className="text-xs text-red-500 font-semibold">Banned</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default AdminDashboard;