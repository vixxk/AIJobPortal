import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { Mail, Ban, Trash2, GraduationCap, XCircle } from 'lucide-react';
import clsx from 'clsx';
import Skeleton from '../../components/ui/Skeleton';

const ROLE_CONFIG = {
    STUDENT: { label: 'Student', color: 'blue', text: 'text-blue-600', bg: 'bg-blue-50' },
    RECRUITER: { label: 'Recruiter', color: 'violet', text: 'text-violet-600', bg: 'bg-violet-50' },
    TEACHER: { label: 'Teacher', color: 'amber', text: 'text-amber-600', bg: 'bg-amber-50' },
    COLLEGE_ADMIN: { label: 'College', color: 'emerald', text: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const AdminUsers = ({ role }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [teacherForm, setTeacherForm] = useState({ show: false, name: '', email: '', password: '', avatar: null, preview: null });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = role ? `/admin/users?role=${role}` : '/admin/users';
            const res = await axios.get(endpoint);
            setUsers(res.data.data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUserAction = async (userId, action) => {
        // Optimistic Update
        const previousUsers = [...users];
        
        try {
            if (action === 'approve') {
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, approvalStatus: 'APPROVED' } : u));
                await axios.patch(`/admin/users/${userId}/approval`, { action: 'approve' });
            }
            else if (action === 'reject') {
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, approvalStatus: 'REJECTED' } : u));
                await axios.patch(`/admin/users/${userId}/approval`, { action: 'reject' });
            }
            else if (action === 'ban') {
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
                await axios.patch(`/admin/users/${userId}/ban`);
            }
            else if (action === 'delete') {
                if (!confirm('Delete this user forever?')) return;
                setUsers(prev => prev.filter(u => u._id !== userId));
                await axios.delete(`/admin/users/${userId}`);
            }
        } catch (err) {
            console.error(err);
            setUsers(previousUsers); // Rollback
            alert(err.response?.data?.message || 'Server sync failed. Rolling back changes.');
        }
    };

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', teacherForm.name);
            formData.append('email', teacherForm.email);
            formData.append('password', teacherForm.password);
            if (teacherForm.avatar) {
                formData.append('image', teacherForm.avatar);
            }

            await axios.post('/admin/teachers', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setTeacherForm({ show: false, name: '', email: '', password: '', avatar: null, preview: null });
            fetchUsers();
            alert('Teacher account created!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create teacher');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTeacherForm({
                ...teacherForm,
                avatar: file,
                preview: URL.createObjectURL(file)
            });
        }
    };

    const TableSkeleton = () => (
        <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-0">
            <div className="bg-white rounded-[24px] lg:rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-6 lg:p-8 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-11 w-32 rounded-xl" />
                </div>
                <div className="p-4 border-b border-slate-100">
                    <Skeleton className="h-10 w-full max-w-md rounded-xl" />
                </div>
                <div className="p-6 space-y-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex items-center justify-between gap-4">
                            <div className="flex gap-4 items-center flex-1">
                                <Skeleton className="w-12 h-12 rounded-2xl" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <Skeleton className="h-7 w-20 rounded-lg" />
                            </div>
                            <Skeleton className="h-7 w-16 rounded-full" />
                            <div className="flex gap-2">
                                <Skeleton className="w-9 h-9 rounded-lg" />
                                <Skeleton className="w-9 h-9 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (loading && users.length === 0) return <TableSkeleton />;

    return (
        <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                {role ? `${role} MANAGEMENT` : 'USER MANAGEMENT'}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Showing {users.length} registered {role?.toLowerCase() || 'user'}s
                            </p>
                        </div>
                    </div>
                    {role === 'TEACHER' && (
                        <button
                            onClick={() => setTeacherForm({ ...teacherForm, show: true })}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <GraduationCap className="w-4 h-4" /> ADD TEACHER
                        </button>
                    )}
                </div>

                <div className="p-4 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <input
                            type="text"
                            placeholder={`Search ${role?.toLowerCase() || 'user'}s...`}
                            className="w-full h-10 pl-10 pr-4 bg-slate-100/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User Identity</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center hidden md:table-cell">{role === 'TEACHER' ? 'Role' : 'Verification'}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-indigo-600 border border-slate-200 overflow-hidden shrink-0">
                                                {u.avatar ? (
                                                    <img src={getImageUrl(u.avatar)} alt={u.name} className="w-full h-full object-cover" />
                                                ) : u.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900 text-sm truncate">{u.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center hidden md:table-cell">
                                        {role === 'TEACHER' ? (
                                            <span className={clsx(
                                                "inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                                                ROLE_CONFIG[u.role]?.text || "text-slate-500 border-slate-200 bg-slate-50",
                                                ROLE_CONFIG[u.role]?.bg || "bg-slate-50"
                                            )}>
                                                {u.role}
                                            </span>
                                        ) : (
                                            <span className={clsx(
                                                "inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                                                !u.isActive || u.approvalStatus === 'REJECTED' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                                    u.approvalStatus === 'APPROVED' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                        "bg-amber-50 text-amber-700 border-amber-100"
                                            )}>
                                                {!u.isActive ? 'REJECTED' : (u.approvalStatus || 'PENDING')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={clsx(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tight",
                                                u.isActive ? "text-emerald-600 border-emerald-100 bg-emerald-50" : "text-rose-600 border-rose-100 bg-rose-50"
                                            )}>
                                                <span className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", u.isActive ? "bg-emerald-500" : "bg-rose-500")} />
                                                {u.isActive ? 'Active' : 'Locked'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {u.approvalStatus === 'PENDING' && (
                                                <button
                                                    onClick={() => handleUserAction(u._id, 'approve')}
                                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors shadow-sm uppercase tracking-wider"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleUserAction(u._id, 'ban')}
                                                className={clsx(
                                                    "p-2 rounded-lg transition-all border",
                                                    u.isActive ? "text-amber-600 border-amber-100 hover:bg-amber-50" : "text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                                                )}
                                                title={u.isActive ? 'Suspend' : 'Unsuspend'}
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleUserAction(u._id, 'delete')}
                                                className="p-2 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-50 transition-all"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {teacherForm.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setTeacherForm({ ...teacherForm, show: false })} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors">
                            <XCircle className="w-6 h-6" />
                        </button>
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Add New Teacher</h3>
                            <p className="text-slate-500 text-xs font-medium">Create a new instructor account with full access.</p>
                        </div>

                        <form onSubmit={handleCreateTeacher} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="e.g. John Doe"
                                    value={teacherForm.name}
                                    onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="teacher@institution.com"
                                    value={teacherForm.email}
                                    onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Secure Password</label>
                                <input
                                    type="password"
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    value={teacherForm.password}
                                    onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Profile Photo</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                        {teacherForm.preview ? (
                                            <img src={teacherForm.preview} className="w-full h-full object-cover" />
                                        ) : (
                                            <GraduationCap className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <label className="flex-1 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Choose File</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] mt-4">
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
