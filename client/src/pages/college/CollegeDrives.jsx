import React, { useState } from 'react';
import { Calendar, Plus, Users, ArrowRight, X } from 'lucide-react';

const CollegeDrives = () => {
    const [drives, setDrives] = useState([
        { id: 1, company: 'Google', date: '2026-04-10', status: 'Upcoming', roles: ['Software Engineer', 'Product Manager'] },
        { id: 2, company: 'Microsoft', date: '2026-03-25', status: 'Ongoing', roles: ['Cloud Solutions Architect'] },
    ]);
    const [showModal, setShowModal] = useState(false);
    
    // Minimal mock component for adding a drive
    const handleCreate = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        setDrives([...drives, { 
            id: Date.now(), 
            company: fd.get('company'), 
            date: fd.get('date'), 
            status: 'Upcoming', 
            roles: [fd.get('role')] 
        }]);
        setShowModal(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Placement Drives</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Announce campus drives and share schedules.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)} 
                    className="h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" /> Post Drive
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drives.map(drive => (
                    <div key={drive.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 hover:border-indigo-200 transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl">
                                    {drive.company[0]}
                                </div>
                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                                    drive.status === 'Ongoing' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                    {drive.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1">{drive.company}</h3>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-wider">
                                <Calendar className="w-3 h-3" /> {new Date(drive.date).toLocaleDateString()}
                            </div>
                            
                            <div className="space-y-2 mb-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roles Hiring For</p>
                                <div className="flex flex-wrap gap-2">
                                    {drive.roles.map((role, idx) => (
                                        <span key={idx} className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-[10px] font-bold">
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100">
                            <button className="w-full h-10 bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-colors">
                                View Details <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">Announce New Drive</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
                                <input required name="company" type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" placeholder="e.g. Amazon" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Drive Date</label>
                                <input required name="date" type="date" className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none  text-sm uppercase tracking-wider font-bold text-slate-600" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Role</label>
                                <input required name="role" type="text" className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" placeholder="e.g. SDE-1" />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button type="submit" className="w-full px-6 h-12 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 transition">
                                    Publish Drive
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollegeDrives;
