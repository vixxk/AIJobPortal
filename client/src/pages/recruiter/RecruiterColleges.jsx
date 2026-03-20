import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import {
  Mail, GraduationCap, Building2, Users, Search, Send, CheckCircle,
  XCircle, Clock, ChevronRight, Loader, MessageSquare, BookOpen, TrendingUp, Bell
} from 'lucide-react';

const RecruiterColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [invitesSent, setInvitesSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteModal, setInviteModal] = useState(null); // { college }
  const [inviteForm, setInviteForm] = useState({ message: '', rolesOffered: '', packageRange: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collegeRes, inviteRes] = await Promise.all([
          axios.get('/college'),
          axios.get('/college/invites/sent').catch(() => ({ data: { data: [] } }))
        ]);
        if (collegeRes.data.status === 'success') setColleges(collegeRes.data.data);
        if (inviteRes.data.status === 'success') setInvitesSent(inviteRes.data.data || []);
      } catch { }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filtered = colleges.filter(c =>
    (c.collegeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.courses || []).some(course => course.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getInviteStatus = (collegeId) => {
    const inv = invitesSent.find(i => i.collegeId?._id === collegeId || i.collegeId === collegeId);
    return inv?.status;
  };

  const openInviteModal = (college) => {
    setInviteModal(college);
    setInviteForm({
      message: `Dear Placement Cell,\n\nWe at [Your Company] are looking to hire talented students from ${college.collegeName} for the upcoming recruitment cycle.\n\nWe believe your students would be an excellent match for the roles we are hiring for. Kindly review our invitation and let us know your availability for a campus placement drive.\n\nBest regards,\nHR Team`,
      rolesOffered: '',
      packageRange: ''
    });
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/college/invites', {
        collegeId: inviteModal._id,
        message: inviteForm.message,
        rolesOffered: inviteForm.rolesOffered,
        packageRange: inviteForm.packageRange
      });
      // Refetch sent invites
      const res = await axios.get('/college/invites/sent').catch(() => null);
      if (res?.data.status === 'success') setInvitesSent(res.data.data || []);
      setInviteModal(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send invite');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">College Connect</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Connect with placement cells and invite institutions for campus hiring.
          </p>
        </div>
        {invitesSent.filter(i => i.status === 'ACCEPTED').length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" />
            {invitesSent.filter(i => i.status === 'ACCEPTED').length} invite{invitesSent.filter(i => i.status === 'ACCEPTED').length > 1 ? 's' : ''} accepted
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Partner Colleges', value: colleges.length, icon: GraduationCap, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Invites Sent', value: invitesSent.length, icon: Send, color: 'bg-blue-50 text-blue-600' },
          { label: 'Accepted', value: invitesSent.filter(i => i.status === 'ACCEPTED').length, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending', value: invitesSent.filter(i => i.status === 'PENDING').length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center shrink-0`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          {[
            { id: 'discover', label: `Discover (${colleges.length})` },
            { id: 'invites', label: `My Invites (${invitesSent.length})` }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'discover' && (
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input type="text" placeholder="Search by college, location, or course..."
              className="w-full h-10 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none font-medium text-sm bg-white transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        )}
      </div>

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <GraduationCap className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">
                {searchTerm ? `No colleges found matching "${searchTerm}"` : 'No colleges registered yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(college => {
                const inviteStatus = getInviteStatus(college._id);
                return (
                  <div key={college._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden">
                    <div className="p-5 flex-1">
                      {/* College Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-200 shrink-0">
                          {college.collegeName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-700 transition-colors uppercase leading-tight line-clamp-2">
                            {college.collegeName}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5 uppercase">
                            <Building2 className="w-3 h-3 shrink-0" /> {college.location || 'Location N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Students</p>
                          <p className="text-lg font-black text-slate-800 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-indigo-400" /> {college.studentStrength?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Placed</p>
                          <p className="text-lg font-black text-slate-800 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            {college.placementRate ? `${college.placementRate}%` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Courses */}
                      {college.courses?.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Courses
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {college.courses.slice(0, 4).map((course, idx) => (
                              <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-md border border-indigo-100 uppercase">
                                {course}
                              </span>
                            ))}
                            {college.courses.length > 4 && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-black rounded-md">
                                +{college.courses.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-slate-100 p-4 flex gap-2">
                      <a href={`mailto:${college.userId?.email}?subject=Campus%20Placement%20Invitation`}
                        className="flex items-center justify-center gap-1.5 h-9 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest transition-all">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                      <button
                        onClick={() => !inviteStatus && openInviteModal(college)}
                        disabled={!!inviteStatus}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          inviteStatus === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default' :
                          inviteStatus === 'DECLINED' ? 'bg-red-50 text-red-500 border border-red-100 cursor-default' :
                          inviteStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100 cursor-default' :
                          'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                        }`}>
                        {inviteStatus === 'ACCEPTED' ? <><CheckCircle className="w-3.5 h-3.5" /> Accepted</> :
                         inviteStatus === 'DECLINED' ? <><XCircle className="w-3.5 h-3.5" /> Declined</> :
                         inviteStatus === 'PENDING' ? <><Clock className="w-3.5 h-3.5" /> Pending</> :
                         <><Send className="w-3.5 h-3.5" /> Send Invite</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* My Invites Tab */}
      {activeTab === 'invites' && (
        <div className="space-y-4">
          {invitesSent.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <h3 className="font-black text-slate-700 mb-2">No Invites Sent Yet</h3>
              <p className="text-sm text-slate-400 mb-4">Start connecting with college placement cells.</p>
              <button onClick={() => setActiveTab('discover')}
                className="px-6 h-10 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all">
                Discover Colleges →
              </button>
            </div>
          ) : (
            invitesSent.map(invite => {
              const college = invite.collegeId;
              return (
                <div key={invite._id} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4 ${
                  invite.status === 'ACCEPTED' ? 'border-emerald-200' :
                  invite.status === 'DECLINED' ? 'border-red-200' :
                  'border-slate-100'
                }`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center font-black text-indigo-600 text-lg shrink-0">
                      {college?.collegeName?.[0] || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-black text-slate-900 text-base">{college?.collegeName || 'Unknown College'}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                          invite.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          invite.status === 'DECLINED' ? 'bg-red-50 text-red-500 border-red-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {invite.status === 'ACCEPTED' ? '✓ Accepted' : invite.status === 'DECLINED' ? '✕ Declined' : '⏳ Pending'}
                        </span>
                      </div>
                      {college?.location && <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Building2 className="w-3 h-3" />{college.location}</p>}
                      {invite.rolesOffered?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {invite.rolesOffered.map((r, i) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-md border border-indigo-100">{r}</span>
                          ))}
                        </div>
                      )}
                      {invite.packageRange && <p className="text-xs text-slate-500 font-bold mt-1">Package: <span className="text-amber-600 font-black">{invite.packageRange}</span></p>}
                      <p className="text-[10px] text-slate-300 font-bold mt-2">
                        Sent {new Date(invite.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Invite Modal */}
      {inviteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setInviteModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center font-black text-indigo-600 text-lg">
                  {inviteModal.collegeName?.[0]}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">{inviteModal.collegeName}</h2>
                  <p className="text-xs text-slate-400 font-medium">{inviteModal.location}</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSendInvite} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Roles You're Hiring For (comma-separated)
                </label>
                <input type="text" value={inviteForm.rolesOffered}
                  onChange={e => setInviteForm({ ...inviteForm, rolesOffered: e.target.value })}
                  placeholder="Software Engineer, Data Analyst, MBA grad…"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none text-sm font-medium text-slate-800 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Package Range (optional)</label>
                <input type="text" value={inviteForm.packageRange}
                  onChange={e => setInviteForm({ ...inviteForm, packageRange: e.target.value })}
                  placeholder="e.g. 8-15 LPA"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none text-sm font-medium text-slate-800 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Invitation Message *</label>
                <textarea required value={inviteForm.message}
                  onChange={e => setInviteForm({ ...inviteForm, message: e.target.value })}
                  rows={7}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none text-sm font-medium text-slate-800 transition-all resize-none" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setInviteModal(null)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 h-10 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                  {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterColleges;
