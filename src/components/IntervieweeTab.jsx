import React from 'react';
import { useSelector } from 'react-redux';
import ResumeUpload from './ResumeUpload.jsx';
import ChatInterface from './ChatInterface.jsx';
import { Steps, Card } from 'antd';

const { Step } = Steps;

const IntervieweeTab = () => {
  const { currentStep } = useSelector(state => state.interview);
  
  const steps = [
    {
      title: 'Resume Upload',
      description: 'Upload and verify your resume',
    },
    {
      title: 'Profile Completion',
      description: 'Fill missing information',
    },
    {
      title: 'Interview',
      description: 'Answer AI-generated questions',
    },
    {
      title: 'Completed',
      description: 'Interview finished',
    },
  ];

  const getCurrentStepIndex = () => {
    switch (currentStep) {
      case 'resume_upload': return 0;
      case 'profile_completion': return 1;
      case 'interview': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Steps current={getCurrentStepIndex()} size="small">
          {steps.map(step => (
            <Step key={step.title} title={step.title} description={step.description} />
          ))}
        </Steps>
      </Card>

      {currentStep === 'resume_upload' && <ResumeUpload />}
      {(currentStep === 'profile_completion' || currentStep === 'interview' || currentStep === 'completed') && (
        <ChatInterface />
      )}
    </div>
  );
};

export default IntervieweeTab;