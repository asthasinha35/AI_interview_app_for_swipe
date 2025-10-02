import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Upload, Button, message, Card, Form, Input, Space, Typography, Tag } from 'antd';
import { UploadOutlined, CheckCircleOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { setCandidateInfo, setCurrentStep } from '../store/slices/interviewSlice';
import { parseResume } from '../utils/resumeParser';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const ResumeUpload = () => {
  const dispatch = useDispatch();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState(null);
  const [form] = Form.useForm();

  const beforeUpload = (file) => {
    const isPdf = file.type === 'application/pdf';
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (!isPdf && !isDocx) {
      message.error('You can only upload PDF or DOCX files!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return false;
    }
    
    return true;
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const info = await parseResume(file);
      setExtractedInfo(info);
      
      // Pre-fill form with extracted data
      form.setFieldsValue({
        name: info.name || '',
        email: info.email || '',
        phone: info.phone || ''
      });
      
      // Show success message based on what was extracted
      const extractedFields = [];
      if (info.name) extractedFields.push('name');
      if (info.email) extractedFields.push('email');
      if (info.phone) extractedFields.push('phone');
      
      if (extractedFields.length > 0) {
        message.success(`Extracted ${extractedFields.join(', ')} from resume! Please verify the information.`);
      } else {
        message.info('Resume uploaded! Please enter your information below.');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      message.info('File uploaded! Please enter your information manually.');
      setExtractedInfo({
        name: '',
        email: '',
        phone: '',
        resumeText: `File: ${file.name}`
      });
    } finally {
      setUploading(false);
    }
  };

  const onFinish = (values) => {
    if (!values.name || !values.email || !values.phone) {
      message.error('Please fill in all required fields');
      return;
    }
    
    dispatch(setCandidateInfo(values));
    dispatch(setCurrentStep('profile_completion'));
    message.success('Profile information saved! Starting interview...');
  };

  const uploadProps = {
    beforeUpload,
    customRequest: ({ file }) => handleUpload(file),
    fileList,
    onChange: ({ fileList }) => setFileList(fileList),
    showUploadList: {
      showRemoveIcon: true,
    },
    multiple: false,
  };

  return (
    <Card>
      <Title level={3} style={{ marginBottom: 8 }}>Upload Your Resume</Title>
      <Text type="secondary" className="upload-info">
        Upload your resume in PDF or DOCX format. We'll extract your information automatically from the content.
      </Text>
      
      <div className="upload-section">
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag resume file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for PDF and DOCX files. Maximum file size: 5MB
          </p>
        </Dragger>
      </div>

      {extractedInfo && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Extracted Information:</Text>
          <div style={{ marginTop: 8 }}>
            {extractedInfo.name && (
              <Tag icon={<UserOutlined />} color="blue" style={{ marginBottom: 4 }}>
                Name: {extractedInfo.name}
              </Tag>
            )}
            {extractedInfo.email && (
              <Tag icon={<MailOutlined />} color="green" style={{ marginBottom: 4, marginLeft: 4 }}>
                Email: {extractedInfo.email}
              </Tag>
            )}
            {extractedInfo.phone && (
              <Tag icon={<PhoneOutlined />} color="orange" style={{ marginBottom: 4, marginLeft: 4 }}>
                Phone: {extractedInfo.phone}
              </Tag>
            )}
            {!extractedInfo.name && !extractedInfo.email && !extractedInfo.phone && (
              <Text type="secondary">No information automatically extracted. Please enter manually.</Text>
            )}
          </div>
        </div>
      )}

      <div className="form-section">
        <Title level={4}>Personal Information</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Please verify and complete your information to start the interview
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input 
              placeholder="Enter your full name" 
              size="large" 
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input 
              placeholder="Enter your email" 
              size="large" 
              prefix={<MailOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input 
              placeholder="Enter your phone number" 
              size="large" 
              prefix={<PhoneOutlined />}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                loading={uploading}
              >
                Start Interview
              </Button>
              <Button 
                size="large"
                onClick={() => {
                  form.resetFields();
                  setFileList([]);
                  setExtractedInfo(null);
                }}
              >
                Reset Form
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
};

export default ResumeUpload;