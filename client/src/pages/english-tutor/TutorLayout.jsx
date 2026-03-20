import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { getTutorDashboard } from '../../services/englishTutorApi';
import Skeleton from '../../components/ui/Skeleton';

const TutorLayout = () => {
    const [loading, setLoading] = useState(true);
    const [tutorData, setTutorData] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchDashboard = async () => {
        try {
            const res = await getTutorDashboard();
            setTutorData(res.data.data);
            return res.data.data;
        } catch (err) {
            console.error('Failed to fetch tutor data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard().then(data => {
            if (data) {
                if (!data.isInitialTestCompleted && location.pathname === '/app/english-tutor') {
                    navigate('/app/english-tutor/welcome', { replace: true });
                }
            }
        });
    }, [location.pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FCFDFF]">
                <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 md:pt-8 space-y-4 md:space-y-6">
                    <Skeleton className="h-[200px] md:h-[280px] w-full" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        <div className="lg:col-span-2 space-y-4 md:space-y-6">
                            <Skeleton className="h-[300px] md:h-[400px] w-full" />
                        </div>
                        <div className="space-y-4 md:space-y-6">
                            <Skeleton className="h-[200px] md:h-[250px] w-full" />
                            <Skeleton className="h-[200px] md:h-[250px] w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FCFDFF]">
            <Outlet context={{ tutorData, setTutorData, fetchDashboard }} />
        </div>
    );
};

export const useTutor = () => useOutletContext();

export default TutorLayout;
