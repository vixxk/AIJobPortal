import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';

const CollegeProfile = () => {
    const [profile, setProfile] = useState({
        collegeName: '',
        location: '',
        courses: '',
        studentStrength: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/college/me');
                if (res.data.status === 'success' && res.data.data.profile) {
                    const p = res.data.data.profile;
                    setProfile({
                        collegeName: p.collegeName || '',
                        location: p.location || '',
                        courses: p.courses ? p.courses.join(', ') : '',
                        studentStrength: p.studentStrength || ''
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const payload = {
                ...profile,
                courses: profile.courses.split(',').map(c => c.trim()).filter(Boolean),
                studentStrength: Number(profile.studentStrength)
            };
            const res = await axios.post('/college/profile', payload);
            if (res.data.status === 'success') {
                setMessage('Profile updated successfully!');
            }
        } catch (error) {
            setMessage('Failed to update profile.');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">College Profile</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Manage your placement cell details.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold ${message.includes('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">College Name</label>
                    <input required type="text" name="collegeName" value={profile.collegeName} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" placeholder="e.g. State University" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                    <input required type="text" name="location" value={profile.location} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" placeholder="e.g. New York, NY" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Courses Offered</label>
                    <input type="text" name="courses" value={profile.courses} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" placeholder="e.g. B.Tech, MBA, B.Sc (comma separated)" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Student Strength (Available for Placement)</label>
                    <input type="number" name="studentStrength" value={profile.studentStrength} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm" placeholder="e.g. 500" />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button type="submit" disabled={saving} className="px-8 h-12 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CollegeProfile;
