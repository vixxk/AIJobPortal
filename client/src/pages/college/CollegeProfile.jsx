import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { Save, GraduationCap, MapPin, Globe, BookOpen, Users, TrendingUp, Building2, Award, CheckCircle, Loader } from 'lucide-react';

const InputField = ({ label, name, type = 'text', value, onChange, placeholder, required, icon: Icon }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full h-11 ${Icon ? 'pl-10' : 'px-4'} pr-4 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none font-medium text-sm text-slate-800 transition-all`}
      />
    </div>
  </div>
);

const CollegeProfile = () => {
  const [profile, setProfile] = useState({
    collegeName: '', location: '', website: '', description: '',
    courses: '', studentStrength: '', placementRate: '',
    establishedYear: '', affiliation: '', accreditation: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    axios.get('/college/me')
      .then(res => {
        if (res.data.status === 'success' && res.data.data.profile) {
          const p = res.data.data.profile;
          setProfile({
            collegeName: p.collegeName || '',
            location: p.location || '',
            website: p.website || '',
            description: p.description || '',
            courses: p.courses?.join(', ') || '',
            studentStrength: p.studentStrength || '',
            placementRate: p.placementRate || '',
            establishedYear: p.establishedYear || '',
            affiliation: p.affiliation || '',
            accreditation: p.accreditation || ''
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...profile,
        courses: profile.courses.split(',').map(c => c.trim()).filter(Boolean),
        studentStrength: profile.studentStrength ? Number(profile.studentStrength) : undefined,
        placementRate: profile.placementRate ? Number(profile.placementRate) : undefined,
        establishedYear: profile.establishedYear ? Number(profile.establishedYear) : undefined,
      };
      await axios.post('/college/profile', payload);
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">College Profile</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Manage your placement cell details visible to recruiters.</p>
      </div>

      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : null}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="College Name" name="collegeName" value={profile.collegeName} onChange={handleChange}
              placeholder="e.g. State Institute of Technology" required icon={GraduationCap} />
            <InputField label="Location / City" name="location" value={profile.location} onChange={handleChange}
              placeholder="e.g. Bengaluru, Karnataka" required icon={MapPin} />
            <InputField label="Official Website" name="website" value={profile.website} onChange={handleChange}
              placeholder="https://college.edu" icon={Globe} />
            <InputField label="Established Year" name="establishedYear" type="number" value={profile.establishedYear} onChange={handleChange}
              placeholder="e.g. 1985" icon={Building2} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">About the College</label>
            <textarea
              name="description"
              value={profile.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the college, its specializations, and placement history..."
              className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none font-medium text-sm text-slate-800 transition-all resize-none"
            />
          </div>
        </div>

        {/* Academic Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" /> Academic & Affiliation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="University Affiliation" name="affiliation" value={profile.affiliation} onChange={handleChange}
              placeholder="e.g. Anna University" icon={Building2} />
            <InputField label="Accreditation" name="accreditation" value={profile.accreditation} onChange={handleChange}
              placeholder="e.g. NAAC A+, NBA" icon={Award} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Courses Offered <span className="text-slate-300">(comma-separated)</span>
            </label>
            <input
              type="text"
              name="courses"
              value={profile.courses}
              onChange={handleChange}
              placeholder="B.Tech, MBA, MCA, B.Sc, M.Tech, BCA"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none font-medium text-sm text-slate-800 transition-all"
            />
            {profile.courses && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.courses.split(',').map(c => c.trim()).filter(Boolean).map((course, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg border border-indigo-100">
                    {course}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Placement Stats */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Placement Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Total Students Available for Placement" name="studentStrength" type="number"
              value={profile.studentStrength} onChange={handleChange} placeholder="e.g. 500" icon={Users} />
            <InputField label="Placement Rate (%)" name="placementRate" type="number"
              value={profile.placementRate} onChange={handleChange} placeholder="e.g. 87" icon={TrendingUp} />
          </div>
          {profile.placementRate && (
            <div>
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                <span>Placement Rate</span>
                <span className="text-emerald-600">{profile.placementRate}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(profile.placementRate, 100)}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 h-11 rounded-xl font-black text-white text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CollegeProfile;
