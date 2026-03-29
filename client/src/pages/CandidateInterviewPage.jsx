import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InterviewRoom from '../components/interview/InterviewRoom';
import FinalReport from '../components/interview/FinalReport';
import { getSessionByToken, completeSession } from '../services/interviewSessionApi';
import Skeleton from '../components/ui/Skeleton';

const CandidateInterviewPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionData, setSessionData] = useState(null);
    const [finalReport, setFinalReport] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await getSessionByToken(token);
                if (res.data.status === 'success') {
                    setSessionData(res.data.data.session);
                }
            } catch (err) {
                console.error("Failed to load interview session:", err);
                setError(err.response?.data?.message || "Invalid or expired interview link.");
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [token]);

    const handleComplete = async (report) => {
        setIsSubmitting(true);
        try {
            await completeSession(token, report);
            setFinalReport(report);
        } catch (err) {
            console.error("Failed to save report:", err);
            alert("Interview completed, but failed to save report. Please contact support.");
            setFinalReport(report); // Still show it to them locally
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-full w-full bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-lg w-full space-y-8">
                    <div className="flex flex-col items-center space-y-4">
                        <Skeleton className="w-20 h-20 rounded-2xl" />
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-full w-full bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-lg w-full text-center space-y-4 border border-rose-100">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">Session Error</h2>
                    <p className="text-slate-600">{error}</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="mt-6 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    if (finalReport) {
        return (
            <FinalReport
                report={finalReport}
                jobRole={sessionData?.jobTitle}
                readonly={true} // For specific session, we don't need the restart button
            />
        );
    }

    return (
        <div className="min-h-full w-full bg-gray-50 flex flex-col py-2 relative">
            {isSubmitting && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shrink-0"></div>
                    <p className="mt-4 text-indigo-900 font-bold uppercase tracking-widest text-sm animate-pulse">Saving Your Results...</p>
                </div>
            )}
            <InterviewRoom
                questions={sessionData.questions}
                jobRole={sessionData.jobTitle}
                onComplete={handleComplete}
            />
        </div>
    );
};

export default CandidateInterviewPage;
