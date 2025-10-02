import React from 'react';
import { Modal, Button, Typography, Space } from 'antd';
import { PlayCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { resumeInterview, resetInterview } from '../store/slices/interviewSlice';

const { Title, Text } = Typography;

const WelcomeBackModal = () => {
  const dispatch = useDispatch();
  const { showWelcomeBackModal, interviewProgress } = useSelector(state => state.interview);

  const handleResume = () => {
    dispatch(resumeInterview());
  };

  const handleRestart = () => {
    dispatch(resetInterview());
  };

  return (
    <Modal
      title="Welcome Back! 👋"
      open={showWelcomeBackModal}
      onCancel={handleRestart}
      footer={[
        <Button key="restart" onClick={handleRestart} icon={<CloseOutlined />}>
          Start New Interview
        </Button>,
        <Button key="resume" type="primary" onClick={handleResume} icon={<PlayCircleOutlined />}>
          Resume Interview
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Text>
          We found an unfinished interview session. You were on question{' '}
          {interviewProgress.currentQuestionIndex + 1} of {interviewProgress.questions.length}.
        </Text>
        
        <div style={{ background: '#f0f8ff', padding: '12px', borderRadius: '6px' }}>
          <Text strong>Progress: </Text>
          <Text>
            {interviewProgress.currentQuestionIndex} of {interviewProgress.questions.length} questions completed
          </Text>
        </div>

        <Text type="secondary">
          Choose to resume where you left off or start a new interview.
        </Text>
      </Space>
    </Modal>
  );
};

export default WelcomeBackModal;