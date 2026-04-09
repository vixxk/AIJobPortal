import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            className="bg-white rounded-2xl p-3.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 mb-2 cursor-pointer transition-all hover:border-blue-100"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-[15px]">{question}</h4>
                <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
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
    const [category, setCategory] = useState('General');
    const [searchQuery, setSearchQuery] = useState('');

    const faqs = [
        {
            category: 'General',
            q: 'What is Hyrego?',
            a: 'Hyrego is a comprehensive platform connecting students with jobs, internships, and skill-learning opportunities, while helping recruiters find the best talent efficiently.'
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
        <div className="max-w-[800px] mx-auto pb-24 md:pb-8 animate-in fade-in duration-500">
            {/* Category pills */}
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-3 -mx-4 px-4 md:mx-0 md:px-0 mb-4">
                {['General', 'Account', 'Service', 'Applications'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-5 py-2 rounded-full whitespace-nowrap text-[13px] font-bold border transition-all ${category === cat
                            ? 'bg-[#2D68FE] text-white border-[#2D68FE] shadow-[0_4px_12px_-2px_rgba(45,104,254,0.3)]'
                            : 'bg-transparent text-[#2D68FE] border-[#2D68FE]/30 hover:border-[#2D68FE] hover:bg-[#2D68FE]/5'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
                />
            </div>

            {/* FAQ list */}
            <div className="space-y-2">
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
    );
};

export default HelpCenter;
