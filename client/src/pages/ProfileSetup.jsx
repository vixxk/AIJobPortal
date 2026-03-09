import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const PHONE_CODES = [
    { code: 'AF', name: 'Afghanistan', dial: '+93', flag: '🇦🇫' },
    { code: 'AL', name: 'Albania', dial: '+355', flag: '🇦🇱' },
    { code: 'DZ', name: 'Algeria', dial: '+213', flag: '🇩🇿' },
    { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷' },
    { code: 'AM', name: 'Armenia', dial: '+374', flag: '🇦🇲' },
    { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
    { code: 'AT', name: 'Austria', dial: '+43', flag: '🇦🇹' },
    { code: 'AZ', name: 'Azerbaijan', dial: '+994', flag: '🇦🇿' },
    { code: 'BH', name: 'Bahrain', dial: '+973', flag: '🇧🇭' },
    { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
    { code: 'BY', name: 'Belarus', dial: '+375', flag: '🇧🇾' },
    { code: 'BE', name: 'Belgium', dial: '+32', flag: '🇧🇪' },
    { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
    { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
    { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
    { code: 'CO', name: 'Colombia', dial: '+57', flag: '🇨🇴' },
    { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬' },
    { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
    { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
    { code: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭' },
    { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
    { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
    { code: 'IR', name: 'Iran', dial: '+98', flag: '🇮🇷' },
    { code: 'IQ', name: 'Iraq', dial: '+964', flag: '🇮🇶' },
    { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪' },
    { code: 'IL', name: 'Israel', dial: '+972', flag: '🇮🇱' },
    { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
    { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
    { code: 'JO', name: 'Jordan', dial: '+962', flag: '🇯🇴' },
    { code: 'KZ', name: 'Kazakhstan', dial: '+7', flag: '🇰🇿' },
    { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
    { code: 'KW', name: 'Kuwait', dial: '+965', flag: '🇰🇼' },
    { code: 'LB', name: 'Lebanon', dial: '+961', flag: '🇱🇧' },
    { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
    { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
    { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
    { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
    { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
    { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴' },
    { code: 'OM', name: 'Oman', dial: '+968', flag: '🇴🇲' },
    { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
    { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
    { code: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱' },
    { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },
    { code: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦' },
    { code: 'RO', name: 'Romania', dial: '+40', flag: '🇷🇴' },
    { code: 'RU', name: 'Russia', dial: '+7', flag: '🇷🇺' },
    { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
    { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
    { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
    { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
    { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
    { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰' },
    { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪' },
    { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭' },
    { code: 'TW', name: 'Taiwan', dial: '+886', flag: '🇹🇼' },
    { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
    { code: 'TR', name: 'Turkey', dial: '+90', flag: '🇹🇷' },
    { code: 'UA', name: 'Ukraine', dial: '+380', flag: '🇺🇦' },
    { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪' },
    { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
    { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
    { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
];
const COUNTRIES = [
    'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria',
    'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Brazil', 'Canada', 'China',
    'Colombia', 'Egypt', 'Ethiopia', 'France', 'Germany', 'Ghana', 'India', 'Indonesia', 'Iran',
    'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait',
    'Lebanon', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway',
    'Oman', 'Pakistan', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
    'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden',
    'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'UAE', 'Ukraine', 'United Kingdom',
    'United States', 'Vietnam',
];
const EXPERTISES = [
    'Accounting and Finance',
    'Architecture and Engineering',
    'Information Technology and Software',
    'Management and Consultancy',
    'Media, Design, and Creatives',
    'Sales and Marketing',
    'Writing and Content',
];
const Toast = ({ message, type = 'error', onClose }) => (
    <div
        style={{
            position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, maxWidth: 360, width: '90%',
            background: type === 'error' ? '#fee2e2' : '#dcfce7',
            border: `1px solid ${type === 'error' ? '#fca5a5' : '#86efac'}`,
            borderRadius: 14, padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', gap: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            animation: 'slideDown 0.3s ease',
        }}
    >
        <span style={{ fontSize: 18 }}>{type === 'error' ? '⚠️' : '✅'}</span>
        <p style={{ flex: 1, margin: 0, fontSize: 14, color: type === 'error' ? '#991b1b' : '#166534', lineHeight: 1.4 }}>
            {message}
        </p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280', padding: 0 }}>✕</button>
    </div>
);
const ProfileSetup = () => {
    const { user, updateProfile, uploadAvatar } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [step, setStep] = useState(1);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [toast, setToast] = useState(null);
    const [phonePickerOpen, setPhonePickerOpen] = useState(false);
    const [phoneSearch, setPhoneSearch] = useState('');
    const [selectedDialCode, setSelectedDialCode] = useState(
        PHONE_CODES.find(p => p.code === 'US')
    );
    const [searchCountry, setSearchCountry] = useState('');
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        nickname: '',
        dateOfBirth: '',
        email: user?.email || '',
        phoneNumber: '',
        gender: '',
        expertise: [],
        country: '',
    });
    const [now] = useState(() => Date.now());
    const maxDob = useMemo(() => {
        return new Date(now - 13 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0];
    }, [now]);
    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showToast('Please select a valid image file (JPEG, PNG, WebP, GIF).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size must be less than 5 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);
        setAvatarLoading(true);
        const res = await uploadAvatar(file);
        setAvatarLoading(false);
        if (!res.success) {
            showToast(res.message || 'Failed to upload avatar.');
            setAvatarPreview(user?.avatar || null);
        } else {
            showToast('Profile photo updated!', 'success');
        }
    };
    const handleExpertiseToggle = (exp) => {
        const isSelected = formData.expertise.includes(exp);
        if (isSelected) {
            setFormData({ ...formData, expertise: formData.expertise.filter(e => e !== exp) });
        } else {
            if (formData.expertise.length < 5) {
                setFormData({ ...formData, expertise: [...formData.expertise, exp] });
            } else {
                showToast('You can select up to 5 areas of expertise.');
            }
        }
    };
    const handleStep1Continue = () => {
        if (!formData.nickname.trim()) {
            showToast('Please enter your nickname.');
            return;
        }
        if (!formData.dateOfBirth) {
            showToast('Please enter your date of birth.');
            return;
        }
        const dob = new Date(formData.dateOfBirth);
        const age = (new Date() - dob) / (365.25 * 24 * 3600 * 1000);
        if (age < 13) {
            showToast('You must be at least 13 years old.');
            return;
        }
        if (!formData.gender) {
            showToast('Please select your gender.');
            return;
        }
        setStep(2);
    };
    const handleStep2Continue = () => {
        if (formData.expertise.length === 0) {
            showToast('Please select at least one area of expertise.');
            return;
        }
        setStep(3);
    };
    const handleFinalSubmit = async () => {
        if (!formData.country) {
            showToast('Please select your country.');
            return;
        }
        setSubmitLoading(true);
        const phoneNum = formData.phoneNumber
            ? `${selectedDialCode.dial} ${formData.phoneNumber}`
            : '';
        const res = await updateProfile({
            nickname: formData.nickname,
            dateOfBirth: formData.dateOfBirth,
            phoneNumber: phoneNum,
            gender: formData.gender,
            country: formData.country,
            expertise: formData.expertise,
        });
        setSubmitLoading(false);
        if (res.success) {
            if (res.user.pendingApproval || res.user.approvalStatus === 'PENDING') {
                navigate('/pending-approval');
            } else {
                navigate('/app');
            }
        } else {
            showToast(res.message || 'Something went wrong. Please try again.');
        }
    };
    const filteredPhoneCodes = PHONE_CODES.filter(p =>
        p.name.toLowerCase().includes(phoneSearch.toLowerCase()) ||
        p.dial.includes(phoneSearch)
    );
    const filteredCountries = COUNTRIES.filter(c =>
        c.toLowerCase().includes(searchCountry.toLowerCase())
    );
    const renderStep1 = () => (
        <div className="flex flex-col animate-fadeIn min-h-screen bg-white">
            <div className="flex items-center p-6 pb-2">
                <button className="mr-4 p-1" onClick={() => navigate('/login')} id="back-to-login-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 19L8 12L15 5" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <h1 className="text-[22px] font-bold text-gray-900">Fill Your Profile</h1>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-32">
                <div className="flex justify-center mt-6 mb-8 relative">
                    <div
                        className="w-[120px] h-[120px] bg-gray-100 rounded-full flex items-center justify-center overflow-hidden cursor-pointer relative"
                        onClick={handleAvatarClick}
                        id="avatar-upload-area"
                    >
                        {avatarLoading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full z-10">
                                <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                    <path d="M12 2a10 10 0 0 1 10 10" />
                                </svg>
                            </div>
                        )}
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="#d1d5db">
                                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12ZM12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" />
                            </svg>
                        )}
                    </div>
                    <button
                        className="absolute bottom-0 bg-blue-600 w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition"
                        style={{ left: 'calc(50% + 28px)' }}
                        onClick={handleAvatarClick}
                        id="edit-avatar-btn"
                        type="button"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleAvatarChange}
                        id="avatar-file-input"
                    />
                </div>
                <div className="space-y-4 text-[14px]">
                    <div className="relative">
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            readOnly={!!user?.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="w-full bg-gray-50 text-gray-800 px-5 py-4 rounded-2xl focus:outline-none"
                            id="fullname-input"
                        />
                        {user?.name && (
                            <svg className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        )}
                    </div>
                    <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        placeholder="Nickname *"
                        className="w-full bg-gray-50 text-gray-800 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                        id="nickname-input"
                    />
                    <div className="relative">
                        <label className="absolute left-5 top-[10px] text-[10px] text-gray-400 font-medium uppercase tracking-wide">Date of Birth *</label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            max={maxDob}
                            className="w-full bg-gray-50 text-gray-800 px-5 pt-7 pb-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none"
                            id="dob-input"
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            readOnly={!!user?.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="w-full bg-gray-50 text-gray-800 px-5 py-4 rounded-2xl focus:outline-none"
                            id="email-input"
                        />
                        <svg className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    </div>
                    <div className="relative">
                        <div className="flex items-center bg-gray-50 rounded-2xl px-3 focus-within:ring-2 ring-blue-100">
                            <button
                                type="button"
                                id="phone-country-btn"
                                onClick={() => { setPhonePickerOpen(!phonePickerOpen); setPhoneSearch(''); }}
                                className="flex items-center mr-2 border-r border-gray-200 pr-3 py-4 gap-1 flex-shrink-0"
                            >
                                <span className="text-xl">{selectedDialCode.flag}</span>
                                <span className="text-[13px] text-gray-600 font-medium">{selectedDialCode.dial}</span>
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" strokeWidth="2">
                                    <path d={phonePickerOpen ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4'} />
                                </svg>
                            </button>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/[^0-9\s\-()]/g, '') })}
                                placeholder="000 000 0000"
                                className="w-full bg-transparent text-gray-800 py-4 focus:outline-none text-[14px]"
                                id="phone-input"
                            />
                        </div>
                        {phonePickerOpen && (
                            <div
                                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                                style={{ maxHeight: 260 }}
                                id="phone-country-dropdown"
                            >
                                <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        <input
                                            type="text"
                                            value={phoneSearch}
                                            onChange={(e) => setPhoneSearch(e.target.value)}
                                            placeholder="Search country..."
                                            className="w-full bg-gray-50 text-gray-800 pl-10 pr-4 py-2 rounded-xl text-[13px] focus:outline-none"
                                            autoFocus
                                            id="phone-search-input"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
                                    {filteredPhoneCodes.length === 0 ? (
                                        <p className="text-center text-gray-400 text-[13px] py-4">No results</p>
                                    ) : filteredPhoneCodes.map((p) => (
                                        <button
                                            key={p.code}
                                            type="button"
                                            onClick={() => { setSelectedDialCode(p); setPhonePickerOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition text-[14px] ${selectedDialCode.code === p.code ? 'bg-blue-50/60' : ''}`}
                                        >
                                            <span className="text-xl">{p.flag}</span>
                                            <span className="flex-1 text-gray-700">{p.name}</span>
                                            <span className="text-gray-400 text-[13px]">{p.dial}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className={`w-full bg-gray-50 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none ${formData.gender ? 'text-gray-800' : 'text-gray-400'}`}
                            id="gender-select"
                        >
                            <option value="" disabled hidden>Gender *</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        <svg className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" strokeWidth="2">
                            <path d="M4 6l4 4 4-4" />
                        </svg>
                    </div>
                </div>
            </div>
            {phonePickerOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setPhonePickerOpen(false)} />
            )}
            <div className="fixed bottom-0 w-full p-6 bg-white border-t border-gray-100 max-w-[480px] mx-auto left-0 right-0 z-10">
                <button
                    id="step1-continue-btn"
                    onClick={handleStep1Continue}
                    className="w-full bg-blue-600 text-white font-semibold py-4 rounded-[100px] shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:bg-blue-700 active:scale-[0.98] transition"
                >
                    Continue
                </button>
            </div>
        </div>
    );
    const renderStep2 = () => (
        <div className="flex flex-col animate-fadeIn min-h-screen bg-white">
            <div className="flex items-center p-6 pb-2">
                <button className="mr-4 p-1" onClick={() => setStep(1)} id="back-to-step1-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 19L8 12L15 5" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-32">
                <h1 className="text-[28px] font-bold text-gray-900 mb-1">What is Your Expertise?</h1>
                <p className="text-gray-500 mb-8 text-[15px]">
                    Select your field(s) of expertise&nbsp;
                    <span className={`font-semibold ${formData.expertise.length === 5 ? 'text-orange-500' : 'text-blue-600'}`}>
                        ({formData.expertise.length}/5)
                    </span>
                </p>
                <div className="space-y-3">
                    {EXPERTISES.map((exp, idx) => {
                        const isSelected = formData.expertise.includes(exp);
                        const isDisabled = !isSelected && formData.expertise.length >= 5;
                        return (
                            <div
                                key={idx}
                                id={`expertise-${idx}`}
                                onClick={() => !isDisabled && handleExpertiseToggle(exp)}
                                className={`flex items-center border-2 p-5 rounded-2xl transition-all duration-200
                                    ${isSelected
                                        ? 'border-blue-600 bg-blue-50/40'
                                        : isDisabled
                                            ? 'border-gray-100 opacity-50 cursor-not-allowed'
                                            : 'border-gray-100 cursor-pointer hover:border-blue-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-[5px] flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${isSelected ? 'bg-blue-600' : 'border-2 border-gray-300'}`}>
                                    {isSelected && (
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-[15px] leading-snug ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700 font-medium'}`}>
                                    {exp}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="fixed bottom-0 w-full p-6 bg-white border-t border-gray-100 max-w-[480px] mx-auto left-0 right-0 z-10">
                <button
                    id="step2-continue-btn"
                    onClick={handleStep2Continue}
                    className={`w-full text-white font-semibold py-4 rounded-[100px] shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition active:scale-[0.98] ${formData.expertise.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                >
                    Continue
                </button>
            </div>
        </div>
    );
    const renderStep3 = () => (
        <div className="flex flex-col animate-fadeIn min-h-screen bg-white">
            <div className="flex items-center p-6 pb-2">
                <button className="mr-4 p-1" onClick={() => setStep(2)} id="back-to-step2-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 19L8 12L15 5" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <h1 className="text-[22px] font-bold text-gray-900">Your Country</h1>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-32">
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchCountry}
                        onChange={(e) => setSearchCountry(e.target.value)}
                        placeholder="Search country..."
                        className="w-full bg-gray-50 text-gray-800 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder-gray-400"
                        id="country-search-input"
                    />
                </div>
                <div className="space-y-5">
                    {filteredCountries.length === 0 ? (
                        <p className="text-center text-gray-400 text-[14px] py-8">No countries found</p>
                    ) : filteredCountries.map((c, idx) => {
                        const isSelected = formData.country === c;
                        return (
                            <div
                                key={idx}
                                id={`country-${c.replace(/\s+/g, '-').toLowerCase()}`}
                                onClick={() => setFormData({ ...formData, country: c })}
                                className="flex items-center cursor-pointer group"
                            >
                                <div className={`w-[22px] h-[22px] rounded-full border-[2.5px] flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${isSelected ? 'border-blue-600' : 'border-gray-300 group-hover:border-blue-300'}`}>
                                    {isSelected && <div className="w-[10px] h-[10px] rounded-full bg-blue-600" />}
                                </div>
                                <span className={`text-[15px] font-medium transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-800 group-hover:text-gray-900'}`}>
                                    {c}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="fixed bottom-0 w-full p-6 bg-white border-t border-gray-100 max-w-[480px] mx-auto left-0 right-0 z-10">
                <button
                    id="complete-profile-btn"
                    onClick={handleFinalSubmit}
                    disabled={!formData.country || submitLoading}
                    className={`w-full text-white font-semibold py-4 rounded-[100px] shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition active:scale-[0.98] ${formData.country && !submitLoading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                >
                    {submitLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                <path d="M12 2a10 10 0 0 1 10 10" />
                            </svg>
                            Saving…
                        </span>
                    ) : 'Complete Profile'}
                </button>
            </div>
        </div>
    );
    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="w-full max-w-[480px] mx-auto bg-white min-h-screen relative shadow-sm">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </>
    );
};
export default ProfileSetup;
