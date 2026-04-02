import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { AlertCircle, CheckCircle, Clock, Trash2, User, Mail, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../../components/ui/Skeleton';

const AdminIssues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchIssues = async () => {
        try {
            const res = await axios.get('/issues');
            if (res.data.status === 'success') {
                setIssues(res.data.data.issues);
            }
        } catch (error) {
            console.error('Error fetching issues:', error);
            toast.error('Failed to load issues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const res = await axios.patch(`/issues/${id}`, { status });
            if (res.data.status === 'success') {
                toast.success(`Issue marked as ${status}`);
                setIssues(issues.map(iss => iss._id === id ? { ...iss, status } : iss));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return (
        <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-700">
            <div>
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-12 h-12 rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-20 rounded-full" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-10 w-32 rounded-xl" />
                                <Skeleton className="h-10 w-24 rounded-xl" />
                            </div>
                        </div>
                        <Skeleton className="h-24 w-full rounded-2xl mb-6" />
                        <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-100">
                            {[1, 2, 3].map(j => (
                                <div key={j} className="flex items-center gap-2">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-3 w-12" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Application Issues</h1>
                <p className="text-slate-500 font-medium mt-1">Manage and resolve issues reported by users.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {issues.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">All clear!</h3>
                        <p className="text-slate-500 mt-2">No application issues have been reported yet.</p>
                    </div>
                ) : (
                    issues.map((issue) => (
                        <div key={issue._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                            issue.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                            issue.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' :
                                            'bg-slate-50 text-slate-600'
                                        }`}>
                                            {issue.status === 'pending' ? <Clock className="w-6 h-6" /> :
                                             issue.status === 'resolved' ? <CheckCircle className="w-6 h-6" /> :
                                             <AlertCircle className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{issue.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                    issue.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    issue.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    'bg-slate-50 text-slate-700 border-slate-200'
                                                }`}>
                                                    {issue.status}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {issue.status === 'pending' && (
                                            <button 
                                                onClick={() => updateStatus(issue._id, 'resolved')}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                                            >
                                                Mark Resolved
                                            </button>
                                        )}
                                        {issue.status !== 'closed' && (
                                            <button 
                                                onClick={() => updateStatus(issue._id, 'closed')}
                                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                                            >
                                                Close
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{issue.description}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                            <User className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Reporter</p>
                                            <p className="text-xs font-bold text-slate-800">{issue.userId?.name || 'Unknown User'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Email</p>
                                            <p className="text-xs font-bold text-slate-800">{issue.userId?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                                            <MessageSquare className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Role</p>
                                            <p className="text-xs font-bold text-slate-800 capitalize">{issue.userId?.role || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminIssues;
