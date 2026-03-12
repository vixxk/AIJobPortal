import React from 'react';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const CollegeOverview = () => {
    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">College Dashboard</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Manage drives, placements, and companies effortlessly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Students</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-0.5">2,500+</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Placed</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-0.5">85%</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Recruiters</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-0.5">142</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Upcoming Drives</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-0.5">4</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/app/college/drives" className="p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl flex flex-col items-center justify-center text-center group transition-colors">
                            <CalendarIcon className="w-8 h-8 text-indigo-400 group-hover:text-indigo-600 transition-colors mb-3" />
                            <span className="text-[11px] font-black text-slate-600 group-hover:text-indigo-600 uppercase tracking-wider">Post Drive</span>
                        </Link>
                        <Link to="/app/college/companies" className="p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl flex flex-col items-center justify-center text-center group transition-colors">
                            <BriefcaseIcon className="w-8 h-8 text-emerald-400 group-hover:text-emerald-600 transition-colors mb-3" />
                            <span className="text-[11px] font-black text-slate-600 group-hover:text-emerald-600 uppercase tracking-wider">Search Companies</span>
                        </Link>
                        <Link to="/app/college/emails" className="p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl flex flex-col items-center justify-center text-center group transition-colors">
                            <MailIcon className="w-8 h-8 text-blue-400 group-hover:text-blue-600 transition-colors mb-3" />
                            <span className="text-[11px] font-black text-slate-600 group-hover:text-blue-600 uppercase tracking-wider">Send Invites</span>
                        </Link>
                        <Link to="/app/college/profile" className="p-4 bg-slate-50 hover:bg-rose-50 rounded-2xl flex flex-col items-center justify-center text-center group transition-colors">
                            <SettingsIcon className="w-8 h-8 text-rose-400 group-hover:text-rose-600 transition-colors mb-3" />
                            <span className="text-[11px] font-black text-slate-600 group-hover:text-rose-600 uppercase tracking-wider">Update Profile</span>
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-6">Recent Activity</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0"></div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Microsoft Campus Drive confirmed.</p>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2 hours ago</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0"></div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">24 students shortlisted for Google.</p>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Yesterday</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">College Profile updated.</p>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">3 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Quick Icons
function CalendarIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> }
function BriefcaseIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> }
function MailIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> }
function SettingsIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> }

export default CollegeOverview;
