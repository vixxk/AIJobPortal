import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { useLocation } from 'react-router-dom';
import { Send, Mail, FileText, Clock, CheckCircle, Loader, Inbox, AlertCircle, Search, ChevronDown } from 'lucide-react';

const TEMPLATES = [
  {
    label: 'Standard Invitation',
    value: 'STANDARD_INVITATION',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    subject: 'Invitation for Campus Hiring Drive – 2026',
    message: `Dear HR Team,\n\nWe cordially invite your esteemed organization to participate in our upcoming campus placement drive.\n\nOur students are well-trained in various technical and management domains, and we are confident they will be an excellent addition to your team.\n\nKindly share your availability and the roles you are looking to fill.\n\nWarm Regards,\nPlacement Cell`
  },
  {
    label: 'Interview Scheduling',
    value: 'SCHEDULING',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    subject: 'Interview Round Scheduling – Final Shortlist',
    message: `Dear Recruiter,\n\nFollowing the preliminary shortlisting process, we would like to coordinate the interview schedule at your earliest convenience.\n\nPlease find the list of shortlisted candidates attached. Kindly confirm your preferred date and time slots for the interview rounds.\n\nThank you for your continued interest in our placement cell.\n\nBest regards,\nPlacement Cell`
  },
  {
    label: 'Placement Proposal',
    value: 'PROPOSAL',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    subject: 'Campus Recruitment Proposal – Strategic Partnership',
    message: `Dear [Company Name],\n\nWe would like to propose a long-term recruitment partnership between your organization and our institution.\n\nWe have a pool of highly qualified graduating students across B.Tech, MBA, and MCA programs. Our placement record demonstrates an average package of [X LPA] with top recruiters.\n\nWe look forward to exploring this collaboration.\n\nRegards,\nPlacement Cell`
  },
  {
    label: 'Follow-up',
    value: 'FOLLOWUP',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    subject: 'Follow-up: Placement Drive Invitation',
    message: `Dear HR Team,\n\nI am writing to follow up on our earlier invitation for the campus placement drive.\n\nWe have not yet received a confirmation from your side and would love to have your esteemed organization participate in our drive.\n\nPlease let us know if you require any additional information.\n\nBest regards,\nPlacement Cell`
  }
];

const CollegeEmails = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTo = params.get('to') || '';
  const initialCompany = params.get('company') || '';

  const [formData, setFormData] = useState({
    to: initialTo,
    subject: '',
    message: '',
    templateType: 'CUSTOM'
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const [sentMessages, setSentMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState('compose');
  const [searchHistory, setSearchHistory] = useState('');

  useEffect(() => {
    // Pre-fill company in subject if coming from Companies page
    if (initialCompany && !formData.subject) {
      setFormData(f => ({ ...f, subject: `Campus Placement Invitation – ${initialCompany}` }));
    }
  }, [initialCompany]);

  useEffect(() => {
    axios.get('/college/messages')
      .then(res => { if (res.data.status === 'success') setSentMessages(res.data.data); })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const applyTemplate = (tpl) => {
    setFormData(f => ({ ...f, subject: tpl.subject, message: tpl.message, templateType: tpl.value || 'CUSTOM' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const res = await axios.post('/college/messages', {
        toRecruiterEmail: formData.to,
        subject: formData.subject,
        message: formData.message,
        templateType: formData.templateType
      });
      const newMsg = res.data.data?.message;
      if (newMsg) setSentMessages(prev => [newMsg, ...prev]);
      setStatus({ type: 'success', text: `Email dispatched to ${formData.to}!` });
      setFormData({ to: '', subject: '', message: '', templateType: 'CUSTOM' });
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.message || 'Failed to send email.' });
    } finally { setSending(false); }
  };

  const filteredHistory = sentMessages.filter(m =>
    (m.toRecruiterEmail || '').toLowerCase().includes(searchHistory.toLowerCase()) ||
    (m.subject || '').toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Communications Hub</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Send placement proposals and connect with companies natively.</p>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[{ id: 'compose', label: 'Compose', icon: Mail }, { id: 'sent', label: `Sent (${sentMessages.length})`, icon: Inbox }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'compose' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-indigo-500" />
              </div>
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">New Email</h2>
            </div>

            {status && (
              <div className={`mx-6 mt-4 p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {status.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {status.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">To (Recruiter Email) *</label>
                <input required type="email" value={formData.to} onChange={e => setFormData({ ...formData, to: e.target.value })}
                  placeholder="hr@company.com"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none font-medium text-sm transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Subject *</label>
                <input required type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Placement Drive Invitation 2026"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none font-medium text-sm transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Message *</label>
                <textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                  rows={9} placeholder="Write your placement proposal..."
                  className="w-full p-4 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none font-medium text-sm transition-all resize-none" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  {formData.message.length} chars
                </span>
                <button type="submit" disabled={sending}
                  className="flex items-center gap-2 px-6 h-11 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200">
                  {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'Sending...' : 'Dispatch Email'}
                </button>
              </div>
            </form>
          </div>

          {/* Templates Panel */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Templates</h2>
            </div>
            <div className="p-4 space-y-3">
              {TEMPLATES.map((tpl, i) => (
                <button key={i} type="button" onClick={() => applyTemplate(tpl)}
                  className={`w-full text-left p-4 bg-white rounded-xl border ${tpl.border} hover:border-opacity-100 hover:shadow-sm transition-all group`}>
                  <span className={`block text-xs font-black ${tpl.color} mb-1`}>{tpl.label}</span>
                  <span className="block text-[10px] text-slate-400 font-bold line-clamp-2">{tpl.subject}</span>
                </button>
              ))}
              <div className="pt-2 border-t border-slate-50">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center">Click a template to apply</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sent Messages History */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-400" /> Sent Emails
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={searchHistory} onChange={e => setSearchHistory(e.target.value)}
                placeholder="Search emails..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 focus:border-indigo-400 outline-none text-xs font-medium text-slate-700 transition-all" />
            </div>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-16 text-center">
              <Inbox className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-bold">No emails sent yet.</p>
              <button onClick={() => setActiveTab('compose')} className="mt-3 text-indigo-600 text-xs font-black uppercase tracking-wider hover:underline">
                Compose Email →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredHistory.map((msg) => (
                <div key={msg._id} className="px-6 py-4 hover:bg-slate-50/60 transition-colors flex items-start gap-4">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-black text-slate-800 truncate">{msg.subject}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                          To: <span className="text-indigo-500">{msg.toRecruiterEmail}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                          msg.status === 'READ' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {msg.status === 'READ' ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                          {msg.status}
                        </span>
                        <p className="text-[9px] font-bold text-slate-300 mt-1">
                          {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1.5 line-clamp-2">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollegeEmails;
