import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Table, 
  Card, 
  Input, 
  Space, 
  Button, 
  Tag, 
  Modal, 
  Typography,
  Descriptions,
  Rate
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { setSelectedCandidate, setSearchTerm, setSort } from '../store/slices/candidateSlice';
import CandidateDetails from './CandidateDetails';

const { Title } = Typography;
const { Search } = Input;

const InterviewerTab = () => {
  const dispatch = useDispatch();
  const { candidates, searchTerm, sortBy, sortOrder, selectedCandidate } = useSelector(state => state.candidates);

  const handleSearch = (value) => {
    dispatch(setSearchTerm(value));
  };

  const handleSort = (sorter) => {
    dispatch(setSort({
      sortBy: sorter.field,
      sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
    }));
  };

  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'score') {
      return sortOrder === 'asc' ? a.score - b.score : b.score - a.score;
    }
    if (sortBy === 'name') {
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    return 0;
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      sorter: true,
      render: (score) => (
        <Tag color={
          score >= 80 ? 'green' : 
          score >= 60 ? 'orange' : 'red'
        }>
          {score}/100
        </Tag>
      ),
    },
    {
      title: 'Completion Date',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => dispatch(setSelectedCandidate(record))}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Title level={3}>Candidate Dashboard</Title>
        
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Search
            placeholder="Search candidates..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <div>
            Total Candidates: <Tag color="blue">{filteredCandidates.length}</Tag>
          </div>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredCandidates}
          rowKey="id"
          onChange={handleSort}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <CandidateDetails 
        candidate={selectedCandidate}
        onClose={() => dispatch(setSelectedCandidate(null))}
      />
    </div>
  );
};

export default InterviewerTab;