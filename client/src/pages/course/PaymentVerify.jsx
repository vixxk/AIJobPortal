import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, useParams, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { CheckCircle, XCircle, Loader2, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentVerify = () => {
    const [searchParams] = useSearchParams();
    const { id: courseId } = useParams();
    const orderId = searchParams.get('order_id');
    const [status, setStatus] = useState('verifying'); // verifying, success, failed
    const [course, setCourse] = useState(null);
    const navigate = useNavigate();
    const verificationAttempted = useRef(false);

    useEffect(() => {
        const verify = async () => {
            if (verificationAttempted.current) return;
            verificationAttempted.current = true;

            try {
                // First get course details for UI
                const courseRes = await axios.get(`/courses/${courseId}`);
                setCourse(courseRes.data.data.course);

                // Verify payment
                const res = await axios.get(`/payment/verify-payment/${orderId}`);
                
                if (res.data.status === 'success') {
                    setStatus('success');
                    // Update localStorage to reflect enrollment (used by SkillLearning.jsx for smooth transition)
                    localStorage.setItem(`course_enrolled_${courseId}`, 'true');
                } else {
                    setStatus('failed');
                }
            } catch (err) {
                console.error(err);
                setStatus('failed');
            }
        };

        if (orderId && courseId) {
            verify();
        } else {
            setStatus('failed');
        }
    }, [orderId, courseId]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 text-center"
            >
                {status === 'verifying' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">Verifying Payment</h2>
                            <p className="text-slate-400 font-medium">Please wait while we confirm your transaction with Cashfree.</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">Enrollment Successful!</h2>
                            <p className="text-slate-400 font-medium">Welcome to {course?.title}. You now have full access to all lectures.</p>
                        </div>
                        <div className="pt-4">
                            <Link 
                                to={`/app/learning/course/${courseId}`}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                            >
                                <BookOpen className="w-4 h-4" /> Start Learning Now
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 text-rose-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">Payment Failed</h2>
                            <p className="text-slate-400 font-medium">We couldn't verify your payment. If amount was deducted, it will be refunded or contact support.</p>
                        </div>
                        <div className="pt-4 flex flex-col gap-3">
                            <button 
                                onClick={() => navigate(`/app/learning/course/${courseId}`)}
                                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                            >
                                Try Again
                            </button>
                            <Link to="/app/learning" className="text-xs font-black text-indigo-600 hover:underline flex items-center justify-center gap-1">
                                <ArrowRight className="w-3 h-3 rotate-180" /> Back to Courses
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default PaymentVerify;
