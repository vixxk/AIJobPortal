import { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { Mail, Ban, Trash2, GraduationCap, XCircle } from 'lucide-react';
import clsx from 'clsx';

const ROLE_CONFIG = {
    STUDENT: { label: 'Student', color: 'blue', text: 'text-blue-600', bg: 'bg-blue-50' },
    RECRUITER: { label: 'Recruiter', color: 'violet', text: 'text-violet-600', bg: 'bg-violet-50' },
    TEACHER: { label: 'Teacher', color: 'amber', text: 'text-amber-600', bg: 'bg-amber-50' },
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
        try {
            if (action === 'approve') await axios.patch(`/admin/users/${userId}/approval`, { action: 'approve' });
            else if (action === 'reject') await axios.patch(`/admin/users/${userId}/approval`, { action: 'reject' });
            else if (action === 'ban') await axios.patch(`/admin/users/${userId}/ban`);
            else if (action === 'delete') {
                if (!confirm('Delete this user forever?')) return;
                await axios.delete(`/admin/users/${userId}`);
            }
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
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

    if (loading) return null;

    return (
        <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[32px] lg:rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-indigo-600 rounded-full" />
                        <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm">
                            {role ? `${role} Registry` : 'All Users Registry'}
                        </h3>
                    </div>
                    {role === 'TEACHER' && (
                        <button
                            onClick={() => setTeacherForm({ ...teacherForm, show: true })}
                            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                        >
                            <GraduationCap className="w-4 h-4" /> CREATE TEACHER
                        </button>
                    )}
                </div>

                <div className="p-4 lg:p-6 border-b border-slate-50 flex items-center">
                    <input
                        type="text"
                        placeholder={`Filter by name...`}
                        className="w-full max-w-sm h-11 px-4 bg-slate-100 border-none rounded-xl text-[10px] lg:text-xs font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-600"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-wider lg:tracking-[0.2em]">
                            <tr>
                                <th className="p-4 lg:p-8">IDENTITY</th>
                                <th className="p-4 lg:p-8 text-center hidden sm:table-cell">{role === 'TEACHER' ? 'PRIVILEGE' : 'VERIFICATION'}</th>
                                <th className="p-4 lg:p-8 text-center">STATUS</th>
                                <th className="p-4 lg:p-8 text-right">OPS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                                <tr key={u._id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 lg:p-8">
                                        <div className="flex items-center gap-3 lg:gap-4">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-[14px] lg:rounded-[18px] bg-slate-100 flex items-center justify-center font-black text-indigo-600 border border-white shadow-sm text-sm lg:text-lg overflow-hidden shrink-0">
                                                {u.avatar ? (
                                                    <img src={getImageUrl(u.avatar)} alt={u.name} className="w-full h-full object-cover" />
                                                ) : u.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-slate-900 text-[11px] lg:text-sm mb-0.5 truncate uppercase">{u.name}</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1 text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[120px] lg:max-w-none"><Mail className="w-3 h-3 shrink-0" /> {u.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 lg:p-8 text-center hidden sm:table-cell">
                                        {role === 'TEACHER' ? (
                                            <span className={clsx(
                                                "px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase border whitespace-nowrap",
                                                ROLE_CONFIG[u.role]?.text || "text-slate-400 border-slate-100 bg-slate-50",
                                                ROLE_CONFIG[u.role]?.bg || "bg-slate-50"
                                            )}>
                                                {u.role}
                                            </span>
                                        ) : (
                                            <span className={clsx(
                                                "px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase border whitespace-nowrap",
                                                u.approvalStatus === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    u.approvalStatus === 'REJECTED' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                        "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {u.approvalStatus || 'PENDING'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 lg:p-8">
                                        <div className="flex justify-center">
                                            <span className={clsx(
                                                "flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 bg-white rounded-full border text-[8px] lg:text-[10px] font-black tracking-wider uppercase whitespace-nowrap",
                                                u.isActive ? "text-emerald-500 border-emerald-100" : "text-rose-500 border-rose-100"
                                            )}>
                                                <div className={clsx("w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full", u.isActive ? "bg-emerald-500" : "bg-rose-500")} />
                                                {u.isActive ? (window.innerWidth < 640 ? 'ON' : 'Active') : (window.innerWidth < 640 ? 'OFF' : 'Locked')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 lg:p-8">
                                        <div className="flex justify-end gap-1.5 lg:gap-3 opacity-100 lg:translate-x-4 lg:opacity-0 group-hover:opacity-100 lg:group-hover:translate-x-0 transition-all">
                                            {u.approvalStatus === 'PENDING' && (
                                                <button
                                                    onClick={() => handleUserAction(u._id, 'approve')}
                                                    className="px-2 lg:px-4 py-1.5 lg:py-2 bg-indigo-600 text-white rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black hover:scale-105 transition-all shadow-lg shadow-indigo-200 uppercase"
                                                >
                                                    OK
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleUserAction(u._id, 'ban')}
                                                className={clsx(
                                                    "p-2 lg:p-2.5 rounded-lg lg:rounded-xl transition-all",
                                                    u.isActive ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                )}
                                                title={u.isActive ? 'Suspend' : 'Unsuspend'}
                                            >
                                                <Ban className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleUserAction(u._id, 'delete')}
                                                className="p-2 lg:p-2.5 bg-rose-50 text-rose-600 rounded-lg lg:rounded-xl hover:bg-rose-100 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
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
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] lg:rounded-[40px] p-8 lg:p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setTeacherForm({ ...teacherForm, show: false })} className="absolute top-6 right-6 lg:top-8 lg:right-8 text-slate-400 hover:text-slate-900 transition-colors">
                            <XCircle className="w-6 h-6 lg:w-8 lg:h-8" />
                        </button>
                        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter mb-1 lg:mb-2 uppercase">CREATE ACCOUNT</h3>
                        <p className="text-slate-400 text-[9px] lg:text-xs font-bold mb-6 lg:mb-10 tracking-widest uppercase italic">Initialize Instructor Node</p>

                        <form onSubmit={handleCreateTeacher} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
                                <input
                                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Enter full name..."
                                    value={teacherForm.name}
                                    onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comm Endpoint (Email)</label>
                                <input
                                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Enter institutional email..."
                                    value={teacherForm.email}
                                    onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Protocol (Password)</label>
                                <input
                                    type="password"
                                    className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Initialize access key..."
                                    value={teacherForm.password}
                                    onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile Manifest (Image)</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[24px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                        {teacherForm.preview ? (
                                            <img src={teacherForm.preview} className="w-full h-full object-cover" />
                                        ) : (
                                            <GraduationCap className="w-8 h-8 text-slate-200" />
                                        )}
                                    </div>
                                    <label className="flex-1 h-14 bg-indigo-50 border-2 border-dashed border-indigo-100 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-indigo-100/50 transition-all">
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Select Image File</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                            </div>
                            <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 ring-4 ring-white hover:bg-indigo-700 transition-all active:scale-95">AUTHORIZE NODE</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
