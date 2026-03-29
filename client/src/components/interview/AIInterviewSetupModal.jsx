import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, Plus, Copy, Link as LinkIcon, ExternalLink, XCircle } from 'lucide-react';
import { generateQuestions, createInterviewSession, getSessionReport, updateJobQuestions } from '../../services/interviewSessionApi';
import FinalReport from './FinalReport';

const AIInterviewSetupModal = ({ isOpen, onClose, application, job }) => {
    if (!isOpen || !application) return null;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [existingSession, setExistingSession] = useState(null);
    const [linkCopied, setLinkCopied] = useState(false);
    const [viewingReport, setViewingReport] = useState(false);
    const [useSameQuestions, setUseSameQuestions] = useState(false);

    const fetchQuestions = async (forcedRebuild = false) => {
        setLoading(true);
        try {
            if (!forcedRebuild) {
                // Check if session already exists
                try {
                    const sessionRes = await getSessionReport(application._id);
                    if (sessionRes.data.status === 'success') {
                        setExistingSession(sessionRes.data.data.session);
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    // 404 means no session exists yet, which is fine
                }

                if (job.aiInterviewQuestions && job.aiInterviewQuestions.length > 0) {
                    setQuestions(job.aiInterviewQuestions);
                    setLoading(false);
                    return;
                }
            }

            // If no session, generate questions
            const studentSkills = application.studentProfile?.skills?.join(', ') || 'General software development';
            const jobDescription = job.description || 'Standard technical role';
            
            const res = await generateQuestions({
                jobRole: job.title,
                jobDescription,
                studentProfile: studentSkills
            });
            
            if (res.data.status === 'success') {
                setQuestions(res.data.data.questions);
            }
        } catch (err) {
            console.error("Failed to generate questions:", err);
            setQuestions([
                "Can you tell me about yourself?",
                "What are your greatest strengths and weaknesses?",
                "Describe a time you solved a complex technical problem.",
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setExistingSession(null);
            setViewingReport(false);
            setUseSameQuestions(job?.aiInterviewQuestions?.length > 0);
            fetchQuestions(false);
        }
    }, [isOpen, application, job]);

    const handleAddQuestion = () => {
        if (!newQuestion.trim()) return;
        setQuestions([...questions, newQuestion.trim()]);
        setNewQuestion("");
    };

    const handleRemoveQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleCreateSession = async () => {
        if (questions.length === 0) return alert("Please add at least one question.");
        setSubmitting(true);
        try {
            if (useSameQuestions) {
                await updateJobQuestions(job._id, questions).catch(err => console.error(err));
                job.aiInterviewQuestions = questions;
            } else if (job.aiInterviewQuestions?.length > 0 && !useSameQuestions) {
                await updateJobQuestions(job._id, []).catch(err => console.error(err));
                job.aiInterviewQuestions = [];
            }

            const res = await createInterviewSession({
                studentId: application.studentId._id,
                jobId: job._id,
                applicationId: application._id,
                questions
            });
            if (res.data.status === 'success') {
                setExistingSession(res.data.data.session);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to compile interview session.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/candidate-interview/${existingSession.token}`;
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    if (viewingReport && existingSession?.report) {
         return (
             <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
                 <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] overflow-y-auto no-scrollbar shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                        <XCircle className="w-6 h-6" />
                    </button>
                    <FinalReport report={existingSession.report} jobRole={job.title} readonly={true} />
                 </div>
             </div>
         );
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col pointer-events-auto animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-amber-300" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white">AI Interview Configurator</h2>
                            <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-widest leading-none mt-1">
                                Candidate: {application.studentId?.name}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Analyzing Profile & Generating Questions...</p>
                    </div>
                ) : existingSession ? (
                    <div className="p-8 flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                            {existingSession.status === 'COMPLETED' ? <Sparkles className="w-10 h-10 text-emerald-500" /> : <LinkIcon className="w-10 h-10" />}
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-black text-slate-800 mb-1">
                                {existingSession.status === 'COMPLETED' ? 'Interview Completed' : 'Session Ready'}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">
                                {existingSession.status === 'COMPLETED' 
                                    ? 'The candidate has completed their AI interview. You can now review the detailed analysis.' 
                                    : 'Share the unique link below with the candidate. They can take the interview at any time.'}
                            </p>
                        </div>

                        {existingSession.status === 'PENDING' ? (
                            <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={`${window.location.origin}/candidate-interview/${existingSession.token}`}
                                    className="flex-1 bg-transparent text-sm font-medium text-slate-600 outline-none"
                                />
                                <button 
                                    onClick={handleCopyLink}
                                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition flex items-center gap-2"
                                >
                                    {linkCopied ? <><Sparkles className="w-3.5 h-3.5"/> Copied</> : <><Copy className="w-3.5 h-3.5"/> Copy</>}
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setViewingReport(true)}
                                className="w-full py-4 bg-emerald-600 text-white font-black text-sm rounded-2xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                            >
                                <ExternalLink className="w-5 h-5" /> VIEW COMPLETED REPORT
                            </button>
                        )}
                        
                    </div>
                ) : (
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-50/50 flex-1">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-indigo-500" /> Auto-Generated Questions
                                    </h3>
                                    <p className="text-xs text-slate-500">You can edit these questions or add your own.</p>
                                </div>
                                <button 
                                    onClick={() => fetchQuestions(true)}
                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center xl:gap-2 gap-1"
                                >
                                    <Sparkles className="w-3.5 h-3.5" /> 
                                    <span className="hidden sm:inline">Regenerate</span>
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {questions.map((q, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm relative group">
                                        <div className="w-6 h-6 shrink-0 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg flex items-center justify-center mt-0.5">
                                            {idx + 1}
                                        </div>
                                        <textarea
                                            value={q}
                                            onChange={(e) => {
                                                const newQ = [...questions];
                                                newQ[idx] = e.target.value;
                                                setQuestions(newQ);
                                            }}
                                            className="flex-1 text-sm text-slate-700 bg-transparent resize-none outline-none focus:border-b border-indigo-300 transition-all font-medium py-1"
                                            rows={2}
                                        />
                                        <button 
                                            onClick={() => handleRemoveQuestion(idx)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all absolute right-2 top-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder="Type a custom question..."
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                                />
                                <button
                                    onClick={handleAddQuestion}
                                    className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition flex items-center gap-2 shrink-0"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>

                            <label className="flex items-center gap-3 mt-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={useSameQuestions}
                                    onChange={(e) => setUseSameQuestions(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-semibold text-indigo-900">
                                    Use these exact questions for all shortlisted candidates for this position
                                </span>
                            </label>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={onClose}
                                disabled={submitting}
                                className="px-5 py-2.5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSession}
                                disabled={submitting || questions.length === 0}
                                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? <span className="animate-pulse">Saving...</span> : 'Compile & Save Session'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIInterviewSetupModal;
