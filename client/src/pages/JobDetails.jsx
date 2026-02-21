import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Share2, ChevronLeft } from 'lucide-react';

const JobDetails = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Job Description');

    // Mock data for the specific Google LLC UI/UX Designer job
    const job = {
        title: 'UI/UX Designer',
        company: 'Google LLC',
        location: 'California, United States',
        salary: '$10,000 - $25,000 /month',
        types: ['Full Time', 'Onsite'],
        posted: 'Posted 10 days ago, ends in 31 Dec.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
        description: [
            'Able to run design sprint to deliver the best user experience based on research.',
            'Able to lead a team, delegate, & initiative.',
            'Able to mold the junior designer to strategize how certain feature needs to be collected.',
            'Able to aggregate and be data minded on the decision that\'s taking place.'
        ],
        qualifications: [
            'Bachelor\'s degree in Design, HCI, or related field.',
            '3+ years of experience in product design.',
            'Proficiency with Figma, Sketch, or Adobe XD.',
            'Strong portfolio demonstrating systemic design thinking.'
        ],
        perks: [
            'Comprehensive health insurance plans.',
            'Generous 401(k) matching.',
            'Unlimited paid time off.',
            'Free meals and snacks on campus.'
        ]
    };

    const tabs = ['Job Description', 'Minimum Qualifications', 'Perks & Benefits'];

    return (
        <div className="min-h-screen md:min-h-0 bg-white md:rounded-[32px] md:border md:border-slate-100 md:shadow-sm pb-24 md:pb-8 font-sans w-full max-w-lg mx-auto md:max-w-2xl md:my-8 md:overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-5 pt-4 pb-4 bg-white sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-1.5 -ml-1 text-[#1c1c1e] hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center">
                    <ArrowLeft className="w-[22px] h-[22px]" strokeWidth={1.5} />
                </button>
                <div className="flex items-center gap-0.5">
                    <button className="p-2 text-[#1c1c1e] hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center">
                        <Bookmark className="w-[22px] h-[22px]" strokeWidth={1.5} />
                    </button>
                    <button className="p-2 text-[#1c1c1e] hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center">
                        <Share2 className="w-[20px] h-[20px]" strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="px-5">
                {/* Job Header Card */}
                <div className="bg-white rounded-[32px] p-6 pt-6 pb-8 flex flex-col items-center border border-[#F1F3F5] shadow-[0px_4px_32px_rgba(0,0,0,0.03)] mb-8 text-center mx-1 mt-2">
                    <div className="w-[64px] h-[64px] bg-white rounded-2xl flex items-center justify-center border border-[#F1F3F5] shadow-sm mb-4 p-2.5">
                        <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                    </div>

                    <h1 className="text-[20px] font-bold text-[#1C1C1E] mb-1">{job.title}</h1>
                    <p className="text-[14px] font-semibold text-[#2563EB] mb-6">{job.company}</p>

                    <div className="w-[85%] h-px bg-[#F1F3F5] mb-6"></div>

                    <p className="text-[14px] font-medium text-[#6B7280] mb-3">{job.location}</p>
                    <p className="text-[16px] font-semibold text-[#2563EB] mb-5 tracking-tight">{job.salary}</p>

                    <div className="flex gap-2.5 mb-5 justify-center">
                        {job.types.map((type, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-[10px] border border-[#E5E7EB] text-[#6B7280] text-[11px] font-semibold">
                                {type}
                            </span>
                        ))}
                    </div>

                    <p className="text-[12px] text-[#9CA3AF] font-medium">{job.posted}</p>
                </div>

                {/* Tabs */}
                {/* Changed layout of tabs to exactly mimic the screenshot layout */}
                <div className="flex w-full overflow-x-auto no-scrollbar mb-7 relative z-0">
                    <div className="absolute bottom-[2px] left-0 right-0 h-px bg-[#F1F3F5] z-[-1]"></div>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap pb-3.5 px-1 mr-6 text-[14px] font-bold transition-colors relative ${activeTab === tab ? 'text-[#2563EB]' : 'text-[#9CA3AF]'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2563EB] rounded-t-lg" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="px-1 min-h-[180px]">
                    <h2 className="text-[15px] font-bold text-[#1C1C1E] mb-4">{activeTab}:</h2>
                    <ul className="space-y-2.5">
                        {(activeTab === 'Job Description' ? job.description : activeTab === 'Minimum Qualifications' ? job.qualifications : job.perks).map((item, index) => (
                            <li key={index} className="flex items-start text-[13.5px] text-[#4B5563] leading-[1.6] font-medium tracking-tight">
                                <span className="mr-2 text-[#9CA3AF] font-bold mt-[-1px] text-lg">·</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>

            {/* Bottom Apply Button (Fixed on mobile with gradient overlay) */}
            <div className="fixed bottom-0 left-0 right-0 p-5 pb-safe z-50 md:relative md:mt-8 md:p-0 md:px-5 w-full max-w-lg mx-auto md:max-w-2xl pt-6 bg-gradient-to-t from-white via-white to-transparent">
                <button className="w-full bg-[#1e5af3] hover:bg-blue-700 text-white font-bold py-3.5 rounded-full text-[15px] shadow-[0px_8px_20px_rgba(37,99,235,0.25)] transition-all active:scale-[0.98]">
                    Apply
                </button>
            </div>
        </div>
    );
};

export default JobDetails;
