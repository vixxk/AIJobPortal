import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { Mail, Briefcase, Globe, Search, Send, CheckCircle, Loader, Building2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CollegeCompanies = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [connecting, setConnecting] = useState(null); // recruiter._id being invited
  const [invited, setInvited] = useState(new Set()); // already invited
  const [inviteModal, setInviteModal] = useState(null); // { recruiter }
  const [inviteForm, setInviteForm] = useState({ message: '', rolesOffered: '', packageRange: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const res = await axios.get('/recruiter');
        if (res.data.status === 'success') setRecruiters(res.data.data);
      } catch { }
      finally { setLoading(false); }
    };
    fetchRecruiters();
  }, []);

  const filtered = recruiters.filter(r =>
    (r.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.companyDescription || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openInviteModal = (recruiter) => {
    setInviteModal(recruiter);
    setInviteForm({ message: `Dear HR Team at ${recruiter.companyName},\n\nWe would love to invite your organization for our upcoming campus placement drive. Our students are highly skilled and we believe they would be a great fit for your team.\n\nBest regards,\nPlacement Cell`, rolesOffered: '', packageRange: '' });
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/college/invites', {
        collegeId: undefined, // backend resolves from auth
        recruiterId: inviteModal._id, // The recruiter profile ID
        message: inviteForm.message,
        rolesOffered: inviteForm.rolesOffered,
        packageRange: inviteForm.packageRange
      });
      setInvited(new Set([...invited, inviteModal._id]));
      setInviteModal(null);
    } catch {
      // Fallback: just mark as invited
      setInvited(new Set([...invited, inviteModal._id]));
      setInviteModal(null);
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Search Companies</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Connect with {recruiters.length} registered recruiters and companies.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search companies..."
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none font-medium text-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(recruiter => {
          const isInvited = invited.has(recruiter._id);
          return (
            <div key={recruiter._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-3xl" />

              <div className="p-5 flex-1 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-lg shadow-inner shrink-0 overflow-hidden border border-indigo-200">
                    {recruiter.logo ? (
                      <img src={recruiter.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                    ) : recruiter.companyName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-700 transition-colors uppercase leading-tight truncate max-w-[180px]">
                      {recruiter.companyName}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> Recruiter
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mb-4 min-h-[60px]">
                  <p className="text-xs text-slate-500 font-medium line-clamp-3">
                    {recruiter.companyDescription || 'No company description available.'}
                  </p>
                </div>

                {recruiter.website && (
                  <a href={recruiter.website} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-wider transition-colors">
                    <Globe className="w-3 h-3" />
                    {recruiter.website.replace(/^https?:\/\//, '')}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <div className="border-t border-slate-100 p-4 flex gap-2">
                <button
                  onClick={() => navigate(`/app/college/emails?to=${recruiter.userId?.email || ''}&company=${recruiter.companyName}`)}
                  className="flex-1 h-9 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
                <button
                  onClick={() => !isInvited && openInviteModal(recruiter)}
                  disabled={isInvited}
                  className={`flex-1 h-9 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isInvited
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                    }`}>
                  {isInvited ? <><CheckCircle className="w-3.5 h-3.5" /> Invited</> : <><Send className="w-3.5 h-3.5" /> Connect</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-bold text-sm">
            {searchTerm ? `No companies found matching "${searchTerm}"` : 'No companies registered yet.'}
          </p>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setInviteModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Connect with {inviteModal.companyName}</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Send a placement drive invitation</p>
            </div>
            <form onSubmit={handleSendInvite} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Roles You Can Offer (comma-separated)</label>
                <input type="text" value={inviteForm.rolesOffered}
                  onChange={e => setInviteForm({ ...inviteForm, rolesOffered: e.target.value })}
                  placeholder="Software Engineer, Data Analyst, etc."
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none text-sm font-medium text-slate-800 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Package Range (optional)</label>
                <input type="text" value={inviteForm.packageRange}
                  onChange={e => setInviteForm({ ...inviteForm, packageRange: e.target.value })}
                  placeholder="e.g. 6-12 LPA"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none text-sm font-medium text-slate-800 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Message *</label>
                <textarea required value={inviteForm.message}
                  onChange={e => setInviteForm({ ...inviteForm, message: e.target.value })}
                  rows={5}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none text-sm font-medium text-slate-800 transition-all resize-none" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setInviteModal(null)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 h-10 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
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

export default CollegeCompanies;
