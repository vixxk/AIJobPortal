import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { Mail, Briefcase, ExternalLink, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const CollegeCompanies = () => {
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRecruiters = async () => {
            try {
                const res = await axios.get('/recruiter');
                if (res.data.status === 'success') {
                    setRecruiters(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch companies', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecruiters();
    }, []);

    const filtered = recruiters.filter(r => 
        (r.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (r.companyDescription || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Search Companies</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Connect with {recruiters.length} recruiters and companies.</p>
                </div>
                <input 
                    type="text" 
                    placeholder="Search companies..." 
                    className="w-full md:w-80 h-12 px-6 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-sm bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(recruiter => (
                    <div key={recruiter._id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-lg transition-all overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -z-0"></div>
                        
                        <div className="relative z-10 flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-xl shadow-inner overflow-hidden border border-indigo-200 p-0.5">
                                {recruiter.logo ? (
                                    <img src={recruiter.logo} alt="Logo" className="w-full h-full object-cover rounded-[14px]" />
                                ) : (
                                    <span>{recruiter.companyName?.[0] || 'C'}</span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase truncate max-w-[180px]">{recruiter.companyName}</h3>
                                <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" /> Tech Industry
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 text-sm text-slate-500 mb-6 bg-slate-50 p-4 rounded-2xl">
                            <p className="line-clamp-3 font-medium">
                                {recruiter.companyDescription || "No description provided by the company."}
                            </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto relative z-10">
                            {recruiter.website ? (
                                <a href={recruiter.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-400 hover:text-indigo-600 transition-colors">
                                    <Globe className="w-3 h-3" /> Website
                                </a>
                            ) : (
                                <span className="text-[11px] font-bold text-slate-300 uppercase">No Website</span>
                            )}
                            
                            <Link to={`/app/college/emails?to=${recruiter.userId?.email}`} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase hover:bg-indigo-600 hover:text-white transition-all">
                                <Mail className="w-3 h-3" /> Connect
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-20 text-center bg-white rounded-[32px] border border-slate-100">
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">No companies found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default CollegeCompanies;
