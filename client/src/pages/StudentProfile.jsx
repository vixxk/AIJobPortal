import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import SmartImage from '../components/ui/SmartImage';
import {
    User, Mail, GraduationCap, Briefcase, FileText, Plus, X, UploadCloud, CheckCircle,
    Settings, ChevronLeft, Trash2, Edit2, ChevronDown, Check,
    Award, FileBadge, Globe, Link, Heart, Phone, BookOpen, Star, DollarSign, Home
} from 'lucide-react';
const icons = {
    BASIC: <User className="w-5 h-5 text-blue-500" />,
    CONTACT: <User className="w-5 h-5 text-blue-500" />,
    SUMMARY: <FileText className="w-5 h-5 text-blue-500" />,
    SALARY: <DollarSign className="w-5 h-5 text-blue-500" />,
    EXPERIENCE: <Briefcase className="w-5 h-5 text-blue-500" />,
    EDUCATION: <GraduationCap className="w-5 h-5 text-blue-500" />,
    PROJECTS: <Star className="w-5 h-5 text-blue-500" />,
    CERTIFICATIONS: <FileBadge className="w-5 h-5 text-blue-500" />,
    EXAMS: <BookOpen className="w-5 h-5 text-blue-500" />,
    AWARDS: <Award className="w-5 h-5 text-blue-500" />,
    SEMINARS: <User className="w-5 h-5 text-blue-500" />,
    ORGANIZATIONS: <Globe className="w-5 h-5 text-blue-500" />,
    LANGUAGES: <Globe className="w-5 h-5 text-blue-500" />,
    SKILLS: <Star className="w-5 h-5 text-blue-500" />,
    AFFILIATIONS: <Link className="w-5 h-5 text-blue-500" />,
    REFERENCES: <User className="w-5 h-5 text-blue-500" />,
    RESUME: <FileText className="w-5 h-5 text-blue-500" />,
    SETTINGS: <Settings className="w-5 h-5 text-blue-500" />,
    STATUS: <User className="w-5 h-5 text-blue-500" />,
};
const Input = ({ label, type = 'text', value, onChange, placeholder, disabled, icon, onKeyDown }) => (
    <div className="mb-3">
        {label && <label className="block text-[13px] font-semibold text-slate-600 mb-1 ml-1">{label}</label>}
        <div className="relative">
            {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <input
                type={type}
                value={value || ''}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full py-2 px-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] ${icon ? 'pl-11' : ''}`}
            />
        </div>
    </div>
);
const Select = ({ label, value, onChange, options }) => (
    <div className="mb-3 relative">
        {label && <label className="block text-[13px] font-semibold text-slate-600 mb-1 ml-1">{label}</label>}
        <div className="relative">
            <select
                value={value || ''}
                onChange={onChange}
                className="w-full py-2 px-3 pr-10 bg-white border border-slate-200 rounded-2xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] appearance-none"
            >
                <option value="" disabled>Select options...</option>
                {options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
    </div>
);
const Textarea = ({ label, value, onChange, placeholder, rows = 4, maxLength }) => (
    <div className="mb-3 relative">
        {label && <label className="block text-[13px] font-semibold text-slate-600 mb-1 ml-1">{label}</label>}
        <textarea
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className="w-full py-2 px-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-medium text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
        />
    </div>
);
const Checkbox = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer mb-3 p-1">
        <div className={`w-5 h-5 rounded flex justify-center items-center transition-all ${checked ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/30' : 'bg-white border-2 border-slate-300'}`}>
            {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
        <span className="text-[13px] font-medium text-slate-700">{label}</span>
        <input type="checkbox" checked={checked || false} onChange={(e) => onChange(e.target.checked)} className="hidden" />
    </label>
);
const DatePicker = ({ label, value, onChange }) => (
    <div className="mb-3 flex-1 min-w-0">
        {label && <label className="block text-[13px] font-semibold text-slate-600 mb-1 ml-1 truncate">{label}</label>}
        <div className="relative">
            <input
                type="date"
                value={value ? value.substring(0, 10) : ''}
                onChange={onChange}
                className="w-full py-2 px-2 sm:px-3 bg-white border border-slate-200 rounded-2xl text-[12px] sm:text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] min-w-0"
            />
        </div>
    </div>
);
const StudentProfile = () => {
    const { user, refreshUser } = useAuth();
    const { section } = useParams();
    const navigate = useNavigate();
    const currentView = section ? section.toUpperCase() : 'MAIN';
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editIndex, setEditIndex] = useState(-1);
    const [localItem, setLocalItem] = useState({});
    useEffect(() => {
        fetchProfile();
        const handleOpenSettings = () => {
            navigate('/app/profile/settings');
        };
        window.addEventListener('open-settings', handleOpenSettings);
        return () => window.removeEventListener('open-settings', handleOpenSettings);
    }, [navigate]);
    useEffect(() => {
        const handleBack = () => {
            if (editIndex !== -1) {
                setEditIndex(-1);
            } else {
                navigate('/app/profile');
            }
        };
        window.addEventListener('back-to-profile-main', handleBack);
        return () => window.removeEventListener('back-to-profile-main', handleBack);
    }, [editIndex, navigate]);
    useEffect(() => {
        let title = null;
        let backEvent = null;
        if (currentView !== 'MAIN') {
            const titles = {
                'BASIC': 'Edit Profile',
                'CONTACT': 'Contact Information',
                'SUMMARY': 'Summary',
                'SALARY': 'Expected Salary',
                'CERTIFICATIONS': 'Certification and Licenses',
                'EXAMS': 'Professional Exams',
                'AWARDS': 'Awards & Achievements',
                'SEMINARS': 'Seminars & Trainings',
                'ORGANIZATIONS': 'Organization Activities',
                'LANGUAGES': 'Languages',
                'SKILLS': 'Skills',
                'AFFILIATIONS': 'Affiliations',
                'REFERENCES': 'References',
                'EXPERIENCE': 'Work Experience',
                'EDUCATION': 'Education',
                'PROJECTS': 'Projects',
                'STATUS': 'Job Seeking Status',
                'RESUME': 'CV/Resume',
                'SETTINGS': 'Settings'
            };
            title = titles[currentView];
            if (editIndex !== -1 && title !== 'Settings' && title !== 'Edit Profile') {
            }
            if (window.innerWidth < 1024) {
                backEvent = 'back-to-profile-main';
            }
        }
        window.dispatchEvent(new CustomEvent('set-custom-header', {
            detail: { title, backEvent }
        }));
        return () => {
            window.dispatchEvent(new CustomEvent('set-custom-header', {
                detail: { title: null, backEvent: null }
            }));
        };
    }, [currentView, editIndex]);
    const fetchProfile = async () => {
        try {
            const res = await axios.get('/student/me');
            if (res.data.success || res.data.status === 'success') {
                if (res.data.data && res.data.data.profile) {
                    setProfile(res.data.data.profile);
                }
            }
        } catch (error) {
            console.error('Profile not found or error loading:', error);
        } finally {
            setLoading(false);
        }
    };
    const saveProfile = async (updates) => {
        setSaving(true);
        try {
            const res = await axios.post('/student/profile', updates);
            if (res.data.status === 'success') {
                setProfile(res.data.data.profile);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };
    const NavButton = ({ sectionKey, label }) => (
        <div
            onClick={() => {
                navigate(`/app/profile/${sectionKey.toLowerCase()}`);
                setEditIndex(-1);
            }}
            className="flex items-center justify-between p-3 mb-2 border border-slate-200 bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer hover:border-blue-200 hover:shadow-md active:scale-95 transition-all"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    {icons[sectionKey]}
                </div>
                <span className="font-semibold text-slate-800 text-[15px]">{label}</span>
            </div>
            <Plus className="w-5 h-5 text-blue-500" />
        </div>
    );
    const NavButtonDesktop = ({ sectionKey, label }) => (
        <div
            onClick={() => {
                navigate(`/app/profile/${sectionKey.toLowerCase()}`);
                setEditIndex(-1);
            }}
            className={`flex items-center justify-between p-3.5 mb-1.5 rounded-2xl cursor-pointer transition-all ${currentView === sectionKey ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20' : 'hover:bg-slate-50 text-slate-700 font-medium'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${currentView === sectionKey ? 'bg-white/20' : 'bg-slate-100/80 shadow-sm border border-slate-200/50'}`}>
                    {React.cloneElement(icons[sectionKey], { className: `w-4 h-4 ${currentView === sectionKey ? 'text-white' : 'text-slate-500'}` })}
                </div>
                <span className="text-[14px]">{label}</span>
            </div>
            <ChevronLeft className={`w-4 h-4 rotate-180 transition-opacity ${currentView === sectionKey ? 'text-white/70 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`} />
        </div>
    );
    const calculateCompletion = () => {
        let score = 0;
        if (profile.firstName && profile.lastName) score += 10;
        if (profile.currentPosition) score += 5;
        if (profile.address && profile.phoneNumber && profile.email) score += 10;
        if (profile.summary) score += 10;
        if (profile.profileImage) score += 10;
        if (profile.expectedSalary?.minimum || profile.expectedSalary?.maximum) score += 5;
        if (profile.skills?.length > 0) score += 10;
        if (profile.education?.length > 0) score += 10;
        if (profile.experience?.length > 0) score += 10;
        if (profile.resumeUrl) score += 10;
        if (profile.jobSeekingStatus) score += 10;
        return Math.min(100, score);
    };
    const handleUpdateField = (field, value) => {
        setProfile({ ...profile, [field]: value });
    };
    const handleUpdateItem = (field, value) => {
        setLocalItem({ ...localItem, [field]: value });
    };
    const saveItemToList = async (listName) => {
        const list = [...(profile[listName] || [])];
        if (editIndex >= 0 && editIndex < list.length) {
            list[editIndex] = localItem;
        } else {
            list.push(localItem);
        }
        await saveProfile({ [listName]: list });
        setEditIndex(-1);
    };
    const deleteItemFromList = async (listName) => {
        const list = [...(profile[listName] || [])];
        if (editIndex >= 0 && editIndex < list.length) {
            list.splice(editIndex, 1);
            await saveProfile({ [listName]: list });
            setEditIndex(-1);
        }
    };
    const renderBasicEdit = () => (
        <div className="p-4 md:px-8 md:py-4 lg:p-8 flex flex-col h-[calc(100dvh-150px)] lg:h-full bg-slate-50 lg:bg-transparent md:max-w-2xl lg:max-w-none md:mx-auto w-full overflow-hidden">
            <div className="flex justify-center mb-6">
                <div className="relative w-24 h-24">
                    <SmartImage
                        src={profile.profileImage || user?.avatar}
                        alt="Avatar"
                        containerClassName="w-24 h-24 rounded-full border-4 border-white shadow-md relative z-10"
                        className={saving ? 'opacity-50' : 'opacity-100'}
                        fallbackIcon={() => (
                            user?.role === 'RECRUITER' ? (
                                <div className={`w-full h-full bg-indigo-500 flex items-center justify-center text-white text-3xl font-bold ${saving ? 'opacity-50' : 'opacity-100'}`}>
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
                                </div>
                            ) : (
                                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                            )
                        )}
                    />
                    <label className="absolute bottom-0 right-0 z-20 bg-blue-500 hover:bg-blue-600 active:scale-95 cursor-pointer p-1.5 rounded-xl border-2 border-white shadow-sm transition-all">
                        <input type="file" accept="image/*" className="hidden" disabled={saving} onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const fm = new FormData();
                                fm.append('image', file);
                                setSaving(true);
                                try {
                                    const res = await axios.patch('/student/profile/image', fm);
                                    if (res.data.status === 'success') {
                                        setProfile({ ...profile, profileImage: res.data.data.profileImage });
                                        if (refreshUser) await refreshUser();
                                    }
                                } catch (error) {
                                    console.error("Image upload error", error);
                                } finally { setSaving(false); }
                            }
                        }} />
                        <Edit2 className="w-4 h-4 text-white" />
                    </label>
                </div>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto hide-scrollbar pr-2 pb-16">
                <Input label="First Name" value={profile.firstName} onChange={e => handleUpdateField('firstName', e.target.value)} />
                <Input label="Middle Name" value={profile.middleName} onChange={e => handleUpdateField('middleName', e.target.value)} />
                <Input label="Last Name" value={profile.lastName} onChange={e => handleUpdateField('lastName', e.target.value)} />
                <Input label="Current Position" value={profile.currentPosition} onChange={e => handleUpdateField('currentPosition', e.target.value)} />
            </div>
            <button onClick={() => saveProfile(profile)} className="w-full py-2.5 shrink-0 mt-2 bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl text-white font-bold shadow-md shadow-blue-500/20 transition-all">Save</button>
        </div>
    );
    const renderContact = () => (
        <div className="p-4 md:px-8 md:py-4 lg:p-8 flex flex-col h-[calc(100dvh-150px)] lg:h-full bg-slate-50 lg:bg-transparent md:max-w-2xl lg:max-w-none md:mx-auto w-full overflow-hidden">
            <div className="flex-1 space-y-1 overflow-y-auto hide-scrollbar pr-2 pb-16">
                <Input label="Address" value={profile.address} onChange={e => handleUpdateField('address', e.target.value)} icon={<Globe className="w-4 h-4" />} />
                <Input label="Phone Number" value={profile.phoneNumber} onChange={e => handleUpdateField('phoneNumber', e.target.value)} icon={<Phone className="w-4 h-4" />} />
                <Input label="Email" value={profile.email || user?.email} onChange={e => handleUpdateField('email', e.target.value)} icon={<Mail className="w-4 h-4" />} />
            </div>
            <button onClick={() => saveProfile(profile)} className="w-full py-2.5 shrink-0 mt-2 bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl text-white font-bold shadow-md shadow-blue-500/20 transition-all">Save</button>
        </div>
    );
    const renderSummary = () => (
        <div className="p-4 md:px-8 md:py-4 lg:p-8 flex flex-col h-[calc(100dvh-150px)] lg:h-full bg-slate-50 lg:bg-transparent md:max-w-2xl lg:max-w-none md:mx-auto w-full overflow-hidden">
            <div className="flex-1 space-y-1 overflow-y-auto hide-scrollbar pr-2 pb-16">
                <Textarea label="Summary (Max. 500 characters)" maxLength={500} rows={10} value={profile.summary} onChange={e => handleUpdateField('summary', e.target.value)} />
            </div>
            <button onClick={() => saveProfile(profile)} className="w-full py-2.5 shrink-0 mt-2 bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl text-white font-bold shadow-md shadow-blue-500/20 transition-all">Save</button>
        </div>
    );
    const renderSalary = () => (
        <div className="p-4 md:px-8 md:py-4 lg:p-8 flex flex-col h-[calc(100dvh-150px)] lg:h-full bg-slate-50 lg:bg-transparent md:max-w-2xl lg:max-w-none md:mx-auto w-full overflow-hidden">
            <div className="flex-1 space-y-1 overflow-y-auto hide-scrollbar pr-2 pb-16">
                <Input label="Minimum" type="number" value={profile.expectedSalary?.minimum} onChange={e => handleUpdateField('expectedSalary', { ...profile.expectedSalary, minimum: e.target.value })} />
                <Input label="Maximum" type="number" value={profile.expectedSalary?.maximum} onChange={e => handleUpdateField('expectedSalary', { ...profile.expectedSalary, maximum: e.target.value })} />
                <Select label="Currency" options={['USD', 'EUR', 'GBP', 'INR']} value={profile.expectedSalary?.currency} onChange={e => handleUpdateField('expectedSalary', { ...profile.expectedSalary, currency: e.target.value })} />
                <Select label="Frequency" options={['per hour', 'per month', 'per year']} value={profile.expectedSalary?.frequency} onChange={e => handleUpdateField('expectedSalary', { ...profile.expectedSalary, frequency: e.target.value })} />
            </div>
            <button onClick={() => saveProfile(profile)} className="w-full py-2.5 shrink-0 mt-2 bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl text-white font-bold shadow-md shadow-blue-500/20 transition-all">Save</button>
        </div>
    );
    const renderListOrForm = (listName, title, renderFormFields) => {
        const list = profile[listName] || [];
        if (editIndex === -1) {
            return (
                <div className="p-4 md:px-8 md:py-4 lg:p-8 flex flex-col h-[calc(100dvh-150px)] lg:h-full bg-slate-50 lg:bg-transparent md:max-w-2xl lg:max-w-none md:mx-auto w-full overflow-hidden">
                    <div className="flex justify-end mb-4">
                        <button className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-xl text-sm transition-all hover:bg-blue-100" onClick={() => { setLocalItem({}); setEditIndex(list.length); }}><Plus className="w-4 h-4" /> Add New</button>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto hide-scrollbar min-h-0">
                        {list.map((item, idx) => (
                            <div key={idx} onClick={() => { setLocalItem(item); setEditIndex(idx); }} className="p-5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-300 hover:shadow-md transition-all shadow-sm">
                                <h4 className="font-bold">{item.title || item.organization || item.topic || item.name || item.language}</h4>
                                <p className="text-sm text-slate-500">{item.company || item.issuer || item.organizer || item.publishingOrganization || item.role}</p>
                            </div>
                        ))}
                        {list.length === 0 && <p className="text-center text-slate-500 mt-10">No entries added yet.</p>}
                    </div>
                </div>
            );
        }
        return (
            <div className="p-4 md:px-8 md:py-4 lg:p-8 flex flex-col h-[calc(100dvh-150px)] lg:h-full bg-slate-50 lg:bg-transparent md:max-w-2xl lg:max-w-none md:mx-auto w-full overflow-hidden">
                <div className="flex-1 mt-1 overflow-y-auto hide-scrollbar pr-2 space-y-2 pb-4">
                    {renderFormFields()}
                </div>
                <div className="flex gap-3 shrink-0 mt-2">
                    {editIndex >= 0 && editIndex < list.length && (
                        <button onClick={() => deleteItemFromList(listName)} className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 active:scale-95 rounded-2xl font-bold transition-all shrink-0">
                            Delete
                        </button>
                    )}
                    <button onClick={() => saveItemToList(listName)} className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl text-white font-bold shadow-md shadow-blue-500/20 transition-all shrink-0">
                        Save
                    </button>
                </div>
            </div>
        );
    };
    const renderActiveForm = () => {
        switch (currentView) {
            case 'BASIC': return renderBasicEdit();
            case 'CONTACT': return renderContact();
            case 'SUMMARY': return renderSummary();
            case 'SALARY': return renderSalary();
            case 'CERTIFICATIONS':
                return renderListOrForm('certifications', 'Certification and Licenses', () => (
                    <>
                        <Input label="Title" value={localItem.title} onChange={e => handleUpdateItem('title', e.target.value)} />
                        <Input label="Publishing Organization" value={localItem.publishingOrganization} onChange={e => handleUpdateItem('publishingOrganization', e.target.value)} />
                        <div className="flex gap-2 sm:gap-4">
                            <DatePicker label="Date of Issue" value={localItem.dateOfIssue} onChange={e => handleUpdateItem('dateOfIssue', e.target.value)} />
                            <DatePicker label="Expiration Date" value={localItem.expirationDate} onChange={e => handleUpdateItem('expirationDate', e.target.value)} />
                        </div>
                        <Checkbox label="This credential will not expire" checked={localItem.doesNotExpire} onChange={v => handleUpdateItem('doesNotExpire', v)} />
                        <Input label="Credential ID (Optional)" value={localItem.credentialId} onChange={e => handleUpdateItem('credentialId', e.target.value)} />
                        <Input label="Credential URL (Optional)" value={localItem.credentialUrl} onChange={e => handleUpdateItem('credentialUrl', e.target.value)} />
                    </>
                ));
            case 'EXAMS':
                return renderListOrForm('professionalExams', 'Professional Exams', () => (
                    <>
                        <Input label="Title" value={localItem.title} onChange={e => handleUpdateItem('title', e.target.value)} />
                        <Input label="Score" value={localItem.score} onChange={e => handleUpdateItem('score', e.target.value)} />
                        <DatePicker label="Date Taken" value={localItem.dateTaken} onChange={e => handleUpdateItem('dateTaken', e.target.value)} />
                        <Textarea label="Description (Optional)" value={localItem.description} onChange={e => handleUpdateItem('description', e.target.value)} />
                    </>
                ));
            case 'AWARDS':
                return renderListOrForm('awards', 'Awards & Achievements', () => (
                    <>
                        <Input label="Title" value={localItem.title} onChange={e => handleUpdateItem('title', e.target.value)} />
                        <Input label="Issuer" value={localItem.issuer} onChange={e => handleUpdateItem('issuer', e.target.value)} />
                        <DatePicker label="Date Awarded" value={localItem.dateAwarded} onChange={e => handleUpdateItem('dateAwarded', e.target.value)} />
                        <Textarea label="Description (Optional)" value={localItem.description} onChange={e => handleUpdateItem('description', e.target.value)} />
                    </>
                ));
            case 'SEMINARS':
                return renderListOrForm('seminars', 'Seminars & Trainings', () => (
                    <>
                        <Input label="Topic" value={localItem.topic} onChange={e => handleUpdateItem('topic', e.target.value)} />
                        <Input label="Organizer" value={localItem.organizer} onChange={e => handleUpdateItem('organizer', e.target.value)} />
                        <div className="flex gap-2 sm:gap-4">
                            <DatePicker label="From" value={localItem.startDate} onChange={e => handleUpdateItem('startDate', e.target.value)} />
                            <DatePicker label="To" value={localItem.endDate} onChange={e => handleUpdateItem('endDate', e.target.value)} />
                        </div>
                        <Checkbox label="Current" checked={localItem.current} onChange={v => handleUpdateItem('current', v)} />
                        <Textarea label="Description (Optional)" value={localItem.description} onChange={e => handleUpdateItem('description', e.target.value)} />
                    </>
                ));
            case 'ORGANIZATIONS':
                return renderListOrForm('organizationActivities', 'Organization Activities', () => (
                    <>
                        <Input label="Organization" value={localItem.organization} onChange={e => handleUpdateItem('organization', e.target.value)} />
                        <Input label="Role" value={localItem.role} onChange={e => handleUpdateItem('role', e.target.value)} />
                        <div className="flex gap-2 sm:gap-4">
                            <DatePicker label="From" value={localItem.startDate} onChange={e => handleUpdateItem('startDate', e.target.value)} />
                            <DatePicker label="To" value={localItem.endDate} onChange={e => handleUpdateItem('endDate', e.target.value)} />
                        </div>
                        <Checkbox label="Still a member" checked={localItem.stillMember} onChange={v => handleUpdateItem('stillMember', v)} />
                        <Textarea label="Description (Optional)" value={localItem.description} onChange={e => handleUpdateItem('description', e.target.value)} />
                    </>
                ));
            case 'LANGUAGES':
                return renderListOrForm('languages', 'Languages', () => (
                    <>
                        <Input label="Language" value={localItem.language} onChange={e => handleUpdateItem('language', e.target.value)} />
                        <Select label="Proficiency" options={['Elementary Proficiency', 'Limited Working Proficiency', 'Professional Working Proficiency', 'Full Professional Proficiency', 'Native or Bilingual Proficiency']} value={localItem.proficiency} onChange={e => handleUpdateItem('proficiency', e.target.value)} />
                    </>
                ));
            case 'AFFILIATIONS':
                return renderListOrForm('affiliations', 'Affiliations', () => (
                    <>
                        <Input label="Organization" value={localItem.organization} onChange={e => handleUpdateItem('organization', e.target.value)} />
                        <Input label="Role" value={localItem.role} onChange={e => handleUpdateItem('role', e.target.value)} />
                        <div className="flex gap-2 sm:gap-4">
                            <DatePicker label="From" value={localItem.startDate} onChange={e => handleUpdateItem('startDate', e.target.value)} />
                            <DatePicker label="To" value={localItem.endDate} onChange={e => handleUpdateItem('endDate', e.target.value)} />
                        </div>
                        <Checkbox label="Current" checked={localItem.current} onChange={v => handleUpdateItem('current', v)} />
                        <Textarea label="Description (Optional)" value={localItem.description} onChange={e => handleUpdateItem('description', e.target.value)} />
                    </>
                ));
            case 'REFERENCES':
                return renderListOrForm('references', 'References', () => (
                    <>
                        <Input label="Name" value={localItem.name} onChange={e => handleUpdateItem('name', e.target.value)} />
                        <Input label="Company" value={localItem.company} onChange={e => handleUpdateItem('company', e.target.value)} />
                        <Input label="Occupation" value={localItem.occupation} onChange={e => handleUpdateItem('occupation', e.target.value)} />
                        <Input label="Email" value={localItem.email} onChange={e => handleUpdateItem('email', e.target.value)} icon={<Mail className="w-4 h-4" />} />
                        <Input label="Phone Number" value={localItem.phoneNumber} onChange={e => handleUpdateItem('phoneNumber', e.target.value)} icon={<Phone className="w-4 h-4" />} />
                    </>
                ));
            case 'EXPERIENCE':
                return renderListOrForm('experience', 'Work Experience', () => (
                    <>
                        <Input label="Title" value={localItem.position} onChange={e => handleUpdateItem('position', e.target.value)} />
                        <Input label="Company" value={localItem.company} onChange={e => handleUpdateItem('company', e.target.value)} />
                        <div className="flex gap-2 sm:gap-4">
                            <DatePicker label="From" value={localItem.startDate} onChange={e => handleUpdateItem('startDate', e.target.value)} />
                            <DatePicker label="To" value={localItem.endDate} onChange={e => handleUpdateItem('endDate', e.target.value)} />
                        </div>
                        <Checkbox label="Currently working here" checked={localItem.current} onChange={v => handleUpdateItem('current', v)} />
                        <Textarea label="Description" value={localItem.description} onChange={e => handleUpdateItem('description', e.target.value)} />
                    </>
                ));
            case 'EDUCATION':
                return renderListOrForm('education', 'Education', () => (
                    <>
                        <Input label="Institution" value={localItem.institution} onChange={e => handleUpdateItem('institution', e.target.value)} />
                        <Input label="Degree" value={localItem.degree} onChange={e => handleUpdateItem('degree', e.target.value)} />
                        <Input label="Field of Study" value={localItem.fieldOfStudy} onChange={e => handleUpdateItem('fieldOfStudy', e.target.value)} />
                        <div className="flex gap-2 sm:gap-4">
                            <DatePicker label="From" value={localItem.startDate} onChange={e => handleUpdateItem('startDate', e.target.value)} />
                            <DatePicker label="To" value={localItem.endDate} onChange={e => handleUpdateItem('endDate', e.target.value)} />
                        </div>
                    </>
                ));
            case 'PROJECTS':
                return renderListOrForm('projects', 'Projects', () => (
                    <>
                        <Input label="Title" value={localItem.title} onChange={e => handleUpdateItem('title', e.target.value)} />
                        <Input label="URL" value={localItem.url} onChange={e => handleUpdateItem('url', e.target.value)} />
                        <div className="flex gap-2 sm:gap-4">
                            <DatePicker label="Start Date" value={localItem.startDate} onChange={e => handleUpdateItem('startDate', e.target.value)} />
                            <DatePicker label="End Date" value={localItem.endDate} onChange={e => handleUpdateItem('endDate', e.target.value)} />
                        </div>
                        <Textarea label="Description" value={localItem.description} onChange={e => handleUpdateItem('description', e.target.value)} />
                    </>
                ));
            case 'STATUS':
                return (
                    <div className="p-4 md:px-8 md:py-4 lg:p-8 flex flex-col h-[calc(100dvh-150px)] lg:h-full bg-slate-50 lg:bg-transparent md:max-w-2xl lg:max-w-none md:mx-auto w-full overflow-hidden">
                        <div className="flex-1 space-y-4">
                            {['Actively looking for jobs', 'Passively looking for jobs', 'Not looking for jobs'].map(status => (
                                <label key={status} className="flex gap-4 p-4 border rounded-2xl cursor-pointer">
                                    <input type="radio" name="status" className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500" checked={profile.jobSeekingStatus === status} onChange={() => handleUpdateField('jobSeekingStatus', status)} />
                                    <div>
                                        <h4 className="font-bold text-slate-800">{status}</h4>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {status === 'Actively looking for jobs' ? 'I am actively looking for job right now, and I would like to accept job invitations.'
                                                : status === 'Passively looking for jobs' ? 'I\'m not looking for a job right now, but I am interested to accept job invitations.'
                                                    : 'I\'m not looking for a job right now, please don\'t send me job invitations.'}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <button onClick={() => saveProfile(profile)} className="w-full py-2.5 shrink-0 mt-2 bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl text-white font-bold shadow-md shadow-blue-500/20 transition-all">Save</button>
                    </div>
                );
            case 'SKILLS':
                return (
                    <div className="p-4 md:px-8 md:py-4 lg:p-8 flex flex-col h-[calc(100dvh-150px)] lg:h-full bg-slate-50 lg:bg-transparent md:max-w-2xl lg:max-w-none md:mx-auto w-full overflow-hidden">
                        <div className="flex-1">
                            <Input placeholder="Type here and press Enter" value={localItem.title || ''} onChange={e => handleUpdateItem('title', e.target.value)} onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value) {
                                    const s = e.target.value.trim();
                                    if (!profile.skills?.includes(s)) {
                                        handleUpdateField('skills', [...(profile.skills || []), s]);
                                    }
                                    handleUpdateItem('title', '');
                                }
                            }} />
                            <div className="flex flex-wrap gap-2 mt-4">
                                {(profile.skills || []).map((skill, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-full font-medium text-sm transition-all shadow-sm">
                                        {skill}
                                        <button onClick={() => {
                                            const newSkills = profile.skills.filter((_, i) => i !== idx);
                                            handleUpdateField('skills', newSkills);
                                        }}><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => saveProfile(profile)} className="w-full py-2.5 shrink-0 mt-2 bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl text-white font-bold shadow-md shadow-blue-500/20 transition-all">Save</button>
                    </div>
                );
            case 'RESUME':
                return (
                    <div className="p-4 md:px-8 md:py-4 lg:p-8 flex flex-col h-[calc(100dvh-150px)] lg:h-full bg-slate-50 lg:bg-transparent md:max-w-2xl lg:max-w-none md:mx-auto w-full overflow-hidden">
                        <div className="flex-1">
                            <p className="font-semibold mb-4">Upload CV/Resume</p>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-3xl p-6 bg-slate-50 relative">
                                <input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={async e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const fm = new FormData();
                                        fm.append('resume', file);
                                        setSaving(true);
                                        try {
                                            const { data } = await axios.post('/student/me/upload-resume', fm);
                                            if (data.success || data.status === 'success') {
                                                setProfile({ ...profile, resumeUrl: data.data.resumeUrl });
                                            }
                                        } finally { setSaving(false); }
                                    }
                                }} />
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4"><UploadCloud className="w-6 h-6 text-blue-600" /></div>
                                <span className="font-bold text-slate-700">Browse File</span>
                            </div>
                            {profile.resumeUrl && (
                                <div className="mt-3 flex items-center justify-between p-3 bg-red-50 rounded-2xl border border-red-100">
                                    <div className="flex gap-3 items-center">
                                        <FileText className="text-red-500 w-6 h-6" />
                                        <div>
                                            <p className="font-bold text-sm">Active Resume</p>
                                            <p className="text-xs text-slate-500">{profile.resumeUrl.substring(profile.resumeUrl.lastIndexOf('/') + 1) || 'document.pdf'}</p>
                                        </div>
                                    </div>
                                    <X className="w-5 h-5 text-red-500" />
                                </div>
                            )}
                        </div>
                        <button onClick={() => { if (window.innerWidth < 1024) navigate('/app/profile'); }} className="w-full py-2.5 shrink-0 mt-2 bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl text-white font-bold shadow-md shadow-blue-500/20 transition-all">Done</button>
                    </div>
                );
            case 'SETTINGS':
                return (
                    <div className="p-4 md:px-8 md:py-4 lg:p-8 flex flex-col h-[calc(100dvh-150px)] lg:h-full bg-slate-50 lg:bg-transparent md:max-w-2xl lg:max-w-none md:mx-auto w-full overflow-hidden">
                        <div className="flex-1 space-y-4 pt-1 overflow-y-auto hide-scrollbar pr-2 pb-16">
                            {user?.role !== 'RECRUITER' && (
                                <>
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl p-4 text-white shadow-lg flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center font-bold text-xl shrink-0">{calculateCompletion()}%</div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">Profile Completed!</h3>
                                            <p className="text-xs text-white/80 leading-tight">A complete profile increases the chances of a recruiter being more interested in recruiting you.</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-3xl p-2 cursor-pointer shadow-sm" onClick={() => navigate('/app/profile/status')}>
                                        <div className="flex justify-between items-center p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 border border-slate-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-slate-700" /></div>
                                                <span className="font-bold text-slate-800">Job Seeking Status</span>
                                            </div>
                                            <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
                                        </div>
                                    </div>
                                </>
                            )}
                            <div>
                                <h4 className="font-semibold text-slate-400 mb-2 pl-2 text-sm uppercase">General</h4>
                                <div className="bg-white rounded-3xl shadow-sm p-2 space-y-1 border border-slate-100/50">
                                    {[
                                        { l: 'Notification', i: <Award className="w-5 h-5" /> },
                                        { l: 'Security', i: <Award className="w-5 h-5" /> },
                                        { l: 'Language', i: <Globe className="w-5 h-5" />, v: 'English (US)' },
                                        { l: 'Application Issues', i: <Award className="w-5 h-5" /> },
                                        { l: 'Help Center', i: <User className="w-5 h-5" /> }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 cursor-pointer hover:bg-slate-50 transition-colors rounded-2xl" onClick={() => {
                                            if (item.l === 'Help Center') {
                                                navigate('/app/help');
                                            }
                                        }}>
                                            <div className="flex items-center gap-3">
                                                <div className="text-slate-500 p-1 bg-slate-50 rounded-xl">{item.i}</div>
                                                <span className="font-bold text-slate-800 text-[15px]">{item.l}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.v && <span className="text-slate-400 text-sm font-medium">{item.v}</span>}
                                                <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                break;
        }
        return null;
    };
    useEffect(() => {
        if (window.innerWidth >= 1024 && currentView === 'MAIN') {
            navigate('/app/profile/basic', { replace: true });
        }
    }, [currentView, navigate]);
    const currentViewRender = () => {
        return (
            <div className="w-full h-full lg:bg-slate-50 lg:h-full">
                <div className="lg:hidden h-full">
                    {currentView === 'MAIN' ? (
                        <div className="bg-slate-50 flex flex-col h-[calc(100dvh-140px)] overflow-hidden">
                            <div className="w-full flex flex-col h-full bg-slate-50">
                                <div className="px-4 flex-1 overflow-y-auto hide-scrollbar h-full pb-20">
                                    <div className="flex items-center justify-between mt-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <SmartImage
                                                src={profile.profileImage || user?.avatar}
                                                alt="User"
                                                containerClassName="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                                                fallbackIcon={() => (
                                                    user?.role === 'RECRUITER' ? (
                                                        <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
                                                        </div>
                                                    ) : (
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} alt="User" className="w-full h-full object-cover" />
                                                    )
                                                )}
                                            />
                                            <div>
                                                <h2 className="text-xl font-bold tracking-tight">{profile.firstName ? `${profile.firstName} ${profile.lastName}` : (user?.name || 'User Name')}</h2>
                                                <p className="text-slate-500 text-sm mt-0.5">{profile.currentPosition || (user?.role === 'RECRUITER' ? 'Recruiter' : 'Job Hunter @ Application')}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => navigate('/app/profile/basic')} className="w-9 h-9 flex items-center justify-center border border-blue-200 bg-white rounded-full shrink-0 shadow-sm hover:bg-slate-50 transition-colors">
                                            <Edit2 className="w-4 h-4 text-blue-500" />
                                        </button>
                                    </div>
                                    <NavButton sectionKey="CONTACT" label="Contact Information" />
                                    <NavButton sectionKey="SUMMARY" label={user?.role === 'RECRUITER' ? 'Company Details' : 'Summary'} />
                                    {user?.role !== 'RECRUITER' && (
                                        <>
                                            <NavButton sectionKey="SALARY" label="Expected Salary" />
                                            <NavButton sectionKey="EXPERIENCE" label="Work Experience" />
                                            <NavButton sectionKey="EDUCATION" label="Education" />
                                            <NavButton sectionKey="PROJECTS" label="Projects" />
                                            <NavButton sectionKey="CERTIFICATIONS" label="Certification and Licenses" />
                                            <NavButton sectionKey="EXAMS" label="Professional Exams" />
                                            <NavButton sectionKey="AWARDS" label="Awards & Achievements" />
                                            <NavButton sectionKey="SEMINARS" label="Seminars & Trainings" />
                                            <NavButton sectionKey="ORGANIZATIONS" label="Organization Activities" />
                                            <NavButton sectionKey="LANGUAGES" label="Languages" />
                                            <NavButton sectionKey="SKILLS" label="Skills" />
                                            <NavButton sectionKey="AFFILIATIONS" label="Affiliations" />
                                            <NavButton sectionKey="REFERENCES" label="References" />
                                            <NavButton sectionKey="RESUME" label="CV/Resume" />
                                        </>
                                    )}
                                    <NavButton sectionKey="SETTINGS" label="Settings" />
                                    {user?.role !== 'RECRUITER' && <NavButton sectionKey="STATUS" label="Job Seeking Status" />}
                                </div>
                            </div>
                        </div>
                    ) : (
                        renderActiveForm()
                    )}
                </div>
                <div className="hidden lg:flex max-w-[1400px] mx-auto w-full p-6 xl:p-8 gap-6 xl:gap-8 h-full shrink-0 min-h-0">
                    <div className="w-[340px] shrink-0 bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex flex-col items-center gap-4 bg-gradient-to-b from-blue-50/50 to-white text-center">
                            <div className="relative">
                                <SmartImage
                                    src={profile.profileImage || user?.avatar}
                                    alt="User"
                                    containerClassName="w-24 h-24 rounded-full border-4 border-white shadow-md relative z-10"
                                    fallbackIcon={() => (
                                        user?.role === 'RECRUITER' ? (
                                            <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white text-4xl font-bold">
                                                {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
                                            </div>
                                        ) : (
                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} alt="User" className="w-full h-full object-cover" />
                                        )
                                    )}
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-800">{profile.firstName ? `${profile.firstName} ${profile.lastName}` : (user?.name || 'User Name')}</h2>
                                <p className="text-slate-500 text-sm mt-1 font-medium">{profile.currentPosition || (user?.role === 'RECRUITER' ? 'Recruiter' : 'Job Hunter @ Application')}</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-2 px-3">Profile Details</h4>
                            <NavButtonDesktop sectionKey="BASIC" label={user?.role === 'RECRUITER' ? 'Recruiter Profile' : 'Edit Profile'} />
                            <NavButtonDesktop sectionKey="CONTACT" label="Contact Information" />
                            <NavButtonDesktop sectionKey="SUMMARY" label={user?.role === 'RECRUITER' ? 'Company Details' : 'Summary'} />
                            {user?.role !== 'RECRUITER' && (
                                <>
                                    <NavButtonDesktop sectionKey="SALARY" label="Expected Salary" />
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-3">Experience & Education</h4>
                                    <NavButtonDesktop sectionKey="EXPERIENCE" label="Work Experience" />
                                    <NavButtonDesktop sectionKey="EDUCATION" label="Education" />
                                    <NavButtonDesktop sectionKey="PROJECTS" label="Projects" />
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-3">Qualifications</h4>
                                    <NavButtonDesktop sectionKey="CERTIFICATIONS" label="Certification & Licenses" />
                                    <NavButtonDesktop sectionKey="EXAMS" label="Professional Exams" />
                                    <NavButtonDesktop sectionKey="AWARDS" label="Awards & Achievements" />
                                    <NavButtonDesktop sectionKey="SEMINARS" label="Seminars & Trainings" />
                                    <NavButtonDesktop sectionKey="ORGANIZATIONS" label="Organization Activities" />
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-3">Other Information</h4>
                                    <NavButtonDesktop sectionKey="LANGUAGES" label="Languages" />
                                    <NavButtonDesktop sectionKey="SKILLS" label="Skills" />
                                    <NavButtonDesktop sectionKey="AFFILIATIONS" label="Affiliations" />
                                    <NavButtonDesktop sectionKey="REFERENCES" label="References" />
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-3">System</h4>
                                    <NavButtonDesktop sectionKey="RESUME" label="CV/Resume" />
                                    <NavButtonDesktop sectionKey="STATUS" label="Job Seeking Status" />
                                </>
                            )}
                            {user?.role === 'RECRUITER' && <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-3">System</h4>}
                            <NavButtonDesktop sectionKey="SETTINGS" label="Settings" />
                        </div>
                    </div>
                    <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden">
                        <div className="p-6 xl:p-8 border-b border-slate-100 bg-white z-10 flex justify-between items-center">
                            <h2 className="text-[22px] font-bold text-slate-800 tracking-tight">
                                {editIndex !== -1 ? 'Edit Entry' :
                                    (currentView === 'BASIC' ? 'Edit Profile' :
                                        currentView === 'CONTACT' ? 'Contact Information' :
                                            currentView === 'SETTINGS' ? 'Settings' :
                                                currentView === 'RESUME' ? 'CV/Resume' :
                                                    currentView.charAt(0) + currentView.slice(1).toLowerCase())}
                            </h2>
                            {editIndex !== -1 && (
                                <button onClick={() => setEditIndex(-1)} className="text-sm font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors">
                                    Cancel
                                </button>
                            )}
                        </div>
                        <div className="flex-1 relative">
                            {renderActiveForm()}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    const ProfileSkeleton = () => (
        <div className="w-full h-full lg:bg-slate-50 flex flex-col lg:flex-row max-w-[1400px] mx-auto p-6 xl:p-8 gap-8 animate-pulse">
            <div className="hidden lg:flex w-[340px] shrink-0 bg-white rounded-3xl border border-slate-200/60 p-8 flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-100" />
                <div className="w-40 h-5 bg-slate-100 rounded" />
                <div className="w-24 h-3 bg-slate-50 rounded" />
                <div className="w-full mt-10 space-y-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="w-full h-10 bg-slate-50 rounded-xl" />
                    ))}
                </div>
            </div>
            <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 p-10 space-y-8">
                <div className="h-8 w-1/4 bg-slate-100 rounded mb-10" />
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-3">
                        <div className="h-4 w-20 bg-slate-50 rounded" />
                        <div className="h-12 w-full bg-slate-50 rounded-2xl" />
                    </div>
                ))}
            </div>
        </div>
    );

    if (loading) return <ProfileSkeleton />;
    return currentViewRender();
};
export default StudentProfile;
