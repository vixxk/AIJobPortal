import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { Mail, GraduationCap, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecruiterColleges = () => {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const res = await axios.get('/college');
                if (res.data.status === 'success') {
                    setColleges(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch colleges', error);
            } finally {
                setLoading(false);
            }
        };
        fetchColleges();
    }, []);

    const filtered = colleges.filter(c => 
        (c.collegeName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">College Connect</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Discover placement cells and invite top institutions for hiring.</p>
                </div>
                <input 
                    type="text" 
                    placeholder="Search by college or location..." 
                    className="w-full md:w-80 h-12 px-6 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-sm bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(college => (
                    <div key={college._id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-lg transition-all overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -z-0"></div>
                        
                        <div className="relative z-10 flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase truncate max-w-[180px]">{college.collegeName}</h3>
                                <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Building2 className="w-3 h-3" /> {college.location || 'Location varies'}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 mb-6 relative z-10">
                            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Available Students</p>
                                    <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-indigo-400" /> {college.studentStrength || 'N/A'}
                                    </h4>
                                </div>
                            </div>
                            
                            {college.courses?.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Major Courses</p>
                                    <div className="flex flex-wrap gap-2">
                                        {college.courses.slice(0, 3).map((course, idx) => (
                                            <span key={idx} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold">
                                                {course}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto relative z-10">
                            <a href={`mailto:${college.userId?.email}?subject=Invitation%20for%20Campus%20Hiring`} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest text-center hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-indigo-200">
                                <Mail className="w-4 h-4" /> Send Invite
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-20 text-center bg-white rounded-[32px] border border-slate-100">
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">No colleges found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default RecruiterColleges;
