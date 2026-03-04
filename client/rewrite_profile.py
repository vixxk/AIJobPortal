import re

with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/pages/StudentProfile.jsx', 'r') as f:
    c = f.read()

nav_btn_desktop = """
    const NavButtonDesktop = ({ sectionKey, label }) => (
        <div
            onClick={() => {
                setCurrentView(sectionKey);
                setEditIndex(Array.isArray(profile[sectionKey.toLowerCase()] || profile[sectionKey.toLowerCase() === 'organizations' ? 'organizationActivities' : '']) ? -1 : 0);
            }}
            className={`flex items-center justify-between p-3.5 mb-1.5 rounded-2xl cursor-pointer transition-all ${currentView === sectionKey ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20' : 'hover:bg-slate-50 text-slate-700 font-medium'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${currentView === sectionKey ? 'bg-white/20' : 'bg-slate-100/80 shadow-sm border border-slate-200/50'}`}>
                    {React.cloneElement(icons[sectionKey], { className: `w-4 h-4 ${currentView === sectionKey ? 'text-white' : 'text-slate-500'}`})}
                </div>
                <span className="text-[14px]">{label}</span>
            </div>
            <ChevronLeft className={`w-4 h-4 rotate-180 transition-opacity ${currentView === sectionKey ? 'text-white/70 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`} />
        </div>
    );
"""
c = c.replace('const handleUpdateField = (field, value) => {', nav_btn_desktop + '\n    const handleUpdateField = (field, value) => {')


# Make wrappers responsive
old_wrapper = 'className="p-4 md:px-8 md:py-4 flex flex-col h-[calc(100dvh-150px)] bg-slate-50 md:max-w-2xl md:mx-auto w-full overflow-hidden"'
new_wrapper = 'className="p-4 md:px-8 md:py-4 lg:p-8 flex flex-col h-[calc(100dvh-150px)] lg:h-full bg-slate-50 lg:bg-transparent md:max-w-2xl lg:max-w-none md:mx-auto w-full overflow-hidden"'
c = c.replace(old_wrapper, new_wrapper)


# Swap currentViewRender to renderActiveForm
c = c.replace('const currentViewRender = () => {', 'const renderActiveForm = () => {')


# Isolate the exact ending part
start_idx = c.find('        // Default Main View')
if start_idx != -1:
    before = c[:start_idx]
    
    new_bottom = """
    // Ensure desktop opens something if MAIN is visited directly
    useEffect(() => {
        if (window.innerWidth >= 1024 && currentView === 'MAIN') {
            setCurrentView('BASIC');
        }
    }, [currentView]);

    const currentViewRender = () => {
        return (
            <div className="w-full h-full lg:bg-slate-50 lg:min-h-[calc(100vh-80px)]">
                {/* Mobile View */}
                <div className="lg:hidden h-full">
                    {currentView === 'MAIN' ? (
                        <div className="bg-slate-50 flex flex-col h-[calc(100dvh-140px)] overflow-hidden">
                            <div className="w-full flex flex-col h-full bg-slate-50">
                                <div className="px-4 flex-1 overflow-y-auto h-full pb-20">
                                    <div className="flex items-center justify-between mt-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <img src={profile.profileImage || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                            <div>
                                                <h2 className="text-xl font-bold tracking-tight">{profile.firstName ? `${profile.firstName} ${profile.lastName}` : (user?.name || 'User Name')}</h2>
                                                <p className="text-slate-500 text-sm mt-0.5">{profile.currentPosition || 'Job Hunter @ Application'}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setCurrentView('BASIC')} className="w-9 h-9 flex items-center justify-center border border-blue-200 bg-white rounded-full shrink-0 shadow-sm hover:bg-slate-50 transition-colors">
                                            <Edit2 className="w-4 h-4 text-blue-500" />
                                        </button>
                                    </div>

                                    <NavButton sectionKey="CONTACT" label="Contact Information" />
                                    <NavButton sectionKey="SUMMARY" label="Summary" />
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
                                    <NavButton sectionKey="SETTINGS" label="Settings" />
                                    <NavButton sectionKey="STATUS" label="Job Seeking Status" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        renderActiveForm()
                    )}
                </div>

                {/* Desktop Split Layout */}
                <div className="hidden lg:flex max-w-[1400px] mx-auto w-full p-6 xl:p-8 gap-6 xl:gap-8 h-[calc(100vh-80px)]">
                    {/* Sidebar */}
                    <div className="w-[340px] shrink-0 bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex flex-col items-center gap-4 bg-gradient-to-b from-blue-50/50 to-white text-center">
                            <div className="relative">
                                <img src={profile.profileImage || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} alt="User" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md relative z-10" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-800">{profile.firstName ? `${profile.firstName} ${profile.lastName}` : (user?.name || 'User Name')}</h2>
                                <p className="text-slate-500 text-sm mt-1 font-medium">{profile.currentPosition || 'Job Hunter @ Application'}</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-0.5 hide-scrollbar">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-2 px-3">Profile Details</h4>
                            <NavButtonDesktop sectionKey="BASIC" label="Edit Profile" />
                            <NavButtonDesktop sectionKey="CONTACT" label="Contact Information" />
                            <NavButtonDesktop sectionKey="SUMMARY" label="Summary" />
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
                            <NavButtonDesktop sectionKey="SETTINGS" label="Settings" />
                        </div>
                    </div>

                    {/* Active Form Area */}
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

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    return currentViewRender();
};

export default StudentProfile;
"""
    c = before + new_bottom
    
    with open('/home/vixx/Documents/JobPortal/JobPortal/client/src/pages/StudentProfile.jsx', 'w') as f:
        f.write(c)

