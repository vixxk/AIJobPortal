import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { Briefcase, MapPin, DollarSign, List, Building } from 'lucide-react';
const PostJob = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        salary: '',
        type: 'Full-time',
        skills: '',
        experienceLevel: 'Entry Level'
    });
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
                skillsRequired: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                experienceRange: formData.experienceLevel,
                type: formData.type // This might not be in the model but it's good to keep if added later
            };
            const res = await axios.post('/jobs', payload);
            if (res.data.status === 'success') {
                navigate('/app/recruiter');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post job. Make sure your profile is approved.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Post a New Job</h1>
                <p className="text-slate-500 mt-1">Fill out the details below to publish an opening to students.</p>
            </div>
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
                                    <DollarSign className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g. $80k - $100k"
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
        </div>
    );
};
export default PostJob;
