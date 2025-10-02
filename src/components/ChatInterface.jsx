import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, 
  Button, 
  Input, 
  Space, 
  Typography, 
  Avatar, 
  List, 
  message,
  Modal,
  Progress
} from 'antd';
import { 
  SendOutlined, 
  PauseOutlined, 
  PlayCircleOutlined,
  RobotOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { 
  submitAnswer, 
  nextQuestion, 
  setTimer, 
  pauseInterview,
  startInterview,
  completeInterview 
} from '../store/slices/interviewSlice';
import { addCandidate } from '../store/slices/candidateSlice';
import Timer from './Timer.jsx';
import { generateQuestions } from '../utils/questionGenerator';
import { evaluateAnswer } from '../utils/aiEvaluator';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ChatInterface = () => {
  const dispatch = useDispatch();
  const { candidateInfo, interviewProgress, currentStep, timer } = useSelector(state => state.interview);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [interviewProgress.answers]);

  useEffect(() => {
    if (currentStep === 'profile_completion' && interviewProgress.questions.length === 0) {
      // Generate questions when moving to interview
      const questions = generateQuestions();
      dispatch(startInterview(questions));
    }
  }, [currentStep, dispatch, interviewProgress.questions.length]);

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      message.warning('Please enter your answer before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const currentQuestion = interviewProgress.questions[interviewProgress.currentQuestionIndex];
      const score = await evaluateAnswer(currentAnswer, currentQuestion);
      
      dispatch(submitAnswer({
        answer: currentAnswer,
        score
      }));

      setCurrentAnswer('');
      
      // Wait a moment before moving to next question
      setTimeout(() => {
        dispatch(nextQuestion());
        if (interviewProgress.currentQuestionIndex === interviewProgress.questions.length - 1) {
          handleCompleteInterview();
        }
      }, 1000);

    } catch (error) {
      message.error('Error evaluating answer. Please try again.');
      console.error('Evaluation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteInterview = () => {
    const totalScore = interviewProgress.scores.reduce((sum, score) => sum + score, 0) / interviewProgress.scores.length;
    const summary = `Candidate showed ${totalScore >= 80 ? 'excellent' : totalScore >= 60 ? 'good' : 'basic'} understanding of full-stack concepts.`;
    
    const candidateData = {
      id: Date.now().toString(),
      ...candidateInfo,
      score: Math.round(totalScore),
      summary,
      interviewData: interviewProgress,
      completedAt: new Date().toISOString(),
    };

    dispatch(addCandidate(candidateData));
    dispatch(completeInterview());
    message.success('Interview completed! Check your results in the Interviewer dashboard.');
  };

  const handlePause = () => {
    dispatch(pauseInterview());
    message.info('Interview paused. You can resume later.');
  };

  const handleTimeUp = () => {
    if (currentAnswer.trim()) {
      handleSubmitAnswer();
    } else {
      dispatch(submitAnswer({
        answer: 'No answer provided (time expired)',
        score: 0
      }));
      dispatch(nextQuestion());
      if (interviewProgress.currentQuestionIndex === interviewProgress.questions.length - 1) {
        handleCompleteInterview();
      }
    }
  };

  const getMessageList = () => {
    const messages = [];
    
    // Add welcome message
    messages.push({
      type: 'bot',
      content: `Hello ${candidateInfo.name}! Welcome to your Full-Stack Developer interview. We'll start with some questions. Good luck!`,
      timestamp: new Date(),
    });

    // Add questions and answers
    interviewProgress.questions.forEach((question, index) => {
      messages.push({
        type: 'bot',
        content: `Question ${index + 1}/${interviewProgress.questions.length} (${question.difficulty}): ${question.text}`,
        timestamp: new Date(),
      });

      if (interviewProgress.answers[index]) {
        messages.push({
          type: 'user',
          content: interviewProgress.answers[index],
          score: interviewProgress.scores[index],
          timestamp: new Date(),
        });

        if (interviewProgress.scores[index] !== undefined) {
          messages.push({
            type: 'bot',
            content: `Score: ${interviewProgress.scores[index]}/100`,
            timestamp: new Date(),
          });
        }
      }
    });

    // Add completion message
    if (currentStep === 'completed') {
      messages.push({
        type: 'bot',
        content: 'Interview completed! Thank you for your participation.',
        timestamp: new Date(),
      });
    }

    return messages;
  };

  const messages = getMessageList();
  const currentQuestionIndex = interviewProgress.currentQuestionIndex;
  const totalQuestions = interviewProgress.questions.length;

  if (currentStep === 'completed') {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Title level={2}>Interview Completed! 🎉</Title>
          <Text type="success" style={{ fontSize: '16px' }}>
            Thank you for completing the interview. Your results have been saved.
          </Text>
          <div style={{ marginTop: '24px' }}>
            <Progress 
              type="circle" 
              percent={Math.round(interviewProgress.scores.reduce((a, b) => a + b, 0) / interviewProgress.scores.length)} 
              size={120}
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>Full-Stack Developer Interview</Title>
        <Space>
          <Text strong>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
          <Timer 
            duration={interviewProgress.questions[currentQuestionIndex]?.timeLimit || 0}
            onTimeUp={handleTimeUp}
            isRunning={timer.isRunning}
          />
          <Button 
            icon={<PauseOutlined />} 
            onClick={handlePause}
            disabled={currentStep !== 'interview'}
          >
            Pause
          </Button>
        </Space>
      </div>

      <div style={{ height: '400px', overflowY: 'auto', marginBottom: '16px', border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px' }}>
        <List
          dataSource={messages}
          renderItem={(message, index) => (
            <List.Item style={{ border: 'none', padding: '8px 0' }}>
              <div style={{ display: 'flex', width: '100%', justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', maxWidth: '70%' }}>
                  {message.type === 'bot' && (
                    <Avatar icon={<RobotOutlined />} style={{ background: '#1890ff', marginRight: '8px' }} />
                  )}
                  <div>
                    <Card 
                      size="small" 
                      style={{ 
                        background: message.type === 'bot' ? '#f0f8ff' : '#e6f7ff',
                        border: message.type === 'bot' ? '1px solid #91d5ff' : '1px solid #69c0ff'
                      }}
                    >
                      <div>{message.content}</div>
                      {message.score !== undefined && (
                        <Text strong style={{ color: message.score >= 70 ? '#52c41a' : message.score >= 50 ? '#faad14' : '#ff4d4f' }}>
                          Score: {message.score}/100
                        </Text>
                      )}
                    </Card>
                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                      {message.timestamp.toLocaleTimeString()}
                    </Text>
                  </div>
                  {message.type === 'user' && (
                    <Avatar icon={<UserOutlined />} style={{ background: '#52c41a', marginLeft: '8px' }} />
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      {currentStep === 'interview' && currentQuestionIndex < totalQuestions && (
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            disabled={isSubmitting}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSubmitAnswer}
            loading={isSubmitting}
            style={{ height: 'auto' }}
          >
            Submit
          </Button>
        </Space.Compact>
      )}

      <div style={{ marginTop: '16px' }}>
        <Progress 
          percent={Math.round(((currentQuestionIndex) / totalQuestions) * 100)} 
          status="active"
          format={(percent) => `Progress: ${currentQuestionIndex}/${totalQuestions}`}
        />
      </div>
    </Card>
  );
};

export default ChatInterface;