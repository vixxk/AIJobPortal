import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { Briefcase, MapPin, IndianRupee, List, Building, Building2, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
const PostJob = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        salary: '',
        organization: '',
        type: 'Full-time',
        skills: '',
        experienceLevel: 'Entry Level',
        responsibilities: '',
        isSpecial: false,
        courseId: ''
    });
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/recruiter/me');
                if (res.data.status === 'success' && res.data.data.profile) {
                    setFormData(prev => ({
                        ...prev,
                        organization: res.data.data.profile.companyName || ''
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch recruiter profile', err);
            }
        };
        fetchProfile();

        const fetchCourses = async () => {
            try {
                const res = await axios.get('/courses');
                if (res.data.status === 'success') {
                    setCourses(res.data.data.courses || []);
                }
            } catch (err) {
                console.error('Failed to fetch courses', err);
            }
        };
        fetchCourses();
    }, []);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                location: formData.location,
                salaryRange: formData.salary,
                companyName: formData.organization,
                skillsRequired: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                responsibilities: formData.responsibilities.split('\n').map(s => s.trim()).filter(s => s),
                experienceRange: formData.experienceLevel,
                type: formData.type,
                isSpecial: formData.isSpecial,
                courseId: formData.isSpecial ? formData.courseId : undefined
            };
            const res = await axios.post('/jobs', payload);
            if (res.data.status === 'success') {
                setShowSuccessModal(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post job. Make sure your profile is approved.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Top heading removed as it is now displayed in the Topbar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                {error && (
                    <div className="p-4 mb-6 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Core Details</h3>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Title</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g. Frontend Developer"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Organization</label>
                            <div className="relative">
                                <Building2 className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="organization"
                                    required
                                    value={formData.organization}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="location"
                                        required
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="City, State, or Remote"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Salary Range</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g. ₹ 8L - 12L"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Contract">Contract</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Experience Level</label>
                                <select
                                    name="experienceLevel"
                                    value={formData.experienceLevel}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="Internship">Internship</option>
                                    <option value="Entry Level">Entry Level</option>
                                    <option value="Mid Level">Mid Level</option>
                                    <option value="Senior">Senior</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Requirements & Description</h3>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Required Skills (Comma separated)</label>
                            <div className="relative">
                                <List className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="skills"
                                    required
                                    value={formData.skills}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g. React, Node.js, Typescript"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Key Responsibilities (One per line)</label>
                            <textarea
                                name="responsibilities"
                                rows="4"
                                value={formData.responsibilities}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="e.g. Design user interfaces&#10;Develop core logic&#10;Collaborate with teams..."
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Description</label>
                            <textarea
                                name="description"
                                required
                                rows="6"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Describe the responsibilities and requirements of the role..."
                            ></textarea>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-500" />
                                Targeting Options
                            </h3>
                            <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Special Job Posting</p>
                                        <p className="text-[11px] text-slate-500 font-medium">Limit applications to students of a specific course</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={formData.isSpecial}
                                            onChange={(e) => setFormData({ ...formData, isSpecial: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {formData.isSpecial && (
                                    <div className="animate-in slide-in-from-top-2 duration-300">
                                        <label className="block text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 ml-1">Select Required Course</label>
                                        <select
                                            name="courseId"
                                            required={formData.isSpecial}
                                            value={formData.courseId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                                        >
                                            <option value="">Select a course...</option>
                                            {courses.map(course => (
                                                <option key={course._id} value={course._id}>{course.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button type="button" onClick={() => navigate('/app/recruiter')} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50">
                            {loading ? 'Posting...' : 'Publish Job'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="p-8 text-center space-y-6">
                            <div className="relative mx-auto w-20 h-20">
                                <div className="absolute inset-0 bg-emerald-100 rounded-[28px] animate-ping opacity-20" />
                                <div className="relative bg-emerald-50 rounded-[28px] w-full h-full flex items-center justify-center text-emerald-500">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Listing Transmitted</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                                    Your job listing has been sent to our <span className="text-indigo-600 font-bold">Admin Node</span> for verification and approval.
                                </p>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 text-left group">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</p>
                                    <p className="text-xs font-bold text-slate-700">Awaiting Authority Approval</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            </div>

                            <button 
                                onClick={() => navigate('/app/recruiter')}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 group"
                            >
                                BACK TO HUB
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default PostJob;
