import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Camera, User, Mail, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${base}${path}`;
};

const TeacherProfile = () => {
    const { user, updateProfile, uploadAvatar, refreshUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileRef = useRef(null);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5 MB.');
            return;
        }

        setUploadingAvatar(true);
        try {
            const result = await uploadAvatar(file);
            if (result.success) {
                toast.success('Profile picture updated!');
                await refreshUser();
            } else {
                toast.error(result.message || 'Failed to update picture.');
            }
        } catch {
            toast.error('Something went wrong.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Name cannot be empty.');
            return;
        }
        setSaving(true);
        try {
            const result = await updateProfile({ name: name.trim() });
            if (result.success) {
                toast.success('Profile updated!');
                await refreshUser();
            } else {
                toast.error(result.message || 'Failed to update profile.');
            }
        } catch {
            toast.error('Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = name.trim() !== (user?.name || '');

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Manage your profile information</p>
            </div>

            <div className="bg-white rounded-[28px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* Avatar Section */}
                <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 px-8 py-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
                    <div className="flex flex-col items-center relative z-10">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-full bg-white/20 border-4 border-white/40 shadow-2xl overflow-hidden flex items-center justify-center">
                                {uploadingAvatar ? (
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                ) : user?.avatar ? (
                                    <img
                                        src={getImageUrl(user.avatar)}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-black text-white/90">
                                        {user?.name?.[0]?.toUpperCase() || 'T'}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-all hover:scale-110 disabled:opacity-50"
                            >
                                <Camera className="w-4.5 h-4.5" />
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <p className="text-white/70 text-xs font-bold mt-4 tracking-wide">Click the camera icon to change photo</p>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSave} className="p-8 space-y-6">
                    {/* Name Field */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-2.5">
                            <User className="w-3.5 h-3.5" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        />
                    </div>

                    {/* Email Field (read-only) */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-2.5">
                            <Mail className="w-3.5 h-3.5" />
                            Email Address
                        </label>
                        <div className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-medium text-slate-400 cursor-not-allowed">
                            {user?.email || '—'}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-1.5 ml-1">Email cannot be changed.</p>
                    </div>

                    {/* Role Badge */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-2.5">
                            Role
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-black text-indigo-600 uppercase tracking-wider">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {user?.role === 'TEACHER' ? 'Teacher / Instructor' : user?.role || 'User'}
                            </span>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={saving || !hasChanges}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300"
                        >
                            {saving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="w-4 h-4" /> Save Changes</>
                            )}
                        </button>
                        {!hasChanges && (
                            <p className="text-center text-[10px] text-slate-400 font-medium mt-2">No changes to save.</p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherProfile;
