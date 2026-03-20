import React from 'react';
import { useNavigate } from 'react-router-dom';
import LessonFlow from '../../components/english-tutor/LessonFlow';
import { useTutor } from './TutorLayout';

const TutorLesson = () => {
    const navigate = useNavigate();
    const { tutorData, fetchDashboard } = useTutor();

    if (!tutorData) return null;

    return (
        <LessonFlow
            level={tutorData.currentLevel}
            onComplete={() => {
                fetchDashboard();
                navigate('/app/english-tutor');
            }}
            onCancel={() => navigate('/app/english-tutor')}
        />
    );
};

export default TutorLesson;
