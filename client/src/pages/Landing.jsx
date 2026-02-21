import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Search, FileText, MonitorPlay, BookOpen, CheckCircle2, Star, Target, Sparkles, Building2, GraduationCap, Users2, ChevronRight } from 'lucide-react';
import Logo from '../components/Logo';

const Landing = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-500/30">
            {/* Background Decorative Blur */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 blur-[120px] pointer-events-none" />

            {/* Sticky Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex justify-between items-center">
                    <Logo iconSize="w-8 h-8" textClassName="text-xl font-extrabold tracking-tight text-slate-900" />
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link to={user ? "/app" : "/login"} className="hidden md:block text-slate-600 hover:text-slate-900 font-semibold transition-colors px-4 py-2">
                            {user ? "Dashboard" : "Sign In"}
                        </Link>
                        <Link to={user ? "/app" : "/login"} className="px-5 py-2 md:py-2.5 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all active:scale-95 text-sm md:text-base shadow-md">
                            {user ? "Go to Dashboard" : "Get Started"}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-28 pb-16 md:pt-48 md:pb-32 px-4 sm:px-6 overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white border border-slate-200 shadow-sm text-xs md:text-sm font-semibold text-slate-700 mb-6 md:mb-8 hover:border-blue-300 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                        <span className="hidden md:inline">Meet the next generation of career tools</span>
                        <span className="md:hidden">Next-Gen Career Tools</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4 md:mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        Land Your Dream Job <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                            Twice As Fast.
                        </span>
                    </h1>

                    <p className="text-base md:text-2xl text-slate-600 mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 px-2 md:px-0">
                        The all-in-one AI platform to discover hidden opportunities, build ATS-beating resumes, and ace every interview.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 w-full md:w-auto px-4 md:px-0">
                        <Link to={user ? "/app" : "/login"} className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-blue-600 text-white font-bold text-base md:text-lg hover:bg-blue-700 transition-all hover:shadow-xl hover:shadow-blue-600/30 flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20">
                            {user ? 'Go to Dashboard' : 'Start for free today'}
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 md:group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-white text-slate-700 font-bold border border-slate-200 text-base md:text-lg hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2">
                            See how it works
                        </Link>
                    </div>

                    <div className="mt-10 pt-6 md:mt-12 md:pt-8 flex flex-col items-center w-full max-w-3xl mx-auto animate-in fade-in duration-1000 delay-500 overflow-hidden">
                        <p className="text-[10px] md:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 md:mb-6">Trusted by ambitious students from</p>

                        {/* Desktop View (Static) */}
                        <div className="hidden md:flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><GraduationCap className="w-6 h-6" /> Stanford</div>
                            <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><Building2 className="w-6 h-6" /> MIT</div>
                            <div className="flex items-center gap-2 font-bold text-xl text-slate-800"><Users2 className="w-6 h-6" /> Harvard</div>
                        </div>

                        {/* Mobile View (Scrolling Marquee) */}
                        <div className="md:hidden relative w-full flex overflow-hidden group">
                            <div className="flex w-[200%] animate-[marquee_12s_linear_infinite] opacity-60 grayscale justify-around">
                                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 pr-8"><GraduationCap className="w-5 h-5" /> Stanford</div>
                                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 pr-8"><Building2 className="w-5 h-5" /> MIT</div>
                                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 pr-8"><Users2 className="w-5 h-5" /> Harvard</div>
                                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 pr-8"><GraduationCap className="w-5 h-5" /> Stanford</div>
                                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 pr-8"><Building2 className="w-5 h-5" /> MIT</div>
                                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 pr-8"><Users2 className="w-5 h-5" /> Harvard</div>
                            </div>
                            {/* Gradient edges for smooth fade */}
                            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#F8FAFC] to-transparent"></div>
                            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#F8FAFC] to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modernized Bento Box Features Section */}
            <section className="py-16 md:py-32 bg-[#F8FAFC] relative overflow-hidden">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes marquee {
                        0% { transform: translateX(0%); }
                        100% { transform: translateX(-50%); }
                    }
                `}} />

                {/* Decorative blur matching hero */}
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-purple-400/10 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-12 md:mb-20 px-2">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 tracking-tight">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">succeed.</span></h2>
                        <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto font-medium hidden md:block">Skip the generic advice. Our AI analyzes your profile and automatically matches you with the right opportunities.</p>
                        <p className="text-sm md:hidden text-slate-600 font-medium">Skip the generic advice and let AI match you with the right opportunities.</p>
                    </div>

                    <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-12 gap-2.5 md:gap-6 w-full max-w-6xl mx-auto px-2 md:px-0">

                        {/* Feature 1 */}
                        <Link to={user ? "/app/jobs" : "/login"} className="group relative overflow-hidden rounded-[20px] md:rounded-[32px] bg-white border border-slate-100 p-2.5 md:p-10 flex flex-col items-center md:items-start justify-start md:justify-between shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] md:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-300 transition-all cursor-pointer transform duration-500 hover:-translate-y-1 col-span-1 md:col-span-1 lg:col-span-7 h-[125px] md:h-full md:min-h-[300px] text-center md:text-left">
                            <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors opacity-50 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>

                            {/* Mobile Active Glow */}
                            <div className="md:hidden absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl pointer-events-none transform translate-x-1/4 -translate-y-1/4"></div>

                            <div className="w-11 h-11 md:w-16 md:h-16 rounded-full md:rounded-[20px] bg-blue-100 md:bg-gradient-to-b md:from-blue-50 md:to-blue-100/50 flex items-center justify-center mb-2 md:mb-6 relative z-10 border border-blue-200 md:border-blue-200/60 group-hover:scale-110 transition-transform shadow-[0_4px_12px_rgba(59,130,246,0.2)] md:shadow-sm md:shadow-blue-500/10 shrink-0">
                                <Search className="w-5 h-5 md:w-8 md:h-8 text-blue-600 drop-shadow-sm" />
                            </div>
                            <div className="relative z-10 w-full md:mt-auto flex flex-col items-center md:items-start flex-1 justify-center md:justify-start">
                                <h3 className="text-[11px] leading-[1.2] md:text-3xl font-bold md:font-extrabold text-slate-800 md:mb-3 group-hover:text-blue-600 transition-colors break-words whitespace-normal w-full tracking-tight">
                                    <span className="md:hidden">Job<br />Finder</span>
                                    <span className="hidden md:inline">AI Job Finder</span>
                                </h3>
                                <p className="hidden md:block text-base text-slate-500 leading-relaxed max-w-sm">Discover perfect roles matched to your skills instantly. No more scrolling through irrelevant job postings.</p>
                            </div>
                        </Link>

                        {/* Feature 2 */}
                        <Link to={user ? "/app/resume" : "/login"} className="group relative overflow-hidden rounded-[20px] md:rounded-[32px] bg-white border border-slate-100 p-2.5 md:p-10 flex flex-col items-center md:items-start justify-start md:justify-between shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] md:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-300 transition-all cursor-pointer transform duration-500 hover:-translate-y-1 col-span-1 md:col-span-1 lg:col-span-5 h-[125px] md:h-full md:min-h-[300px] text-center md:text-left">
                            <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl group-hover:bg-purple-100 transition-colors opacity-50 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>

                            {/* Mobile Active Glow */}
                            <div className="md:hidden absolute top-0 right-0 w-24 h-24 bg-purple-100/50 rounded-full blur-2xl pointer-events-none transform translate-x-1/4 -translate-y-1/4"></div>

                            <div className="w-11 h-11 md:w-16 md:h-16 rounded-full md:rounded-[20px] bg-purple-100 md:bg-gradient-to-b md:from-purple-50 md:to-purple-100/50 flex items-center justify-center mb-2 md:mb-6 relative z-10 border border-purple-200 md:border-purple-200/60 group-hover:scale-110 transition-transform shadow-[0_4px_12px_rgba(168,85,247,0.2)] md:shadow-sm md:shadow-purple-500/10 shrink-0">
                                <FileText className="w-5 h-5 md:w-8 md:h-8 text-purple-600 drop-shadow-sm" />
                            </div>
                            <div className="relative z-10 w-full md:mt-auto flex flex-col items-center md:items-start flex-1 justify-center md:justify-start">
                                <h3 className="text-[11px] leading-[1.2] md:text-3xl font-bold md:font-extrabold text-slate-800 md:mb-3 group-hover:text-purple-600 transition-colors break-words whitespace-normal w-full tracking-tight">
                                    <span className="md:hidden">Resume<br />Builder</span>
                                    <span className="hidden md:inline">ATS Resume Builder</span>
                                </h3>
                                <p className="hidden md:block text-base text-slate-500 leading-relaxed max-w-[280px]">Craft professional, ATS-friendly resumes in minutes tailored to your target roles.</p>
                            </div>
                        </Link>

                        {/* Feature 3 */}
                        <Link to={user ? "/app/interview" : "/login"} className="group relative overflow-hidden rounded-[20px] md:rounded-[32px] bg-white border border-slate-100/80 md:border-slate-200 p-2.5 md:p-10 flex flex-col items-center md:items-start justify-start md:justify-between shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] md:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.05)] transition-all cursor-pointer transform duration-500 hover:-translate-y-1 col-span-1 md:col-span-1 lg:col-span-5 h-[125px] md:h-full md:min-h-[250px] text-center md:text-left">
                            {/* Mobile Active Glow */}
                            <div className="md:hidden absolute top-0 right-0 w-24 h-24 bg-orange-100/40 rounded-full blur-2xl pointer-events-none transform translate-x-1/4 -translate-y-1/4"></div>

                            <div className="flex justify-center md:justify-between w-full items-start mb-2 md:mb-6">
                                <div className="w-11 h-11 md:w-16 md:h-16 rounded-full md:rounded-[20px] bg-orange-100 md:bg-orange-50/80 flex items-center justify-center relative z-10 border border-orange-200/50 md:border-orange-100 mx-auto md:mx-0 shrink-0 shadow-[0_4px_12px_rgba(249,115,22,0.15)] md:shadow-inner">
                                    <MonitorPlay className="w-5 h-5 md:w-8 md:h-8 text-orange-500 opacity-100 md:opacity-90" />
                                </div>
                                <span className="hidden md:block px-4 py-1.5 bg-orange-50 border border-orange-200/50 text-orange-600 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">Coming Soon</span>
                            </div>
                            <div className="relative z-10 w-full md:mt-auto flex flex-col items-center md:items-start flex-1 justify-center md:justify-start">
                                <h3 className="text-[11px] leading-[1.2] md:text-2xl font-bold text-slate-600 md:text-slate-500 md:mb-2 break-words whitespace-normal w-full tracking-tight">
                                    <span className="md:hidden">Interview<br />Prep</span>
                                    <span className="hidden md:inline">AI Interview Prep</span>
                                </h3>
                                <p className="hidden md:block text-sm text-slate-400 leading-relaxed max-w-[280px]">Practice with our AI interviewer and get instant feedback on your answers.</p>
                            </div>
                        </Link>

                        {/* Feature 4 */}
                        <Link to={user ? "/app/learning" : "/login"} className="group relative overflow-hidden rounded-[20px] md:rounded-[32px] bg-white border border-slate-100/80 md:border-slate-200 p-2.5 md:p-10 flex flex-col items-center md:items-start justify-start md:justify-between shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] md:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.05)] transition-all cursor-pointer transform duration-500 hover:-translate-y-1 col-span-1 md:col-span-1 lg:col-span-7 h-[125px] md:h-full md:min-h-[250px] text-center md:text-left">
                            {/* Mobile Active Glow */}
                            <div className="md:hidden absolute top-0 right-0 w-24 h-24 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none transform translate-x-1/4 -translate-y-1/4"></div>

                            <div className="flex justify-center md:justify-between w-full items-start mb-2 md:mb-6">
                                <div className="w-11 h-11 md:w-16 md:h-16 rounded-full md:rounded-[20px] bg-emerald-100 md:bg-emerald-50/80 flex items-center justify-center relative z-10 border border-emerald-200/50 md:border-emerald-100 mx-auto md:mx-0 shrink-0 shadow-[0_4px_12px_rgba(16,185,129,0.15)] md:shadow-inner">
                                    <BookOpen className="w-5 h-5 md:w-8 md:h-8 text-emerald-500 opacity-100 md:opacity-90" />
                                </div>
                                <span className="hidden md:block px-4 py-1.5 bg-emerald-50 border border-emerald-200/50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">Coming Soon</span>
                            </div>
                            <div className="relative z-10 w-full md:mt-auto flex flex-col items-center md:items-start flex-1 justify-center md:justify-start">
                                <h3 className="text-[11px] leading-[1.2] md:text-2xl font-bold text-slate-600 md:text-slate-500 md:mb-2 break-words whitespace-normal w-full tracking-tight">
                                    <span className="md:hidden">Skill<br />Learning</span>
                                    <span className="hidden md:inline">Skills Learning</span>
                                </h3>
                                <p className="hidden md:block text-sm text-slate-400 leading-relaxed max-w-md">Identify your skill gaps and get personalized roadmaps to level up your career with curated resources.</p>
                            </div>
                        </Link>

                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-12 md:py-24 bg-[#F8FAFC] border-t border-slate-200/50 text-center px-4">
                <div className="max-w-4xl mx-auto bg-white border border-slate-200 p-8 md:p-16 rounded-[32px] md:rounded-[40px] shadow-xl shadow-slate-200/50">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 leading-tight">
                        Stop searching.<br />Start landing.
                    </h2>
                    <p className="text-sm md:text-lg text-slate-600 mb-6 md:mb-10 max-w-xl mx-auto">Join thousands of students who have fast-tracked their careers using our intelligent portal.</p>
                    <Link to={user ? "/app" : "/login"} className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 md:px-10 md:py-4 rounded-full bg-blue-600 text-white font-bold text-sm md:text-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-1">
                        {user ? 'Go to Dashboard' : 'Create Your Free Account'}
                        <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                    </Link>
                </div>
            </section>

            {/* Premium Blended Footer */}
            <footer className="bg-[#F8FAFC] pt-12 pb-16 md:py-20 text-center px-4 relative overflow-hidden">
                {/* Subtle background glow for the footer */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-blue-400/5 blur-[80px] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
                    <div className="mb-6 md:mb-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 scale-90 md:scale-100">
                        <Logo iconSize="w-6 h-6" textClassName="text-lg font-bold tracking-tight text-slate-900" />
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8 md:mb-10">
                        <Link to="/" className="text-[13px] md:text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">About Us</Link>
                        <Link to="/" className="text-[13px] md:text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">Privacy Policy</Link>
                        <Link to="/" className="text-[13px] md:text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">Terms of Service</Link>
                    </div>

                    <div className="w-12 h-[1px] bg-slate-200 mb-8 md:mb-10 mx-auto opacity-50"></div>

                    <p className="text-[11px] md:text-[13px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">Made for Career Success</p>
                    <p className="text-[11px] md:text-[13px] text-slate-400 font-medium">
                        &copy; {new Date().getFullYear()} AI Job Portal. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
