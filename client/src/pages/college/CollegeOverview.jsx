import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { 
  Users, FileText, CheckCircle, Clock, Mail, Calendar, 
  TrendingUp, Bell, GraduationCap, ArrowRight, Building2, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, to }) => {
  const card = (
    <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group ${to ? 'cursor-pointer hover:border-indigo-200' : ''}`}>
      <div className={`w-12 h-12 ${color.bg} rounded-xl flex items-center justify-center ${color.text} shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-0.5">
          {value ?? <div className="h-7 w-12 bg-slate-100 animate-pulse rounded" />}
        </h3>
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
};

const CollegeOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/college/stats')
      .then(res => { if (res.data.status === 'success') setStats(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const profile = stats?.profile;

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {profile?.collegeName ? `${profile.collegeName}` : 'College Dashboard'}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {profile?.location ? `📍 ${profile.location}` : 'Manage drives, placements, and companies effortlessly.'}
          </p>
        </div>
        {stats?.invites > 0 && (
          <Link to="/app/college/placement" className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-100 transition-colors">
            <Bell className="w-4 h-4 animate-pulse" />
            {stats.invites} Recruiter Invite{stats.invites > 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Students" value={loading ? null : (profile?.studentStrength || '—')}
          color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }} to="/app/college/profile" />
        <StatCard icon={Calendar} label="Drives Posted" value={loading ? null : (stats?.drives ?? 0)}
          color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} to="/app/college/drives" />
        <StatCard icon={FileText} label="Emails Sent" value={loading ? null : (stats?.messages ?? 0)}
          color={{ bg: 'bg-blue-50', text: 'text-blue-600' }} to="/app/college/emails" />
        <StatCard icon={Clock} label="Live Sessions" value={loading ? null : (stats?.sessions ?? 0)}
          color={{ bg: 'bg-rose-50', text: 'text-rose-600' }} to="/app/college/placement" />
      </div>

      {/* Profile Completion Banner (show if profile is incomplete) */}
      {!loading && !profile?.collegeName && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white shadow-xl shadow-indigo-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg">Complete Your College Profile</h3>
              <p className="text-indigo-100 text-sm">Add your college details to start getting recruiter connections.</p>
            </div>
          </div>
          <Link to="/app/college/profile" className="shrink-0 px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-2">
            Set Up Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Quick Actions + Placement Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Star className="w-4 h-4 text-indigo-500" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/app/college/drives', label: 'Post Drive', emoji: '📣', hover: 'hover:bg-indigo-50 hover:text-indigo-700' },
              { to: '/app/college/companies', label: 'Find Companies', emoji: '🏢', hover: 'hover:bg-emerald-50 hover:text-emerald-700' },
              { to: '/app/college/emails', label: 'Send Email', emoji: '✉️', hover: 'hover:bg-blue-50 hover:text-blue-700' },
              { to: '/app/college/placement', label: 'Run Placement', emoji: '🎯', hover: 'hover:bg-rose-50 hover:text-rose-700' },
            ].map(a => (
              <Link key={a.to} to={a.to} className={`p-4 bg-slate-50 ${a.hover} rounded-xl flex flex-col items-center justify-center text-center group transition-all`}>
                <span className="text-3xl mb-2">{a.emoji}</span>
                <span className="text-[11px] font-black text-slate-600 group-hover:inherit uppercase tracking-wider">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* College Stats / Placement info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Placement Metrics
          </h2>
          {profile ? (
            <div className="space-y-4">
              {[
                { label: 'Placement Rate', value: profile.placementRate ? `${profile.placementRate}%` : 'Not set', bar: profile.placementRate },
                { label: 'Student Strength', value: profile.studentStrength?.toLocaleString() || 'Not set' },
                { label: 'Courses Offered', value: profile.courses?.length > 0 ? profile.courses.slice(0,3).join(', ') + (profile.courses.length > 3 ? ` +${profile.courses.length - 3}` : '') : 'Not set' },
                { label: 'Affiliation', value: profile.affiliation || 'Not set' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                    <span className="text-sm font-black text-slate-700">{item.value}</span>
                  </div>
                  {item.bar && (
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all" style={{ width: `${item.bar}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <GraduationCap className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 font-medium">Profile not set up yet.</p>
              <Link to="/app/college/profile" className="mt-3 text-indigo-600 text-xs font-black uppercase tracking-wider hover:underline flex items-center gap-1">
                Setup Now <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recruiter Invites Preview */}
      {stats?.invites > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> Pending Recruiter Invites
            </h2>
            <Link to="/app/college/placement" className="text-amber-600 text-xs font-black uppercase tracking-wider flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-sm text-slate-600 font-medium">
            You have <span className="font-black text-amber-700">{stats.invites}</span> recruiter{stats.invites > 1 ? 's' : ''} who want to hire from your campus. Review and respond to their invitations.
          </p>
        </div>
      )}
    </div>
  );
};

export default CollegeOverview;
