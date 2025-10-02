import React from 'react';
import { Modal, Typography, Card, List, Tag, Progress, Divider } from 'antd';

const { Title, Text, Paragraph } = Typography;

const CandidateDetails = ({ candidate, onClose }) => {
  if (!candidate) return null;

  const interviewData = candidate.interviewData || {};
  const questions = interviewData.questions || [];
  const answers = interviewData.answers || [];
  const scores = interviewData.scores || [];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'blue';
    }
  };

  return (
    <Modal
      title={`Candidate Details: ${candidate.name}`}
      open={!!candidate}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Card title="Basic Information" style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <Text strong>Name: </Text>
              <Text>{candidate.name}</Text>
            </div>
            <div>
              <Text strong>Email: </Text>
              <Text>{candidate.email}</Text>
            </div>
            <div>
              <Text strong>Phone: </Text>
              <Text>{candidate.phone}</Text>
            </div>
            <div>
              <Text strong>Overall Score: </Text>
              <Tag color={candidate.score >= 80 ? 'green' : candidate.score >= 60 ? 'orange' : 'red'}>
                {candidate.score}/100
              </Tag>
            </div>
          </div>
        </Card>

        <Card title="AI Summary" style={{ marginBottom: 16 }}>
          <Paragraph>{candidate.summary}</Paragraph>
        </Card>

        <Card title="Interview Questions & Answers">
          <List
            dataSource={questions}
            renderItem={(question, index) => (
              <List.Item key={index}>
                <Card 
                  size="small" 
                  style={{ width: '100%', borderLeft: `4px solid ${
                    question.difficulty === 'Easy' ? '#52c41a' : 
                    question.difficulty === 'Medium' ? '#faad14' : '#ff4d4f'
                  }` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Title level={5} style={{ margin: 0 }}>
                      Q{index + 1}: {question.text}
                    </Title>
                    <Tag color={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Tag>
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>Candidate's Answer:</Text>
                    <Paragraph style={{ marginBottom: 8 }}>
                      {answers[index] || 'No answer provided'}
                    </Paragraph>
                  </div>

                  {scores[index] !== undefined && (
                    <div>
                      <Text strong>Score: </Text>
                      <Tag color={
                        scores[index] >= 80 ? 'green' : 
                        scores[index] >= 60 ? 'orange' : 'red'
                      }>
                        {scores[index]}/100
                      </Tag>
                      <Progress 
                        percent={scores[index]} 
                        size="small" 
                        status={
                          scores[index] >= 80 ? 'success' : 
                          scores[index] >= 60 ? 'normal' : 'exception'
                        }
                        style={{ marginTop: 8 }}
                      />
                    </div>
                  )}
                </Card>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </Modal>
  );
};

export default CandidateDetails;