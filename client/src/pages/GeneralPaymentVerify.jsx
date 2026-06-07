import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyPayment } from '../services/paymentApi';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader2, Sparkles, Headphones, Bot, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const GeneralPaymentVerify = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');
    const [status, setStatus] = useState('verifying'); // verifying, success, failed
    const [orderDetails, setOrderDetails] = useState(null);
    const { refreshUser } = useAuth();
    const navigate = useNavigate();
    const verificationAttempted = useRef(false);

    useEffect(() => {
        const verify = async () => {
            if (verificationAttempted.current) return;
            verificationAttempted.current = true;

            try {
                const res = await verifyPayment(orderId);
                if (res.status === 'success') {
                    setOrderDetails(res.data.order);
                    setStatus('success');
                    // Refresh user context to immediately reflect new quotas & subscription plan
                    if (refreshUser) {
                        await refreshUser();
                    }
                } else {
                    setStatus('failed');
                }
            } catch (err) {
                console.error(err);
                setStatus('failed');
            }
        };

        if (orderId) {
            verify();
        } else {
            setStatus('failed');
        }
    }, [orderId, refreshUser]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 text-center"
            >
                {status === 'verifying' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">Verifying Payment</h2>
                            <p className="text-slate-400 font-medium text-sm">Checking status with Cashfree. Please do not close this window.</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">Payment Successful!</h2>
                            
                            {orderDetails?.orderType === 'SUBSCRIPTION' && (
                                <p className="text-slate-500 font-semibold text-sm">
                                    Your account has been upgraded to <span className="text-blue-600 font-black uppercase">{orderDetails.subscriptionPlanKey}</span>! Enjoy your new limits.
                                </p>
                            )}
                            
                            {orderDetails?.orderType === 'PAY_PER_USE' && (
                                <p className="text-slate-500 font-semibold text-sm">
                                    Feature credit unlocked for <span className="text-blue-600 font-black uppercase">{orderDetails.payPerUseType.replace('_', ' ')}</span>!
                                </p>
                            )}

                            {!orderDetails && (
                                <p className="text-slate-500 font-semibold text-sm">
                                    Your transaction was completed successfully. Your limits are updated!
                                </p>
                            )}
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            {orderDetails?.orderType === 'SUBSCRIPTION' && (
                                <Link 
                                    to="/app/dashboard"
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                                >
                                    <Sparkles className="w-4 h-4" /> Go to Dashboard
                                </Link>
                            )}

                            {orderDetails?.orderType === 'PAY_PER_USE' && orderDetails?.payPerUseType === 'ENGLISH_TUTOR' && (
                                <Link 
                                    to="/app/english-tutor"
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                                >
                                    <Headphones className="w-4 h-4" /> Start Spoken English
                                </Link>
                            )}

                            {orderDetails?.orderType === 'PAY_PER_USE' && orderDetails?.payPerUseType === 'INTERVIEW' && (
                                <Link 
                                    to="/app/interview"
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                                >
                                    <Bot className="w-4 h-4" /> Start Mock Interview
                                </Link>
                            )}

                            {orderDetails?.orderType === 'PAY_PER_USE' && orderDetails?.payPerUseType === 'RESUME' && (
                                <Link 
                                    to="/app/resume"
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                                >
                                    <FileText className="w-4 h-4" /> Build Resume
                                </Link>
                            )}

                            {!orderDetails && (
                                <Link 
                                    to="/app/dashboard"
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                                >
                                    Go to Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 text-rose-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">Verification Failed</h2>
                            <p className="text-slate-400 font-medium text-sm">We couldn't confirm this payment. If money was charged, it will be refunded automatically within 3-5 days.</p>
                        </div>
                        <div className="pt-4 flex flex-col gap-3">
                            <button 
                                onClick={() => navigate('/app/subscriptions')}
                                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                View Plans & Try Again
                            </button>
                            <Link to="/app/help" className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-center gap-1">
                                <ArrowRight className="w-3 h-3 rotate-180" /> Visit Help Center
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default GeneralPaymentVerify;
