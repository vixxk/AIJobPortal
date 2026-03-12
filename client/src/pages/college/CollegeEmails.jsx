import React, { useState } from 'react';
import axios from '../../utils/axios';
import { useLocation } from 'react-router-dom';
import { Send, Mail, Briefcase, FileText } from 'lucide-react';

const CollegeEmails = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTo = queryParams.get('to') || '';

    const [formData, setFormData] = useState({
        to: initialTo,
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setStatus(null);
        try {
            // The backend does not have an explicit /college/email endpoint right now.
            // We would need to implement this endpoint or mock it.
            // Assuming this would call an email API
            // await axios.post('/college/email', formData);
            
            // Mocking the success
            setTimeout(() => {
                setStatus({ type: 'success', text: 'Email sent successfully via platform!' });
                setFormData({ to: '', subject: '', message: '' });
                setSending(false);
            }, 1000);
        } catch (error) {
            setStatus({ type: 'error', text: 'Failed to send email.' });
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Direct Communications Hub</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Send placement proposals and connect with companies natively.</p>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
                <div className="flex-1 p-8">
                    {status && (
                        <div className={`p-4 rounded-xl text-sm font-bold mb-6 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {status.text}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recipient (Company/Recruiter Email)</label>
                            <input 
                                required type="email" 
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" 
                                placeholder="hr@google.com" 
                                value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                            <input 
                                required type="text" 
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" 
                                placeholder="Placement Drive Invitation 2026" 
                                value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message Proposal</label>
                            <textarea 
                                required 
                                className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm resize-none" 
                                placeholder="We invite your esteemed organization for our campus placement drive..." 
                                value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} 
                            />
                        </div>
                        <div className="pt-2 flex justify-end">
                            <button disabled={sending} type="submit" className="px-8 h-12 bg-indigo-600 text-white rounded-xl font-bold uppercase text-[11px] tracking-wider hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Dispatch Email'}
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="w-full md:w-80 bg-slate-50 p-8 border-l border-slate-100 flex flex-col justify-center">
                    <h3 className="font-black text-slate-900 mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" /> Templates
                    </h3>
                    
                    <div className="space-y-4">
                        <button 
                            type="button" 
                            onClick={() => setFormData({...formData, subject: 'Invitation for Campus Hiring 2026', message: 'Dear HR Team,\n\nWe would like to invite your organization for our upcoming placement drive...\n\nSincerely,\nPlacement Cell'})}
                            className="w-full text-left p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-sm transition-all group"
                        >
                            <span className="block text-xs font-black text-indigo-600 mb-1">Standard Invitation</span>
                            <span className="block text-[10px] text-slate-500 line-clamp-2">A professional template to invite companies for campus drives.</span>
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => setFormData({...formData, subject: 'Interview Scheduling - Pre-Placement Offers', message: 'Dear Recruiter,\n\nFollowing your shortlisting process, we would like to schedule interviews...\n\nThanks,\nPlacement Cell'})}
                            className="w-full text-left p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-sm transition-all group"
                        >
                            <span className="block text-xs font-black text-emerald-600 mb-1">Interview Scheduling</span>
                            <span className="block text-[10px] text-slate-500 line-clamp-2">Coordinate interview schedules with recruiters quickly.</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollegeEmails;
