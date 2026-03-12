import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, SlidersHorizontal, ArrowLeft, MessageSquare } from 'lucide-react';
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 mb-3 cursor-pointer transition-all hover:border-blue-100" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-[15px]">{question}</h4>
                <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="mt-3 text-sm text-slate-500 leading-relaxed pr-6">
                    {answer}
                </div>
            )}
        </div>
    );
};
const HelpCenter = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState('General');
    const [searchQuery, setSearchQuery] = useState('');
    const faqs = [
        {
            category: 'General',
            q: 'What is Gradnex?',
            a: 'Gradnex is a comprehensive platform connecting students with jobs, internships, and skill-learning opportunities, while helping recruiters find the best talent efficiently.'
        },
        {
            category: 'General',
            q: 'How to apply a job?',
            a: 'To apply for a job, navigate to the Jobs tab, find a position that interests you, click on it to see details, and hit the "Apply Now" button. You can upload or autogenerate a resume during application.'
        },
        {
            category: 'Account',
            q: 'How do I complete my profile?',
            a: 'Go to the Profile tab and click on the "Settings" or edit icons. Fill in your personal details, work experience, education, and upload a resume to maximize your profile completion score.'
        },
        {
            category: 'Account',
            q: 'How do I can delete my account?',
            a: 'Currently, account deletion must be requested through our Customer Service or by reaching out to support directly.'
        },
        {
            category: 'General',
            q: 'How do I exit the app?',
            a: 'Simply press the home button on your device or close the browser tab. Your session will be safely retained securely on your device.'
        }
    ];
    const filteredFaqs = faqs.filter(faq =>
        (category === 'General' || faq.category === category) &&
        faq.q.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
        <div className="bg-[#F8F9FA] min-h-[100dvh] text-slate-800 flex flex-col md:p-6 lg:p-8">
            <div className="max-w-[1000px] w-full mx-auto md:bg-white md:rounded-[36px] md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border md:border-slate-100 flex flex-col overflow-hidden relative min-h-[100dvh] md:min-h-[85vh] lg:min-h-[800px]">
                <div className="bg-white px-5 md:px-10 pt-safe md:pt-10 pb-0 flex flex-col z-10 md:rounded-t-[48px] relative">
                    <div className="flex items-center justify-between py-6 md:py-4 pb-6">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate(-1)} 
                                className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 active:scale-90 transition-all md:hidden shrink-0"
                            >
                                <ArrowLeft className="w-6 h-6 text-slate-900" />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                                    Help Center
                                </h1>
                                <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest mt-1">Frequently Asked Questions</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 relative overflow-hidden bg-[#F8F9FA] md:bg-white">
                    <div className="p-5 md:p-8 h-full overflow-y-auto pb-24 md:pb-8 hide-scrollbar">
                        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-6 -mx-5 px-5 md:mx-0 md:px-0 mt-2">
                            {['General', 'Account', 'Service', 'Applications'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-6 py-2.5 rounded-full whitespace-nowrap text-[14px] font-bold border transition-all ${category === cat ? 'bg-[#2D68FE] text-white border-[#2D68FE] shadow-[0_4px_12px_-2px_rgba(45,104,254,0.3)]' : 'bg-transparent text-[#2D68FE] border-[#2D68FE]/30 hover:border-[#2D68FE] hover:bg-[#2D68FE]/5'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="relative mb-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white md:bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] md:shadow-none"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-black/5 rounded-lg transition-colors">
                                <SlidersHorizontal className="w-5 h-5 text-[#2D68FE]" />
                            </button>
                        </div>
                        <div className="space-y-4 md:max-w-[800px]">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq, idx) => (
                                    <FAQItem key={idx} question={faq.q} answer={faq.a} />
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-blue-300" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No FAQs found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default HelpCenter;
