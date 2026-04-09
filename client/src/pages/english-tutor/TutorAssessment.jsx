import React from 'react';
import { useNavigate } from 'react-router-dom';
import SpeakingTest from '../../components/english-tutor/SpeakingTest';
import { useTutor } from './TutorLayout';

const TutorAssessment = () => {
    const navigate = useNavigate();
    const { setTutorData } = useTutor();

    return (
        <SpeakingTest
            onComplete={(data) => {
                setTutorData(data);
                window.location.href = '/app/english-tutor';
            }}
            onCancel={() => navigate('/app/english-tutor')}
        />
    );
};

export default TutorAssessment;
