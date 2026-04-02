import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import {
  Video, CheckSquare, Users, Plus, X, Calendar, Clock, Link as LinkIcon,
  Loader, ChevronRight, Bell, Building2, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const sessionTypeColors = {
  TECHNICAL: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  HR: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
  GROUP_DISCUSSION: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  APTITUDE: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
  FINAL: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
};

const CollegePlacement = () => {
  const [sessions, setSessions] = useState([]);
  const [drives, setDrives] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions');
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  const [form, setForm] = useState({
    driveId: '', sessionTitle: '', interviewType: 'HR',
    scheduledAt: '', durationMinutes: 60, meetingLink: ''
  });

  const fetchAll = async () => {
    try {
      const [sessRes, drivRes, invRes] = await Promise.all([
        axios.get('/college/sessions'),
        axios.get('/college/drives'),
        axios.get('/college/invites')
      ]);
      if (sessRes.data.status === 'success') setSessions(sessRes.data.data);
      if (drivRes.data.status === 'success') setDrives(drivRes.data.data);
      if (invRes.data.status === 'success') setInvites(invRes.data.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post('/college/sessions', form);
      if (res.data.status === 'success') {
        setSessions(prev => [...prev, res.data.data.session]);
        setShowModal(false);
        setForm({ driveId: '', sessionTitle: '', interviewType: 'HR', scheduledAt: '', durationMinutes: 60, meetingLink: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create session.');
    } finally { setSubmitting(false); }
  };

  const handleRespondInvite = async (inviteId, status) => {
    setRespondingId(inviteId);
    try {
      await axios.patch(`/college/invites/${inviteId}`, { status });
      setInvites(prev => prev.map(inv => inv._id === inviteId ? { ...inv, status } : inv));
    } catch { }
    finally { setRespondingId(null); }
  };

  const handleUpdateSessionStatus = async (sessionId, status) => {
    try {
      await axios.patch(`/college/sessions/${sessionId}`, { status });
      setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, status } : s));
      if (selectedSession?._id === sessionId) setSelectedSession(prev => ({ ...prev, status }));
    } catch { }
  };

  const pendingInvites = invites.filter(i => i.status === 'PENDING');

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Conduct Placements</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Host interviews, manage shortlisting, and respond to recruiter invites.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 h-10 px-5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
          <Plus className="w-4 h-4" /> Schedule Session
        </button>
      </div>

      {/* Pending Invites Banner */}
      {pendingInvites.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <Bell className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
          <p className="text-sm font-bold text-amber-800 flex-1">
            <span className="font-black">{pendingInvites.length} recruiter{pendingInvites.length > 1 ? 's' : ''}</span> want to hire from your campus.
            <button onClick={() => setActiveTab('invites')} className="ml-2 underline font-black text-amber-700 inline-flex items-center gap-1">
              View Invites <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </p>
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Video, label: 'Video Interviews', desc: 'Conduct live panel interviews with multiple participants using built-in meeting links.', color: 'bg-indigo-50 text-indigo-500' },
          { icon: CheckSquare, label: 'Live Shortlisting', desc: 'Evaluate candidates in real-time and update their status as you progress.', color: 'bg-emerald-50 text-emerald-500' },
          { icon: Users, label: 'Direct Hiring', desc: 'Mark candidates as hired directly within the platform after successful interviews.', color: 'bg-rose-50 text-rose-500' },
        ].map(card => (
          <div key={card.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className={`w-12 h-12 mx-auto ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-tighter mb-2">{card.label}</h3>
            <p className="text-xs text-slate-500 font-medium">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'sessions', label: `Sessions (${sessions.length})` },
          { id: 'invites', label: `Recruiter Invites (${invites.length})`, badge: pendingInvites.length }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab.label}
            {tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        loading ? (
          <div className="flex items-center justify-center h-48"><Loader className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
            <Video className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="font-black text-slate-700 mb-2">No Sessions Scheduled</h3>
            <p className="text-sm text-slate-400 mb-6">Schedule your first interview session for a placement drive.</p>
            <button onClick={() => setShowModal(true)}
              className="px-6 h-10 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mx-auto">
              {drives.length > 0 ? 'Schedule Session' : 'Post a Drive First'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sessions.map(session => {
              const cfg = sessionTypeColors[session.interviewType] || sessionTypeColors.HR;
              const statusCfg = {
                SCHEDULED: 'bg-blue-50 text-blue-600 border-blue-100',
                LIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                COMPLETED: 'bg-slate-50 text-slate-500 border-slate-100',
                CANCELLED: 'bg-red-50 text-red-500 border-red-100',
              }[session.status] || 'bg-slate-50 text-slate-500 border-slate-100';

              return (
                <div key={session._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-slate-900 text-base">{session.sessionTitle}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">
                          {session.driveId?.companyName || 'No Drive'} • {session.driveId?.driveTitle || ''}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {session.interviewType?.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${statusCfg}`}>
                          {session.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-300" />
                        {new Date(session.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-300" />
                        {new Date(session.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-300" />{session.durationMinutes} min</span>
                    </div>

                    {session.meetingLink && (
                      <a href={session.meetingLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-indigo-600 text-xs font-bold hover:underline">
                        <LinkIcon className="w-3.5 h-3.5" /> Join Meeting
                      </a>
                    )}

                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <Users className="w-3.5 h-3.5" />
                      {session.candidates?.length || 0} candidates
                      {session.candidates?.filter(c => c.status === 'HIRED').length > 0 && (
                        <span className="text-emerald-600">• {session.candidates.filter(c => c.status === 'HIRED').length} hired</span>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 p-4 flex gap-2">
                    <button onClick={() => setSelectedSession(session)}
                      className="flex-1 h-9 bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors">
                      Manage <ChevronRight className="w-3 h-3" />
                    </button>
                    {session.status === 'SCHEDULED' && (
                      <button onClick={() => handleUpdateSessionStatus(session._id, 'LIVE')}
                        className="h-9 px-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">
                        Go Live
                      </button>
                    )}
                    {session.status === 'LIVE' && (
                      <button onClick={() => handleUpdateSessionStatus(session._id, 'COMPLETED')}
                        className="h-9 px-3 bg-slate-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                        End
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Invites Tab */}
      {activeTab === 'invites' && (
        loading ? (
          <div className="flex items-center justify-center h-48"><Loader className="w-8 h-8 text-indigo-400 animate-spin" /></div>
        ) : invites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="font-black text-slate-700 mb-2">No Recruiter Invites Yet</h3>
            <p className="text-sm text-slate-400">Recruiters who want to hire from your campus will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invites.map(invite => {
              const recruiter = invite.recruiterId;
              return (
                <div key={invite._id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4 ${invite.status === 'PENDING' ? 'border-amber-200' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center font-black text-indigo-600 text-lg shrink-0">
                      {recruiter?.companyName?.[0] || 'R'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-slate-900 text-base">{recruiter?.companyName || 'Unknown Company'}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                          invite.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          invite.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-red-50 text-red-500 border-red-100'
                        }`}>{invite.status}</span>
                      </div>
                      {invite.rolesOffered?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {invite.rolesOffered.map((r, i) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-md border border-indigo-100">{r}</span>
                          ))}
                        </div>
                      )}
                      {invite.packageRange && (
                        <p className="text-xs text-slate-500 font-bold mt-1">Package: <span className="text-amber-600 font-black">{invite.packageRange}</span></p>
                      )}
                      {invite.message && (
                        <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-2">{invite.message}</p>
                      )}
                      <p className="text-[10px] text-slate-300 font-bold mt-2">
                        Received {new Date(invite.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {invite.status === 'PENDING' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleRespondInvite(invite._id, 'DECLINED')} disabled={respondingId === invite._id}
                        className="flex items-center gap-1.5 h-9 px-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-all disabled:opacity-50">
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </button>
                      <button onClick={() => handleRespondInvite(invite._id, 'ACCEPTED')} disabled={respondingId === invite._id}
                        className="flex items-center gap-1.5 h-9 px-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-md shadow-emerald-200">
                        {respondingId === invite._id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">{selectedSession.sessionTitle}</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedSession.driveId?.companyName}</p>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Status Controls */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Session Status</p>
                <div className="flex flex-wrap gap-2">
                  {['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'].map(s => (
                    <button key={s} onClick={() => handleUpdateSessionStatus(selectedSession._id, s)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${selectedSession.status === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Candidates */}
              {selectedSession.candidates?.length > 0 ? (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Candidates ({selectedSession.candidates.length})</p>
                  <div className="space-y-2">
                    {selectedSession.candidates.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="text-sm font-black text-slate-800">{c.studentId?.name || `Candidate ${i + 1}`}</p>
                          {c.studentId?.email && <p className="text-[10px] text-slate-400 font-bold">{c.studentId.email}</p>}
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${
                          c.status === 'HIRED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          c.status === 'SHORTLISTED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          c.status === 'REJECTED' ? 'bg-red-50 text-red-500 border-red-100' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-bold">No candidates added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Schedule Interview Session</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateSession} className="p-5 space-y-4">
              {drives.length === 0 ? (
                <div className="py-6 text-center">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600 mb-3">You need to post a drive first before scheduling sessions.</p>
                  <button type="button" onClick={() => { setShowModal(false); window.location.href = '/app/college/drives'; }}
                    className="px-4 h-9 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mx-auto">
                    Post a Drive <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Placement Drive *</label>
                    <select required value={form.driveId} onChange={e => setForm({ ...form, driveId: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none font-medium text-sm text-slate-800 transition-all">
                      <option value="">Select Drive</option>
                      {drives.map(d => <option key={d._id} value={d._id}>{d.companyName} — {d.driveTitle}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Title *</label>
                    <input required value={form.sessionTitle} onChange={e => setForm({ ...form, sessionTitle: e.target.value })}
                      placeholder="e.g. Technical Round 1" className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none font-medium text-sm text-slate-800 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Interview Type</label>
                      <select value={form.interviewType} onChange={e => setForm({ ...form, interviewType: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none font-medium text-sm text-slate-800 transition-all">
                        {['TECHNICAL', 'HR', 'GROUP_DISCUSSION', 'APTITUDE', 'FINAL'].map(t => (
                          <option key={t} value={t}>{t.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration (min)</label>
                      <input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })}
                        min="15" max="360" className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none font-medium text-sm text-slate-800 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scheduled Date & Time *</label>
                    <input required type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none font-medium text-sm text-slate-800 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Meeting Link (optional)</label>
                    <input type="url" value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })}
                      placeholder="https://meet.google.com/..." className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none font-medium text-sm text-slate-800 transition-all" />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full h-11 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {submitting ? 'Scheduling...' : 'Schedule Session'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegePlacement;
