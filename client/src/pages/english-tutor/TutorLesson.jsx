import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LessonFlow from '../../components/english-tutor/LessonFlow';
import { useTutor } from './TutorLayout';

const TutorLesson = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { tutorData, fetchDashboard } = useTutor();

    if (!tutorData) return null;

    const requestedLevel = parseInt(searchParams.get('level')) || tutorData.currentLevel;

    return (
        <LessonFlow
            level={requestedLevel}
            onComplete={() => {
                fetchDashboard();
                window.location.href = '/app/english-tutor';
            }}
            onCancel={() => navigate('/app/english-tutor')}
        />
    );
};

export default TutorLesson;
